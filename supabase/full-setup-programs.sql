-- =====================================================
-- FULL SETUP: Programs V2 + Explosiveness Migration
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CLEANUP: Drop old tables
-- =====================================================

DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.day_sections CASCADE;
DROP TABLE IF EXISTS public.program_days CASCADE;
DROP TABLE IF EXISTS public.team_programs CASCADE;
DROP TABLE IF EXISTS public.program_requests CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- =====================================================
-- ADMIN USERS TABLE
-- =====================================================

CREATE TABLE public.admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROGRAMS TABLE
-- =====================================================

CREATE TABLE public.programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    category TEXT NOT NULL DEFAULT 'technique',
    difficulty TEXT NOT NULL DEFAULT 'intermediate',
    duration_days INTEGER NOT NULL DEFAULT 30,
    icon TEXT DEFAULT '⚽',
    cover_image TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    price_usd DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- PROGRAM DAYS TABLE
-- =====================================================

CREATE TABLE public.program_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    focus_uk TEXT,
    focus_en TEXT,
    focus_cs TEXT,
    intensity TEXT NOT NULL DEFAULT 'medium',
    location TEXT NOT NULL DEFAULT 'home',
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(program_id, day_number)
);

-- =====================================================
-- DAY SECTIONS TABLE
-- =====================================================

CREATE TABLE public.day_sections (
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
-- EXERCISES TABLE
-- =====================================================

CREATE TABLE public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES public.day_sections(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    title_uk TEXT NOT NULL,
    title_en TEXT,
    title_cs TEXT,
    description_uk TEXT[],
    description_en TEXT[],
    description_cs TEXT[],
    sets_uk TEXT,
    sets_en TEXT,
    sets_cs TEXT,
    reps_uk TEXT,
    reps_en TEXT,
    reps_cs TEXT,
    rest_seconds INTEGER,
    exercise_type TEXT NOT NULL DEFAULT 'checkbox',
    input_label_uk TEXT,
    input_label_en TEXT,
    input_label_cs TEXT,
    note_uk TEXT,
    note_en TEXT,
    note_cs TEXT,
    timer_duration INTEGER,
    video_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TEAM PROGRAMS TABLE
-- =====================================================

CREATE TABLE public.team_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(team_id, program_id)
);

-- =====================================================
-- PROGRAM REQUESTS TABLE
-- =====================================================

CREATE TABLE public.program_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- =====================================================
-- UPDATE PLAYER_PROGRAMS TABLE
-- =====================================================

ALTER TABLE public.player_programs 
ALTER COLUMN started_at DROP NOT NULL;

ALTER TABLE public.player_programs 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

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
CREATE POLICY "programs_select" ON public.programs
    FOR SELECT TO authenticated USING (is_active = true);

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
CREATE POLICY "program_requests_select" ON public.program_requests
    FOR SELECT TO authenticated USING (
        requested_by = auth.uid() OR public.is_admin(auth.uid())
    );

CREATE POLICY "program_requests_insert" ON public.program_requests
    FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());

CREATE POLICY "program_requests_update" ON public.program_requests
    FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- PLAYER_PROGRAMS policies (update existing)
DROP POLICY IF EXISTS "player_programs_select" ON public.player_programs;
DROP POLICY IF EXISTS "player_programs_insert" ON public.player_programs;
DROP POLICY IF EXISTS "player_programs_update" ON public.player_programs;
DROP POLICY IF EXISTS "player_programs_delete" ON public.player_programs;

CREATE POLICY "player_programs_select" ON public.player_programs
    FOR SELECT TO authenticated USING (player_id = auth.uid());

CREATE POLICY "player_programs_insert" ON public.player_programs
    FOR INSERT TO authenticated WITH CHECK (player_id = auth.uid());

CREATE POLICY "player_programs_update" ON public.player_programs
    FOR UPDATE TO authenticated USING (player_id = auth.uid());

CREATE POLICY "player_programs_delete" ON public.player_programs
    FOR DELETE TO authenticated USING (player_id = auth.uid());

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
-- MIGRATE EXPLOSIVENESS PROGRAM
-- =====================================================

