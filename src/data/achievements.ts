// Achievement definitions
export interface Achievement {
  id: string;
  title: {
    uk: string;
    en: string;
    cs: string;
  };
  description: {
    uk: string;
    en: string;
    cs: string;
  };
  icon: string;
  conditionType: 'exercises_count' | 'streak' | 'xp' | 'days_completed' | 'first_exercise' | 'first_day';
  conditionValue: number;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const achievements: Achievement[] = [
  // First steps
  {
    id: 'first-exercise',
    title: { uk: 'Перший крок', en: 'First Step', cs: 'První krok' },
    description: { uk: 'Виконай першу вправу', en: 'Complete your first exercise', cs: 'Dokonči svůj první cvik' },
    icon: '🎯',
    conditionType: 'first_exercise',
    conditionValue: 1,
    xpReward: 10,
    rarity: 'common'
  },
  {
    id: 'first-day',
    title: { uk: 'Перший день', en: 'First Day', cs: 'První den' },
    description: { uk: 'Заверши перший день тренувань', en: 'Complete your first training day', cs: 'Dokonči svůj první tréninkový den' },
    icon: '📅',
    conditionType: 'first_day',
    conditionValue: 1,
    xpReward: 25,
    rarity: 'common'
  },

  // Exercise milestones
  {
    id: 'exercises-10',
    title: { uk: 'Початківець', en: 'Beginner', cs: 'Začátečník' },
    description: { uk: 'Виконай 10 вправ', en: 'Complete 10 exercises', cs: 'Dokonči 10 cviků' },
    icon: '⭐',
    conditionType: 'exercises_count',
    conditionValue: 10,
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'exercises-50',
    title: { uk: 'Наполегливий', en: 'Persistent', cs: 'Vytrvalý' },
    description: { uk: 'Виконай 50 вправ', en: 'Complete 50 exercises', cs: 'Dokonči 50 cviků' },
    icon: '💪',
    conditionType: 'exercises_count',
    conditionValue: 50,
    xpReward: 100,
    rarity: 'rare'
  },
  {
    id: 'exercises-100',
    title: { uk: 'Сотня', en: 'Century', cs: 'Stovka' },
    description: { uk: 'Виконай 100 вправ', en: 'Complete 100 exercises', cs: 'Dokonči 100 cviků' },
    icon: '💯',
    conditionType: 'exercises_count',
    conditionValue: 100,
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'exercises-500',
    title: { uk: 'Машина', en: 'Machine', cs: 'Stroj' },
    description: { uk: 'Виконай 500 вправ', en: 'Complete 500 exercises', cs: 'Dokonči 500 cviků' },
    icon: '🤖',
    conditionType: 'exercises_count',
    conditionValue: 500,
    xpReward: 500,
    rarity: 'epic'
  },

  // Streak achievements
  {
    id: 'streak-3',
    title: { uk: 'Серія 3 дні', en: '3 Day Streak', cs: '3denní série' },
    description: { uk: 'Тренуйся 3 дні поспіль', en: 'Train for 3 days in a row', cs: 'Trénuj 3 dny po sobě' },
    icon: '🔥',
    conditionType: 'streak',
    conditionValue: 3,
    xpReward: 30,
    rarity: 'common'
  },
  {
    id: 'streak-7',
    title: { uk: 'Тиждень сили', en: 'Power Week', cs: 'Silový týden' },
    description: { uk: 'Тренуйся 7 днів поспіль', en: 'Train for 7 days in a row', cs: 'Trénuj 7 dní po sobě' },
    icon: '🔥🔥',
    conditionType: 'streak',
    conditionValue: 7,
    xpReward: 70,
    rarity: 'rare'
  },
  {
    id: 'streak-14',
    title: { uk: 'Два тижні', en: 'Two Weeks', cs: 'Dva týdny' },
    description: { uk: 'Тренуйся 14 днів поспіль', en: 'Train for 14 days in a row', cs: 'Trénuj 14 dní po sobě' },
    icon: '⚡',
    conditionType: 'streak',
    conditionValue: 14,
    xpReward: 150,
    rarity: 'rare'
  },
  {
    id: 'streak-30',
    title: { uk: 'Місяць чемпіона', en: 'Champion Month', cs: 'Měsíc šampiona' },
    description: { uk: 'Тренуйся 30 днів поспіль', en: 'Train for 30 days in a row', cs: 'Trénuj 30 dní po sobě' },
    icon: '🏆',
    conditionType: 'streak',
    conditionValue: 30,
    xpReward: 300,
    rarity: 'legendary'
  },

  // Days completed
  {
    id: 'days-5',
    title: { uk: '5 днів', en: '5 Days', cs: '5 dní' },
    description: { uk: 'Заверши 5 днів програми', en: 'Complete 5 program days', cs: 'Dokonči 5 dní programu' },
    icon: '📆',
    conditionType: 'days_completed',
    conditionValue: 5,
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'days-10',
    title: { uk: '10 днів', en: '10 Days', cs: '10 dní' },
    description: { uk: 'Заверши 10 днів програми', en: 'Complete 10 program days', cs: 'Dokonči 10 dní programu' },
    icon: '🗓️',
    conditionType: 'days_completed',
    conditionValue: 10,
    xpReward: 100,
    rarity: 'rare'
  },
  {
    id: 'days-20',
    title: { uk: '20 днів', en: '20 Days', cs: '20 dní' },
    description: { uk: 'Заверши 20 днів програми', en: 'Complete 20 program days', cs: 'Dokonči 20 dní programu' },
    icon: '📊',
    conditionType: 'days_completed',
    conditionValue: 20,
    xpReward: 200,
    rarity: 'epic'
  },
  {
    id: 'days-30',
    title: { uk: 'Програма завершена!', en: 'Program Complete!', cs: 'Program dokončen!' },
    description: { uk: 'Заверши всі 30 днів програми', en: 'Complete all 30 program days', cs: 'Dokonči všech 30 dní programu' },
    icon: '🎓',
    conditionType: 'days_completed',
    conditionValue: 30,
    xpReward: 500,
    rarity: 'legendary'
  },

  // XP milestones
  {
    id: 'xp-100',
    title: { uk: '100 XP', en: '100 XP', cs: '100 XP' },
    description: { uk: 'Набери 100 очок досвіду', en: 'Earn 100 experience points', cs: 'Získej 100 bodů zkušeností' },
    icon: '✨',
    conditionType: 'xp',
    conditionValue: 100,
    xpReward: 20,
    rarity: 'common'
  },
  {
    id: 'xp-500',
    title: { uk: '500 XP', en: '500 XP', cs: '500 XP' },
    description: { uk: 'Набери 500 очок досвіду', en: 'Earn 500 experience points', cs: 'Získej 500 bodů zkušeností' },
    icon: '🌟',
    conditionType: 'xp',
    conditionValue: 500,
    xpReward: 50,
    rarity: 'rare'
  },
  {
    id: 'xp-1000',
    title: { uk: '1000 XP', en: '1000 XP', cs: '1000 XP' },
    description: { uk: 'Набери 1000 очок досвіду', en: 'Earn 1000 experience points', cs: 'Získej 1000 bodů zkušeností' },
    icon: '💎',
    conditionType: 'xp',
    conditionValue: 1000,
    xpReward: 100,
    rarity: 'epic'
  },
  {
    id: 'xp-5000',
    title: { uk: 'Легенда', en: 'Legend', cs: 'Legenda' },
    description: { uk: 'Набери 5000 очок досвіду', en: 'Earn 5000 experience points', cs: 'Získej 5000 bodů zkušeností' },
    icon: '👑',
    conditionType: 'xp',
    conditionValue: 5000,
    xpReward: 500,
    rarity: 'legendary'
  },
];

// Get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(a => a.id === id);
};

// Get rarity color
export const getRarityColor = (rarity: Achievement['rarity']): string => {
  const colors = {
    common: 'bg-gray-100 border-gray-300 text-gray-700',
    rare: 'bg-blue-100 border-blue-300 text-blue-700',
    epic: 'bg-purple-100 border-purple-300 text-purple-700',
    legendary: 'bg-amber-100 border-amber-300 text-amber-700',
  };
  return colors[rarity];
};

export const getRarityGradient = (rarity: Achievement['rarity']): string => {
  const gradients = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-orange-500',
  };
  return gradients[rarity];
};

