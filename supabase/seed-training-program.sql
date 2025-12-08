-- Seed Training Program: 30-Day Speed & Technique Program
-- Run this after schema.sql

-- First, we need a system user for public programs
-- This should be run after at least one admin user is created
-- For now, we'll use a placeholder that should be updated

-- Create the training program
DO $$
DECLARE
    v_program_id UUID;
    v_day_id UUID;
    v_section_id UUID;
BEGIN
    -- Insert the main program (will need to update author_id with actual user)
    INSERT INTO public.training_programs (
        id,
        title,
        description,
        author_id,
        is_public,
        difficulty,
        duration_weeks,
        focus_areas
    ) VALUES (
        'a0000000-0000-0000-0000-000000000001',
        '{"uk": "30-денна програма швидкості", "en": "30-Day Speed Program", "cs": "30denní rychlostní program"}',
        '{"uk": "Комплексна програма для розвитку швидкості, координації та футбольної техніки", "en": "Comprehensive program for developing speed, coordination and football technique", "cs": "Komplexní program pro rozvoj rychlosti, koordinace a fotbalové techniky"}',
        '00000000-0000-0000-0000-000000000000', -- Placeholder, update with real user ID
        true,
        'beginner',
        4,
        ARRAY['speed', 'coordination', 'technique', 'balance']
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_program_id;

    -- If program already exists, get its ID
    IF v_program_id IS NULL THEN
        SELECT id INTO v_program_id FROM public.training_programs WHERE id = 'a0000000-0000-0000-0000-000000000001';
    END IF;

    -- =============================================
    -- DAY 1: Light Recovery + Tests
    -- =============================================
    INSERT INTO public.program_days (id, program_id, day_number, title, intensity, location, duration_minutes, focus, order_index)
    VALUES (
        'b0000000-0000-0000-0000-000000000001',
        v_program_id,
        1,
        '{"uk": "Легке відновлення + Тести", "en": "Light Recovery + Tests", "cs": "Lehké zotavení + Testy"}',
        'low',
        'home',
        45,
        '{"uk": "Оцінка рівня, активація м''язів", "en": "Level assessment, muscle activation", "cs": "Hodnocení úrovně, aktivace svalů"}',
        1
    ) ON CONFLICT DO NOTHING;

    -- Section 1: Warmup
    INSERT INTO public.day_sections (id, day_id, title, duration_minutes, order_index)
    VALUES (
        'c0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        '{"uk": "Розминка", "en": "Warmup", "cs": "Rozcvička"}',
        10,
        1
    ) ON CONFLICT DO NOTHING;

    -- Exercises for warmup
    INSERT INTO public.exercises (section_id, title, description, type, timer_duration, note, order_index) VALUES
    (
        'c0000000-0000-0000-0000-000000000001',
        '{"uk": "Ходьба з високим підніманням коліна", "en": "High knee walking", "cs": "Chůze s vysokým zvedáním kolen"}',
        '{"uk": ["Коліно піднімай до рівня пояса", "Руки працюють як при бігу", "Перші 30 сек повільно, потім швидше"], "en": ["Raise knee to waist level", "Arms work as when running", "First 30 sec slowly, then faster"], "cs": ["Zvedni koleno do úrovně pasu", "Paže pracují jako při běhu", "Prvních 30 s pomalu, pak rychleji"]}',
        'checkbox',
        120,
        '{"uk": "Спина пряма, дивись вперед", "en": "Keep back straight, look forward", "cs": "Záda rovná, dívej se dopředu"}',
        1
    ),
    (
        'c0000000-0000-0000-0000-000000000001',
        '{"uk": "Обертання суглобів", "en": "Joint rotations", "cs": "Rotace kloubů"}',
        '{"uk": ["Гомілкостоп: по 10 обертань кожною ногою", "Коліна: 10 кіл вправо, 10 вліво", "Таз: 10 обертань в кожну сторону", "Плечі: 10 обертань назад, 10 вперед"], "en": ["Ankles: 10 rotations each leg", "Knees: 10 circles right, 10 left", "Hips: 10 rotations each direction", "Shoulders: 10 back, 10 forward"], "cs": ["Kotníky: 10 rotací každou nohou", "Kolena: 10 kruhů vpravo, 10 vlevo", "Boky: 10 rotací každým směrem", "Ramena: 10 dozadu, 10 dopředu"]}',
        'checkbox',
        180,
        NULL,
        2
    ),
    (
        'c0000000-0000-0000-0000-000000000001',
        '{"uk": "Динамічна розтяжка", "en": "Dynamic stretching", "cs": "Dynamické protahování"}',
        '{"uk": ["Випади вперед з поворотом корпусу: 8 на кожну ногу", "Махи ногою вперед-назад: 10 на кожну ногу", "Махи ногою в сторону: 10 на кожну ногу"], "en": ["Forward lunges with torso twist: 8 each leg", "Leg swings forward-back: 10 each leg", "Leg swings sideways: 10 each leg"], "cs": ["Výpady vpřed s rotací trupu: 8 na každou nohu", "Kyvadlové pohyby nohou vpřed-vzad: 10 na každou nohu", "Kyvadlové pohyby nohou do strany: 10 na každou nohu"]}',
        'checkbox',
        300,
        '{"uk": "Коліно не виходить за носок у випадах", "en": "Knee does not go past toe in lunges", "cs": "Koleno nepřesahuje špičku při výpadech"}',
        3
    )
    ON CONFLICT DO NOTHING;

    -- Section 2: Balance & Coordination Tests
    INSERT INTO public.day_sections (id, day_id, title, duration_minutes, order_index)
    VALUES (
        'c0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000001',
        '{"uk": "Тест балансу та координації", "en": "Balance & Coordination Test", "cs": "Test rovnováhy a koordinace"}',
        15,
        2
    ) ON CONFLICT DO NOTHING;

    -- Exercises for tests
    INSERT INTO public.exercises (section_id, title, description, type, input_label, sets, rest_seconds, timer_duration, note, order_index) VALUES
    (
        'c0000000-0000-0000-0000-000000000002',
        '{"uk": "Баланс на правій нозі", "en": "Right leg balance", "cs": "Rovnováha na pravé noze"}',
        '{"uk": ["Стань на праву ногу, ліву підігни", "Руки в сторони або на поясі", "Очі відкриті, дивись в одну точку", "Засікай час - скільки устоїш"], "en": ["Stand on right leg, bend left", "Arms to sides or on hips", "Eyes open, look at one point", "Time how long you can hold"], "cs": ["Stůj na pravé noze, levou pokrč", "Paže do stran nebo v bok", "Oči otevřené, dívej se na jeden bod", "Měř čas, jak dlouho vydržíš"]}',
        'input',
        '{"uk": "сек (кращий час)", "en": "sec (best time)", "cs": "s (nejlepší čas)"}',
        '3 спроби',
        30,
        60,
        '{"uk": "Запиши кращий результат!", "en": "Record your best result!", "cs": "Zapiš svůj nejlepší výsledek!"}',
        1
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        '{"uk": "Баланс на лівій нозі", "en": "Left leg balance", "cs": "Rovnováha na levé noze"}',
        '{"uk": ["Те саме для лівої ноги"], "en": ["Same for left leg"], "cs": ["Totéž pro levou nohu"]}',
        'input',
        '{"uk": "сек (кращий час)", "en": "sec (best time)", "cs": "s (nejlepší čas)"}',
        '3 спроби',
        30,
        60,
        '{"uk": "Запиши кращий результат!", "en": "Record your best result!", "cs": "Zapiš svůj nejlepší výsledek!"}',
        2
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        '{"uk": "Присідання з контролем", "en": "Controlled squats", "cs": "Kontrolované dřepy"}',
        '{"uk": ["Вниз: повільно (рахуй 1-2-3-4) до паралелі", "Вгору: швидко (рахуй 1) вистрибуй вгору", "Руки витягуй вперед для балансу"], "en": ["Down: slowly (count 1-2-3-4) to parallel", "Up: quickly (count 1) jump up", "Extend arms forward for balance"], "cs": ["Dolů: pomalu (počítej 1-2-3-4) do rovnoběžky", "Nahoru: rychle (počítej 1) vyskoč", "Natáhni paže dopředu pro rovnováhu"]}',
        'checkbox',
        NULL,
        '3x10',
        60,
        60,
        '{"uk": "Коліна не виходять за носки, спина пряма", "en": "Knees do not go past toes, back straight", "cs": "Kolena nepřesahují špičky, záda rovná"}',
        3
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        '{"uk": "Віджимання від підлоги", "en": "Push-ups", "cs": "Kliky"}',
        '{"uk": ["Тіло пряме (дошка), лікті під кутом 45°", "Вниз до торкання грудьми підлоги", "Вгору повністю випрямляючи руки"], "en": ["Body straight (plank), elbows at 45°", "Down until chest touches floor", "Up fully extending arms"], "cs": ["Tělo rovné (prkno), lokty pod úhlem 45°", "Dolů dokud se hrudník nedotkne podlahy", "Nahoru plně natáhni paže"]}',
        'input',
        '{"uk": "кількість разів", "en": "number of reps", "cs": "počet opakování"}',
        NULL,
        NULL,
        60,
        '{"uk": "Максимум з правильною технікою. Якщо важко - на колінах.", "en": "Maximum with proper form. If hard - on knees.", "cs": "Maximum se správnou technikou. Pokud je to těžké - na kolenou."}',
        4
    )
    ON CONFLICT DO NOTHING;

    -- Section 3: Ball Work
    INSERT INTO public.day_sections (id, day_id, title, duration_minutes, order_index)
    VALUES (
        'c0000000-0000-0000-0000-000000000003',
        'b0000000-0000-0000-0000-000000000001',
        '{"uk": "М''яч + координація", "en": "Ball + Coordination", "cs": "Míč + Koordinace"}',
        15,
        3
    ) ON CONFLICT DO NOTHING;

    -- Ball exercises
    INSERT INTO public.exercises (section_id, title, description, type, reps, timer_duration, note, order_index) VALUES
    (
        'c0000000-0000-0000-0000-000000000003',
        '{"uk": "Жонглювання (права нога)", "en": "Juggling (right foot)", "cs": "Žonglování (pravá noha)"}',
        '{"uk": ["Підйом стопи (шнурки)", "М''яч не вище коліна", "Рахуй вголос"], "en": ["Instep (laces)", "Ball not higher than knee", "Count out loud"], "cs": ["Nárt (tkaničky)", "Míč ne výše než koleno", "Počítej nahlas"]}',
        'checkbox',
        '20 торкань',
        120,
        '{"uk": "Коліно злегка зігнуте, удар серединою підйому", "en": "Knee slightly bent, hit with middle of instep", "cs": "Koleno mírně pokrčené, úder středem nártu"}',
        1
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        '{"uk": "Жонглювання (ліва нога)", "en": "Juggling (left foot)", "cs": "Žonglování (levá noha)"}',
        '{"uk": ["Те саме лівою ногою"], "en": ["Same with left foot"], "cs": ["Totéž levou nohou"]}',
        'checkbox',
        '20 торкань',
        120,
        NULL,
        2
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        '{"uk": "Пас в стіну + контроль", "en": "Wall pass + control", "cs": "Přihrávka na zeď + kontrola"}',
        '{"uk": ["Відстань 3-4 метри від стіни", "Пас правою -> Контроль лівою", "Пас лівою -> Контроль правою"], "en": ["Distance 3-4 meters from wall", "Pass right -> Control left", "Pass left -> Control right"], "cs": ["Vzdálenost 3-4 metry od zdi", "Přihrávka pravou -> Kontrola levou", "Přihrávka levou -> Kontrola pravou"]}',
        'checkbox',
        '3x20',
        300,
        '{"uk": "Контроль = м''якко підушкою стопи", "en": "Control = soft with cushion of foot", "cs": "Kontrola = měkce polštářkem nohy"}',
        3
    )
    ON CONFLICT DO NOTHING;

    -- Section 4: Cooldown
    INSERT INTO public.day_sections (id, day_id, title, duration_minutes, order_index)
    VALUES (
        'c0000000-0000-0000-0000-000000000004',
        'b0000000-0000-0000-0000-000000000001',
        '{"uk": "Заминка", "en": "Cooldown", "cs": "Zklidnění"}',
        5,
        4
    ) ON CONFLICT DO NOTHING;

    -- Cooldown exercises
    INSERT INTO public.exercises (section_id, title, description, type, timer_duration, order_index) VALUES
    (
        'c0000000-0000-0000-0000-000000000004',
        '{"uk": "Статична розтяжка", "en": "Static stretching", "cs": "Statické protahování"}',
        '{"uk": ["Квадріцепс: 30 сек кожна нога", "Задня поверхня: 30 сек кожна нога", "Литкові м''язи: 30 сек кожна нога", "Сідниці: 30 сек кожна сторона"], "en": ["Quadriceps: 30 sec each leg", "Hamstrings: 30 sec each leg", "Calves: 30 sec each leg", "Glutes: 30 sec each side"], "cs": ["Čtyřhlavý sval: 30 s každá noha", "Zadní strana stehna: 30 s každá noha", "Lýtka: 30 s každá noha", "Hýždě: 30 s každá strana"]}',
        'checkbox',
        240,
        1
    ),
    (
        'c0000000-0000-0000-0000-000000000004',
        '{"uk": "Глибоке дихання", "en": "Deep breathing", "cs": "Hluboké dýchání"}',
        '{"uk": ["Вдих носом (рахуй 1-4)", "Затримка (1-2)", "Видих ротом (1-6)", "5 повторів"], "en": ["Inhale through nose (count 1-4)", "Hold (1-2)", "Exhale through mouth (1-6)", "5 repetitions"], "cs": ["Nádech nosem (počítej 1-4)", "Výdrž (1-2)", "Výdech ústy (1-6)", "5 opakování"]}',
        'checkbox',
        60,
        2
    )
    ON CONFLICT DO NOTHING;

    -- =============================================
    -- DAY 2: Light Technique
    -- =============================================
    INSERT INTO public.program_days (id, program_id, day_number, title, intensity, location, duration_minutes, focus, order_index)
    VALUES (
        'b0000000-0000-0000-0000-000000000002',
        v_program_id,
        2,
        '{"uk": "Легка техніка", "en": "Light Technique", "cs": "Lehká technika"}',
        'low',
        'home',
        45,
        '{"uk": "Активація м''язів, швидкість ніг", "en": "Muscle activation, foot speed", "cs": "Aktivace svalů, rychlost nohou"}',
        2
    ) ON CONFLICT DO NOTHING;

    -- =============================================
    -- DAY 3: Intensive Speed
    -- =============================================
    INSERT INTO public.program_days (id, program_id, day_number, title, intensity, location, duration_minutes, focus, order_index)
    VALUES (
        'b0000000-0000-0000-0000-000000000003',
        v_program_id,
        3,
        '{"uk": "Інтенсив: Вибухова швидкість", "en": "Intensive: Explosive Speed", "cs": "Intenzivní: Výbušná rychlost"}',
        'high',
        'field',
        55,
        '{"uk": "Максимум швидкості та вибуховості!", "en": "Maximum speed and explosiveness!", "cs": "Maximální rychlost a výbušnost!"}',
        3
    ) ON CONFLICT DO NOTHING;

    -- Generate remaining days (4-30) with pattern
    FOR i IN 4..30 LOOP
        INSERT INTO public.program_days (program_id, day_number, title, intensity, location, duration_minutes, focus, order_index)
        VALUES (
            v_program_id,
            i,
            CASE (i - 1) % 7
                WHEN 0 THEN '{"uk": "Відновлення", "en": "Recovery", "cs": "Zotavení"}'::jsonb
                WHEN 1 THEN '{"uk": "Перед тренуванням", "en": "Pre-training", "cs": "Před tréninkem"}'::jsonb
                WHEN 2 THEN '{"uk": "Інтенсив: Швидкість", "en": "Intensive: Speed", "cs": "Intenzivní: Rychlost"}'::jsonb
                WHEN 3 THEN '{"uk": "Перед тренуванням", "en": "Pre-training", "cs": "Před tréninkem"}'::jsonb
                WHEN 4 THEN '{"uk": "Координація", "en": "Coordination", "cs": "Koordinace"}'::jsonb
                WHEN 5 THEN '{"uk": "Інтенсив або Гра", "en": "Intensive or Game", "cs": "Intenzivní nebo Hra"}'::jsonb
                ELSE '{"uk": "Відпочинок", "en": "Rest", "cs": "Odpočinek"}'::jsonb
            END,
            CASE (i - 1) % 7
                WHEN 2 THEN 'high'
                WHEN 5 THEN 'high'
                WHEN 4 THEN 'medium'
                ELSE 'low'
            END,
            CASE (i - 1) % 7
                WHEN 2 THEN 'field'
                WHEN 5 THEN 'field'
                ELSE 'home'
            END,
            CASE (i - 1) % 7
                WHEN 2 THEN 55
                WHEN 5 THEN 60
                WHEN 6 THEN 0
                ELSE 40
            END,
            CASE (i - 1) % 7
                WHEN 6 THEN '{"uk": "Повний відпочинок", "en": "Full rest", "cs": "Úplný odpočinek"}'::jsonb
                ELSE '{"uk": "Розвиток якостей", "en": "Quality development", "cs": "Rozvoj kvalit"}'::jsonb
            END,
            i
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Training program seeded successfully!';
END $$;

