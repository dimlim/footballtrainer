# Football Trainer Pro - Інструкція з налаштування

## Передумови

- Node.js 18+ 
- npm або yarn
- Обліковий запис Supabase

## 1. Клонування та встановлення

```bash
# Клонування репозиторію
git clone https://github.com/your-repo/football-trainer.git
cd football-trainer/football-trainer-app

# Встановлення залежностей
npm install
```

## 2. Налаштування Supabase

### 2.1 Створення проєкту

1. Перейдіть на [supabase.com](https://supabase.com)
2. Створіть новий проєкт
3. Запам'ятайте:
   - Project URL
   - Anon public key

### 2.2 Виконання SQL скриптів

Відкрийте **SQL Editor** в Supabase Dashboard та виконайте скрипти в такому порядку:

#### Крок 1: Базова схема
```sql
-- Виконайте вміст файлу: supabase/schema.sql
```

#### Крок 2: Програми тренувань
```sql
-- Виконайте вміст файлу: supabase/full-setup-programs.sql
```

#### Крок 3: Виправлення RLS для команд
```sql
-- Виконайте вміст файлу: supabase/teams-rls-fix.sql
```

#### Крок 4: Досягнення
```sql
-- Виконайте вміст файлу: supabase/fix-player-achievements.sql
```

#### Крок 5: Push-сповіщення
```sql
-- Виконайте вміст файлу: supabase/push-notifications.sql
```

#### Крок 6: Фітнес-трекери
```sql
-- Виконайте вміст файлу: supabase/fitness-trackers.sql
```

#### Крок 7: Логування активності
```sql
-- Виконайте вміст файлу: supabase/activity-logging.sql
```

### 2.3 Налаштування Storage

1. Перейдіть в **Storage** в Supabase Dashboard
2. Створіть bucket `avatars`
3. Зробіть його публічним
4. Виконайте SQL для RLS:

```sql
-- Публічний доступ до аватарів
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Користувачі можуть завантажувати свої аватари
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Користувачі можуть оновлювати свої аватари
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Користувачі можуть видаляти свої аватари
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 2.4 Налаштування автентифікації

1. Перейдіть в **Authentication** → **Providers**
2. Увімкніть **Email** provider
3. (Опціонально) Вимкніть "Confirm email" для швидшого тестування
4. Налаштуйте Site URL та Redirect URLs

## 3. Налаштування змінних середовища

Створіть файл `.env.local` в корені проєкту:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# VAPID для Push-сповіщень (опціонально)
VITE_VAPID_PUBLIC_KEY=BHGM...
```

### Генерація VAPID ключів

Для push-сповіщень потрібні VAPID ключі. Отримати їх можна:

1. На сайті [vapidkeys.com](https://vapidkeys.com) (безкоштовно)
2. Або через npx:
```bash
npx web-push generate-vapid-keys
```

## 4. Запуск проєкту

```bash
# Режим розробки
npm run dev

# Збірка для продакшену
npm run build

# Попередній перегляд збірки
npm run preview
```

## 5. Створення адміністратора

Після реєстрації першого користувача, зробіть його адміністратором:

```sql
-- Знайдіть ID користувача
SELECT id, email FROM auth.users;

-- Додайте в адміністратори
INSERT INTO admin_users (user_id) 
VALUES ('user-uuid-here');
```

## 6. Налаштування Edge Functions (опціонально)

### 6.1 Встановлення Supabase CLI

```bash
npm install -g supabase
supabase login
```

### 6.2 Налаштування секретів

```bash
# VAPID ключі для push-сповіщень
supabase secrets set VAPID_PUBLIC_KEY=BHGM...
supabase secrets set VAPID_PRIVATE_KEY=EM13...
supabase secrets set VAPID_SUBJECT=mailto:your@email.com
```

### 6.3 Деплой функцій

```bash
# Відправка push-сповіщень
supabase functions deploy send-push

# Щоденні нагадування
supabase functions deploy daily-reminders

# Попередження про серію
supabase functions deploy streak-warning
```

### 6.4 Налаштування Cron Jobs

В Supabase Dashboard → Database → Extensions → `pg_cron`:

```sql
-- Щоденні нагадування о 8:00
SELECT cron.schedule(
  'daily-reminders',
  '0 8 * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/daily-reminders',
    headers := '{"Authorization": "Bearer your-service-role-key"}'
  )$$
);

-- Попередження про серію о 20:00
SELECT cron.schedule(
  'streak-warning',
  '0 20 * * *',
  $$SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/streak-warning',
    headers := '{"Authorization": "Bearer your-service-role-key"}'
  )$$
);
```

## 7. Деплой на продакшен

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 8. Перевірка роботи

### Чек-лист:

- [ ] Реєстрація нового користувача
- [ ] Вхід в систему
- [ ] Перегляд програм
- [ ] Виконання вправ
- [ ] Збереження прогресу
- [ ] Отримання досягнень
- [ ] Створення команди (тренер)
- [ ] Приєднання до команди (гравець)
- [ ] Push-сповіщення
- [ ] Офлайн режим

## Вирішення проблем

### "Signups not allowed"
- Увімкніть реєстрацію в Authentication → Settings

### RLS помилки
- Перевірте, що всі RLS політики створені
- Тимчасово вимкніть RLS для діагностики

### Push не працюють
- Перевірте VAPID ключі
- Перевірте дозволи браузера
- Перевірте HTTPS (обов'язково для push)

### Офлайн не працює
- Перевірте Service Worker в DevTools
- Очистіть кеш та перезавантажте

---

*Документація оновлена: Грудень 2024*

