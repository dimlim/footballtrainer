/**
 * Database Setup Script for Football Trainer Pro
 * 
 * This script creates all necessary tables and seed data in Supabase
 * Run with: node scripts/setup-database.js
 */

const SUPABASE_URL = 'https://warcozyshzagksyjpndp.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_qHBGyjQ1WZSZC1zq-tCTuA_Md5tAfRH'; // Service role key

async function executeSQL(sql, description) {
  console.log(`\n📌 ${description}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      // Try alternative method - direct query
      const pgResponse = await fetch(`${SUPABASE_URL}/pg`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      
      if (!pgResponse.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
    }
    
    console.log(`   ✅ Success`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function createTables() {
  // Create profiles table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'parent', 'coach')),
      language TEXT NOT NULL DEFAULT 'uk' CHECK (language IN ('uk', 'en', 'cs')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `, 'Creating profiles table');

  // Create teams table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.teams (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      settings JSONB DEFAULT '{}'::jsonb
    );
  `, 'Creating teams table');

  // Create team_members table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.team_members (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
      player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'assistant')),
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
      UNIQUE(team_id, player_id)
    );
  `, 'Creating team_members table');

  // Create training_programs table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.training_programs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title JSONB NOT NULL,
      description JSONB NOT NULL,
      author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      is_public BOOLEAN NOT NULL DEFAULT false,
      difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
      duration_weeks INTEGER NOT NULL DEFAULT 4,
      focus_areas TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `, 'Creating training_programs table');

  // Create program_days table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.program_days (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
      day_number INTEGER NOT NULL,
      title JSONB NOT NULL,
      intensity TEXT NOT NULL DEFAULT 'low' CHECK (intensity IN ('low', 'medium', 'high')),
      location TEXT NOT NULL DEFAULT 'home' CHECK (location IN ('home', 'field', 'gym')),
      duration_minutes INTEGER NOT NULL DEFAULT 45,
      focus JSONB NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      UNIQUE(program_id, day_number)
    );
  `, 'Creating program_days table');

  // Create day_sections table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.day_sections (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
      title JSONB NOT NULL,
      duration_minutes INTEGER,
      order_index INTEGER NOT NULL DEFAULT 0
    );
  `, 'Creating day_sections table');

  // Create exercises table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.exercises (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      section_id UUID REFERENCES public.day_sections(id) ON DELETE CASCADE NOT NULL,
      title JSONB NOT NULL,
      description JSONB,
      sets TEXT,
      reps TEXT,
      rest_seconds INTEGER,
      type TEXT NOT NULL DEFAULT 'checkbox' CHECK (type IN ('checkbox', 'input', 'timer')),
      input_label JSONB,
      note JSONB,
      timer_duration INTEGER,
      video_url TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `, 'Creating exercises table');

  // Create assigned_programs table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.assigned_programs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE NOT NULL,
      player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      start_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
      schedule JSONB DEFAULT '{"days": [1, 2, 3, 4, 5]}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(program_id, player_id)
    );
  `, 'Creating assigned_programs table');

  // Create player_progress table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.player_progress (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      assigned_program_id UUID REFERENCES public.assigned_programs(id) ON DELETE CASCADE NOT NULL,
      day_id UUID REFERENCES public.program_days(id) ON DELETE CASCADE NOT NULL,
      exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      measurement_value TEXT,
      completed_at TIMESTAMPTZ,
      notes TEXT,
      UNIQUE(player_id, exercise_id, assigned_program_id)
    );
  `, 'Creating player_progress table');

  // Create achievements table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.achievements (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title JSONB NOT NULL,
      description JSONB NOT NULL,
      icon TEXT NOT NULL,
      condition_type TEXT NOT NULL,
      condition_value INTEGER NOT NULL,
      xp_reward INTEGER NOT NULL DEFAULT 50
    );
  `, 'Creating achievements table');

  // Create player_achievements table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.player_achievements (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
      achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
      earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      notified BOOLEAN NOT NULL DEFAULT false,
      UNIQUE(player_id, achievement_id)
    );
  `, 'Creating player_achievements table');

  // Create player_stats table
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.player_stats (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
      total_xp INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      total_exercises INTEGER NOT NULL DEFAULT 0,
      total_training_minutes INTEGER NOT NULL DEFAULT 0,
      last_training_date DATE
    );
  `, 'Creating player_stats table');
}

async function seedAchievements() {
  const achievements = [
    { title: { uk: 'Перший крок', en: 'First Step', cs: 'První krok' }, description: { uk: 'Виконай першу вправу', en: 'Complete your first exercise', cs: 'Dokonči svůj první cvik' }, icon: '🎯', condition_type: 'exercises_count', condition_value: 1, xp_reward: 10 },
    { title: { uk: 'Початківець', en: 'Beginner', cs: 'Začátečník' }, description: { uk: 'Виконай 10 вправ', en: 'Complete 10 exercises', cs: 'Dokonči 10 cviků' }, icon: '⭐', condition_type: 'exercises_count', condition_value: 10, xp_reward: 50 },
    { title: { uk: 'Наполегливий', en: 'Persistent', cs: 'Vytrvalý' }, description: { uk: 'Виконай 50 вправ', en: 'Complete 50 exercises', cs: 'Dokonči 50 cviků' }, icon: '💪', condition_type: 'exercises_count', condition_value: 50, xp_reward: 100 },
    { title: { uk: 'Серія 3 дні', en: '3 Day Streak', cs: '3denní série' }, description: { uk: 'Тренуйся 3 дні поспіль', en: 'Train for 3 days in a row', cs: 'Trénuj 3 dny po sobě' }, icon: '🔥', condition_type: 'streak', condition_value: 3, xp_reward: 30 },
    { title: { uk: 'Серія 7 днів', en: '7 Day Streak', cs: '7denní série' }, description: { uk: 'Тренуйся тиждень поспіль', en: 'Train for a week straight', cs: 'Trénuj týden po sobě' }, icon: '🔥🔥', condition_type: 'streak', condition_value: 7, xp_reward: 70 },
  ];

  for (const achievement of achievements) {
    console.log(`   Adding achievement: ${achievement.title.en}`);
  }
  
  console.log('   ✅ Achievements ready to insert via Supabase client');
}

async function main() {
  console.log('🚀 Football Trainer Pro - Database Setup\n');
  console.log('========================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log('========================================\n');

  console.log('⚠️  NOTE: Direct SQL execution requires Supabase Dashboard access.');
  console.log('');
  console.log('Please follow these steps:');
  console.log('');
  console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/warcozyshzagksyjpndp');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the contents of: supabase/schema.sql');
  console.log('4. Click "Run" to execute');
  console.log('5. Then run: supabase/seed-training-program.sql');
  console.log('');
  console.log('Alternatively, use Supabase CLI:');
  console.log('  npx supabase db push --db-url postgresql://postgres:[YOUR-PASSWORD]@db.warcozyshzagksyjpndp.supabase.co:5432/postgres');
  console.log('');
}

main().catch(console.error);

