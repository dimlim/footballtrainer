-- =====================================================
-- AGE CATEGORIES SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ADD AGE CATEGORY TYPE
-- =====================================================

DO $$ BEGIN
    CREATE TYPE public.age_category AS ENUM (
        'U8',      -- 5-7 років
        'U10',     -- 8-9 років
        'U12',     -- 10-11 років
        'U14',     -- 12-13 років
        'U16',     -- 14-15 років
        'U18',     -- 16-17 років
        'Senior'   -- 18+ років
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. ADD BIRTH DATE TO PROFILES
-- =====================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add computed age category function
CREATE OR REPLACE FUNCTION public.get_age_category(birth_date DATE)
RETURNS public.age_category AS $$
DECLARE
    age_years INTEGER;
BEGIN
    IF birth_date IS NULL THEN
        RETURN 'Senior'::public.age_category;
    END IF;
    
    age_years := EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
    
    IF age_years <= 7 THEN
        RETURN 'U8'::public.age_category;
    ELSIF age_years <= 9 THEN
        RETURN 'U10'::public.age_category;
    ELSIF age_years <= 11 THEN
        RETURN 'U12'::public.age_category;
    ELSIF age_years <= 13 THEN
        RETURN 'U14'::public.age_category;
    ELSIF age_years <= 15 THEN
        RETURN 'U16'::public.age_category;
    ELSIF age_years <= 17 THEN
        RETURN 'U18'::public.age_category;
    ELSE
        RETURN 'Senior'::public.age_category;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 3. ADD AGE CATEGORIES TO PROGRAMS
-- =====================================================

-- Add age_categories array to programs table
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS age_categories public.age_category[] DEFAULT ARRAY['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Senior']::public.age_category[];

-- Add min/max age for more flexibility
ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 5;

ALTER TABLE public.programs
ADD COLUMN IF NOT EXISTS max_age INTEGER DEFAULT 99;

-- =====================================================
-- 4. AGE-SPECIFIC EXERCISE VARIATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.exercise_age_variations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    age_category public.age_category NOT NULL,
    
    -- Override values for this age category
    sets_uk TEXT,
    sets_en TEXT,
    sets_cs TEXT,
    reps_uk TEXT,
    reps_en TEXT,
    reps_cs TEXT,
    rest_seconds INTEGER,
    timer_duration INTEGER,
    
    -- Simplified description for younger players
    description_uk TEXT[],
    description_en TEXT[],
    description_cs TEXT[],
    
    -- Notes specific to age group
    note_uk TEXT,
    note_en TEXT,
    note_cs TEXT,
    
    -- Can mark exercise as skipped for certain ages
    is_skipped BOOLEAN DEFAULT false,
    
    -- Alternative exercise for this age group
    alternative_title_uk TEXT,
    alternative_title_en TEXT,
    alternative_title_cs TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exercise_id, age_category)
);

-- Enable RLS
ALTER TABLE public.exercise_age_variations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "exercise_age_variations_select" ON public.exercise_age_variations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "exercise_age_variations_insert" ON public.exercise_age_variations
    FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "exercise_age_variations_update" ON public.exercise_age_variations
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "exercise_age_variations_delete" ON public.exercise_age_variations
    FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- =====================================================
-- 5. AGE CATEGORY SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.age_category_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category public.age_category UNIQUE NOT NULL,
    
    -- Display info
    label_uk TEXT NOT NULL,
    label_en TEXT NOT NULL,
    label_cs TEXT NOT NULL,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    
    -- Age range
    min_age INTEGER NOT NULL,
    max_age INTEGER NOT NULL,
    
    -- Training parameters
    recommended_session_duration INTEGER NOT NULL, -- minutes
    max_session_duration INTEGER NOT NULL,
    recommended_rest_multiplier DECIMAL(3,2) DEFAULT 1.0, -- multiply rest times
    recommended_reps_multiplier DECIMAL(3,2) DEFAULT 1.0, -- multiply reps
    
    -- Features
    allow_strength_exercises BOOLEAN DEFAULT false,
    allow_long_sprints BOOLEAN DEFAULT false,
    game_elements_percentage INTEGER DEFAULT 50, -- % of training should be game-like
    
    -- UI
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT '⚽',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.age_category_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "age_category_settings_select" ON public.age_category_settings
    FOR SELECT TO authenticated USING (true);

