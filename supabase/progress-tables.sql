-- ============================================
-- SIMPLIFIED PROGRESS TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop old player_progress if exists (backup first if needed)
-- DROP TABLE IF EXISTS public.player_progress CASCADE;

-- Create simplified player_progress table
CREATE TABLE IF NOT EXISTS public.player_progress_v2 (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_id TEXT NOT NULL, -- Can be UUID or string like "day-1"
    exercise_id TEXT NOT NULL, -- Can be UUID or string like "e1"
    is_completed BOOLEAN NOT NULL DEFAULT false,
    measurement_value TEXT,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, day_id, exercise_id)
);

-- Create day completions table
CREATE TABLE IF NOT EXISTS public.player_day_completions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    day_id TEXT NOT NULL,
    bonus_xp INTEGER NOT NULL DEFAULT 50,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, day_id)
);

-- Enable RLS
ALTER TABLE public.player_progress_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_day_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_progress_v2
CREATE POLICY "Users can view their own progress v2" ON public.player_progress_v2
    FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Users can insert their own progress v2" ON public.player_progress_v2
    FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their own progress v2" ON public.player_progress_v2
    FOR UPDATE USING (player_id = auth.uid());

CREATE POLICY "Users can delete their own progress v2" ON public.player_progress_v2
    FOR DELETE USING (player_id = auth.uid());

-- RLS Policies for player_day_completions
CREATE POLICY "Users can view their day completions" ON public.player_day_completions
    FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Users can insert their day completions" ON public.player_day_completions
    FOR INSERT WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their day completions" ON public.player_day_completions
    FOR UPDATE USING (player_id = auth.uid());

-- Coaches can view team progress
CREATE POLICY "Coaches can view team progress v2" ON public.player_progress_v2
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_progress_v2.player_id AND t.coach_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can view team day completions" ON public.player_day_completions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_day_completions.player_id AND t.coach_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_player_progress_v2_player_id ON public.player_progress_v2(player_id);
CREATE INDEX IF NOT EXISTS idx_player_progress_v2_day_id ON public.player_progress_v2(day_id);
CREATE INDEX IF NOT EXISTS idx_player_day_completions_player_id ON public.player_day_completions(player_id);

