-- =====================================================
-- TRAINING SCHEDULE SYSTEM
-- Персоналізована система розкладу тренувань
-- =====================================================

-- Тип дня тренування
DO $$ BEGIN
  CREATE TYPE training_day_type AS ENUM (
    'full_training',    -- Повне тренування (45-60 хв)
    'light_training',   -- Легке тренування (20-30 хв)
    'skills_only',      -- Тільки техніка (15-20 хв)
    'recovery',         -- Відновлення (10-15 хв)
    'match_prep',       -- Підготовка до матчу
    'post_match',       -- Після матчу
    'team_training',    -- Командне тренування
    'match_day',        -- День матчу
    'rest'              -- Повний відпочинок
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Рівень підготовки
DO $$ BEGIN
  CREATE TYPE skill_level AS ENUM (
    'beginner',         -- Початківець
    'intermediate',     -- Середній
    'advanced'          -- Просунутий
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Позиція на полі
DO $$ BEGIN
  CREATE TYPE player_position AS ENUM (
    'goalkeeper',       -- Воротар
    'defender',         -- Захисник
    'midfielder',       -- Півзахисник
    'forward',          -- Нападник
    'universal'         -- Універсал
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Інтенсивність
DO $$ BEGIN
  CREATE TYPE intensity_level AS ENUM (
    'very_low',
    'low',
    'medium',
    'high',
    'very_high'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- РОЗШИРЕННЯ ПРОФІЛЮ ГРАВЦЯ
-- =====================================================

-- Додаткові поля для профілю
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skill_level skill_level DEFAULT 'beginner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position player_position DEFAULT 'universal';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level INTEGER DEFAULT 3 CHECK (fitness_level >= 1 AND fitness_level <= 5);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_training_time TEXT DEFAULT 'evening'; -- morning, afternoon, evening
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_trainings_per_week INTEGER DEFAULT 4 CHECK (max_trainings_per_week >= 1 AND max_trainings_per_week <= 7);

-- =====================================================
-- НАЛАШТУВАННЯ РОЗКЛАДУ ГРАВЦЯ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.player_schedule_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Дні тижня для індивідуальних тренувань (0=Нд, 1=Пн, ..., 6=Сб)
  training_days INTEGER[] DEFAULT ARRAY[1, 3, 5], -- Пн, Ср, Пт за замовчуванням
  
  -- Кількість тренувань на тиждень
  trainings_per_week INTEGER DEFAULT 3 CHECK (trainings_per_week >= 1 AND trainings_per_week <= 6),
  
  -- Чи є командні тренування
  has_team_training BOOLEAN DEFAULT false,
  
  -- Дні командних тренувань
  team_training_days INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  
  -- День матчу (якщо регулярний)
  match_day INTEGER, -- 0-6, null якщо немає регулярного
  
  -- Бажаний час тренування
  preferred_time TIME DEFAULT '18:00',
  
  -- Тривалість тренування в хвилинах
  preferred_duration INTEGER DEFAULT 45,
  
  -- Автоматичне планування
  auto_schedule BOOLEAN DEFAULT true,
  
  -- Враховувати відновлення
  consider_recovery BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id)
);

-- =====================================================
-- КОМАНДНИЙ РОЗКЛАД (від тренера)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  
  -- День тижня (0=Нд, 1=Пн, ..., 6=Сб)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Тип події
  event_type training_day_type NOT NULL DEFAULT 'team_training',
  
  -- Час початку та кінця
  start_time TIME NOT NULL,
  end_time TIME,
  
  -- Опис
  title TEXT,
  description TEXT,
  
  -- Локація
  location TEXT,
  
  -- Інтенсивність
  intensity intensity_level DEFAULT 'medium',
  
  -- Активний
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ОДНОРАЗОВІ ПОДІЇ КОМАНДИ (матчі, турніри)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  
  -- Дата та час
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  
  -- Тип події
  event_type training_day_type NOT NULL,
  
  -- Деталі
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  opponent TEXT, -- Для матчів
  
  -- Інтенсивність
  intensity intensity_level DEFAULT 'high',
  
  -- Статус
  is_cancelled BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ПЕРСОНАЛЬНИЙ КАЛЕНДАР ГРАВЦЯ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.player_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Дата
  calendar_date DATE NOT NULL,
  
  -- Тип дня
  day_type training_day_type NOT NULL,
  
  -- Зв'язок з програмою (якщо індивідуальне тренування)
  program_id UUID REFERENCES public.programs(id),
  program_day_id UUID REFERENCES public.program_days(id),
  
  -- Зв'язок з командною подією
  team_event_id UUID REFERENCES public.team_events(id),
  team_schedule_id UUID REFERENCES public.team_schedule(id),
  
  -- Деталі
  title TEXT,
  description TEXT,
  
  -- Час
  scheduled_time TIME,
  duration_minutes INTEGER,
  
  -- Інтенсивність
  intensity intensity_level DEFAULT 'medium',
  
  -- Статус
  is_completed BOOLEAN DEFAULT false,
  is_skipped BOOLEAN DEFAULT false,
  is_rescheduled BOOLEAN DEFAULT false,
  original_date DATE, -- Якщо перенесено
  
  -- Нотатки гравця
  player_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, calendar_date, day_type)
);

