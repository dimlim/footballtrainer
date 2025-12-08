-- Add onboarding_completed field to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update existing users to have onboarding completed (they don't need to see it)
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE created_at < NOW() - INTERVAL '1 day';

SELECT 'onboarding_completed field added successfully' as status;

