import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Calendar as CalendarIcon, ChevronRight, 
  Flame, Clock, Zap
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { 
  ScheduleSettings, 
  WeeklyCalendar, 
  RescheduleModal 
} from '@/components/schedule';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/lib/i18n';
import { usePlayerProgramStore } from '@/stores/playerProgramStore';
import { useProgramStore } from '@/stores/programStore';
import { 
  PlayerCalendarEntry, 
  TRAINING_DAY_TYPE_ICONS,
  TRAINING_DAY_TYPE_LABELS,
  isTrainingDay
} from '@/types/schedule';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { settings, loadSettings, generateCalendar, calendar, loadCalendar } = useScheduleStore();
  const { playerPrograms, loadPlayerPrograms } = usePlayerProgramStore();
  const { programs, loadPrograms } = useProgramStore();
  
  const [showSettings, setShowSettings] = useState(false);
  const [rescheduleEntry, setRescheduleEntry] = useState<PlayerCalendarEntry | null>(null);
  const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0 });
  const [selectedProgramId] = useState<string | null>(null);
  
  const dayTypeLabels = TRAINING_DAY_TYPE_LABELS[language as keyof typeof TRAINING_DAY_TYPE_LABELS] || TRAINING_DAY_TYPE_LABELS.en;
  
  useEffect(() => {
    if (profile?.id) {
      loadSettings(profile.id);
      loadPlayerPrograms(profile.id);
      loadStats();
      
      // Load calendar for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      loadCalendar(profile.id, startOfMonth, endOfMonth);
    }
    loadPrograms();
  }, [profile?.id]);
  
  const loadStats = async () => {
    if (!profile?.id) return;
    
    const { data } = await supabase
      .from('player_stats')
      .select('current_streak, longest_streak')
      .eq('player_id', profile.id)
      .single();
    
    if (data) {
      setStats({
        currentStreak: (data as any).current_streak || 0,
        longestStreak: (data as any).longest_streak || 0,
      });
    }
  };
  
  // Get user's active programs
  const userPrograms = programs.filter(p => Object.keys(playerPrograms).includes(p.id));
  const activeProgram = selectedProgramId 
    ? programs.find(p => p.id === selectedProgramId) 
    : userPrograms[0];
  
  // Get today's training
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayEntry = calendar.find(e => e.calendar_date === todayStr);
  
  // Get this week's summary
  const weekSummary = {
    total: calendar.filter(e => isTrainingDay(e.day_type)).length,
    completed: calendar.filter(e => e.is_completed).length,
    upcoming: calendar.filter(e => isTrainingDay(e.day_type) && !e.is_completed && !e.is_skipped).length
  };
  
  const handleDayClick = (_date: Date, entry?: PlayerCalendarEntry) => {
    if (entry && isTrainingDay(entry.day_type) && entry.program_id && entry.program_day_id) {
      // Navigate to program day
      navigate(`/app/program/${entry.program_id}/day/${entry.program_day_id}`);
    }
  };
  
  const handleSettingsSaved = async () => {
    setShowSettings(false);
    if (profile?.id) {
      // Regenerate calendar with new settings
      await generateCalendar(profile.id, new Date(), activeProgram?.id);
    }
  };
  
  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      title: {
        uk: 'Мій розклад',
        en: 'My Schedule',
        cs: 'Můj rozvrh'
      },
      todayTraining: {
        uk: 'Сьогоднішнє тренування',
        en: 'Today\'s Training',
        cs: 'Dnešní trénink'
      },
      noTrainingToday: {
        uk: 'Сьогодні день відпочинку',
        en: 'Rest day today',
        cs: 'Dnes je den odpočinku'
      },
      weekSummary: {
        uk: 'Цей тиждень',
        en: 'This Week',
        cs: 'Tento týden'
      },
      completed: {
        uk: 'Виконано',
        en: 'Completed',
        cs: 'Dokončeno'
      },
      upcoming: {
        uk: 'Попереду',
        en: 'Upcoming',
        cs: 'Nadcházející'
      },
      total: {
        uk: 'Всього',
        en: 'Total',
        cs: 'Celkem'
      },
      setupSchedule: {
        uk: 'Налаштувати розклад',
        en: 'Setup Schedule',
        cs: 'Nastavit rozvrh'
      },
      noScheduleYet: {
        uk: 'Розклад ще не налаштовано',
        en: 'Schedule not set up yet',
        cs: 'Rozvrh ještě není nastaven'
      },
      setupNow: {
        uk: 'Налаштуйте свій тренувальний розклад для оптимальних результатів',
        en: 'Set up your training schedule for optimal results',
        cs: 'Nastavte si tréninkový rozvrh pro optimální výsledky'
      },
      startTraining: {
        uk: 'Почати тренування',
        en: 'Start Training',
        cs: 'Začít trénink'
      },
      minutes: {
        uk: 'хв',
        en: 'min',
        cs: 'min'
      },
      streak: {
        uk: 'Серія',
        en: 'Streak',
        cs: 'Série'
      },
      daysInRow: {
        uk: 'днів поспіль',
        en: 'days in a row',
        cs: 'dní v řadě'
      },
      record: {
        uk: 'Рекорд',
        en: 'Record',
        cs: 'Rekord'
      }
    };
    return texts[key]?.[language] || texts[key]?.['en'] || key;
  };
  
  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{getText('title')}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
      
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
                <span className="font-medium">{getText('streak')}</span>
              </div>
              <div className="text-4xl font-black">{stats.currentStreak}</div>
              <p className="text-orange-200 text-sm mt-1">{getText('daysInRow')}</p>
            </div>
            <div className="text-right">
              <p className="text-orange-200 text-xs uppercase">{getText('record')}</p>
              <p className="text-2xl font-bold">{stats.longestStreak}</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Today's Training */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{getText('todayTraining')}</h2>
        
        {todayEntry && isTrainingDay(todayEntry.day_type) ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                'bg-gradient-to-br from-primary-100 to-primary-200'
              )}>
                {TRAINING_DAY_TYPE_ICONS[todayEntry.day_type]}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {todayEntry.title || dayTypeLabels[todayEntry.day_type]}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  {todayEntry.scheduled_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {todayEntry.scheduled_time}
                    </div>
                  )}
                  {todayEntry.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {todayEntry.duration_minutes} {getText('minutes')}
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={() => handleDayClick(new Date(), todayEntry)}
                disabled={todayEntry.is_completed}
              >
                {todayEntry.is_completed ? getText('completed') : getText('startTraining')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <div className="text-4xl mb-2">😴</div>
            <p className="text-gray-500">{getText('noTrainingToday')}</p>
          </Card>
        )}
      </motion.div>
      
      {/* Week Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{getText('weekSummary')}</h2>
        
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{weekSummary.completed}</div>
            <p className="text-xs text-gray-500">{getText('completed')}</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{weekSummary.upcoming}</div>
            <p className="text-xs text-gray-500">{getText('upcoming')}</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{weekSummary.total}</div>
            <p className="text-xs text-gray-500">{getText('total')}</p>
          </Card>
        </div>
      </motion.div>
      
      {/* Weekly Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-4">
          <WeeklyCalendar
            onDayClick={handleDayClick}
            onReschedule={setRescheduleEntry}
            programId={activeProgram?.id}
          />
        </Card>
      </motion.div>
      
      {/* Setup Schedule Prompt (if no settings) */}
      {!settings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
            <div className="text-center">
              <CalendarIcon className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{getText('noScheduleYet')}</h3>
              <p className="text-sm text-gray-600 mb-4">{getText('setupNow')}</p>
              <Button onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                {getText('setupSchedule')}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <ScheduleSettings
            onClose={() => setShowSettings(false)}
            onSave={handleSettingsSaved}
          />
        )}
      </AnimatePresence>
      
      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleEntry && (
          <RescheduleModal
            entry={rescheduleEntry}
            onClose={() => setRescheduleEntry(null)}
            onSuccess={() => {
              // Reload calendar after reschedule
              if (profile?.id) {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                loadCalendar(profile.id, startOfMonth, endOfMonth);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchedulePage;

