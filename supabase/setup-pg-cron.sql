-- =====================================================
-- PG_CRON SETUP FOR PUSH NOTIFICATIONS
-- Налаштування автоматичних сповіщень
-- =====================================================

-- ВАЖЛИВО: Перед виконанням цього скрипта:
-- 1. Включіть pg_cron в Database -> Extensions
-- 2. Включіть pg_net в Database -> Extensions
-- 3. Замініть YOUR_PROJECT_REF на ваш project reference (напр. abcdefghijklmnop)
-- 4. Замініть YOUR_SERVICE_ROLE_KEY на ваш service role key

-- =====================================================
-- КРОК 1: Перевірка що розширення включені
-- =====================================================

-- Перевірити чи pg_cron включено
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
SELECT * FROM pg_extension WHERE extname = 'pg_net';

-- =====================================================
-- КРОК 2: Створення cron jobs
-- =====================================================

-- Видалити старі jobs якщо існують
SELECT cron.unschedule('daily-training-reminders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-training-reminders');
SELECT cron.unschedule('streak-warning') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'streak-warning');
SELECT cron.unschedule('weekly-report') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-report');

-- =====================================================
-- JOB 1: Щогодинні нагадування про тренування
-- Запускається кожну годину о :00 хвилин
-- =====================================================

SELECT cron.schedule(
  'daily-training-reminders',
  '0 * * * *',  -- Кожну годину
  $$
  SELECT net.http_post(
    url := 'https://warcozyshzagksyjpndp.supabase.co/functions/v1/daily-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcmNvenlzaHphZ2tzeWpwbmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTExMzYwMCwiZXhwIjoyMDgwNjg5NjAwfQ.u_ApDIHbmoPCythdSWMsnL71Zp5Zt_UhYmgPQTuDXZY'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- =====================================================
-- JOB 2: Попередження про втрату streak
-- Запускається щодня о 20:00 UTC (22:00 Київ, 21:00 Прага)
-- =====================================================

SELECT cron.schedule(
  'streak-warning',
  '0 20 * * *',  -- Щодня о 20:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://warcozyshzagksyjpndp.supabase.co/functions/v1/streak-warning',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcmNvenlzaHphZ2tzeWpwbmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTExMzYwMCwiZXhwIjoyMDgwNjg5NjAwfQ.u_ApDIHbmoPCythdSWMsnL71Zp5Zt_UhYmgPQTuDXZY'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- =====================================================
-- JOB 3: Щотижневий звіт прогресу
-- Запускається в неділю о 10:00 UTC (12:00 Київ, 11:00 Прага)
-- =====================================================

SELECT cron.schedule(
  'weekly-report',
  '0 10 * * 0',  -- Щонеділі о 10:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://warcozyshzagksyjpndp.supabase.co/functions/v1/weekly-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcmNvenlzaHphZ2tzeWpwbmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTExMzYwMCwiZXhwIjoyMDgwNjg5NjAwfQ.u_ApDIHbmoPCythdSWMsnL71Zp5Zt_UhYmgPQTuDXZY'
    ),                                                      
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- =====================================================
-- КРОК 3: Перевірка створених jobs
-- =====================================================

SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
ORDER BY jobname;

-- =====================================================
-- КОРИСНІ КОМАНДИ
-- =====================================================

-- Переглянути всі jobs:
-- SELECT * FROM cron.job;

-- Переглянути історію виконання (останні 20):
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- Вимкнути job тимчасово:
-- UPDATE cron.job SET active = false WHERE jobname = 'daily-training-reminders';

-- Увімкнути job:
-- UPDATE cron.job SET active = true WHERE jobname = 'daily-training-reminders';

-- Видалити job:
-- SELECT cron.unschedule('daily-training-reminders');

-- Запустити job вручну (для тестування):
-- SELECT cron.schedule('test-now', '* * * * *', $$ SELECT 1; $$);
-- SELECT cron.unschedule('test-now');

-- =====================================================
-- ПРИМІТКИ
-- =====================================================

-- Cron schedule format: minute hour day month weekday
-- * * * * *
-- │ │ │ │ │
-- │ │ │ │ └── Weekday (0-6, Sunday=0)
-- │ │ │ └──── Month (1-12)
-- │ │ └────── Day (1-31)
-- │ └──────── Hour (0-23)
-- └────────── Minute (0-59)

-- Приклади:
-- '0 * * * *'     - Кожну годину о :00
-- '*/15 * * * *'  - Кожні 15 хвилин
-- '0 8 * * *'     - Щодня о 8:00
-- '0 8 * * 1-5'   - Пн-Пт о 8:00
-- '0 10 * * 0'    - Щонеділі о 10:00


