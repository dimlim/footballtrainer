import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft,
  Target,
  Calendar,
  Trophy,
  Users,
  Zap,
  Check,
  Cake,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { getAgeCategory, AGE_CATEGORIES, calculateAge } from '@/lib/ageCategories';

interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  title: Record<string, string>;
  description: Record<string, string>;
  image?: string;
  color: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: <Zap className="w-12 h-12" />,
    title: {
      uk: 'Ласкаво просимо!',
      en: 'Welcome!',
      cs: 'Vítejte!'
    },
    description: {
      uk: 'Football Trainer Pro допоможе вам стати кращим футболістом з персоналізованими тренуваннями',
      en: 'Football Trainer Pro will help you become a better football player with personalized training',
      cs: 'Football Trainer Pro vám pomůže stát se lepším fotbalistou s personalizovaným tréninkem'
    },
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'programs',
    icon: <Target className="w-12 h-12" />,
    title: {
      uk: 'Обирайте програми',
      en: 'Choose Programs',
      cs: 'Vyberte programy'
    },
    description: {
      uk: 'Різні програми для різних цілей: вибуховість, техніка, витривалість та багато іншого',
      en: 'Different programs for different goals: explosiveness, technique, endurance and much more',
      cs: 'Různé programy pro různé cíle: výbušnost, technika, vytrvalost a mnoho dalšího'
    },
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'calendar',
    icon: <Calendar className="w-12 h-12" />,
    title: {
      uk: 'Плануйте тренування',
      en: 'Plan Your Training',
      cs: 'Plánujte tréninky'
    },
    description: {
      uk: 'Календар покаже ваш прогрес та допоможе не пропустити жодного тренування',
      en: 'Calendar will show your progress and help you never miss a workout',
      cs: 'Kalendář ukáže váš pokrok a pomůže vám nikdy nevynechat trénink'
    },
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'achievements',
    icon: <Trophy className="w-12 h-12" />,
    title: {
      uk: 'Здобувайте досягнення',
      en: 'Earn Achievements',
      cs: 'Získejte úspěchy'
    },
    description: {
      uk: 'Отримуйте XP, підвищуйте рівень та розблоковуйте досягнення за свої успіхи',
      en: 'Earn XP, level up and unlock achievements for your success',
      cs: 'Získávejte XP, zvyšujte úroveň a odemykejte úspěchy za své úspěchy'
    },
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'team',
    icon: <Users className="w-12 h-12" />,
    title: {
      uk: 'Тренуйтесь з командою',
      en: 'Train with Team',
      cs: 'Trénujte s týmem'
    },
    description: {
      uk: 'Приєднуйтесь до команди, змагайтесь з друзями та відстежуйте прогрес разом',
      en: 'Join a team, compete with friends and track progress together',
      cs: 'Připojte se k týmu, soutěžte s přáteli a sledujte pokrok společně'
    },
    color: 'from-cyan-500 to-blue-600'
  }
];

