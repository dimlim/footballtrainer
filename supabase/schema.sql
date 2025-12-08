-- Football Trainer Pro Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'parent', 'coach')),
    language TEXT NOT NULL DEFAULT 'uk' CHECK (language IN ('uk', 'en', 'cs')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'assistant')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    UNIQUE(team_id, player_id)
);

-- ============================================
-- TRAINING PROGRAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL, -- {uk: '', en: '', cs: ''}
    description JSONB NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    focus_areas TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PROGRAM DAYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.program_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    title JSONB NOT NULL,
    intensity TEXT NOT NULL DEFAULT 'low' CHECK (intensity IN ('low', 'medium', 'high')),
    location TEXT NOT NULL DEFAULT 'home' CHECK (location IN ('home', 'field', 'gym')),
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    focus JSONB NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    UNIQUE(program_id, day_number)
);

-- ============================================
-- DAY SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.day_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
    title JSONB NOT NULL,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- EXERCISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.day_sections(id) ON DELETE CASCADE NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    sets TEXT,
    reps TEXT,
    rest_seconds INTEGER,
    type TEXT NOT NULL DEFAULT 'checkbox' CHECK (type IN ('checkbox', 'input', 'timer')),
    input_label JSONB,
    note JSONB,
    timer_duration INTEGER,
    video_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ASSIGNED PROGRAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.assigned_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    start_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    schedule JSONB DEFAULT '{"days": [1, 2, 3, 4, 5]}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(program_id, player_id)
);

-- ============================================
-- PLAYER PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_program_id UUID REFERENCES public.assigned_programs(id) ON DELETE CASCADE NOT NULL,
    day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    measurement_value TEXT,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    UNIQUE(player_id, exercise_id, assigned_program_id)
);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title JSONB NOT NULL,
    description JSONB NOT NULL,
    icon TEXT NOT NULL,
    condition_type TEXT NOT NULL,
    condition_value INTEGER NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50
);

-- ============================================
-- PLAYER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(player_id, achievement_id)
);

-- ============================================
-- PLAYER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    total_exercises INTEGER NOT NULL DEFAULT 0,
    total_training_minutes INTEGER NOT NULL DEFAULT 0,
    last_training_date DATE
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Coaches can view team members profiles
CREATE POLICY "Coaches can view team members" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = profiles.id AND t.coach_id = auth.uid()
        )
    );

-- Teams policies
CREATE POLICY "Users can view their teams" ON public.teams
    FOR SELECT USING (
        coach_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = teams.id AND player_id = auth.uid())
    );

CREATE POLICY "Coaches can create teams" ON public.teams
    FOR INSERT WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update their teams" ON public.teams
    FOR UPDATE USING (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their teams" ON public.teams
    FOR DELETE USING (coach_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members" ON public.team_members
    FOR SELECT USING (
        player_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND coach_id = auth.uid())
    );

CREATE POLICY "Coaches can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND coach_id = auth.uid())
    );

CREATE POLICY "Players can join teams" ON public.team_members
    FOR INSERT WITH CHECK (player_id = auth.uid());

-- Training programs policies
CREATE POLICY "Users can view public programs" ON public.training_programs
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own programs" ON public.training_programs
    FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Users can view assigned programs" ON public.training_programs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.assigned_programs WHERE program_id = training_programs.id AND player_id = auth.uid())
    );

CREATE POLICY "Users can create programs" ON public.training_programs
    FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their programs" ON public.training_programs
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete their programs" ON public.training_programs
    FOR DELETE USING (author_id = auth.uid());

-- Program days policies
CREATE POLICY "Users can view program days" ON public.program_days
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_programs tp
            WHERE tp.id = program_days.program_id AND (
                tp.is_public = true OR
                tp.author_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.assigned_programs WHERE program_id = tp.id AND player_id = auth.uid())
            )
        )
    );

CREATE POLICY "Authors can manage program days" ON public.program_days
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.training_programs WHERE id = program_days.program_id AND author_id = auth.uid())
    );

-- Day sections policies
CREATE POLICY "Users can view day sections" ON public.day_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.program_days pd
            JOIN public.training_programs tp ON pd.program_id = tp.id
            WHERE pd.id = day_sections.day_id AND (
                tp.is_public = true OR
                tp.author_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.assigned_programs WHERE program_id = tp.id AND player_id = auth.uid())
            )
        )
    );

CREATE POLICY "Authors can manage day sections" ON public.day_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.program_days pd
            JOIN public.training_programs tp ON pd.program_id = tp.id
            WHERE pd.id = day_sections.day_id AND tp.author_id = auth.uid()
        )
    );

-- Exercises policies
CREATE POLICY "Users can view exercises" ON public.exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.day_sections ds
            JOIN public.program_days pd ON ds.day_id = pd.id
            JOIN public.training_programs tp ON pd.program_id = tp.id
            WHERE ds.id = exercises.section_id AND (
                tp.is_public = true OR
                tp.author_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.assigned_programs WHERE program_id = tp.id AND player_id = auth.uid())
            )
        )
    );