-- =====================================================
-- ІСТОРІЯ ПЕРЕНОСІВ ТРЕНУВАНЬ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.schedule_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calendar_entry_id UUID NOT NULL REFERENCES public.player_calendar(id) ON DELETE CASCADE,
  
  -- Стара та нова дата
  old_date DATE NOT NULL,
  new_date DATE NOT NULL,
  
  -- Причина
  reason TEXT,
  
  -- Хто змінив (гравець чи тренер)
  changed_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ШАБЛОНИ ТИЖНЕВИХ ЦИКЛІВ
-- =====================================================

CREATE TABLE IF NOT EXISTS public.weekly_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Назва шаблону
  name_uk TEXT NOT NULL,
  name_en TEXT,
  name_cs TEXT,
  
  -- Опис
  description_uk TEXT,
  description_en TEXT,
  description_cs TEXT,
  
  -- Для якого рівня
  skill_level skill_level,
  
  -- Для якої вікової категорії (текстове поле для сумісності)
  age_category TEXT,
  
  -- Кількість тренувань на тиждень
  trainings_per_week INTEGER NOT NULL,
  
  -- Структура тижня (JSON)
  -- Формат: [{"day": 0-6, "type": "training_day_type", "intensity": "intensity_level"}]
  week_structure JSONB NOT NULL,
  
  -- Чи системний (не можна видалити)
  is_system BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ФУНКЦІЇ
-- =====================================================

-- Функція для отримання рекомендованого типу дня
CREATE OR REPLACE FUNCTION get_recommended_day_type(
  p_player_id UUID,
  p_date DATE
) RETURNS training_day_type AS $$
DECLARE
  v_day_of_week INTEGER;
  v_yesterday_type training_day_type;
  v_tomorrow_event training_day_type;
  v_settings RECORD;
  v_has_team_today BOOLEAN;
  v_has_match_tomorrow BOOLEAN;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;
  
  -- Отримуємо налаштування гравця
  SELECT * INTO v_settings FROM player_schedule_settings WHERE player_id = p_player_id;
  
  -- Перевіряємо чи є командне тренування сьогодні
  SELECT EXISTS(
    SELECT 1 FROM team_schedule ts
    JOIN team_members tm ON ts.team_id = tm.team_id
    WHERE tm.player_id = p_player_id 
    AND ts.day_of_week = v_day_of_week
    AND ts.is_active = true
  ) INTO v_has_team_today;
  
  IF v_has_team_today THEN
    RETURN 'team_training';
  END IF;
  
  -- Перевіряємо чи є матч завтра
  SELECT EXISTS(
    SELECT 1 FROM team_events te
    JOIN team_members tm ON te.team_id = tm.team_id
    WHERE tm.player_id = p_player_id 
    AND te.event_date = p_date + INTERVAL '1 day'
    AND te.event_type = 'match_day'
    AND NOT te.is_cancelled
  ) INTO v_has_match_tomorrow;
  
  IF v_has_match_tomorrow THEN
    RETURN 'match_prep';
  END IF;
  
  -- Перевіряємо що було вчора
  SELECT day_type INTO v_yesterday_type 
  FROM player_calendar 
  WHERE player_id = p_player_id AND calendar_date = p_date - INTERVAL '1 day';
  
  -- Логіка відновлення
  IF v_yesterday_type IN ('full_training', 'match_day', 'team_training') THEN
    IF v_settings.consider_recovery THEN
      RETURN 'light_training';
    END IF;
  END IF;
  
  IF v_yesterday_type = 'match_day' THEN
    RETURN 'post_match';
  END IF;
  
  -- За замовчуванням - повне тренування якщо це тренувальний день
  IF v_settings IS NOT NULL AND v_day_of_week = ANY(v_settings.training_days) THEN
    RETURN 'full_training';
  END IF;
  
  RETURN 'rest';
