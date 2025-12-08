-- Add birth_date column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add comment
COMMENT ON COLUMN public.profiles.birth_date IS 'Player birth date for age category calculation';

