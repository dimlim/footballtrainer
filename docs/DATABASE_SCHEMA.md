# Football Trainer Pro - Схема бази даних

## Візуальна діаграма зв'язків

```
                                    ┌─────────────────┐
                                    │   admin_users   │
                                    │─────────────────│
                                    │ id              │
                                    │ user_id ────────┼──┐
                                    │ created_at      │  │
                                    └─────────────────┘  │
                                                         │
┌─────────────────┐                 ┌─────────────────┐  │
│     teams       │                 │    profiles     │<─┘
│─────────────────│                 │─────────────────│
│ id              │<───────────┐    │ id (PK)         │<──────────────────────┐
│ name            │            │    │ email           │                       │
│ coach_id ───────┼────────────┼───>│ full_name       │                       │
│ invite_code     │            │    │ avatar_url      │                       │
│ created_at      │            │    │ role            │                       │
└─────────────────┘            │    │ language        │                       │
        │                      │    │ show_in_leaderb │                       │
        │                      │    │ created_at      │                       │
        │                      │    │ updated_at      │                       │
        ▼                      │    └─────────────────┘                       │
┌─────────────────┐            │            │                                 │
│  team_members   │            │            │                                 │
│─────────────────│            │            ▼                                 │
│ id              │            │    ┌─────────────────┐                       │
│ team_id ────────┼────────────┘    │  player_stats   │                       │
│ player_id ──────┼────────────────>│─────────────────│                       │
│ joined_at       │                 │ id              │                       │
└─────────────────┘                 │ player_id ──────┼───────────────────────┤
        │                           │ total_xp        │                       │
        │                           │ level           │                       │
        ▼                           │ total_exercises │                       │
┌─────────────────┐                 │ current_streak  │                       │
│ team_programs   │                 │ best_streak     │                       │
│─────────────────│                 │ last_training   │                       │
│ id              │                 └─────────────────┘                       │
│ team_id ────────┼──┐                                                        │
│ program_id ─────┼──┼──┐                                                     │
│ assigned_at     │  │  │                                                     │
│ assigned_by     │  │  │                                                     │
└─────────────────┘  │  │                                                     │
                     │  │                                                     │
                     │  │      ┌─────────────────┐                            │
                     │  │      │    programs     │                            │
                     │  └─────>│─────────────────│                            │
                     │         │ id (PK)         │<───────────────────────┐   │
                     │         │ title_uk/en/cs  │                        │   │
                     │         │ description_*   │                        │   │
                     │         │ category        │                        │   │
                     │         │ difficulty      │                        │   │
                     │         │ duration_days   │                        │   │
                     │         │ cover_image     │                        │   │
                     │         │ color           │                        │   │
                     │         │ is_public       │                        │   │
                     │         │ is_premium      │                        │   │
                     │         │ price_usd       │                        │   │
                     │         │ created_by ─────┼────────────────────────┼───┤
                     │         │ created_at      │                        │   │
                     │         └─────────────────┘                        │   │
                     │                 │                                  │   │
                     │                 ▼                                  │   │
                     │         ┌─────────────────┐                        │   │
                     │         │  program_days   │                        │   │
                     │         │─────────────────│                        │   │
                     │         │ id (PK)         │<─────────────────┐     │   │
                     │         │ program_id ─────┼──────────────────┼─────┘   │
                     │         │ day_number      │                  │         │
                     │         │ title_uk/en/cs  │                  │         │
                     │         │ focus_uk/en/cs  │                  │         │
                     │         │ intensity       │                  │         │
                     │         │ duration_mins   │                  │         │
                     │         │ location        │                  │         │
                     │         └─────────────────┘                  │         │
                     │                 │                            │         │
                     │                 ▼                            │         │
                     │         ┌─────────────────┐                  │         │
                     │         │  day_sections   │                  │         │
                     │         │─────────────────│                  │         │
                     │         │ id (PK)         │<────────────┐    │         │
                     │         │ day_id ─────────┼─────────────┼────┘         │
                     │         │ title_uk/en/cs  │             │              │
                     │         │ order_index     │             │              │
                     │         │ duration_mins   │             │              │
                     │         └─────────────────┘             │              │
                     │                 │                       │              │
                     │                 ▼                       │              │
                     │         ┌─────────────────┐             │              │
                     │         │   exercises     │             │              │
                     │         │─────────────────│             │              │
                     │         │ id (PK)         │             │              │
                     │         │ section_id ─────┼─────────────┘              │
                     │         │ title_uk/en/cs  │                            │
                     │         │ description_*   │                            │
                     │         │ sets_uk/en/cs   │                            │
                     │         │ reps_uk/en/cs   │                            │
                     │         │ rest_seconds    │                            │
                     │         │ exercise_type   │                            │
                     │         │ timer_duration  │                            │
                     │         │ input_label_*   │                            │
                     │         │ note_uk/en/cs   │                            │
                     │         │ order_index     │                            │
                     │         └─────────────────┘                            │
                     │                                                        │
                     │                                                        │
┌────────────────────┼────────────────────────────────────────────────────────┤
│                    │                                                        │
│  ПРОГРЕС ГРАВЦІВ   │                                                        │
│                    │                                                        │
│  ┌─────────────────┴───┐     ┌─────────────────┐                            │
│  │  player_programs    │     │player_progress_v2│                           │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ player_id ──────────┼────>│ player_id ──────┼────────────────────────────┤
│  │ program_id          │     │ day_id          │                            │
│  │ started_at          │     │ exercise_id     │                            │
│  │ source              │     │ is_completed    │                            │
│  │ team_id             │     │ measurement_val │                            │
│  └─────────────────────┘     │ xp_earned       │                            │
│                              │ completed_at    │                            │
│                              └─────────────────┘                            │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────┐                            │
│  │player_day_completions│    │player_achievements│                          │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ player_id ──────────┼────>│ player_id ──────┼────────────────────────────┤
│  │ day_id              │     │ achievement_id  │                            │
│  │ bonus_xp            │     │ earned_at       │                            │
│  │ completed_at        │     │ notified        │                            │
│  └─────────────────────┘     └─────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ЛОГУВАННЯ АКТИВНОСТІ                                                       │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────┐                            │
│  │ player_activity_log │     │ player_sessions │                            │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ player_id ──────────┼────>│ player_id ──────┼────────────────────────────┤
│  │ activity_type       │     │ session_start   │                            │
│  │ program_id          │     │ session_end     │                            │
│  │ day_key             │     │ duration_secs   │                            │
│  │ exercise_id         │     │ pages_visited   │                            │
│  │ metadata (JSONB)    │     │ exercises_done  │                            │
│  │ device_type         │     │ is_active       │                            │
│  │ user_agent          │     │ device_type     │                            │
│  │ created_at          │     │ app_version     │                            │
│  └─────────────────────┘     └─────────────────┘                            │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────┐                            │
│  │  exercise_timing    │     │player_daily_sum │                            │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ player_id ──────────┼────>│ player_id ──────┼────────────────────────────┤
│  │ exercise_id         │     │ date            │                            │
│  │ day_key             │     │ login_count     │                            │
│  │ started_at          │     │ exercises_done  │                            │
│  │ completed_at        │     │ days_completed  │                            │
│  │ expected_duration   │     │ xp_earned       │                            │
│  │ actual_duration     │     │ suspicious_cnt  │                            │
│  │ is_suspicious       │     │ active_minutes  │                            │
│  │ verification_status │     │ first_activity  │                            │
│  │ coach_notes         │     │ last_activity   │                            │
│  └─────────────────────┘     └─────────────────┘                            │
│                                                                             │
│  ┌─────────────────────┐                                                    │
│  │coach_verification_q │                                                    │
│  │─────────────────────│                                                    │
│  │ id                  │                                                    │
│  │ coach_id ───────────┼────────────────────────────────────────────────────┤
│  │ player_id ──────────┼────────────────────────────────────────────────────┤
│  │ team_id             │                                                    │
│  │ activity_type       │                                                    │
│  │ activity_id         │                                                    │
│  │ reason              │                                                    │
│  │ status              │                                                    │
│  │ reviewed_at         │                                                    │
│  │ coach_comment       │                                                    │
│  │ created_at          │                                                    │
│  └─────────────────────┘                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  PUSH-СПОВІЩЕННЯ                                                            │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────┐                            │
│  │ push_subscriptions  │     │notification_pref│                            │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ user_id ────────────┼────>│ user_id ────────┼────────────────────────────┤
│  │ endpoint            │     │ training_remind │                            │
│  │ p256dh              │     │ reminder_time   │                            │
│  │ auth                │     │ streak_warnings │                            │
│  │ created_at          │     │ achievements    │                            │
│  └─────────────────────┘     │ team_updates    │                            │
│                              │ coach_messages  │                            │
│  ┌─────────────────────┐     └─────────────────┘                            │
│  │notification_history │                                                    │
│  │─────────────────────│                                                    │
│  │ id                  │                                                    │
│  │ user_id ────────────┼────────────────────────────────────────────────────┤
│  │ type                │                                                    │
│  │ title               │                                                    │
│  │ body                │                                                    │
│  │ data (JSONB)        │                                                    │
│  │ sent_at             │                                                    │
│  │ read_at             │                                                    │
│  └─────────────────────┘                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ФІТНЕС-ТРЕКЕРИ                                                             │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────┐                            │
│  │  workout_sessions   │     │daily_fitness_dat│                            │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ user_id ────────────┼────>│ user_id ────────┼────────────────────────────┤
│  │ started_at          │     │ date            │                            │
│  │ ended_at            │     │ steps           │                            │
│  │ duration_seconds    │     │ distance_meters │                            │
│  │ steps               │     │ calories_burned │                            │
│  │ distance_meters     │     │ active_minutes  │                            │
│  │ calories_burned     │     │ sleep_hours     │                            │
│  │ avg_heart_rate      │     │ resting_hr      │                            │
│  │ max_heart_rate      │     │ source          │                            │
│  │ gps_track (JSONB)   │     └─────────────────┘                            │
│  └─────────────────────┘                                                    │
│                                                                             │
│  ┌─────────────────────┐     ┌─────────────────┐                            │
│  │tracker_connections  │     │  fitness_goals  │                            │
│  │─────────────────────│     │─────────────────│                            │
│  │ id                  │     │ id              │                            │
│  │ user_id ────────────┼────>│ user_id ────────┼────────────────────────────┤
│  │ tracker_type        │     │ goal_type       │                            │
│  │ access_token        │     │ target_value    │                            │
│  │ refresh_token       │     │ current_value   │                            │
│  │ expires_at          │     │ period          │                            │
│  │ connected_at        │     │ start_date      │                            │
│  │ last_sync           │     │ end_date        │                            │
│  └─────────────────────┘     └─────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Індекси

### Основні індекси для оптимізації запитів:

```sql
-- Профілі
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Статистика
CREATE INDEX idx_player_stats_player ON player_stats(player_id);
CREATE INDEX idx_player_stats_xp ON player_stats(total_xp DESC);

