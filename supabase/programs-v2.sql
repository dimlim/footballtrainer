-- =====================================================
-- PROGRAMS V2 - Admin-managed programs
-- Only admin can create programs
-- Coaches select programs for teams
-- Players can use programs individually or via team
-- =====================================================

-- Drop old tables if they exist (from v1)
DROP TABLE IF EXISTS public.team_program_assignments CASCADE;
DROP TABLE IF EXISTS public.custom_exercises CASCADE;
DROP TABLE IF EXISTS public.custom_day_sections CASCADE;
DROP TABLE IF EXISTS public.custom_program_days CASCADE;
DROP TABLE IF EXISTS public.custom_programs CASCADE;

-- =====================================================
-- ADMIN ROLE
-- =====================================================

-- Add 'admin' to user roles if not exists
DO $$ 
BEGIN
    -- Check if admin role exists in profiles
    -- We'll use a simple approach - admin is identified by email or a flag
END $$;

-- Admin users table (simple approach - list of admin emails)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROGRAMS (Admin-managed)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic info
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    
    -- Categorization
    category TEXT NOT NULL DEFAULT 'technique', -- explosiveness, endurance, technique, strength, agility, recovery
    difficulty TEXT NOT NULL DEFAULT 'intermediate', -- beginner, intermediate, advanced
    duration_days INTEGER NOT NULL DEFAULT 30,
    
    -- Visual
    icon TEXT DEFAULT '⚽',
    cover_image TEXT,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    
    -- Monetization (for future)
    is_premium BOOLEAN NOT NULL DEFAULT false,
    price_usd DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROGRAM DAYS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.program_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    
    -- Info
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    focus_uk TEXT,
    focus_en TEXT,
    focus_cs TEXT,
    
    -- Settings
    intensity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
    location TEXT NOT NULL DEFAULT 'home', -- home, field, gym
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(program_id, day_number)
);

-- =====================================================
-- DAY SECTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.day_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    duration_minutes INTEGER,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(day_id, order_index)
);

-- =====================================================
-- EXERCISES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.day_sections(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    
    -- Basic info
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    
    -- Instructions (array of steps)
    description_uk TEXT[],
    description_en TEXT[],
    description_cs TEXT[],
    
    -- Sets/Reps
    sets_uk TEXT,
    sets_en TEXT,
    sets_cs TEXT,
    reps_uk TEXT,
    reps_en TEXT,
    reps_cs TEXT,
    rest_seconds INTEGER,
    
    -- Type
    exercise_type TEXT NOT NULL DEFAULT 'checkbox', -- checkbox, input, timer
    input_label_uk TEXT,
    input_label_en TEXT,
    input_label_cs TEXT,
    
    -- Notes
    note_uk TEXT,
    note_en TEXT,
    note_cs TEXT,
    
    -- Timer
    timer_duration INTEGER, -- seconds
    
    -- Media
    video_url TEXT,
    image_url TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TEAM PROGRAMS (Coach assigns programs to team)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    UNIQUE(team_id, program_id)
);

-- =====================================================
-- PLAYER PROGRAMS (Individual program selection)
-- =====================================================

-- Already exists as player_programs, but let's ensure it has program_id reference
-- We'll use the existing player_programs table but add program source tracking

ALTER TABLE public.player_programs 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'individual', -- 'individual' or 'team'
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- =====================================================
-- PROGRAM REQUESTS (Coaches can request new programs)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.program_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Requester
    requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Request details
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, completed
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = $1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN_USERS policies
CREATE POLICY "admin_users_select" ON public.admin_users
    FOR SELECT TO authenticated USING (user_id = auth.uid());

-- PROGRAMS policies
-- Everyone can view active programs
CREATE POLICY "programs_select" ON public.programs
    FOR SELECT TO authenticated USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "programs_insert" ON public.programs
    FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "programs_update" ON public.programs
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "programs_delete" ON public.programs
    FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- PROGRAM_DAYS policies
CREATE POLICY "program_days_select" ON public.program_days
    FOR SELECT TO authenticated USING (
        program_id IN (SELECT id FROM public.programs WHERE is_active = true)
    );

CREATE POLICY "program_days_insert" ON public.program_days
    FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "program_days_update" ON public.program_days
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "program_days_delete" ON public.program_days
    FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- DAY_SECTIONS policies
CREATE POLICY "day_sections_select" ON public.day_sections
    FOR SELECT TO authenticated USING (
        day_id IN (
            SELECT id FROM public.program_days 
            WHERE program_id IN (SELECT id FROM public.programs WHERE is_active = true)
        )
    );

CREATE POLICY "day_sections_insert" ON public.day_sections
    FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "day_sections_update" ON public.day_sections
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "day_sections_delete" ON public.day_sections
    FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- EXERCISES policies
CREATE POLICY "exercises_select" ON public.exercises
    FOR SELECT TO authenticated USING (
        section_id IN (
            SELECT id FROM public.day_sections 
            WHERE day_id IN (
                SELECT id FROM public.program_days 
                WHERE program_id IN (SELECT id FROM public.programs WHERE is_active = true)
            )
        )
    );

CREATE POLICY "exercises_insert" ON public.exercises
    FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "exercises_update" ON public.exercises
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "exercises_delete" ON public.exercises
    FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- TEAM_PROGRAMS policies
-- Coaches can manage their team programs
CREATE POLICY "team_programs_select" ON public.team_programs
    FOR SELECT TO authenticated USING (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
        OR team_id IN (SELECT team_id FROM public.team_members WHERE player_id = auth.uid())
    );

CREATE POLICY "team_programs_insert" ON public.team_programs
    FOR INSERT TO authenticated WITH CHECK (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

CREATE POLICY "team_programs_update" ON public.team_programs
    FOR UPDATE TO authenticated USING (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

CREATE POLICY "team_programs_delete" ON public.team_programs
    FOR DELETE TO authenticated USING (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

-- PROGRAM_REQUESTS policies
-- Users can see their own requests, admins can see all
CREATE POLICY "program_requests_select" ON public.program_requests
    FOR SELECT TO authenticated USING (
        requested_by = auth.uid() OR public.is_admin(auth.uid())
    );

CREATE POLICY "program_requests_insert" ON public.program_requests
    FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());

CREATE POLICY "program_requests_update" ON public.program_requests
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_programs_active ON public.programs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_programs_category ON public.programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON public.programs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_program_days_program ON public.program_days(program_id);
CREATE INDEX IF NOT EXISTS idx_day_sections_day ON public.day_sections(day_id);
CREATE INDEX IF NOT EXISTS idx_exercises_section ON public.exercises(section_id);
CREATE INDEX IF NOT EXISTS idx_team_programs_team ON public.team_programs(team_id);
CREATE INDEX IF NOT EXISTS idx_program_requests_status ON public.program_requests(status);

-- =====================================================
-- SEED: Make yourself an admin
-- Replace 'YOUR_USER_ID' with your actual user ID from profiles table
-- =====================================================

-- INSERT INTO public.admin_users (user_id) 
-- SELECT id FROM public.profiles WHERE email = 'your-email@example.com';

