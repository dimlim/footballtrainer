import { AgeCategory, Language } from '@/types/database';

export interface AgeCategoryInfo {
  category: AgeCategory;
  label: { uk: string; en: string; cs: string };
  description: { uk: string; en: string; cs: string };
  minAge: number;
  maxAge: number;
  recommendedSessionDuration: number; // minutes
  maxSessionDuration: number;
  restMultiplier: number;
  repsMultiplier: number;
  allowStrengthExercises: boolean;
  allowLongSprints: boolean;
  gameElementsPercentage: number;
  color: string;
  icon: string;
}

export const AGE_CATEGORIES: Record<AgeCategory, AgeCategoryInfo> = {
  U8: {
    category: 'U8',
    label: { uk: 'До 8 років', en: 'Under 8', cs: 'Do 8 let' },
    description: {
      uk: 'Ігрові вправи, розвиток координації та любові до футболу',
      en: 'Game-based exercises, coordination development and love for football',
      cs: 'Herní cvičení, rozvoj koordinace a lásky k fotbalu',
    },
    minAge: 5,
    maxAge: 7,
    recommendedSessionDuration: 25,
    maxSessionDuration: 35,
    restMultiplier: 1.5,
    repsMultiplier: 0.5,
    allowStrengthExercises: false,
    allowLongSprints: false,
    gameElementsPercentage: 70,
    color: '#22C55E',
    icon: '🎮',
  },
  U10: {
    category: 'U10',
    label: { uk: 'До 10 років', en: 'Under 10', cs: 'Do 10 let' },
    description: {
      uk: 'Базова техніка з м\'ячем, ігрові елементи',
      en: 'Basic ball technique, game elements',
      cs: 'Základní technika s míčem, herní prvky',
    },
    minAge: 8,
    maxAge: 9,
    recommendedSessionDuration: 35,
    maxSessionDuration: 45,
    restMultiplier: 1.3,
    repsMultiplier: 0.7,
    allowStrengthExercises: false,
    allowLongSprints: false,
    gameElementsPercentage: 60,
    color: '#3B82F6',
    icon: '⚽',
  },
  U12: {
    category: 'U12',
    label: { uk: 'До 12 років', en: 'Under 12', cs: 'Do 12 let' },
    description: {
      uk: 'Техніка + базова тактика, командна гра',
      en: 'Technique + basic tactics, team play',
      cs: 'Technika + základní taktika, týmová hra',
    },
    minAge: 10,
    maxAge: 11,
    recommendedSessionDuration: 45,
    maxSessionDuration: 55,
    restMultiplier: 1.2,
    repsMultiplier: 0.85,
    allowStrengthExercises: false,
    allowLongSprints: true,
    gameElementsPercentage: 50,
    color: '#8B5CF6',
    icon: '🎯',
  },
  U14: {
    category: 'U14',
    label: { uk: 'До 14 років', en: 'Under 14', cs: 'Do 14 let' },
    description: {
      uk: 'Інтенсивніші тренування, початок силової підготовки',
      en: 'More intensive training, beginning of strength preparation',
      cs: 'Intenzivnější trénink, začátek silové přípravy',
    },
    minAge: 12,
    maxAge: 13,
    recommendedSessionDuration: 50,
    maxSessionDuration: 60,
    restMultiplier: 1.1,
    repsMultiplier: 1.0,
    allowStrengthExercises: true,
    allowLongSprints: true,
    gameElementsPercentage: 40,
    color: '#F59E0B',
    icon: '💪',
  },
  U16: {
    category: 'U16',
    label: { uk: 'До 16 років', en: 'Under 16', cs: 'Do 16 let' },
    description: {
      uk: 'Повноцінні тренування, фізична підготовка',
      en: 'Full training, physical preparation',
      cs: 'Plnohodnotný trénink, fyzická příprava',
    },
    minAge: 14,
    maxAge: 15,
    recommendedSessionDuration: 55,
    maxSessionDuration: 70,
    restMultiplier: 1.0,
    repsMultiplier: 1.0,
    allowStrengthExercises: true,
    allowLongSprints: true,
    gameElementsPercentage: 30,
    color: '#EF4444',
    icon: '🔥',
  },
  U18: {
    category: 'U18',
    label: { uk: 'До 18 років', en: 'Under 18', cs: 'Do 18 let' },
    description: {
      uk: 'Професійний підхід, підготовка до дорослого футболу',
      en: 'Professional approach, preparation for adult football',
      cs: 'Profesionální přístup, příprava na dospělý fotbal',
    },
    minAge: 16,
    maxAge: 17,
    recommendedSessionDuration: 60,
    maxSessionDuration: 80,
    restMultiplier: 1.0,
    repsMultiplier: 1.1,
    allowStrengthExercises: true,
    allowLongSprints: true,
    gameElementsPercentage: 25,
    color: '#DC2626',
    icon: '⚡',
  },
  Senior: {
    category: 'Senior',
    label: { uk: 'Дорослі', en: 'Adults', cs: 'Dospělí' },
    description: {
      uk: 'Повне навантаження без обмежень',
      en: 'Full load without restrictions',
      cs: 'Plná zátěž bez omezení',
    },
    minAge: 18,
    maxAge: 99,
    recommendedSessionDuration: 60,
    maxSessionDuration: 90,
    restMultiplier: 1.0,
    repsMultiplier: 1.2,
    allowStrengthExercises: true,
    allowLongSprints: true,
    gameElementsPercentage: 20,
    color: '#1F2937',
    icon: '🏆',
  },
};

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date | null): number | null {
  if (!birthDate) return null;
  
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get age category from birth date
 */
export function getAgeCategory(birthDate: string | Date | null): AgeCategory {
  const age = calculateAge(birthDate);
  
  if (age === null) return 'Senior';
  
  if (age <= 7) return 'U8';
  if (age <= 9) return 'U10';
  if (age <= 11) return 'U12';
  if (age <= 13) return 'U14';
  if (age <= 15) return 'U16';
  if (age <= 17) return 'U18';
  return 'Senior';
}

/**
 * Get age category info from birth date
 */
export function getAgeCategoryInfo(birthDate: string | Date | null): AgeCategoryInfo {
  const category = getAgeCategory(birthDate);
  return AGE_CATEGORIES[category];
}

/**
 * Get localized label for age category
 */
export function getAgeCategoryLabel(category: AgeCategory, language: Language): string {
  return AGE_CATEGORIES[category].label[language];
}

/**
 * Get all age categories as array
 */
export function getAllAgeCategories(): AgeCategoryInfo[] {
  return Object.values(AGE_CATEGORIES);
}

/**
 * Check if a program is suitable for user's age
 */
export function isProgramSuitableForAge(
  programAgeCategories: AgeCategory[],
  userBirthDate: string | Date | null
): boolean {
  const userCategory = getAgeCategory(userBirthDate);
  return programAgeCategories.includes(userCategory);
}

/**
 * Adjust exercise parameters based on age category
 */
export function adjustExerciseForAge(
  exercise: {
    sets?: string;
    reps?: string;
    restSeconds?: number;
    timerDuration?: number;
  },
  ageCategory: AgeCategory
): {
  sets?: string;
  reps?: string;
  restSeconds?: number;
  timerDuration?: number;
} {
  const categoryInfo = AGE_CATEGORIES[ageCategory];
  
  const adjustedExercise = { ...exercise };
  
  // Adjust rest time
  if (adjustedExercise.restSeconds) {
    adjustedExercise.restSeconds = Math.round(
      adjustedExercise.restSeconds * categoryInfo.restMultiplier
    );
  }
  
  // Adjust timer duration
  if (adjustedExercise.timerDuration) {
    adjustedExercise.timerDuration = Math.round(
      adjustedExercise.timerDuration * categoryInfo.repsMultiplier
    );
  }
  
  // Adjust sets/reps (simple parsing for common formats like "3x10")
  if (adjustedExercise.sets && categoryInfo.repsMultiplier !== 1.0) {
    const match = adjustedExercise.sets.match(/(\d+)x(\d+)/);
    if (match) {
      const sets = parseInt(match[1]);
      const reps = Math.round(parseInt(match[2]) * categoryInfo.repsMultiplier);
      adjustedExercise.sets = `${sets}x${reps}`;
    }
  }
  
  if (adjustedExercise.reps && categoryInfo.repsMultiplier !== 1.0) {
    const match = adjustedExercise.reps.match(/(\d+)/);
    if (match) {
      const reps = Math.round(parseInt(match[1]) * categoryInfo.repsMultiplier);
      adjustedExercise.reps = adjustedExercise.reps.replace(/\d+/, reps.toString());
    }
  }
  
  return adjustedExercise;
}

/**
 * Format birth date for display
 */
export function formatBirthDate(birthDate: string | Date | null, language: Language): string {
  if (!birthDate) return '';
  
  const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  return date.toLocaleDateString(
    language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );
}

/**
 * Get age display string
 */
export function formatAge(birthDate: string | Date | null, language: Language): string {
  const age = calculateAge(birthDate);
  if (age === null) return '';
  
  const labels = {
    uk: age === 1 ? 'рік' : age < 5 ? 'роки' : 'років',
    en: age === 1 ? 'year' : 'years',
    cs: age === 1 ? 'rok' : age < 5 ? 'roky' : 'let',
  };
  
  return `${age} ${labels[language]}`;
}

