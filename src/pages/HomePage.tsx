import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Clock, Zap, Trophy, Flame, Play, Calendar, Loader2 } from 'lucide-react';
import { Card, Progress } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useProgressStore } from '@/stores/progressStore';
import { usePlayerProgramStore } from '@/stores/playerProgramStore';
import { useProgramStore, Program } from '@/stores/programStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { difficultyInfo } from '@/types/training';
import type { PlayerStats } from '@/types/database';

// Default images for categories
const categoryImages: Record<string, string> = {
  explosiveness: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80',
  endurance: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  technique: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
  strength: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  agility: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  recovery: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, getLocalizedText, language } = useTranslation();
  const { profile } = useAuthStore();
  const { completedDays, loadCompletedDays } = useProgressStore();
  const { playerPrograms, loadPlayerPrograms, getProgramStartDate, getDayNumberForDate } = usePlayerProgramStore();
  const { programs, isLoading: programsLoading, loadPrograms } = useProgramStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);

  // Filter only user's selected programs
  const myPrograms = programs.filter(p => playerPrograms[p.id]);

  useEffect(() => {
    loadPrograms(); // Load all programs from DB
  }, [loadPrograms]);

  useEffect(() => {
    if (profile?.id) {
      loadStats();
      loadCompletedDays(profile.id);
      loadPlayerPrograms(profile.id);
    }
  }, [profile?.id, loadCompletedDays, loadPlayerPrograms]);

  const loadStats = async () => {
    if (!profile?.id) return;
    
    const { data } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_id', profile.id)
      .single();
    
    if (data) {
      setStats(data);
    }
  };

  // Calculate program progress (simplified for DB programs)
  const getProgramProgress = (program: Program) => {
    let completed = 0;
    for (let i = 1; i <= program.duration_days; i++) {
      const dayKey = `${program.id}-day-${i}`;
      if (completedDays[dayKey]) completed++;
    }
    return {
      completed,
      total: program.duration_days,
      percent: program.duration_days > 0 ? Math.round((completed / program.duration_days) * 100) : 0
    };
  };

  // Get current day number for a program
  const getCurrentDayNumber = (program: Program) => {
    const playerProgram = playerPrograms[program.id];
    
    // If program not started, return day 1
    if (!playerProgram) {
      return 1;
    }
    
    // Get today's day number based on start date
    const todayDayNumber = getDayNumberForDate(program.id, new Date());
    
    // Find the current day to do
    for (let i = 1; i <= program.duration_days; i++) {
      const dayKey = `${program.id}-day-${i}`;
      
      // If this day is not completed and it's today or earlier
      if (!completedDays[dayKey]) {
        // Return this day if it's today or we haven't reached it yet
        if (todayDayNumber === null || i <= todayDayNumber) {
          return i;
        }
      }
    }
    
    // All completed or future, return first uncompleted or 1
    for (let i = 1; i <= program.duration_days; i++) {
      const dayKey = `${program.id}-day-${i}`;
      if (!completedDays[dayKey]) return i;
    }
    
    return 1;
  };

  // Check if program is started
  const isProgramStarted = (programId: string) => {
    return !!playerPrograms[programId];
  };

  // Handle start training click - just navigate, program starts on first exercise
  const handleStartTraining = (program: Program, dayNumber: number) => {
    navigate(`/app/program/${program.id}/day/${dayNumber}`);
  };

  // Get localized title
  const getProgramTitle = (program: Program) => {
    if (language === 'uk') return program.title_uk;
    if (language === 'cs') return program.title_cs || program.title_uk;
    return program.title_en || program.title_uk;
  };

  // Format program start date
  const formatProgramStartDate = (programId: string) => {
    const startDate = getProgramStartDate(programId);
    if (!startDate) return null;
    return startDate.toLocaleDateString(
      language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US',
      { day: 'numeric', month: 'short' }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-primary-200 text-sm">
            {language === 'uk' ? 'Вітаємо' : language === 'cs' ? 'Vítejte' : 'Welcome'},
          </p>
          <h1 className="text-2xl font-black">
            {profile?.full_name || 'Player'}! 👋
          </h1>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stats?.total_xp || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">XP</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stats?.current_streak || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">{t('stats.streak')}</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stats?.total_exercises || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold">{t('training.exercises')}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Programs Section */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {language === 'uk' ? 'Мої програми' : language === 'cs' ? 'Moje programy' : 'My Programs'}
          </h2>
          <button
            onClick={() => navigate('/app/programs')}
            className="text-sm text-primary-600 font-medium flex items-center gap-1"
          >
            {language === 'uk' ? 'Всі програми' : language === 'cs' ? 'Všechny' : 'All programs'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {programsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : myPrograms.length === 0 ? (
          <Card 
            className="p-6 text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/app/programs')}
          >
            <div className="text-4xl mb-3">📋</div>
            <p className="text-gray-700 font-medium">
              {language === 'uk' ? 'У вас ще немає програм' : language === 'cs' ? 'Zatím nemáte žádné programy' : 'You have no programs yet'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {language === 'uk' ? 'Натисніть, щоб обрати програму' : language === 'cs' ? 'Klikněte pro výběr programu' : 'Click to select a program'}
            </p>
          </Card>
        ) : myPrograms.map((program, index) => {
          const progress = getProgramProgress(program);
          const currentDayNum = getCurrentDayNumber(program);
          
          return (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="overflow-hidden" padding="none">
                {/* Program Header with Image */}
                <div className="relative h-40 overflow-hidden">
                  {/* Background Image */}
                  <img 
                    src={program.cover_image || categoryImages[program.category]} 
                    alt={getProgramTitle(program)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'
                  )} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl drop-shadow-lg">{program.icon || '⚽'}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-white drop-shadow-lg">
                          {getProgramTitle(program)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm',
                            program.difficulty === 'beginner' && 'bg-green-500/80 text-white',
                            program.difficulty === 'intermediate' && 'bg-amber-500/80 text-white',
                            program.difficulty === 'advanced' && 'bg-red-500/80 text-white',
                          )}>
                            {difficultyInfo[program.difficulty as keyof typeof difficultyInfo]?.label 
                              ? (language === 'uk' 
                                ? difficultyInfo[program.difficulty as keyof typeof difficultyInfo].label.uk 
                                : language === 'cs' 
                                ? difficultyInfo[program.difficulty as keyof typeof difficultyInfo].label.cs 
                                : difficultyInfo[program.difficulty as keyof typeof difficultyInfo].label.en)
                              : program.difficulty}
                          </span>
                          <span className="text-white/90 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {program.duration_days} {language === 'uk' ? 'днів' : 'days'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Program Progress */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {language === 'uk' ? 'Прогрес' : language === 'cs' ? 'Pokrok' : 'Progress'}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <Progress 
                    value={progress.percent} 
                    size="sm"
                    color="primary"
                  />

                  {/* Current Day Info */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">
                        {progress.completed === progress.total 
                          ? (language === 'uk' ? 'Завершено!' : language === 'cs' ? 'Dokončeno!' : 'Completed!')
                          : isProgramStarted(program.id)
                          ? (language === 'uk' ? 'Наступний' : language === 'cs' ? 'Další' : 'Next')
                          : (language === 'uk' ? 'Почати з' : language === 'cs' ? 'Začít od' : 'Start with')
                        }
                      </p>
                      <p className="font-bold text-gray-900">
                        {language === 'uk' ? 'День' : language === 'cs' ? 'Den' : 'Day'} {currentDayNum}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {isProgramStarted(program.id) && (
                          <p className="text-xs text-primary-500">
                            {language === 'uk' ? 'Старт:' : 'Start:'} {formatProgramStartDate(program.id)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartTraining(program, currentDayNum)}
                      className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-colors"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Browse All Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            onClick={() => navigate('/app/programs')}
            className="p-6 text-center cursor-pointer hover:shadow-md transition-all border-dashed border-2"
          >
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-bold text-gray-900">
              {language === 'uk' ? 'Переглянути всі програми' : language === 'cs' ? 'Zobrazit všechny programy' : 'Browse All Programs'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {language === 'uk' ? 'Знайди ідеальну програму для себе' : language === 'cs' ? 'Najdi ideální program pro sebe' : 'Find the perfect program for you'}
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
