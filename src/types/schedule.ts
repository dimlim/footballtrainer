// =====================================================
// SCHEDULE TYPES
// Типи для системи розкладу тренувань
// =====================================================

export type TrainingDayType = 
  | 'full_training'    // Повне тренування (45-60 хв)
  | 'light_training'   // Легке тренування (20-30 хв)
  | 'skills_only'      // Тільки техніка (15-20 хв)
  | 'recovery'         // Відновлення (10-15 хв)
  | 'match_prep'       // Підготовка до матчу
  | 'post_match'       // Після матчу
  | 'team_training'    // Командне тренування
  | 'match_day'        // День матчу
  | 'rest';            // Повний відпочинок

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type PlayerPosition = 
  | 'goalkeeper'       // Воротар
  | 'defender'         // Захисник
  | 'midfielder'       // Півзахисник
  | 'forward'          // Нападник
  | 'universal';       // Універсал

export type IntensityLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export type PreferredTrainingTime = 'morning' | 'afternoon' | 'evening';

// День тижня (0 = Неділя, 1 = Понеділок, ..., 6 = Субота)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// =====================================================
// INTERFACES
// =====================================================

export interface PlayerScheduleSettings {
  id: string;
  player_id: string;
  training_days: DayOfWeek[];
  trainings_per_week: number;
  has_team_training: boolean;
  team_training_days: DayOfWeek[];
  match_day: DayOfWeek | null;
  preferred_time: string; // HH:MM format
  preferred_duration: number; // minutes
  auto_schedule: boolean;
  consider_recovery: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamSchedule {
  id: string;
  team_id: string;
  day_of_week: DayOfWeek;
  event_type: TrainingDayType;
  start_time: string;
  end_time: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  intensity: IntensityLevel;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamEvent {
  id: string;
  team_id: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: TrainingDayType;
  title: string;
  description: string | null;
  location: string | null;
  opponent: string | null;
  intensity: IntensityLevel;
  is_cancelled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerCalendarEntry {
  id: string;
  player_id: string;
  calendar_date: string;
  day_type: TrainingDayType;
  program_id: string | null;
  program_day_id: string | null;
  team_event_id: string | null;
  team_schedule_id: string | null;
  title: string | null;
  description: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  intensity: IntensityLevel;
  is_completed: boolean;
  is_skipped: boolean;
  is_rescheduled: boolean;
  original_date: string | null;
  player_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleChange {
  id: string;
  player_id: string;
  calendar_entry_id: string;
  old_date: string;
  new_date: string;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface WeeklyTemplate {
  id: string;
  name_uk: string;
  name_en: string | null;
  name_cs: string | null;
  description_uk: string | null;
  description_en: string | null;
  description_cs: string | null;
  skill_level: SkillLevel | null;
  age_category: string | null;
  trainings_per_week: number;
  week_structure: WeekDayConfig[];
  is_system: boolean;
  created_at: string;
}

export interface WeekDayConfig {
  day: DayOfWeek;
  type: TrainingDayType;
  intensity: IntensityLevel;
}

// =====================================================
// UI HELPERS
// =====================================================

export const DAY_NAMES = {
  uk: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  cs: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
} as const;

export const DAY_NAMES_FULL = {
  uk: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  cs: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']
} as const;

export const TRAINING_DAY_TYPE_LABELS = {
  uk: {
    full_training: 'Повне тренування',
    light_training: 'Легке тренування',
    skills_only: 'Техніка',
    recovery: 'Відновлення',
    match_prep: 'Підготовка до матчу',
    post_match: 'Після матчу',
    team_training: 'Командне тренування',
    match_day: 'День матчу',
    rest: 'Відпочинок'
  },
  en: {
    full_training: 'Full Training',
    light_training: 'Light Training',
    skills_only: 'Skills Only',
    recovery: 'Recovery',
    match_prep: 'Match Preparation',
    post_match: 'Post Match',
    team_training: 'Team Training',
    match_day: 'Match Day',
    rest: 'Rest'
  },
  cs: {
    full_training: 'Plný trénink',
    light_training: 'Lehký trénink',
    skills_only: 'Technika',
    recovery: 'Regenerace',
    match_prep: 'Příprava na zápas',
    post_match: 'Po zápase',
    team_training: 'Týmový trénink',
    match_day: 'Den zápasu',
    rest: 'Odpočinek'
  }
} as const;

export const TRAINING_DAY_TYPE_ICONS: Record<TrainingDayType, string> = {
  full_training: '🏃',
  light_training: '🚶',
  skills_only: '⚽',
  recovery: '🧘',
  match_prep: '📋',
  post_match: '💆',
  team_training: '👥',
  match_day: '🏆',
  rest: '😴'
};

export const TRAINING_DAY_TYPE_COLORS: Record<TrainingDayType, string> = {
  full_training: 'bg-green-500',
  light_training: 'bg-blue-400',
  skills_only: 'bg-yellow-500',
  recovery: 'bg-purple-400',
  match_prep: 'bg-orange-500',
  post_match: 'bg-pink-400',
  team_training: 'bg-indigo-500',
  match_day: 'bg-red-500',
  rest: 'bg-gray-300'
};

export const INTENSITY_LABELS = {
  uk: {
    very_low: 'Дуже низька',
    low: 'Низька',
    medium: 'Середня',
    high: 'Висока',
    very_high: 'Дуже висока'
  },
  en: {
    very_low: 'Very Low',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    very_high: 'Very High'
  },
  cs: {
    very_low: 'Velmi nízká',
    low: 'Nízká',
    medium: 'Střední',
    high: 'Vysoká',
    very_high: 'Velmi vysoká'
  }
} as const;

export const SKILL_LEVEL_LABELS = {
  uk: {
    beginner: 'Початківець',
    intermediate: 'Середній',
    advanced: 'Просунутий'
  },
  en: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  },
  cs: {
    beginner: 'Začátečník',
    intermediate: 'Středně pokročilý',
    advanced: 'Pokročilý'
  }
} as const;

export const POSITION_LABELS = {
  uk: {
    goalkeeper: 'Воротар',
    defender: 'Захисник',
    midfielder: 'Півзахисник',
    forward: 'Нападник',
    universal: 'Універсал'
  },
  en: {
    goalkeeper: 'Goalkeeper',
    defender: 'Defender',
    midfielder: 'Midfielder',
    forward: 'Forward',
    universal: 'Universal'
  },
  cs: {
    goalkeeper: 'Brankář',
    defender: 'Obránce',
    midfielder: 'Záložník',
    forward: 'Útočník',
    universal: 'Univerzál'
  }
} as const;

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function getDayTypeLabel(type: TrainingDayType, lang: 'uk' | 'en' | 'cs' = 'uk'): string {
  return TRAINING_DAY_TYPE_LABELS[lang][type];
}

export function getDayName(day: DayOfWeek, lang: 'uk' | 'en' | 'cs' = 'uk', full = false): string {
  return full ? DAY_NAMES_FULL[lang][day] : DAY_NAMES[lang][day];
}

export function getIntensityLabel(intensity: IntensityLevel, lang: 'uk' | 'en' | 'cs' = 'uk'): string {
  return INTENSITY_LABELS[lang][intensity];
}

export function getSkillLevelLabel(level: SkillLevel, lang: 'uk' | 'en' | 'cs' = 'uk'): string {
  return SKILL_LEVEL_LABELS[lang][level];
}

export function getPositionLabel(position: PlayerPosition, lang: 'uk' | 'en' | 'cs' = 'uk'): string {
  return POSITION_LABELS[lang][position];
}

export function getEstimatedDuration(type: TrainingDayType): number {
  const durations: Record<TrainingDayType, number> = {
    full_training: 60,
    light_training: 30,
    skills_only: 20,
    recovery: 15,
    match_prep: 30,
    post_match: 20,
    team_training: 90,
    match_day: 0,
    rest: 0
  };
  return durations[type];
}

export function isTrainingDay(type: TrainingDayType): boolean {
  return !['rest', 'match_day'].includes(type);
}

export function isHighIntensity(type: TrainingDayType): boolean {
  return ['full_training', 'team_training', 'match_day'].includes(type);
}

export function needsRecoveryAfter(type: TrainingDayType): boolean {
  return ['full_training', 'team_training', 'match_day'].includes(type);
}

// Рекомендована кількість тренувань за віком
export function getRecommendedTrainingsPerWeek(age: number): { min: number; max: number; recommended: number } {
  if (age < 8) return { min: 2, max: 3, recommended: 2 };
  if (age < 10) return { min: 2, max: 4, recommended: 3 };
  if (age < 12) return { min: 3, max: 4, recommended: 3 };
  if (age < 14) return { min: 3, max: 5, recommended: 4 };
  if (age < 16) return { min: 4, max: 6, recommended: 4 };
  return { min: 4, max: 6, recommended: 5 };
}

// Рекомендована тривалість за віком
export function getRecommendedDuration(age: number, type: TrainingDayType): number {
  const baseDuration = getEstimatedDuration(type);
  
  if (age < 8) return Math.round(baseDuration * 0.5);
  if (age < 10) return Math.round(baseDuration * 0.6);
  if (age < 12) return Math.round(baseDuration * 0.75);
  if (age < 14) return Math.round(baseDuration * 0.85);
  if (age < 16) return Math.round(baseDuration * 0.95);
  return baseDuration;
}

