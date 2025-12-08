import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, Settings, Check, X, 
  ChevronRight, Info, Zap, Moon, Sun, Sunrise, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/lib/i18n';
import { 
  DayOfWeek, 
  DAY_NAMES, 
  WeeklyTemplate,
  getRecommendedTrainingsPerWeek
} from '@/types/schedule';
import { calculateAge } from '@/lib/ageCategories';
import { cn } from '@/lib/utils';

interface ScheduleSettingsProps {
  onClose?: () => void;
  onSave?: () => void;
}

export const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({ onClose, onSave }) => {
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    settings, 
    templates,
    loadSettings, 
    saveSettings, 
    loadTemplates,
    isLoading 
  } = useScheduleStore();
  
  // Локальний стан для редагування
  const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([1, 3, 5]);
  const [hasTeamTraining, setHasTeamTraining] = useState(false);
  const [teamTrainingDays, setTeamTrainingDays] = useState<DayOfWeek[]>([]);
  const [matchDay, setMatchDay] = useState<DayOfWeek | null>(null);
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>('evening');
  const [preferredDuration, setPreferredDuration] = useState(45);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [considerRecovery, setConsiderRecovery] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  // Вік гравця для рекомендацій
  const playerAge = profile?.birth_date ? calculateAge(new Date(profile.birth_date)) : null;
  const recommendations = getRecommendedTrainingsPerWeek(playerAge ?? 14);
  
  useEffect(() => {
    if (profile?.id) {
      loadSettings(profile.id);
      loadTemplates();
    }
  }, [profile?.id]);
  
  useEffect(() => {
    if (settings) {
      setTrainingDays(settings.training_days as DayOfWeek[]);
      setHasTeamTraining(settings.has_team_training);
      setTeamTrainingDays(settings.team_training_days as DayOfWeek[]);
      setMatchDay(settings.match_day as DayOfWeek | null);
      setPreferredTime(
        settings.preferred_time < '12:00' ? 'morning' :
        settings.preferred_time < '17:00' ? 'afternoon' : 'evening'
      );
      setPreferredDuration(settings.preferred_duration);
      setAutoSchedule(settings.auto_schedule);
      setConsiderRecovery(settings.consider_recovery);
    }
  }, [settings]);
  
  const toggleDay = (day: DayOfWeek, isTeam = false) => {
    if (isTeam) {
      setTeamTrainingDays(prev => 
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
    } else {
      setTrainingDays(prev => 
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
      );
    }
  };
  
  const applyTemplate = (template: WeeklyTemplate) => {
    setSelectedTemplate(template.id);
    const days = template.week_structure.map(w => w.day as DayOfWeek);
    setTrainingDays(days);
  };
  
  const handleSave = async () => {
    const timeMap = {
      morning: '08:00',
      afternoon: '14:00',
      evening: '18:00'
    };
    
    await saveSettings({
      training_days: trainingDays,
      trainings_per_week: trainingDays.length,
      has_team_training: hasTeamTraining,
      team_training_days: teamTrainingDays,
      match_day: matchDay,
      preferred_time: timeMap[preferredTime],
      preferred_duration: preferredDuration,
      auto_schedule: autoSchedule,
      consider_recovery: considerRecovery
    });
    
    onSave?.();
  };
  
  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      title: {
        uk: 'Налаштування розкладу',
        en: 'Schedule Settings',
        cs: 'Nastavení rozvrhu'
      },
      step1Title: {
        uk: 'Командні тренування',
        en: 'Team Training',
        cs: 'Týmový trénink'
      },
      step1Desc: {
        uk: 'Чи маєте ви регулярні командні тренування?',
        en: 'Do you have regular team training?',
        cs: 'Máte pravidelný týmový trénink?'
      },
      step2Title: {
        uk: 'Дні командних тренувань',
        en: 'Team Training Days',
        cs: 'Dny týmového tréninku'
      },
      step2Desc: {
        uk: 'Оберіть дні, коли у вас командні тренування',
        en: 'Select your team training days',
        cs: 'Vyberte dny týmového tréninku'
      },
      step3Title: {
        uk: 'День матчу',
        en: 'Match Day',
        cs: 'Den zápasu'
      },
      step3Desc: {
        uk: 'Чи є у вас регулярний день матчів?',
        en: 'Do you have a regular match day?',
        cs: 'Máte pravidelný den zápasů?'
      },
      step4Title: {
        uk: 'Індивідуальні тренування',
        en: 'Individual Training',
        cs: 'Individuální trénink'
      },
      step4Desc: {
        uk: 'Оберіть дні для додаткових індивідуальних тренувань',
        en: 'Select days for additional individual training',
        cs: 'Vyberte dny pro individuální trénink'
      },
      step5Title: {
        uk: 'Час та тривалість',
        en: 'Time & Duration',
        cs: 'Čas a délka'
      },
      step5Desc: {
        uk: 'Коли вам зручніше тренуватись?',
        en: 'When do you prefer to train?',
        cs: 'Kdy preferujete trénovat?'
      },
      yes: {
        uk: 'Так',
        en: 'Yes',
        cs: 'Ano'
      },
      no: {
        uk: 'Ні',
        en: 'No',
        cs: 'Ne'
      },
      morning: {
        uk: 'Ранок',
        en: 'Morning',
        cs: 'Ráno'
      },
      afternoon: {
        uk: 'День',
        en: 'Afternoon',
        cs: 'Odpoledne'
      },
      evening: {
        uk: 'Вечір',
        en: 'Evening',
        cs: 'Večer'
      },
      minutes: {
        uk: 'хвилин',
        en: 'minutes',
        cs: 'minut'
      },
      back: {
        uk: 'Назад',
        en: 'Back',
        cs: 'Zpět'
      },
      next: {
        uk: 'Далі',
        en: 'Next',
        cs: 'Další'
      },
      save: {
        uk: 'Зберегти',
        en: 'Save',
        cs: 'Uložit'
      },
      skip: {
        uk: 'Пропустити',
        en: 'Skip',
        cs: 'Přeskočit'
      },
      recommended: {
        uk: 'Рекомендовано для вашого віку',
        en: 'Recommended for your age',
        cs: 'Doporučeno pro váš věk'
      },
      trainingsPerWeek: {
        uk: 'тренувань на тиждень',
        en: 'trainings per week',
        cs: 'tréninků týdně'
      },
      templates: {
        uk: 'Готові шаблони',
        en: 'Ready Templates',
        cs: 'Připravené šablony'
      },
      autoSchedule: {
        uk: 'Автоматичне планування',
        en: 'Auto Schedule',
        cs: 'Automatické plánování'
      },
      considerRecovery: {
        uk: 'Враховувати відновлення',
        en: 'Consider Recovery',
        cs: 'Zvážit regeneraci'
      },
      recoveryDesc: {
        uk: 'Після важких тренувань буде запропоновано легке навантаження',
        en: 'Light training will be suggested after intense sessions',
        cs: 'Po náročném tréninku bude navržen lehký trénink'
      }
    };
    return texts[key]?.[language] || texts[key]?.['en'] || key;
  };
  
  const dayNames = DAY_NAMES[language] || DAY_NAMES.en;
  
  // Компонент вибору днів тижня
  const DaySelector: React.FC<{
    selectedDays: DayOfWeek[];
    onToggle: (day: DayOfWeek) => void;
    disabledDays?: DayOfWeek[];
    highlightDays?: DayOfWeek[];
  }> = ({ selectedDays, onToggle, disabledDays = [], highlightDays = [] }) => (
    <div className="grid grid-cols-7 gap-2">
      {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map(day => {
        const isSelected = selectedDays.includes(day);
        const isDisabled = disabledDays.includes(day);
        const isHighlighted = highlightDays.includes(day);
        
        return (
          <motion.button
            key={day}
            whileHover={{ scale: isDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
            onClick={() => !isDisabled && onToggle(day)}
            disabled={isDisabled}
            className={cn(
              'p-3 rounded-xl text-center transition-all',
              isSelected && 'bg-primary-500 text-white shadow-lg',
              !isSelected && !isDisabled && 'bg-gray-100 hover:bg-gray-200',
              isDisabled && 'bg-gray-50 text-gray-300 cursor-not-allowed',
              isHighlighted && !isSelected && 'ring-2 ring-orange-400'
            )}
          >
            <span className="text-xs font-medium">{dayNames[day]}</span>
          </motion.button>
        );
      })}
    </div>
  );
  
  const totalSteps = 5;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{getText('title')}</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Progress */}
        <div className="px-4 pt-4">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all',
                  i < step ? 'bg-primary-500' : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Team Training */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{getText('step1Title')}</h3>
                  <p className="text-gray-600 mt-1">{getText('step1Desc')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setHasTeamTraining(true)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      hasTeamTraining 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Check className={cn(
                      'w-6 h-6 mx-auto mb-2',
                      hasTeamTraining ? 'text-primary-500' : 'text-gray-400'
                    )} />
                    <span className="font-medium">{getText('yes')}</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setHasTeamTraining(false);
                      setTeamTrainingDays([]);
                    }}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      !hasTeamTraining 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <X className={cn(
                      'w-6 h-6 mx-auto mb-2',
                      !hasTeamTraining ? 'text-primary-500' : 'text-gray-400'
                    )} />
                    <span className="font-medium">{getText('no')}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Team Training Days */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{getText('step2Title')}</h3>
                  <p className="text-gray-600 mt-1">{getText('step2Desc')}</p>
                </div>
                
                <DaySelector
                  selectedDays={teamTrainingDays}
                  onToggle={(day) => toggleDay(day, true)}
                />
              </motion.div>
            )}
            
            {/* Step 3: Match Day */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{getText('step3Title')}</h3>
                  <p className="text-gray-600 mt-1">{getText('step3Desc')}</p>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map(day => (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMatchDay(matchDay === day ? null : day)}
                      className={cn(
                        'p-3 rounded-xl text-center transition-all',
                        matchDay === day && 'bg-red-500 text-white shadow-lg',
                        matchDay !== day && 'bg-gray-100 hover:bg-gray-200'
                      )}
                    >
                      <span className="text-xs font-medium">{dayNames[day]}</span>
                    </motion.button>
                  ))}
                </div>
                
                <button
                  onClick={() => setMatchDay(null)}
                  className="w-full text-center text-gray-500 hover:text-gray-700 py-2"
                >
                  {getText('skip')}
                </button>
              </motion.div>
            )}
            
            {/* Step 4: Individual Training Days */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{getText('step4Title')}</h3>
                  <p className="text-gray-600 mt-1">{getText('step4Desc')}</p>
                </div>
                
                {/* Рекомендації */}
                <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">{getText('recommended')}</p>
                    <p>{recommendations.min}-{recommendations.max} {getText('trainingsPerWeek')}</p>
                  </div>
                </div>
                
                <DaySelector
                  selectedDays={trainingDays}
                  onToggle={(day) => toggleDay(day, false)}
                  disabledDays={[...teamTrainingDays, matchDay].filter(Boolean) as DayOfWeek[]}
                  highlightDays={teamTrainingDays}
                />
                
                {/* Шаблони */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{getText('templates')}</h4>
                  <div className="space-y-2">
                    {templates.slice(0, 3).map(template => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => applyTemplate(template)}
                        className={cn(
                          'w-full p-3 rounded-xl border-2 text-left transition-all',
                          selectedTemplate === template.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {language === 'uk' ? template.name_uk : 
                             language === 'cs' ? template.name_cs : 
                             template.name_en}
                          </span>
                          <span className="text-sm text-gray-500">
                            {template.trainings_per_week}x
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 5: Time & Duration */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{getText('step5Title')}</h3>
                  <p className="text-gray-600 mt-1">{getText('step5Desc')}</p>
                </div>
                
                {/* Час дня */}
                <div className="grid grid-cols-3 gap-3">
                  {(['morning', 'afternoon', 'evening'] as const).map(time => {
                    const icons = {
                      morning: Sunrise,
                      afternoon: Sun,
                      evening: Moon
                    };
                    const Icon = icons[time];
                    
                    return (
                      <motion.button
                        key={time}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPreferredTime(time)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all',
                          preferredTime === time
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon className={cn(
                          'w-6 h-6 mx-auto mb-2',
                          preferredTime === time ? 'text-primary-500' : 'text-gray-400'
                        )} />
                        <span className="text-sm font-medium">{getText(time)}</span>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Тривалість */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {preferredDuration} {getText('minutes')}
                  </label>
                  <input
                    type="range"
                    min={15}
                    max={90}
                    step={5}
                    value={preferredDuration}
                    onChange={(e) => setPreferredDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15</span>
                    <span>45</span>
                    <span>90</span>
                  </div>
                </div>
                
                {/* Додаткові налаштування */}
                <div className="space-y-3 mt-6">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium">{getText('autoSchedule')}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSchedule}
                      onChange={(e) => setAutoSchedule(e.target.checked)}
                      className="w-5 h-5 rounded text-primary-500"
                    />
                  </label>
                  
                  <label className="flex items-start justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium">{getText('considerRecovery')}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-8">{getText('recoveryDesc')}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={considerRecovery}
                      onChange={(e) => setConsiderRecovery(e.target.checked)}
                      className="w-5 h-5 rounded text-primary-500 flex-shrink-0"
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="flex-1"
            >
              {getText('back')}
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button
              onClick={() => {
                // Пропускаємо крок 2 якщо немає командних тренувань
                if (step === 1 && !hasTeamTraining) {
                  setStep(3);
                } else {
                  setStep(s => s + 1);
                }
              }}
              className="flex-1"
            >
              {getText('next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {getText('save')}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleSettings;

