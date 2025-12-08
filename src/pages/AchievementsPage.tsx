import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Flame, Target, Zap } from 'lucide-react';
import { Card, Progress } from '@/components/ui';
import { AchievementCard } from '@/components/achievements';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { achievements } from '@/data/achievements';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'earned' | 'locked';

export const AchievementsPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    earnedAchievements, 
    loadEarnedAchievements, 
    isAchievementEarned,
    getProgress,
  } = useAchievementStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({
    totalXp: 0,
    totalExercises: 0,
    currentStreak: 0,
    daysCompleted: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      loadEarnedAchievements(profile.id);
      loadStats();
    }
  }, [profile?.id]);

  const loadStats = async () => {
    if (!profile?.id) return;

    // Load player stats
    const { data: playerStats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', profile.id)
      .single();

    // Load completed days count
    const { count: daysCount } = await supabase
      .from('player_day_completions')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', profile.id);

    setStats({
      totalXp: playerStats?.total_xp || 0,
      totalExercises: playerStats?.total_exercises || 0,
      currentStreak: playerStats?.current_streak || 0,
      daysCompleted: daysCount || 0,
    });
  };

  const earnedCount = earnedAchievements.size;
  const totalCount = achievements.length;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  // Filter achievements
  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'earned') return isAchievementEarned(a.id);
    if (filter === 'locked') return !isAchievementEarned(a.id);
    return true;
  });

  // Sort: earned first, then by rarity
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aEarned = isAchievementEarned(a.id);
    const bEarned = isAchievementEarned(b.id);
    
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  // Group by category
  const categories = [
    { 
      id: 'first', 
      title: { uk: 'Перші кроки', en: 'First Steps', cs: 'První kroky' },
      icon: Target,
      achievements: sortedAchievements.filter(a => a.conditionType === 'first_exercise' || a.conditionType === 'first_day')
    },
    { 
      id: 'exercises', 
      title: { uk: 'Вправи', en: 'Exercises', cs: 'Cviky' },
      icon: Star,
      achievements: sortedAchievements.filter(a => a.conditionType === 'exercises_count')
    },
    { 
      id: 'streak', 
      title: { uk: 'Серії', en: 'Streaks', cs: 'Série' },
      icon: Flame,
      achievements: sortedAchievements.filter(a => a.conditionType === 'streak')
    },
    { 
      id: 'days', 
      title: { uk: 'Дні', en: 'Days', cs: 'Dny' },
      icon: Trophy,
      achievements: sortedAchievements.filter(a => a.conditionType === 'days_completed')
    },
    { 
      id: 'xp', 
      title: { uk: 'Досвід', en: 'Experience', cs: 'Zkušenosti' },
      icon: Zap,
      achievements: sortedAchievements.filter(a => a.conditionType === 'xp')
    },
  ];

  const { language } = useTranslation();
  const getLocalizedText = (obj: Record<string, string>): string => {
    return obj[language] || obj.uk || obj.en || '';
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{t('stats.achievements')}</h1>
              <p className="text-amber-100 text-sm mt-1">
                {earnedCount} / {totalCount}
              </p>
              <Progress 
                value={progressPercent} 
                size="sm" 
                className="mt-2 bg-white/20"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'earned', 'locked'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f === 'all' && (language === 'uk' ? 'Всі' : f === 'all' ? 'All' : 'Všechny')}
            {f === 'earned' && (language === 'uk' ? 'Отримані' : f === 'earned' ? 'Earned' : 'Získané')}
            {f === 'locked' && (language === 'uk' ? 'Заблоковані' : f === 'locked' ? 'Locked' : 'Zamčené')}
          </button>
        ))}
      </div>

      {/* Categories */}
      {categories.map((category, catIdx) => {
        if (category.achievements.length === 0) return null;

        const CategoryIcon = category.icon;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * catIdx }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className="w-5 h-5 text-gray-500" />
              <h2 className="font-bold text-gray-800">
                {getLocalizedText(category.title)}
              </h2>
              <span className="text-xs text-gray-400">
                ({category.achievements.filter(a => isAchievementEarned(a.id)).length}/{category.achievements.length})
              </span>
            </div>

            <div className="space-y-3">
              {category.achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={isAchievementEarned(achievement.id)}
                  progress={getProgress(achievement, stats)}
                  earnedAt={earnedAchievements.get(achievement.id)?.earned_at}
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

