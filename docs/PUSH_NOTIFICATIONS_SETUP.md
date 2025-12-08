# Push Notifications Setup / Налаштування Push-сповіщень

## Огляд

Система push-сповіщень включає:
1. **Щоденні нагадування** - нагадування про тренування в обраний користувачем час
2. **Попередження про streak** - вечірнє попередження про можливу втрату серії
3. **Щотижневі звіти** - підсумок тижневого прогресу

## Архітектура

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   pg_cron       │────▶│  Edge Function  │────▶│  Web Push API   │
│  (Scheduler)    │     │  (Supabase)     │     │  (Browser)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Edge Functions

### 1. daily-reminders
- **Шлях:** `/functions/v1/daily-reminders`
- **Запуск:** Кожну годину
- **Логіка:** 
  - Перевіряє `notification_preferences.reminder_time`
  - Відправляє сповіщення тим, хто ще не тренувався сьогодні

### 2. streak-warning
- **Шлях:** `/functions/v1/streak-warning`
- **Запуск:** Щодня о 20:00 UTC
- **Логіка:**
  - Знаходить користувачів з активним streak
  - Відправляє попередження тим, хто не тренувався сьогодні

### 3. weekly-report
- **Шлях:** `/functions/v1/weekly-report`
- **Запуск:** Щонеділі о 10:00 UTC
- **Логіка:**
  - Підраховує тренування та XP за тиждень
  - Відправляє персоналізований звіт

## Налаштування

### Крок 1: Deploy Edge Functions

```bash
cd football-trainer-app

# Deploy всі функції
supabase functions deploy daily-reminders
supabase functions deploy streak-warning
supabase functions deploy weekly-report
supabase functions deploy send-push
```

### Крок 2: Включити pg_cron

1. Відкрийте **Supabase Dashboard**
2. Перейдіть до **Settings** → **Database** → **Extensions**
3. Знайдіть **pg_cron** та натисніть **Enable**

### Крок 3: Налаштувати Cron Jobs

#### Варіант A: Через SQL

```sql
-- Замініть YOUR_PROJECT_REF на ваш project reference

-- Щогодинні нагадування
SELECT cron.schedule(
  'daily-training-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Попередження о 20:00 UTC
SELECT cron.schedule(
  'streak-warning',
  '0 20 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/streak-warning',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Щотижневий звіт (неділя 10:00 UTC)
SELECT cron.schedule(
  'weekly-report',
  '0 10 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-report',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

#### Варіант B: Через Dashboard

1. **Database** → **Cron Jobs** → **Create**
2. Заповніть форму:
   - Name: `daily-training-reminders`
   - Schedule: `0 * * * *`
   - Type: HTTP Request
   - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/daily-reminders`

### Крок 4: Перевірка

```sql
-- Переглянути активні jobs
SELECT * FROM cron.job;

-- Переглянути історію виконання
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

## Таблиці бази даних

### notification_preferences
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES profiles(id),
  training_reminder BOOLEAN DEFAULT true,
  streak_warning BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '18:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### push_subscriptions
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES profiles(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### notification_history
```sql
CREATE TABLE notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES profiles(id),
  notification_type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

## VAPID Keys

Для Web Push потрібні VAPID ключі:

```bash
# Генерація ключів
npx web-push generate-vapid-keys
```

Додайте до `.env`:
```
VITE_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

## Тестування

### Ручний виклик функції

```bash
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/daily-reminders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

### Перевірка підписок

```sql
SELECT 
  p.display_name,
  ps.endpoint,
  np.reminder_time,
  np.training_reminder
FROM push_subscriptions ps
JOIN profiles p ON p.id = ps.player_id
LEFT JOIN notification_preferences np ON np.player_id = ps.player_id;
```

## Альтернативи pg_cron

Якщо pg_cron недоступний:

### GitHub Actions
```yaml
# .github/workflows/notifications.yml
name: Push Notifications
on:
  schedule:
    - cron: '0 * * * *'  # Кожну годину
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Reminders
        run: |
          curl -X POST \
            '${{ secrets.SUPABASE_URL }}/functions/v1/daily-reminders' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}'
```

### Vercel Cron
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Troubleshooting

### Сповіщення не відправляються
1. Перевірте чи включено pg_cron
2. Перевірте логи Edge Functions в Dashboard
3. Перевірте чи є активні підписки в `push_subscriptions`

### Помилка 401 при виклику функції
- Перевірте Service Role Key
- Переконайтесь що функція deployed

### Сповіщення не показуються в браузері
- Перевірте дозволи на сповіщення
- Перевірте чи Service Worker активний
- Перевірте VAPID ключі