-- Команди
CREATE INDEX idx_teams_coach ON teams(coach_id);
CREATE INDEX idx_teams_invite ON teams(invite_code);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_player ON team_members(player_id);

-- Програми
CREATE INDEX idx_programs_public ON programs(is_public);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_program_days_program ON program_days(program_id);
CREATE INDEX idx_day_sections_day ON day_sections(day_id);
CREATE INDEX idx_exercises_section ON exercises(section_id);

-- Прогрес
CREATE INDEX idx_player_programs_player ON player_programs(player_id);
CREATE INDEX idx_player_programs_program ON player_programs(program_id);
CREATE INDEX idx_progress_player_day ON player_progress_v2(player_id, day_id);
CREATE INDEX idx_day_completions_player ON player_day_completions(player_id);

-- Досягнення
CREATE INDEX idx_achievements_player ON player_achievements(player_id);

-- Логування
CREATE INDEX idx_activity_log_player ON player_activity_log(player_id);
CREATE INDEX idx_activity_log_created ON player_activity_log(created_at);
CREATE INDEX idx_activity_log_type ON player_activity_log(activity_type);
CREATE INDEX idx_sessions_player ON player_sessions(player_id);
CREATE INDEX idx_sessions_active ON player_sessions(is_active);
CREATE INDEX idx_timing_player ON exercise_timing(player_id);
CREATE INDEX idx_timing_suspicious ON exercise_timing(is_suspicious);
CREATE INDEX idx_daily_summary_player_date ON player_daily_summary(player_id, date);

