import React from 'react';
import { motion } from 'motion/react';
import { Lock, Check } from 'lucide-react';
import { Achievement, getRarityColor, getRarityGradient } from '@/data/achievements';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui';

interface AchievementCardProps {
  achievement: Achievement;
  isEarned: boolean;
  progress?: number; // 0-100
  earnedAt?: string;
  showProgress?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isEarned,
  progress = 0,
  earnedAt,
  showProgress = true,
}) => {
  const { language } = useTranslation();

  const getLocalizedText = (obj: Record<string, string>): string => {
    return obj[language] || obj.uk || obj.en || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative rounded-2xl border-2 p-4 transition-all',
        isEarned 
          ? getRarityColor(achievement.rarity)
          : 'bg-gray-50 border-gray-200 text-gray-400'
      )}
    >
      {/* Earned badge */}
      {isEarned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'text-3xl w-14 h-14 rounded-xl flex items-center justify-center',
          isEarned 
            ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)} text-white shadow-lg`
            : 'bg-gray-200'
        )}>
          {isEarned ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-bold text-sm truncate',
            !isEarned && 'text-gray-500'
          )}>
            {getLocalizedText(achievement.title)}
          </h4>
          <p className={cn(
            'text-xs mt-0.5 line-clamp-2',
            isEarned ? 'opacity-80' : 'text-gray-400'
          )}>
            {getLocalizedText(achievement.description)}
          </p>

          {/* Progress bar (if not earned) */}
          {!isEarned && showProgress && progress > 0 && (
            <div className="mt-2">
              <Progress value={progress} size="sm" color="primary" />
              <p className="text-[10px] text-gray-400 mt-1">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* XP reward */}
          <div className="mt-2 flex items-center justify-between">
            <span className={cn(
              'text-xs font-bold',
              isEarned ? 'text-current opacity-70' : 'text-gray-400'
            )}>
              +{achievement.xpReward} XP
            </span>
            {isEarned && earnedAt && (
              <span className="text-[10px] opacity-60">
                {new Date(earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

