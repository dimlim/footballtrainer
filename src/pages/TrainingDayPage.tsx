import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Clock, Home, MapPin, Target, Loader2, PartyPopper } from 'lucide-react';
import { Card, Progress, IntensityBadge } from '@/components/ui';
import { ExerciseItem } from '@/components/training';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import { getTrainingDay } from '@/data/trainingProgram';
import { cn } from '@/lib/utils';

export const TrainingDayPage: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    progress, 
    isLoading, 
    loadDayProgress, 
    toggleExercise, 
    saveMeasurement,
    completeDay,
    isExerciseCompleted,
    getMeasurement,
  } = useProgressStore();

  const [showCelebration, setShowCelebration] = useState(false);

  // Get training day from program data
  const trainingDay = getTrainingDay(Number(dayId));
  const dayProgress = progress[`day-${dayId}`];

  // Load progress on mount
  useEffect(() => {
    if (profile?.id && dayId) {
      loadDayProgress(profile.id, `day-${dayId}`);
    }
  }, [profile?.id, dayId, loadDayProgress]);

  const allExercises = trainingDay?.sections.flatMap(s => s.exercises) || [];
  
  const completedCount = useMemo(() => {
    return allExercises.filter(e => isExerciseCompleted(`day-${dayId}`, e.id)).length;
  }, [allExercises, dayId, dayProgress]);
  
  const totalCount = allExercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Check for day completion
  useEffect(() => {
    if (progressPercent === 100 && !dayProgress?.is_completed && profile?.id && totalCount > 0) {
      setShowCelebration(true);
    }
  }, [progressPercent, dayProgress?.is_completed, profile?.id, totalCount]);

  const handleToggleExercise = async (exerciseId: string) => {
    if (!profile?.id || !dayId) return;
    await toggleExercise(profile.id, `day-${dayId}`, exerciseId, 10);
  };

  const handleSaveMeasurement = async (exerciseId: string, value: string) => {
    if (!profile?.id || !dayId) return;
    await saveMeasurement(profile.id, `day-${dayId}`, exerciseId, value);
  };

  const handleCompleteDay = async () => {
    if (!profile?.id || !dayId) return;
    await completeDay(profile.id, `day-${dayId}`, 50);
    setShowCelebration(false);
    navigate('/app');
  };

  const intensityLabels = {
    low: t('training.intensity.low'),
    medium: t('training.intensity.medium'),
    high: t('training.intensity.high'),
  };

  const getLocalizedArray = (obj: Record<string, string[]> | undefined): string[] => {
    if (!obj) return [];
    return obj[language] || obj.uk || obj.en || [];
  };

  const getLocalizedString = (obj: Record<string, string> | undefined): string => {
    if (!obj) return '';
    return obj[language] || obj.uk || obj.en || '';
  };

  const formatDuration = (minutes: number) => {
    const minLabel = language === 'uk' ? 'хв' : language === 'cs' ? 'min' : 'min';
    return `${minutes} ${minLabel}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!trainingDay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">День не знайдено</p>
          <button 
            onClick={() => navigate('/app')}
            className="text-primary-600 font-medium"
          >
            Повернутися
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b shadow-sm">
        <div className="p-4 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">
              {t('training.day')} {trainingDay.dayNumber}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {getLocalizedString(trainingDay.title)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary-600">{progressPercent}%</span>
          </div>
        </div>
        <Progress value={progressPercent} className="h-1" />
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-5 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-primary-200 text-sm mb-1">
                  <Target className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wide">{t('training.focus')}</span>
                </div>
                <p className="font-semibold text-lg">
                  {getLocalizedString(trainingDay.focus)}
                </p>
              </div>
              <IntensityBadge level={trainingDay.intensity} labels={intensityLabels} />
            </div>
            <div className="flex gap-4 text-sm text-primary-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(trainingDay.durationMinutes)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {trainingDay.location === 'home' ? (
                  <Home className="w-4 h-4" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                <span>
                  {trainingDay.location === 'home' 
                    ? t('training.location.home') 
                    : t('training.location.field')}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sections */}
        {trainingDay.sections.map((section, sectionIdx) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * sectionIdx }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                {getLocalizedString(section.title)}
              </h2>
              {section.durationMinutes && (
                <span className="text-xs text-gray-400">
                  ({formatDuration(section.durationMinutes)})
                </span>
              )}
            </div>

            {section.exercises.map((exercise) => (
              <ExerciseItem
                key={exercise.id}
                id={exercise.id}
                title={getLocalizedString(exercise.title)}
                description={getLocalizedArray(exercise.description)}
                sets={getLocalizedString(exercise.sets)}
                reps={getLocalizedString(exercise.reps)}
                restSeconds={exercise.restSeconds}
                type={exercise.type}
                inputLabel={getLocalizedString(exercise.inputLabel)}
                note={getLocalizedString(exercise.note)}
                timerDuration={exercise.timerDuration}
                isCompleted={isExerciseCompleted(`day-${dayId}`, exercise.id)}
                measurementValue={getMeasurement(`day-${dayId}`, exercise.id)}
                onToggle={() => handleToggleExercise(exercise.id)}
                onSaveMeasurement={(value) => handleSaveMeasurement(exercise.id, value)}
              />
            ))}
          </motion.div>
        ))}

        {/* Complete Button */}
        {progressPercent === 100 && !dayProgress?.is_completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <button
              onClick={handleCompleteDay}
              className="w-full py-4 bg-success-500 text-white font-bold text-lg rounded-2xl 
                         hover:bg-success-600 transition-colors shadow-lg shadow-success-200"
            >
              🎉 {t('training.completed')}! (+50 XP)
            </button>
          </motion.div>
        )}

        {/* Already completed */}
        {dayProgress?.is_completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-success-100 text-success-700 px-6 py-3 rounded-xl font-bold">
              <PartyPopper className="w-5 h-5" />
              {t('training.dayCompleted')}
            </div>
          </motion.div>
        )}

        {/* Celebration Modal */}
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('training.congratulations')}!
              </h2>
              <p className="text-gray-600 mb-6">
                {t('training.dayCompletedMessage')}
              </p>
              <div className="bg-primary-100 rounded-xl p-4 mb-6">
                <div className="text-3xl font-black text-primary-600">+{dayProgress?.xp_earned || 0} XP</div>
                <div className="text-sm text-primary-500">+ 50 XP бонус</div>
              </div>
              <button
                onClick={handleCompleteDay}
                className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
              >
                {t('common.continue')}
              </button>
            </motion.div>
          </motion.div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
};
