/**
 * Seed Data Script for Football Trainer Pro
 * 
 * This script seeds initial data using Supabase client
 * Run with: node scripts/seed-data.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://warcozyshzagksyjpndp.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcmNvenlzaHphZ2tzeWpwbmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTExMzYwMCwiZXhwIjoyMDgwNjg5NjAwfQ.PLACEHOLDER';

// Use anon key for now
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhcmNvenlzaHphZ2tzeWpwbmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTM2MDAsImV4cCI6MjA4MDY4OTYwMH0.6d9C18NTPpZUUww7aOp8Kssb79uzzK5Nd2kkIAxtf2A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedAchievements() {
  console.log('\n📌 Seeding achievements...');
  
  const achievements = [
    { 
      title: { uk: 'Перший крок', en: 'First Step', cs: 'První krok' }, 
      description: { uk: 'Виконай першу вправу', en: 'Complete your first exercise', cs: 'Dokonči svůj první cvik' }, 
      icon: '🎯', 
      condition_type: 'exercises_count', 
      condition_value: 1, 
      xp_reward: 10 
    },
    { 
      title: { uk: 'Початківець', en: 'Beginner', cs: 'Začátečník' }, 
      description: { uk: 'Виконай 10 вправ', en: 'Complete 10 exercises', cs: 'Dokonči 10 cviků' }, 
      icon: '⭐', 
      condition_type: 'exercises_count', 
      condition_value: 10, 
      xp_reward: 50 
    },
    { 
      title: { uk: 'Наполегливий', en: 'Persistent', cs: 'Vytrvalý' }, 
      description: { uk: 'Виконай 50 вправ', en: 'Complete 50 exercises', cs: 'Dokonči 50 cviků' }, 
      icon: '💪', 
      condition_type: 'exercises_count', 
      condition_value: 50, 
      xp_reward: 100 
    },
    { 
      title: { uk: 'Серія 3 дні', en: '3 Day Streak', cs: '3denní série' }, 
      description: { uk: 'Тренуйся 3 дні поспіль', en: 'Train for 3 days in a row', cs: 'Trénuj 3 dny po sobě' }, 
      icon: '🔥', 
      condition_type: 'streak', 
      condition_value: 3, 
      xp_reward: 30 
    },
    { 
      title: { uk: 'Серія 7 днів', en: '7 Day Streak', cs: '7denní série' }, 
      description: { uk: 'Тренуйся тиждень поспіль', en: 'Train for a week straight', cs: 'Trénuj týden po sobě' }, 
      icon: '🔥🔥', 
      condition_type: 'streak', 
      condition_value: 7, 
      xp_reward: 70 
    },
    { 
      title: { uk: 'Серія 30 днів', en: '30 Day Streak', cs: '30denní série' }, 
      description: { uk: 'Тренуйся місяць поспіль', en: 'Train for a month straight', cs: 'Trénuj měsíc po sobě' }, 
      icon: '🏆', 
      condition_type: 'streak', 
      condition_value: 30, 
      xp_reward: 300 
    },
    { 
      title: { uk: '100 XP', en: '100 XP', cs: '100 XP' }, 
      description: { uk: 'Набери 100 очок досвіду', en: 'Earn 100 experience points', cs: 'Získej 100 bodů zkušeností' }, 
      icon: '✨', 
      condition_type: 'xp', 
      condition_value: 100, 
      xp_reward: 20 
    },
    { 
      title: { uk: '500 XP', en: '500 XP', cs: '500 XP' }, 
      description: { uk: 'Набери 500 очок досвіду', en: 'Earn 500 experience points', cs: 'Získej 500 bodů zkušeností' }, 
      icon: '🌟', 
      condition_type: 'xp', 
      condition_value: 500, 
      xp_reward: 50 
    },
    { 
      title: { uk: '1000 XP', en: '1000 XP', cs: '1000 XP' }, 
      description: { uk: 'Набери 1000 очок досвіду', en: 'Earn 1000 experience points', cs: 'Získej 1000 bodů zkušeností' }, 
      icon: '💎', 
      condition_type: 'xp', 
      condition_value: 1000, 
      xp_reward: 100 
    },
  ];

  const { data, error } = await supabase
    .from('achievements')
    .upsert(achievements, { onConflict: 'id' });

  if (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
  
  console.log(`   ✅ Inserted ${achievements.length} achievements`);
  return true;
}

async function checkConnection() {
  console.log('🔌 Checking Supabase connection...');
  
  // Try to fetch from a table to check if tables exist
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  
  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('   ⚠️  Tables do not exist yet. Please run schema.sql first.');
      return false;
    }
    console.log(`   ❌ Connection error: ${error.message}`);
    return false;
  }
  
  console.log('   ✅ Connected successfully');
  return true;
}

async function main() {
  console.log('🚀 Football Trainer Pro - Data Seeding\n');
  console.log('========================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log('========================================\n');

  const connected = await checkConnection();
  
  if (!connected) {
    console.log('\n⚠️  Please create tables first by running schema.sql in Supabase Dashboard:');
    console.log('   1. Open: https://supabase.com/dashboard/project/warcozyshzagksyjpndp/sql');
    console.log('   2. Paste contents of: supabase/schema.sql');
    console.log('   3. Click "Run"');
    console.log('   4. Then run this script again');
    return;
  }

  await seedAchievements();
  
  console.log('\n✅ Seeding completed!');
}

main().catch(console.error);

