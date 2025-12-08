-- ============================================
-- PUSH NOTIFICATIONS TABLES
-- Run this in Supabase SQL Editor
-- ============================================

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    training_reminder BOOLEAN NOT NULL DEFAULT true,
    streak_warning BOOLEAN NOT NULL DEFAULT true,
    achievement_unlocked BOOLEAN NOT NULL DEFAULT true,
    team_update BOOLEAN NOT NULL DEFAULT true,
    coach_message BOOLEAN NOT NULL DEFAULT true,
    reminder_time TIME NOT NULL DEFAULT '18:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification history table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS public.notification_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clicked_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their push subscriptions" ON public.push_subscriptions
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
    FOR ALL TO authenticated
    USING (player_id = auth.uid())
    WITH CHECK (player_id = auth.uid());

-- RLS Policies for notification_history
CREATE POLICY "Users can view their notification history" ON public.notification_history
    FOR SELECT TO authenticated
    USING (player_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notification_history
    FOR INSERT TO authenticated
    WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notification_history
    FOR UPDATE TO authenticated
    USING (player_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_player ON public.push_subscriptions(player_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_player ON public.notification_preferences(player_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_player ON public.notification_history(player_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent ON public.notification_history(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Push notification tables created successfully' as status;

