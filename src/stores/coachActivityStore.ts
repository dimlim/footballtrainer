// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface PlayerActivity {
  player_id: string;
  player_name: string;
  avatar_url?: string;
  total_logins: number;
  total_exercises: number;
  total_days_completed: number;
  total_xp: number;
  suspicious_count: number;
  last_active: string | null;
  avg_session_minutes: number;
}

interface PlayerDailyActivity {
  activity_date: string;
  activity_type: string;
  activity_count: number;
  total_duration_minutes: number;
}

interface SuspiciousActivity {
  id: string;
  player_id: string;
  player_name: string;
  exercise_id: string;
  day_key: string;
  expected_duration_seconds: number;
  actual_duration_seconds: number;
  started_at: string;
  completed_at: string;
  verification_status: string;
  coach_notes: string | null;
}

interface VerificationItem {
  id: string;
  player_id: string;
  player_name: string;
  activity_type: string;
  reason: string;
  status: string;
  created_at: string;
}

interface CoachActivityState {
  teamActivity: PlayerActivity[];
  playerDetail: PlayerDailyActivity[];
  suspiciousActivities: SuspiciousActivity[];
  verificationQueue: VerificationItem[];
  isLoading: boolean;
  error: string | null;
  selectedPlayerId: string | null;
  
  loadTeamActivity: (coachId: string, days?: number) => Promise<void>;
  loadPlayerDetail: (playerId: string, days?: number) => Promise<void>;
  loadSuspiciousActivities: (coachId: string) => Promise<void>;
  loadVerificationQueue: (coachId: string) => Promise<void>;
  verifyActivity: (timingId: string, status: 'verified' | 'flagged', notes?: string) => Promise<void>;
  resolveVerification: (queueId: string, status: 'approved' | 'rejected', comment?: string) => Promise<void>;
  setSelectedPlayer: (playerId: string | null) => void;
}

