-- ============================================
-- FIX: Teams RLS Policies (no recursion)
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop ALL existing policies for teams
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches can create teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches can update their teams" ON public.teams;
DROP POLICY IF EXISTS "Coaches can delete their teams" ON public.teams;
DROP POLICY IF EXISTS "Anyone can view teams by code" ON public.teams;
DROP POLICY IF EXISTS "teams_select" ON public.teams;
DROP POLICY IF EXISTS "teams_select_by_code" ON public.teams;
DROP POLICY IF EXISTS "teams_insert" ON public.teams;
DROP POLICY IF EXISTS "teams_update" ON public.teams;
DROP POLICY IF EXISTS "teams_delete" ON public.teams;

-- Drop ALL existing policies for team_members
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Coaches can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Players can join teams" ON public.team_members;
DROP POLICY IF EXISTS "Players can leave teams" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete" ON public.team_members;

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TEAMS POLICIES (Simple, no recursion)
-- ============================================

-- Everyone can SELECT teams (needed for join by code)
CREATE POLICY "teams_select_all" ON public.teams
    FOR SELECT TO authenticated USING (true);

-- Only coach can INSERT their own team
CREATE POLICY "teams_insert_coach" ON public.teams
    FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());

-- Only coach can UPDATE their own team
CREATE POLICY "teams_update_coach" ON public.teams
    FOR UPDATE TO authenticated USING (coach_id = auth.uid());

-- Only coach can DELETE their own team
CREATE POLICY "teams_delete_coach" ON public.teams
    FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- ============================================
-- TEAM MEMBERS POLICIES (Simple, no recursion)
-- ============================================

-- Users can see team_members where they are:
-- 1. The player themselves
-- 2. The coach of the team
CREATE POLICY "team_members_select_own" ON public.team_members
    FOR SELECT TO authenticated USING (
        player_id = auth.uid() OR
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

-- Players can INSERT themselves into a team
CREATE POLICY "team_members_insert_self" ON public.team_members
    FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

-- Coaches can UPDATE members of their teams
CREATE POLICY "team_members_update_coach" ON public.team_members
    FOR UPDATE TO authenticated USING (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

-- Players can DELETE themselves OR coaches can delete from their teams
CREATE POLICY "team_members_delete_own" ON public.team_members
    FOR DELETE TO authenticated USING (
        player_id = auth.uid() OR
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

-- ============================================
-- PROFILES - allow coaches to see team members
-- ============================================
DROP POLICY IF EXISTS "profiles_select_team" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Simple: users can see their own profile + coaches can see their team members
CREATE POLICY "profiles_select_simple" ON public.profiles
    FOR SELECT TO authenticated USING (
        id = auth.uid() OR
        id IN (
            SELECT tm.player_id 
            FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE t.coach_id = auth.uid()
        )
    );

-- ============================================
-- PLAYER STATS - allow coaches to see team members stats
-- ============================================
DROP POLICY IF EXISTS "player_stats_select_team" ON public.player_stats;
DROP POLICY IF EXISTS "Users can view their stats" ON public.player_stats;
DROP POLICY IF EXISTS "Coaches can view team stats" ON public.player_stats;
DROP POLICY IF EXISTS "player_stats_select" ON public.player_stats;

-- Simple: users can see their own stats + coaches can see their team members stats
CREATE POLICY "player_stats_select_simple" ON public.player_stats
    FOR SELECT TO authenticated USING (
        player_id = auth.uid() OR
        player_id IN (
            SELECT tm.player_id 
            FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE t.coach_id = auth.uid()
        )
    );

-- Keep existing insert/update policies for player_stats
DROP POLICY IF EXISTS "Users can update their stats" ON public.player_stats;
DROP POLICY IF EXISTS "player_stats_insert" ON public.player_stats;
DROP POLICY IF EXISTS "player_stats_update" ON public.player_stats;

CREATE POLICY "player_stats_insert_own" ON public.player_stats
    FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

CREATE POLICY "player_stats_update_own" ON public.player_stats
    FOR UPDATE TO authenticated USING (player_id = auth.uid());

