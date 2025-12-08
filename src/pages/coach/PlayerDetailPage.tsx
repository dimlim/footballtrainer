// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Zap, 
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { Button, Card } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { uk, cs, enUS } from 'date-fns/locale';

interface PlayerProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: string;
}

interface PlayerStats {
  total_xp: number;
  total_exercises: number;
  current_streak: number;
  best_streak: number;
  level: number;
}

interface DailySummary {
  date: string;
  login_count: number;
  exercises_completed: number;
  days_completed: number;
  xp_earned: number;
  suspicious_activities: number;
  total_active_minutes: number;
  first_activity: string;
  last_activity: string;
}

interface ExerciseTiming {
  id: string;
  exercise_id: string;
  day_key: string;
  expected_duration_seconds: number;
  actual_duration_seconds: number;
  is_suspicious: boolean;
  verification_status: string;
  started_at: string;
  completed_at: string;
  coach_notes?: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6'];

export const PlayerDetailPage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile: coachProfile } = useAuthStore();

  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [exerciseTimings, setExerciseTimings] = useState<ExerciseTiming[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'verification'>('overview');
  const [periodDays, setPeriodDays] = useState(7);

  const getDateLocale = () => {
    switch (language) {
      case 'uk': return uk;
      case 'cs': return cs;
      default: return enUS;
    }
  };

  useEffect(() => {
    if (playerId) {
      loadPlayerData();
    }
  }, [playerId, periodDays]);

  const loadPlayerData = async () => {
    if (!playerId) return;
    setIsLoading(true);

    try {
      // Load player profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', playerId)
        .single();

      if (profileData) {
        setPlayer(profileData);
      }

      // Load player stats
      const { data: statsData } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // Load daily summaries
      const startDate = subDays(new Date(), periodDays);
      // @ts-ignore
      const { data: summaryData } = await supabase
        .from('player_daily_summary')
        .select('*')
        .eq('player_id', playerId)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (summaryData) {
        setDailySummaries(summaryData);
      }

      // Load exercise timings
      // @ts-ignore
      const { data: timingData } = await supabase
        .from('exercise_timing')
        .select('*')
        .eq('player_id', playerId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (timingData) {
        setExerciseTimings(timingData);
      }
    } catch (error) {
      console.error('Error loading player data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const aggregatedStats = useMemo(() => {
    const totalLogins = dailySummaries.reduce((sum, d) => sum + (d.login_count || 0), 0);
    const totalExercises = dailySummaries.reduce((sum, d) => sum + (d.exercises_completed || 0), 0);
    const totalDays = dailySummaries.reduce((sum, d) => sum + (d.days_completed || 0), 0);
    const totalXp = dailySummaries.reduce((sum, d) => sum + (d.xp_earned || 0), 0);
    const totalSuspicious = dailySummaries.reduce((sum, d) => sum + (d.suspicious_activities || 0), 0);
    const avgActiveMinutes = dailySummaries.length > 0 
      ? Math.round(dailySummaries.reduce((sum, d) => sum + (d.total_active_minutes || 0), 0) / dailySummaries.length)
      : 0;

    return { totalLogins, totalExercises, totalDays, totalXp, totalSuspicious, avgActiveMinutes };
  }, [dailySummaries]);

  // Chart data - Activity per day
  const activityChartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), periodDays - 1),
      end: new Date()
    });

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const summary = dailySummaries.find(d => d.date === dateStr);
      
      return {
        date: format(day, 'EEE', { locale: getDateLocale() }),
        fullDate: dateStr,
        exercises: summary?.exercises_completed || 0,
        xp: summary?.xp_earned || 0,
        logins: summary?.login_count || 0,
      };
    });
  }, [dailySummaries, periodDays, language]);

  // Verification stats
  const verificationStats = useMemo(() => {
    const verified = exerciseTimings.filter(t => t.verification_status === 'verified').length;
    const flagged = exerciseTimings.filter(t => t.verification_status === 'flagged').length;
    const pending = exerciseTimings.filter(t => t.verification_status === 'pending').length;
    
    return [
      { name: language === 'uk' ? 'Підтверджено' : language === 'cs' ? 'Ověřeno' : 'Verified', value: verified, color: '#10B981' },
      { name: language === 'uk' ? 'Підозрілі' : language === 'cs' ? 'Podezřelé' : 'Flagged', value: flagged, color: '#EF4444' },
      { name: language === 'uk' ? 'Очікує' : language === 'cs' ? 'Čeká' : 'Pending', value: pending, color: '#F59E0B' },
    ].filter(s => s.value > 0);
  }, [exerciseTimings, language]);

  const handleVerify = async (timingId: string, status: 'verified' | 'flagged', notes?: string) => {
    try {
      // @ts-ignore
      await supabase
        .from('exercise_timing')
        .update({
          verification_status: status,
          coach_notes: notes,
          is_suspicious: status === 'flagged'
        })
        .eq('id', timingId);

      // Refresh data
      loadPlayerData();
    } catch (error) {
      console.error('Error verifying:', error);
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'overview': { uk: 'Огляд', en: 'Overview', cs: 'Přehled' },
      'activity': { uk: 'Активність', en: 'Activity', cs: 'Aktivita' },
      'verification': { uk: 'Верифікація', en: 'Verification', cs: 'Ověření' },
      'totalXp': { uk: 'Всього XP', en: 'Total XP', cs: 'Celkem XP' },
      'exercises': { uk: 'Вправ', en: 'Exercises', cs: 'Cvičení' },
      'days': { uk: 'Днів', en: 'Days', cs: 'Dnů' },
      'logins': { uk: 'Входів', en: 'Logins', cs: 'Přihlášení' },
      'avgSession': { uk: 'Сер. сесія', en: 'Avg Session', cs: 'Prům. relace' },
      'suspicious': { uk: 'Підозрілих', en: 'Suspicious', cs: 'Podezřelých' },
      'activityChart': { uk: 'Активність за період', en: 'Activity over period', cs: 'Aktivita za období' },
      'verificationStatus': { uk: 'Статус верифікації', en: 'Verification Status', cs: 'Stav ověření' },
      'recentExercises': { uk: 'Останні вправи', en: 'Recent Exercises', cs: 'Nedávná cvičení' },
      'expected': { uk: 'Очікувано', en: 'Expected', cs: 'Očekáváno' },
      'actual': { uk: 'Фактично', en: 'Actual', cs: 'Skutečně' },
      'status': { uk: 'Статус', en: 'Status', cs: 'Stav' },
      'actions': { uk: 'Дії', en: 'Actions', cs: 'Akce' },
      'approve': { uk: 'Підтвердити', en: 'Approve', cs: 'Schválit' },
      'flag': { uk: 'Позначити', en: 'Flag', cs: 'Označit' },
      'noData': { uk: 'Немає даних', en: 'No data', cs: 'Žádná data' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{getText('noData')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                {player.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{player.full_name}</h1>
                <p className="text-white/70 text-sm">
                  {stats ? `Level ${stats.level || 1} • ${stats.total_xp || 0} XP` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setPeriodDays(days)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  periodDays === days
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {days} {language === 'uk' ? 'днів' : language === 'cs' ? 'dní' : 'days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-4">
            {(['overview', 'activity', 'verification'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {getText(tab)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Zap className="w-4 h-4" />
                  {getText('totalXp')}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aggregatedStats.totalXp}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Target className="w-4 h-4" />
                  {getText('exercises')}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aggregatedStats.totalExercises}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Calendar className="w-4 h-4" />
                  {getText('days')}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aggregatedStats.totalDays}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Activity className="w-4 h-4" />
                  {getText('logins')}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aggregatedStats.totalLogins}
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <Clock className="w-4 h-4" />
                  {getText('avgSession')}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aggregatedStats.avgActiveMinutes} min
                </p>
              </Card>
              <Card className={`p-4 ${aggregatedStats.totalSuspicious > 0 ? 'bg-red-50 border-red-200' : ''}`}>
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                  <AlertTriangle className={`w-4 h-4 ${aggregatedStats.totalSuspicious > 0 ? 'text-red-500' : ''}`} />
                  {getText('suspicious')}
                </div>
                <p className={`text-2xl font-bold ${aggregatedStats.totalSuspicious > 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {aggregatedStats.totalSuspicious}
                </p>
              </Card>
            </div>

            {/* Activity Chart */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {getText('activityChart')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityChartData}>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="exercises" fill="#3B82F6" name={getText('exercises')} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="logins" fill="#10B981" name={getText('logins')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Verification Status Pie */}
            {verificationStats.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {getText('verificationStatus')}
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={verificationStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {verificationStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {dailySummaries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{getText('noData')}</p>
              </div>
            ) : (
              dailySummaries.map((summary) => (
                <motion.div
                  key={summary.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(parseISO(summary.date), 'EEEE, d MMMM', { locale: getDateLocale() })}
                        </span>
                      </div>
                      {summary.suspicious_activities > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {summary.suspicious_activities} {getText('suspicious')}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">{getText('logins')}</p>
                        <p className="font-bold text-gray-900 dark:text-white">{summary.login_count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{getText('exercises')}</p>
                        <p className="font-bold text-gray-900 dark:text-white">{summary.exercises_completed}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">XP</p>
                        <p className="font-bold text-gray-900 dark:text-white">{summary.xp_earned}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{getText('avgSession')}</p>
                        <p className="font-bold text-gray-900 dark:text-white">{summary.total_active_minutes}m</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {getText('recentExercises')}
            </h3>
            
            {exerciseTimings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{getText('noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {language === 'uk' ? 'Вправа' : language === 'cs' ? 'Cvičení' : 'Exercise'}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {getText('expected')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {getText('actual')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {getText('status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {getText('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {exerciseTimings.map((timing) => (
                      <tr key={timing.id} className={timing.is_suspicious ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {timing.exercise_id.substring(0, 20)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                          {formatTime(timing.expected_duration_seconds)}
                        </td>
                        <td className={`px-4 py-3 text-sm font-mono ${
                          timing.is_suspicious ? 'text-red-600 font-bold' : 'text-gray-500'
                        }`}>
                          {formatTime(timing.actual_duration_seconds)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            timing.verification_status === 'verified' 
                              ? 'bg-green-100 text-green-800'
                              : timing.verification_status === 'flagged'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {timing.verification_status === 'verified' && <CheckCircle className="w-3 h-3" />}
                            {timing.verification_status === 'flagged' && <XCircle className="w-3 h-3" />}
                            {timing.verification_status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                            {timing.verification_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {timing.verification_status === 'pending' || timing.is_suspicious ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVerify(timing.id, 'verified')}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                {getText('approve')}
                              </button>
                              <button
                                onClick={() => handleVerify(timing.id, 'flagged')}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                {getText('flag')}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDetailPage;

