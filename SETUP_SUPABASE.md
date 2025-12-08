# 🗄️ Налаштування Supabase для Football Trainer Pro

## Швидкий старт (3 кроки)

### 1️⃣ Відкрий SQL Editor

Перейди за посиланням:
👉 **https://supabase.com/dashboard/project/warcozyshzagksyjpndp/sql/new**

### 2️⃣ Виконай SQL скрипт

Скопіюй весь код нижче та встав у SQL Editor, потім натисни **Run**:

```sql
-- =============================================
-- FOOTBALL TRAINER PRO - QUICK SETUP
-- =============================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'parent', 'coach')),
    language TEXT NOT NULL DEFAULT 'uk' CHECK (language IN ('uk', 'en', 'cs')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAMS
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'player' CHECK (role IN ('player', 'assistant')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    UNIQUE(team_id, player_id)
);

-- TRAINING PROGRAMS
CREATE TABLE IF NOT EXISTS public.training_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL,
    description JSONB NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_weeks INTEGER DEFAULT 4,
    focus_areas TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAM DAYS
CREATE TABLE IF NOT EXISTS public.program_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    title JSONB NOT NULL,
    intensity TEXT DEFAULT 'low' CHECK (intensity IN ('low', 'medium', 'high')),
    location TEXT DEFAULT 'home' CHECK (location IN ('home', 'field', 'gym')),
    duration_minutes INTEGER DEFAULT 45,
    focus JSONB NOT NULL,
    order_index INTEGER DEFAULT 0,
    UNIQUE(program_id, day_number)
);

-- DAY SECTIONS
CREATE TABLE IF NOT EXISTS public.day_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
    title JSONB NOT NULL,
    duration_minutes INTEGER,
    order_index INTEGER DEFAULT 0
);

-- EXERCISES
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.day_sections(id) ON DELETE CASCADE NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    sets TEXT,
    reps TEXT,
    rest_seconds INTEGER,
    type TEXT DEFAULT 'checkbox' CHECK (type IN ('checkbox', 'input', 'timer')),
    input_label JSONB,
    note JSONB,
    timer_duration INTEGER,
    video_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ASSIGNED PROGRAMS
CREATE TABLE IF NOT EXISTS public.assigned_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    schedule JSONB DEFAULT '{"days": [1,2,3,4,5]}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, player_id)
);

-- PLAYER PROGRESS
CREATE TABLE IF NOT EXISTS public.player_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_program_id UUID REFERENCES public.assigned_programs(id) ON DELETE CASCADE NOT NULL,
    day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    measurement_value TEXT,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(player_id, exercise_id, assigned_program_id)
);

-- ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL,
    description JSONB NOT NULL,
    icon TEXT NOT NULL,
    condition_type TEXT NOT NULL,
    condition_value INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 50
);

-- PLAYER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.player_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    notified BOOLEAN DEFAULT false,
    UNIQUE(player_id, achievement_id)
);

-- PLAYER STATS
CREATE TABLE IF NOT EXISTS public.player_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    total_training_minutes INTEGER DEFAULT 0,
    last_training_date DATE
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Player stats: users can manage their own
CREATE POLICY "Users can view own stats" ON public.player_stats FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Users can manage own stats" ON public.player_stats FOR ALL USING (auth.uid() = player_id);

-- Achievements: everyone can view
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- Player achievements: users can view their own
CREATE POLICY "Users can view own achievements" ON public.player_achievements FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Users can insert own achievements" ON public.player_achievements FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Training programs: public ones visible to all, own visible to author
CREATE POLICY "View public programs" ON public.training_programs FOR SELECT USING (is_public = true);
CREATE POLICY "View own programs" ON public.training_programs FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Manage own programs" ON public.training_programs FOR ALL USING (auth.uid() = author_id);

-- Program days, sections, exercises: visible if program is visible
CREATE POLICY "View program days" ON public.program_days FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.training_programs tp WHERE tp.id = program_id AND (tp.is_public OR tp.author_id = auth.uid()))
);
CREATE POLICY "View day sections" ON public.day_sections FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.program_days pd JOIN public.training_programs tp ON pd.program_id = tp.id WHERE pd.id = day_id AND (tp.is_public OR tp.author_id = auth.uid()))
);
CREATE POLICY "View exercises" ON public.exercises FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.day_sections ds JOIN public.program_days pd ON ds.day_id = pd.id JOIN public.training_programs tp ON pd.program_id = tp.id WHERE ds.id = section_id AND (tp.is_public OR tp.author_id = auth.uid()))
);

-- Teams: visible to coach and members
CREATE POLICY "View own teams" ON public.teams FOR SELECT USING (coach_id = auth.uid() OR EXISTS (SELECT 1 FROM public.team_members WHERE team_id = id AND player_id = auth.uid()));
CREATE POLICY "Manage own teams" ON public.teams FOR ALL USING (coach_id = auth.uid());

-- Team members
CREATE POLICY "View team members" ON public.team_members FOR SELECT USING (player_id = auth.uid() OR EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND coach_id = auth.uid()));

-- Player progress
CREATE POLICY "View own progress" ON public.player_progress FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Manage own progress" ON public.player_progress FOR ALL USING (auth.uid() = player_id);

-- Assigned programs
CREATE POLICY "View own assigned" ON public.assigned_programs FOR SELECT USING (auth.uid() = player_id OR auth.uid() = assigned_by);

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, language)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'player'),
        'uk'
    );
    
    INSERT INTO public.player_stats (player_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SEED: Achievements
-- =============================================

INSERT INTO public.achievements (title, description, icon, condition_type, condition_value, xp_reward) VALUES
('{"uk": "Перший крок", "en": "First Step", "cs": "První krok"}', '{"uk": "Виконай першу вправу", "en": "Complete first exercise", "cs": "Dokonči první cvik"}', '🎯', 'exercises_count', 1, 10),
('{"uk": "Початківець", "en": "Beginner", "cs": "Začátečník"}', '{"uk": "Виконай 10 вправ", "en": "Complete 10 exercises", "cs": "Dokonči 10 cviků"}', '⭐', 'exercises_count', 10, 50),
('{"uk": "Наполегливий", "en": "Persistent", "cs": "Vytrvalý"}', '{"uk": "Виконай 50 вправ", "en": "Complete 50 exercises", "cs": "Dokonči 50 cviků"}', '💪', 'exercises_count', 50, 100),
('{"uk": "Серія 3 дні", "en": "3 Day Streak", "cs": "3denní série"}', '{"uk": "Тренуйся 3 дні поспіль", "en": "Train 3 days in a row", "cs": "Trénuj 3 dny po sobě"}', '🔥', 'streak', 3, 30),
('{"uk": "Серія 7 днів", "en": "7 Day Streak", "cs": "7denní série"}', '{"uk": "Тренуйся тиждень поспіль", "en": "Train for a week", "cs": "Trénuj týden po sobě"}', '🔥🔥', 'streak', 7, 70),
('{"uk": "Серія 30 днів", "en": "30 Day Streak", "cs": "30denní série"}', '{"uk": "Тренуйся місяць поспіль", "en": "Train for a month", "cs": "Trénuj měsíc po sobě"}', '🏆', 'streak', 30, 300),
('{"uk": "100 XP", "en": "100 XP", "cs": "100 XP"}', '{"uk": "Набери 100 XP", "en": "Earn 100 XP", "cs": "Získej 100 XP"}', '✨', 'xp', 100, 20),
('{"uk": "500 XP", "en": "500 XP", "cs": "500 XP"}', '{"uk": "Набери 500 XP", "en": "Earn 500 XP", "cs": "Získej 500 XP"}', '🌟', 'xp', 500, 50),
('{"uk": "1000 XP", "en": "1000 XP", "cs": "1000 XP"}', '{"uk": "Набери 1000 XP", "en": "Earn 1000 XP", "cs": "Získej 1000 XP"}', '💎', 'xp', 1000, 100)
ON CONFLICT DO NOTHING;

-- Done!
SELECT 'Database setup complete!' as status;
```

### 3️⃣ Увімкни Email Auth

1. Перейди: **Authentication** → **Providers**
2. Увімкни **Email** 
3. (Опціонально) Вимкни "Confirm email" для тестування

---

## ✅ Готово!

Тепер можеш запустити додаток:

```bash
cd football-trainer-app
npm install
npm run dev
```

Відкрий http://localhost:3000

