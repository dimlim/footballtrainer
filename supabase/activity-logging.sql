-- ============================================
-- ACTIVITY LOGGING FOR COACHES
-- Detailed player activity tracking
-- Run this in Supabase SQL Editor
-- ============================================

-- Player activity log (every action)
CREATE TABLE IF NOT EXISTS public.player_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL, -- login, exercise_start, exercise_complete, day_complete, measurement, etc.
    program_id UUID,
    day_key TEXT,
    exercise_id TEXT,
    metadata JSONB, -- Additional data (measurement values, duration, etc.)
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT, -- mobile, tablet, desktop
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session tracking (when player is active)
CREATE TABLE IF NOT EXISTS public.player_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    duration_seconds INTEGER,
    pages_visited INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    device_type TEXT,
    app_version TEXT
);

-- Exercise timing (for verification)
CREATE TABLE IF NOT EXISTS public.exercise_timing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exercise_id TEXT NOT NULL,
    day_key TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    expected_duration_seconds INTEGER, -- How long exercise should take
    actual_duration_seconds INTEGER,
    is_suspicious BOOLEAN DEFAULT false, -- If completed too fast
    verification_status TEXT DEFAULT 'pending', -- pending, verified, flagged
    coach_notes TEXT,
    UNIQUE(player_id, exercise_id, day_key)
);

-- Daily summary for quick coach overview
CREATE TABLE IF NOT EXISTS public.player_daily_summary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    first_activity TIMESTAMPTZ,
    last_activity TIMESTAMPTZ,
    total_active_minutes INTEGER DEFAULT 0,
    exercises_started INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    days_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    suspicious_activities INTEGER DEFAULT 0,
    login_count INTEGER DEFAULT 0,
    UNIQUE(player_id, date)
);

-- Coach verification queue
CREATE TABLE IF NOT EXISTS public.coach_verification_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_id UUID, -- Reference to specific activity
    reason TEXT, -- Why flagged
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    reviewed_at TIMESTAMPTZ,
    coach_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.player_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_timing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_verification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Players can insert their own activity
CREATE POLICY "Players insert own activity" ON public.player_activity_log
    FOR INSERT TO authenticated
    WITH CHECK (player_id = auth.uid());

-- Players can view their own activity
CREATE POLICY "Players view own activity" ON public.player_activity_log
    FOR SELECT TO authenticated
    USING (player_id = auth.uid());

-- Coaches can view team activity
CREATE POLICY "Coaches view team activity" ON public.player_activity_log
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_activity_log.player_id 
            AND t.coach_id = auth.uid()
        )
    );

-- Sessions policies
CREATE POLICY "Players manage own sessions" ON public.player_sessions
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

CREATE POLICY "Coaches view team sessions" ON public.player_sessions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_sessions.player_id 
            AND t.coach_id = auth.uid()
        )
    );

-- Exercise timing policies
CREATE POLICY "Players manage own timing" ON public.exercise_timing
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

CREATE POLICY "Coaches view team timing" ON public.exercise_timing
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = exercise_timing.player_id 
            AND t.coach_id = auth.uid()
        )
    );

CREATE POLICY "Coaches update team timing" ON public.exercise_timing
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = exercise_timing.player_id 
            AND t.coach_id = auth.uid()
        )
    );

-- Daily summary policies
CREATE POLICY "Players view own summary" ON public.player_daily_summary
    FOR SELECT TO authenticated
    USING (player_id = auth.uid());

CREATE POLICY "System insert summary" ON public.player_daily_summary
    FOR INSERT TO authenticated
    WITH CHECK (player_id = auth.uid());

CREATE POLICY "System update summary" ON public.player_daily_summary
    FOR UPDATE TO authenticated
    USING (player_id = auth.uid());

CREATE POLICY "Coaches view team summary" ON public.player_daily_summary
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            JOIN public.teams t ON tm.team_id = t.id
            WHERE tm.player_id = player_daily_summary.player_id 
            AND t.coach_id = auth.uid()
        )
    );