CREATE POLICY "Authors can manage exercises" ON public.exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.day_sections ds
            JOIN public.program_days pd ON ds.day_id = pd.id
            JOIN public.training_programs tp ON pd.program_id = tp.id
            WHERE ds.id = exercises.section_id AND tp.author_id = auth.uid()
        )
    );

-- Assigned programs policies
CREATE POLICY "Users can view their assigned programs" ON public.assigned_programs
    FOR SELECT USING (player_id = auth.uid() OR assigned_by = auth.uid());

CREATE POLICY "Coaches can assign programs" ON public.assigned_programs
    FOR INSERT WITH CHECK (assigned_by = auth.uid());

CREATE POLICY "Coaches can update assigned programs" ON public.assigned_programs
    FOR UPDATE USING (assigned_by = auth.uid());

-- Player progress policies
CREATE POLICY "Users can view their own progress" ON public.player_progress
    FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Coaches can view team progress" ON public.player_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_progress.player_id AND t.coach_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own progress" ON public.player_progress
    FOR ALL USING (player_id = auth.uid());

-- Achievements policies
CREATE POLICY "Everyone can view achievements" ON public.achievements
    FOR SELECT USING (true);

-- Player achievements policies
CREATE POLICY "Users can view their achievements" ON public.player_achievements
    FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "System can insert achievements" ON public.player_achievements
    FOR INSERT WITH CHECK (player_id = auth.uid());

-- Player stats policies
CREATE POLICY "Users can view their stats" ON public.player_stats
    FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Coaches can view team stats" ON public.player_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_stats.player_id AND t.coach_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their stats" ON public.player_stats
    FOR ALL USING (player_id = auth.uid());

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user creation
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
    
    INSERT INTO public.player_stats (player_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at
    BEFORE UPDATE ON public.training_programs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- SEED DATA: ACHIEVEMENTS
-- ============================================
INSERT INTO public.achievements (title, description, icon, condition_type, condition_value, xp_reward) VALUES
('{"uk": "Перший крок", "en": "First Step", "cs": "První krok"}', '{"uk": "Виконай першу вправу", "en": "Complete your first exercise", "cs": "Dokonči svůj první cvik"}', '🎯', 'exercises_count', 1, 10),
('{"uk": "Початківець", "en": "Beginner", "cs": "Začátečník"}', '{"uk": "Виконай 10 вправ", "en": "Complete 10 exercises", "cs": "Dokonči 10 cviků"}', '⭐', 'exercises_count', 10, 50),
('{"uk": "Наполегливий", "en": "Persistent", "cs": "Vytrvalý"}', '{"uk": "Виконай 50 вправ", "en": "Complete 50 exercises", "cs": "Dokonči 50 cviků"}', '💪', 'exercises_count', 50, 100),
('{"uk": "Серія 3 дні", "en": "3 Day Streak", "cs": "3denní série"}', '{"uk": "Тренуйся 3 дні поспіль", "en": "Train for 3 days in a row", "cs": "Trénuj 3 dny po sobě"}', '🔥', 'streak', 3, 30),
('{"uk": "Серія 7 днів", "en": "7 Day Streak", "cs": "7denní série"}', '{"uk": "Тренуйся тиждень поспіль", "en": "Train for a week straight", "cs": "Trénuj týden po sobě"}', '🔥🔥', 'streak', 7, 70),
('{"uk": "Серія 30 днів", "en": "30 Day Streak", "cs": "30denní série"}', '{"uk": "Тренуйся місяць поспіль", "en": "Train for a month straight", "cs": "Trénuj měsíc po sobě"}', '🏆', 'streak', 30, 300),
('{"uk": "100 XP", "en": "100 XP", "cs": "100 XP"}', '{"uk": "Набери 100 очок досвіду", "en": "Earn 100 experience points", "cs": "Získej 100 bodů zkušeností"}', '✨', 'xp', 100, 20),
('{"uk": "500 XP", "en": "500 XP", "cs": "500 XP"}', '{"uk": "Набери 500 очок досвіду", "en": "Earn 500 experience points", "cs": "Získej 500 bodů zkušeností"}', '🌟', 'xp', 500, 50),
('{"uk": "1000 XP", "en": "1000 XP", "cs": "1000 XP"}', '{"uk": "Набери 1000 очок досвіду", "en": "Earn 1000 experience points", "cs": "Získej 1000 bodů zkušeností"}', '💎', 'xp', 1000, 100)
ON CONFLICT DO NOTHING;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON public.teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_player_id ON public.team_members(player_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_author_id ON public.training_programs(author_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_is_public ON public.training_programs(is_public);
CREATE INDEX IF NOT EXISTS idx_program_days_program_id ON public.program_days(program_id);
CREATE INDEX IF NOT EXISTS idx_day_sections_day_id ON public.day_sections(day_id);
CREATE INDEX IF NOT EXISTS idx_exercises_section_id ON public.exercises(section_id);
CREATE INDEX IF NOT EXISTS idx_assigned_programs_player_id ON public.assigned_programs(player_id);
CREATE INDEX IF NOT EXISTS idx_player_progress_player_id ON public.player_progress(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_player_id ON public.player_stats(player_id);

