-- =====================================================
-- SETUP CRON JOBS FOR PUSH NOTIFICATIONS
-- Налаштування автоматичних сповіщень
-- =====================================================

-- ВАЖЛИВО: pg_cron потрібно включити в Supabase Dashboard:
-- Settings -> Database -> Extensions -> pg_cron (Enable)

-- Після включення pg_cron, виконайте ці команди:

-- 1. Щогодинні нагадування про тренування
-- Запускається кожну годину о :00 хвилин
SELECT cron.schedule(
  'daily-training-reminders',
  '0 * * * *',  -- Кожну годину о :00
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/daily-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- 2. Попередження про втрату streak (серії)
-- Запускається о 20:00 UTC щодня
SELECT cron.schedule(
  'streak-warning-notifications',
  '0 20 * * *',  -- Щодня о 20:00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/streak-warning',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- 3. Щотижневий звіт прогресу
-- Запускається в неділю о 10:00 UTC
SELECT cron.schedule(
  'weekly-progress-report',
  '0 10 * * 0',  -- Щонеділі о 10:00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/weekly-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- =====================================================
-- ПЕРЕГЛЯД ТА УПРАВЛІННЯ CRON JOBS
-- =====================================================

-- Переглянути всі активні cron jobs:
-- SELECT * FROM cron.job;

-- Видалити cron job:
-- SELECT cron.unschedule('daily-training-reminders');

-- Переглянути історію виконання:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- =====================================================
-- АЛЬТЕРНАТИВА: Використання Supabase Dashboard
-- =====================================================
-- 
-- Замість SQL, можна налаштувати cron через Dashboard:
-- 1. Відкрийте Supabase Dashboard
-- 2. Перейдіть до Database -> Cron Jobs
-- 3. Натисніть "Create a new cron job"
-- 4. Заповніть:
--    - Name: daily-training-reminders
--    - Schedule: 0 * * * * (кожну годину)
--    - Command: HTTP Request to Edge Function
--
-- =====================================================
-- WEBHOOK АЛЬТЕРНАТИВА (без pg_cron)
-- =====================================================
--
-- Якщо pg_cron недоступний, можна використати:
-- 1. GitHub Actions з cron trigger
-- 2. Vercel Cron Jobs
-- 3. Railway Cron
-- 4. Render Cron Jobs
-- 5. Зовнішній сервіс типу EasyCron або cron-job.org
--
-- Приклад для GitHub Actions (.github/workflows/cron.yml):
-- name: Training Reminders
-- on:
--   schedule:
--     - cron: '0 * * * *'
-- jobs:
--   send-reminders:
--     runs-on: ubuntu-latest
--     steps:
--       - name: Trigger Edge Function
--         run: |
--           curl -X POST \
--             'https://YOUR_PROJECT.supabase.co/functions/v1/daily-reminders' \
--             -H 'Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}'


