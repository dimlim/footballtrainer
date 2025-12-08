-- ============================================
-- FIX PLAYER ACHIEVEMENTS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing table completely and recreate with correct schema
DROP TABLE IF EXISTS public.player_achievements CASCADE;

-- Create player_achievements table with TEXT achievement_id (not UUID!)
CREATE TABLE public.player_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,  -- TEXT type for string IDs like 'first-exercise'
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(player_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow users to manage their own achievements
CREATE POLICY "achievements_select" ON public.player_achievements
    FOR SELECT TO authenticated
    USING (player_id = auth.uid());

CREATE POLICY "achievements_insert" ON public.player_achievements
    FOR INSERT TO authenticated
    WITH CHECK (player_id = auth.uid());

CREATE POLICY "achievements_update" ON public.player_achievements
    FOR UPDATE TO authenticated
    USING (player_id = auth.uid());

-- Coaches can view team achievements
CREATE POLICY "coaches_view_team_achievements" ON public.player_achievements
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_achievements.player_id AND t.coach_id = auth.uid()
        )
    );

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON public.player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_achievement ON public.player_achievements(achievement_id);

-- Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'player_achievements' AND table_schema = 'public';

SELECT 'player_achievements table recreated with TEXT achievement_id' as status;

