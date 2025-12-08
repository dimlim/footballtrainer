import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Clock, 
  Check, X, MoreHorizontal, RefreshCw, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/lib/i18n';
import { 
  PlayerCalendarEntry,
  DayOfWeek, 
  DAY_NAMES,
  TRAINING_DAY_TYPE_ICONS,
  TRAINING_DAY_TYPE_COLORS,
  TRAINING_DAY_TYPE_LABELS,
  isTrainingDay
} from '@/types/schedule';
import { format, addDays, startOfWeek, isToday, isPast } from 'date-fns';
import { uk, enUS, cs } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface WeeklyCalendarProps {
  onDayClick?: (date: Date, entry?: PlayerCalendarEntry) => void;
  onReschedule?: (entry: PlayerCalendarEntry) => void;
  programId?: string;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  onDayClick,
  onReschedule,
  programId
}) => {
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    calendar, 
    loadCalendar, 
    loadSettings,
    generateCalendar,
    markAsCompleted,
    markAsSkipped,
    isLoading 
  } = useScheduleStore();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [showActions, setShowActions] = useState<string | null>(null);
  
  const locales = { uk, en: enUS, cs };
  const locale = locales[language as keyof typeof locales] || enUS;
  
  useEffect(() => {
    if (profile?.id) {
      loadSettings(profile.id);
      const endDate = addDays(currentWeekStart, 6);
      loadCalendar(profile.id, currentWeekStart, endDate);
    }
  }, [profile?.id, currentWeekStart]);
  
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };
  
  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };
  
  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };
  
  const handleGenerateCalendar = async () => {
    if (profile?.id) {
      await generateCalendar(profile.id, currentWeekStart, programId);
    }
  };
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const dayNames = DAY_NAMES[language as keyof typeof DAY_NAMES] || DAY_NAMES.en;
  const dayTypeLabels = TRAINING_DAY_TYPE_LABELS[language as keyof typeof TRAINING_DAY_TYPE_LABELS] || TRAINING_DAY_TYPE_LABELS.en;
  
  const getEntryForDate = (date: Date): PlayerCalendarEntry | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendar.find(e => e.calendar_date === dateStr);
  };
  
  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      thisWeek: {
        uk: 'Цей тиждень',
        en: 'This Week',
        cs: 'Tento týden'
      },
      today: {
        uk: 'Сьогодні',
        en: 'Today',
        cs: 'Dnes'
      },
      generate: {
        uk: 'Згенерувати розклад',
        en: 'Generate Schedule',
        cs: 'Vygenerovat rozvrh'
      },
      noSchedule: {
        uk: 'Розклад ще не створено',
        en: 'No schedule yet',
        cs: 'Rozvrh ještě není vytvořen'
      },
      completed: {
        uk: 'Виконано',
        en: 'Completed',
        cs: 'Dokončeno'
      },
      skipped: {
        uk: 'Пропущено',
        en: 'Skipped',
        cs: 'Přeskočeno'
      },
      reschedule: {
        uk: 'Перенести',
        en: 'Reschedule',
        cs: 'Přeplánovat'
      },
      markComplete: {
        uk: 'Позначити виконаним',
        en: 'Mark as Complete',
        cs: 'Označit jako dokončené'
      },
      markSkipped: {
        uk: 'Пропустити',
        en: 'Skip',
        cs: 'Přeskočit'
      },
      rescheduled: {
        uk: 'Перенесено',
        en: 'Rescheduled',
        cs: 'Přeplánováno'
      },
      minutes: {
        uk: 'хв',
        en: 'min',
        cs: 'min'
      }
    };
    return texts[key]?.[language] || texts[key]?.['en'] || key;
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <h3 className="font-semibold text-gray-900">
            {format(currentWeekStart, 'd MMM', { locale })} - {format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale })}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextWeek}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            {getText('today')}
          </Button>
          
          {calendar.length === 0 && (
            <Button
              size="sm"
              onClick={handleGenerateCalendar}
              disabled={isLoading}
            >
              <RefreshCw className={cn('w-4 h-4 mr-1', isLoading && 'animate-spin')} />
              {getText('generate')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {weekDays.map((date, i) => (
          <div key={i} className="text-center">
            <span className={cn(
              'text-xs font-medium',
              isToday(date) ? 'text-primary-600' : 'text-gray-500'
            )}>
              {dayNames[date.getDay() as DayOfWeek]}
            </span>
          </div>
        ))}
        
        {/* Day Cells */}
        {weekDays.map((date, i) => {
          const entry = getEntryForDate(date);
          const isCurrentDay = isToday(date);
          const isPastDay = isPast(date) && !isCurrentDay;
          
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card
                className={cn(
                  'p-2 min-h-[100px] cursor-pointer transition-all',
                  isCurrentDay && 'ring-2 ring-primary-500',
                  isPastDay && 'opacity-60',
                  entry?.is_completed && 'bg-green-50',
                  entry?.is_skipped && 'bg-gray-100'
                )}
                onClick={() => onDayClick?.(date, entry)}
              >
                {/* Date Number */}
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isCurrentDay ? 'text-primary-600' : 'text-gray-700'
                )}>
                  {format(date, 'd')}
                </div>
                
                {/* Entry Content */}
                {entry ? (
                  <div className="space-y-1">
                    {/* Day Type Icon & Label */}
                    <div className="flex items-center gap-1">
                      <span className="text-lg">
                        {TRAINING_DAY_TYPE_ICONS[entry.day_type]}
                      </span>
                      <span className={cn(
                        'text-[10px] px-1 py-0.5 rounded',
                        TRAINING_DAY_TYPE_COLORS[entry.day_type],
                        'text-white'
                      )}>
                        {dayTypeLabels[entry.day_type]?.slice(0, 8)}
                      </span>
                    </div>
                    
                    {/* Duration */}
                    {entry.duration_minutes && isTrainingDay(entry.day_type) && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="w-3 h-3" />
                        {entry.duration_minutes} {getText('minutes')}
                      </div>
                    )}
                    
                    {/* Status */}
                    {entry.is_completed && (
                      <div className="flex items-center gap-1 text-[10px] text-green-600">
                        <Check className="w-3 h-3" />
                        {getText('completed')}
                      </div>
                    )}
                    
                    {entry.is_skipped && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <X className="w-3 h-3" />
                        {getText('skipped')}
                      </div>
                    )}
                    
                    {entry.is_rescheduled && (
                      <div className="flex items-center gap-1 text-[10px] text-orange-500">
                        <RefreshCw className="w-3 h-3" />
                        {getText('rescheduled')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400 mt-2">
                    —
                  </div>
                )}
                
                {/* Actions Menu */}
                {entry && isTrainingDay(entry.day_type) && !entry.is_completed && !entry.is_skipped && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === entry.id ? null : entry.id);
                    }}
                    className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </Card>
              
              {/* Actions Dropdown */}
              <AnimatePresence>
                {showActions === entry?.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border z-10 py-1 min-w-[140px]"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsCompleted(entry.id);
                        setShowActions(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      {getText('markComplete')}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsSkipped(entry.id);
                        setShowActions(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                      {getText('markSkipped')}
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReschedule?.(entry);
                        setShowActions(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 text-orange-500" />
                      {getText('reschedule')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {calendar.length === 0 && !isLoading && (
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">{getText('noSchedule')}</p>
          <Button onClick={handleGenerateCalendar}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {getText('generate')}
          </Button>
        </Card>
      )}
      
      {/* Click outside to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActions(null)}
        />
      )}
    </div>
  );
};

export default WeeklyCalendar;