END;
$$ LANGUAGE plpgsql;

-- Функція для генерації календаря на тиждень
CREATE OR REPLACE FUNCTION generate_weekly_calendar(
  p_player_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID AS $$
DECLARE
  v_date DATE;
  v_day_type training_day_type;
  v_settings RECORD;
  v_program_id UUID;
  v_next_day_number INTEGER;
BEGIN
  -- Отримуємо налаштування
  SELECT * INTO v_settings FROM player_schedule_settings WHERE player_id = p_player_id;
  
  -- Отримуємо активну програму
  SELECT program_id INTO v_program_id 
  FROM player_programs 
  WHERE player_id = p_player_id AND status = 'active' 
  LIMIT 1;
  
  -- Отримуємо наступний день програми
  SELECT COALESCE(MAX(pd.day_number), 0) + 1 INTO v_next_day_number
  FROM player_calendar pc
  JOIN program_days pd ON pc.program_day_id = pd.id
  WHERE pc.player_id = p_player_id 
  AND pc.program_id = v_program_id
  AND pc.is_completed = true;
  
  -- Генеруємо 7 днів
  FOR i IN 0..6 LOOP
    v_date := p_start_date + i;
    
    -- Пропускаємо якщо вже є запис
    IF EXISTS(SELECT 1 FROM player_calendar WHERE player_id = p_player_id AND calendar_date = v_date) THEN
      CONTINUE;
    END IF;
    
    -- Визначаємо тип дня
    v_day_type := get_recommended_day_type(p_player_id, v_date);
    
    -- Створюємо запис
    INSERT INTO player_calendar (
      player_id, calendar_date, day_type, program_id,
      intensity, scheduled_time, duration_minutes
    ) VALUES (
      p_player_id, v_date, v_day_type, 
      CASE WHEN v_day_type IN ('full_training', 'light_training', 'skills_only') THEN v_program_id ELSE NULL END,
      CASE v_day_type
        WHEN 'full_training' THEN 'high'::intensity_level
        WHEN 'light_training' THEN 'low'::intensity_level
        WHEN 'skills_only' THEN 'low'::intensity_level
        WHEN 'recovery' THEN 'very_low'::intensity_level
        WHEN 'match_prep' THEN 'medium'::intensity_level
        WHEN 'post_match' THEN 'very_low'::intensity_level
        ELSE 'medium'::intensity_level
      END,
      v_settings.preferred_time,
      CASE v_day_type
        WHEN 'full_training' THEN 60
        WHEN 'light_training' THEN 30
        WHEN 'skills_only' THEN 20
        WHEN 'recovery' THEN 15
        WHEN 'match_prep' THEN 30
        WHEN 'post_match' THEN 20
        ELSE NULL
      END
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Функція для перенесення тренування
CREATE OR REPLACE FUNCTION reschedule_training(
  p_calendar_id UUID,
  p_new_date DATE,
  p_reason TEXT DEFAULT NULL,
  p_changed_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
BEGIN
  -- Отримуємо запис
  SELECT * INTO v_entry FROM player_calendar WHERE id = p_calendar_id;
  
  IF v_entry IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Перевіряємо чи нова дата вільна
  IF EXISTS(
    SELECT 1 FROM player_calendar 
    WHERE player_id = v_entry.player_id 
    AND calendar_date = p_new_date
    AND day_type NOT IN ('rest')
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Зберігаємо історію
  INSERT INTO schedule_changes (player_id, calendar_entry_id, old_date, new_date, reason, changed_by)
  VALUES (v_entry.player_id, p_calendar_id, v_entry.calendar_date, p_new_date, p_reason, p_changed_by);
  
  -- Оновлюємо запис
  UPDATE player_calendar 
  SET 
    calendar_date = p_new_date,
    is_rescheduled = TRUE,
    original_date = v_entry.calendar_date,
    updated_at = NOW()
  WHERE id = p_calendar_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- БАЗОВІ ШАБЛОНИ ТИЖНЕВИХ ЦИКЛІВ
-- =====================================================

INSERT INTO weekly_templates (name_uk, name_en, name_cs, description_uk, skill_level, age_category, trainings_per_week, week_structure, is_system) VALUES
-- Для початківців U8-U10
('Легкий старт', 'Easy Start', 'Lehký start', 
 'Ідеально для початківців: 2 тренування на тиждень з акцентом на гру',
 'beginner', 'U8', 2,
 '[
   {"day": 2, "type": "light_training", "intensity": "low"},
   {"day": 5, "type": "skills_only", "intensity": "low"}
 ]'::jsonb, true),

-- Для U10-U12
('Базовий розвиток', 'Basic Development', 'Základní rozvoj',
 '3 тренування на тиждень для стабільного прогресу',
 'beginner', 'U12', 3,
 '[
   {"day": 1, "type": "full_training", "intensity": "medium"},
   {"day": 3, "type": "light_training", "intensity": "low"},
   {"day": 5, "type": "full_training", "intensity": "medium"}
 ]'::jsonb, true),

-- Для U14+
('Інтенсивний', 'Intensive', 'Intenzivní',
 '4 тренування на тиждень для серйозного розвитку',
 'intermediate', 'U14', 4,
 '[
   {"day": 1, "type": "full_training", "intensity": "high"},
   {"day": 2, "type": "recovery", "intensity": "very_low"},
   {"day": 3, "type": "full_training", "intensity": "medium"},
   {"day": 5, "type": "full_training", "intensity": "high"},
   {"day": 6, "type": "skills_only", "intensity": "low"}
 ]'::jsonb, true),

-- Для просунутих
('Професійний', 'Professional', 'Profesionální',
 '5-6 тренувань на тиждень для максимального результату',
 'advanced', 'U16', 5,
 '[
   {"day": 1, "type": "full_training", "intensity": "high"},
   {"day": 2, "type": "light_training", "intensity": "medium"},
   {"day": 3, "type": "full_training", "intensity": "high"},
   {"day": 4, "type": "recovery", "intensity": "very_low"},
   {"day": 5, "type": "full_training", "intensity": "high"},
   {"day": 6, "type": "skills_only", "intensity": "medium"}
 ]'::jsonb, true),

-- З командними тренуваннями
('Команда + Індивідуально', 'Team + Individual', 'Tým + Individuální',
 'Доповнення до командних тренувань',
 'intermediate', 'U14', 2,
 '[
   {"day": 2, "type": "skills_only", "intensity": "low"},
   {"day": 4, "type": "light_training", "intensity": "medium"}
 ]'::jsonb, true);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.player_schedule_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own schedule settings" ON public.player_schedule_settings;
DROP POLICY IF EXISTS "Users can update own schedule settings" ON public.player_schedule_settings;
DROP POLICY IF EXISTS "Users can insert own schedule settings" ON public.player_schedule_settings;
DROP POLICY IF EXISTS "Team members can view team schedule" ON public.team_schedule;
DROP POLICY IF EXISTS "Coaches can manage team schedule" ON public.team_schedule;
DROP POLICY IF EXISTS "Team members can view team events" ON public.team_events;
DROP POLICY IF EXISTS "Coaches can manage team events" ON public.team_events;
DROP POLICY IF EXISTS "Users can view own calendar" ON public.player_calendar;
DROP POLICY IF EXISTS "Users can manage own calendar" ON public.player_calendar;
DROP POLICY IF EXISTS "Coaches can view team members calendar" ON public.player_calendar;
DROP POLICY IF EXISTS "Users can view own schedule changes" ON public.schedule_changes;
DROP POLICY IF EXISTS "Users can manage own schedule changes" ON public.schedule_changes;
DROP POLICY IF EXISTS "Users can insert own schedule changes" ON public.schedule_changes;
DROP POLICY IF EXISTS "Anyone can view templates" ON public.weekly_templates;
DROP POLICY IF EXISTS "Anyone can view weekly templates" ON public.weekly_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.weekly_templates;

-- Player Schedule Settings
CREATE POLICY "Users can view own schedule settings"
  ON public.player_schedule_settings FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update own schedule settings"
  ON public.player_schedule_settings FOR UPDATE
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own schedule settings"
  ON public.player_schedule_settings FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Team Schedule - тренери можуть керувати, гравці бачити
CREATE POLICY "Team members can view team schedule"
  ON public.team_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_schedule.team_id
      AND tm.player_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_schedule.team_id
      AND t.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage team schedule"
  ON public.team_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_schedule.team_id
      AND t.coach_id = auth.uid()
    )
  );

-- Team Events
CREATE POLICY "Team members can view team events"
  ON public.team_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_events.team_id
      AND tm.player_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_events.team_id
      AND t.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage team events"
  ON public.team_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_events.team_id
      AND t.coach_id = auth.uid()
    )
  );