-- Verification queue policies
CREATE POLICY "Coaches manage own queue" ON public.coach_verification_queue
    FOR ALL TO authenticated
    USING (coach_id = auth.uid())
    WITH CHECK (coach_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_log_player ON public.player_activity_log(player_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.player_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.player_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_sessions_player ON public.player_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.player_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_timing_player ON public.exercise_timing(player_id);
CREATE INDEX IF NOT EXISTS idx_timing_suspicious ON public.exercise_timing(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_daily_summary_player_date ON public.player_daily_summary(player_id, date);
CREATE INDEX IF NOT EXISTS idx_verification_queue_coach ON public.coach_verification_queue(coach_id);
CREATE INDEX IF NOT EXISTS idx_verification_queue_status ON public.coach_verification_queue(status);

-- Function to update daily summary
CREATE OR REPLACE FUNCTION update_player_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
BEGIN
    v_date := DATE(NEW.created_at);
    
    INSERT INTO public.player_daily_summary (player_id, date, first_activity, last_activity)
    VALUES (NEW.player_id, v_date, NEW.created_at, NEW.created_at)
    ON CONFLICT (player_id, date) DO UPDATE SET
        last_activity = NEW.created_at,
        login_count = CASE 
            WHEN NEW.activity_type = 'login' THEN player_daily_summary.login_count + 1 
            ELSE player_daily_summary.login_count 
        END,
        exercises_started = CASE 
            WHEN NEW.activity_type = 'exercise_start' THEN player_daily_summary.exercises_started + 1 
            ELSE player_daily_summary.exercises_started 
        END,
        exercises_completed = CASE 
            WHEN NEW.activity_type = 'exercise_complete' THEN player_daily_summary.exercises_completed + 1 
            ELSE player_daily_summary.exercises_completed 
        END,
        days_completed = CASE 
            WHEN NEW.activity_type = 'day_complete' THEN player_daily_summary.days_completed + 1 
            ELSE player_daily_summary.days_completed 
        END,
        xp_earned = CASE 
            WHEN (NEW.metadata->>'xp_earned') IS NOT NULL 
            THEN player_daily_summary.xp_earned + (NEW.metadata->>'xp_earned')::INTEGER 
            ELSE player_daily_summary.xp_earned 
        END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-updating daily summary
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON public.player_activity_log;
CREATE TRIGGER trigger_update_daily_summary
    AFTER INSERT ON public.player_activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_player_daily_summary();

-- Function to check suspicious activity
CREATE OR REPLACE FUNCTION check_suspicious_timing()
RETURNS TRIGGER AS $$
BEGIN
    -- If completed in less than 30% of expected time, flag as suspicious
    IF NEW.completed_at IS NOT NULL AND NEW.expected_duration_seconds IS NOT NULL THEN
        NEW.actual_duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
        
        IF NEW.actual_duration_seconds < (NEW.expected_duration_seconds * 0.3) THEN
            NEW.is_suspicious := true;
            NEW.verification_status := 'flagged';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for suspicious activity check
DROP TRIGGER IF EXISTS trigger_check_suspicious ON public.exercise_timing;
CREATE TRIGGER trigger_check_suspicious
    BEFORE UPDATE ON public.exercise_timing
    FOR EACH ROW
    EXECUTE FUNCTION check_suspicious_timing();

-- Function to get player activity summary for coach
CREATE OR REPLACE FUNCTION get_team_activity_summary(p_coach_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    player_id UUID,
    player_name TEXT,
    total_logins BIGINT,
    total_exercises BIGINT,
    total_days_completed BIGINT,
    total_xp BIGINT,
    suspicious_count BIGINT,
    last_active TIMESTAMPTZ,
    avg_session_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pds.player_id,
        p.full_name as player_name,
        SUM(pds.login_count)::BIGINT as total_logins,
        SUM(pds.exercises_completed)::BIGINT as total_exercises,
        SUM(pds.days_completed)::BIGINT as total_days_completed,
        SUM(pds.xp_earned)::BIGINT as total_xp,
        SUM(pds.suspicious_activities)::BIGINT as suspicious_count,
        MAX(pds.last_activity) as last_active,
        AVG(pds.total_active_minutes)::NUMERIC as avg_session_minutes
    FROM public.player_daily_summary pds
    JOIN public.profiles p ON p.id = pds.player_id
    JOIN public.team_members tm ON tm.player_id = pds.player_id
    JOIN public.teams t ON t.id = tm.team_id
    WHERE t.coach_id = p_coach_id
    AND pds.date >= CURRENT_DATE - p_days
    GROUP BY pds.player_id, p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get detailed player activity
CREATE OR REPLACE FUNCTION get_player_activity_detail(p_player_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    activity_date DATE,
    activity_type TEXT,
    activity_count BIGINT,
    total_duration_minutes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(pal.created_at) as activity_date,
        pal.activity_type,
        COUNT(*)::BIGINT as activity_count,
        COALESCE(SUM((pal.metadata->>'duration_seconds')::INTEGER / 60), 0)::BIGINT as total_duration_minutes
    FROM public.player_activity_log pal
    WHERE pal.player_id = p_player_id
    AND pal.created_at >= CURRENT_DATE - p_days
    GROUP BY DATE(pal.created_at), pal.activity_type
    ORDER BY activity_date DESC, activity_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Activity logging tables created successfully' as status;

