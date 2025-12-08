-- ============================================
-- TEAMS RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches can create teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches can update their teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches can delete their teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view teams by code" ON public.teams;

DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Coaches can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Players can join teams" ON public.team_members;
DROP POLICY IF EXISTS "Players can leave teams" ON public.team_members;

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TEAMS POLICIES
-- ============================================

-- Users can view teams they own or are members of
CREATE POLICY "teams_select" ON public.teams
    FOR SELECT TO authenticated USING (
        coach_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = teams.id AND player_id = auth.uid()
        )
    );

-- Anyone can find team by code (for joining)
CREATE POLICY "teams_select_by_code" ON public.teams
    FOR SELECT TO authenticated USING (true);

-- Coaches can create teams
CREATE POLICY "teams_insert" ON public.teams
    FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());

-- Coaches can update their teams
CREATE POLICY "teams_update" ON public.teams
    FOR UPDATE TO authenticated USING (coach_id = auth.uid());

-- Coaches can delete their teams
CREATE POLICY "teams_delete" ON public.teams
    FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- ============================================
-- TEAM MEMBERS POLICIES
-- ============================================

-- Users can view members of teams they're in or coach
CREATE POLICY "team_members_select" ON public.team_members
    FOR SELECT TO authenticated USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND coach_id = auth.uid()
        )
    );

-- Players can join teams (insert themselves)
CREATE POLICY "team_members_insert" ON public.team_members
    FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

-- Coaches can update team members
CREATE POLICY "team_members_update" ON public.team_members
    FOR UPDATE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND coach_id = auth.uid()
        )
    );

-- Players can leave (delete themselves) OR coaches can remove members
CREATE POLICY "team_members_delete" ON public.team_members
    FOR DELETE TO authenticated USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.teams 
            WHERE id = team_members.team_id AND coach_id = auth.uid()
        )
    );

-- ============================================
-- PROFILES POLICY UPDATE
-- Allow coaches to view team members' profiles
-- ============================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Coaches can view team members" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_team" ON public.profiles;

-- Coaches can view profiles of their team members
CREATE POLICY "profiles_select_team" ON public.profiles
    FOR SELECT TO authenticated USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = profiles.id AND t.coach_id = auth.uid()
        )
    );

-- ============================================
-- PLAYER STATS POLICY UPDATE
-- Allow coaches to view team members' stats
-- ============================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Coaches can view team stats" ON public.player_stats;
DROP POLICY IF EXISTS "player_stats_select_team" ON public.player_stats;

-- Coaches can view stats of their team members
CREATE POLICY "player_stats_select_team" ON public.player_stats
    FOR SELECT TO authenticated USING (
        player_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_stats.player_id AND t.coach_id = auth.uid()
        )
    );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON public.teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_teams_code ON public.teams(code);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_player_id ON public.team_members(player_id);

