import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, LocalizedText } from '@/types/database';

// Translation files
const translations = {
  uk: {
    // Common
    'common.loading': 'Завантаження...',
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.delete': 'Видалити',
    'common.edit': 'Редагувати',
    'common.back': 'Назад',
    'common.next': 'Далі',
    'common.done': 'Готово',
    'common.error': 'Помилка',
    'common.success': 'Успішно',
    'common.confirm': 'Підтвердити',
    'common.search': 'Пошук',
    'common.noResults': 'Нічого не знайдено',
    
    // Auth
    'auth.login': 'Увійти',
    'auth.register': 'Реєстрація',
    'auth.logout': 'Вийти',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Підтвердіть пароль',
    'auth.fullName': 'Повне ім\'я',
    'auth.forgotPassword': 'Забули пароль?',
    'auth.noAccount': 'Немає акаунту?',
    'auth.hasAccount': 'Вже є акаунт?',
    'auth.createAccount': 'Створити акаунт',
    'auth.loginTitle': 'Вхід в акаунт',
    'auth.registerTitle': 'Створення акаунту',
    'auth.selectRole': 'Оберіть роль',
    'auth.rolePlayer': 'Гравець',
    'auth.roleParent': 'Батько/Мати',
    'auth.roleCoach': 'Тренер',
    'auth.rolePlayerDesc': 'Тренуйся та відстежуй свій прогрес',
    'auth.roleParentDesc': 'Контролюй тренування своєї дитини',
    'auth.roleCoachDesc': 'Керуй командою та створюй програми',
    
    // Navigation
    'nav.home': 'Головна',
    'nav.training': 'Тренування',
    'nav.calendar': 'Календар',
    'nav.stats': 'Статистика',
    'nav.profile': 'Профіль',
    'nav.team': 'Команда',
    'nav.programs': 'Програми',
    
    // Training
    'training.today': 'Сьогодні',
    'training.day': 'День',
    'training.start': 'Почати тренування',
    'training.continue': 'Продовжити',
    'training.completed': 'Завершено',
    'training.locked': 'Заблоковано',
    'training.intensity.low': 'Легка',
    'training.intensity.medium': 'Середня',
    'training.intensity.high': 'Висока',
    'training.location.home': 'Вдома',
    'training.location.field': 'Поле',
    'training.location.gym': 'Зал',
    'training.duration': 'Тривалість',
    'training.focus': 'Фокус',
    'training.exercises': 'Вправи',
    'training.sets': 'Підходи',
    'training.reps': 'Повтори',
    'training.rest': 'Відпочинок',
    'training.timer': 'Таймер',
    'training.startTimer': 'Старт',
    'training.pauseTimer': 'Пауза',
    'training.resetTimer': 'Скинути',
    'training.result': 'Результат',
    'training.note': 'Підказка',
    'training.congratulations': 'Вітаємо',
    'training.dayCompleted': 'День завершено',
    'training.dayCompletedMessage': 'Ти виконав усі вправи на сьогодні!',
    'common.continue': 'Продовжити',
    
    // Stats
    'stats.xp': 'Досвід',
    'stats.level': 'Рівень',
    'stats.streak': 'Серія днів',
    'stats.totalExercises': 'Всього вправ',
    'stats.totalMinutes': 'Хвилин тренувань',
    'stats.progress': 'Прогрес',
    'stats.leaderboard': 'Рейтинг',
    'stats.achievements': 'Досягнення',
    'stats.records': 'Мої рекорди',
    
    // Team
    'team.create': 'Створити команду',
    'team.join': 'Приєднатися',
    'team.code': 'Код команди',
    'team.members': 'Учасники',
    'team.invite': 'Запросити',
    'team.leave': 'Покинути команду',
    'team.settings': 'Налаштування команди',
    
    // Profile
    'profile.settings': 'Налаштування',
    'profile.language': 'Мова',
    'profile.notifications': 'Сповіщення',
    'profile.theme': 'Тема',
    'profile.editProfile': 'Редагувати профіль',
    'profile.changePassword': 'Змінити пароль',
    
    // Programs
    'programs.my': 'Мої програми',
    'programs.public': 'Публічні програми',
    'programs.create': 'Створити програму',
    'programs.edit': 'Редагувати програму',
    'programs.assign': 'Призначити',
    'programs.difficulty.beginner': 'Початківець',
    'programs.difficulty.intermediate': 'Середній',
    'programs.difficulty.advanced': 'Просунутий',
    
    // Welcome
    'welcome.title': 'Football Trainer Pro',
    'welcome.subtitle': 'Твій шлях до футбольної майстерності',
    'welcome.getStarted': 'Почати',
    
    // Errors
    'error.generic': 'Щось пішло не так',
    'error.network': 'Помилка мережі',
    'error.invalidCredentials': 'Невірний email або пароль',
    'error.emailTaken': 'Цей email вже використовується',
    'error.weakPassword': 'Пароль занадто слабкий',
    
    // Coach Activity
    'coach.activity': 'Активність гравців',
    'coach.teamOverview': 'Огляд команди',
    'coach.playerActivity': 'Активність гравця',
    'coach.suspicious': 'Підозрілі активності',
    'coach.verification': 'Черга верифікації',
    'coach.lastActive': 'Остання активність',
    'coach.totalLogins': 'Всього входів',
    'coach.totalExercises': 'Виконано вправ',
    'coach.daysCompleted': 'Днів завершено',
    'coach.avgSession': 'Сер. сесія',
    'coach.suspiciousCount': 'Підозрілих',
    'coach.noSuspicious': 'Немає підозрілих активностей',
    'coach.verify': 'Перевірити',
    'coach.approve': 'Підтвердити',
    'coach.reject': 'Відхилити',
    'coach.expectedTime': 'Очікуваний час',
    'coach.actualTime': 'Фактичний час',
    'coach.tooFast': 'Занадто швидко',
    'coach.viewDetails': 'Детальніше',
    'coach.period7': 'За 7 днів',
    'coach.period30': 'За 30 днів',
    'coach.period90': 'За 90 днів',
    'coach.noActivity': 'Немає активності',
    'coach.exerciseStarted': 'Вправ почато',
    'coach.exerciseCompleted': 'Вправ завершено',
    'coach.login': 'Вхід',
    'coach.notes': 'Нотатки',
    'coach.addNote': 'Додати нотатку',
  },
  
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    
    // Auth
    'auth.login': 'Log In',
    'auth.register': 'Sign Up',
    'auth.logout': 'Log Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.createAccount': 'Create Account',
    'auth.loginTitle': 'Sign In',
    'auth.registerTitle': 'Create Account',
    'auth.selectRole': 'Select your role',
    'auth.rolePlayer': 'Player',
    'auth.roleParent': 'Parent',
    'auth.roleCoach': 'Coach',
    'auth.rolePlayerDesc': 'Train and track your progress',
    'auth.roleParentDesc': 'Monitor your child\'s training',
    'auth.roleCoachDesc': 'Manage team and create programs',
    
    // Navigation
    'nav.home': 'Home',
    'nav.training': 'Training',
    'nav.calendar': 'Calendar',
    'nav.stats': 'Stats',
    'nav.profile': 'Profile',
    'nav.team': 'Team',
    'nav.programs': 'Programs',
    
    // Training
    'training.today': 'Today',
    'training.day': 'Day',
    'training.start': 'Start Training',
    'training.continue': 'Continue',
    'training.completed': 'Completed',
    'training.locked': 'Locked',
    'training.intensity.low': 'Low',
    'training.intensity.medium': 'Medium',
    'training.intensity.high': 'High',
    'training.location.home': 'Home',
    'training.location.field': 'Field',
    'training.location.gym': 'Gym',
    'training.duration': 'Duration',
    'training.focus': 'Focus',
    'training.exercises': 'Exercises',
    'training.sets': 'Sets',
    'training.reps': 'Reps',
    'training.rest': 'Rest',
    'training.timer': 'Timer',
    'training.startTimer': 'Start',
    'training.pauseTimer': 'Pause',
    'training.resetTimer': 'Reset',
    'training.result': 'Result',
    'training.note': 'Tip',
    'training.congratulations': 'Congratulations',
    'training.dayCompleted': 'Day completed',
    'training.dayCompletedMessage': 'You completed all exercises for today!',
    'common.continue': 'Continue',
    
    // Stats
    'stats.xp': 'Experience',
    'stats.level': 'Level',
    'stats.streak': 'Day Streak',
    'stats.totalExercises': 'Total Exercises',
    'stats.totalMinutes': 'Training Minutes',
    'stats.progress': 'Progress',
    'stats.leaderboard': 'Leaderboard',
    'stats.achievements': 'Achievements',
    'stats.records': 'My Records',
    
    // Team
    'team.create': 'Create Team',
    'team.join': 'Join Team',
    'team.code': 'Team Code',
    'team.members': 'Members',
    'team.invite': 'Invite',
    'team.leave': 'Leave Team',
    'team.settings': 'Team Settings',
    
    // Profile
    'profile.settings': 'Settings',
    'profile.language': 'Language',
    'profile.notifications': 'Notifications',
    'profile.theme': 'Theme',
    'profile.editProfile': 'Edit Profile',
    'profile.changePassword': 'Change Password',
    
    // Programs
    'programs.my': 'My Programs',
    'programs.public': 'Public Programs',
    'programs.create': 'Create Program',
    'programs.edit': 'Edit Program',
    'programs.assign': 'Assign',
    'programs.difficulty.beginner': 'Beginner',
    'programs.difficulty.intermediate': 'Intermediate',
    'programs.difficulty.advanced': 'Advanced',
    
    // Welcome
    'welcome.title': 'Football Trainer Pro',
    'welcome.subtitle': 'Your path to football mastery',
    'welcome.getStarted': 'Get Started',
    
    // Errors
    'error.generic': 'Something went wrong',
    'error.network': 'Network error',
    'error.invalidCredentials': 'Invalid email or password',
    'error.emailTaken': 'This email is already in use',
    'error.weakPassword': 'Password is too weak',
    
    // Coach Activity
    'coach.activity': 'Player Activity',
    'coach.teamOverview': 'Team Overview',
    'coach.playerActivity': 'Player Activity',
    'coach.suspicious': 'Suspicious Activities',
    'coach.verification': 'Verification Queue',
    'coach.lastActive': 'Last Active',
    'coach.totalLogins': 'Total Logins',
    'coach.totalExercises': 'Exercises Done',
    'coach.daysCompleted': 'Days Completed',
    'coach.avgSession': 'Avg Session',
    'coach.suspiciousCount': 'Suspicious',
    'coach.noSuspicious': 'No suspicious activities',
    'coach.verify': 'Verify',
    'coach.approve': 'Approve',
    'coach.reject': 'Reject',
    'coach.expectedTime': 'Expected Time',
    'coach.actualTime': 'Actual Time',
    'coach.tooFast': 'Too Fast',
    'coach.viewDetails': 'View Details',
    'coach.period7': 'Last 7 days',
    'coach.period30': 'Last 30 days',
    'coach.period90': 'Last 90 days',
    'coach.noActivity': 'No activity',
    'coach.exerciseStarted': 'Exercises Started',
    'coach.exerciseCompleted': 'Exercises Completed',
    'coach.login': 'Login',
    'coach.notes': 'Notes',
    'coach.addNote': 'Add Note',
  },
  
  cs: {
    // Common
    'common.loading': 'Načítání...',
    'common.save': 'Uložit',
    'common.cancel': 'Zrušit',
    'common.delete': 'Smazat',
    'common.edit': 'Upravit',
    'common.back': 'Zpět',
    'common.next': 'Další',
    'common.done': 'Hotovo',
    'common.error': 'Chyba',
    'common.success': 'Úspěch',
    'common.confirm': 'Potvrdit',
    'common.search': 'Hledat',
    'common.noResults': 'Nic nenalezeno',
    
    // Auth
    'auth.login': 'Přihlásit se',
    'auth.register': 'Registrace',
    'auth.logout': 'Odhlásit se',
    'auth.email': 'Email',
    'auth.password': 'Heslo',
    'auth.confirmPassword': 'Potvrďte heslo',
    'auth.fullName': 'Celé jméno',
    'auth.forgotPassword': 'Zapomněli jste heslo?',
    'auth.noAccount': 'Nemáte účet?',
    'auth.hasAccount': 'Již máte účet?',
    'auth.createAccount': 'Vytvořit účet',
    'auth.loginTitle': 'Přihlášení',
    'auth.registerTitle': 'Vytvoření účtu',
    'auth.selectRole': 'Vyberte svou roli',
    'auth.rolePlayer': 'Hráč',
    'auth.roleParent': 'Rodič',
    'auth.roleCoach': 'Trenér',
    'auth.rolePlayerDesc': 'Trénuj a sleduj svůj pokrok',
    'auth.roleParentDesc': 'Sleduj trénink svého dítěte',
    'auth.roleCoachDesc': 'Spravuj tým a vytvářej programy',
    
    // Navigation
    'nav.home': 'Domů',
    'nav.training': 'Trénink',
    'nav.calendar': 'Kalendář',
    'nav.stats': 'Statistiky',
    'nav.profile': 'Profil',
    'nav.team': 'Tým',
    'nav.programs': 'Programy',
    
    // Training
    'training.today': 'Dnes',
    'training.day': 'Den',
    'training.start': 'Začít trénink',
    'training.continue': 'Pokračovat',
    'training.completed': 'Dokončeno',
    'training.locked': 'Zamčeno',
    'training.intensity.low': 'Nízká',
    'training.intensity.medium': 'Střední',
    'training.intensity.high': 'Vysoká',
    'training.location.home': 'Doma',
    'training.location.field': 'Hřiště',
    'training.location.gym': 'Posilovna',
    'training.duration': 'Délka',
    'training.focus': 'Zaměření',
    'training.exercises': 'Cviky',
    'training.sets': 'Série',
    'training.reps': 'Opakování',
    'training.rest': 'Odpočinek',
    'training.timer': 'Časovač',
    'training.startTimer': 'Start',
    'training.pauseTimer': 'Pauza',
    'training.resetTimer': 'Reset',
    'training.result': 'Výsledek',
    'training.note': 'Tip',
    'training.congratulations': 'Gratulujeme',
    'training.dayCompleted': 'Den dokončen',
    'training.dayCompletedMessage': 'Dokončil jsi všechny cviky na dnešek!',
    'common.continue': 'Pokračovat',
    
    // Stats
    'stats.xp': 'Zkušenosti',
    'stats.level': 'Úroveň',
    'stats.streak': 'Série dnů',
    'stats.totalExercises': 'Celkem cviků',
    'stats.totalMinutes': 'Minut tréninku',
    'stats.progress': 'Pokrok',
    'stats.leaderboard': 'Žebříček',
    'stats.achievements': 'Úspěchy',
    'stats.records': 'Moje rekordy',
    
    // Team
    'team.create': 'Vytvořit tým',
    'team.join': 'Připojit se',
    'team.code': 'Kód týmu',
    'team.members': 'Členové',
    'team.invite': 'Pozvat',
    'team.leave': 'Opustit tým',
    'team.settings': 'Nastavení týmu',
    
    // Profile
    'profile.settings': 'Nastavení',
    'profile.language': 'Jazyk',
    'profile.notifications': 'Oznámení',
    'profile.theme': 'Téma',
    'profile.editProfile': 'Upravit profil',
    'profile.changePassword': 'Změnit heslo',
    
    // Programs
    'programs.my': 'Moje programy',
    'programs.public': 'Veřejné programy',
    'programs.create': 'Vytvořit program',
    'programs.edit': 'Upravit program',
    'programs.assign': 'Přiřadit',
    'programs.difficulty.beginner': 'Začátečník',
    'programs.difficulty.intermediate': 'Pokročilý',
    'programs.difficulty.advanced': 'Expert',
    
    // Welcome
    'welcome.title': 'Football Trainer Pro',
    'welcome.subtitle': 'Tvá cesta k fotbalové dokonalosti',
    'welcome.getStarted': 'Začít',
    
    // Errors
    'error.generic': 'Něco se pokazilo',
    'error.network': 'Chyba sítě',
    'error.invalidCredentials': 'Neplatný email nebo heslo',
    'error.emailTaken': 'Tento email je již používán',
    'error.weakPassword': 'Heslo je příliš slabé',
    
    // Coach Activity
    'coach.activity': 'Aktivita hráčů',
    'coach.teamOverview': 'Přehled týmu',
    'coach.playerActivity': 'Aktivita hráče',
    'coach.suspicious': 'Podezřelé aktivity',
    'coach.verification': 'Fronta ověření',
    'coach.lastActive': 'Poslední aktivita',
    'coach.totalLogins': 'Celkem přihlášení',
    'coach.totalExercises': 'Cvičení dokončeno',
    'coach.daysCompleted': 'Dnů dokončeno',
    'coach.avgSession': 'Prům. relace',
    'coach.suspiciousCount': 'Podezřelých',
    'coach.noSuspicious': 'Žádné podezřelé aktivity',
    'coach.verify': 'Ověřit',
    'coach.approve': 'Schválit',
    'coach.reject': 'Odmítnout',
    'coach.expectedTime': 'Očekávaný čas',
    'coach.actualTime': 'Skutečný čas',
    'coach.tooFast': 'Příliš rychle',
    'coach.viewDetails': 'Zobrazit detaily',
    'coach.period7': 'Za 7 dní',
    'coach.period30': 'Za 30 dní',
    'coach.period90': 'Za 90 dní',
    'coach.noActivity': 'Žádná aktivita',
    'coach.exerciseStarted': 'Cvičení zahájeno',
    'coach.exerciseCompleted': 'Cvičení dokončeno',
    'coach.login': 'Přihlášení',
    'coach.notes': 'Poznámky',
    'coach.addNote': 'Přidat poznámku',
  },
} as const;

type TranslationKey = keyof typeof translations.uk;

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  getLocalizedText: (text: LocalizedText | null | undefined) => string;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      language: 'uk',
      
      setLanguage: (lang: Language) => set({ language: lang }),
      
      t: (key: TranslationKey) => {
        const { language } = get();
        return translations[language][key] || translations.uk[key] || key;
      },
      
      getLocalizedText: (text: LocalizedText | null | undefined) => {
        if (!text) return '';
        const { language } = get();
        return text[language] || text.uk || text.en || '';
      },
    }),
    {
      name: 'football-trainer-language',
    }
  )
);

// Helper hook for components
export const useTranslation = () => {
  const { t, getLocalizedText, language, setLanguage } = useI18n();
  return { t, getLocalizedText, language, setLanguage };
};

// Language options for select
export const languageOptions = [
  { value: 'uk', label: 'Українська', flag: '🇺🇦' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'cs', label: 'Čeština', flag: '🇨🇿' },
] as const;

