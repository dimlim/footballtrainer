-- =====================================================
-- EXPLOSIVENESS PROGRAM - Days 21-30 (Final Week)
-- Run AFTER explosiveness-days-11-20.sql
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
    -- DAY 21: Максимальна плайометрика
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-21');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d21-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d21-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d21-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d21-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 21, 'Максимальна плайометрика', 'Maximum Plyometrics', 'Maximální plyometrie',
            'Фінальна прогресія стрибків', 'Final jump progression', 'Finální progrese skoků', 'very_high', 'outdoor', 55)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 12),
    (s2_uuid, day_uuid, 1, 'Вибухові стрибки', 'Explosive jumps', 'Výbušné skoky', 25),
    (s3_uuid, day_uuid, 2, 'Комплекс', 'Complex', 'Komplex', 12),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 6)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d21-e1'), s1_uuid, 0, 'Біг з прискореннями', 'Jog with accelerations', 'Běh se zrychleními',
     ARRAY['4 хв легкого бігу', 'Кожні 15 сек - прискорення'],
     ARRAY['4 min light jog', 'Every 15 sec - acceleration'],
     ARRAY['4 min lehkého běhu', 'Každých 15 s - zrychlení'],
     'timer', 240, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d21-e2'), s1_uuid, 1, 'Активаційні стрибки', 'Activation jumps', 'Aktivační skoky',
     ARRAY['Невисокі стрибки', 'Підготовка до максимальних'],
     ARRAY['Low jumps', 'Preparation for max'],
     ARRAY['Nízké skoky', 'Příprava na maximum'],
     'checkbox', NULL, '3x10', '3x10', '3x10', 20, NULL, NULL, NULL),
    -- Explosive jumps
    (uuid_generate_v5(ns_uuid, 'exp-d21-e3'), s2_uuid, 0, 'Максимальний вертикальний стрибок', 'Max vertical jump', 'Max vertikální skok',
     ARRAY['Стрибни максимально вгору', 'Торкнись найвищої точки', 'Запиши результат'],
     ARRAY['Jump as high as possible', 'Touch highest point', 'Record result'],
     ARRAY['Skoč co nejvýše', 'Dotkni se nejvyššího bodu', 'Zapiš výsledek'],
     'input', NULL, '5 спроб', '5 attempts', '5 pokusů', 90, 'висота (см)', 'height (cm)', 'výška (cm)'),
    (uuid_generate_v5(ns_uuid, 'exp-d21-e4'), s2_uuid, 1, 'Стрибки у глибину + вистрибування', 'Depth jump + jump', 'Hloubkový skok + výskok',
     ARRAY['Зістрибни з 40см', 'Одразу максимальний стрибок вгору'],
     ARRAY['Step off 40cm', 'Immediately max jump up'],
     ARRAY['Seskoč ze 40cm', 'Okamžitě max výskok'],
     'checkbox', NULL, '5x5', '5x5', '5x5', 90, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d21-e5'), s2_uuid, 2, 'Потрійний стрибок', 'Triple jump', 'Trojskok',
     ARRAY['Розбіг 3 кроки', 'Стрибок-крок-стрибок', 'Максимальна дальність'],
     ARRAY['3 step approach', 'Hop-step-jump', 'Maximum distance'],
     ARRAY['3 kroky rozběhu', 'Skok-krok-skok', 'Maximální vzdálenost'],
     'input', NULL, '5 спроб', '5 attempts', '5 pokusů', 90, 'відстань (м)', 'distance (m)', 'vzdálenost (m)'),
    (uuid_generate_v5(ns_uuid, 'exp-d21-e6'), s2_uuid, 3, 'Бокові стрибки через бар''єр', 'Lateral hurdle jumps', 'Boční skoky přes překážku',
     ARRAY['Стрибай вбік через перешкоду', 'Мінімальний час на землі'],
     ARRAY['Jump sideways over hurdle', 'Minimal ground time'],
     ARRAY['Skoky do strany přes překážku', 'Minimální čas na zemi'],
     'timer', 30, '4 серії', '4 sets', '4 série', 45, NULL, NULL, NULL),
    -- Complex
    (uuid_generate_v5(ns_uuid, 'exp-d21-e7'), s3_uuid, 0, 'Комплекс: присідання + стрибок + спринт', 'Complex: squat + jump + sprint', 'Komplex: dřep + skok + sprint',
     ARRAY['5 присідань', 'Максимальний стрибок', 'Спринт 10м'],
     ARRAY['5 squats', 'Max jump', '10m sprint'],
     ARRAY['5 dřepů', 'Max výskok', '10m sprint'],
     'checkbox', NULL, '4 комплекси', '4 complexes', '4 komplexy', 90, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d21-e8'), s3_uuid, 1, 'Фінальний спринт', 'Final sprint', 'Finální sprint',
     ARRAY['Максимальний спринт 20м'],
     ARRAY['Maximum 20m sprint'],
     ARRAY['Maximální 20m sprint'],
     'input', NULL, '3 рази', '3 times', '3 krát', 120, 'кращий час', 'best time', 'nejlepší čas'),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d21-e9'), s4_uuid, 0, 'Ходьба + розтяжка', 'Walk + stretch', 'Chůze + protažení',
     ARRAY['3 хв ходьби', 'Глибока розтяжка'],
     ARRAY['3 min walking', 'Deep stretching'],
     ARRAY['3 min chůze', 'Hluboké protažení'],
     'timer', 360, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 22: Швидкість - Фінальний тест
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-22');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d22-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d22-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d22-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d22-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 22, 'Швидкість - Фінальний тест', 'Speed - Final Test', 'Rychlost - Finální test',
            'Тестування швидкості', 'Speed testing', 'Testování rychlosti', 'high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 12),
    (s2_uuid, day_uuid, 1, 'Тести швидкості', 'Speed tests', 'Testy rychlosti', 20),
    (s3_uuid, day_uuid, 2, 'Тести агіліті', 'Agility tests', 'Testy hbitosti', 13),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d22-e1'), s1_uuid, 0, 'Повна розминка', 'Full warmup', 'Plná rozcvička',
     ARRAY['5 хв легкого бігу', 'Динамічна розтяжка', 'Підготовчі прискорення'],
     ARRAY['5 min light jog', 'Dynamic stretching', 'Prep accelerations'],
     ARRAY['5 min lehkého běhu', 'Dynamické protažení', 'Přípravná zrychlení'],
     'timer', 420, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Speed tests
    (uuid_generate_v5(ns_uuid, 'exp-d22-e2'), s2_uuid, 0, 'ТЕСТ: Спринт 10м', 'TEST: 10m sprint', 'TEST: 10m sprint',
     ARRAY['Максимальна швидкість', '3 спроби, запиши кращий'],
     ARRAY['Maximum speed', '3 attempts, record best'],
     ARRAY['Maximální rychlost', '3 pokusy, zapiš nejlepší'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'Порівняй з Днем 4!', 'Compare with Day 4!', 'Porovnej s Dnem 4!'),
    (uuid_generate_v5(ns_uuid, 'exp-d22-e3'), s2_uuid, 1, 'ТЕСТ: Спринт 20м', 'TEST: 20m sprint', 'TEST: 20m sprint',
     ARRAY['Максимальна швидкість', '3 спроби'],
     ARRAY['Maximum speed', '3 attempts'],
     ARRAY['Maximální rychlost', '3 pokusy'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'Порівняй з Днем 4!', 'Compare with Day 4!', 'Porovnej s Dnem 4!'),
    (uuid_generate_v5(ns_uuid, 'exp-d22-e4'), s2_uuid, 2, 'ТЕСТ: Спринт 30м', 'TEST: 30m sprint', 'TEST: 30m sprint',
     ARRAY['Максимальна швидкість'],
     ARRAY['Maximum speed'],
     ARRAY['Maximální rychlost'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', NULL, NULL, NULL),
    -- Agility tests
    (uuid_generate_v5(ns_uuid, 'exp-d22-e5'), s3_uuid, 0, 'ТЕСТ: Човник 5-10-5', 'TEST: 5-10-5 shuttle', 'TEST: 5-10-5 člunok',
     ARRAY['5м вправо, 10м вліво, 5м вправо'],
     ARRAY['5m right, 10m left, 5m right'],
     ARRAY['5m vpravo, 10m vlevo, 5m vpravo'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 90, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'Порівняй з Днем 4!', 'Compare with Day 4!', 'Porovnej s Dnem 4!'),
    (uuid_generate_v5(ns_uuid, 'exp-d22-e6'), s3_uuid, 1, 'ТЕСТ: Т-тест', 'TEST: T-test', 'TEST: T-test',
     ARRAY['10м вперед, 5м вліво, 10м вправо, 5м вліво, 10м назад'],
     ARRAY['10m forward, 5m left, 10m right, 5m left, 10m back'],
     ARRAY['10m vpřed, 5m vlevo, 10m vpravo, 5m vlevo, 10m zpět'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 90, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'Порівняй з Днем 14!', 'Compare with Day 14!', 'Porovnej s Dnem 14!'),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d22-e7'), s4_uuid, 0, 'Заминка', 'Cooldown', 'Zklidnění',
     ARRAY['Легкий біг', 'Розтяжка'],
     ARRAY['Light jog', 'Stretching'],
     ARRAY['Lehký běh', 'Protahování'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 23: Сила кора - Фінал
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-23');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d23-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d23-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d23-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 23, 'Сила кора - Фінал', 'Core Strength - Final', 'Síla středu těla - Finále',
            'Фінальне тренування кора', 'Final core training', 'Finální trénink středu těla', 'medium', 'home', 45)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Активація', 'Activation', 'Aktivace', 8),
    (s2_uuid, day_uuid, 1, 'Сила кора - максимум', 'Core strength - max', 'Síla středu těla - max', 32),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Activation
    (uuid_generate_v5(ns_uuid, 'exp-d23-e1'), s1_uuid, 0, 'Мертвий жук', 'Dead bug', 'Mrtvý brouk',
     ARRAY['Контрольовані рухи'],
     ARRAY['Controlled movements'],
     ARRAY['Kontrolované pohyby'],
     'checkbox', NULL, '2x15', '2x15', '2x15', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e2'), s1_uuid, 1, 'Пташиний пес', 'Bird dog', 'Ptačí pes',
     ARRAY['Тримай 5 сек'],
     ARRAY['Hold 5 sec'],
     ARRAY['Vydrž 5 s'],
     'checkbox', NULL, '2x10', '2x10', '2x10', 30, NULL, NULL, NULL),
    -- Core max
    (uuid_generate_v5(ns_uuid, 'exp-d23-e3'), s2_uuid, 0, 'ТЕСТ: Планка на максимум', 'TEST: Max plank', 'TEST: Max plank',
     ARRAY['Тримай планку якомога довше', 'Запиши результат'],
     ARRAY['Hold plank as long as possible', 'Record result'],
     ARRAY['Vydrž plank co nejdéle', 'Zapiš výsledek'],
     'input', NULL, '1 спроба', '1 attempt', '1 pokus', 120, 'час (сек)', 'time (sec)', 'čas (s)'),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e4'), s2_uuid, 1, 'Бічна планка', 'Side plank', 'Boční plank',
     ARRAY['45 сек на кожну сторону'],
     ARRAY['45 sec each side'],
     ARRAY['45 s na každou stranu'],
     'timer', 45, '2 на сторону', '2 per side', '2 na stranu', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e5'), s2_uuid, 2, 'V-ups', 'V-ups', 'V-ups',
     ARRAY['Максимальна кількість'],
     ARRAY['Maximum reps'],
     ARRAY['Maximální počet'],
     'input', NULL, '3 серії', '3 sets', '3 série', 45, 'кількість', 'reps', 'počet'),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e6'), s2_uuid, 3, 'Альпініст', 'Mountain climbers', 'Horolezec',
     ARRAY['Швидкий темп'],
     ARRAY['Fast pace'],
     ARRAY['Rychlé tempo'],
     'timer', 60, '3 серії', '3 sets', '3 série', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e7'), s2_uuid, 4, 'Російські скручування', 'Russian twists', 'Ruské rotace',
     ARRAY['З м''ячем або без'],
     ARRAY['With or without ball'],
     ARRAY['S míčem nebo bez'],
     'checkbox', NULL, '3x25', '3x25', '3x25', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e8'), s2_uuid, 5, 'Планка з рухом рук', 'Plank arm reaches', 'Plank s nataženými pažemi',
     ARRAY['Витягуй руку вперед по черзі'],
     ARRAY['Reach arm forward alternately'],
     ARRAY['Natahuj paži dopředu střídavě'],
     'checkbox', NULL, '3x20', '3x20', '3x20', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d23-e9'), s2_uuid, 6, 'Підйом ніг', 'Leg raises', 'Zvedání nohou',
     ARRAY['Контрольований рух'],
     ARRAY['Controlled movement'],
     ARRAY['Kontrolovaný pohyb'],
     'checkbox', NULL, '3x15', '3x15', '3x15', 45, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d23-e10'), s3_uuid, 0, 'Розтяжка', 'Stretching', 'Protahování',
     ARRAY['Поза дитини', 'Скручування'],
     ARRAY['Child''s pose', 'Twists'],
     ARRAY['Dětská pozice', 'Rotace'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 24: Техніка - Фінальний тест
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-24');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d24-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d24-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d24-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 24, 'Техніка - Фінальний тест', 'Technique - Final Test', 'Technika - Finální test',
            'Тестування техніки', 'Technique testing', 'Testování techniky', 'medium', 'home', 45)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Тести техніки', 'Technique tests', 'Testy techniky', 30),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d24-e1'), s1_uuid, 0, 'Розминка з м''ячем', 'Ball warmup', 'Rozcvička s míčem',
     ARRAY['Котіння, жонглювання'],
     ARRAY['Rolling, juggling'],
     ARRAY['Kutálení, žonglování'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Technique tests
    (uuid_generate_v5(ns_uuid, 'exp-d24-e2'), s2_uuid, 0, 'ТЕСТ: Жонглювання (права нога)', 'TEST: Juggling (right)', 'TEST: Žonglování (pravá)',
     ARRAY['Максимальна серія правою ногою'],
     ARRAY['Maximum series with right foot'],
     ARRAY['Maximální série pravou nohou'],
     'input', 180, NULL, NULL, NULL, NULL, 'макс. торкань', 'max touches', 'max doteků', 'Порівняй з Днем 1!', 'Compare with Day 1!', 'Porovnej s Dnem 1!'),
    (uuid_generate_v5(ns_uuid, 'exp-d24-e3'), s2_uuid, 1, 'ТЕСТ: Жонглювання (ліва нога)', 'TEST: Juggling (left)', 'TEST: Žonglování (levá)',
     ARRAY['Максимальна серія лівою ногою'],
     ARRAY['Maximum series with left foot'],
     ARRAY['Maximální série levou nohou'],
     'input', 180, NULL, NULL, NULL, NULL, 'макс. торкань', 'max touches', 'max doteků', 'Порівняй з Днем 1!', 'Compare with Day 1!', 'Porovnej s Dnem 1!'),
    (uuid_generate_v5(ns_uuid, 'exp-d24-e4'), s2_uuid, 2, 'ТЕСТ: Жонглювання (чергування)', 'TEST: Juggling (alternating)', 'TEST: Žonglování (střídání)',
     ARRAY['Максимальна серія чергуючи ноги'],
     ARRAY['Maximum series alternating feet'],
     ARRAY['Maximální série střídáním nohou'],
     'input', 300, NULL, NULL, NULL, NULL, 'макс. торкань', 'max touches', 'max doteků', 'Порівняй з Днем 1!', 'Compare with Day 1!', 'Porovnej s Dnem 1!'),
    (uuid_generate_v5(ns_uuid, 'exp-d24-e5'), s2_uuid, 3, 'ТЕСТ: Пас в стіну за 30 сек', 'TEST: Wall passes in 30 sec', 'TEST: Přihrávky na zeď za 30 s',
     ARRAY['Скільки пасів зробиш за 30 сек'],
     ARRAY['How many passes in 30 sec'],
     ARRAY['Kolik přihrávek za 30 s'],
     'input', 30, NULL, NULL, NULL, NULL, 'кількість', 'count', 'počet', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d24-e6'), s2_uuid, 4, 'Демонстрація фінтів', 'Skills demonstration', 'Demonstrace fint',
     ARRAY['Покажи всі вивчені фінти', 'Рулетка, еластіко, степ-овер, крокет'],
     ARRAY['Show all learned skills', 'Roulette, elastico, step-over, Cruyff turn'],
     ARRAY['Ukaž všechny naučené finty', 'Ruleta, elastico, step-over, Cruyffův obrat'],
     'checkbox', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d24-e7'), s3_uuid, 0, 'Розтяжка', 'Stretching', 'Protahování',
     ARRAY['Легка розтяжка'],
     ARRAY['Light stretching'],
     ARRAY['Lehké protažení'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 25: Сила ніг - Фінал
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-25');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d25-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d25-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d25-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 25, 'Сила ніг - Фінал', 'Leg Strength - Final', 'Síla nohou - Finále',
            'Фінальне силове тренування', 'Final strength training', 'Finální silový trénink', 'high', 'home', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Силові вправи', 'Strength exercises', 'Silové cviky', 35),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d25-e1'), s1_uuid, 0, 'Повна розминка', 'Full warmup', 'Plná rozcvička',
     ARRAY['Біг, динамічна розтяжка'],
     ARRAY['Running, dynamic stretching'],
     ARRAY['Běh, dynamické protažení'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Strength
    (uuid_generate_v5(ns_uuid, 'exp-d25-e2'), s2_uuid, 0, 'ТЕСТ: Присідання за 60 сек', 'TEST: Squats in 60 sec', 'TEST: Dřepy za 60 s',
     ARRAY['Максимальна кількість присідань'],
     ARRAY['Maximum squats'],
     ARRAY['Maximální počet dřepů'],
     'input', 60, NULL, NULL, NULL, NULL, 'кількість', 'count', 'počet'),
    (uuid_generate_v5(ns_uuid, 'exp-d25-e3'), s2_uuid, 1, 'ТЕСТ: Стрибки з присіду за 30 сек', 'TEST: Jump squats in 30 sec', 'TEST: Dřepy s výskokem za 30 s',
     ARRAY['Максимальна кількість'],
     ARRAY['Maximum count'],
     ARRAY['Maximální počet'],
     'input', 30, NULL, NULL, NULL, NULL, 'кількість', 'count', 'počet'),
    (uuid_generate_v5(ns_uuid, 'exp-d25-e4'), s2_uuid, 2, 'Болгарські випади', 'Bulgarian split squats', 'Bulharské výpady',
     ARRAY['Фінальна серія'],
     ARRAY['Final set'],
     ARRAY['Finální série'],
     'checkbox', NULL, '4x12 на ногу', '4x12 per leg', '4x12 na nohu', 60, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d25-e5'), s2_uuid, 3, 'Присідання пістолет', 'Pistol squats', 'Pistole',
     ARRAY['Спробуй без допомоги'],
     ARRAY['Try without assistance'],
     ARRAY['Zkus bez pomoci'],
     'input', NULL, '3 серії', '3 sets', '3 série', 60, 'кількість на ногу', 'count per leg', 'počet na nohu'),
    (uuid_generate_v5(ns_uuid, 'exp-d25-e6'), s2_uuid, 4, 'ТЕСТ: Стіна на максимум', 'TEST: Max wall sit', 'TEST: Max zeď',
     ARRAY['Тримай якомога довше'],
     ARRAY['Hold as long as possible'],
     ARRAY['Vydrž co nejdéle'],
     'input', NULL, '1 спроба', '1 attempt', '1 pokus', NULL, 'час (сек)', 'time (sec)', 'čas (s)'),
    (uuid_generate_v5(ns_uuid, 'exp-d25-e7'), s2_uuid, 5, 'Підйом на носки', 'Calf raises', 'Výpony',
     ARRAY['Фінальна серія'],
     ARRAY['Final set'],
     ARRAY['Finální série'],
     'checkbox', NULL, '3x25', '3x25', '3x25', 45, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d25-e8'), s3_uuid, 0, 'Розтяжка', 'Stretching', 'Protahování',
     ARRAY['Всі групи м''язів'],
     ARRAY['All muscle groups'],
     ARRAY['Všechny svalové skupiny'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 26: Швидкість + М'яч - Фінал
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-26');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d26-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d26-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d26-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d26-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 26, 'Швидкість + М''яч - Фінал', 'Speed + Ball - Final', 'Rychlost + Míč - Finále',
            'Фінальне тренування з м''ячем', 'Final ball training', 'Finální trénink s míčem', 'high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Тести з м''ячем', 'Ball tests', 'Testy s míčem', 20),
    (s3_uuid, day_uuid, 2, 'Комплекс', 'Complex', 'Komplex', 15),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d26-e1'), s1_uuid, 0, 'Розминка з м''ячем', 'Ball warmup', 'Rozcvička s míčem',
     ARRAY['Легке ведення', 'Розминка суглобів'],
     ARRAY['Light dribbling', 'Joint warmup'],
     ARRAY['Lehké vedení', 'Zahřátí kloubů'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Ball tests
    (uuid_generate_v5(ns_uuid, 'exp-d26-e2'), s2_uuid, 0, 'ТЕСТ: Ведення 20м', 'TEST: 20m dribble', 'TEST: 20m vedení',
     ARRAY['Максимальна швидкість з м''ячем'],
     ARRAY['Maximum speed with ball'],
     ARRAY['Maximální rychlost s míčem'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 60, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'Порівняй з Днем 10!', 'Compare with Day 10!', 'Porovnej s Dnem 10!'),
    (uuid_generate_v5(ns_uuid, 'exp-d26-e3'), s2_uuid, 1, 'ТЕСТ: Зиґзаґ 8 конусів', 'TEST: 8 cone zigzag', 'TEST: 8 kuželů cik-cak',
     ARRAY['Обігни 8 конусів з м''ячем'],
     ARRAY['Dribble around 8 cones'],
     ARRAY['Obíhej 8 kuželů s míčem'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 60, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d26-e4'), s2_uuid, 2, 'ТЕСТ: Пас + прийом + поворот', 'TEST: Pass + receive + turn', 'TEST: Přihrávka + příjem + obrat',
     ARRAY['Пас в стіну, прийом, поворот на 180°', 'Скільки за 60 сек'],
     ARRAY['Wall pass, receive, 180° turn', 'How many in 60 sec'],
     ARRAY['Přihrávka na zeď, příjem, obrat o 180°', 'Kolik za 60 s'],
     'input', 60, NULL, NULL, NULL, NULL, 'кількість', 'count', 'počet', NULL, NULL, NULL),
    -- Complex
    (uuid_generate_v5(ns_uuid, 'exp-d26-e5'), s3_uuid, 0, 'Комплекс: спринт + ведення + удар', 'Complex: sprint + dribble + shot', 'Komplex: sprint + vedení + střela',
     ARRAY['Спринт 10м', 'Ведення 15м', 'Удар'],
     ARRAY['10m sprint', '15m dribble', 'Shot'],
     ARRAY['10m sprint', '15m vedení', 'Střela'],
     'checkbox', NULL, '8 повторів', '8 reps', '8 opakování', 45, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d26-e6'), s3_uuid, 1, 'Фінальний комплекс', 'Final complex', 'Finální komplex',
     ARRAY['Спринт 5м', 'Прийом м''яча', 'Фінт', 'Удар', 'Спринт назад'],
     ARRAY['5m sprint', 'Receive ball', 'Skill move', 'Shot', 'Sprint back'],
     ARRAY['5m sprint', 'Příjem míče', 'Finta', 'Střela', 'Sprint zpět'],
     'checkbox', NULL, '6 повторів', '6 reps', '6 opakování', 60, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d26-e7'), s4_uuid, 0, 'Заминка', 'Cooldown', 'Zklidnění',
     ARRAY['Легкий біг', 'Розтяжка'],
     ARRAY['Light jog', 'Stretching'],
     ARRAY['Lehký běh', 'Protahování'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 27: Активне відновлення перед фіналом
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-27');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d27-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d27-s2');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 27, 'Відновлення перед фіналом', 'Recovery Before Final', 'Regenerace před finále',
            'Підготовка до фінального тесту', 'Preparation for final test', 'Příprava na finální test', 'low', 'home', 25)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Легка мобільність', 'Light mobility', 'Lehká mobilita', 15),
    (s2_uuid, day_uuid, 1, 'Візуалізація', 'Visualization', 'Vizualizace', 10)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d27-e1'), s1_uuid, 0, 'Легка розтяжка', 'Light stretching', 'Lehké protažení',
     ARRAY['Всі групи м''язів', 'По 30 сек'],
     ARRAY['All muscle groups', '30 sec each'],
     ARRAY['Všechny svalové skupiny', '30 s každá'],
     'timer', 300),
    (uuid_generate_v5(ns_uuid, 'exp-d27-e2'), s1_uuid, 1, 'Мобільність суглобів', 'Joint mobility', 'Mobilita kloubů',
     ARRAY['Обертання всіх суглобів', 'Повільно і контрольовано'],
     ARRAY['All joint rotations', 'Slowly and controlled'],
     ARRAY['Rotace všech kloubů', 'Pomalu a kontrolovaně'],
     'timer', 180),
    (uuid_generate_v5(ns_uuid, 'exp-d27-e3'), s1_uuid, 2, 'Глибоке дихання', 'Deep breathing', 'Hluboké dýchání',
     ARRAY['Вдих 4 сек', 'Затримка 4 сек', 'Видих 6 сек', '10 циклів'],
     ARRAY['Inhale 4 sec', 'Hold 4 sec', 'Exhale 6 sec', '10 cycles'],
     ARRAY['Nádech 4 s', 'Výdrž 4 s', 'Výdech 6 s', '10 cyklů'],
     'timer', 180),
    (uuid_generate_v5(ns_uuid, 'exp-d27-e4'), s2_uuid, 0, 'Візуалізація успіху', 'Success visualization', 'Vizualizace úspěchu',
     ARRAY['Закрий очі', 'Уяви себе на фінальному тесті', 'Ти швидкий, сильний, технічний', 'Відчуй впевненість'],
     ARRAY['Close your eyes', 'Imagine yourself at final test', 'You are fast, strong, technical', 'Feel the confidence'],
     ARRAY['Zavři oči', 'Představ si sebe na finálním testu', 'Jsi rychlý, silný, technický', 'Pociť sebevědomí'],
     'timer', 300),
    (uuid_generate_v5(ns_uuid, 'exp-d27-e5'), s2_uuid, 1, 'Планування', 'Planning', 'Plánování',
     ARRAY['Переглянь свої результати з Дня 1', 'Постав цілі на фінальний тест', 'Ти готовий!'],
     ARRAY['Review your Day 1 results', 'Set goals for final test', 'You are ready!'],
     ARRAY['Projdi si své výsledky z Dne 1', 'Nastav si cíle na finální test', 'Jsi připraven!'],
     'checkbox', 300)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 28: День відпочинку
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-28');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d28-s1');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 28, 'День відпочинку', 'Rest Day', 'Den odpočinku',
            'Повний відпочинок', 'Full rest', 'Plný odpočinek', 'rest', 'home', 5)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Відпочинок', 'Rest', 'Odpočinek', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d28-e1'), s1_uuid, 0, 'Повний відпочинок', 'Full rest', 'Plný odpočinek',
     ARRAY['Сьогодні повний відпочинок', 'Завтра - ФІНАЛЬНИЙ ТЕСТ!', 'Добре виспись', 'Пий воду'],
     ARRAY['Full rest today', 'Tomorrow - FINAL TEST!', 'Sleep well', 'Drink water'],
     ARRAY['Dnes plný odpočinek', 'Zítra - FINÁLNÍ TEST!', 'Dobře spi', 'Pij vodu'],
     'checkbox')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 29: ФІНАЛЬНИЙ ТЕСТ - Частина 1
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-29');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d29-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d29-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d29-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d29-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 29, '🏆 ФІНАЛЬНИЙ ТЕСТ - Частина 1', '🏆 FINAL TEST - Part 1', '🏆 FINÁLNÍ TEST - Část 1',
            'Тести фізичної підготовки', 'Physical fitness tests', 'Testy fyzické přípravy', 'very_high', 'outdoor', 60)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 15),
    (s2_uuid, day_uuid, 1, 'Тести швидкості', 'Speed tests', 'Testy rychlosti', 20),
    (s3_uuid, day_uuid, 2, 'Тести вибуховості', 'Explosiveness tests', 'Testy výbušnosti', 20),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d29-e1'), s1_uuid, 0, 'Повна розминка', 'Full warmup', 'Plná rozcvička',
     ARRAY['8 хв легкого бігу', 'Динамічна розтяжка', 'Підготовчі прискорення'],
     ARRAY['8 min light jog', 'Dynamic stretching', 'Prep accelerations'],
     ARRAY['8 min lehkého běhu', 'Dynamické protažení', 'Přípravná zrychlení'],
     'timer', 480, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Speed tests
    (uuid_generate_v5(ns_uuid, 'exp-d29-e2'), s2_uuid, 0, '🏃 ТЕСТ: Спринт 10м', '🏃 TEST: 10m sprint', '🏃 TEST: 10m sprint',
     ARRAY['3 спроби', 'Запиши кращий результат'],
     ARRAY['3 attempts', 'Record best result'],
     ARRAY['3 pokusy', 'Zapiš nejlepší výsledek'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'День 1 результат: ___', 'Day 1 result: ___', 'Den 1 výsledek: ___'),
    (uuid_generate_v5(ns_uuid, 'exp-d29-e3'), s2_uuid, 1, '🏃 ТЕСТ: Спринт 20м', '🏃 TEST: 20m sprint', '🏃 TEST: 20m sprint',
     ARRAY['3 спроби'],
     ARRAY['3 attempts'],
     ARRAY['3 pokusy'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d29-e4'), s2_uuid, 2, '🏃 ТЕСТ: Човник 5-10-5', '🏃 TEST: 5-10-5 shuttle', '🏃 TEST: 5-10-5 člunok',
     ARRAY['3 спроби'],
     ARRAY['3 attempts'],
     ARRAY['3 pokusy'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 120, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'День 4 результат: ___', 'Day 4 result: ___', 'Den 4 výsledek: ___'),
    -- Explosiveness tests
    (uuid_generate_v5(ns_uuid, 'exp-d29-e5'), s3_uuid, 0, '🦘 ТЕСТ: Вертикальний стрибок', '🦘 TEST: Vertical jump', '🦘 TEST: Vertikální skok',
     ARRAY['3 спроби', 'Запиши максимальну висоту'],
     ARRAY['3 attempts', 'Record maximum height'],
     ARRAY['3 pokusy', 'Zapiš maximální výšku'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 90, 'висота (см)', 'height (cm)', 'výška (cm)', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d29-e6'), s3_uuid, 1, '🦘 ТЕСТ: Стрибок у довжину', '🦘 TEST: Long jump', '🦘 TEST: Skok do délky',
     ARRAY['3 спроби з місця'],
     ARRAY['3 standing attempts'],
     ARRAY['3 pokusy z místa'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 90, 'відстань (см)', 'distance (cm)', 'vzdálenost (cm)', NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d29-e7'), s3_uuid, 2, '🦘 ТЕСТ: Потрійний стрибок', '🦘 TEST: Triple jump', '🦘 TEST: Trojskok',
     ARRAY['3 спроби'],
     ARRAY['3 attempts'],
     ARRAY['3 pokusy'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 90, 'відстань (м)', 'distance (m)', 'vzdálenost (m)', NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d29-e8'), s4_uuid, 0, 'Заминка', 'Cooldown', 'Zklidnění',
     ARRAY['Легкий біг', 'Розтяжка', 'Відпочинок перед завтрашнім тестом'],
     ARRAY['Light jog', 'Stretching', 'Rest before tomorrow''s test'],
     ARRAY['Lehký běh', 'Protahování', 'Odpočinek před zítřejším testem'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 30: 🏆 ФІНАЛЬНИЙ ТЕСТ - Частина 2
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-30');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d30-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d30-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d30-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d30-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 30, '🏆 ФІНАЛЬНИЙ ТЕСТ - Частина 2', '🏆 FINAL TEST - Part 2', '🏆 FINÁLNÍ TEST - Část 2',
            'Тести техніки та балансу', 'Technique and balance tests', 'Testy techniky a rovnováhy', 'medium', 'home', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Тести балансу', 'Balance tests', 'Testy rovnováhy', 10),
    (s3_uuid, day_uuid, 2, 'Тести техніки', 'Technique tests', 'Testy techniky', 20),
    (s4_uuid, day_uuid, 3, '🎉 Завершення програми', '🎉 Program completion', '🎉 Dokončení programu', 10)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs, note_uk, note_en, note_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d30-e1'), s1_uuid, 0, 'Розминка з м''ячем', 'Ball warmup', 'Rozcvička s míčem',
     ARRAY['Жонглювання', 'Котіння', 'Легкі фінти'],
     ARRAY['Juggling', 'Rolling', 'Light skills'],
     ARRAY['Žonglování', 'Kutálení', 'Lehké finty'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Balance tests
    (uuid_generate_v5(ns_uuid, 'exp-d30-e2'), s2_uuid, 0, '⚖️ ТЕСТ: Баланс на правій нозі', '⚖️ TEST: Right leg balance', '⚖️ TEST: Rovnováha na pravé noze',
     ARRAY['Стій на правій нозі', 'Засікай час'],
     ARRAY['Stand on right leg', 'Time yourself'],
     ARRAY['Stůj na pravé noze', 'Měř si čas'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 30, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'День 1 результат: ___', 'Day 1 result: ___', 'Den 1 výsledek: ___'),
    (uuid_generate_v5(ns_uuid, 'exp-d30-e3'), s2_uuid, 1, '⚖️ ТЕСТ: Баланс на лівій нозі', '⚖️ TEST: Left leg balance', '⚖️ TEST: Rovnováha na levé noze',
     ARRAY['Стій на лівій нозі', 'Засікай час'],
     ARRAY['Stand on left leg', 'Time yourself'],
     ARRAY['Stůj na levé noze', 'Měř si čas'],
     'input', NULL, '3 спроби', '3 attempts', '3 pokusy', 30, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)', 'День 1 результат: ___', 'Day 1 result: ___', 'Den 1 výsledek: ___'),
    -- Technique tests
    (uuid_generate_v5(ns_uuid, 'exp-d30-e4'), s3_uuid, 0, '⚽ ТЕСТ: Жонглювання (права)', '⚽ TEST: Juggling (right)', '⚽ TEST: Žonglování (pravá)',
     ARRAY['Максимальна серія правою ногою'],
     ARRAY['Maximum series with right foot'],
     ARRAY['Maximální série pravou nohou'],
     'input', 180, NULL, NULL, NULL, NULL, 'макс. торкань', 'max touches', 'max doteků', 'День 1: ___', 'Day 1: ___', 'Den 1: ___'),
    (uuid_generate_v5(ns_uuid, 'exp-d30-e5'), s3_uuid, 1, '⚽ ТЕСТ: Жонглювання (ліва)', '⚽ TEST: Juggling (left)', '⚽ TEST: Žonglování (levá)',
     ARRAY['Максимальна серія лівою ногою'],
     ARRAY['Maximum series with left foot'],
     ARRAY['Maximální série levou nohou'],
     'input', 180, NULL, NULL, NULL, NULL, 'макс. торкань', 'max touches', 'max doteků', 'День 1: ___', 'Day 1: ___', 'Den 1: ___'),
    (uuid_generate_v5(ns_uuid, 'exp-d30-e6'), s3_uuid, 2, '⚽ ТЕСТ: Жонглювання (чергування)', '⚽ TEST: Juggling (alternating)', '⚽ TEST: Žonglování (střídání)',
     ARRAY['Максимальна серія чергуючи ноги'],
     ARRAY['Maximum series alternating feet'],
     ARRAY['Maximální série střídáním nohou'],
     'input', 300, NULL, NULL, NULL, NULL, 'макс. торкань', 'max touches', 'max doteků', 'День 1: ___', 'Day 1: ___', 'Den 1: ___'),
    (uuid_generate_v5(ns_uuid, 'exp-d30-e7'), s3_uuid, 3, '💪 ТЕСТ: Віджимання', '💪 TEST: Push-ups', '💪 TEST: Kliky',
     ARRAY['Максимальна кількість з правильною технікою'],
     ARRAY['Maximum with proper form'],
     ARRAY['Maximum se správnou technikou'],
     'input', NULL, '1 спроба', '1 attempt', '1 pokus', NULL, 'кількість', 'count', 'počet', 'День 1: ___', 'Day 1: ___', 'Den 1: ___'),
    -- Completion
    (uuid_generate_v5(ns_uuid, 'exp-d30-e8'), s4_uuid, 0, '🎉 ВІТАЄМО!', '🎉 CONGRATULATIONS!', '🎉 GRATULUJEME!',
     ARRAY['Ти завершив 30-денну програму вибуховості!', 'Порівняй свої результати з Днем 1', 'Ти став швидшим, сильнішим і технічнішим!', 'Поділись своїми результатами з друзями!'],
     ARRAY['You completed the 30-day explosiveness program!', 'Compare your results with Day 1', 'You became faster, stronger and more technical!', 'Share your results with friends!'],
     ARRAY['Dokončil jsi 30denní program výbušnosti!', 'Porovnej své výsledky s Dnem 1', 'Stal jsi se rychlejším, silnějším a techničtějším!', 'Sdílej své výsledky s přáteli!'],
     'checkbox', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '🏆 ПРОГРАМУ ЗАВЕРШЕНО! 🏆', '🏆 PROGRAM COMPLETED! 🏆', '🏆 PROGRAM DOKONČEN! 🏆'),
    (uuid_generate_v5(ns_uuid, 'exp-d30-e9'), s4_uuid, 1, '📊 Твій прогрес', '📊 Your progress', '📊 Tvůj pokrok',
     ARRAY['Переглянь статистику в додатку', 'Подивись свої досягнення', 'Обери наступну програму!'],
     ARRAY['Check statistics in the app', 'View your achievements', 'Choose your next program!'],
     ARRAY['Zkontroluj statistiky v aplikaci', 'Podívej se na své úspěchy', 'Vyber si další program!'],
     'checkbox', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Days 21-30 (Final Week) created successfully!';
    RAISE NOTICE '🏆 Full 30-day Explosiveness program is now complete!';
END $$;

-- Final verification
SELECT 'Total days in Explosiveness program:' as info, COUNT(*) as count 
FROM program_days 
WHERE program_id = uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'explosiveness-30');

SELECT 'Total exercises:' as info, COUNT(*) as count 
FROM exercises e
JOIN day_sections ds ON e.section_id = ds.id
JOIN program_days pd ON ds.day_id = pd.id
WHERE pd.program_id = uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'explosiveness-30');

