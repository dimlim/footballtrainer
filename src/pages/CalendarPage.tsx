import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Lock, Home, MapPin, Flame, Clock, Play, Loader2 } from 'lucide-react';
import { Card, IntensityBadge, Progress } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import { usePlayerProgramStore } from '@/stores/playerProgramStore';
import { useProgramStore, Program, ProgramDay } from '@/stores/programStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = {
  uk: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  cs: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
};

const MONTHS = {
  uk: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  cs: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
};

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile } = useAuthStore();
  const { completedDays, loadCompletedDays } = useProgressStore();
  const { playerPrograms, loadPlayerPrograms, getDayNumberForDate, getDateForDayNumber, getProgramStartDate } = usePlayerProgramStore();
  const { programs, currentDays, isLoading: programsLoading, loadPrograms, loadProgramDetails } = useProgramStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0 });

  // Get user's first active program
  const activeProgram = useMemo(() => {
    // Find first program that user has added
    const userProgramIds = Object.keys(playerPrograms);
    return programs.find(p => userProgramIds.includes(p.id)) || programs[0];
  }, [programs, playerPrograms]);

  const playerProgram = activeProgram ? playerPrograms[activeProgram.id] : null;
  const programStartDate = activeProgram ? getProgramStartDate(activeProgram.id) : null;

  const daysOfWeek = DAYS_OF_WEEK[language as keyof typeof DAYS_OF_WEEK] || DAYS_OF_WEEK.en;
  const months = MONTHS[language as keyof typeof MONTHS] || MONTHS.en;

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    if (activeProgram?.id) {
      loadProgramDetails(activeProgram.id);
    }
  }, [activeProgram?.id, loadProgramDetails]);

  useEffect(() => {
    if (profile?.id) {
      loadCompletedDays(profile.id);
      loadPlayerPrograms(profile.id);
      loadStats();
    }
  }, [profile?.id, loadCompletedDays, loadPlayerPrograms]);

  const loadStats = async () => {
    if (!profile?.id) return;
    
    const { data } = await supabase
      .from('player_stats')
      .select('current_streak, longest_streak')
      .eq('player_id', profile.id)
      .single();
    
    if (data) {
      setStats({
        currentStreak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
      });
    }
  };

  // Localization helpers
  const getLocalizedText = (uk?: string, en?: string, cs?: string): string => {
    if (language === 'uk') return uk || '';
    if (language === 'cs') return cs || uk || '';
    return en || uk || '';
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6;
  
  const daysInMonth = lastDayOfMonth.getDate();
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get training day number for a calendar date
  const getTrainingDayNumber = (date: Date): number | null => {
    if (!activeProgram || !programStartDate) return null;
    
    const dayNum = getDayNumberForDate(activeProgram.id, date);
    if (dayNum === null || dayNum < 1 || dayNum > activeProgram.duration_days) return null;
    return dayNum;
  };

  // Get training day data from currentDays
  const getTrainingDay = (dayNumber: number): ProgramDay | null => {
    return currentDays.find(d => d.day_number === dayNumber) || null;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  // Get status for a training day
  const getDayStatus = (dayNumber: number): 'completed' | 'open' | 'locked' | 'missed' | 'future' => {
    if (!activeProgram) return 'locked';
    
    const dayKey = `${activeProgram.id}-day-${dayNumber}`;
    if (completedDays[dayKey]) return 'completed';
    
    // Get the date for this day number
    const dayDate = getDateForDayNumber(activeProgram.id, dayNumber);
    if (!dayDate) return 'locked';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    
    // Future day
    if (dayDate > today) {
      // First day or previous completed = will be open when date comes
      if (dayNumber === 1) return 'future';
      const prevDayKey = `${activeProgram.id}-day-${dayNumber - 1}`;
      if (completedDays[prevDayKey]) return 'future';
      return 'locked';
    }
    
    // Today or past
    if (dayNumber === 1) return 'open';
    
    const prevDayKey = `${activeProgram.id}-day-${dayNumber - 1}`;
    if (completedDays[prevDayKey]) return 'open';
    
    // Past and not completed and previous not completed = missed
    if (dayDate < today) return 'missed';
    
    return 'locked';
  };

  const selectedTrainingDayNumber = selectedDate ? getTrainingDayNumber(selectedDate) : null;
  const selectedTrainingDay = selectedTrainingDayNumber ? getTrainingDay(selectedTrainingDayNumber) : null;
  const selectedStatus = selectedTrainingDayNumber ? getDayStatus(selectedTrainingDayNumber) : null;

  const intensityLabels = {
    low: t('training.intensity.low'),
    medium: t('training.intensity.medium'),
    high: t('training.intensity.high'),
  };

  // Calculate progress
  const completedCount = activeProgram 
    ? Object.keys(completedDays).filter(k => k.startsWith(activeProgram.id)).length 
    : 0;
  const totalDays = activeProgram?.duration_days || 30;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  // Format start date
  const formatStartDate = () => {
    if (!programStartDate) return null;
    return programStartDate.toLocaleDateString(
      language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  if (programsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-100 text-sm mb-1">
                <Flame className="w-4 h-4" />
                <span className="font-medium">{t('stats.streak')}</span>
              </div>
              <div className="text-4xl font-black">{stats.currentStreak}</div>
              <p className="text-orange-200 text-sm mt-1">
                {language === 'uk' ? 'днів поспіль' : language === 'cs' ? 'dní v řadě' : 'days in a row'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-orange-200 text-xs uppercase">
                {language === 'uk' ? 'Рекорд' : language === 'cs' ? 'Rekord' : 'Best'}
              </p>
              <p className="text-2xl font-bold">{stats.longestStreak}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Progress */}
      {activeProgram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900">{t('stats.progress')}</span>
              <span className="text-sm font-bold text-primary-600">{completedCount}/{totalDays}</span>
            </div>
            <Progress value={progressPercent} size="md" color="primary" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {progressPercent}% {language === 'uk' ? 'програми завершено' : language === 'cs' ? 'programu dokončeno' : 'of program completed'}
            </p>
            {programStartDate && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                {language === 'uk' ? 'Старт:' : language === 'cs' ? 'Start:' : 'Started:'} {formatStartDate()}
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg text-gray-900">
              {months[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, month, day);
              const trainingDayNum = getTrainingDayNumber(date);
              const trainingDay = trainingDayNum ? getTrainingDay(trainingDayNum) : null;
              const status = trainingDayNum ? getDayStatus(trainingDayNum) : null;
              
              const isSelected = selectedDate?.getDate() === day && 
                                 selectedDate?.getMonth() === month && 
                                 selectedDate?.getFullYear() === year;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all',
                    isToday(day) && 'ring-2 ring-primary-500',
                    isSelected && 'bg-primary-100 ring-2 ring-primary-400',
                    status === 'completed' && !isSelected && 'bg-success-50',
                    status === 'open' && !isSelected && 'bg-primary-50',
                    status === 'missed' && !isSelected && 'bg-red-50',
                    status === 'future' && !isSelected && 'bg-gray-50',
                    !trainingDay && 'hover:bg-gray-50'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isToday(day) && 'text-primary-600 font-bold',
                    status === 'completed' && 'text-success-600',
                    status === 'missed' && 'text-red-400',
                    status === 'future' && 'text-gray-400'
                  )}>
                    {day}
                  </span>
                  
                  {trainingDay && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mt-0.5',
                      trainingDay.intensity === 'low' && 'bg-emerald-500',
                      trainingDay.intensity === 'medium' && 'bg-amber-500',
                      trainingDay.intensity === 'high' && 'bg-rose-500'
                    )} />
                  )}
                  
                  {status === 'completed' && (
                    <div className="absolute top-0.5 right-0.5">
                      <Check className="w-3 h-3 text-success-500" />
                    </div>
                  )}

                  {(status === 'locked' || status === 'future') && trainingDay && (
                    <div className="absolute top-0.5 right-0.5">
                      <Lock className="w-2.5 h-2.5 text-gray-300" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center justify-center gap-4 text-xs"
      >
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-success-50 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-success-500" />
          </div>
          <span className="text-gray-500">{t('training.completed')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-primary-50" />
          <span className="text-gray-500">{language === 'uk' ? 'Відкрито' : language === 'cs' ? 'Otevřeno' : 'Open'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-50" />
          <span className="text-gray-500">{language === 'uk' ? 'Пропущено' : language === 'cs' ? 'Zmeškáno' : 'Missed'}</span>
        </div>
      </motion.div>

      {/* Selected Day Details */}
      {selectedDate && selectedTrainingDay && activeProgram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedDate.toLocaleDateString(language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <h3 className="font-bold text-gray-900">
                  {t('training.day')} {selectedTrainingDayNumber}: {getLocalizedText(selectedTrainingDay.title_uk, selectedTrainingDay.title_en, selectedTrainingDay.title_cs)}
                </h3>
              </div>
              <IntensityBadge level={selectedTrainingDay.intensity as 'low' | 'medium' | 'high'} labels={intensityLabels} />
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {getLocalizedText(selectedTrainingDay.focus_uk, selectedTrainingDay.focus_en, selectedTrainingDay.focus_cs)}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  {selectedTrainingDay.location === 'home' ? (
                    <Home className="w-4 h-4" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span>
                    {selectedTrainingDay.location === 'home' 
                      ? t('training.location.home') 
                      : t('training.location.field')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{selectedTrainingDay.duration_minutes} {language === 'uk' ? 'хв' : 'min'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedStatus === 'completed' || selectedStatus === 'open') {
                    navigate(`/app/program/${activeProgram.id}/day/${selectedTrainingDayNumber}`);
                  }
                }}
                className={cn(
                  'w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2',
                  selectedStatus === 'completed' 
                    ? 'bg-success-100 text-success-700 hover:bg-success-200'
                    : selectedStatus === 'open'
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={selectedStatus !== 'completed' && selectedStatus !== 'open'}
              >
                {selectedStatus === 'completed' && (
                  <>
                    <Check className="w-5 h-5" />
                    {t('training.completed')}
                  </>
                )}
                {selectedStatus === 'open' && (
                  <>
                    <Play className="w-5 h-5" />
                    {t('training.start')}
                  </>
                )}
                {selectedStatus === 'missed' && (
                  <span>{language === 'uk' ? 'Пропущено' : language === 'cs' ? 'Zmeškáno' : 'Missed'}</span>
                )}
                {(selectedStatus === 'locked' || selectedStatus === 'future') && (
                  <>
                    <Lock className="w-4 h-4" />
                    {language === 'uk' ? 'Заблоковано' : language === 'cs' ? 'Zamčeno' : 'Locked'}
                  </>
                )}
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* No training for selected date */}
      {selectedDate && !selectedTrainingDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <p className="text-center text-gray-400 py-4">
              {language === 'uk' ? 'Немає тренування на цей день' : language === 'cs' ? 'Žádný trénink na tento den' : 'No training for this day'}
            </p>
          </Card>
        </motion.div>
      )}

      {/* No program started message */}
      {!playerProgram && activeProgram && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-primary-50 border-primary-200">
            <div className="text-center py-4">
              <p className="text-primary-800 font-medium mb-3">
                {language === 'uk' 
                  ? 'Ви ще не почали програму тренувань' 
                  : language === 'cs' 
                  ? 'Ještě jste nezačali tréninkový program' 
                  : 'You have not started a training program yet'}
              </p>
              <button
                onClick={() => navigate('/app')}
                className="px-6 py-2 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors"
              >
                {language === 'uk' ? 'Почати зараз' : language === 'cs' ? 'Začít nyní' : 'Start Now'}
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* No programs at all */}
      {programs.length === 0 && !programsLoading && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">
            {language === 'uk' ? 'Програми ще не додані' : language === 'cs' ? 'Programy zatím nebyly přidány' : 'No programs added yet'}
          </p>
        </Card>
      )}
    </div>
  );
};