-- Push
CREATE INDEX idx_push_user ON push_subscriptions(user_id);
CREATE INDEX idx_notif_pref_user ON notification_preferences(user_id);

-- Фітнес
CREATE INDEX idx_workout_user ON workout_sessions(user_id);
CREATE INDEX idx_daily_fitness_user_date ON daily_fitness_data(user_id, date);
```

## Тригери

### Автоматичне оновлення щоденної статистики:

```sql
CREATE OR REPLACE FUNCTION update_player_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO player_daily_summary (player_id, date, first_activity, last_activity)
    VALUES (NEW.player_id, DATE(NEW.created_at), NEW.created_at, NEW.created_at)
    ON CONFLICT (player_id, date) DO UPDATE SET
        last_activity = NEW.created_at,
        login_count = CASE 
            WHEN NEW.activity_type = 'login' 
            THEN player_daily_summary.login_count + 1 
            ELSE player_daily_summary.login_count 
        END,
        exercises_completed = CASE 
            WHEN NEW.activity_type = 'exercise_complete' 
            THEN player_daily_summary.exercises_completed + 1 
            ELSE player_daily_summary.exercises_completed 
        END,
        days_completed = CASE 
            WHEN NEW.activity_type = 'day_complete' 
            THEN player_daily_summary.days_completed + 1 
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