DO $$
DECLARE
    ns_uuid UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    program_uuid UUID;
    day1_uuid UUID;
    d1s1_uuid UUID;
    d1s2_uuid UUID;
    d1s3_uuid UUID;
    d1s4_uuid UUID;
BEGIN
    program_uuid := uuid_generate_v5(ns_uuid, 'explosiveness-30');
    day1_uuid := uuid_generate_v5(ns_uuid, 'exp-day-1');
    d1s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d1-s1');
    d1s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d1-s2');
    d1s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d1-s3');
    d1s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d1-s4');

    -- Create the program
    INSERT INTO public.programs (
        id, title_uk, title_en, title_cs,
        description_uk, description_en, description_cs,
        category, difficulty, duration_days,
        icon, cover_image, is_active, is_featured, is_premium, price_usd
    ) VALUES (
        program_uuid,
        'Вибуховість 30 днів', '30-Day Explosiveness', '30denní Výbušnost',
        'Інтенсивна програма для розвитку вибухової сили, швидкості старту та спринтерських якостей',
        'Intensive program for developing explosive power, starting speed and sprinting abilities',
        'Intenzivní program pro rozvoj výbušné síly, startovní rychlosti a sprintérských schopností',
        'explosiveness', 'intermediate', 30,
        '⚡', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
        true, true, false, 0
    );

    -- Day 1
    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day1_uuid, program_uuid, 1, 'Легке відновлення + Тести', 'Light Recovery + Tests', 'Lehké zotavení + Testy',
            'Оцінка рівня, активація м''язів', 'Level assessment, muscle activation', 'Hodnocení úrovně, aktivace svalů',
            'low', 'home', 45);

    -- Day 1 Sections
    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (d1s1_uuid, day1_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (d1s2_uuid, day1_uuid, 1, 'Тест балансу та координації', 'Balance & Coordination Test', 'Test rovnováhy a koordinace', 15),
    (d1s3_uuid, day1_uuid, 2, 'М''яч + координація', 'Ball + Coordination', 'Míč + Koordinace', 15),
    (d1s4_uuid, day1_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5);

    -- Day 1 Exercises - Section 1 (Warmup)
    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, note_uk, note_en, note_cs) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d1-e1'), d1s1_uuid, 0, 
     'Ходьба з високим підніманням коліна', 'High knee walking', 'Chůze s vysokým zvedáním kolen',
     ARRAY['Коліно піднімай до рівня пояса', 'Руки працюють як при бігу', 'Перші 30 сек повільно, потім швидше'],
     ARRAY['Raise knee to waist level', 'Arms work as when running', 'First 30 sec slowly, then faster'],
     ARRAY['Zvedni koleno do úrovně pasu', 'Paže pracují jako při běhu', 'Prvních 30 s pomalu, pak rychleji'],
     'checkbox', 120, 'Спина пряма, дивись вперед', 'Keep back straight, look forward', 'Záda rovná, dívej se dopředu'),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e2'), d1s1_uuid, 1,
     'Обертання суглобів', 'Joint rotations', 'Rotace kloubů',
     ARRAY['Гомілкостоп: по 10 обертань кожною ногою', 'Коліна: 10 кіл вправо, 10 вліво', 'Таз: 10 обертань в кожну сторону', 'Плечі: 10 обертань назад, 10 вперед'],
     ARRAY['Ankles: 10 rotations each leg', 'Knees: 10 circles right, 10 left', 'Hips: 10 rotations each direction', 'Shoulders: 10 back, 10 forward'],
     ARRAY['Kotníky: 10 rotací každou nohou', 'Kolena: 10 kruhů vpravo, 10 vlevo', 'Boky: 10 rotací každým směrem', 'Ramena: 10 vzad, 10 vpřed'],
     'checkbox', 180, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e3'), d1s1_uuid, 2,
     'Динамічна розтяжка', 'Dynamic stretching', 'Dynamické protahování',
     ARRAY['Випади вперед з поворотом: 8 на кожну ногу', 'Махи ногою вперед-назад: 10 на кожну', 'Махи в сторону: 10 на кожну'],
     ARRAY['Forward lunges with twist: 8 each leg', 'Leg swings forward-back: 10 each', 'Side swings: 10 each'],
     ARRAY['Výpady vpřed s rotací: 8 na každou nohu', 'Kyvadlové pohyby vpřed-vzad: 10 na každou', 'Kyvadlové do strany: 10 na každou'],
     'checkbox', 300, 'Коліно не виходить за носок', 'Knee does not go past toe', 'Koleno nepřesahuje špičku');

    -- Day 1 Exercises - Section 2 (Balance Test)
    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d1-e4'), d1s2_uuid, 0,
     'Баланс на правій нозі', 'Right leg balance', 'Rovnováha na pravé noze',
     ARRAY['Стань на праву ногу, ліву підігни', 'Руки в сторони або на поясі', 'Засікай час - скільки устоїш'],
     ARRAY['Stand on right leg, bend left', 'Arms to sides or on hips', 'Time how long you can hold'],
     ARRAY['Stůj na pravé noze, levou pokrč', 'Paže do stran nebo v bok', 'Měř čas, jak dlouho vydržíš'],
     'input', 60, '3 спроби', '3 attempts', '3 pokusy', 30, 'сек (кращий час)', 'sec (best time)', 's (nejlepší čas)', 'Запиши кращий результат!', 'Record your best result!', 'Zapiš svůj nejlepší výsledek!'),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e5'), d1s2_uuid, 1,
     'Баланс на лівій нозі', 'Left leg balance', 'Rovnováha na levé noze',
     ARRAY['Те саме для лівої ноги'], ARRAY['Same for left leg'], ARRAY['Totéž pro levou nohu'],
     'input', 60, '3 спроби', '3 attempts', '3 pokusy', 30, 'сек (кращий час)', 'sec (best time)', 's (nejlepší čas)', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e6'), d1s2_uuid, 2,
     'Присідання з контролем', 'Controlled squats', 'Kontrolované dřepy',
     ARRAY['Вниз: повільно рахуй 1-2-3-4', 'Вгору: швидко, вистрибуй', 'Руки вперед для балансу'],
     ARRAY['Down: slowly count 1-2-3-4', 'Up: quickly, jump', 'Arms forward for balance'],
     ARRAY['Dolů: pomalu počítej 1-2-3-4', 'Nahoru: rychle, vyskoč', 'Paže dopředu pro rovnováhu'],
     'checkbox', NULL, '3x10', '3x10', '3x10', 60, NULL, NULL, NULL, 'Коліна не виходять за носки', 'Knees do not go past toes', 'Kolena nepřesahují špičky'),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e7'), d1s2_uuid, 3,
     'Годинник (координація стоп)', 'Clock (foot coordination)', 'Hodiny (koordinace nohou)',
     ARRAY['Стій на лівій нозі', 'Правою ногою малюй годинник:', '12 годин (вперед), 3 (вправо), 6 (назад), 9 (вліво)', 'Повтори 5 кіл, потім зміни ногу'],
     ARRAY['Stand on left leg', 'Draw a clock with right foot:', '12 (forward), 3 (right), 6 (back), 9 (left)', 'Repeat 5 circles, then switch'],
     ARRAY['Stůj na levé noze', 'Pravou nohou kresli hodiny:', '12 (vpřed), 3 (vpravo), 6 (vzad), 9 (vlevo)', 'Opakuj 5 kruhů, pak změň'],
     'checkbox', 240, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Коло робиш якомога більшим!', 'Make circles as big as possible!', 'Dělej kruhy co největší!'),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e8'), d1s2_uuid, 4,
     'Віджимання від підлоги', 'Push-ups', 'Kliky',
     ARRAY['Тіло пряме, лікті під 45°', 'Вниз до торкання грудьми', 'Вгору повністю випрямляй руки'],
     ARRAY['Body straight, elbows at 45°', 'Down until chest touches', 'Up fully extend arms'],
     ARRAY['Tělo rovné, lokty pod 45°', 'Dolů dokud se hrudník nedotkne', 'Nahoru plně natáhni paže'],
     'input', NULL, NULL, NULL, NULL, NULL, 'кількість разів', 'number of reps', 'počet opakování', 'Максимум з правильною технікою', 'Maximum with proper form', 'Maximum se správnou technikou');

    -- Day 1 Exercises - Section 3 (Ball)
    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, reps_uk, reps_en, reps_cs, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d1-e9'), d1s3_uuid, 0,
     'Жонглювання (права нога)', 'Juggling (right foot)', 'Žonglování (pravá noha)',
     ARRAY['Підйом стопи (шнурки)', 'М''яч не вище коліна', 'Рахуй вголос'],
     ARRAY['Instep (laces)', 'Ball not higher than knee', 'Count out loud'],
     ARRAY['Nárt (tkaničky)', 'Míč ne výše než koleno', 'Počítej nahlas'],
     'checkbox', 120, '20 торкань', '20 touches', '20 doteků', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Удар серединою підйому', 'Hit with middle of instep', 'Úder středem nártu'),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e10'), d1s3_uuid, 1,
     'Жонглювання (ліва нога)', 'Juggling (left foot)', 'Žonglování (levá noha)',
     ARRAY['Те саме лівою ногою'], ARRAY['Same with left foot'], ARRAY['Totéž levou nohou'],
     'checkbox', 120, '20 торкань', '20 touches', '20 doteků', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e11'), d1s3_uuid, 2,
     'Жонглювання (чергування)', 'Juggling (alternating)', 'Žonglování (střídání)',
     ARRAY['Права-ліва-права-ліва', 'Запиши максимальну серію без падіння м''яча!'],
     ARRAY['Right-left-right-left', 'Record max series without dropping!'],
     ARRAY['Pravá-levá-pravá-levá', 'Zapiš max sérii bez pádu míče!'],
     'input', NULL, '30 торкань', '30 touches', '30 doteků', NULL, NULL, NULL, NULL, 'макс. серія', 'max series', 'max série', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e12'), d1s3_uuid, 3,
     'Пас в стіну + контроль', 'Wall pass + control', 'Přihrávka na zeď + kontrola',
     ARRAY['Відстань 3-4 метри', 'Пас правою → Контроль лівою', 'Пас лівою → Контроль правою'],
     ARRAY['Distance 3-4 meters', 'Pass right → Control left', 'Pass left → Control right'],
     ARRAY['Vzdálenost 3-4 metry', 'Přihrávka pravou → Kontrola levou', 'Přihrávka levou → Kontrola pravou'],
     'checkbox', 300, NULL, NULL, NULL, '3x20', '3x20', '3x20', 30, NULL, NULL, NULL, 'М''яко приймай підошвою', 'Soft control with sole', 'Měkká kontrola podrážkou'),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e13'), d1s3_uuid, 4,
     'Вісімка м''яча навколо ніг', 'Figure 8 around legs', 'Osmička kolem nohou',
     ARRAY['Ноги ширше плечей', 'Котиш м''яч підошвою вісімкою', '30 сек права, 30 сек ліва'],
     ARRAY['Legs wider than shoulders', 'Roll ball with sole in figure 8', '30 sec right, 30 sec left'],
     ARRAY['Nohy šířeji než ramena', 'Kutálej míč podrážkou do osmičky', '30 s pravá, 30 s levá'],
     'checkbox', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'М''яч не повинен відкотитися', 'Ball should not roll away', 'Míč se nesmí odkutálet');

    -- Day 1 Exercises - Section 4 (Cooldown)
    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d1-e14'), d1s4_uuid, 0,
     'Статична розтяжка', 'Static stretching', 'Statické protahování',
     ARRAY['Квадріцепс: 30 сек кожна нога', 'Задня поверхня: 30 сек', 'Литки: 30 сек', 'Сідниці: 30 сек'],
     ARRAY['Quadriceps: 30 sec each leg', 'Hamstrings: 30 sec', 'Calves: 30 sec', 'Glutes: 30 sec'],
     ARRAY['Čtyřhlavý: 30 s každá noha', 'Zadní strana: 30 s', 'Lýtka: 30 s', 'Hýždě: 30 s'],
     'checkbox', 240),
    (uuid_generate_v5(ns_uuid, 'exp-d1-e15'), d1s4_uuid, 1,
     'Глибоке дихання', 'Deep breathing', 'Hluboké dýchání',
     ARRAY['Вдих носом (1-4)', 'Затримка (1-2)', 'Видих ротом (1-6)', '5 повторів'],
     ARRAY['Inhale through nose (1-4)', 'Hold (1-2)', 'Exhale through mouth (1-6)', '5 reps'],
     ARRAY['Nádech nosem (1-4)', 'Výdrž (1-2)', 'Výdech ústy (1-6)', '5 opakování'],
     'checkbox', 60);

    RAISE NOTICE 'Program UUID: %', program_uuid;
