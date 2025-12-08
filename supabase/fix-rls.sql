-- FIX RLS POLICIES FOR PROFILES AND PLAYER_STATS
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own stats" ON public.player_stats;
DROP POLICY IF EXISTS "Users can manage own stats" ON public.player_stats;

-- Recreate with proper permissions
CREATE POLICY "Enable read for users based on id" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Player stats policies
CREATE POLICY "Enable read own stats" ON public.player_stats
    FOR SELECT USING (auth.uid() = player_id);

CREATE POLICY "Enable insert own stats" ON public.player_stats
    FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Enable update own stats" ON public.player_stats
    FOR UPDATE USING (auth.uid() = player_id);

-- Verify
SELECT 'RLS policies fixed!' as status;

