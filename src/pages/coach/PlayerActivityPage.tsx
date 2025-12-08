import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Calendar,
  Zap,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useCoachActivityStore } from '@/stores/coachActivityStore';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { uk, cs, enUS } from 'date-fns/locale';

export const PlayerActivityPage = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile } = useAuthStore();
  const {
    teamActivity,
    suspiciousActivities,
    playerDetail,
    selectedPlayerId,
    isLoading,
    loadTeamActivity,
    loadSuspiciousActivities,
    verifyActivity,
    setSelectedPlayer
  } = useCoachActivityStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'suspicious' | 'detail'>('overview');
  const [periodDays, setPeriodDays] = useState(7);

  const getDateLocale = () => {
    switch (language) {
      case 'uk': return uk;
      case 'cs': return cs;
      default: return enUS;
    }
  };

  useEffect(() => {
    if (profile?.id) {
      loadTeamActivity(profile.id, periodDays);
      loadSuspiciousActivities(profile.id);
    }
  }, [profile?.id, periodDays]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return t('coach.noActivity');
    return formatDistanceToNow(new Date(dateStr), { 
      addSuffix: true, 
      locale: getDateLocale() 
    });
  };

  const handleVerify = async (timingId: string, status: 'verified' | 'flagged') => {
    await verifyActivity(timingId, status);
  };

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
            <h1 className="text-2xl font-bold">{t('coach.activity')}</h1>
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
                {t(`coach.period${days}` as keyof typeof t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t('coach.teamOverview')}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('suspicious')}
              className={`py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'suspicious'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {t('coach.suspicious')}
                {suspiciousActivities.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {suspiciousActivities.length}
                  </span>
                )}
              </div>
            </button>
            {selectedPlayerId && (
              <button
                onClick={() => setActiveTab('detail')}
                className={`py-3 px-4 border-b-2 transition-colors ${
                  activeTab === 'detail'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {t('coach.playerActivity')}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {teamActivity.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('coach.noActivity')}</p>
                  </div>
                ) : (
                  teamActivity.map((player) => (
                    <motion.div
                      key={player.player_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {player.player_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {player.player_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t('coach.lastActive')}: {formatLastActive(player.last_active)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/app/coach/player/${player.player_id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('coach.viewDetails')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Calendar className="w-3 h-3" />
                            {t('coach.totalLogins')}
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {player.total_logins}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <Zap className="w-3 h-3" />
                            {t('coach.totalExercises')}
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {player.total_exercises}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <CheckCircle className="w-3 h-3" />
                            {t('coach.daysCompleted')}
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {player.total_days_completed}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                            <TrendingUp className="w-3 h-3" />
                            XP
                          </div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {player.total_xp}
                          </p>
                        </div>
                      </div>

                      {player.suspicious_count > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">
                            {player.suspicious_count} {t('coach.suspiciousCount')}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Suspicious Tab */}
            {activeTab === 'suspicious' && (
              <div className="space-y-4">
                {suspiciousActivities.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>{t('coach.noSuspicious')}</p>
                  </div>
                ) : (
                  suspiciousActivities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border-l-4 border-amber-500"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {activity.player_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {activity.exercise_id} • {activity.day_key}
                          </p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                          {t('coach.tooFast')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{t('coach.expectedTime')}</p>
                          <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                            {formatTime(activity.expected_duration_seconds)}
                          </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                          <p className="text-xs text-gray-500 mb-1">{t('coach.actualTime')}</p>
                          <p className="font-mono text-lg font-bold text-red-600">
                            {formatTime(activity.actual_duration_seconds)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleVerify(activity.id, 'verified')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('coach.approve')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleVerify(activity.id, 'flagged')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t('coach.reject')}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Player Detail Tab */}
            {activeTab === 'detail' && selectedPlayerId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {teamActivity.find(p => p.player_id === selectedPlayerId)?.player_name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPlayer(null);
                      setActiveTab('overview');
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('common.back')}
                  </Button>
                </div>

                {playerDetail.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('coach.noActivity')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playerDetail.map((activity, idx) => (
                      <motion.div
                        key={`${activity.activity_date}-${activity.activity_type}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              activity.activity_type === 'exercise_complete' 
                                ? 'bg-green-100 text-green-600'
                                : activity.activity_type === 'login'
                                ? 'bg-blue-100 text-blue-600'
                                : activity.activity_type === 'day_complete'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {activity.activity_type === 'exercise_complete' && <CheckCircle className="w-5 h-5" />}
                              {activity.activity_type === 'login' && <Calendar className="w-5 h-5" />}
                              {activity.activity_type === 'day_complete' && <Zap className="w-5 h-5" />}
                              {!['exercise_complete', 'login', 'day_complete'].includes(activity.activity_type) && 
                                <Activity className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {activity.activity_type.replace('_', ' ')}
                              </p>
                              <p className="text-sm text-gray-500">
                                {activity.activity_date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {activity.activity_count}x
                            </p>
                            {activity.total_duration_minutes > 0 && (
                              <p className="text-sm text-gray-500">
                                {activity.total_duration_minutes} min
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerActivityPage;

