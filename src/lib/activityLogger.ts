// @ts-nocheck
import { supabase } from './supabase';

// Device detection
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
};

// Session management
let currentSessionId: string | null = null;
let sessionStartTime: Date | null = null;
let pagesVisited = 0;
let exercisesCompleted = 0;

// Activity types
export type ActivityType = 
  | 'login'
  | 'logout'
  | 'page_view'
  | 'exercise_start'
  | 'exercise_complete'
  | 'exercise_skip'
  | 'day_start'
  | 'day_complete'
  | 'measurement_save'
  | 'timer_start'
  | 'timer_complete'
  | 'timer_skip'
  | 'program_start'
  | 'program_view'
  | 'achievement_view'
  | 'profile_update'
  | 'team_join'
  | 'team_leave';

// Exercise timing tracker
const exerciseTimers: Map<string, { startTime: Date; expectedDuration: number }> = new Map();

export const activityLogger = {
  // Start a new session
  async startSession(playerId: string): Promise<void> {
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('player_sessions')
        .insert({
          player_id: playerId,
          session_start: new Date().toISOString(),
          device_type: getDeviceType(),
          app_version: '1.0.0',
          is_active: true
        })
        .select()
        .single();

      if (!error && data) {
        currentSessionId = data.id;
        sessionStartTime = new Date();
        pagesVisited = 0;
        exercisesCompleted = 0;
      }
    } catch (e) {
      console.error('Failed to start session:', e);
    }
  },

  // End current session
  async endSession(playerId: string): Promise<void> {
    if (!currentSessionId || !sessionStartTime) return;

    try {
      const durationSeconds = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      
      // @ts-ignore
      await supabase
        .from('player_sessions')
        .update({
          session_end: new Date().toISOString(),
          duration_seconds: durationSeconds,
          pages_visited: pagesVisited,
          exercises_completed: exercisesCompleted,
          is_active: false
        })
        .eq('id', currentSessionId);

      currentSessionId = null;
      sessionStartTime = null;
    } catch (e) {
      console.error('Failed to end session:', e);
    }
  },

  // Log activity
  async log(
    playerId: string,
    activityType: ActivityType,
    metadata?: Record<string, unknown>,
    programId?: string,
    dayKey?: string,
    exerciseId?: string
  ): Promise<void> {
    try {
      // @ts-ignore
      await supabase.from('player_activity_log').insert({
        player_id: playerId,
        activity_type: activityType,
        program_id: programId,
        day_key: dayKey,
        exercise_id: exerciseId,
        metadata: metadata || {},
        device_type: getDeviceType(),
        user_agent: navigator.userAgent.substring(0, 500),
        created_at: new Date().toISOString()
      });

      // Update session counters
      if (activityType === 'page_view') pagesVisited++;
      if (activityType === 'exercise_complete') exercisesCompleted++;
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  },

  // Start exercise timer (for verification)
  async startExerciseTimer(
    playerId: string,
    exerciseId: string,
    dayKey: string,
    expectedDurationSeconds: number
  ): Promise<void> {
    const key = `${playerId}-${exerciseId}-${dayKey}`;
    exerciseTimers.set(key, {
      startTime: new Date(),
      expectedDuration: expectedDurationSeconds
    });

    try {
      // @ts-ignore
      await supabase.from('exercise_timing').upsert({
        player_id: playerId,
        exercise_id: exerciseId,
        day_key: dayKey,
        started_at: new Date().toISOString(),
        expected_duration_seconds: expectedDurationSeconds,
        verification_status: 'pending'
      }, {
        onConflict: 'player_id,exercise_id,day_key'
      });
    } catch (e) {
      console.error('Failed to start exercise timer:', e);
    }
  },

  // Complete exercise timer
  async completeExerciseTimer(
    playerId: string,
    exerciseId: string,
    dayKey: string
  ): Promise<{ isSuspicious: boolean; actualDuration: number }> {
    const key = `${playerId}-${exerciseId}-${dayKey}`;
    const timer = exerciseTimers.get(key);
    
    if (!timer) {
      return { isSuspicious: false, actualDuration: 0 };
    }

    const actualDuration = Math.floor((Date.now() - timer.startTime.getTime()) / 1000);
    const isSuspicious = actualDuration < timer.expectedDuration * 0.3;

    try {
      // @ts-ignore
      await supabase.from('exercise_timing')
        .update({
          completed_at: new Date().toISOString(),
          actual_duration_seconds: actualDuration,
          is_suspicious: isSuspicious,
          verification_status: isSuspicious ? 'flagged' : 'verified'
        })
        .eq('player_id', playerId)
        .eq('exercise_id', exerciseId)
        .eq('day_key', dayKey);
    } catch (e) {
      console.error('Failed to complete exercise timer:', e);
    }

    exerciseTimers.delete(key);
    return { isSuspicious, actualDuration };
  },

  // Get player's daily summary
  async getDailySummary(playerId: string, days: number = 7): Promise<DailySummary[]> {
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('player_daily_summary')
        .select('*')
        .eq('player_id', playerId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to get daily summary:', e);
      return [];
    }
  },

  // Get exercise timing for verification
  async getExerciseTiming(playerId: string, dayKey?: string): Promise<ExerciseTiming[]> {
    try {
      let query = supabase
        .from('exercise_timing')
        .select('*')
        .eq('player_id', playerId);
      
      if (dayKey) {
        // @ts-ignore
        query = query.eq('day_key', dayKey);
      }

      // @ts-ignore
      const { data, error } = await query.order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to get exercise timing:', e);
      return [];
    }
  }
};

// Types
export interface DailySummary {
  id: string;
  player_id: string;
  date: string;
  first_activity: string;
  last_activity: string;
  total_active_minutes: number;
  exercises_started: number;
  exercises_completed: number;
  days_completed: number;
  xp_earned: number;
  suspicious_activities: number;
  login_count: number;
}

export interface ExerciseTiming {
  id: string;
  player_id: string;
  exercise_id: string;
  day_key: string;
  started_at: string;
  completed_at: string | null;
  expected_duration_seconds: number;
  actual_duration_seconds: number | null;
  is_suspicious: boolean;
  verification_status: 'pending' | 'verified' | 'flagged';
  coach_notes: string | null;
}

