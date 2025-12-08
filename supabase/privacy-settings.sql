-- ============================================
-- Privacy Settings for Players
-- Run this in Supabase SQL Editor
-- ============================================

-- Add privacy column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_in_leaderboard BOOLEAN NOT NULL DEFAULT true;

-- Comment for clarity
COMMENT ON COLUMN public.profiles.show_in_leaderboard IS 'If true, player stats are visible to other team members. Coach always sees all.';

