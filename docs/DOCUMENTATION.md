# Football Trainer Pro - Технічна документація

## Зміст

1. [Огляд проєкту](#огляд-проєкту)
2. [Архітектура](#архітектура)
3. [Технологічний стек](#технологічний-стек)
4. [Структура бази даних](#структура-бази-даних)
5. [Ролі користувачів](#ролі-користувачів)
6. [Основні модулі](#основні-модулі)
7. [API та інтеграції](#api-та-інтеграції)
8. [Процеси та потоки даних](#процеси-та-потоки-даних)
9. [Безпека](#безпека)
10. [Розгортання](#розгортання)

---

## Огляд проєкту

**Football Trainer Pro** - це прогресивний веб-додаток (PWA) для футбольних тренувань, який дозволяє:
- Гравцям виконувати тренувальні програми та відстежувати прогрес
- Тренерам керувати командами та моніторити активність гравців
- Адміністраторам створювати та керувати тренувальними програмами

### Ключові можливості:
- 📱 PWA з офлайн-підтримкою
- 🌍 Мультимовність (українська, англійська, чеська)
- 👥 Система команд та ролей
- 📊 Детальна статистика та аналітика
- 🏆 Система досягнень та XP
- 🔔 Push-сповіщення
- 📈 Логування активності гравців
- ⌚ Інтеграція з фітнес-трекерами

---

## Архітектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│  Components  │  Pages  │  Stores (Zustand)  │  Hooks  │  Utils  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Backend                            │
├─────────────────────────────────────────────────────────────────┤
│  Auth  │  Database (PostgreSQL)  │  Storage  │  Edge Functions  │
└─────────────────────────────────────────────────────────────────┘
```

### Структура проєкту:

```
football-trainer-app/
├── src/
│   ├── components/          # React компоненти
│   │   ├── ui/              # Базові UI компоненти
│   │   ├── layout/          # Компоненти макету
│   │   ├── training/        # Компоненти тренувань
│   │   ├── achievements/    # Компоненти досягнень
│   │   └── settings/        # Компоненти налаштувань
│   ├── pages/               # Сторінки додатку
│   │   ├── admin/           # Адмін-панель
│   │   └── coach/           # Панель тренера
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Кастомні хуки
│   ├── lib/                 # Утиліти та сервіси
│   ├── types/               # TypeScript типи
│   └── styles/              # Глобальні стилі
├── public/                  # Статичні файли
├── supabase/                # SQL скрипти
│   └── functions/           # Edge Functions
└── docs/                    # Документація
```

---

## Технологічний стек

### Frontend:
| Технологія | Версія | Призначення |
|------------|--------|-------------|
| React | 18.x | UI фреймворк |
| TypeScript | 5.x | Типізація |
| Vite | 5.x | Збірка та dev-сервер |
| Tailwind CSS | 3.x | Стилізація |
| Zustand | 4.x | State management |
| React Router | 6.x | Маршрутизація |
| Motion (Framer) | 11.x | Анімації |
| Recharts | 2.x | Графіки та діаграми |
| Radix UI | - | Accessible UI компоненти |

### Backend (Supabase):
| Сервіс | Призначення |
|--------|-------------|
| PostgreSQL | База даних |
| Auth | Автентифікація |
| Storage | Зберігання файлів (аватари) |
| Edge Functions | Серверна логіка (push, cron) |
| Realtime | Real-time підписки |

### PWA:
| Технологія | Призначення |
|------------|-------------|
| vite-plugin-pwa | Генерація SW та manifest |
| IndexedDB | Офлайн сховище |
| Web Push API | Push-сповіщення |

---

## Структура бази даних

### ER-діаграма (основні таблиці):

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │────<│ team_members │>────│    teams     │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌──────────────┐                         ┌──────────────┐
│ player_stats │                         │team_programs │
└──────────────┘                         └──────────────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│player_progress│    │player_programs│    │   programs   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                           ┌─────────────────────┼─────────────────────┐
                           ▼                     ▼                     ▼
                    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                    │ program_days │     │ day_sections │     │  exercises   │
                    └──────────────┘     └──────────────┘     └──────────────┘
```

### Таблиці:

#### 1. Користувачі та профілі

**`profiles`** - Профілі користувачів
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | ID користувача (= auth.uid) |
| email | TEXT | Email |
| full_name | TEXT | Повне ім'я |
| avatar_url | TEXT | URL аватара |
| role | TEXT | Роль: player, parent, coach |
| language | TEXT | Мова: uk, en, cs |
| show_in_leaderboard | BOOLEAN | Показувати в рейтингу |
| created_at | TIMESTAMPTZ | Дата створення |
| updated_at | TIMESTAMPTZ | Дата оновлення |

**`player_stats`** - Статистика гравців
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| total_xp | INTEGER | Загальний XP |
| level | INTEGER | Рівень |
| total_exercises | INTEGER | Всього вправ |
| current_streak | INTEGER | Поточна серія днів |
| best_streak | INTEGER | Найкраща серія |
| last_training_date | DATE | Дата останнього тренування |

**`admin_users`** - Адміністратори
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | ID користувача |
| created_at | TIMESTAMPTZ | Дата призначення |

#### 2. Команди

**`teams`** - Команди
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| name | TEXT | Назва команди |
| coach_id | UUID (FK → profiles) | ID тренера |
| invite_code | TEXT | Код запрошення |
| created_at | TIMESTAMPTZ | Дата створення |

**`team_members`** - Члени команд
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| team_id | UUID (FK → teams) | ID команди |
| player_id | UUID (FK → profiles) | ID гравця |
| joined_at | TIMESTAMPTZ | Дата приєднання |

#### 3. Програми тренувань

**`programs`** - Тренувальні програми
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| title_uk, title_en, title_cs | TEXT | Назва (локалізована) |
| description_uk, description_en, description_cs | TEXT | Опис |
| category | TEXT | Категорія: explosiveness, endurance, technique, strength |
| difficulty | TEXT | Складність: beginner, intermediate, advanced |
| duration_days | INTEGER | Тривалість у днях |
| cover_image | TEXT | URL обкладинки |
| color | TEXT | Колір теми |
| is_public | BOOLEAN | Публічна програма |
| is_premium | BOOLEAN | Преміум контент |
| price_usd | DECIMAL | Ціна (для преміум) |
| created_by | UUID (FK → profiles) | Автор |
| created_at | TIMESTAMPTZ | Дата створення |

**`program_days`** - Дні програми
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| program_id | UUID (FK → programs) | ID програми |
| day_number | INTEGER | Номер дня |
| title_uk, title_en, title_cs | TEXT | Назва дня |
| focus_uk, focus_en, focus_cs | TEXT | Фокус тренування |
| intensity | TEXT | Інтенсивність: low, medium, high |
| duration_minutes | INTEGER | Тривалість у хвилинах |
| location | TEXT | Локація: home, field, gym |

**`day_sections`** - Секції дня
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| day_id | UUID (FK → program_days) | ID дня |
| title_uk, title_en, title_cs | TEXT | Назва секції |
| order_index | INTEGER | Порядок |
| duration_minutes | INTEGER | Тривалість |

**`exercises`** - Вправи
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| section_id | UUID (FK → day_sections) | ID секції |
| title_uk, title_en, title_cs | TEXT | Назва вправи |
| description_uk, description_en, description_cs | TEXT[] | Кроки виконання |
| sets_uk, sets_en, sets_cs | TEXT | Підходи |
| reps_uk, reps_en, reps_cs | TEXT | Повтори |
| rest_seconds | INTEGER | Відпочинок (сек) |
| exercise_type | TEXT | Тип: checkbox, input, timer |
| timer_duration | INTEGER | Тривалість таймера |
| input_label_uk, input_label_en, input_label_cs | TEXT | Мітка поля вводу |
| note_uk, note_en, note_cs | TEXT | Підказка |
| order_index | INTEGER | Порядок |

#### 4. Прогрес гравців

**`player_programs`** - Програми гравців
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| program_id | UUID (FK → programs) | ID програми |
| started_at | TIMESTAMPTZ | Дата початку |
| source | TEXT | Джерело: individual, team |
| team_id | UUID (FK → teams) | ID команди (якщо team) |

**`player_progress_v2`** - Прогрес по вправах
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| day_id | TEXT | Ключ дня (programId-day-N) |
| exercise_id | TEXT | ID вправи |
| is_completed | BOOLEAN | Виконано |
| measurement_value | TEXT | Значення вимірювання |
| xp_earned | INTEGER | Зароблений XP |
| completed_at | TIMESTAMPTZ | Час виконання |

**`player_day_completions`** - Завершені дні
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| day_id | TEXT | Ключ дня |
| bonus_xp | INTEGER | Бонусний XP |
| completed_at | TIMESTAMPTZ | Час завершення |

#### 5. Досягнення

**`player_achievements`** - Досягнення гравців
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| achievement_id | TEXT | ID досягнення |
| earned_at | TIMESTAMPTZ | Час отримання |
| notified | BOOLEAN | Сповіщено |

#### 6. Логування активності

**`player_activity_log`** - Журнал активності
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| activity_type | TEXT | Тип: login, exercise_complete, day_complete, etc. |
| program_id | UUID | ID програми |
| day_key | TEXT | Ключ дня |
| exercise_id | TEXT | ID вправи |
| metadata | JSONB | Додаткові дані |
| device_type | TEXT | Тип пристрою |
| user_agent | TEXT | User Agent |
| created_at | TIMESTAMPTZ | Час події |

**`player_sessions`** - Сесії гравців
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| session_start | TIMESTAMPTZ | Початок сесії |
| session_end | TIMESTAMPTZ | Кінець сесії |
| duration_seconds | INTEGER | Тривалість |
| pages_visited | INTEGER | Переглянуто сторінок |
| exercises_completed | INTEGER | Виконано вправ |
| is_active | BOOLEAN | Активна сесія |
| device_type | TEXT | Тип пристрою |

**`exercise_timing`** - Час виконання вправ
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| exercise_id | TEXT | ID вправи |
| day_key | TEXT | Ключ дня |
| started_at | TIMESTAMPTZ | Час початку |
| completed_at | TIMESTAMPTZ | Час завершення |
| expected_duration_seconds | INTEGER | Очікувана тривалість |
| actual_duration_seconds | INTEGER | Фактична тривалість |
| is_suspicious | BOOLEAN | Підозріла активність |
| verification_status | TEXT | Статус: pending, verified, flagged |
| coach_notes | TEXT | Нотатки тренера |

**`player_daily_summary`** - Щоденна зведена статистика
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| player_id | UUID (FK → profiles) | ID гравця |
| date | DATE | Дата |
| login_count | INTEGER | Кількість входів |
| exercises_completed | INTEGER | Виконано вправ |
| days_completed | INTEGER | Завершено днів |
| xp_earned | INTEGER | Зароблено XP |
| suspicious_activities | INTEGER | Підозрілих активностей |
| total_active_minutes | INTEGER | Активних хвилин |

#### 7. Push-сповіщення

**`push_subscriptions`** - Підписки на push
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | ID користувача |
| endpoint | TEXT | Push endpoint |
| p256dh | TEXT | Ключ шифрування |
| auth | TEXT | Auth ключ |
| created_at | TIMESTAMPTZ | Дата підписки |

**`notification_preferences`** - Налаштування сповіщень
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | ID користувача |
| training_reminders | BOOLEAN | Нагадування про тренування |
| reminder_time | TIME | Час нагадування |
| streak_warnings | BOOLEAN | Попередження про серію |
| achievements | BOOLEAN | Досягнення |
| team_updates | BOOLEAN | Оновлення команди |
| coach_messages | BOOLEAN | Повідомлення тренера |

#### 8. Фітнес-трекери

**`workout_sessions`** - Тренувальні сесії
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | ID користувача |
| started_at | TIMESTAMPTZ | Початок |
| ended_at | TIMESTAMPTZ | Кінець |
| duration_seconds | INTEGER | Тривалість |
| steps | INTEGER | Кроки |
| distance_meters | DECIMAL | Дистанція |
| calories_burned | INTEGER | Калорії |
| avg_heart_rate | INTEGER | Середній пульс |
| max_heart_rate | INTEGER | Максимальний пульс |
| gps_track | JSONB | GPS трек |

**`daily_fitness_data`** - Щоденні фітнес-дані
| Поле | Тип | Опис |
|------|-----|------|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | ID користувача |
| date | DATE | Дата |
| steps | INTEGER | Кроки |
| distance_meters | DECIMAL | Дистанція |
| calories_burned | INTEGER | Калорії |
| active_minutes | INTEGER | Активних хвилин |
| sleep_hours | DECIMAL | Годин сну |
| resting_heart_rate | INTEGER | Пульс у спокої |
| source | TEXT | Джерело даних |

---

## Ролі користувачів

### 1. Гравець (player)
**Можливості:**
- Переглядати та виконувати тренувальні програми
- Відстежувати власний прогрес
- Отримувати досягнення та XP
- Приєднуватися до команд
- Налаштовувати профіль та приватність
- Бачити рейтинг команди (якщо дозволено)

**Обмеження:**
- Не може створювати програми
- Не може керувати командами
- Бачить тільки публічні або призначені програми

### 2. Тренер (coach)
**Можливості:**
- Все що може гравець
- Створювати та керувати командами
- Призначати програми командам
- Переглядати статистику гравців команди
- Верифікувати активність гравців
- Подавати запити на нові програми

**Обмеження:**
- Не може створювати програми (тільки запити)
- Бачить тільки свої команди

### 3. Адміністратор (admin)
**Можливості:**
- Все що може тренер
- Створювати та редагувати програми
- Керувати всіма користувачами
- Переглядати всю статистику

---

## Основні модулі

### 1. Модуль автентифікації (`authStore`)

```typescript
// Стан
interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Методи
initialize()      // Ініціалізація при старті
signIn(email, password)
signUp(email, password, fullName, role)
signOut()
updateProfile(updates)
refreshProfile()
```

**Процес автентифікації:**
```
1. Користувач вводить email/пароль
2. Supabase Auth перевіряє credentials
3. При успіху - створюється сесія
4. Завантажується профіль з profiles
5. Логується активність (login)
6. Стартує сесія в player_sessions
```

### 2. Модуль програм (`programStore`)

```typescript
// Стан
interface ProgramState {
  programs: Program[];
  currentProgram: Program | null;
  currentDays: ProgramDay[];
  currentSections: Record<string, DaySection[]>;
  currentExercises: Record<string, Exercise[]>;
  isAdmin: boolean;
}

// Методи
loadPrograms()
loadProgramDetails(programId)
createProgram(data)  // Admin only
updateProgram(id, data)
deleteProgram(id)
createDay(programId, data)
createSection(dayId, data)
createExercise(sectionId, data)
checkAdminStatus(userId)
```

### 3. Модуль прогресу (`progressStore`)

```typescript
// Стан
interface ProgressState {
  progress: Record<string, DayProgress>;
  completedDays: Record<string, boolean>;
  isLoading: boolean;
}

// Методи
loadDayProgress(playerId, dayId)
loadCompletedDays(playerId)
toggleExercise(playerId, dayId, exerciseId, xp)
saveMeasurement(playerId, dayId, exerciseId, value)
completeDay(playerId, dayId, bonusXp)
updateStats(playerId, xpDelta, exercisesDelta)
checkAchievements(playerId)
```

**Процес виконання вправи:**
```
1. Гравець відкриває вправу → startExerciseTimer()
2. Гравець натискає "Виконано" → toggleExercise()
3. Перевіряється час виконання → completeExerciseTimer()
4. Якщо час < 30% очікуваного → is_suspicious = true
5. Оновлюється прогрес в БД
6. Оновлюється статистика
7. Перевіряються досягнення
8. Логується активність
```

### 4. Модуль досягнень (`achievementStore`)

```typescript
// Визначені досягнення
const ACHIEVEMENTS = [
  { id: 'first-exercise', xpReward: 50 },
  { id: 'first-day', xpReward: 100 },
  { id: 'exercises-10', xpReward: 100 },
  { id: 'exercises-50', xpReward: 250 },
  { id: 'exercises-100', xpReward: 500 },
  { id: 'streak-3', xpReward: 150 },
  { id: 'streak-7', xpReward: 300 },
  { id: 'streak-30', xpReward: 1000 },
  { id: 'xp-100', xpReward: 50 },
  { id: 'xp-500', xpReward: 100 },
  { id: 'xp-1000', xpReward: 200 },
  // ...
];

// Методи
loadEarnedAchievements(playerId)
checkAndAwardAchievements(playerId, stats)
```

### 5. Модуль команд (`teamStore`)

```typescript
// Стан
interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
}

// Методи
loadCoachTeams(coachId)
loadPlayerTeams(playerId)
createTeam(coachId, name)
deleteTeam(teamId)
loadTeamMembers(teamId)
joinTeam(playerId, inviteCode)
leaveTeam(playerId, teamId)
removeMember(memberId)
```

### 6. Модуль логування (`activityLogger`)

```typescript
// Типи активності
type ActivityType = 
  | 'login' | 'logout'
  | 'page_view'
  | 'exercise_start' | 'exercise_complete' | 'exercise_skip'
  | 'day_start' | 'day_complete'
  | 'measurement_save'
  | 'timer_start' | 'timer_complete' | 'timer_skip'
  | 'program_start' | 'program_view'
  | 'achievement_view'
  | 'profile_update'
  | 'team_join' | 'team_leave';

// Методи
startSession(playerId)
endSession(playerId)
log(playerId, activityType, metadata, programId, dayKey, exerciseId)
startExerciseTimer(playerId, exerciseId, dayKey, expectedDuration)
completeExerciseTimer(playerId, exerciseId, dayKey)
getDailySummary(playerId, days)
getExerciseTiming(playerId, dayKey)
```

---

## API та інтеграції

### Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Edge Functions

#### 1. `send-push` - Відправка push-сповіщень
```typescript
// POST /functions/v1/send-push
{
  "userId": "uuid",
  "title": "string",
  "body": "string",
  "data": { ... }
}
```

#### 2. `daily-reminders` - Щоденні нагадування (cron)
```typescript
// Запускається щодня о 8:00
// Перевіряє notification_preferences
// Відправляє нагадування тим, хто увімкнув
```

#### 3. `streak-warning` - Попередження про серію (cron)
```typescript
// Запускається щодня о 20:00
// Перевіряє player_stats.last_training_date
// Відправляє попередження якщо серія під загрозою
```

### IndexedDB (Офлайн)

```typescript
// src/lib/offlineStorage.ts
const DB_NAME = 'football-trainer-offline';
const DB_VERSION = 1;

// Stores:
// - progress_queue: черга прогресу для синхронізації
// - profiles: кешовані профілі
// - player_stats: кешована статистика
// - completed_days: кешовані завершені дні
// - programs: кешовані програми
// - program_details: деталі програм

// Методи
queueProgress(data)      // Додати в чергу
getQueuedProgress()      // Отримати чергу
clearQueuedProgress()    // Очистити чергу
cachePrograms(programs)  // Кешувати програми
getPrograms()            // Отримати з кешу
```

### Analytics (DataLayer)

```typescript
// src/lib/analytics.ts
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  window.dataLayer?.push({
    event: eventName,
    ...eventParams,
  });
};

// Події (31 тип):
// - user_signed_in, user_signed_up, user_signed_out
// - exercise_completed, day_completed
// - achievement_unlocked
// - team_joined, team_left
// - program_started, program_completed
// - notification_enabled, notification_sent
// - workout_started, workout_completed
// - app_installed, app_offline, app_online
// - error_occurred
```

---

## Процеси та потоки даних

### 1. Реєстрація користувача

```
┌─────────┐     ┌─────────────┐     ┌──────────┐     ┌─────────────┐
│  User   │────>│  AuthPage   │────>│ authStore│────>│   Supabase  │
└─────────┘     └─────────────┘     └──────────┘     └─────────────┘
                                          │                  │
                                          │    1. signUp()   │
                                          │─────────────────>│
                                          │                  │
                                          │  2. Create user  │
                                          │<─────────────────│
                                          │                  │
                                          │  3. Insert       │
                                          │  profile         │
                                          │─────────────────>│
                                          │                  │
                                          │  4. Insert       │
                                          │  player_stats    │
                                          │─────────────────>│
                                          │                  │
                                          │  5. Track event  │
                                          │────>dataLayer    │
```

### 2. Виконання тренування

```
┌─────────┐     ┌───────────────┐     ┌─────────────┐     ┌──────────┐
│  User   │────>│ProgramDayPage │────>│progressStore│────>│ Supabase │
└─────────┘     └───────────────┘     └─────────────┘     └──────────┘
     │                 │                     │                  │
     │  1. Open        │                     │                  │
     │  exercise       │                     │                  │
     │────────────────>│                     │                  │
     │                 │  2. startTimer()    │                  │
     │                 │────────────────────>│                  │
     │                 │                     │  3. Insert       │
     │                 │                     │  exercise_timing │
     │                 │                     │─────────────────>│
     │                 │                     │                  │
     │  4. Complete    │                     │                  │
     │────────────────>│                     │                  │
     │                 │  5. toggleExercise()│                  │
     │                 │────────────────────>│                  │
     │                 │                     │  6. Check timing │
     │                 │                     │  (suspicious?)   │
     │                 │                     │─────────────────>│
     │                 │                     │                  │
     │                 │                     │  7. Upsert       │
     │                 │                     │  progress        │
     │                 │                     │─────────────────>│
     │                 │                     │                  │
     │                 │                     │  8. Update stats │
     │                 │                     │─────────────────>│
     │                 │                     │                  │
     │                 │                     │  9. Check        │
     │                 │                     │  achievements    │
     │                 │                     │─────────────────>│
     │                 │                     │                  │
     │                 │                     │  10. Log activity│
     │                 │                     │─────────────────>│
```

### 3. Офлайн синхронізація

```
┌─────────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐
│ProgressStore│────>│ useOffline│────>│ IndexedDB│────>│ Supabase │
└─────────────┘     └───────────┘     └──────────┘     └──────────┘
      │                   │                 │                │
      │  1. toggleExercise│                 │                │
      │  (offline)        │                 │                │
      │──────────────────>│                 │                │
      │                   │  2. Queue       │                │
      │                   │  progress       │                │
      │                   │────────────────>│                │
      │                   │                 │                │
      │                   │  3. Online      │                │
      │                   │  detected       │                │
      │                   │<────────────────│                │
      │                   │                 │                │
      │                   │  4. Get queue   │                │
      │                   │────────────────>│                │
      │                   │                 │                │
      │                   │  5. Sync to     │                │
      │                   │  Supabase       │                │
      │                   │────────────────────────────────>│
      │                   │                 │                │
      │                   │  6. Clear queue │                │
      │                   │────────────────>│                │
```

### 4. Верифікація тренером

```
┌─────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────┐
│  Coach  │────>│PlayerActivityPage│────>│coachActivityStore│────>│ Supabase │
└─────────┘     └──────────────────┘     └──────────────────┘     └──────────┘
     │                  │                        │                      │
     │  1. View         │                        │                      │
     │  suspicious      │                        │                      │
     │─────────────────>│                        │                      │
     │                  │  2. loadSuspicious()   │                      │
     │                  │───────────────────────>│                      │
     │                  │                        │  3. Query            │
     │                  │                        │  exercise_timing     │
     │                  │                        │  WHERE is_suspicious │
     │                  │                        │─────────────────────>│
     │                  │                        │                      │
     │  4. Verify       │                        │                      │
     │─────────────────>│                        │                      │
     │                  │  5. verifyActivity()   │                      │
     │                  │───────────────────────>│                      │
     │                  │                        │  6. Update           │
     │                  │                        │  verification_status │
     │                  │                        │─────────────────────>│
```

---

## Безпека

### Row Level Security (RLS)

Всі таблиці мають увімкнений RLS. Основні політики:

```sql
-- Профілі: читання всім, редагування тільки власного
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Статистика: читання всім, редагування тільки власної
CREATE POLICY "Players can view all stats"
  ON player_stats FOR SELECT USING (true);

CREATE POLICY "Players can update own stats"
  ON player_stats FOR UPDATE USING (player_id = auth.uid());

-- Команди: тренер бачить свої, гравці - свої
CREATE POLICY "Coaches can view own teams"
  ON teams FOR SELECT USING (coach_id = auth.uid());

CREATE POLICY "Players can view their teams"
  ON teams FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = teams.id AND player_id = auth.uid()
    )
  );

-- Логування: гравці бачать своє, тренери - команди
CREATE POLICY "Players view own activity"
  ON player_activity_log FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Coaches view team activity"
  ON player_activity_log FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.player_id = player_activity_log.player_id 
      AND t.coach_id = auth.uid()
    )
  );
```

### Автентифікація

- Email/пароль через Supabase Auth
- JWT токени для сесій
- Автоматичне оновлення токенів
- Підтвердження email (опціонально)

### Зберігання файлів

```sql
-- Bucket для аватарів
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Розгортання

### Змінні середовища

```env
# .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_VAPID_PUBLIC_KEY=BHGM...
```

### Supabase Secrets (для Edge Functions)

```bash
supabase secrets set VAPID_PUBLIC_KEY=BHGM...
supabase secrets set VAPID_PRIVATE_KEY=EM13...
supabase secrets set VAPID_SUBJECT=mailto:hello@example.com
```

### Команди збірки

```bash
# Розробка
npm run dev

# Збірка
npm run build

# Попередній перегляд
npm run preview

# Лінтинг
npm run lint
```

### SQL скрипти для виконання

Виконати в Supabase SQL Editor в такому порядку:

1. `supabase/schema.sql` - Базова схема
2. `supabase/full-setup-programs.sql` - Програми
3. `supabase/teams-rls-fix.sql` - Команди
4. `supabase/fix-player-achievements.sql` - Досягнення
5. `supabase/push-notifications.sql` - Push-сповіщення
6. `supabase/fitness-trackers.sql` - Фітнес-трекери
7. `supabase/activity-logging.sql` - Логування

### Деплой Edge Functions

```bash
supabase functions deploy send-push
supabase functions deploy daily-reminders
supabase functions deploy streak-warning
```

---

## Додатки

### A. Список досягнень

| ID | Назва | Умова | XP |
|----|-------|-------|-----|
| first-exercise | Перша вправа | Виконати 1 вправу | 50 |
| first-day | Перший день | Завершити 1 день | 100 |
| exercises-10 | 10 вправ | Виконати 10 вправ | 100 |
| exercises-50 | 50 вправ | Виконати 50 вправ | 250 |
| exercises-100 | 100 вправ | Виконати 100 вправ | 500 |
| streak-3 | 3 дні поспіль | Серія 3 дні | 150 |
| streak-7 | Тиждень | Серія 7 днів | 300 |
| streak-30 | Місяць | Серія 30 днів | 1000 |
| xp-100 | 100 XP | Набрати 100 XP | 50 |
| xp-500 | 500 XP | Набрати 500 XP | 100 |
| xp-1000 | 1000 XP | Набрати 1000 XP | 200 |
| xp-5000 | 5000 XP | Набрати 5000 XP | 500 |
| days-7 | 7 днів | Завершити 7 днів | 200 |
| days-14 | 14 днів | Завершити 14 днів | 400 |
| days-30 | 30 днів | Завершити 30 днів | 1000 |
| early-bird | Ранній птах | Тренування до 7:00 | 100 |
| night-owl | Нічна сова | Тренування після 22:00 | 100 |
| perfectionist | Перфекціоніст | 100% за день | 150 |

### B. Рівні та XP

| Рівень | Потрібно XP | Загалом XP |
|--------|-------------|------------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 200 | 300 |
| 4 | 300 | 600 |
| 5 | 400 | 1000 |
| 6 | 500 | 1500 |
| 7 | 600 | 2100 |
| 8 | 700 | 2800 |
| 9 | 800 | 3600 |
| 10 | 900 | 4500 |
| ... | +100 за рівень | ... |

### C. Категорії програм

| Категорія | Колір | Іконка |
|-----------|-------|--------|
| explosiveness | amber/orange | ⚡ |
| endurance | green/emerald | 🏃 |
| technique | blue/cyan | ⚽ |
| strength | red/rose | 💪 |

### D. Типи інтенсивності

| Тип | Опис |
|-----|------|
| low | Легка - розминка, відновлення |
| medium | Середня - основне тренування |
| high | Висока - інтенсивне навантаження |

---

*Документація оновлена: Грудень 2024*
*Версія: 1.0*

