-- =====================================================
-- EXPLOSIVENESS PROGRAM - Days 2-10
-- Run AFTER full-setup-programs.sql
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
    -- DAY 2: Вибухова сила ніг
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-2');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d2-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d2-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d2-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d2-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 2, 'Вибухова сила ніг', 'Explosive Leg Power', 'Výbušná síla nohou',
            'Стрибки, плайометрика', 'Jumps, plyometrics', 'Skoky, plyometrie', 'high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Плайометрика', 'Plyometrics', 'Plyometrie', 20),
    (s3_uuid, day_uuid, 2, 'Швидкість з м''ячем', 'Speed with ball', 'Rychlost s míčem', 15),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    -- Day 2 Exercises
    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d2-e1'), s1_uuid, 0, 'Біг на місці', 'Running in place', 'Běh na místě',
     ARRAY['Коліна високо', 'Руки активно працюють', 'Поступово збільшуй темп'],
     ARRAY['Knees high', 'Arms actively working', 'Gradually increase pace'],
     ARRAY['Kolena vysoko', 'Paže aktivně pracují', 'Postupně zvyšuj tempo'],
     'timer', 120, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e2'), s1_uuid, 1, 'Стрибки з розведенням ніг', 'Jumping jacks', 'Hvězdičky',
     ARRAY['Ноги разом - руки вниз', 'Стрибок: ноги в сторони, руки вгору', 'Повернись у вихідне положення'],
     ARRAY['Legs together - arms down', 'Jump: legs apart, arms up', 'Return to starting position'],
     ARRAY['Nohy u sebe - paže dolů', 'Skok: nohy od sebe, paže nahoru', 'Návrat do výchozí pozice'],
     'checkbox', 60, '3x20', '3x20', '3x20', 20),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e3'), s1_uuid, 2, 'Динамічні випади', 'Dynamic lunges', 'Dynamické výpady',
     ARRAY['Крок вперед у випад', 'Коліно не торкається землі', 'Відштовхнись і зміни ногу'],
     ARRAY['Step forward into lunge', 'Knee does not touch ground', 'Push off and switch legs'],
     ARRAY['Krok vpřed do výpadu', 'Koleno se nedotýká země', 'Odraz a změna nohou'],
     'checkbox', NULL, '2x10 на ногу', '2x10 per leg', '2x10 na nohu', 30),
    -- Plyometrics
    (uuid_generate_v5(ns_uuid, 'exp-d2-e4'), s2_uuid, 0, 'Вистрибування з присіду', 'Squat jumps', 'Dřepy s výskokem',
     ARRAY['Присядь до паралелі', 'Вистрибни максимально вгору', 'М''яко приземлись на носки'],
     ARRAY['Squat to parallel', 'Jump as high as possible', 'Land softly on toes'],
     ARRAY['Dřep do rovnoběžky', 'Vyskoč co nejvýše', 'Měkce doskoč na špičky'],
     'checkbox', NULL, '4x8', '4x8', '4x8', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e5'), s2_uuid, 1, 'Стрибки на одній нозі', 'Single leg hops', 'Skoky na jedné noze',
     ARRAY['Стрибай вперед на правій', 'Потім на лівій', 'Тримай рівновагу при приземленні'],
     ARRAY['Hop forward on right', 'Then on left', 'Keep balance on landing'],
     ARRAY['Skoky vpřed na pravé', 'Pak na levé', 'Drž rovnováhu při dopadu'],
     'checkbox', NULL, '3x10 на ногу', '3x10 per leg', '3x10 na nohu', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e6'), s2_uuid, 2, 'Бокові стрибки', 'Lateral jumps', 'Boční skoky',
     ARRAY['Стрибай вліво-вправо', 'Уяви лінію на землі', 'Мінімальний час контакту з землею'],
     ARRAY['Jump left-right', 'Imagine a line on ground', 'Minimal ground contact time'],
     ARRAY['Skoky vlevo-vpravo', 'Představ si čáru na zemi', 'Minimální kontakt se zemí'],
     'timer', 30, '4 серії', '4 sets', '4 série', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e7'), s2_uuid, 3, 'Стрибки через перешкоду', 'Hurdle jumps', 'Skoky přes překážku',
     ARRAY['Використай рюкзак або подушку', 'Стрибай вперед-назад', 'Коліна до грудей у верхній точці'],
     ARRAY['Use backpack or pillow', 'Jump forward-backward', 'Knees to chest at top'],
     ARRAY['Použij batoh nebo polštář', 'Skoky vpřed-vzad', 'Kolena k hrudi nahoře'],
     'checkbox', NULL, '3x12', '3x12', '3x12', 60),
    -- Speed with ball
    (uuid_generate_v5(ns_uuid, 'exp-d2-e8'), s3_uuid, 0, 'Швидке ведення', 'Fast dribbling', 'Rychlé vedení',
     ARRAY['Веди м''яч максимально швидко', '10 метрів туди і назад', 'Торкайся м''яча кожним кроком'],
     ARRAY['Dribble as fast as possible', '10 meters there and back', 'Touch ball every step'],
     ARRAY['Veď míč co nejrychleji', '10 metrů tam a zpět', 'Dotek míče každý krok'],
     'checkbox', NULL, '5 повторів', '5 reps', '5 opakování', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e9'), s3_uuid, 1, 'Старт-стоп', 'Start-stop', 'Start-stop',
     ARRAY['Веди м''яч', 'По команді (рахуй до 3) - різка зупинка', 'Потім різкий старт'],
     ARRAY['Dribble', 'On command (count to 3) - sharp stop', 'Then sharp start'],
     ARRAY['Veď míč', 'Na povel (počítej do 3) - ostrá zastávka', 'Pak ostrý start'],
     'timer', 180, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e10'), s3_uuid, 2, 'Зміна напрямку', 'Direction change', 'Změna směru',
     ARRAY['Веди м''яч вперед', 'Різко зміни напрямок на 90°', 'Використовуй внутрішню частину стопи'],
     ARRAY['Dribble forward', 'Sharp 90° direction change', 'Use inside of foot'],
     ARRAY['Veď míč vpřed', 'Ostrá změna směru o 90°', 'Použij vnitřní stranu nohy'],
     'checkbox', NULL, '4x8', '4x8', '4x8', 30),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d2-e11'), s4_uuid, 0, 'Розтяжка квадріцепсів', 'Quad stretch', 'Protažení čtyřhlavého',
     ARRAY['Стій на одній нозі', 'Візьми іншу за гомілку', 'Тягни п''яту до сідниці'],
     ARRAY['Stand on one leg', 'Hold other by ankle', 'Pull heel to glute'],
     ARRAY['Stůj na jedné noze', 'Drž druhou za kotník', 'Táhni patu k hýždi'],
     'timer', 60, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d2-e12'), s4_uuid, 1, 'Розтяжка задньої поверхні', 'Hamstring stretch', 'Protažení zadní strany',
     ARRAY['Сядь на підлогу', 'Ноги прямі вперед', 'Тягнись руками до носків'],
     ARRAY['Sit on floor', 'Legs straight forward', 'Reach hands to toes'],
     ARRAY['Sedni si na zem', 'Nohy rovně dopředu', 'Natahuj ruce ke špičkám'],
     'timer', 60, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 3: Відновлення + Техніка
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-3');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d3-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d3-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d3-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 3, 'Відновлення + Техніка', 'Recovery + Technique', 'Regenerace + Technika',
            'Легка робота з м''ячем, розтяжка', 'Light ball work, stretching', 'Lehká práce s míčem, protahování', 'low', 'home', 35)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Мобільність', 'Mobility', 'Mobilita', 10),
    (s2_uuid, day_uuid, 1, 'Техніка з м''ячем', 'Ball technique', 'Technika s míčem', 20),
    (s3_uuid, day_uuid, 2, 'Розтяжка', 'Stretching', 'Protahování', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Mobility
    (uuid_generate_v5(ns_uuid, 'exp-d3-e1'), s1_uuid, 0, 'Кругові рухи тазом', 'Hip circles', 'Kruhy boky',
     ARRAY['Руки на поясі', '10 кругів вправо', '10 кругів вліво'],
     ARRAY['Hands on hips', '10 circles right', '10 circles left'],
     ARRAY['Ruce v bok', '10 kruhů vpravo', '10 kruhů vlevo'],
     'checkbox', 60, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d3-e2'), s1_uuid, 1, 'Кішка-корова', 'Cat-cow', 'Kočka-kráva',
     ARRAY['На четвереньках', 'Прогнись - округли спину', 'Повільно, з диханням'],
     ARRAY['On all fours', 'Arch - round back', 'Slowly, with breathing'],
     ARRAY['Na čtyřech', 'Prohni - zaokrouhli záda', 'Pomalu, s dýcháním'],
     'checkbox', 90, '10 повторів', '10 reps', '10 opakování', NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d3-e3'), s1_uuid, 2, 'Скорпіон', 'Scorpion', 'Škorpion',
     ARRAY['Лежи на животі', 'Підніми праву ногу і тягни до лівої руки', 'Поміняй сторони'],
     ARRAY['Lie on stomach', 'Lift right leg and reach to left hand', 'Switch sides'],
     ARRAY['Lež na břiše', 'Zvedni pravou nohu a táhni k levé ruce', 'Změň strany'],
     'checkbox', NULL, '8 на сторону', '8 per side', '8 na stranu', NULL),
    -- Ball technique
    (uuid_generate_v5(ns_uuid, 'exp-d3-e4'), s2_uuid, 0, 'Котіння м''яча підошвою', 'Sole rolls', 'Kutálení podrážkou',
     ARRAY['Коти м''яч вперед-назад підошвою', 'Права нога 1 хв', 'Ліва нога 1 хв'],
     ARRAY['Roll ball forward-back with sole', 'Right foot 1 min', 'Left foot 1 min'],
     ARRAY['Kutálej míč vpřed-vzad podrážkou', 'Pravá noha 1 min', 'Levá noha 1 min'],
     'timer', 120, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d3-e5'), s2_uuid, 1, 'V-дриблінг', 'V-dribbling', 'V-dribling',
     ARRAY['Тягни м''яч назад підошвою', 'Штовхни вперед внутрішньою', 'Малюй букву V'],
     ARRAY['Pull ball back with sole', 'Push forward with inside', 'Draw letter V'],
     ARRAY['Táhni míč vzad podrážkou', 'Strč vpřed vnitřní stranou', 'Kresli písmeno V'],
     'checkbox', NULL, '2x20 на ногу', '2x20 per leg', '2x20 na nohu', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d3-e6'), s2_uuid, 2, 'Ножиці', 'Scissors', 'Nůžky',
     ARRAY['Обведи м''яч внутрішньою частиною', 'Потім зовнішньою', 'Чергуй ноги'],
     ARRAY['Circle ball with inside', 'Then with outside', 'Alternate legs'],
     ARRAY['Obkruž míč vnitřní stranou', 'Pak vnější', 'Střídej nohy'],
     'checkbox', NULL, '3x10', '3x10', '3x10', 20),
    (uuid_generate_v5(ns_uuid, 'exp-d3-e7'), s2_uuid, 3, 'Жонглювання стегном', 'Thigh juggling', 'Žonglování stehnem',
     ARRAY['Підкидай м''яч стегном', 'Тримай ногу під 90°', 'Чергуй ноги'],
     ARRAY['Bounce ball on thigh', 'Keep leg at 90°', 'Alternate legs'],
     ARRAY['Odrážej míč stehnem', 'Drž nohu pod 90°', 'Střídej nohy'],
     'checkbox', 120, NULL, NULL, NULL, NULL),
    -- Stretching
    (uuid_generate_v5(ns_uuid, 'exp-d3-e8'), s3_uuid, 0, 'Поза голуба', 'Pigeon pose', 'Holubí pozice',
     ARRAY['Одна нога зігнута попереду', 'Інша витягнута назад', '30 сек на кожну сторону'],
     ARRAY['One leg bent in front', 'Other extended back', '30 sec each side'],
     ARRAY['Jedna noha pokrčená vpředu', 'Druhá natažená vzad', '30 s na každou stranu'],
     'timer', 60, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d3-e9'), s3_uuid, 1, 'Розтяжка спини', 'Back stretch', 'Protažení zad',
     ARRAY['Сядь, ноги схрещені', 'Повернись вправо, тримаючись за коліно', 'Повтори вліво'],
     ARRAY['Sit cross-legged', 'Twist right, holding knee', 'Repeat left'],
     ARRAY['Sedni s překříženýma nohama', 'Otoč se vpravo, drž koleno', 'Opakuj vlevo'],
     'timer', 60, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 4: Швидкість та реакція
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-4');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d4-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d4-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d4-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d4-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 4, 'Швидкість та реакція', 'Speed & Reaction', 'Rychlost a reakce',
            'Спринти, старти, реакція', 'Sprints, starts, reaction', 'Sprinty, starty, reakce', 'high', 'outdoor', 45)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Спринти', 'Sprints', 'Sprinty', 15),
    (s3_uuid, day_uuid, 2, 'Реакція', 'Reaction', 'Reakce', 15),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d4-e1'), s1_uuid, 0, 'Легкий біг', 'Light jog', 'Lehký běh',
     ARRAY['5 хвилин легкого бігу', 'Дихай рівномірно', 'Розігрій м''язи'],
     ARRAY['5 minutes light jog', 'Breathe evenly', 'Warm up muscles'],
     ARRAY['5 minut lehkého běhu', 'Dýchej rovnoměrně', 'Zahřej svaly'],
     'timer', 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e2'), s1_uuid, 1, 'Біг з високим підніманням колін', 'High knees', 'Vysoká kolena',
     ARRAY['Коліна до рівня пояса', 'Швидкий темп', '20 метрів'],
     ARRAY['Knees to waist level', 'Fast pace', '20 meters'],
     ARRAY['Kolena do úrovně pasu', 'Rychlé tempo', '20 metrů'],
     'checkbox', NULL, '3 рази', '3 times', '3 krát', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e3'), s1_uuid, 2, 'Біг з закиданням гомілок', 'Butt kicks', 'Zakopávání',
     ARRAY['П''яти торкаються сідниць', 'Тулуб прямий', '20 метрів'],
     ARRAY['Heels touch glutes', 'Torso straight', '20 meters'],
     ARRAY['Paty se dotýkají hýždí', 'Trup rovný', '20 metrů'],
     'checkbox', NULL, '3 рази', '3 times', '3 krát', 30, NULL, NULL, NULL),
    -- Sprints
    (uuid_generate_v5(ns_uuid, 'exp-d4-e4'), s2_uuid, 0, 'Спринт 10 метрів', '10m sprint', '10m sprint',
     ARRAY['Старт з низької позиції', 'Максимальне прискорення', 'Засікай час'],
     ARRAY['Start from low position', 'Maximum acceleration', 'Time yourself'],
     ARRAY['Start z nízké pozice', 'Maximální zrychlení', 'Měř si čas'],
     'input', NULL, '5 повторів', '5 reps', '5 opakování', 60, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)'),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e5'), s2_uuid, 1, 'Спринт 20 метрів', '20m sprint', '20m sprint',
     ARRAY['Старт стоячи', 'Тримай швидкість до кінця', 'Не гальмуй раніше фінішу'],
     ARRAY['Standing start', 'Maintain speed to end', 'Do not slow before finish'],
     ARRAY['Start vestoje', 'Drž rychlost do konce', 'Nezpomaluj před cílem'],
     'input', NULL, '4 повтори', '4 reps', '4 opakování', 90, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)'),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e6'), s2_uuid, 2, 'Човниковий біг 5-10-5', '5-10-5 shuttle', '5-10-5 člunkový běh',
     ARRAY['Старт посередині', '5м вправо, торкнись землі', '10м вліво, торкнись', '5м назад на старт'],
     ARRAY['Start in middle', '5m right, touch ground', '10m left, touch', '5m back to start'],
     ARRAY['Start uprostřed', '5m vpravo, dotkni se země', '10m vlevo, dotkni se', '5m zpět na start'],
     'input', NULL, '4 повтори', '4 reps', '4 opakování', 90, 'кращий час (сек)', 'best time (sec)', 'nejlepší čas (s)'),
    -- Reaction
    (uuid_generate_v5(ns_uuid, 'exp-d4-e7'), s3_uuid, 0, 'Старт за сигналом', 'Signal start', 'Start na signál',
     ARRAY['Попроси когось дати сигнал', 'Або використай таймер з випадковим часом', 'Реагуй максимально швидко'],
     ARRAY['Ask someone to give signal', 'Or use timer with random time', 'React as fast as possible'],
     ARRAY['Popros někoho o signál', 'Nebo použij časovač s náhodným časem', 'Reaguj co nejrychleji'],
     'checkbox', NULL, '8 стартів', '8 starts', '8 startů', 45, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e8'), s3_uuid, 1, 'Тіньовий біг', 'Shadow run', 'Stínový běh',
     ARRAY['Уяви суперника перед собою', 'Повторюй його рухи', 'Зміни напрямку кожні 2-3 секунди'],
     ARRAY['Imagine opponent in front', 'Copy their movements', 'Change direction every 2-3 sec'],
     ARRAY['Představ si soupeře před sebou', 'Kopíruj jeho pohyby', 'Měň směr každé 2-3 s'],
     'timer', 120, '3 серії', '3 sets', '3 série', 60, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e9'), s3_uuid, 2, 'Реакція на падіння м''яча', 'Ball drop reaction', 'Reakce na pád míče',
     ARRAY['Тримай м''яч на витягнутій руці', 'Відпусти і злови до другого відскоку', 'Поступово збільшуй висоту'],
     ARRAY['Hold ball at arm''s length', 'Drop and catch before second bounce', 'Gradually increase height'],
     ARRAY['Drž míč na natažené ruce', 'Pusť a chyť před druhým odskokem', 'Postupně zvyšuj výšku'],
     'checkbox', NULL, '10 спроб', '10 attempts', '10 pokusů', NULL, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d4-e10'), s4_uuid, 0, 'Повільний біг', 'Slow jog', 'Pomalý běh',
     ARRAY['2 хвилини дуже повільного бігу', 'Відновлюй дихання'],
     ARRAY['2 minutes very slow jog', 'Recover breathing'],
     ARRAY['2 minuty velmi pomalého běhu', 'Obnov dýchání'],
     'timer', 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d4-e11'), s4_uuid, 1, 'Розтяжка ніг', 'Leg stretch', 'Protažení nohou',
     ARRAY['Квадріцепс: 30 сек на ногу', 'Задня поверхня: 30 сек', 'Литки: 30 сек'],
     ARRAY['Quads: 30 sec per leg', 'Hamstrings: 30 sec', 'Calves: 30 sec'],
     ARRAY['Čtyřhlavý: 30 s na nohu', 'Zadní strana: 30 s', 'Lýtka: 30 s'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 5: Сила кора та стабільність
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-5');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d5-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d5-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d5-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 5, 'Сила кора та стабільність', 'Core Strength & Stability', 'Síla středu těla a stabilita',
            'Планки, кор, баланс', 'Planks, core, balance', 'Planky, střed těla, rovnováha', 'medium', 'home', 40)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Активація', 'Activation', 'Aktivace', 8),
    (s2_uuid, day_uuid, 1, 'Сила кора', 'Core strength', 'Síla středu těla', 25),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 7)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Activation
    (uuid_generate_v5(ns_uuid, 'exp-d5-e1'), s1_uuid, 0, 'Мертвий жук', 'Dead bug', 'Mrtvý brouk',
     ARRAY['Лежи на спині, руки вгору', 'Коліна зігнуті 90°', 'Опускай протилежні руку і ногу'],
     ARRAY['Lie on back, arms up', 'Knees bent 90°', 'Lower opposite arm and leg'],
     ARRAY['Lež na zádech, paže nahoru', 'Kolena ohnutá 90°', 'Spouštěj opačnou ruku a nohu'],
     'checkbox', NULL, '2x10 на сторону', '2x10 per side', '2x10 na stranu', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e2'), s1_uuid, 1, 'Місток', 'Glute bridge', 'Most',
     ARRAY['Лежи на спині, ноги зігнуті', 'Підніми таз вгору', 'Стисни сідниці у верхній точці'],
     ARRAY['Lie on back, legs bent', 'Raise hips up', 'Squeeze glutes at top'],
     ARRAY['Lež na zádech, nohy pokrčené', 'Zvedni boky nahoru', 'Stiskni hýždě nahoře'],
     'checkbox', NULL, '2x15', '2x15', '2x15', 30),
    -- Core
    (uuid_generate_v5(ns_uuid, 'exp-d5-e3'), s2_uuid, 0, 'Планка', 'Plank', 'Plank',
     ARRAY['На ліктях і носках', 'Тіло пряме як дошка', 'Не провисай і не піднімай таз'],
     ARRAY['On elbows and toes', 'Body straight like board', 'Do not sag or raise hips'],
     ARRAY['Na loktech a špičkách', 'Tělo rovné jako prkno', 'Neprověšuj se a nezvedej boky'],
     'timer', 45, '3 серії', '3 sets', '3 série', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e4'), s2_uuid, 1, 'Бічна планка', 'Side plank', 'Boční plank',
     ARRAY['На одному лікті', 'Тіло пряме', 'Тримай 30 сек на кожну сторону'],
     ARRAY['On one elbow', 'Body straight', 'Hold 30 sec each side'],
     ARRAY['Na jednom lokti', 'Tělo rovné', 'Drž 30 s na každou stranu'],
     'timer', 30, '2 на сторону', '2 per side', '2 na stranu', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e5'), s2_uuid, 2, 'Велосипед', 'Bicycle crunches', 'Jízda na kole',
     ARRAY['Лежи на спині', 'Торкайся ліктем протилежного коліна', 'Чергуй сторони'],
     ARRAY['Lie on back', 'Touch elbow to opposite knee', 'Alternate sides'],
     ARRAY['Lež na zádech', 'Dotkni se loktem opačného kolena', 'Střídej strany'],
     'checkbox', NULL, '3x20', '3x20', '3x20', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e6'), s2_uuid, 3, 'Підйом ніг', 'Leg raises', 'Zvedání nohou',
     ARRAY['Лежи на спині, ноги прямі', 'Підніми ноги до 90°', 'Повільно опусти, не торкаючись підлоги'],
     ARRAY['Lie on back, legs straight', 'Raise legs to 90°', 'Slowly lower without touching floor'],
     ARRAY['Lež na zádech, nohy rovné', 'Zvedni nohy do 90°', 'Pomalu spusť bez doteku podlahy'],
     'checkbox', NULL, '3x12', '3x12', '3x12', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e7'), s2_uuid, 4, 'Супермен', 'Superman', 'Superman',
     ARRAY['Лежи на животі', 'Підніми руки і ноги одночасно', 'Затримайся на 2 сек'],
     ARRAY['Lie on stomach', 'Raise arms and legs simultaneously', 'Hold for 2 sec'],
     ARRAY['Lež na břiše', 'Zvedni paže a nohy současně', 'Vydrž 2 s'],
     'checkbox', NULL, '3x10', '3x10', '3x10', 30),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e8'), s2_uuid, 5, 'Планка з торканням плеча', 'Plank shoulder taps', 'Plank s dotykem ramene',
     ARRAY['У позиції планки на руках', 'Торкнися правою рукою лівого плеча', 'Чергуй руки, тримай баланс'],
     ARRAY['In push-up plank position', 'Touch right hand to left shoulder', 'Alternate hands, keep balance'],
     ARRAY['V pozici kliku', 'Dotkni se pravou rukou levého ramene', 'Střídej ruce, drž rovnováhu'],
     'checkbox', NULL, '3x16', '3x16', '3x16', 45),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d5-e9'), s3_uuid, 0, 'Поза дитини', 'Child''s pose', 'Dětská pozice',
     ARRAY['Сідай на п''яти', 'Витягни руки вперед', 'Розслаб спину'],
     ARRAY['Sit on heels', 'Extend arms forward', 'Relax back'],
     ARRAY['Sedni si na paty', 'Natáhni paže dopředu', 'Uvolni záda'],
     'timer', 60, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d5-e10'), s3_uuid, 1, 'Скручування лежачи', 'Lying twist', 'Ležící rotace',
     ARRAY['Лежи на спині', 'Коліна зігнуті, опусти вбік', '30 сек на кожну сторону'],
     ARRAY['Lie on back', 'Knees bent, drop to side', '30 sec each side'],
     ARRAY['Lež na zádech', 'Kolena pokrčená, spusť do strany', '30 s na každou stranu'],
     'timer', 60, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 6: Відпочинок
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-6');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d6-s1');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 6, 'День відпочинку', 'Rest Day', 'Den odpočinku',
            'Повне відновлення', 'Full recovery', 'Plná regenerace', 'rest', 'home', 15)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Легка розтяжка (опціонально)', 'Light stretch (optional)', 'Lehké protažení (volitelné)', 15)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration) VALUES
    (uuid_generate_v5(ns_uuid, 'exp-d6-e1'), s1_uuid, 0, 'Відпочинок', 'Rest', 'Odpočinek',
     ARRAY['Сьогодні день повного відпочинку', 'Можеш зробити легку розтяжку', 'Випий достатньо води', 'Добре виспись'],
     ARRAY['Today is full rest day', 'You can do light stretching', 'Drink enough water', 'Get good sleep'],
     ARRAY['Dnes je den plného odpočinku', 'Můžeš udělat lehké protažení', 'Pij dostatek vody', 'Dobře se vyspi'],
     'checkbox', NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 7: Вибухова плайометрика
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-7');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d7-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d7-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d7-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d7-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 7, 'Вибухова плайометрика', 'Explosive Plyometrics', 'Výbušná plyometrie',
            'Максимальна вибуховість', 'Maximum explosiveness', 'Maximální výbušnost', 'very_high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 12),
    (s2_uuid, day_uuid, 1, 'Вибухові стрибки', 'Explosive jumps', 'Výbušné skoky', 20),
    (s3_uuid, day_uuid, 2, 'Швидкісна робота', 'Speed work', 'Rychlostní práce', 12),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 6)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d7-e1'), s1_uuid, 0, 'Біг з прискореннями', 'Jog with accelerations', 'Běh se zrychleními',
     ARRAY['3 хв легкого бігу', 'Кожні 30 сек - коротке прискорення'],
     ARRAY['3 min light jog', 'Every 30 sec - short acceleration'],
     ARRAY['3 min lehkého běhu', 'Každých 30 s - krátké zrychlení'],
     'timer', 180, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e2'), s1_uuid, 1, 'Динамічна розтяжка', 'Dynamic stretch', 'Dynamické protažení',
     ARRAY['Випади з поворотом', 'Махи ногами', 'Обертання рук'],
     ARRAY['Lunges with twist', 'Leg swings', 'Arm circles'],
     ARRAY['Výpady s rotací', 'Kyvadlové nohy', 'Kruhy paží'],
     'timer', 180, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e3'), s1_uuid, 2, 'Підготовчі стрибки', 'Prep jumps', 'Přípravné skoky',
     ARRAY['Невисокі стрибки на місці', 'Фокус на м''якому приземленні'],
     ARRAY['Low jumps in place', 'Focus on soft landing'],
     ARRAY['Nízké skoky na místě', 'Zaměř se na měkký doskok'],
     'checkbox', NULL, '2x15', '2x15', '2x15', 20),
    -- Explosive jumps
    (uuid_generate_v5(ns_uuid, 'exp-d7-e4'), s2_uuid, 0, 'Стрибки у глибину', 'Depth jumps', 'Hloubkové skoky',
     ARRAY['Стань на підвищення 30-40 см', 'Зістрибни і одразу вистрибни вгору', 'Мінімальний час на землі'],
     ARRAY['Stand on 30-40cm elevation', 'Step off and immediately jump up', 'Minimal ground time'],
     ARRAY['Stůj na vyvýšení 30-40 cm', 'Seskoč a okamžitě vyskoč', 'Minimální čas na zemi'],
     'checkbox', NULL, '4x6', '4x6', '4x6', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e5'), s2_uuid, 1, 'Вистрибування на платформу', 'Box jumps', 'Skoky na bednu',
     ARRAY['Стрибай на підвищення', 'Приземляйся на повну стопу', 'Спускайся кроком'],
     ARRAY['Jump onto elevation', 'Land on full foot', 'Step down'],
     ARRAY['Skoč na vyvýšení', 'Doskoč na celé chodidlo', 'Sestup krokem'],
     'checkbox', NULL, '4x8', '4x8', '4x8', 75),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e6'), s2_uuid, 2, 'Жабячі стрибки', 'Frog jumps', 'Žabí skoky',
     ARRAY['Глибокий присід', 'Стрибай вперед максимально далеко', '5 стрибків поспіль'],
     ARRAY['Deep squat', 'Jump forward as far as possible', '5 consecutive jumps'],
     ARRAY['Hluboký dřep', 'Skoč vpřed co nejdále', '5 skoků za sebou'],
     'checkbox', NULL, '3 серії', '3 sets', '3 série', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e7'), s2_uuid, 3, 'Стрибки зі зміною ніг', 'Split squat jumps', 'Střídavé výskoky',
     ARRAY['Позиція випаду', 'Вистрибни і поміняй ноги в повітрі', 'Приземлись у випад'],
     ARRAY['Lunge position', 'Jump and switch legs in air', 'Land in lunge'],
     ARRAY['Pozice výpadu', 'Vyskoč a vyměň nohy ve vzduchu', 'Doskoč do výpadu'],
     'checkbox', NULL, '3x12', '3x12', '3x12', 60),
    -- Speed work
    (uuid_generate_v5(ns_uuid, 'exp-d7-e8'), s3_uuid, 0, 'Спринт 15м', '15m sprint', '15m sprint',
     ARRAY['Максимальна швидкість', 'Низький старт'],
     ARRAY['Maximum speed', 'Low start'],
     ARRAY['Maximální rychlost', 'Nízký start'],
     'checkbox', NULL, '6 повторів', '6 reps', '6 opakování', 75),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e9'), s3_uuid, 1, 'Зиґзаґ біг', 'Zigzag run', 'Cik-cak běh',
     ARRAY['Постав 5 конусів/пляшок', 'Обігай їх максимально швидко', 'Низький центр тяжіння'],
     ARRAY['Set up 5 cones/bottles', 'Run around them as fast as possible', 'Low center of gravity'],
     ARRAY['Postav 5 kuželů/lahví', 'Obíhej je co nejrychleji', 'Nízké těžiště'],
     'checkbox', NULL, '4 рази', '4 times', '4 krát', 60),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d7-e10'), s4_uuid, 0, 'Ходьба', 'Walking', 'Chůze',
     ARRAY['2 хвилини повільної ходьби', 'Відновлюй дихання'],
     ARRAY['2 minutes slow walking', 'Recover breathing'],
     ARRAY['2 minuty pomalé chůze', 'Obnov dýchání'],
     'timer', 120, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d7-e11'), s4_uuid, 1, 'Глибока розтяжка', 'Deep stretch', 'Hluboké protažení',
     ARRAY['Квадріцепс, задня поверхня, литки', 'По 45 сек на кожну групу м''язів'],
     ARRAY['Quads, hamstrings, calves', '45 sec per muscle group'],
     ARRAY['Čtyřhlavý, zadní strana, lýtka', '45 s na každou svalovou skupinu'],
     'timer', 240, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 8: Техніка + Координація
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-8');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d8-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d8-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d8-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 8, 'Техніка + Координація', 'Technique + Coordination', 'Technika + Koordinace',
            'Робота з м''ячем, координація', 'Ball work, coordination', 'Práce s míčem, koordinace', 'medium', 'home', 40)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 8),
    (s2_uuid, day_uuid, 1, 'Техніка з м''ячем', 'Ball technique', 'Technika s míčem', 25),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 7)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds, input_label_uk, input_label_en, input_label_cs) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d8-e1'), s1_uuid, 0, 'Біг на місці з м''ячем', 'Running with ball', 'Běh s míčem',
     ARRAY['Тримай м''яч в руках', 'Біжи на місці, високо піднімаючи коліна'],
     ARRAY['Hold ball in hands', 'Run in place, high knees'],
     ARRAY['Drž míč v rukou', 'Běž na místě, vysoká kolena'],
     'timer', 90, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d8-e2'), s1_uuid, 1, 'Обертання м''яча', 'Ball rotations', 'Rotace míče',
     ARRAY['Обертай м''яч навколо тулуба', 'Потім навколо ніг', 'По 10 в кожну сторону'],
     ARRAY['Rotate ball around torso', 'Then around legs', '10 each direction'],
     ARRAY['Otáčej míč kolem trupu', 'Pak kolem nohou', '10 každým směrem'],
     'checkbox', 90, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    -- Ball technique
    (uuid_generate_v5(ns_uuid, 'exp-d8-e3'), s2_uuid, 0, 'Жонглювання - рекорд', 'Juggling - record', 'Žonglování - rekord',
     ARRAY['Спробуй побити свій рекорд', 'Права нога, ліва нога, чергування'],
     ARRAY['Try to beat your record', 'Right foot, left foot, alternating'],
     ARRAY['Zkus překonat svůj rekord', 'Pravá noha, levá noha, střídání'],
     'input', 300, NULL, NULL, NULL, NULL, 'макс. серія', 'max series', 'max série'),
    (uuid_generate_v5(ns_uuid, 'exp-d8-e4'), s2_uuid, 1, 'Ла Кокіньо', 'La Croqueta', 'La Croqueta',
     ARRAY['Перекидай м''яч з однієї ноги на іншу', 'Внутрішня частина стопи', 'Швидкий темп'],
     ARRAY['Roll ball from one foot to other', 'Inside of foot', 'Fast pace'],
     ARRAY['Přehazuj míč z jedné nohy na druhou', 'Vnitřní strana nohy', 'Rychlé tempo'],
     'checkbox', NULL, '3x30 сек', '3x30 sec', '3x30 s', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d8-e5'), s2_uuid, 2, 'Еластіко', 'Elastico', 'Elastico',
     ARRAY['Штовхни м''яч зовнішньою частиною', 'Швидко поверни внутрішньою', 'Обман суперника'],
     ARRAY['Push ball with outside', 'Quickly return with inside', 'Fake out opponent'],
     ARRAY['Strč míč vnější stranou', 'Rychle vrať vnitřní', 'Oklamej soupeře'],
     'checkbox', NULL, '10 на ногу', '10 per leg', '10 na nohu', 20, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d8-e6'), s2_uuid, 3, 'Степ-овер', 'Step-over', 'Step-over',
     ARRAY['Обведи ногою м''яч зсередини назовні', 'Потім штовхни в інший бік', 'Чергуй ноги'],
     ARRAY['Circle leg over ball inside to out', 'Then push other direction', 'Alternate legs'],
     ARRAY['Obkruž nohou míč zevnitř ven', 'Pak strč na druhou stranu', 'Střídej nohy'],
     'checkbox', NULL, '3x10', '3x10', '3x10', 30, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d8-e7'), s2_uuid, 4, 'Пас в стіну з обробкою', 'Wall pass with control', 'Přihrávka na zeď s kontrolou',
     ARRAY['Пас правою - прийом лівою', 'Пас лівою - прийом правою', 'Один дотик на прийом'],
     ARRAY['Pass right - receive left', 'Pass left - receive right', 'One touch to receive'],
     ARRAY['Přihrávka pravou - příjem levou', 'Přihrávka levou - příjem pravou', 'Jeden dotek na příjem'],
     'checkbox', NULL, '3x20', '3x20', '3x20', 30, NULL, NULL, NULL),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d8-e8'), s3_uuid, 0, 'Розтяжка', 'Stretching', 'Protahování',
     ARRAY['Статична розтяжка всіх груп м''язів', 'По 30 сек на кожну'],
     ARRAY['Static stretch all muscle groups', '30 sec each'],
     ARRAY['Statické protažení všech svalových skupin', '30 s na každou'],
     'timer', 180, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 9: Сила ніг
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-9');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d9-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d9-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d9-s3');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 9, 'Сила ніг', 'Leg Strength', 'Síla nohou',
            'Присідання, випади, сила', 'Squats, lunges, strength', 'Dřepy, výpady, síla', 'high', 'home', 45)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Силові вправи', 'Strength exercises', 'Silové cviky', 30),
    (s3_uuid, day_uuid, 2, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d9-e1'), s1_uuid, 0, 'Біг на місці', 'Running in place', 'Běh na místě',
     ARRAY['2 хвилини легкого бігу'],
     ARRAY['2 minutes light running'],
     ARRAY['2 minuty lehkého běhu'],
     'timer', 120, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d9-e2'), s1_uuid, 1, 'Присідання без ваги', 'Bodyweight squats', 'Dřepy bez zátěže',
     ARRAY['15 присідань для розігріву'],
     ARRAY['15 squats for warmup'],
     ARRAY['15 dřepů na zahřátí'],
     'checkbox', NULL, '15', '15', '15', NULL),
    -- Strength
    (uuid_generate_v5(ns_uuid, 'exp-d9-e3'), s2_uuid, 0, 'Присідання з паузою', 'Pause squats', 'Dřepy s pauzou',
     ARRAY['Присядь до паралелі', 'Затримайся на 3 секунди', 'Встань'],
     ARRAY['Squat to parallel', 'Hold for 3 seconds', 'Stand up'],
     ARRAY['Dřep do rovnoběžky', 'Vydrž 3 sekundy', 'Vstaň'],
     'checkbox', NULL, '4x10', '4x10', '4x10', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d9-e4'), s2_uuid, 1, 'Болгарські випади', 'Bulgarian split squats', 'Bulharské výpady',
     ARRAY['Задня нога на підвищенні', 'Опускайся до 90° в передньому коліні', 'Тримай тулуб прямо'],
     ARRAY['Back leg on elevation', 'Lower to 90° in front knee', 'Keep torso straight'],
     ARRAY['Zadní noha na vyvýšení', 'Spusť se do 90° v předním koleni', 'Drž trup rovně'],
     'checkbox', NULL, '3x10 на ногу', '3x10 per leg', '3x10 na nohu', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d9-e5'), s2_uuid, 2, 'Присідання на одній нозі', 'Single leg squats', 'Dřepy na jedné noze',
     ARRAY['Присідай на одній нозі', 'Інша витягнута вперед', 'Можна триматися за опору'],
     ARRAY['Squat on one leg', 'Other extended forward', 'Can hold support'],
     ARRAY['Dřep na jedné noze', 'Druhá natažená dopředu', 'Můžeš se držet opory'],
     'checkbox', NULL, '3x6 на ногу', '3x6 per leg', '3x6 na nohu', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d9-e6'), s2_uuid, 3, 'Випади назад', 'Reverse lunges', 'Výpady vzad',
     ARRAY['Крок назад у випад', 'Коліно майже торкається землі', 'Поверніся у вихідне'],
     ARRAY['Step back into lunge', 'Knee almost touches ground', 'Return to start'],
     ARRAY['Krok vzad do výpadu', 'Koleno skoro se dotýká země', 'Návrat na start'],
     'checkbox', NULL, '3x12 на ногу', '3x12 per leg', '3x12 na nohu', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d9-e7'), s2_uuid, 4, 'Підйом на носки', 'Calf raises', 'Výpony',
     ARRAY['Стань на край сходинки', 'Піднімись на носки максимально', 'Опустись нижче рівня'],
     ARRAY['Stand on edge of step', 'Rise on toes as high as possible', 'Lower below level'],
     ARRAY['Stůj na kraji schodu', 'Zvedni se na špičky co nejvýše', 'Spusť se pod úroveň'],
     'checkbox', NULL, '3x20', '3x20', '3x20', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d9-e8'), s2_uuid, 5, 'Стіна (ізометрія)', 'Wall sit', 'Zeď',
     ARRAY['Сядь спиною до стіни', 'Коліна під 90°', 'Тримай якомога довше'],
     ARRAY['Sit with back to wall', 'Knees at 90°', 'Hold as long as possible'],
     ARRAY['Sedni si zády ke zdi', 'Kolena pod 90°', 'Vydrž co nejdéle'],
     'timer', 60, '3 серії', '3 sets', '3 série', 60),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d9-e9'), s3_uuid, 0, 'Розтяжка ніг', 'Leg stretch', 'Protažení nohou',
     ARRAY['Квадріцепс, задня поверхня, литки, сідниці', 'По 30 сек на кожну групу'],
     ARRAY['Quads, hamstrings, calves, glutes', '30 sec per group'],
     ARRAY['Čtyřhlavý, zadní strana, lýtka, hýždě', '30 s na každou skupinu'],
     'timer', 180, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- DAY 10: Швидкість + М'яч
    -- =====================================================
    day_uuid := uuid_generate_v5(ns_uuid, 'exp-day-10');
    s1_uuid := uuid_generate_v5(ns_uuid, 'exp-d10-s1');
    s2_uuid := uuid_generate_v5(ns_uuid, 'exp-d10-s2');
    s3_uuid := uuid_generate_v5(ns_uuid, 'exp-d10-s3');
    s4_uuid := uuid_generate_v5(ns_uuid, 'exp-d10-s4');

    INSERT INTO public.program_days (id, program_id, day_number, title_uk, title_en, title_cs, focus_uk, focus_en, focus_cs, intensity, location, duration_minutes)
    VALUES (day_uuid, program_uuid, 10, 'Швидкість + М''яч', 'Speed + Ball', 'Rychlost + Míč',
            'Швидкісне ведення, дриблінг', 'Fast dribbling, speed work', 'Rychlé vedení, dribling', 'high', 'outdoor', 50)
    ON CONFLICT (program_id, day_number) DO NOTHING;

    INSERT INTO public.day_sections (id, day_id, order_index, title_uk, title_en, title_cs, duration_minutes) VALUES
    (s1_uuid, day_uuid, 0, 'Розминка', 'Warmup', 'Rozcvička', 10),
    (s2_uuid, day_uuid, 1, 'Швидкісна робота', 'Speed work', 'Rychlostní práce', 15),
    (s3_uuid, day_uuid, 2, 'М''яч на швидкості', 'Ball at speed', 'Míč v rychlosti', 20),
    (s4_uuid, day_uuid, 3, 'Заминка', 'Cooldown', 'Zklidnění', 5)
    ON CONFLICT (day_id, order_index) DO NOTHING;

    INSERT INTO public.exercises (id, section_id, order_index, title_uk, title_en, title_cs, description_uk, description_en, description_cs, exercise_type, timer_duration, sets_uk, sets_en, sets_cs, rest_seconds) VALUES
    -- Warmup
    (uuid_generate_v5(ns_uuid, 'exp-d10-e1'), s1_uuid, 0, 'Легкий біг з м''ячем', 'Light jog with ball', 'Lehký běh s míčem',
     ARRAY['Веди м''яч у легкому темпі', '3 хвилини'],
     ARRAY['Dribble at easy pace', '3 minutes'],
     ARRAY['Veď míč v lehkém tempu', '3 minuty'],
     'timer', 180, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d10-e2'), s1_uuid, 1, 'Розминка суглобів', 'Joint warmup', 'Zahřátí kloubů',
     ARRAY['Обертання гомілкостопів', 'Обертання колін', 'Обертання тазу'],
     ARRAY['Ankle rotations', 'Knee rotations', 'Hip rotations'],
     ARRAY['Rotace kotníků', 'Rotace kolen', 'Rotace boků'],
     'timer', 120, NULL, NULL, NULL, NULL),
    -- Speed work
    (uuid_generate_v5(ns_uuid, 'exp-d10-e3'), s2_uuid, 0, 'Спринт 20м', '20m sprint', '20m sprint',
     ARRAY['Максимальна швидкість', 'Повний відпочинок між повторами'],
     ARRAY['Maximum speed', 'Full rest between reps'],
     ARRAY['Maximální rychlost', 'Plný odpočinek mezi opakováními'],
     'checkbox', NULL, '5 повторів', '5 reps', '5 opakování', 90),
    (uuid_generate_v5(ns_uuid, 'exp-d10-e4'), s2_uuid, 1, 'Човниковий біг', 'Shuttle run', 'Člunkový běh',
     ARRAY['5м-10м-15м і назад', 'Торкайся лінії рукою'],
     ARRAY['5m-10m-15m and back', 'Touch line with hand'],
     ARRAY['5m-10m-15m a zpět', 'Dotkni se čáry rukou'],
     'checkbox', NULL, '4 рази', '4 times', '4 krát', 90),
    -- Ball at speed
    (uuid_generate_v5(ns_uuid, 'exp-d10-e5'), s3_uuid, 0, 'Швидке ведення 20м', 'Fast dribble 20m', 'Rychlé vedení 20m',
     ARRAY['Веди м''яч максимально швидко', 'Торкайся м''яча кожним кроком'],
     ARRAY['Dribble as fast as possible', 'Touch ball every step'],
     ARRAY['Veď míč co nejrychleji', 'Dotek míče každý krok'],
     'checkbox', NULL, '6 повторів', '6 reps', '6 opakování', 60),
    (uuid_generate_v5(ns_uuid, 'exp-d10-e6'), s3_uuid, 1, 'Зиґзаґ з м''ячем', 'Zigzag with ball', 'Cik-cak s míčem',
     ARRAY['Обігай конуси/пляшки', 'Внутрішньою та зовнішньою частиною'],
     ARRAY['Dribble around cones/bottles', 'With inside and outside of foot'],
     ARRAY['Obíhej kužely/lahve', 'Vnitřní a vnější stranou nohy'],
     'checkbox', NULL, '5 разів', '5 times', '5 krát', 45),
    (uuid_generate_v5(ns_uuid, 'exp-d10-e7'), s3_uuid, 2, 'Старт-стоп з м''ячем', 'Start-stop with ball', 'Start-stop s míčem',
     ARRAY['Веди м''яч', 'Різка зупинка підошвою', 'Різкий старт в інший бік'],
     ARRAY['Dribble', 'Sharp stop with sole', 'Sharp start other direction'],
     ARRAY['Veď míč', 'Ostrá zastávka podrážkou', 'Ostrý start na druhou stranu'],
     'timer', 180, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d10-e8'), s3_uuid, 3, 'Удар + спринт', 'Shot + sprint', 'Střela + sprint',
     ARRAY['Удар по воротах/стіні', 'Одразу спринт за м''ячем', 'Знову удар'],
     ARRAY['Shot at goal/wall', 'Immediately sprint after ball', 'Shot again'],
     ARRAY['Střela na bránu/zeď', 'Okamžitě sprint za míčem', 'Znovu střela'],
     'checkbox', NULL, '10 ударів', '10 shots', '10 střel', 30),
    -- Cooldown
    (uuid_generate_v5(ns_uuid, 'exp-d10-e9'), s4_uuid, 0, 'Легкий біг', 'Light jog', 'Lehký běh',
     ARRAY['2 хвилини дуже повільного бігу'],
     ARRAY['2 minutes very slow jog'],
     ARRAY['2 minuty velmi pomalého běhu'],
     'timer', 120, NULL, NULL, NULL, NULL),
    (uuid_generate_v5(ns_uuid, 'exp-d10-e10'), s4_uuid, 1, 'Розтяжка', 'Stretching', 'Protahování',
     ARRAY['Всі групи м''язів ніг', 'По 30 сек'],
     ARRAY['All leg muscle groups', '30 sec each'],
     ARRAY['Všechny svalové skupiny nohou', '30 s každá'],
     'timer', 180, NULL, NULL, NULL, NULL)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Days 2-10 created successfully';
END $$;

-- Verify
SELECT 'Days created:' as info, COUNT(*) as count FROM program_days WHERE program_id = uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, 'explosiveness-30');

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

