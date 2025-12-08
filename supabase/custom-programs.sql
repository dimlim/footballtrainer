-- =====================================================
-- CUSTOM TRAINING PROGRAMS - Database Schema
-- For coaches to create and manage their own programs
-- =====================================================

-- Programs table
CREATE TABLE IF NOT EXISTS public.custom_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    category TEXT NOT NULL DEFAULT 'technique', -- explosiveness, endurance, technique, strength, agility, recovery
    difficulty TEXT NOT NULL DEFAULT 'intermediate', -- beginner, intermediate, advanced
    duration_days INTEGER NOT NULL DEFAULT 30,
    icon TEXT DEFAULT '⚽',
    cover_image TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Training days table
CREATE TABLE IF NOT EXISTS public.custom_program_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.custom_programs(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    focus_uk TEXT,
    focus_en TEXT,
    focus_cs TEXT,
    intensity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
    location TEXT NOT NULL DEFAULT 'home', -- home, field, gym
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(program_id, day_number)
);

-- Sections within a day
CREATE TABLE IF NOT EXISTS public.custom_day_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_id UUID REFERENCES public.custom_program_days(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(day_id, order_index)
);

-- Exercises within a section
CREATE TABLE IF NOT EXISTS public.custom_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.custom_day_sections(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    description_uk TEXT[], -- Array of instruction steps
    description_en TEXT[],
    description_cs TEXT[],
    sets_uk TEXT,
    sets_en TEXT,
    sets_cs TEXT,
    reps_uk TEXT,
    reps_en TEXT,
    reps_cs TEXT,
    rest_seconds INTEGER,
    exercise_type TEXT NOT NULL DEFAULT 'checkbox', -- checkbox, input, timer
    input_label_uk TEXT,
    input_label_en TEXT,
    input_label_cs TEXT,
    note_uk TEXT,
    note_en TEXT,
    note_cs TEXT,
    timer_duration INTEGER, -- seconds
    video_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team program assignments
CREATE TABLE IF NOT EXISTS public.team_program_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.custom_programs(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES public.profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(team_id, program_id)
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.custom_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_day_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_program_assignments ENABLE ROW LEVEL SECURITY;

-- CUSTOM_PROGRAMS policies
-- Coaches can manage their own programs
CREATE POLICY "programs_select_own" ON public.custom_programs
    FOR SELECT TO authenticated USING (
        coach_id = auth.uid() OR is_public = true
    );

CREATE POLICY "programs_insert" ON public.custom_programs
    FOR INSERT TO authenticated WITH CHECK (coach_id = auth.uid());

CREATE POLICY "programs_update" ON public.custom_programs
    FOR UPDATE TO authenticated USING (coach_id = auth.uid());

CREATE POLICY "programs_delete" ON public.custom_programs
    FOR DELETE TO authenticated USING (coach_id = auth.uid());

-- CUSTOM_PROGRAM_DAYS policies
CREATE POLICY "days_select" ON public.custom_program_days
    FOR SELECT TO authenticated USING (
        program_id IN (SELECT id FROM public.custom_programs WHERE coach_id = auth.uid() OR is_public = true)
    );

CREATE POLICY "days_insert" ON public.custom_program_days
    FOR INSERT TO authenticated WITH CHECK (
        program_id IN (SELECT id FROM public.custom_programs WHERE coach_id = auth.uid())
    );

CREATE POLICY "days_update" ON public.custom_program_days
    FOR UPDATE TO authenticated USING (
        program_id IN (SELECT id FROM public.custom_programs WHERE coach_id = auth.uid())
    );

CREATE POLICY "days_delete" ON public.custom_program_days
    FOR DELETE TO authenticated USING (
        program_id IN (SELECT id FROM public.custom_programs WHERE coach_id = auth.uid())
    );

-- CUSTOM_DAY_SECTIONS policies
CREATE POLICY "sections_select" ON public.custom_day_sections
    FOR SELECT TO authenticated USING (
        day_id IN (
            SELECT d.id FROM public.custom_program_days d
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid() OR p.is_public = true
        )
    );

CREATE POLICY "sections_insert" ON public.custom_day_sections
    FOR INSERT TO authenticated WITH CHECK (
        day_id IN (
            SELECT d.id FROM public.custom_program_days d
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid()
        )
    );

CREATE POLICY "sections_update" ON public.custom_day_sections
    FOR UPDATE TO authenticated USING (
        day_id IN (
            SELECT d.id FROM public.custom_program_days d
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid()
        )
    );

CREATE POLICY "sections_delete" ON public.custom_day_sections
    FOR DELETE TO authenticated USING (
        day_id IN (
            SELECT d.id FROM public.custom_program_days d
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid()
        )
    );

-- CUSTOM_EXERCISES policies
CREATE POLICY "exercises_select" ON public.custom_exercises
    FOR SELECT TO authenticated USING (
        section_id IN (
            SELECT s.id FROM public.custom_day_sections s
            JOIN public.custom_program_days d ON s.day_id = d.id
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid() OR p.is_public = true
        )
    );

CREATE POLICY "exercises_insert" ON public.custom_exercises
    FOR INSERT TO authenticated WITH CHECK (
        section_id IN (
            SELECT s.id FROM public.custom_day_sections s
            JOIN public.custom_program_days d ON s.day_id = d.id
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid()
        )
    );

CREATE POLICY "exercises_update" ON public.custom_exercises
    FOR UPDATE TO authenticated USING (
        section_id IN (
            SELECT s.id FROM public.custom_day_sections s
            JOIN public.custom_program_days d ON s.day_id = d.id
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid()
        )
    );

CREATE POLICY "exercises_delete" ON public.custom_exercises
    FOR DELETE TO authenticated USING (
        section_id IN (
            SELECT s.id FROM public.custom_day_sections s
            JOIN public.custom_program_days d ON s.day_id = d.id
            JOIN public.custom_programs p ON d.program_id = p.id
            WHERE p.coach_id = auth.uid()
        )
    );

-- TEAM_PROGRAM_ASSIGNMENTS policies
CREATE POLICY "assignments_select" ON public.team_program_assignments
    FOR SELECT TO authenticated USING (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
        OR team_id IN (SELECT team_id FROM public.team_members WHERE player_id = auth.uid())
    );

CREATE POLICY "assignments_insert" ON public.team_program_assignments
    FOR INSERT TO authenticated WITH CHECK (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

CREATE POLICY "assignments_delete" ON public.team_program_assignments
    FOR DELETE TO authenticated USING (
        team_id IN (SELECT id FROM public.teams WHERE coach_id = auth.uid())
    );

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_custom_programs_coach ON public.custom_programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_custom_programs_public ON public.custom_programs(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_program_days_program ON public.custom_program_days(program_id);
CREATE INDEX IF NOT EXISTS idx_day_sections_day ON public.custom_day_sections(day_id);
CREATE INDEX IF NOT EXISTS idx_exercises_section ON public.custom_exercises(section_id);
CREATE INDEX IF NOT EXISTS idx_team_assignments_team ON public.team_program_assignments(team_id);