-- Insert default settings
INSERT INTO public.age_category_settings (
    category, label_uk, label_en, label_cs,
    description_uk, description_en, description_cs,
    min_age, max_age,
    recommended_session_duration, max_session_duration,
    recommended_rest_multiplier, recommended_reps_multiplier,
    allow_strength_exercises, allow_long_sprints, game_elements_percentage,
    color, icon
) VALUES
(
    'U8', 'До 8 років', 'Under 8', 'Do 8 let',
    'Ігрові вправи, розвиток координації та любові до футболу',
    'Game-based exercises, coordination development and love for football',
    'Herní cvičení, rozvoj koordinace a lásky k fotbalu',
    5, 7,
    25, 35,
    1.5, 0.5,
    false, false, 70,
    '#22C55E', '🎮'
),
(
    'U10', 'До 10 років', 'Under 10', 'Do 10 let',
    'Базова техніка з м''ячем, ігрові елементи',
    'Basic ball technique, game elements',
    'Základní technika s míčem, herní prvky',
    8, 9,
    35, 45,
    1.3, 0.7,
    false, false, 60,
    '#3B82F6', '⚽'
),
(
    'U12', 'До 12 років', 'Under 12', 'Do 12 let',
    'Техніка + базова тактика, командна гра',
    'Technique + basic tactics, team play',
    'Technika + základní taktika, týmová hra',
    10, 11,
    45, 55,
    1.2, 0.85,
    false, true, 50,
    '#8B5CF6', '🎯'
),
(
    'U14', 'До 14 років', 'Under 14', 'Do 14 let',
    'Інтенсивніші тренування, початок силової підготовки',
    'More intensive training, beginning of strength preparation',
    'Intenzivnější trénink, začátek silové přípravy',
    12, 13,
    50, 60,
    1.1, 1.0,
    true, true, 40,
    '#F59E0B', '💪'
),
(
    'U16', 'До 16 років', 'Under 16', 'Do 16 let',
    'Повноцінні тренування, фізична підготовка',
    'Full training, physical preparation',
    'Plnohodnotný trénink, fyzická příprava',
    14, 15,
    55, 70,
    1.0, 1.0,
    true, true, 30,
    '#EF4444', '🔥'
),
(
    'U18', 'До 18 років', 'Under 18', 'Do 18 let',
    'Професійний підхід, підготовка до дорослого футболу',
    'Professional approach, preparation for adult football',
    'Profesionální přístup, příprava na dospělý fotbal',
    16, 17,
    60, 80,
    1.0, 1.1,
    true, true, 25,
    '#DC2626', '⚡'
),
(
    'Senior', 'Дорослі', 'Adults', 'Dospělí',
    'Повне навантаження без обмежень',
    'Full load without restrictions',
    'Plná zátěž bez omezení',
    18, 99,
    60, 90,
    1.0, 1.2,
    true, true, 20,
    '#1F2937', '🏆'
)
ON CONFLICT (category) DO UPDATE SET
    label_uk = EXCLUDED.label_uk,
    label_en = EXCLUDED.label_en,
    label_cs = EXCLUDED.label_cs,
    description_uk = EXCLUDED.description_uk,
    description_en = EXCLUDED.description_en,
    description_cs = EXCLUDED.description_cs;

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Get programs suitable for user's age
CREATE OR REPLACE FUNCTION public.get_programs_for_age(user_birth_date DATE)
RETURNS SETOF public.programs AS $$
DECLARE
    user_category public.age_category;
BEGIN
    user_category := public.get_age_category(user_birth_date);
    
    RETURN QUERY
    SELECT p.*
    FROM public.programs p
    WHERE p.is_active = true
    AND user_category = ANY(p.age_categories);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get exercise with age-specific overrides
CREATE OR REPLACE FUNCTION public.get_exercise_for_age(
    p_exercise_id UUID,
    p_age_category public.age_category
)
RETURNS TABLE (
    id UUID,
    title_uk TEXT,
    title_en TEXT,
    title_cs TEXT,
    description_uk TEXT[],
    description_en TEXT[],
    description_cs TEXT[],
    exercise_type TEXT,
    sets_uk TEXT,
    sets_en TEXT,
    sets_cs TEXT,
    reps_uk TEXT,
    reps_en TEXT,
    reps_cs TEXT,
    rest_seconds INTEGER,
    timer_duration INTEGER,
    note_uk TEXT,
    note_en TEXT,
    note_cs TEXT,
    is_skipped BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        COALESCE(v.alternative_title_uk, e.title_uk) as title_uk,
        COALESCE(v.alternative_title_en, e.title_en) as title_en,
        COALESCE(v.alternative_title_cs, e.title_cs) as title_cs,
        COALESCE(v.description_uk, e.description_uk) as description_uk,
        COALESCE(v.description_en, e.description_en) as description_en,
        COALESCE(v.description_cs, e.description_cs) as description_cs,
        e.exercise_type,
        COALESCE(v.sets_uk, e.sets_uk) as sets_uk,
        COALESCE(v.sets_en, e.sets_en) as sets_en,
        COALESCE(v.sets_cs, e.sets_cs) as sets_cs,
        COALESCE(v.reps_uk, e.reps_uk) as reps_uk,
        COALESCE(v.reps_en, e.reps_en) as reps_en,
        COALESCE(v.reps_cs, e.reps_cs) as reps_cs,
        COALESCE(v.rest_seconds, e.rest_seconds) as rest_seconds,
        COALESCE(v.timer_duration, e.timer_duration) as timer_duration,
        COALESCE(v.note_uk, e.note_uk) as note_uk,
        COALESCE(v.note_en, e.note_en) as note_en,
        COALESCE(v.note_cs, e.note_cs) as note_cs,
        COALESCE(v.is_skipped, false) as is_skipped
    FROM public.exercises e
    LEFT JOIN public.exercise_age_variations v 
        ON v.exercise_id = e.id AND v.age_category = p_age_category
    WHERE e.id = p_exercise_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 7. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON public.profiles(birth_date);
CREATE INDEX IF NOT EXISTS idx_programs_age_categories ON public.programs USING GIN(age_categories);
CREATE INDEX IF NOT EXISTS idx_exercise_age_variations_exercise ON public.exercise_age_variations(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_age_variations_category ON public.exercise_age_variations(age_category);

-- =====================================================
-- 8. UPDATE EXISTING PROGRAMS (set default age categories)
-- =====================================================

UPDATE public.programs
SET age_categories = ARRAY['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Senior']::public.age_category[]
WHERE age_categories IS NULL;

