import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { Achievement, getRarityGradient } from '@/data/achievements';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AchievementUnlockedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({
  achievement,
  onClose,
}) => {
  const { t, language } = useTranslation();

  const getLocalizedText = (obj: Record<string, string>): string => {
    return obj[language] || obj.uk || obj.en || '';
  };

  // Auto-close after 5 seconds
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  const rarityLabels = {
    common: { uk: 'Звичайне', en: 'Common', cs: 'Běžné' },
    rare: { uk: 'Рідкісне', en: 'Rare', cs: 'Vzácné' },
    epic: { uk: 'Епічне', en: 'Epic', cs: 'Epické' },
    legendary: { uk: 'Легендарне', en: 'Legendary', cs: 'Legendární' },
  };

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 15 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background gradient */}
            <div className={cn(
              'absolute inset-0 opacity-10 bg-gradient-to-br',
              getRarityGradient(achievement.rarity)
            )} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Sparkles animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-32 h-32 text-amber-200 opacity-30" />
              </motion.div>

              {/* Trophy label */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2"
              >
                🏆 {t('stats.achievements')}
              </motion.div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3, damping: 10 }}
                className={cn(
                  'w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl mb-4',
                  'bg-gradient-to-br shadow-xl',
                  getRarityGradient(achievement.rarity)
                )}
              >
                {achievement.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-black text-gray-900 mb-1"
              >
                {getLocalizedText(achievement.title)}
              </motion.h2>

              {/* Rarity */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
                className={cn(
                  'inline-block px-3 py-1 rounded-full text-xs font-bold mb-3',
                  achievement.rarity === 'common' && 'bg-gray-100 text-gray-600',
                  achievement.rarity === 'rare' && 'bg-blue-100 text-blue-600',
                  achievement.rarity === 'epic' && 'bg-purple-100 text-purple-600',
                  achievement.rarity === 'legendary' && 'bg-amber-100 text-amber-600'
                )}
              >
                {getLocalizedText(rarityLabels[achievement.rarity])}
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-4"
              >
                {getLocalizedText(achievement.description)}
              </motion.p>

              {/* XP Reward */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.6 }}
                className="bg-primary-100 rounded-xl p-4 mb-4"
              >
                <div className="text-3xl font-black text-primary-600">
                  +{achievement.xpReward} XP
                </div>
              </motion.div>

              {/* Continue button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-white transition-all',
                  'bg-gradient-to-r',
                  getRarityGradient(achievement.rarity),
                  'hover:opacity-90'
                )}
              >
                {t('common.continue')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

