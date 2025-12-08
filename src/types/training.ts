// Training Types - Multi-program support

export type Intensity = 'low' | 'medium' | 'high';
export type Location = 'home' | 'field' | 'gym';
export type ExerciseType = 'checkbox' | 'input' | 'timer';
export type ProgramCategory = 'explosiveness' | 'endurance' | 'technique' | 'strength' | 'agility' | 'recovery';
export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LocalizedText {
  uk: string;
  en: string;
  cs: string;
}

export interface LocalizedArray {
  uk: string[];
  en: string[];
  cs: string[];
}

export interface Exercise {
  id: string;
  title: LocalizedText;
  description?: LocalizedArray;
  sets?: LocalizedText;
  reps?: LocalizedText;
  restSeconds?: number;
  type: ExerciseType;
  inputLabel?: LocalizedText;
  note?: LocalizedText;
  timerDuration?: number;
}

export interface Section {
  id: string;
  title: LocalizedText;
  durationMinutes?: number;
  exercises: Exercise[];
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  title: LocalizedText;
  intensity: Intensity;
  location: Location;
  durationMinutes: number;
  focus: LocalizedText;
  sections: Section[];
}

export interface TrainingProgram {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  category: ProgramCategory;
  difficulty: ProgramDifficulty;
  durationDays: number;
  icon: string; // emoji or icon name
  color: string; // tailwind color class
  coverImage?: string;
  days: TrainingDay[];
  isPublic: boolean;
  createdBy?: string; // coach id
  createdAt?: string;
}

// Category metadata for UI
export const categoryInfo: Record<ProgramCategory, { 
  icon: string; 
  color: string;
  label: LocalizedText;
  image: string;
}> = {
  explosiveness: {
    icon: '⚡',
    color: 'amber',
    label: { uk: 'Вибуховість', en: 'Explosiveness', cs: 'Výbušnost' },
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' // Sprint/explosive training
  },
  endurance: {
    icon: '🏃',
    color: 'green',
    label: { uk: 'Витривалість', en: 'Endurance', cs: 'Vytrvalost' },
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' // Running/cardio
  },
  technique: {
    icon: '⚽',
    color: 'blue',
    label: { uk: 'Техніка', en: 'Technique', cs: 'Technika' },
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80' // Football/soccer ball
  },
  strength: {
    icon: '💪',
    color: 'red',
    label: { uk: 'Сила', en: 'Strength', cs: 'Síla' },
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' // Gym/weights
  },
  agility: {
    icon: '🎯',
    color: 'purple',
    label: { uk: 'Спритність', en: 'Agility', cs: 'Obratnost' },
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' // Agility training
  },
  recovery: {
    icon: '🧘',
    color: 'teal',
    label: { uk: 'Відновлення', en: 'Recovery', cs: 'Regenerace' },
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' // Yoga/stretching
  }
};

export const difficultyInfo: Record<ProgramDifficulty, {
  label: LocalizedText;
  color: string;
}> = {
  beginner: {
    label: { uk: 'Початківець', en: 'Beginner', cs: 'Začátečník' },
    color: 'green'
  },
  intermediate: {
    label: { uk: 'Середній', en: 'Intermediate', cs: 'Střední' },
    color: 'amber'
  },
  advanced: {
    label: { uk: 'Просунутий', en: 'Advanced', cs: 'Pokročilý' },
    color: 'red'
  }
};