// Days of week
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DAY_NAMES: Record<string, string[]> = {
  uk: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  cs: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { language } = useTranslation();
  const { updateProfile, profile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'player' | 'coach' | null>(null);
  const [birthDate, setBirthDate] = useState<string>('');
  const [trainingDays, setTrainingDays] = useState<DayOfWeek[]>([1, 3, 5]); // Mon, Wed, Fri by default
  const [trainingsPerWeek, setTrainingsPerWeek] = useState<number>(3);
  
  // Calculate age category from birth date
  const ageCategory = birthDate ? getAgeCategory(birthDate) : null;
  const ageCategoryInfo = ageCategory ? AGE_CATEGORIES[ageCategory] : null;
  const age = birthDate ? calculateAge(birthDate) : null;

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'next': { uk: 'Далі', en: 'Next', cs: 'Další' },
      'back': { uk: 'Назад', en: 'Back', cs: 'Zpět' },
      'start': { uk: 'Почати', en: 'Get Started', cs: 'Začít' },
      'skip': { uk: 'Пропустити', en: 'Skip', cs: 'Přeskočit' },
      'selectRole': { uk: 'Оберіть вашу роль', en: 'Select your role', cs: 'Vyberte svou roli' },
      'player': { uk: 'Гравець', en: 'Player', cs: 'Hráč' },
      'playerDesc': { uk: 'Я хочу тренуватись та покращувати навички', en: 'I want to train and improve my skills', cs: 'Chci trénovat a zlepšovat své dovednosti' },
      'coach': { uk: 'Тренер', en: 'Coach', cs: 'Trenér' },
      'coachDesc': { uk: 'Я хочу керувати командою та відстежувати прогрес гравців', en: 'I want to manage a team and track player progress', cs: 'Chci řídit tým a sledovat pokrok hráčů' },
      'enterBirthDate': { uk: 'Вкажіть дату народження', en: 'Enter your birth date', cs: 'Zadejte datum narození' },
      'birthDateDesc': { uk: 'Це допоможе підібрати програми відповідно до вашого віку', en: 'This will help us find programs suitable for your age', cs: 'To nám pomůže najít programy vhodné pro váš věk' },
      'yourCategory': { uk: 'Ваша категорія', en: 'Your category', cs: 'Vaše kategorie' },
      'yearsOld': { uk: 'років', en: 'years old', cs: 'let' },
      'selectTrainingDays': { uk: 'Оберіть дні тренувань', en: 'Select training days', cs: 'Vyberte dny tréninku' },
      'trainingDaysDesc': { uk: 'Коли вам зручно тренуватись? Можна змінити пізніше', en: 'When is it convenient for you to train? You can change this later', cs: 'Kdy je pro vás vhodné trénovat? Můžete to změnit později' },
      'trainingsPerWeek': { uk: 'Тренувань на тиждень', en: 'Trainings per week', cs: 'Tréninků týdně' },
      'recommended': { uk: 'Рекомендовано', en: 'Recommended', cs: 'Doporučeno' },
      'forBeginners': { uk: 'Для початківців', en: 'For beginners', cs: 'Pro začátečníky' },
      'optimal': { uk: 'Оптимально', en: 'Optimal', cs: 'Optimální' },
      'intensive': { uk: 'Інтенсивно', en: 'Intensive', cs: 'Intenzivní' },
      'selectDays': { uk: 'Оберіть дні', en: 'Select days', cs: 'Vyberte dny' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };
  
  // Total steps: intro slides + birth date + training schedule + role selection
  const totalSteps = steps.length + 3; // +1 for birth date, +1 for schedule, +1 for role

  const isBirthDateStep = currentStep === steps.length;
  const isScheduleStep = currentStep === steps.length + 1;
  const isRoleStep = currentStep === steps.length + 2;
  const isLastStep = isRoleStep;
  const step = currentStep < steps.length ? steps[currentStep] : null;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (profile?.id) {
      const updates: { role?: 'player' | 'coach'; birth_date?: string } = {};
      if (selectedRole) updates.role = selectedRole;
      if (birthDate) updates.birth_date = birthDate;
      
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
      }
      
      // Save training schedule to localStorage for now
      // TODO: Save to database when schedule tables are ready
      localStorage.setItem('training_days', JSON.stringify(trainingDays));
      localStorage.setItem('trainings_per_week', trainingsPerWeek.toString());
    }
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  const toggleTrainingDay = (day: DayOfWeek) => {
    if (trainingDays.includes(day)) {
      setTrainingDays(trainingDays.filter(d => d !== day));
    } else {
      setTrainingDays([...trainingDays, day].sort((a, b) => a - b));
    }
  };

  const dayNames = DAY_NAMES[language] || DAY_NAMES.en;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Progress dots */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 z-10">
        {[...steps, { id: 'birthdate' }, { id: 'schedule' }, { id: 'role' }].map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              index === currentStep ? 'bg-white' : 'bg-white/30'
            )}
            animate={{ scale: index === currentStep ? 1.2 : 1 }}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-6 text-white/60 hover:text-white text-sm z-10"
      >
        {getText('skip')}
      </button>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step ? (
          // Regular intro steps
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br',
              step.color
            )}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white mb-8"
            >
              {step.icon}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white text-center mb-4"
            >
              {step.title[language] || step.title.en}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-center text-lg max-w-md"
            >
              {step.description[language] || step.description.en}
            </motion.p>
          </motion.div>
        ) : isBirthDateStep ? (
          // Birth date selection step
          <motion.div
            key="birthdate"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-500 to-rose-600"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white mb-8"
            >
              <Cake className="w-12 h-12" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white text-center mb-4"
            >
              {getText('enterBirthDate')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-center text-lg max-w-md mb-8"
            >
              {getText('birthDateDesc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-xs"
            >
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                min="1950-01-01"
                className="w-full px-6 py-4 rounded-2xl bg-white/20 text-white text-center text-xl font-bold border-2 border-white/30 focus:border-white focus:outline-none placeholder-white/50"
              />
            </motion.div>

            {/* Show age category */}
            {ageCategoryInfo && age !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-white/20 rounded-2xl text-center"
              >
                <p className="text-white/80 text-sm mb-1">{getText('yourCategory')}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl">{ageCategoryInfo.icon}</span>
                  <div>
                    <p className="text-white font-bold text-xl">
                      {ageCategoryInfo.label[language]}
                    </p>
                    <p className="text-white/70 text-sm">
                      {age} {getText('yearsOld')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : isScheduleStep ? (
          // Training schedule step
          <motion.div
            key="schedule"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-teal-500 to-cyan-600"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white mb-8"
            >
              <Clock className="w-12 h-12" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white text-center mb-4"
            >
              {getText('selectTrainingDays')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-center text-lg max-w-md mb-8"
            >
              {getText('trainingDaysDesc')}
            </motion.p>

            {/* Trainings per week */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-md mb-6"
            >
              <p className="text-white/80 text-sm mb-3 text-center">{getText('trainingsPerWeek')}</p>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setTrainingsPerWeek(num)}
                    className={cn(
                      'py-3 rounded-xl font-bold text-lg transition-all',
                      trainingsPerWeek === num
                        ? 'bg-white text-teal-600 shadow-lg scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-xs text-white/60">{getText('forBeginners')}</span>
                <span className="text-xs text-white/60">{getText('optimal')}</span>
                <span className="text-xs text-white/60">{getText('intensive')}</span>
              </div>
            </motion.div>

            {/* Day selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-md"
            >
              <p className="text-white/80 text-sm mb-3 text-center">{getText('selectDays')}</p>
              <div className="grid grid-cols-7 gap-2">
                {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleTrainingDay(day)}
                    className={cn(
                      'py-3 rounded-xl font-medium text-sm transition-all',
                      trainingDays.includes(day)
                        ? 'bg-white text-teal-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    )}
                  >
                    {dayNames[day]}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 bg-white/20 rounded-2xl text-center"
            >
              <p className="text-white font-medium">
                {trainingDays.length} {language === 'uk' ? 'днів обрано' : language === 'cs' ? 'dní vybráno' : 'days selected'}
              </p>
              <p className="text-white/70 text-sm mt-1">
                {trainingDays.map(d => dayNames[d]).join(', ')}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // Role selection step
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-800 to-gray-900"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white text-center mb-8"
            >
              {getText('selectRole')}
            </motion.h1>

            <div className="grid gap-4 w-full max-w-md">
              {/* Player option */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => setSelectedRole('player')}
                className={cn(
                  'p-6 rounded-2xl border-2 text-left transition-all',
                  selectedRole === 'player'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    selectedRole === 'player' ? 'bg-green-500' : 'bg-white/10'
                  )}>
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{getText('player')}</h3>
                    <p className="text-white/60 text-sm">{getText('playerDesc')}</p>
                  </div>
                  {selectedRole === 'player' && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                </div>
              </motion.button>

              {/* Coach option */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setSelectedRole('coach')}
                className={cn(
                  'p-6 rounded-2xl border-2 text-left transition-all',
                  selectedRole === 'coach'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    selectedRole === 'coach' ? 'bg-blue-500' : 'bg-white/10'
                  )}>
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{getText('coach')}</h3>
                    <p className="text-white/60 text-sm">{getText('coachDesc')}</p>
                  </div>
                  {selectedRole === 'coach' && (
                    <Check className="w-6 h-6 text-blue-500" />
                  )}
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-center">
        {currentStep > 0 ? (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {getText('back')}
          </Button>
        ) : (
          <div />
        )}

        {isLastStep ? (
          <Button
            onClick={handleComplete}
            disabled={!selectedRole}
            className="bg-white text-gray-900 hover:bg-white/90 px-8"
          >
            {getText('start')}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-white/20 text-white hover:bg-white/30 px-8"
          >
            {getText('next')}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
