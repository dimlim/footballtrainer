-- =====================================================
-- EXPLOSIVENESS PROGRAM - Days 11-20
-- Run AFTER explosiveness-days-2-10.sql
-- =====================================================

DO $$
DECLARE
    ns_uuid UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    program_uuid UUID;
    day_uuid UUID;
    s1_uuid UUID;
    s2_uuid UUID;
    s3_uuid UUID;
    s4_uuid UUID;
BEGIN
    program_uuid := uuid_generate_v5(ns_uuid, 'explosiveness-30');

    -- =====================================================
    -- DAY 11: Активне відновлення
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-11');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d11-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d11-s2');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 11, 'Активне відновлення', 'Active Recovery', 'Aktivní regenerace',
            'Мобільність, розтяжка', 'Mobility, stretching', 'Mobilita, protahování', 'low', 'home', 30)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Мобільність', 'Mobility', 'Mobilita', 15),
    (s2_uuid, day_uuid, 1, 'Глибока розтяжка', 'Deep stretch', 'Hluboké protažení', 15)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d11-e1'), s1_uuid, 0, 'Кішка-корова', 'Cat-cow', 'Kočka-kráva',
     ARRAY['На четвереньках', 'Прогинай і округляй спину', '10 повільних повторів'],
     ARRAY['On all fours', 'Arch and round back', '10 slow reps'],
     ARRAY['Na čtyřech', 'Prohýbej a zaokrouhluj záda', '10 pomalých opakování'],
     'checkbox', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e2'), s1_uuid, 1, 'Скорпіон', 'Scorpion', 'Škorpion',
     ARRAY['Лежи на животі', 'Тягни праву ногу до лівої руки', 'Чергуй сторони'],
     ARRAY['Lie on stomach', 'Reach right leg to left hand', 'Alternate sides'],
     ARRAY['Lež na břiše', 'Táhni pravou nohu k levé ruce', 'Střídej strany'],
     'checkbox', 120),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e3'), s1_uuid, 2, 'Світовий найбільший розтяг', 'World''s greatest stretch', 'Největší protažení světa',
     ARRAY['Випад вперед', 'Лікоть до підлоги біля стопи', 'Рука вгору з поворотом'],
     ARRAY['Forward lunge', 'Elbow to floor by foot', 'Arm up with rotation'],
     ARRAY['Výpad vpřed', 'Loket k podlaze u nohy', 'Paže nahoru s rotací'],
     'checkbox', 120),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e4'), s1_uuid, 3, '90/90 розтяжка стегон', '90/90 hip stretch', '90/90 protažení kyčlí',
     ARRAY['Сядь з ногами під 90°', 'Одна нога попереду, інша збоку', 'Нахиляйся вперед'],
     ARRAY['Sit with legs at 90°', 'One leg front, one side', 'Lean forward'],
     ARRAY['Sedni s nohama pod 90°', 'Jedna noha vpředu, druhá do strany', 'Nakloň se dopředu'],
     'timer', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e5'), s2_uuid, 0, 'Поза голуба', 'Pigeon pose', 'Holubí pozice',
     ARRAY['Передня нога зігнута', 'Задня витягнута', '60 сек на сторону'],
     ARRAY['Front leg bent', 'Back leg extended', '60 sec per side'],
     ARRAY['Přední noha pokrčená', 'Zadní natažená', '60 s na stranu'],
     'timer', 120),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e6'), s2_uuid, 1, 'Розтяжка квадріцепса лежачи', 'Lying quad stretch', 'Ležící protažení čtyřhlavého',
     ARRAY['Лежи на боці', 'Тягни п''яту до сідниці', '45 сек на ногу'],
     ARRAY['Lie on side', 'Pull heel to glute', '45 sec per leg'],
     ARRAY['Lež na boku', 'Táhni patu k hýždi', '45 s na nohu'],
     'timer', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e7'), s2_uuid, 2, 'Розтяжка задньої поверхні', 'Hamstring stretch', 'Protažení zadní strany',
     ARRAY['Лежи на спині', 'Підніми ногу і тягни до себе', '45 сек на ногу'],
     ARRAY['Lie on back', 'Raise leg and pull toward you', '45 sec per leg'],
     ARRAY['Lež na zádech', 'Zvedni nohu a táhni k sobě', '45 s na nohu'],
     'timer', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d11-e8'), s2_uuid, 3, 'Поза дитини', 'Child''s pose', 'Dětská pozice',
     ARRAY['Сідай на п''яти', 'Руки витягнуті вперед', 'Розслаб спину'],
     ARRAY['Sit on heels', 'Arms extended forward', 'Relax back'],
     ARRAY['Sedni si na paty', 'Paže natažené dopředu', 'Uvolni záda'],
     'timer', 60)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 12: Вибухові стрибки 2.0
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-12');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d12-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d12-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d12-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d12-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 12, 'Вибухові стрибки 2.0', 'Explosive Jumps 2.0', 'Výbušné skoky 2.0',
            'Прогресія плайометрики', 'Plyometric progression', 'Progrese plyometrie', 'very_high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Плайометрика', 'Plyometrics', 'Plyometrie', 25),
    (s3_uuid, day_uuid, 2, 'Фініш', 'Finisher', 'Závěr', 10),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d12-e1'), s1_uuid, 0, 'Біг з прискореннями', 'Jog with accelerations', 'Běh se zrychleními',
     ARRAY['3 хв легкого бігу', 'Кожні 20 сек - прискорення'],
     ARRAY['3 min light jog', 'Every 20 sec - acceleration'],
     ARRAY['3 min lehkého běhu', 'Každých 20 s - zrychlení'],
     'timer', 180, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d12-e2'), s1_uuid, 1, 'Активаційні стрибки', 'Activation jumps', 'Aktivační skoky',
     ARRAY['Невисокі стрибки на місці', 'Фокус на техніці приземлення'],
     ARRAY['Low jumps in place', 'Focus on landing technique'],
     ARRAY['Nízké skoky na místě', 'Zaměř se na techniku dopadu'],
     'checkbox', NULL, '2x15', '2x15', '2x15', 20),
    -- Plyometrics
    (uuid_generate_v5(ns_uuid, 'exp-d12-e3'), s2_uuid, 0, 'Стрибки з підтягуванням колін', 'Tuck jumps', 'Skoky s přitažením kolen',
     ARRAY['Вистрибни вгору', 'Підтягни коліна до грудей', 'М''яке приземлення'],
     ARRAY['Jump up', 'Pull knees to chest', 'Soft landing'],
     ARRAY['Vyskoč nahoru', 'Přitáhni kolena k hrudi', 'Měkký dopad'],
     'checkbox', NULL, '4x8', '4x8', '4x8', 75),
    (uuid_generate_v5(ns_uuid, 'exp-d12-e4'), s2_uuid, 1, 'Бокові стрибки через лінію', 'Lateral line jumps', 'Boční skoky přes čáru',
     ARRAY['Стрибай вбік через уявну лінію', 'Мінімальний час на землі', '30 сек максимальної швидкості'],
     ARRAY['Jump sideways over imaginary line', 'Minimal ground time', '30 sec max speed'],
     ARRAY['Skoky do strany přes imaginární čáru', 'Minimální čas na zemi', '30 s max rychlost'],
     'timer', 30, '4 серії', '4 sets', '4 série', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d12-e5'), s2_uuid, 2, 'Стрибки на одній нозі вперед', 'Single leg bounds', 'Skoky na jedné noze vpřed',
     ARRAY['Стрибай вперед на одній нозі', 'Максимальна дальність', '5 стрибків на кожну'],
     ARRAY['Bound forward on one leg', 'Maximum distance', '5 bounds each'],
     ARRAY['Skoky vpřed na jedné noze', 'Maximální vzdálenost', '5 skoků na každou'],
     'checkbox', NULL, '3 серії', '3 sets', '3 série', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d12-e6'), s2_uuid, 3, 'Вибухові випади зі стрибком', 'Jump lunges', 'Výskoky z výpadu',
     ARRAY['Позиція випаду', 'Вистрибни і поміняй ноги', 'Глибокий випад при приземленні'],
     ARRAY['Lunge position', 'Jump and switch legs', 'Deep lunge on landing'],
     ARRAY['Pozice výpadu', 'Vyskoč a vyměň nohy', 'Hluboký výpad při dopadu'],
     'checkbox', NULL, '3x14', '3x14', '3x14', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d12-e7'), s2_uuid, 4, 'Стрибки у глибину + спринт', 'Depth jump + sprint', 'Hloubkový skok + sprint',
     ARRAY['Зістрибни з підвищення', 'Одразу вистрибни + спринт 5м'],
     ARRAY['Step off elevation', 'Immediately jump + 5m sprint'],
     ARRAY['Seskoč z vyvýšení', 'Okamžitě vyskoč + 5m sprint'],
     'checkbox', NULL, '5 повторів', '5 reps', '5 opakování', 90),
    -- Finisher
    (uuid_generate_v5(ns_uuid, 'exp-d12-e8'), s3_uuid, 0, 'Табата стрибки', 'Tabata jumps', 'Tabata skoky',
     ARRAY['20 сек стрибки - 10 сек відпочинок', '4 раунди', 'Максимальна інтенсивність'],
     ARRAY['20 sec jumps - 10 sec rest', '4 rounds', 'Maximum intensity'],
     ARRAY['20 s skoky - 10 s odpočinek', '4 kola', 'Maximální intenzita'],
     'timer', 240, NULL, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d12-e9'), s4_uuid, 0, 'Ходьба + розтяжка', 'Walk + stretch', 'Chůze + protažení',
     ARRAY['2 хв ходьби', 'Розтяжка ніг'],
     ARRAY['2 min walking', 'Leg stretching'],
     ARRAY['2 min chůze', 'Protažení nohou'],
     'timer', 300, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 13: День відпочинку
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-13');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d13-s1');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 13, 'День відпочинку', 'Rest Day', 'Den odpočinku',
            'Повне відновлення', 'Full recovery', 'Plná regenerace', 'rest', 'home', 10)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Відпочинок', 'Rest', 'Odpočinek', 10)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d13-e1'), s1_uuid, 0, 'Повний відпочинок', 'Full rest', 'Plný odpočinek',
     ARRAY['Сьогодні відпочивай', 'Пий воду', 'Добре їж', 'Виспись'],
     ARRAY['Rest today', 'Drink water', 'Eat well', 'Sleep well'],
     ARRAY['Dnes odpočívej', 'Pij vodu', 'Jez dobře', 'Dobře spi'],
     'checkbox')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 14: Швидкість та реакція 2.0
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-14');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d14-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d14-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d14-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d14-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 14, 'Швидкість та реакція 2.0', 'Speed & Reaction 2.0', 'Rychlost a reakce 2.0',
            'Прогресія швидкості', 'Speed progression', 'Progrese rychlosti', 'high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Спринти', 'Sprints', 'Sprinty', 18),
    (s3_uuid, day_uuid, 2, 'Реакція + агілі', 'Reaction + agility', 'Reakce + hbitost', 17),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d14-e1'), s1_uuid, 0, 'Біг з підніманням колін', 'High knees run', 'Běh s vysokými koleny',
     ARRAY['Коліна вище пояса', '20 метрів'],
     ARRAY['Knees above waist', '20 meters'],
     ARRAY['Kolena nad pas', '20 metrů'],
     'checkbox', NULL, '3 рази', '3 times', '3 krát', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d14-e2'), s1_uuid, 1, 'Біг з закиданням гомілок', 'Butt kicks', 'Zakopávání',
     ARRAY['П''яти до сідниць', '20 метрів'],
     ARRAY['Heels to glutes', '20 meters'],
     ARRAY['Paty k hýždím', '20 metrů'],
     'checkbox', NULL, '3 рази', '3 times', '3 krát', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d14-e3'), s1_uuid, 2, 'Каріока', 'Carioca', 'Carioca',
     ARRAY['Бічний біг з перехрестом ніг', 'По 20м в кожну сторону'],
     ARRAY['Lateral run with leg crossover', '20m each direction'],
     ARRAY['Boční běh s překřížením nohou', '20m každým směrem'],
     'checkbox', NULL, '2 рази', '2 times', '2 krát', 20, NULL, NULL, NULL),
    -- Sprints
    (uuid_generate_v5(ns_uuid, 'exp-d14-e4'), s2_uuid, 0, 'Спринт 10м з різних позицій', '10m sprint from positions', '10m sprint z pozic',
     ARRAY['Старт стоячи', 'Старт сидячи', 'Старт лежачи на животі', 'Старт лежачи на спині'],
     ARRAY['Standing start', 'Sitting start', 'Prone start', 'Supine start'],
     ARRAY['Start vestoje', 'Start vsedě', 'Start vleže na břiše', 'Start vleže na zádech'],
     'checkbox', NULL, '2 з кожної', '2 from each', '2 z každé', 60, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d14-e5'), s2_uuid, 1, 'Спринт 30м', '30m sprint', '30m sprint',
     ARRAY['Максимальна швидкість', 'Тримай форму до кінця'],
     ARRAY['Maximum speed', 'Maintain form to end'],
     ARRAY['Maximální rychlost', 'Drž formu do konce'],
     'input', NULL, '4 повтори', '4 reps', '4 opakování', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)'),
    (uuid_generate_v5(ns_uuid, 'exp-d14-e6'), s2_uuid, 2, 'Човник 10-20-10', '10-20-10 shuttle', '10-20-10 člunok',
     ARRAY['10м вперед, торкнись', '20м назад, торкнись', '10м вперед до фінішу'],
     ARRAY['10m forward, touch', '20m back, touch', '10m forward to finish'],
     ARRAY['10m vpřed, dotkni se', '20m zpět, dotkni se', '10m vpřed do cíle'],
     'input', NULL, '4 рази', '4 times', '4 krát', 90, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)'),
    -- Reaction + agility
    (uuid_generate_v5(ns_uuid, 'exp-d14-e7'), s3_uuid, 0, 'Реакція на команду', 'Command reaction', 'Reakce na povel',
     ARRAY['Біжи на місці', 'На команду "вперед" - спринт 5м', 'На "назад" - біг спиною', 'На "вниз" - падіння і підйом'],
     ARRAY['Run in place', 'On "forward" - 5m sprint', 'On "back" - backpedal', 'On "down" - drop and up'],
     ARRAY['Běž na místě', 'Na "vpřed" - 5m sprint', 'Na "vzad" - běh pozadu', 'Na "dolů" - pád a vstávání'],
     'timer', 120, '3 серії', '3 sets', '3 série', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d14-e8'), s3_uuid, 1, 'Т-тест', 'T-test', 'T-test',
     ARRAY['Спринт 10м вперед', 'Біг боком 5м вліво', 'Біг боком 10м вправо', 'Біг боком 5м вліво', 'Спринт 10м назад'],
     ARRAY['Sprint 10m forward', 'Shuffle 5m left', 'Shuffle 10m right', 'Shuffle 5m left', 'Sprint 10m back'],
     ARRAY['Sprint 10m vpřed', 'Pohyb bokem 5m vlevo', 'Pohyb bokem 10m vpravo', 'Pohyb bokem 5m vlevo', 'Sprint 10m zpět'],
     'input', NULL, '4 рази', '4 times', '4 krát', 90, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)'),
    (uuid_generate_v5(ns_uuid, 'exp-d14-e9'), s3_uuid, 2, 'Квадрат агіліті', 'Agility square', 'Čtverec hbitosti',
     ARRAY['Постав 4 конуси квадратом 5x5м', 'Спринт → біг боком → біг спиною → біг боком'],
     ARRAY['Set 4 cones in 5x5m square', 'Sprint → shuffle → backpedal → shuffle'],
     ARRAY['Postav 4 kužely do čtverce 5x5m', 'Sprint → pohyb bokem → běh pozadu → pohyb bokem'],
     'checkbox', NULL, '5 кіл', '5 laps', '5 kol', 60, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d14-e10'), s4_uuid, 0, 'Легкий біг + розтяжка', 'Light jog + stretch', 'Lehký běh + protažení',
     ARRAY['2 хв легкого бігу', 'Розтяжка ніг'],
     ARRAY['2 min light jog', 'Leg stretching'],
     ARRAY['2 min lehkého běhu', 'Protažení nohou'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 15: Сила кора 2.0
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-15');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d15-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d15-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d15-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 15, 'Сила кора 2.0', 'Core Strength 2.0', 'Síla středu těla 2.0',
            'Прогресія кора', 'Core progression', 'Progrese středu těla', 'medium', 'home', 40)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Активація', 'Activation', 'Aktivace', 8),
    (s2_uuid, day_uuid, 1, 'Сила кора', 'Core strength', 'Síla středu těla', 27),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Activation
    (uuid_generate_v5(ns_uuid, 'exp-d15-e1'), s1_uuid, 0, 'Мертвий жук', 'Dead bug', 'Mrtvý brouk',
     ARRAY['Руки вгору, ноги 90°', 'Опускай протилежні руку і ногу'],
     ARRAY['Arms up, legs 90°', 'Lower opposite arm and leg'],
     ARRAY['Paže nahoru, nohy 90°', 'Spouštěj opačnou ruku a nohu'],
     'checkbox', NULL, '2x12', '2x12', '2x12', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d15-e2'), s1_uuid, 1, 'Пташиний пес', 'Bird dog', 'Ptačí pes',
     ARRAY['На четвереньках', 'Витягни протилежні руку і ногу', 'Тримай 3 сек'],
     ARRAY['On all fours', 'Extend opposite arm and leg', 'Hold 3 sec'],
     ARRAY['Na čtyřech', 'Natáhni opačnou ruku a nohu', 'Vydrž 3 s'],
     'checkbox', NULL, '2x10 на сторону', '2x10 per side', '2x10 na stranu', 30),
    -- Core
    (uuid_generate_v5(ns_uuid, 'exp-d15-e3'), s2_uuid, 0, 'Планка 60 сек', '60 sec plank', '60 s plank',
     ARRAY['На ліктях і носках', 'Тіло пряме'],
     ARRAY['On elbows and toes', 'Body straight'],
     ARRAY['Na loktech a špičkách', 'Tělo rovné'],
     'timer', 60, '3 серії', '3 sets', '3 série', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d15-e4'), s2_uuid, 1, 'Бічна планка з підйомом ноги', 'Side plank leg lift', 'Boční plank se zvedáním nohy',
     ARRAY['Бічна планка', 'Підніми верхню ногу', 'Тримай 30 сек'],
     ARRAY['Side plank', 'Lift top leg', 'Hold 30 sec'],
     ARRAY['Boční plank', 'Zvedni horní nohu', 'Vydrž 30 s'],
     'timer', 30, '2 на сторону', '2 per side', '2 na stranu', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d15-e5'), s2_uuid, 2, 'Альпініст', 'Mountain climbers', 'Horolezec',
     ARRAY['Позиція планки на руках', 'Підтягуй коліна до грудей по черзі', 'Швидкий темп'],
     ARRAY['Push-up plank position', 'Pull knees to chest alternately', 'Fast pace'],
     ARRAY['Pozice kliku', 'Přitahuj kolena k hrudi střídavě', 'Rychlé tempo'],
     'timer', 45, '3 серії', '3 sets', '3 série', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d15-e6'), s2_uuid, 3, 'V-ups', 'V-ups', 'V-ups',
     ARRAY['Лежи на спині', 'Одночасно підніми руки і ноги', 'Торкнися носків руками'],
     ARRAY['Lie on back', 'Simultaneously raise arms and legs', 'Touch toes with hands'],
     ARRAY['Lež na zádech', 'Současně zvedni paže a nohy', 'Dotkni se špičky rukama'],
     'checkbox', NULL, '3x12', '3x12', '3x12', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d15-e7'), s2_uuid, 4, 'Російські скручування', 'Russian twists', 'Ruské rotace',
     ARRAY['Сидячи, ноги підняті', 'Повертай тулуб вліво-вправо', 'Можна з м''ячем'],
     ARRAY['Sitting, legs raised', 'Rotate torso left-right', 'Can use ball'],
     ARRAY['Vsedě, nohy zvednuté', 'Otáčej trup vlevo-vpravo', 'Můžeš použít míč'],
     'checkbox', NULL, '3x20', '3x20', '3x20', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d15-e8'), s2_uuid, 5, 'Планка з торканням коліна', 'Plank knee taps', 'Plank s dotykem kolena',
     ARRAY['Планка на руках', 'Торкнися коліном протилежного ліктя', 'Чергуй сторони'],
     ARRAY['Push-up plank', 'Touch knee to opposite elbow', 'Alternate sides'],
     ARRAY['Plank na rukou', 'Dotkni se kolenem opačného lokte', 'Střídej strany'],
     'checkbox', NULL, '3x16', '3x16', '3x16', 45),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d15-e9'), s3_uuid, 0, 'Розтяжка спини', 'Back stretch', 'Protažení zad',
     ARRAY['Поза дитини', 'Скручування лежачи'],
     ARRAY['Child''s pose', 'Lying twist'],
     ARRAY['Dětská pozice', 'Ležící rotace'],
     'timer', 180, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 16: Техніка з м'ячем 2.0
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-16');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d16-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d16-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d16-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 16, 'Техніка з м''ячем 2.0', 'Ball Technique 2.0', 'Technika s míčem 2.0',
            'Складніші фінти', 'Advanced skills', 'Pokročilé dovednosti', 'medium', 'home', 45)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Фінти та трюки', 'Skills and tricks', 'Finty a triky', 30),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d16-e1'), s1_uuid, 0, 'Жонглювання', 'Juggling', 'Žonglování',
     ARRAY['Розігрій з м''ячем', 'Ноги, стегна, голова'],
     ARRAY['Ball warmup', 'Feet, thighs, head'],
     ARRAY['Zahřátí s míčem', 'Nohy, stehna, hlava'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e2'), s1_uuid, 1, 'Котіння м''яча', 'Ball rolls', 'Kutálení míče',
     ARRAY['Підошвою вперед-назад', 'Вліво-вправо'],
     ARRAY['Sole forward-back', 'Left-right'],
     ARRAY['Podrážkou vpřed-vzad', 'Vlevo-vpravo'],
     'timer', 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Skills
    (uuid_generate_v5(ns_uuid, 'exp-d16-e3'), s2_uuid, 0, 'Рулетка (Зідан)', 'Roulette (Zidane)', 'Ruleta (Zidane)',
     ARRAY['Накрий м''яч підошвою', 'Прокрути тіло навколо м''яча', 'Виходь в інший бік'],
     ARRAY['Cover ball with sole', 'Spin body around ball', 'Exit other direction'],
     ARRAY['Zakryj míč podrážkou', 'Otoč tělo kolem míče', 'Vyjdi na druhou stranu'],
     'checkbox', NULL, '10 на ногу', '10 per leg', '10 na nohu', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e4'), s2_uuid, 1, 'Степ-овер + вихід', 'Step-over + exit', 'Step-over + odchod',
     ARRAY['2 степ-овери', 'Вихід зовнішньою частиною в інший бік'],
     ARRAY['2 step-overs', 'Exit with outside other direction'],
     ARRAY['2 step-overy', 'Odchod vnější stranou na druhou stranu'],
     'checkbox', NULL, '8 на ногу', '8 per leg', '8 na nohu', 20, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e5'), s2_uuid, 2, 'Еластіко подвійний', 'Double elastico', 'Dvojité elastico',
     ARRAY['Зовнішня → внутрішня → зовнішня', 'Швидкий рух стопою'],
     ARRAY['Outside → inside → outside', 'Quick foot movement'],
     ARRAY['Vnější → vnitřní → vnější', 'Rychlý pohyb nohou'],
     'checkbox', NULL, '8 на ногу', '8 per leg', '8 na nohu', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e6'), s2_uuid, 3, 'Обманний рух тілом', 'Body feint', 'Klam tělem',
     ARRAY['Нахил тіла в один бік', 'Вихід м''ячем в інший'],
     ARRAY['Body lean one direction', 'Exit with ball other way'],
     ARRAY['Náklon těla jedním směrem', 'Odchod s míčem na druhou stranu'],
     'checkbox', NULL, '10 на сторону', '10 per side', '10 na stranu', 20, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e7'), s2_uuid, 4, 'Крокет (проштовхування)', 'Cruyff turn', 'Cruyffův obrat',
     ARRAY['Замах на удар', 'Замість удару - пас за опорну ногу'],
     ARRAY['Fake shot', 'Instead - pass behind standing leg'],
     ARRAY['Falešná střela', 'Místo toho - přihrávka za stojnou nohu'],
     'checkbox', NULL, '8 на ногу', '8 per leg', '8 na nohu', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e8'), s2_uuid, 5, 'Комбо: степ-овер + еластіко', 'Combo: step-over + elastico', 'Kombo: step-over + elastico',
     ARRAY['Степ-овер однією ногою', 'Еластіко іншою'],
     ARRAY['Step-over with one foot', 'Elastico with other'],
     ARRAY['Step-over jednou nohou', 'Elastico druhou'],
     'checkbox', NULL, '6 комбо', '6 combos', '6 komb', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d16-e9'), s2_uuid, 6, 'Жонглювання - новий рекорд', 'Juggling - new record', 'Žonglování - nový rekord',
     ARRAY['Спробуй побити свій рекорд', 'Чергування ніг'],
     ARRAY['Try to beat your record', 'Alternating feet'],
     ARRAY['Zkus překonat svůj rekord', 'Střídání nohou'],
     'input', 300, NULL, NULL, NULL, NULL, 'макс. серія', 'max series', 'max série'),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d16-e10'), s3_uuid, 0, 'Розтяжка', 'Stretching', 'Protahování',
     ARRAY['Ноги, спина'],
     ARRAY['Legs, back'],
     ARRAY['Nohy, záda'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 17: Сила ніг 2.0
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-17');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d17-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d17-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d17-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 17, 'Сила ніг 2.0', 'Leg Strength 2.0', 'Síla nohou 2.0',
            'Прогресія силових', 'Strength progression', 'Progrese síly', 'high', 'home', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Силові вправи', 'Strength exercises', 'Silové cviky', 35),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d17-e1'), s1_uuid, 0, 'Легкий біг на місці', 'Light running in place', 'Lehký běh na místě',
     ARRAY['2 хвилини'],
     ARRAY['2 minutes'],
     ARRAY['2 minuty'],
     'timer', 120, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e2'), s1_uuid, 1, 'Динамічна розтяжка', 'Dynamic stretch', 'Dynamické protažení',
     ARRAY['Випади', 'Махи ногами'],
     ARRAY['Lunges', 'Leg swings'],
     ARRAY['Výpady', 'Kyvadlové nohy'],
     'timer', 180, NULL, NULL, NULL, NULL),
    -- Strength
    (uuid_generate_v5(ns_uuid, 'exp-d17-e3'), s2_uuid, 0, 'Присідання з вистрибуванням', 'Jump squats', 'Dřepy s výskokem',
     ARRAY['Присядь', 'Вистрибни максимально вгору', 'М''яке приземлення'],
     ARRAY['Squat', 'Jump as high as possible', 'Soft landing'],
     ARRAY['Dřep', 'Vyskoč co nejvýše', 'Měkký dopad'],
     'checkbox', NULL, '4x10', '4x10', '4x10', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e4'), s2_uuid, 1, 'Болгарські випади з паузою', 'Bulgarian split squat with pause', 'Bulharské výpady s pauzou',
     ARRAY['Задня нога на підвищенні', 'Пауза 2 сек внизу'],
     ARRAY['Back leg on elevation', '2 sec pause at bottom'],
     ARRAY['Zadní noha na vyvýšení', '2 s pauza dole'],
     'checkbox', NULL, '3x12 на ногу', '3x12 per leg', '3x12 na nohu', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e5'), s2_uuid, 2, 'Присідання пістолет (з допомогою)', 'Pistol squat (assisted)', 'Pistole (s dopomocí)',
     ARRAY['На одній нозі', 'Тримайся за опору', 'Повільно вниз і вгору'],
     ARRAY['On one leg', 'Hold support', 'Slowly down and up'],
     ARRAY['Na jedné noze', 'Drž se opory', 'Pomalu dolů a nahoru'],
     'checkbox', NULL, '3x8 на ногу', '3x8 per leg', '3x8 na nohu', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e6'), s2_uuid, 3, 'Випади з ходьбою', 'Walking lunges', 'Výpady s chůzí',
     ARRAY['Крок вперед у випад', 'Наступний крок іншою ногою', '20 кроків'],
     ARRAY['Step forward into lunge', 'Next step other leg', '20 steps'],
     ARRAY['Krok vpřed do výpadu', 'Další krok druhou nohou', '20 kroků'],
     'checkbox', NULL, '3x20', '3x20', '3x20', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e7'), s2_uuid, 4, 'Підйом на носки на одній нозі', 'Single leg calf raises', 'Výpony na jedné noze',
     ARRAY['Стань на край сходинки', 'Підйом на одній нозі'],
     ARRAY['Stand on edge of step', 'Rise on one leg'],
     ARRAY['Stůj na kraji schodu', 'Zvedání na jedné noze'],
     'checkbox', NULL, '3x15 на ногу', '3x15 per leg', '3x15 na nohu', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e8'), s2_uuid, 5, 'Стіна 90 сек', 'Wall sit 90 sec', 'Zeď 90 s',
     ARRAY['Спиною до стіни', 'Коліна 90°', 'Тримай'],
     ARRAY['Back to wall', 'Knees 90°', 'Hold'],
     ARRAY['Zády ke zdi', 'Kolena 90°', 'Vydrž'],
     'timer', 90, '2 серії', '2 sets', '2 série', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d17-e9'), s2_uuid, 6, 'Стрибки на одній нозі', 'Single leg hops', 'Skoky na jedné noze',
     ARRAY['10 стрибків на правій', '10 на лівій'],
     ARRAY['10 hops on right', '10 on left'],
     ARRAY['10 skoků na pravé', '10 na levé'],
     'checkbox', NULL, '3 серії', '3 sets', '3 série', 45),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d17-e10'), s3_uuid, 0, 'Розтяжка ніг', 'Leg stretch', 'Protažení nohou',
     ARRAY['Всі групи м''язів', 'По 30 сек'],
     ARRAY['All muscle groups', '30 sec each'],
     ARRAY['Všechny svalové skupiny', '30 s každá'],
     'timer', 180, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 18: Швидкість + М'яч 2.0
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-18');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d18-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d18-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d18-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d18-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 18, 'Швидкість + М''яч 2.0', 'Speed + Ball 2.0', 'Rychlost + Míč 2.0',
            'Прогресія швидкості з м''ячем', 'Ball speed progression', 'Progrese rychlosti s míčem', 'high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Швидкісна робота', 'Speed work', 'Rychlostní práce', 15),
    (s3_uuid, day_uuid, 2, 'М''яч на швидкості', 'Ball at speed', 'Míč v rychlosti', 20),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d18-e1'), s1_uuid, 0, 'Легкий біг з м''ячем', 'Light jog with ball', 'Lehký běh s míčem',
     ARRAY['3 хвилини'],
     ARRAY['3 minutes'],
     ARRAY['3 minuty'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d18-e2'), s1_uuid, 1, 'Розминка суглобів', 'Joint warmup', 'Zahřátí kloubů',
     ARRAY['Обертання', 'Махи'],
     ARRAY['Rotations', 'Swings'],
     ARRAY['Rotace', 'Kyvadla'],
     'timer', 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Speed
    (uuid_generate_v5(ns_uuid, 'exp-d18-e3'), s2_uuid, 0, 'Спринт 30м', '30m sprint', '30m sprint',
     ARRAY['Максимальна швидкість'],
     ARRAY['Maximum speed'],
     ARRAY['Maximální rychlost'],
     'input', NULL, '5 повторів', '5 reps', '5 opakování', 90, 'кращий час', 'best time', 'nejlepší čas'),
    (uuid_generate_v5(ns_uuid, 'exp-d18-e4'), s2_uuid, 1, 'Човник 5-10-15-10-5', '5-10-15-10-5 shuttle', '5-10-15-10-5 člunok',
     ARRAY['Торкайся лінії на кожній відстані'],
     ARRAY['Touch line at each distance'],
     ARRAY['Dotkni se čáry na každé vzdálenosti'],
     'input', NULL, '3 рази', '3 times', '3 krát', 120, 'кращий час', 'best time', 'nejlepší čas'),
    -- Ball at speed
    (uuid_generate_v5(ns_uuid, 'exp-d18-e5'), s3_uuid, 0, 'Швидке ведення 30м', 'Fast dribble 30m', 'Rychlé vedení 30m',
     ARRAY['Максимальна швидкість з м''ячем'],
     ARRAY['Maximum speed with ball'],
     ARRAY['Maximální rychlost s míčem'],
     'input', NULL, '5 повторів', '5 reps', '5 opakování', 60, 'кращий час', 'best time', 'nejlepší čas'),
    (uuid_generate_v5(ns_uuid, 'exp-d18-e6'), s3_uuid, 1, 'Зиґзаґ з м''ячем (8 конусів)', 'Zigzag with ball (8 cones)', 'Cik-cak s míčem (8 kuželů)',
     ARRAY['Обігай 8 конусів', 'Швидко і точно'],
     ARRAY['Dribble around 8 cones', 'Fast and precise'],
     ARRAY['Obíhej 8 kuželů', 'Rychle a přesně'],
     'checkbox', NULL, '5 разів', '5 times', '5 krát', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d18-e7'), s3_uuid, 2, 'Прийом + поворот + спринт', 'Receive + turn + sprint', 'Příjem + obrat + sprint',
     ARRAY['Кинь м''яч в стіну', 'Прийми, поверни і спринт 10м'],
     ARRAY['Throw ball at wall', 'Receive, turn and sprint 10m'],
     ARRAY['Hoď míč na zeď', 'Přijmi, otoč se a sprint 10m'],
     'checkbox', NULL, '8 повторів', '8 reps', '8 opakování', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d18-e8'), s3_uuid, 3, 'Удар + спринт за м''ячем', 'Shot + sprint for ball', 'Střela + sprint za míčem',
     ARRAY['Удар по воротах', 'Спринт за м''ячем', 'Знову удар'],
     ARRAY['Shot at goal', 'Sprint for ball', 'Shot again'],
     ARRAY['Střela na bránu', 'Sprint za míčem', 'Znovu střela'],
     'checkbox', NULL, '10 ударів', '10 shots', '10 střel', 30, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d18-e9'), s4_uuid, 0, 'Легкий біг + розтяжка', 'Light jog + stretch', 'Lehký běh + protažení',
     ARRAY['2 хв бігу', 'Розтяжка'],
     ARRAY['2 min jog', 'Stretching'],
     ARRAY['2 min běhu', 'Protahování'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 19: Активне відновлення 2
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-19');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d19-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d19-s2');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 19, 'Активне відновлення 2', 'Active Recovery 2', 'Aktivní regenerace 2',
            'Мобільність, йога', 'Mobility, yoga', 'Mobilita, jóga', 'low', 'home', 30)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Мобільність', 'Mobility', 'Mobilita', 15),
    (s2_uuid, day_uuid, 1, 'Йога для футболістів', 'Yoga for footballers', 'Jóga pro fotbalisty', 15)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d19-e1'), s1_uuid, 0, 'Котіння на ролері (або м''ячі)', 'Foam rolling (or ball)', 'Válcování (nebo míč)',
     ARRAY['Квадріцепс', 'Задня поверхня', 'Литки', 'По 1 хв на кожну групу'],
     ARRAY['Quads', 'Hamstrings', 'Calves', '1 min each group'],
     ARRAY['Čtyřhlavý', 'Zadní strana', 'Lýtka', '1 min na každou skupinu'],
     'timer', 240),
    (uuid_generate_v5(ns_uuid, 'exp-d19-e2'), s1_uuid, 1, 'Розтяжка стегон', 'Hip stretch', 'Protažení kyčlí',
     ARRAY['90/90 позиція', '1 хв на сторону'],
     ARRAY['90/90 position', '1 min per side'],
     ARRAY['90/90 pozice', '1 min na stranu'],
     'timer', 120),
    (uuid_generate_v5(ns_uuid, 'exp-d19-e3'), s1_uuid, 2, 'Розтяжка спини', 'Back stretch', 'Protažení zad',
     ARRAY['Кішка-корова', 'Скорпіон'],
     ARRAY['Cat-cow', 'Scorpion'],
     ARRAY['Kočka-kráva', 'Škorpion'],
     'timer', 120),
    (uuid_generate_v5(ns_uuid, 'exp-d19-e4'), s2_uuid, 0, 'Поза воїна', 'Warrior pose', 'Pozice válečníka',
     ARRAY['Воїн 1, 2, 3', '30 сек кожна'],
     ARRAY['Warrior 1, 2, 3', '30 sec each'],
     ARRAY['Válečník 1, 2, 3', '30 s každá'],
     'timer', 180),
    (uuid_generate_v5(ns_uuid, 'exp-d19-e5'), s2_uuid, 1, 'Поза голуба', 'Pigeon pose', 'Holubí pozice',
     ARRAY['1 хв на сторону'],
     ARRAY['1 min per side'],
     ARRAY['1 min na stranu'],
     'timer', 120),
    (uuid_generate_v5(ns_uuid, 'exp-d19-e6'), s2_uuid, 2, 'Поза дитини', 'Child''s pose', 'Dětská pozice',
     ARRAY['Розслаб спину', '1 хв'],
     ARRAY['Relax back', '1 min'],
     ARRAY['Uvolni záda', '1 min'],
     'timer', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d19-e7'), s2_uuid, 3, 'Шавасана', 'Savasana', 'Šavasana',
     ARRAY['Лежи на спині', 'Повністю розслабся', '2 хв'],
     ARRAY['Lie on back', 'Fully relax', '2 min'],
     ARRAY['Lež na zádech', 'Úplně se uvolni', '2 min'],
     'timer', 120)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 20: День відпочинку
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-20');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d20-s1');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 20, 'День відпочинку', 'Rest Day', 'Den odpočinku',
            'Повне відновлення перед фіналом', 'Full recovery before finale', 'Plná regenerace před finále', 'rest', 'home', 10)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Відпочинок', 'Rest', 'Odpočinek', 10)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d20-e1'), s1_uuid, 0, 'Відпочинок перед фінальним тижнем', 'Rest before final week', 'Odpočinek před posledním týdnem',
     ARRAY['Сьогодні повний відпочинок', 'Готуйся до фінального тижня!', 'Пий воду, добре їж, виспись'],
     ARRAY['Full rest today', 'Prepare for final week!', 'Drink water, eat well, sleep well'],
     ARRAY['Dnes plný odpočinek', 'Připrav se na poslední týden!', 'Pij vodu, jez dobře, dobře spi'],
     'checkbox')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Days 11-20 created successfully';
END $$;

-- Verify
SELECT 'Days created:' as info, COUNT(*) as count FROM program_days WHERE program_id = uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'explosiveness-30');

