// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAchievementStore } from './achievementStore';
import { usePlayerProgramStore } from './playerProgramStore';
import { queueProgress, cacheCompletedDay } from '@/lib/offlineStorage';
import { trackExerciseComplete, trackDayComplete, trackMeasurementSaved } from '@/lib/analytics';
import { activityLogger } from '@/lib/activityLogger';

interface ExerciseProgress {
  exercise_id: string;
  is_completed: boolean;
  measurement_value?: string;
  completed_at?: string;
}

interface DayProgress {
  day_id: string;
  exercises: Record<string, ExerciseProgress>;
  is_completed: boolean;
  completed_at?: string;
  xp_earned: number;
}

interface ProgressState {
  progress: Record<string, DayProgress>;
  completedDays: Record<string, boolean>; // dayKey -> true if completed
  isLoading: boolean;
  
  // Actions
  loadDayProgress: (playerId: string, dayId: string) => Promise<void>;
  loadCompletedDays: (playerId: string) => Promise<void>;
  toggleExercise: (playerId: string, dayId: string, exerciseId: string, xpPerExercise?: number) => Promise<void>;
  saveMeasurement: (playerId: string, dayId: string, exerciseId: string, value: string) => Promise<void>;
  completeDay: (playerId: string, dayId: string, bonusXp?: number) => Promise<void>;
  updateStats: (playerId: string, xpDelta: number, exercisesDelta: number) => Promise<void>;
  checkAchievements: (playerId: string) => Promise<void>;
  getDayProgress: (dayId: string) => DayProgress | undefined;
  isExerciseCompleted: (dayId: string, exerciseId: string) => boolean;
  getMeasurement: (dayId: string, exerciseId: string) => string | undefined;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},
  completedDays: {},
  isLoading: false,

  getDayProgress: (dayId: string) => {
    return get().progress[dayId];
  },

  isExerciseCompleted: (dayId: string, exerciseId: string) => {
    return get().progress[dayId]?.exercises[exerciseId]?.is_completed || false;
  },

  getMeasurement: (dayId: string, exerciseId: string) => {
    return get().progress[dayId]?.exercises[exerciseId]?.measurement_value;
  },

  loadCompletedDays: async (playerId: string) => {
    try {
      const { data, error } = await supabase
        .from('player_day_completions')
        .select('day_id')
        .eq('player_id', playerId);

      if (error) {
        console.error('Error loading completed days:', error);
        return;
      }

      const completed: Record<string, boolean> = {};
      data?.forEach(d => {
        completed[d.day_id] = true;
      });

      console.log('Loaded completed days:', completed);
      set({ completedDays: completed });
    } catch (error) {
      console.error('Error loading completed days:', error);
    }
  },

  loadDayProgress: async (playerId: string, dayId: string) => {
    set({ isLoading: true });

    try {
      // Load exercise progress
      const { data, error } = await supabase
        .from('player_progress_v2')
        .select('*')
        .eq('player_id', playerId)
        .eq('day_id', dayId);

      if (error) {
        console.error('Error loading progress:', error);
        set({ isLoading: false });
        return;
      }

      const exercises: Record<string, ExerciseProgress> = {};
      let totalXp = 0;

      data?.forEach((row) => {
        exercises[row.exercise_id] = {
          exercise_id: row.exercise_id,
          is_completed: row.is_completed,
          measurement_value: row.measurement_value || undefined,
          completed_at: row.completed_at || undefined,
        };
        if (row.is_completed) {
          totalXp += row.xp_earned || 0;
        }
      });

      // Check if day is completed
      const { data: dayData } = await supabase
        .from('player_day_completions')
        .select('*')
        .eq('player_id', playerId)
        .eq('day_id', dayId)
        .maybeSingle();

      set((state) => ({
        progress: {
          ...state.progress,
          [dayId]: {
            day_id: dayId,
            exercises,
            is_completed: !!dayData,
            completed_at: dayData?.completed_at,
            xp_earned: totalXp,
          },
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading progress:', error);
      set({ isLoading: false });
    }
  },

  toggleExercise: async (playerId: string, dayId: string, exerciseId: string, xpPerExercise: number = 10) => {
    const state = get();
    const dayProgress = state.progress[dayId];
    const currentExercise = dayProgress?.exercises[exerciseId];
    const isCompleting = !currentExercise?.is_completed;

    // Optimistic update
    set((state) => ({
      progress: {
        ...state.progress,
        [dayId]: {
          ...state.progress[dayId],
          day_id: dayId,
          is_completed: state.progress[dayId]?.is_completed || false,
          xp_earned: Math.max(0, (state.progress[dayId]?.xp_earned || 0) + (isCompleting ? xpPerExercise : -xpPerExercise)),
          exercises: {
            ...state.progress[dayId]?.exercises,
            [exerciseId]: {
              exercise_id: exerciseId,
              is_completed: isCompleting,
              completed_at: isCompleting ? new Date().toISOString() : undefined,
              measurement_value: currentExercise?.measurement_value,
            },
          },
        },
      },
    }));

    try {
      if (isCompleting) {
        // Check if this is the first exercise in the program - start program if needed
        // dayId format: "programId-day-dayNumber"
        const parts = dayId.split('-day-');
        if (parts.length === 2) {
          const programId = parts[0];
          const playerProgramStore = usePlayerProgramStore.getState();
          const playerProgram = playerProgramStore.getPlayerProgram(programId);
          
          // If program not started yet (no record or started_at is null), start it now
          if (!playerProgram || !playerProgram.started_at) {
            console.log('Starting program on first exercise:', programId);
            await playerProgramStore.startProgram(playerId, programId, new Date());
          }
        }

        // Check if online
        if (navigator.onLine) {
          // Upsert progress to server
          const { error } = await supabase
            .from('player_progress_v2')
            .upsert({
              player_id: playerId,
              day_id: dayId,
              exercise_id: exerciseId,
              is_completed: true,
              xp_earned: xpPerExercise,
              completed_at: new Date().toISOString(),
            }, {
              onConflict: 'player_id,day_id,exercise_id',
            });

          if (error) {
            console.error('Error saving progress:', error);
            // Queue for later sync
            await queueProgress({
              type: 'exercise_complete',
              playerId,
              dayKey: dayId,
              exerciseId,
              xp: xpPerExercise,
              timestamp: Date.now(),
            });
          }
        } else {
          // Offline - queue for later sync
          console.log('Offline: queuing exercise completion for sync');
          await queueProgress({
            type: 'exercise_complete',
            playerId,
            dayKey: dayId,
            exerciseId,
            xp: xpPerExercise,
            timestamp: Date.now(),
          });
        }

        // Update stats
        await get().updateStats(playerId, xpPerExercise, 1);

        // Track analytics event
        trackExerciseComplete(exerciseId, 'standard', xpPerExercise);

        // Log activity for coach
        await activityLogger.log(
          playerId,
          'exercise_complete',
          { xp_earned: xpPerExercise },
          undefined,
          dayId,
          exerciseId
        );
      } else {
        // Mark as not completed
        if (navigator.onLine) {
          const { error } = await supabase
            .from('player_progress_v2')
            .update({
              is_completed: false,
              xp_earned: 0,
              completed_at: null,
            })
            .eq('player_id', playerId)
            .eq('day_id', dayId)
            .eq('exercise_id', exerciseId);

          if (error) {
            console.error('Error updating progress:', error);
          }
        }

        // Update stats (subtract)
        await get().updateStats(playerId, -xpPerExercise, -1);
      }
    } catch (error) {
      console.error('Error toggling exercise:', error);
      // Queue for later sync on error
      if (isCompleting) {
        await queueProgress({
          type: 'exercise_complete',
          playerId,
          dayKey: dayId,
          exerciseId,
          xp: xpPerExercise,
          timestamp: Date.now(),
        });
      }
    }
  },

  saveMeasurement: async (playerId: string, dayId: string, exerciseId: string, value: string) => {
    const currentProgress = get().progress[dayId]?.exercises?.[exerciseId];
    
    // Optimistic update
    set((state) => ({
      progress: {
        ...state.progress,
        [dayId]: {
          ...state.progress[dayId],
          day_id: dayId,
          is_completed: state.progress[dayId]?.is_completed || false,
          xp_earned: state.progress[dayId]?.xp_earned || 0,
          exercises: {
            ...state.progress[dayId]?.exercises,
            [exerciseId]: {
              ...currentProgress,
              exercise_id: exerciseId,
              is_completed: currentProgress?.is_completed || false,
              measurement_value: value,
            },
          },
        },
      },
    }));

    try {
      const { error } = await supabase
        .from('player_progress_v2')
        .upsert({
          player_id: playerId,
          day_id: dayId,
          exercise_id: exerciseId,
          measurement_value: value,
          is_completed: currentProgress?.is_completed || false,
          xp_earned: currentProgress?.is_completed ? 10 : 0,
        }, {
          onConflict: 'player_id,day_id,exercise_id',
        });

      if (error) {
        console.error('Error saving measurement:', error);
      }
    } catch (error) {
      console.error('Error saving measurement:', error);
    }
  },

  completeDay: async (playerId: string, dayId: string, bonusXp: number = 50) => {
    // Update local state immediately (optimistic update)
    set((state) => ({
      progress: {
        ...state.progress,
        [dayId]: {
          ...state.progress[dayId],
          is_completed: true,
          completed_at: new Date().toISOString(),
        },
      },
      completedDays: {
        ...state.completedDays,
        [dayId]: true,
      },
    }));

    // Cache completed day for offline
    await cacheCompletedDay(playerId, dayId);

    try {
      if (navigator.onLine) {
        // Insert day completion to server
        const { error } = await supabase
          .from('player_day_completions')
          .insert({
            player_id: playerId,
            day_id: dayId,
            bonus_xp: bonusXp,
            completed_at: new Date().toISOString(),
          });

        if (error && error.code !== '23505') { // Ignore duplicate key error
          console.error('Error completing day:', error);
          // Queue for later sync
          await queueProgress({
            type: 'day_complete',
            playerId,
            dayKey: dayId,
            xp: bonusXp,
            timestamp: Date.now(),
          });
        }
      } else {
        // Offline - queue for later sync
        console.log('Offline: queuing day completion for sync');
        await queueProgress({
          type: 'day_complete',
          playerId,
          dayKey: dayId,
          xp: bonusXp,
          timestamp: Date.now(),
        });
      }

      // Update stats with bonus XP
      await get().updateStats(playerId, bonusXp, 0);

      // Check achievements after day completion
      await get().checkAchievements(playerId);

      // Track analytics event
      const dayNumber = parseInt(dayId.split('-day-')[1] || '0');
      const programId = dayId.split('-day-')[0];
      trackDayComplete(programId, dayNumber, bonusXp);

      // Log activity for coach
      await activityLogger.log(
        playerId,
        'day_complete',
        { xp_earned: bonusXp, day_number: dayNumber },
        programId,
        dayId
      );
    } catch (error) {
      console.error('Error completing day:', error);
      // Queue for later sync on error
      await queueProgress({
        type: 'day_complete',
        playerId,
        dayKey: dayId,
        xp: bonusXp,
        timestamp: Date.now(),
      });
    }
  },

  updateStats: async (playerId: string, xpDelta: number, exercisesDelta: number) => {
    try {
      // Get current stats
      const { data: currentStats } = await supabase
        .from('player_stats')
        .select('total_xp, total_exercises, current_streak')
        .eq('player_id', playerId)
        .single();

      if (!currentStats) return;

      const newXp = Math.max(0, (currentStats.total_xp || 0) + xpDelta);
      const newExercises = Math.max(0, (currentStats.total_exercises || 0) + exercisesDelta);

      const { error } = await supabase
        .from('player_stats')
        .update({
          total_xp: newXp,
          total_exercises: newExercises,
          last_training_date: new Date().toISOString().split('T')[0],
        })
        .eq('player_id', playerId);

      if (error) {
        console.error('Error updating stats:', error);
      }

      // Check achievements after stats update
      if (exercisesDelta > 0) {
        await get().checkAchievements(playerId);
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  },

  checkAchievements: async (playerId: string) => {
    try {
      // Get current stats
      const { data: stats } = await supabase
        .from('player_stats')
        .select('total_xp, total_exercises, current_streak')
        .eq('player_id', playerId)
        .single();

      // Get completed days count
      const { count: daysCount } = await supabase
        .from('player_day_completions')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId);

      if (stats) {
        const achievementStore = useAchievementStore.getState();
        await achievementStore.checkAndAwardAchievements(playerId, {
          totalXp: stats.total_xp || 0,
          totalExercises: stats.total_exercises || 0,
          currentStreak: stats.current_streak || 0,
          daysCompleted: daysCount || 0,
        });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  },
}));

