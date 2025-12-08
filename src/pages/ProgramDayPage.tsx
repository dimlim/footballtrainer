// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Clock, Home, MapPin, Target, Loader2, PartyPopper } from 'lucide-react';
import { Card, Progress, IntensityBadge } from '@/components/ui';
import { ExerciseItem } from '@/components/training';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import { useProgramStore, ProgramDay, DaySection, Exercise } from '@/stores/programStore';
import { cn } from '@/lib/utils';

export const ProgramDayPage: React.FC = () => {
  const { programId, dayNumber } = useParams<{ programId: string; dayNumber: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    progress, 
    isLoading: progressLoading, 
    loadDayProgress, 
    toggleExercise, 
    saveMeasurement,
    completeDay,
    isExerciseCompleted,
    getMeasurement,
  } = useProgressStore();
  
  const {
    currentProgram,
    currentDays,
    currentSections,
    currentExercises,
    isLoading: programLoading,
    loadProgramDetails,
  } = useProgramStore();

  const [showCelebration, setShowCelebration] = useState(false);

  // Load program details
  useEffect(() => {
    if (programId) {
      loadProgramDetails(programId);
    }
  }, [programId, loadProgramDetails]);

  // Get current day
  const trainingDay = useMemo(() => {
    return currentDays.find(d => d.day_number === Number(dayNumber));
  }, [currentDays, dayNumber]);

  // Get sections for this day
  const daySections = useMemo(() => {
    if (!trainingDay) return [];
    return currentSections[trainingDay.id] || [];
  }, [trainingDay, currentSections]);

  const dayKey = `${programId}-day-${dayNumber}`;
  const dayProgress = progress[dayKey];

  // Load progress on mount
  useEffect(() => {
    if (profile?.id && programId && dayNumber) {
      loadDayProgress(profile.id, dayKey);
    }
  }, [profile?.id, programId, dayNumber, dayKey, loadDayProgress]);

  // Get all exercises for this day
  const allExercises = useMemo(() => {
    const exercises: Exercise[] = [];
    daySections.forEach(section => {
      const sectionExercises = currentExercises[section.id] || [];
      exercises.push(...sectionExercises);
    });
    return exercises;
  }, [daySections, currentExercises]);
  
  const completedCount = useMemo(() => {
    return allExercises.filter(e => isExerciseCompleted(dayKey, e.id)).length;
  }, [allExercises, dayKey, isExerciseCompleted, dayProgress]);
  
  const totalCount = allExercises.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Check for day completion - auto-complete when all exercises done
  useEffect(() => {
    const autoCompleteDay = async () => {
      if (progressPercent === 100 && !dayProgress?.is_completed && profile?.id && totalCount > 0) {
        // Auto-complete the day in database
        await completeDay(profile.id, dayKey, 50);
        setShowCelebration(true);
      }
    };
    autoCompleteDay();
  }, [progressPercent, dayProgress?.is_completed, profile?.id, totalCount, completeDay, dayKey]);

  // Localization helpers
  const getLocalizedText = (uk: string | undefined, en?: string | undefined, cs?: string | undefined): string => {
    if (language === 'uk') return uk || '';
    if (language === 'cs') return cs || uk || '';
    return en || uk || '';
  };

  const getLocalizedArray = (uk?: string[], en?: string[], cs?: string[]): string[] => {
    if (language === 'uk') return uk || [];
    if (language === 'cs') return cs || uk || [];
    return en || uk || [];
  };

  const handleToggleExercise = async (exerciseId: string) => {
    if (!profile?.id) return;
    await toggleExercise(profile.id, dayKey, exerciseId, 10);
  };

  const handleSaveMeasurement = async (exerciseId: string, value: string) => {
    if (!profile?.id) return;
    await saveMeasurement(profile.id, dayKey, exerciseId, value);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    navigate(`/app/program/${programId}`);
  };

  const intensityLabels = {
    low: t('training.intensity.low'),
    medium: t('training.intensity.medium'),
    high: t('training.intensity.high'),
  };

  const formatDuration = (minutes: number) => {
    const minLabel = language === 'uk' ? 'хв' : language === 'cs' ? 'min' : 'min';
    return `${minutes} ${minLabel}`;
  };

  const isLoading = programLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!trainingDay || !currentProgram) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {language === 'uk' ? 'День не знайдено' : language === 'cs' ? 'Den nenalezen' : 'Day not found'}
          </p>
          <button 
            onClick={() => navigate(`/app/program/${programId}`)}
            className="text-primary-600 font-medium"
          >
            {language === 'uk' ? 'Повернутися' : language === 'cs' ? 'Zpět' : 'Go back'}
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
            onClick={() => navigate(`/app/program/${programId}`)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">
              {t('training.day')} {trainingDay.day_number}
            </h1>
            <p className="text-xs text-gray-500 truncate">
              {getLocalizedText(trainingDay.title_uk, trainingDay.title_en, trainingDay.title_cs)}
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
          <Card className={cn(
            'text-white p-5 mb-6 bg-gradient-to-br',
            currentProgram.category === 'explosiveness' && 'from-amber-500 to-orange-600',
            currentProgram.category === 'endurance' && 'from-green-500 to-emerald-600',
            currentProgram.category === 'technique' && 'from-blue-500 to-cyan-600',
            currentProgram.category === 'strength' && 'from-red-500 to-rose-600',
            currentProgram.category === 'agility' && 'from-purple-500 to-violet-600',
            currentProgram.category === 'recovery' && 'from-teal-500 to-cyan-600',
            !['explosiveness', 'endurance', 'technique', 'strength', 'agility', 'recovery'].includes(currentProgram.category) && 'from-primary-500 to-primary-600'
          )}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                  <Target className="w-4 h-4" />
                  <span className="font-medium uppercase tracking-wide">{t('training.focus')}</span>
                </div>
                <p className="font-semibold text-lg">
                  {getLocalizedText(trainingDay.focus_uk, trainingDay.focus_en, trainingDay.focus_cs)}
                </p>
              </div>
              <IntensityBadge level={trainingDay.intensity as 'low' | 'medium' | 'high'} labels={intensityLabels} />
            </div>
            <div className="flex gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(trainingDay.duration_minutes)}</span>
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
                    : trainingDay.location === 'field'
                    ? t('training.location.field')
                    : t('training.location.gym')}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sections */}
        {daySections.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {language === 'uk' ? 'Вправи ще не додані' : language === 'cs' ? 'Cviky zatím nebyly přidány' : 'Exercises not added yet'}
            </p>
          </Card>
        ) : (
          daySections.map((section, sectionIdx) => {
            const sectionExercises = currentExercises[section.id] || [];
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * sectionIdx }}
                className="mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                    {getLocalizedText(section.title_uk, section.title_en, section.title_cs)}
                  </h2>
                  {section.duration_minutes && (
                    <span className="text-xs text-gray-400">
                      ({formatDuration(section.duration_minutes)})
                    </span>
                  )}
                </div>

                {sectionExercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    id={exercise.id}
                    dayKey={dayKey}
                    title={getLocalizedText(exercise.title_uk, exercise.title_en, exercise.title_cs)}
                    description={getLocalizedArray(exercise.description_uk, exercise.description_en, exercise.description_cs)}
                    sets={getLocalizedText(exercise.sets_uk, exercise.sets_en, exercise.sets_cs)}
                    reps={getLocalizedText(exercise.reps_uk, exercise.reps_en, exercise.reps_cs)}
                    restSeconds={exercise.rest_seconds}
                    type={exercise.exercise_type as 'checkbox' | 'input' | 'timer'}
                    inputLabel={getLocalizedText(exercise.input_label_uk, exercise.input_label_en, exercise.input_label_cs)}
                    note={getLocalizedText(exercise.note_uk, exercise.note_en, exercise.note_cs)}
                    timerDuration={exercise.timer_duration}
                    expectedDurationSeconds={exercise.timer_duration || (exercise.rest_seconds ? exercise.rest_seconds * 3 : 60)}
                    videoUrl={exercise.video_url}
                    isCompleted={isExerciseCompleted(dayKey, exercise.id)}
                    measurementValue={getMeasurement(dayKey, exercise.id)}
                    onToggle={() => handleToggleExercise(exercise.id)}
                    onSaveMeasurement={(value) => handleSaveMeasurement(exercise.id, value)}
                  />
                ))}
              </motion.div>
            );
          })
        )}

        {/* Complete Button - shown briefly before auto-complete */}
        {progressPercent === 100 && !dayProgress?.is_completed && !showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <div className="w-full py-4 bg-success-500 text-white font-bold text-lg rounded-2xl text-center shadow-lg shadow-success-200">
              🎉 {t('training.completed')}! (+50 XP)
            </div>
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
            onClick={handleCloseCelebration}
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
                onClick={handleCloseCelebration}
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

export default ProgramDayPage;