export const useCoachActivityStore = create<CoachActivityState>((set, get) => ({
  teamActivity: [],
  playerDetail: [],
  suspiciousActivities: [],
  verificationQueue: [],
  isLoading: false,
  error: null,
  selectedPlayerId: null,

  loadTeamActivity: async (coachId: string, days: number = 7) => {
    set({ isLoading: true, error: null });
    try {
      // Get teams where user is coach
      // @ts-ignore
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('coach_id', coachId);

      if (teamsError) throw teamsError;
      if (!teams || teams.length === 0) {
        set({ teamActivity: [], isLoading: false });
        return;
      }

      const teamIds = teams.map(t => t.id);

      // Get team members
      // @ts-ignore
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('player_id')
        .in('team_id', teamIds);

      if (membersError) throw membersError;
      if (!members || members.length === 0) {
        set({ teamActivity: [], isLoading: false });
        return;
      }

      const playerIds = [...new Set(members.map(m => m.player_id))];

      // Get player profiles
      // @ts-ignore
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', playerIds);

      if (profilesError) throw profilesError;

      // Get daily summaries for last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // @ts-ignore
      const { data: summaries, error: summariesError } = await supabase
        .from('player_daily_summary')
        .select('*')
        .in('player_id', playerIds)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (summariesError) throw summariesError;

      // Aggregate data per player
      const activityMap = new Map<string, PlayerActivity>();

      for (const profile of profiles || []) {
        activityMap.set(profile.id, {
          player_id: profile.id,
          player_name: profile.full_name || 'Unknown',
          avatar_url: profile.avatar_url,
          total_logins: 0,
          total_exercises: 0,
          total_days_completed: 0,
          total_xp: 0,
          suspicious_count: 0,
          last_active: null,
          avg_session_minutes: 0
        });
      }

      for (const summary of summaries || []) {
        const activity = activityMap.get(summary.player_id);
        if (activity) {
          activity.total_logins += summary.login_count || 0;
          activity.total_exercises += summary.exercises_completed || 0;
          activity.total_days_completed += summary.days_completed || 0;
          activity.total_xp += summary.xp_earned || 0;
          activity.suspicious_count += summary.suspicious_activities || 0;
          
          if (!activity.last_active || 
              (summary.last_activity && summary.last_activity > activity.last_active)) {
            activity.last_active = summary.last_activity;
          }
          
          activity.avg_session_minutes = (activity.avg_session_minutes + (summary.total_active_minutes || 0)) / 2;
        }
      }

      set({ 
        teamActivity: Array.from(activityMap.values()).sort((a, b) => 
          (b.last_active || '').localeCompare(a.last_active || '')
        ),
        isLoading: false 
      });
    } catch (e) {
      console.error('Failed to load team activity:', e);
      set({ error: 'Failed to load team activity', isLoading: false });
    }
  },

  loadPlayerDetail: async (playerId: string, days: number = 7) => {
    set({ isLoading: true, selectedPlayerId: playerId });
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // @ts-ignore
      const { data, error } = await supabase
        .from('player_activity_log')
        .select('activity_type, created_at, metadata')
        .eq('player_id', playerId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate by date and type
      const aggregated = new Map<string, PlayerDailyActivity>();

      for (const activity of data || []) {
        const date = activity.created_at.split('T')[0];
        const key = `${date}-${activity.activity_type}`;
        
        if (!aggregated.has(key)) {
          aggregated.set(key, {
            activity_date: date,
            activity_type: activity.activity_type,
            activity_count: 0,
            total_duration_minutes: 0
          });
        }

        const agg = aggregated.get(key)!;
        agg.activity_count++;
        if (activity.metadata?.duration_seconds) {
          agg.total_duration_minutes += Math.floor(activity.metadata.duration_seconds / 60);
        }
      }

      set({ 
        playerDetail: Array.from(aggregated.values()).sort((a, b) => 
          b.activity_date.localeCompare(a.activity_date)
        ),
        isLoading: false 
      });
    } catch (e) {
      console.error('Failed to load player detail:', e);
      set({ error: 'Failed to load player detail', isLoading: false });
    }
  },

  loadSuspiciousActivities: async (coachId: string) => {
    set({ isLoading: true });
    try {
      // Get team members
      // @ts-ignore
      const { data: teams } = await supabase
        .from('teams')
        .select('id')
        .eq('coach_id', coachId);

      if (!teams || teams.length === 0) {
        set({ suspiciousActivities: [], isLoading: false });
        return;
      }

      const teamIds = teams.map(t => t.id);

      // @ts-ignore
      const { data: members } = await supabase
        .from('team_members')
        .select('player_id')
        .in('team_id', teamIds);

      if (!members || members.length === 0) {
        set({ suspiciousActivities: [], isLoading: false });
        return;
      }

      const playerIds = [...new Set(members.map(m => m.player_id))];

      // Get suspicious timings
      // @ts-ignore
      const { data: timings, error } = await supabase
        .from('exercise_timing')
        .select('*')
        .in('player_id', playerIds)
        .eq('is_suspicious', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Get player names
      // @ts-ignore
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', playerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const suspicious: SuspiciousActivity[] = (timings || []).map(t => ({
        ...t,
        player_name: profileMap.get(t.player_id) || 'Unknown'
      }));

      set({ suspiciousActivities: suspicious, isLoading: false });
    } catch (e) {
      console.error('Failed to load suspicious activities:', e);
      set({ error: 'Failed to load suspicious activities', isLoading: false });
    }
  },

  loadVerificationQueue: async (coachId: string) => {
    set({ isLoading: true });
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('coach_verification_queue')
        .select(`
          id,
          player_id,
          activity_type,
          reason,
          status,
          created_at
        `)
        .eq('coach_id', coachId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get player names
      const playerIds = [...new Set((data || []).map(d => d.player_id))];
      
      // @ts-ignore
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', playerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const queue: VerificationItem[] = (data || []).map(d => ({
        ...d,
        player_name: profileMap.get(d.player_id) || 'Unknown'
      }));

      set({ verificationQueue: queue, isLoading: false });
    } catch (e) {
      console.error('Failed to load verification queue:', e);
      set({ error: 'Failed to load verification queue', isLoading: false });
    }
  },

  verifyActivity: async (timingId: string, status: 'verified' | 'flagged', notes?: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('exercise_timing')
        .update({
          verification_status: status,
          coach_notes: notes,
          is_suspicious: status === 'flagged'
        })
        .eq('id', timingId);

      if (error) throw error;

      // Refresh suspicious list
      const { suspiciousActivities } = get();
      set({
        suspiciousActivities: suspiciousActivities.filter(a => a.id !== timingId)
      });
    } catch (e) {
      console.error('Failed to verify activity:', e);
    }
  },

  resolveVerification: async (queueId: string, status: 'approved' | 'rejected', comment?: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('coach_verification_queue')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          coach_comment: comment
        })
        .eq('id', queueId);

      if (error) throw error;

      // Refresh queue
      const { verificationQueue } = get();
      set({
        verificationQueue: verificationQueue.filter(v => v.id !== queueId)
      });
    } catch (e) {
      console.error('Failed to resolve verification:', e);
    }
  },

  setSelectedPlayer: (playerId: string | null) => {
    set({ selectedPlayerId: playerId });
    if (playerId) {
      get().loadPlayerDetail(playerId);
    }
  }
}));

