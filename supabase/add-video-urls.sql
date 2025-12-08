-- =====================================================
-- ADD VIDEO URLS TO EXERCISES
-- Додавання посилань на відео-інструкції до вправ
-- =====================================================

-- Простий спосіб - оновлюємо вправи за назвою
-- Ці відео підійдуть для будь-яких програм з подібними вправами

-- Загальні вправи розминки
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=eFOtLqk5dxQ'
WHERE title_uk LIKE '%Біг на місці%' OR title_en LIKE '%Running in place%';

UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=c4DAnQ6DtF8'
WHERE title_uk LIKE '%Стрибки%' AND title_uk LIKE '%Джек%';

UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=eFOtLqk5dxQ'
WHERE title_uk LIKE '%Легкий біг%' OR title_en LIKE '%Light jog%';

-- Обертання суглобів
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=nPHfEnZD1Wk'
WHERE title_uk LIKE '%Обертання суглобів%' OR title_en LIKE '%Joint rotations%';

-- Вибухові вправи
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=NNYPGQV6RjM'
WHERE title_uk LIKE '%Вибухові присідання%' OR title_en LIKE '%Explosive squats%';

UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=hxobfWlFSYE'
WHERE title_uk LIKE '%Стрибки у довжину%' OR title_en LIKE '%Standing long jump%';

UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=QOVaHwm-Q6U'
WHERE title_uk LIKE '%Випади%' OR title_en LIKE '%Lunges%';

-- Планка
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=ASdvN_XEl_c'
WHERE title_uk LIKE '%Планка%' OR title_en LIKE '%Plank%';

-- Присідання
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=aclHkVaku9U'
WHERE title_uk LIKE '%Присідання%' OR title_en LIKE '%Squats%';

-- Віджимання
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=IODxDxX7oi4'
WHERE title_uk LIKE '%Віджимання%' OR title_en LIKE '%Push-ups%';

-- Берпі
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=dZgVxmf6jkA'
WHERE title_uk LIKE '%Берпі%' OR title_en LIKE '%Burpee%';

-- Скакалка
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=FJmRQ5iTXKE'
WHERE title_uk LIKE '%Скакалка%' OR title_en LIKE '%Jump rope%';

-- Розтяжка
UPDATE exercises SET video_url = 'https://www.youtube.com/watch?v=g_tea8ZNk5A'
WHERE title_uk LIKE '%Розтяжка%' OR title_en LIKE '%Stretching%';

-- Загальні футбольні вправи - можна додати до будь-якої програми
-- Ці відео з YouTube каналів про футбольні тренування

-- Приклади популярних вправ з відео:
COMMENT ON TABLE exercises IS 'Рекомендовані YouTube канали для відео:
- 7mlc (Seven Mile League Camp) - техніка
- Unisport - тренування
- Progressive Soccer Training - фізика
- Football DNA - вправи

Формат video_url:
- YouTube: https://www.youtube.com/watch?v=VIDEO_ID
- YouTube Short: https://youtube.com/shorts/VIDEO_ID  
- Supabase Storage: https://[project].supabase.co/storage/v1/object/public/videos/[path]
';