-- Player Calendar
CREATE POLICY "Users can view own calendar"
  ON public.player_calendar FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can manage own calendar"
  ON public.player_calendar FOR ALL
  USING (auth.uid() = player_id);

CREATE POLICY "Coaches can view team members calendar"
  ON public.player_calendar FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE tm.player_id = player_calendar.player_id
      AND t.coach_id = auth.uid()
    )
  );

-- Schedule Changes
CREATE POLICY "Users can view own schedule changes"
  ON public.schedule_changes FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own schedule changes"
  ON public.schedule_changes FOR INSERT
  WITH CHECK (auth.uid() = player_id OR auth.uid() = changed_by);

-- Weekly Templates - всі можуть бачити
CREATE POLICY "Anyone can view weekly templates"
  ON public.weekly_templates FOR SELECT
  USING (true);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_player_schedule_settings_player ON player_schedule_settings(player_id);
CREATE INDEX IF NOT EXISTS idx_team_schedule_team ON team_schedule(team_id);
CREATE INDEX IF NOT EXISTS idx_team_schedule_day ON team_schedule(day_of_week);
CREATE INDEX IF NOT EXISTS idx_team_events_team ON team_events(team_id);
CREATE INDEX IF NOT EXISTS idx_team_events_date ON team_events(event_date);
CREATE INDEX IF NOT EXISTS idx_player_calendar_player ON player_calendar(player_id);
CREATE INDEX IF NOT EXISTS idx_player_calendar_date ON player_calendar(calendar_date);
CREATE INDEX IF NOT EXISTS idx_player_calendar_player_date ON player_calendar(player_id, calendar_date);
CREATE INDEX IF NOT EXISTS idx_schedule_changes_player ON schedule_changes(player_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Автоматичне оновлення updated_at
CREATE OR REPLACE FUNCTION update_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_player_schedule_settings_updated_at ON player_schedule_settings;
CREATE TRIGGER update_player_schedule_settings_updated_at
  BEFORE UPDATE ON player_schedule_settings
  FOR EACH ROW EXECUTE FUNCTION update_schedule_updated_at();

DROP TRIGGER IF EXISTS update_team_schedule_updated_at ON team_schedule;
CREATE TRIGGER update_team_schedule_updated_at
  BEFORE UPDATE ON team_schedule
  FOR EACH ROW EXECUTE FUNCTION update_schedule_updated_at();

DROP TRIGGER IF EXISTS update_team_events_updated_at ON team_events;
CREATE TRIGGER update_team_events_updated_at
  BEFORE UPDATE ON team_events
  FOR EACH ROW EXECUTE FUNCTION update_schedule_updated_at();

DROP TRIGGER IF EXISTS update_player_calendar_updated_at ON player_calendar;
CREATE TRIGGER update_player_calendar_updated_at
  BEFORE UPDATE ON player_calendar
  FOR EACH ROW EXECUTE FUNCTION update_schedule_updated_at();

