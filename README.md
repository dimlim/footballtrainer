# Football Trainer Pro 🏃‍♂️⚽

Професійний додаток для футбольних тренувань з підтримкою мультимовності (UK/EN/CS).

## 🚀 Функціонал

- **Авторизація** - Email реєстрація/вхід через Supabase
- **Профілі** - Гравець / Батько / Тренер
- **Мультимовність** - Українська, Англійська, Чеська
- **Програми тренувань** - 30-денні плани з вправами
- **Прогрес** - XP система, рівні, серії
- **Команди** - Створення команд, код запрошення
- **Календар** - Розклад тренувань
- **Статистика** - Рейтинги, досягнення

## 🛠️ Технології

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animation**: Motion (Framer Motion)
- **State**: Zustand
- **Backend**: Supabase (Auth, Database, RLS)
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Встановлення

```bash
# Клонуй репозиторій
cd football-trainer-app

# Встанови залежності
npm install

# Запусти dev сервер
npm run dev
```

## 🗄️ Налаштування Supabase

1. Створи проект на [supabase.com](https://supabase.com)

2. Виконай SQL скрипти в порядку:
   ```
   supabase/schema.sql
   supabase/seed-training-program.sql
   ```

3. Оновіть `src/lib/supabase.ts` з вашими ключами:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL';
   const supabaseAnonKey = 'YOUR_ANON_KEY';
   ```

4. Увімкни Email Auth в Supabase Dashboard:
   - Authentication → Providers → Email

## 📁 Структура проекту

```
src/
├── components/
│   ├── auth/        # Форми авторизації
│   ├── layout/      # Header, BottomNav, AppLayout
│   └── ui/          # Button, Card, Input, etc.
├── lib/
│   ├── supabase.ts  # Supabase клієнт
│   ├── i18n.ts      # Мультимовність
│   └── utils.ts     # Утиліти
├── pages/           # Сторінки додатку
├── stores/          # Zustand stores
├── styles/          # CSS файли
└── types/           # TypeScript типи
```

## 🌐 Мультимовність

Додаток підтримує 3 мови:
- 🇺🇦 Українська (uk) - за замовчуванням
- 🇬🇧 English (en)
- 🇨🇿 Čeština (cs)

Перемикання мови в профілі користувача.

## 🔐 Ролі користувачів

| Роль | Можливості |
|------|------------|
| **Player** | Тренування, прогрес, статистика |
| **Parent** | Перегляд прогресу дитини |
| **Coach** | Керування командою, створення програм |

## 📱 PWA

Додаток підтримує встановлення як PWA:
- Service Worker для офлайн режиму
- Manifest для Add to Home Screen
- iOS meta tags

## 🚧 Roadmap

- [ ] Push-сповіщення
- [ ] Відео-інструкції до вправ
- [ ] AI рекомендації
- [ ] Інтеграція з фітнес-трекерами
- [ ] Кастомні програми тренувань

## 📄 Ліцензія

MIT License

---

Made with ❤️ for young football players

