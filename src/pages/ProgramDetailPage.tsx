import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Play, CheckCircle2, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/lib/i18n';
import { difficultyInfo } from '@/types/training';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import { useProgramStore, ProgramDay } from '@/stores/programStore';
import { cn } from '@/lib/utils';

const intensityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-red-100 text-red-700 border-red-200',
};

const locationIcons: Record<string, string> = {
  home: '🏠',
  field: '⚽',
  gym: '🏋️',
};

export const ProgramDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { completedDays, loadCompletedDays } = useProgressStore();
  const { currentProgram, currentDays, isLoading, loadProgramDetails } = useProgramStore();

  useEffect(() => {
    if (programId) {
      loadProgramDetails(programId);
    }
  }, [programId, loadProgramDetails]);

  useEffect(() => {
    if (profile?.id && programId) {
      loadCompletedDays(profile.id);
    }
  }, [profile?.id, programId, loadCompletedDays]);

  // Get localized text helpers
  const getProgramTitle = () => {
    if (!currentProgram) return '';
    if (language === 'uk') return currentProgram.title_uk;
    if (language === 'cs') return currentProgram.title_cs || currentProgram.title_uk;
    return currentProgram.title_en || currentProgram.title_uk;
  };

  const getProgramDescription = () => {
    if (!currentProgram) return '';
    if (language === 'uk') return currentProgram.description_uk || '';
    if (language === 'cs') return currentProgram.description_cs || currentProgram.description_uk || '';
    return currentProgram.description_en || currentProgram.description_uk || '';
  };

  const getDayTitle = (day: ProgramDay) => {
    if (language === 'uk') return day.title_uk;
    if (language === 'cs') return day.title_cs || day.title_uk;
    return day.title_en || day.title_uk;
  };

  const getDifficultyLabel = () => {
    if (!currentProgram) return '';
    const info = difficultyInfo[currentProgram.difficulty as keyof typeof difficultyInfo];
    if (!info) return currentProgram.difficulty;
    if (language === 'uk') return info.label.uk;
    if (language === 'cs') return info.label.cs;
    return info.label.en;
  };

  const getIntensityLabel = (intensity: string) => {
    const labels: Record<string, Record<string, string>> = {
      low: { uk: 'Легка', en: 'Light', cs: 'Lehká' },
      medium: { uk: 'Середня', en: 'Medium', cs: 'Střední' },
      high: { uk: 'Висока', en: 'High', cs: 'Vysoká' },
    };
    return labels[intensity]?.[language] || labels[intensity]?.en || intensity;
  };

  const getDayStatus = (day: ProgramDay) => {
    const dayKey = `${programId}-day-${day.day_number}`;
    if (completedDays[dayKey]) return 'completed';
    
    // First day is always open
    if (day.day_number === 1) return 'open';
    
    // Check if previous day is completed
    const prevDayKey = `${programId}-day-${day.day_number - 1}`;
    if (completedDays[prevDayKey]) return 'open';
    
    return 'locked';
  };

  const handleDayClick = (day: ProgramDay) => {
    const status = getDayStatus(day);
    if (status !== 'locked') {
      navigate(`/app/program/${programId}/day/${day.day_number}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Not found
  if (!currentProgram) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-4">
          {language === 'uk' ? 'Програму не знайдено' : language === 'cs' ? 'Program nenalezen' : 'Program not found'}
        </p>
        <button
          onClick={() => navigate('/app')}
          className="text-primary-600 font-medium"
        >
          {language === 'uk' ? 'На головну' : language === 'cs' ? 'Na hlavní' : 'Go home'}
        </button>
      </div>
    );
  }

  const completedCount = currentDays.filter(d => getDayStatus(d) === 'completed').length;
  const progressPercent = currentDays.length > 0 ? Math.round((completedCount / currentDays.length) * 100) : 0;
  const currentDay = currentDays.find(d => getDayStatus(d) === 'open') || currentDays[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className={cn(
        'p-6 pb-8 bg-gradient-to-r',
        currentProgram.category === 'explosiveness' && 'from-amber-500 to-orange-500',
        currentProgram.category === 'endurance' && 'from-green-500 to-emerald-500',
        currentProgram.category === 'technique' && 'from-blue-500 to-cyan-500',
        currentProgram.category === 'strength' && 'from-red-500 to-rose-500',
        currentProgram.category === 'agility' && 'from-purple-500 to-violet-500',
        currentProgram.category === 'recovery' && 'from-teal-500 to-cyan-500',
        !['explosiveness', 'endurance', 'technique', 'strength', 'agility', 'recovery'].includes(currentProgram.category) && 'from-primary-500 to-primary-600'
      )}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{language === 'uk' ? 'Назад' : language === 'cs' ? 'Zpět' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{currentProgram.icon || '⚽'}</span>
            <div>
              <h1 className="text-2xl font-black text-white">
                {getProgramTitle()}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  currentProgram.difficulty === 'beginner' && 'bg-green-200 text-green-800',
                  currentProgram.difficulty === 'intermediate' && 'bg-amber-200 text-amber-800',
                  currentProgram.difficulty === 'advanced' && 'bg-red-200 text-red-800',
                )}>
                  {getDifficultyLabel()}
                </span>
                <span className="text-white/80 text-sm">
                  {currentProgram.duration_days} {language === 'uk' ? 'днів' : language === 'cs' ? 'dní' : 'days'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-white/90 text-sm mt-4">
            {getProgramDescription()}
          </p>
        </motion.div>
      </div>

      {/* Progress Card */}
      <div className="px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">
                {language === 'uk' ? 'Прогрес' : language === 'cs' ? 'Pokrok' : 'Progress'}
              </h3>
              <span className="text-2xl font-black text-primary-600">{progressPercent}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              />
            </div>
            
            <p className="text-sm text-gray-500">
              {completedCount} / {currentDays.length} {language === 'uk' ? 'днів виконано' : language === 'cs' ? 'dní dokončeno' : 'days completed'}
            </p>

            {/* Continue Button */}
            {currentDay && (
              <button
                onClick={() => handleDayClick(currentDay)}
                className="w-full mt-4 bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {getDayStatus(currentDay) === 'completed' 
                  ? (language === 'uk' ? 'Переглянути' : language === 'cs' ? 'Zobrazit' : 'View')
                  : (language === 'uk' ? 'Продовжити' : language === 'cs' ? 'Pokračovat' : 'Continue')
                }
                <span className="opacity-70">
                  — {language === 'uk' ? 'День' : language === 'cs' ? 'Den' : 'Day'} {currentDay.day_number}
                </span>
              </button>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Days List */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-gray-900 mb-2">
          {language === 'uk' ? 'Всі дні' : language === 'cs' ? 'Všechny dny' : 'All Days'}
        </h3>
        
        {currentDays.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {language === 'uk' ? 'Дні тренувань ще не додані' : language === 'cs' ? 'Tréninkové dny zatím nebyly přidány' : 'Training days not added yet'}
            </p>
          </Card>
        ) : (
          currentDays.map((day, index) => {
            const status = getDayStatus(day);
            
            return (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * index }}
              >
                <Card
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'p-4 cursor-pointer transition-all',
                    status === 'locked' && 'opacity-60 cursor-not-allowed',
                    status === 'completed' && 'border-green-200 bg-green-50',
                    status === 'open' && 'border-primary-200 ring-2 ring-primary-100'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Day Number / Status */}
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                      status === 'completed' && 'bg-green-500 text-white',
                      status === 'open' && 'bg-primary-500 text-white',
                      status === 'locked' && 'bg-gray-200 text-gray-400'
                    )}>
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : status === 'locked' ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        day.day_number
                      )}
                    </div>

                    {/* Day Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 truncate">
                          {language === 'uk' ? 'День' : language === 'cs' ? 'Den' : 'Day'} {day.day_number}
                        </h4>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium border',
                          intensityColors[day.intensity] || intensityColors.medium
                        )}>
                          {getIntensityLabel(day.intensity)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {getDayTitle(day)}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {day.duration_minutes} {language === 'uk' ? 'хв' : 'min'}
                        </span>
                        <span>{locationIcons[day.location] || '🏠'}</span>
                      </div>
                    </div>

                    {/* Arrow */}
                    {status !== 'locked' && (
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProgramDetailPage;
