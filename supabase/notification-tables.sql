-- =====================================================
-- NOTIFICATION TABLES
-- Таблиці для push-сповіщень
-- =====================================================

-- =====================================================
-- 1. Налаштування сповіщень користувача
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Типи сповіщень
  training_reminders BOOLEAN DEFAULT true,
  streak_warnings BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  team_updates BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  
  -- Час для сповіщень
  preferred_reminder_time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'Europe/Prague',
  
  -- Тихі години
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '07:00:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id)
);

-- =====================================================
-- 2. Push підписки (для Web Push API)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Web Push subscription data
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  -- Metadata
  user_agent TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, endpoint)
);

-- =====================================================
-- 3. Історія сповіщень
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Тип та контент
  notification_type TEXT NOT NULL, -- 'training_reminder', 'streak_warning', 'achievement', 'team_update', 'weekly_report'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  
  -- Статус
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Результат
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'clicked', 'failed'
  error_message TEXT
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_notification_preferences_player ON public.notification_preferences(player_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_player ON public.push_subscriptions(player_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_player ON public.notification_history(player_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON public.notification_history(sent_at DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- notification_preferences policies
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = player_id);

-- push_subscriptions policies
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = player_id);

-- notification_history policies
DROP POLICY IF EXISTS "Users can view own notification history" ON public.notification_history;
CREATE POLICY "Users can view own notification history" ON public.notification_history
  FOR SELECT USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Service role can insert notification history" ON public.notification_history;
CREATE POLICY "Service role can insert notification history" ON public.notification_history
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger for notification_preferences
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for push_subscriptions
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Create default preferences for new users
-- =====================================================
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (player_id)
  VALUES (NEW.id)
  ON CONFLICT (player_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences
DROP TRIGGER IF EXISTS on_profile_created_notification_prefs ON public.profiles;
CREATE TRIGGER on_profile_created_notification_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- Insert default preferences for existing users
-- =====================================================
INSERT INTO public.notification_preferences (player_id)
SELECT id FROM public.profiles
ON CONFLICT (player_id) DO NOTHING;

-- =====================================================
-- DONE
-- =====================================================
SELECT 'Notification tables created successfully!' as status;

