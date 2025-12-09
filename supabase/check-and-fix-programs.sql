-- =====================================================
-- CHECK AND FIX PROGRAMS
-- Перевірка та виправлення програм
-- =====================================================

-- 1. Перевірити чи є програми
SELECT 'Total programs:' as info, COUNT(*) as count FROM programs;
SELECT 'Active programs:' as info, COUNT(*) as count FROM programs WHERE is_active = true;

-- 2. Показати всі програми
SELECT id, title_uk, is_active, is_premium, created_at FROM programs;

-- 3. Активувати всі програми (якщо вони неактивні)
UPDATE programs SET is_active = true WHERE is_active = false;

-- 4. Перевірити RLS політики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'programs';

-- 5. Якщо таблиця пуста - створити базову програму
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM programs LIMIT 1) THEN
        INSERT INTO programs (
            id,
            title_uk, title_en, title_cs,
            description_uk, description_en, description_cs,
            category, difficulty, duration_days,
            icon, is_active, is_premium
        ) VALUES (
            gen_random_uuid(),
            'Вибуховість 30 днів',
            'Explosiveness 30 days',
            'Výbušnost 30 dní',
            'Покращуй швидкість, силу та вибухову потужність за 30 днів інтенсивних тренувань',
            'Improve your speed, power and explosive strength in 30 days of intensive training',
            'Zlepši svou rychlost, sílu a výbušnou sílu za 30 dní intenzivního tréninku',
            'explosiveness',
            'intermediate',
            30,
            '⚡',
            true,
            false
        );
        RAISE NOTICE 'Created default program';
    ELSE
        RAISE NOTICE 'Programs already exist';
    END IF;
END;
$$;

-- 6. Перевірити знову
SELECT 'After fix - Total programs:' as info, COUNT(*) as count FROM programs;
SELECT 'After fix - Active programs:' as info, COUNT(*) as count FROM programs WHERE is_active = true;

-- 7. Показати фінальний результат
SELECT id, title_uk, is_active FROM programs;