CREATE TRIGGER trigger_update_daily_summary
    AFTER INSERT ON player_activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_player_daily_summary();
```

### Перевірка підозрілої активності:

```sql
CREATE OR REPLACE FUNCTION check_suspicious_timing()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.completed_at IS NOT NULL AND NEW.expected_duration_seconds IS NOT NULL THEN
        NEW.actual_duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
        
        -- Якщо виконано менше ніж за 30% очікуваного часу
        IF NEW.actual_duration_seconds < (NEW.expected_duration_seconds * 0.3) THEN
            NEW.is_suspicious := true;
            NEW.verification_status := 'flagged';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_suspicious
    BEFORE UPDATE ON exercise_timing
    FOR EACH ROW
    EXECUTE FUNCTION check_suspicious_timing();
```

## RPC функції

### Отримання зведеної статистики команди:

```sql
CREATE OR REPLACE FUNCTION get_team_activity_summary(
    p_coach_id UUID, 
    p_days INTEGER DEFAULT 7
)
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
        SUM(pds.login_count)::BIGINT,
        SUM(pds.exercises_completed)::BIGINT,
        SUM(pds.days_completed)::BIGINT,
        SUM(pds.xp_earned)::BIGINT,
        SUM(pds.suspicious_activities)::BIGINT,
        MAX(pds.last_activity),
        AVG(pds.total_active_minutes)::NUMERIC
    FROM player_daily_summary pds
    JOIN profiles p ON p.id = pds.player_id
    JOIN team_members tm ON tm.player_id = pds.player_id
    JOIN teams t ON t.id = tm.team_id
    WHERE t.coach_id = p_coach_id
    AND pds.date >= CURRENT_DATE - p_days
    GROUP BY pds.player_id, p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Нарахування XP:

```sql
CREATE OR REPLACE FUNCTION increment_xp(
    p_player_id UUID, 
    p_amount INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE player_stats 
    SET 
        total_xp = total_xp + p_amount,
        level = FLOOR(1 + SQRT(total_xp / 100))::INTEGER
    WHERE player_id = p_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

*Схема актуальна на: Грудень 2024*

