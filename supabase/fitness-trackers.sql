-- ============================================
-- FITNESS TRACKERS TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Workout sessions table
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID,
    day_key TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER,
    heart_rate_data INTEGER[], -- Array of HR readings
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    calories_burned INTEGER,
    steps INTEGER,
    distance_meters REAL,
    source TEXT NOT NULL DEFAULT 'manual', -- manual, web, apple_health, google_fit, garmin, fitbit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily fitness data (aggregated)
CREATE TABLE IF NOT EXISTS public.daily_fitness_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    steps INTEGER,
    distance_meters REAL,
    calories INTEGER,
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    active_minutes INTEGER,
    sleep_hours REAL,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, date)
);

-- Tracker connections
CREATE TABLE IF NOT EXISTS public.tracker_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL, -- apple_health, google_fit, garmin, fitbit, web
    is_connected BOOLEAN NOT NULL DEFAULT false,
    access_token TEXT, -- Encrypted token for OAuth providers
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_sync TIMESTAMPTZ,
    permissions TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(player_id, provider)
);

-- Fitness goals
CREATE TABLE IF NOT EXISTS public.fitness_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT NOT NULL, -- daily_steps, weekly_workouts, daily_calories, etc.
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    period TEXT NOT NULL DEFAULT 'daily', -- daily, weekly, monthly
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fitness_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
CREATE POLICY "Users can manage their workout sessions" ON public.workout_sessions
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

-- Coaches can view team workout sessions
CREATE POLICY "Coaches can view team workout sessions" ON public.workout_sessions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = workout_sessions.player_id AND t.coach_id = auth.uid()
        )
    );

-- RLS Policies for daily_fitness_data
CREATE POLICY "Users can manage their fitness data" ON public.daily_fitness_data
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

-- Coaches can view team fitness data
CREATE POLICY "Coaches can view team fitness data" ON public.daily_fitness_data
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = daily_fitness_data.player_id AND t.coach_id = auth.uid()
        )
    );

-- RLS Policies for tracker_connections
CREATE POLICY "Users can manage their tracker connections" ON public.tracker_connections
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

-- RLS Policies for fitness_goals
CREATE POLICY "Users can manage their fitness goals" ON public.fitness_goals
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_player ON public.workout_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_start ON public.workout_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_daily_fitness_player_date ON public.daily_fitness_data(player_id, date);
CREATE INDEX IF NOT EXISTS idx_tracker_connections_player ON public.tracker_connections(player_id);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_player ON public.fitness_goals(player_id);

-- Function to get weekly fitness summary
CREATE OR REPLACE FUNCTION get_weekly_fitness_summary(p_player_id UUID, p_week_start DATE)
RETURNS TABLE (
    total_steps BIGINT,
    total_distance REAL,
    total_calories BIGINT,
    total_active_minutes BIGINT,
    avg_heart_rate INTEGER,
    workout_count BIGINT,
    total_workout_duration BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(dfd.steps), 0)::BIGINT as total_steps,
        COALESCE(SUM(dfd.distance_meters), 0)::REAL as total_distance,
        COALESCE(SUM(dfd.calories), 0)::BIGINT as total_calories,
        COALESCE(SUM(dfd.active_minutes), 0)::BIGINT as total_active_minutes,
        COALESCE(AVG(dfd.heart_rate_avg), 0)::INTEGER as avg_heart_rate,
        (SELECT COUNT(*) FROM public.workout_sessions ws 
         WHERE ws.player_id = p_player_id 
         AND ws.start_time >= p_week_start 
         AND ws.start_time < p_week_start + INTERVAL '7 days')::BIGINT as workout_count,
        (SELECT COALESCE(SUM(ws.duration_seconds), 0) FROM public.workout_sessions ws 
         WHERE ws.player_id = p_player_id 
         AND ws.start_time >= p_week_start 
         AND ws.start_time < p_week_start + INTERVAL '7 days')::BIGINT as total_workout_duration
    FROM public.daily_fitness_data dfd
    WHERE dfd.player_id = p_player_id
    AND dfd.date >= p_week_start
    AND dfd.date < p_week_start + INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Fitness tracker tables created successfully' as status;

