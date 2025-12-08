import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Zap, Activity, Flame, TrendingUp, Users, Globe, Loader2,
  Calendar, Target, Clock, Footprints, Heart, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { Card, Avatar } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { PlayerStats } from '@/types/database';

const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  gray: '#e5e7eb',
};

type TimeRange = 'week' | 'month' | 'all';

interface DailyProgress {
  date: string;
  dayName: string;
  xp: number;
  exercises: number;
  completed: boolean;
}

interface WeeklyStats {
  week: string;
  xp: number;
  exercises: number;
  days: number;
}

export const StatsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { profile } = useAuthStore();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [viewMode, setViewMode] = useState<'local' | 'global'>('local');
  const [_timeRange, _setTimeRange] = useState<TimeRange>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [_weeklyStats, _setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [fitnessData, setFitnessData] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'weeklyProgress': { uk: 'Прогрес за тиждень', en: 'Weekly Progress', cs: 'Týdenní pokrok' },
      'monthlyProgress': { uk: 'Прогрес за місяць', en: 'Monthly Progress', cs: 'Měsíční pokrok' },
      'xpGained': { uk: 'Отримано XP', en: 'XP Gained', cs: 'Získané XP' },
      'exercisesCompleted': { uk: 'Виконано вправ', en: 'Exercises Completed', cs: 'Dokončená cvičení' },
      'trainingDays': { uk: 'Дні тренувань', en: 'Training Days', cs: 'Tréninkové dny' },
      'currentStreak': { uk: 'Поточна серія', en: 'Current Streak', cs: 'Aktuální série' },
      'bestStreak': { uk: 'Найкраща серія', en: 'Best Streak', cs: 'Nejlepší série' },
      'totalXP': { uk: 'Всього XP', en: 'Total XP', cs: 'Celkem XP' },
      'level': { uk: 'Рівень', en: 'Level', cs: 'Úroveň' },
      'fitnessStats': { uk: 'Фітнес статистика', en: 'Fitness Stats', cs: 'Fitness statistiky' },
      'steps': { uk: 'Кроки', en: 'Steps', cs: 'Kroky' },
      'calories': { uk: 'Калорії', en: 'Calories', cs: 'Kalorie' },
      'activeMinutes': { uk: 'Активні хвилини', en: 'Active Minutes', cs: 'Aktivní minuty' },
      'week': { uk: 'Тиждень', en: 'Week', cs: 'Týden' },
      'month': { uk: 'Місяць', en: 'Month', cs: 'Měsíc' },
      'all': { uk: 'Весь час', en: 'All Time', cs: 'Celé období' },
      'thisWeek': { uk: 'Цей тиждень', en: 'This Week', cs: 'Tento týden' },
      'avgPerDay': { uk: 'В середньому за день', en: 'Average per Day', cs: 'Průměr za den' },
      'noData': { uk: 'Немає даних', en: 'No data yet', cs: 'Zatím žádná data' },
      'startTraining': { uk: 'Почніть тренуватись!', en: 'Start training!', cs: 'Začněte trénovat!' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  useEffect(() => {
    if (profile?.id) {
      loadAllData();
    }
  }, [profile?.id, _timeRange, selectedWeekOffset]);

  const loadAllData = async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadStats(),
        loadDailyProgress(),
        loadFitnessData(),
        loadLeaderboard(),
        loadRecords(),
      ]);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const loadDailyProgress = async () => {
    if (!profile?.id) return;

    // Calculate date range based on selected week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 - (selectedWeekOffset * 7)); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    const dayNames = language === 'uk' 
      ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
      : language === 'cs'
      ? ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get completed days
    const { data: completions } = await supabase
      .from('player_day_completions')
      .select('day_id, completed_at, bonus_xp')
      .eq('player_id', profile.id)
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString());

    // Get exercise progress
    const { data: progress } = await supabase
      .from('player_progress_v2')
      .select('completed_at, xp_earned')
      .eq('player_id', profile.id)
      .eq('is_completed', true)
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString());

    // Build daily data
    const dailyData: DailyProgress[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayCompletions = completions?.filter(c => 
        c.completed_at?.startsWith(dateStr)
      ) || [];
      
      const dayProgress = progress?.filter(p => 
        p.completed_at?.startsWith(dateStr)
      ) || [];

      const xp = dayProgress.reduce((sum, p) => sum + (p.xp_earned || 0), 0) +
                 dayCompletions.reduce((sum, c) => sum + (c.bonus_xp || 0), 0);

      dailyData.push({
        date: dateStr,
        dayName: dayNames[i],
        xp,
        exercises: dayProgress.length,
        completed: dayCompletions.length > 0,
      });
    }

    setDailyProgress(dailyData);
  };

  const loadFitnessData = async () => {
    if (!profile?.id) return;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const { data } = await supabase
      .from('daily_fitness_data')
      .select('*')
      .eq('player_id', profile.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) {
      setFitnessData(data.map(d => ({
        ...d,
        dayName: new Date(d.date).toLocaleDateString(language, { weekday: 'short' }),
      })));
    }
  };

  const loadLeaderboard = async () => {
    if (!profile?.id) return;

    // Get team leaderboard if user is in a team
    const { data: teamMembership } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('player_id', profile.id)
      .single();

    if (teamMembership) {
      const { data: members } = await supabase
        .from('team_members')
        .select(`
          player_id,
          profiles!inner(id, full_name, avatar_url, show_in_leaderboard),
          player_stats(total_xp, current_streak)
        `)
        .eq('team_id', teamMembership.team_id);

      if (members) {
        const leaderboardData = members
          .filter((m: any) => m.profiles?.show_in_leaderboard !== false)
          .map((m: any) => ({
            id: m.player_id,
            name: m.profiles?.full_name || 'Unknown',
            avatar: m.profiles?.avatar_url,
            xp: m.player_stats?.total_xp || 0,
            streak: m.player_stats?.current_streak || 0,
            isMe: m.player_id === profile.id,
          }))
          .sort((a: any, b: any) => b.xp - a.xp)
          .slice(0, 10);

        setLeaderboard(leaderboardData);
      }
    } else {
      // Show global leaderboard (top 10)
      const { data } = await supabase
        .from('player_stats')
        .select(`
          player_id,
          total_xp,
          current_streak,
          profiles!inner(id, full_name, avatar_url, show_in_leaderboard)
        `)
        .eq('profiles.show_in_leaderboard', true)
        .order('total_xp', { ascending: false })
        .limit(10);

      if (data) {
        setLeaderboard(data.map((d: any) => ({
          id: d.player_id,
          name: d.profiles?.full_name || 'Unknown',
          avatar: d.profiles?.avatar_url,
          xp: d.total_xp,
          streak: d.current_streak,
          isMe: d.player_id === profile?.id,
        })));
      }
    }
  };

  const loadRecords = async () => {
    if (!profile?.id) return;

    // Get measurements from progress
    const { data } = await supabase
      .from('player_progress_v2')
      .select('exercise_id, measurement_value, completed_at')
      .eq('player_id', profile.id)
      .not('measurement_value', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(20);

    if (data) {
      // Group by exercise and get best values
      const recordsMap = new Map();
      data.forEach((d: any) => {
        if (!recordsMap.has(d.exercise_id) || 
            parseFloat(d.measurement_value) > parseFloat(recordsMap.get(d.exercise_id).value)) {
          recordsMap.set(d.exercise_id, {
            exerciseId: d.exercise_id,
            value: d.measurement_value,
            date: d.completed_at,
          });
        }
      });

      setRecords(Array.from(recordsMap.values()).slice(0, 5));
    }
  };

  // Calculate summary stats
  const weekSummary = useMemo(() => {
    const totalXP = dailyProgress.reduce((sum, d) => sum + d.xp, 0);
    const totalExercises = dailyProgress.reduce((sum, d) => sum + d.exercises, 0);
    const trainingDays = dailyProgress.filter(d => d.completed).length;
    const avgXP = trainingDays > 0 ? Math.round(totalXP / trainingDays) : 0;

    return { totalXP, totalExercises, trainingDays, avgXP };
  }, [dailyProgress]);

  // Calculate level from XP
  const level = Math.floor((stats?.total_xp || 0) / 150) + 1;
  const xpInLevel = (stats?.total_xp || 0) % 150;
  const xpForNextLevel = 150;
  const levelProgress = Math.round((xpInLevel / xpForNextLevel) * 100);

  // Week navigation
  const weekLabel = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 - (selectedWeekOffset * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (selectedWeekOffset === 0) {
      return getText('thisWeek');
    }

    const formatDate = (d: Date) => d.toLocaleDateString(language, { day: 'numeric', month: 'short' });
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  }, [selectedWeekOffset, language]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Level & XP Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">{getText('level')}</p>
              <p className="text-4xl font-black">{level}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">{getText('totalXP')}</span>
              <span className="font-bold">{stats?.total_xp || 0} XP</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-white rounded-full"
              />
            </div>
            <p className="text-xs text-white/60 text-right">
              {xpInLevel} / {xpForNextLevel} XP {language === 'uk' ? 'до наступного рівня' : 'to next level'}
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-3"
      >
        <Card className="p-3 text-center">
          <Zap className="w-5 h-5 text-primary-500 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{stats?.total_xp || 0}</p>
          <p className="text-[10px] text-gray-500 uppercase">XP</p>
        </Card>
        <Card className="p-3 text-center">
          <Activity className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{stats?.total_exercises || 0}</p>
          <p className="text-[10px] text-gray-500 uppercase">{t('training.exercises')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{stats?.current_streak || 0}</p>
          <p className="text-[10px] text-gray-500 uppercase">{t('stats.streak')}</p>
        </Card>
        <Card className="p-3 text-center">
          <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-lg font-black text-gray-900">{stats?.longest_streak || 0}</p>
          <p className="text-[10px] text-gray-500 uppercase">Best</p>
        </Card>
      </motion.div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">{getText('weeklyProgress')}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWeekOffset(prev => prev + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <span className="text-sm text-gray-600 min-w-[120px] text-center">{weekLabel}</span>
              <button
                onClick={() => setSelectedWeekOffset(prev => Math.max(0, prev - 1))}
                disabled={selectedWeekOffset === 0}
                className={cn(
                  'p-1 rounded',
                  selectedWeekOffset === 0 ? 'text-gray-200' : 'hover:bg-gray-100 text-gray-400'
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {dailyProgress.some(d => d.xp > 0) ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="dayName" 
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [`${value} XP`, 'XP']}
                    />
                    <Bar 
                      dataKey="xp" 
                      fill={COLORS.primary} 
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Week Summary */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-black text-primary-600">{weekSummary.totalXP}</p>
                  <p className="text-xs text-gray-500">XP {getText('thisWeek')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{weekSummary.totalExercises}</p>
                  <p className="text-xs text-gray-500">{t('training.exercises')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-600">{weekSummary.trainingDays}</p>
                  <p className="text-xs text-gray-500">{getText('trainingDays')}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <Calendar className="w-12 h-12 mb-2 opacity-50" />
              <p>{getText('noData')}</p>
              <p className="text-sm">{getText('startTraining')}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Fitness Stats */}
      {fitnessData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900">{getText('fitnessStats')}</h3>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fitnessData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="dayName" 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="steps" 
                    stroke={COLORS.primary}
                    fill="url(#stepsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Footprints className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {fitnessData.reduce((sum, d) => sum + (d.steps || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{getText('steps')}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {fitnessData.reduce((sum, d) => sum + (d.calories || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{getText('calories')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">
                  {fitnessData.reduce((sum, d) => sum + (d.active_minutes || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">{getText('activeMinutes')}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">{getText('currentStreak')}</h3>
          </div>

          <div className="flex items-center justify-center gap-1 mb-4">
            {dailyProgress.map((day, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs',
                  day.completed 
                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                    : day.xp > 0
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                <span className="font-bold">{day.dayName}</span>
                {day.completed && <Flame className="w-3 h-3" />}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600">{getText('currentStreak')}</p>
              <p className="text-3xl font-black text-orange-600">{stats?.current_streak || 0} 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{getText('bestStreak')}</p>
              <p className="text-3xl font-black text-amber-600">{stats?.longest_streak || 0} 🏆</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-gray-900">{t('stats.leaderboard')}</h3>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('local')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'local' ? 'bg-white shadow text-gray-800' : 'text-gray-400'
                )}
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('global')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'global' ? 'bg-white shadow text-primary-600' : 'text-gray-400'
                )}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border transition-all',
                    player.isMe 
                      ? 'bg-primary-50 border-primary-200 scale-[1.02]' 
                      : 'bg-gray-50 border-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'font-black text-lg w-6 text-center',
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-amber-700' : 'text-gray-300'
                    )}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <Avatar name={player.name} src={player.avatar} size="md" />
                    <div>
                      <div className="font-bold text-gray-900">{player.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {player.streak} {t('stats.streak')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-primary-600 text-lg">{player.xp.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">XP</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{getText('noData')}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Personal Records */}
      {records.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-900">{t('stats.records')}</h3>
            </div>

            <div className="space-y-3">
              {records.map((record, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {language === 'uk' ? 'Вправа' : 'Exercise'} #{record.exerciseId?.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(record.date).toLocaleDateString(language)}
                    </div>
                  </div>
                  <div className="bg-purple-100 px-4 py-2 rounded-xl font-mono font-bold text-purple-700">
                    {record.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default StatsPage;