END $$;

-- =====================================================
-- Generate Days 2-30
-- =====================================================

DO $$
DECLARE
    ns_uuid UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    program_uuid UUID;
    i INTEGER;
    pattern_idx INTEGER;
    day_type TEXT;
    day_title_uk TEXT;
    day_title_en TEXT;
    day_title_cs TEXT;
    day_focus_uk TEXT;
    day_focus_en TEXT;
    day_focus_cs TEXT;
    day_intensity TEXT;
    day_location TEXT;
    day_duration INTEGER;
    day_uuid UUID;
    section_uuid UUID;
BEGIN
    program_uuid := uuid_generate_v5(ns_uuid, 'explosiveness-30');
    
    FOR i IN 2..30 LOOP
        pattern_idx := (i - 1) % 7;
        
        CASE pattern_idx
            WHEN 0 THEN day_type := 'recovery'; day_title_uk := 'Відновлення'; day_title_en := 'Recovery'; day_title_cs := 'Zotavení'; day_focus_uk := 'Активне відновлення'; day_focus_en := 'Active recovery'; day_focus_cs := 'Aktivní zotavení'; day_intensity := 'low'; day_location := 'home'; day_duration := 40;
            WHEN 1 THEN day_type := 'pre-train'; day_title_uk := 'Перед тренуванням'; day_title_en := 'Pre-training'; day_title_cs := 'Před tréninkem'; day_focus_uk := 'Підготовка до вечірнього тренування'; day_focus_en := 'Preparation for evening training'; day_focus_cs := 'Příprava na večerní trénink'; day_intensity := 'low'; day_location := 'home'; day_duration := 40;
            WHEN 2 THEN day_type := 'intensive'; day_title_uk := 'Інтенсив: Швидкість'; day_title_en := 'Intensive: Speed'; day_title_cs := 'Intenzivní: Rychlost'; day_focus_uk := 'Швидкість та вибуховість'; day_focus_en := 'Speed and explosiveness'; day_focus_cs := 'Rychlost a výbušnost'; day_intensity := 'high'; day_location := 'field'; day_duration := 55;
            WHEN 3 THEN day_type := 'pre-train'; day_title_uk := 'Перед тренуванням'; day_title_en := 'Pre-training'; day_title_cs := 'Před tréninkem'; day_focus_uk := 'Підготовка до вечірнього тренування'; day_focus_en := 'Preparation for evening training'; day_focus_cs := 'Příprava na večerní trénink'; day_intensity := 'low'; day_location := 'home'; day_duration := 40;
            WHEN 4 THEN day_type := 'coordination'; day_title_uk := 'Координація'; day_title_en := 'Coordination'; day_title_cs := 'Koordinace'; day_focus_uk := 'Координація та баланс'; day_focus_en := 'Coordination and balance'; day_focus_cs := 'Koordinace a rovnováha'; day_intensity := 'medium'; day_location := 'home'; day_duration := 40;
            WHEN 5 THEN day_type := 'intensive'; day_title_uk := 'Інтенсив або Гра'; day_title_en := 'Intensive or Game'; day_title_cs := 'Intenzivní nebo Hra'; day_focus_uk := 'Матч або інтенсивне тренування'; day_focus_en := 'Match or intensive training'; day_focus_cs := 'Zápas nebo intenzivní trénink'; day_intensity := 'high'; day_location := 'field'; day_duration := 55;
            WHEN 6 THEN day_type := 'rest'; day_title_uk := 'Відпочинок'; day_title_en := 'Rest Day'; day_title_cs := 'Odpočinek'; day_focus_uk := 'Повний відпочинок'; day_focus_en := 'Full rest'; day_focus_cs := 'Plný odpočinek'; day_intensity := 'low'; day_location := 'home'; day_duration := 0;
        END CASE;

        day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-' || i);
        
        INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
        VALUES (day_uuid, program_uuid, i, day_title_uk, day_title_en, day_title_cs, day_focus_uk, day_focus_en, day_focus_cs, day_intensity, day_location, day_duration);

        IF day_type = 'rest' THEN
            section_uuid := uuid_generate_v5(ns_uuid, 'exp-d' || i || '-s1');
            INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs) VALUES (section_uuid, day_uuid, 0, 'Відпочинок', 'Rest', 'Odpočinek');
            INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type)
            VALUES (uuid_generate_v5(ns_uuid, 'exp-d' || i || '-e1'), section_uuid, 0, 'День відпочинку', 'Rest day', 'Den odpočinku',
                    ARRAY['Повний відпочинок від фізичних навантажень', 'Можна легку прогулянку', 'Достатньо сну та правильне харчування'],
                    ARRAY['Full rest from physical activity', 'Light walk is ok', 'Enough sleep and proper nutrition'],
                    ARRAY['Plný odpočinek od fyzické aktivity', 'Lehká procházka je ok', 'Dostatek spánku a správná výživa'], 'checkbox');
        ELSE
            -- Warmup
            section_uuid := uuid_generate_v5(ns_uuid, 'exp-d' || i || '-s1');
            INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES (section_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10);
            INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration) VALUES
            (uuid_generate_v5(ns_uuid, 'exp-d' || i || '-e1'), section_uuid, 0, 'Легкий біг / ходьба', 'Light jog / walk', 'Lehký běh / chůze', ARRAY['3-5 хвилин легкого бігу або швидкої ходьби'], ARRAY['3-5 minutes of light jogging or brisk walking'], ARRAY['3-5 minut lehkého běhu nebo rychlé chůze'], 'checkbox', 240),
            (uuid_generate_v5(ns_uuid, 'exp-d' || i || '-e2'), section_uuid, 1, 'Обертання суглобів', 'Joint rotations', 'Rotace kloubů', ARRAY['Повний комплекс обертань всіх суглобів'], ARRAY['Full rotation complex for all joints'], ARRAY['Kompletní rotace všech kloubů'], 'checkbox', 180);
            
            -- Main
            section_uuid := uuid_generate_v5(ns_uuid, 'exp-d' || i || '-s2');
            INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES (section_uuid, day_uuid, 1, 'Основна частина', 'Main part', 'Hlavní část', 25);
            INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, sets_uk, sets_en, sets_cs)
            VALUES (uuid_generate_v5(ns_uuid, 'exp-d' || i || '-e3'), section_uuid, 0, 'Вправа 1', 'Exercise 1', 'Cvik 1', ARRAY['Детальний опис буде додано'], ARRAY['Detailed description will be added'], ARRAY['Podrobný popis bude přidán'], 'checkbox', '3x10', '3x10', '3x10');
            
            -- Cooldown
            section_uuid := uuid_generate_v5(ns_uuid, 'exp-d' || i || '-s3');
            INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES (section_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5);
            INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration)
            VALUES (uuid_generate_v5(ns_uuid, 'exp-d' || i || '-e4'), section_uuid, 0, 'Статична розтяжка', 'Static stretching', 'Statické protahování', ARRAY['Розтяжка всіх основних груп м''язів по 30 секунд'], ARRAY['Stretch all major muscle groups for 30 seconds each'], ARRAY['Protahování všech hlavních svalových skupin po 30 sekundách'], 'checkbox', 240);
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- VERIFY
-- =====================================================

SELECT 'Programs:' as info, COUNT(*) as count FROM programs;
SELECT 'Days:' as info, COUNT(*) as count FROM program_days;
SELECT 'Sections:' as info, COUNT(*) as count FROM day_sections;
SELECT 'Exercises:' as info, COUNT(*) as count FROM exercises;

