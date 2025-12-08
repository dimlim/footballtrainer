// @ts-nocheck
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { achievements, Achievement } from '@/data/achievements';
import { showLocalNotification, getNotificationPermission } from '@/lib/pushNotifications';

interface PlayerAchievement {
  achievement_id: string;
  earned_at: string;
  notified: boolean;
}

interface AchievementState {
  earnedAchievements: Map<string, PlayerAchievement>;
  newAchievement: Achievement | null;
  isLoading: boolean;

  // Actions
  loadEarnedAchievements: (playerId: string) => Promise<void>;
  checkAndAwardAchievements: (playerId: string, stats: {
    totalXp: number;
    totalExercises: number;
    currentStreak: number;
    daysCompleted: number;
  }) => Promise<Achievement[]>;
  dismissNewAchievement: () => void;
  markAsNotified: (playerId: string, achievementId: string) => Promise<void>;
  isAchievementEarned: (achievementId: string) => boolean;
  getProgress: (achievement: Achievement, stats: {
    totalXp: number;
    totalExercises: number;
    currentStreak: number;
    daysCompleted: number;
  }) => number;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  earnedAchievements: new Map(),
  newAchievement: null,
  isLoading: false,

  loadEarnedAchievements: async (playerId: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('player_achievements')
        .select('*')
        .eq('player_id', playerId);

      if (error) {
        console.error('Error loading achievements:', error);
        set({ isLoading: false });
        return;
      }

      const earned = new Map<string, PlayerAchievement>();
      data?.forEach((row) => {
        earned.set(row.achievement_id, {
          achievement_id: row.achievement_id,
          earned_at: row.earned_at,
          notified: row.notified,
        });
      });

      set({ earnedAchievements: earned, isLoading: false });
    } catch (error) {
      console.error('Error loading achievements:', error);
      set({ isLoading: false });
    }
  },

  checkAndAwardAchievements: async (playerId: string, stats) => {
    const { earnedAchievements } = get();
    const newlyEarned: Achievement[] = [];

    for (const achievement of achievements) {
      // Skip if already earned
      if (earnedAchievements.has(achievement.id)) continue;

      let earned = false;

      switch (achievement.conditionType) {
        case 'first_exercise':
          earned = stats.totalExercises >= 1;
          break;
        case 'first_day':
          earned = stats.daysCompleted >= 1;
          break;
        case 'exercises_count':
          earned = stats.totalExercises >= achievement.conditionValue;
          break;
        case 'streak':
          earned = stats.currentStreak >= achievement.conditionValue;
          break;
        case 'days_completed':
          earned = stats.daysCompleted >= achievement.conditionValue;
          break;
        case 'xp':
          earned = stats.totalXp >= achievement.conditionValue;
          break;
      }

      if (earned) {
        // Award achievement
        try {
          const insertData = {
            player_id: playerId,
            achievement_id: achievement.id,
            earned_at: new Date().toISOString(),
            notified: false,
          };
          
          console.log('Inserting achievement:', insertData);
          
          const { error, data } = await supabase
            .from('player_achievements')
            .insert(insertData)
            .select();

          if (error) {
            console.error('Achievement insert error:', error.message, error.details, error.hint);
          }

          if (!error) {
            console.log('Achievement inserted successfully:', data);
            
            // Add XP reward - use direct update instead of RPC
            try {
              const { data: statsData } = await supabase
                .from('player_stats')
                .select('total_xp')
                .eq('player_id', playerId)
                .single();
              
              if (statsData) {
                await supabase
                  .from('player_stats')
                  .update({ total_xp: (statsData.total_xp || 0) + achievement.xpReward })
                  .eq('player_id', playerId);
              }
            } catch (xpError) {
              console.error('Error adding XP reward:', xpError);
            }

            newlyEarned.push(achievement);

            // Update local state
            set((state) => {
              const newEarned = new Map(state.earnedAchievements);
              newEarned.set(achievement.id, {
                achievement_id: achievement.id,
                earned_at: new Date().toISOString(),
                notified: false,
              });
              return { earnedAchievements: newEarned };
            });

            // Send push notification for achievement
            if (getNotificationPermission() === 'granted') {
              showLocalNotification(`🏆 ${achievement.title.uk || achievement.title.en}`, {
                body: achievement.description.uk || achievement.description.en,
                tag: `achievement-${achievement.id}`,
                data: { type: 'achievement_unlocked', achievementId: achievement.id },
              });
            }
          }
        } catch (error) {
          console.error('Error awarding achievement:', error);
        }
      }
    }

    // Show first new achievement
    if (newlyEarned.length > 0) {
      set({ newAchievement: newlyEarned[0] });
    }

    return newlyEarned;
  },

  dismissNewAchievement: () => {
    set({ newAchievement: null });
  },

  markAsNotified: async (playerId: string, achievementId: string) => {
    try {
      await supabase
        .from('player_achievements')
        .update({ notified: true })
        .eq('player_id', playerId)
        .eq('achievement_id', achievementId);

      set((state) => {
        const newEarned = new Map(state.earnedAchievements);
        const existing = newEarned.get(achievementId);
        if (existing) {
          newEarned.set(achievementId, { ...existing, notified: true });
        }
        return { earnedAchievements: newEarned };
      });
    } catch (error) {
      console.error('Error marking achievement as notified:', error);
    }
  },

  isAchievementEarned: (achievementId: string) => {
    return get().earnedAchievements.has(achievementId);
  },

  getProgress: (achievement: Achievement, stats) => {
    let current = 0;
    
    switch (achievement.conditionType) {
      case 'first_exercise':
        current = Math.min(stats.totalExercises, 1);
        break;
      case 'first_day':
        current = Math.min(stats.daysCompleted, 1);
        break;
      case 'exercises_count':
        current = stats.totalExercises;
        break;
      case 'streak':
        current = stats.currentStreak;
        break;
      case 'days_completed':
        current = stats.daysCompleted;
        break;
      case 'xp':
        current = stats.totalXp;
        break;
    }

    return Math.min((current / achievement.conditionValue) * 100, 100);
  },
}));

