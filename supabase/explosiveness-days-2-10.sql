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

