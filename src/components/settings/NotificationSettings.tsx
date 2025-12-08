import React from 'react';
import { motion } from 'motion/react';
import { Bell, BellOff, Clock, Trophy, Flame, Users, MessageSquare, Dumbbell, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface NotificationSettingsProps {
  playerId: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ playerId }) => {
  const { language } = useTranslation();
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
  } = usePushNotifications(playerId);

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'title': { uk: 'Сповіщення', en: 'Notifications', cs: 'Oznámení' },
      'notSupported': { uk: 'Сповіщення не підтримуються вашим браузером', en: 'Notifications are not supported by your browser', cs: 'Oznámení nejsou podporována vaším prohlížečem' },
      'permissionDenied': { uk: 'Сповіщення заблоковані. Увімкніть їх в налаштуваннях браузера.', en: 'Notifications are blocked. Enable them in browser settings.', cs: 'Oznámení jsou blokována. Povolte je v nastavení prohlížeče.' },
      'enableNotifications': { uk: 'Увімкнути сповіщення', en: 'Enable notifications', cs: 'Povolit oznámení' },
      'disableNotifications': { uk: 'Вимкнути сповіщення', en: 'Disable notifications', cs: 'Zakázat oznámení' },
      'testNotification': { uk: 'Тестове сповіщення', en: 'Test notification', cs: 'Testovací oznámení' },
      'notificationTypes': { uk: 'Типи сповіщень', en: 'Notification types', cs: 'Typy oznámení' },
      'trainingReminder': { uk: 'Нагадування про тренування', en: 'Training reminder', cs: 'Připomínka tréninku' },
      'trainingReminderDesc': { uk: 'Щоденне нагадування про заплановане тренування', en: 'Daily reminder about scheduled training', cs: 'Denní připomínka naplánovaného tréninku' },
      'streakWarning': { uk: 'Попередження про серію', en: 'Streak warning', cs: 'Varování o sérii' },
      'streakWarningDesc': { uk: 'Нагадування, якщо ви можете втратити серію', en: 'Reminder if you might lose your streak', cs: 'Připomínka, pokud můžete ztratit sérii' },
      'achievements': { uk: 'Досягнення', en: 'Achievements', cs: 'Úspěchy' },
      'achievementsDesc': { uk: 'Сповіщення про нові досягнення', en: 'Notifications about new achievements', cs: 'Oznámení o nových úspěších' },
      'teamUpdates': { uk: 'Оновлення команди', en: 'Team updates', cs: 'Aktualizace týmu' },
      'teamUpdatesDesc': { uk: 'Новини та активність команди', en: 'Team news and activity', cs: 'Novinky a aktivita týmu' },
      'coachMessages': { uk: 'Повідомлення тренера', en: 'Coach messages', cs: 'Zprávy trenéra' },
      'coachMessagesDesc': { uk: 'Особисті повідомлення від тренера', en: 'Personal messages from coach', cs: 'Osobní zprávy od trenéra' },
      'reminderTime': { uk: 'Час нагадування', en: 'Reminder time', cs: 'Čas připomínky' },
      'reminderTimeDesc': { uk: 'Коли надсилати щоденне нагадування', en: 'When to send daily reminder', cs: 'Kdy odeslat denní připomínku' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  if (!isSupported) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{getText('notSupported')}</p>
        </div>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 text-red-600">
          <BellOff className="w-5 h-5" />
          <p className="text-sm">{getText('permissionDenied')}</p>
        </div>
      </Card>
    );
  }

  const notificationTypes = [
    {
      key: 'training_reminder',
      icon: <Dumbbell className="w-5 h-5" />,
      title: getText('trainingReminder'),
      description: getText('trainingReminderDesc'),
      color: 'text-primary-500',
    },
    {
      key: 'streak_warning',
      icon: <Flame className="w-5 h-5" />,
      title: getText('streakWarning'),
      description: getText('streakWarningDesc'),
      color: 'text-orange-500',
    },
    {
      key: 'achievement_unlocked',
      icon: <Trophy className="w-5 h-5" />,
      title: getText('achievements'),
      description: getText('achievementsDesc'),
      color: 'text-amber-500',
    },
    {
      key: 'team_update',
      icon: <Users className="w-5 h-5" />,
      title: getText('teamUpdates'),
      description: getText('teamUpdatesDesc'),
      color: 'text-green-500',
    },
    {
      key: 'coach_message',
      icon: <MessageSquare className="w-5 h-5" />,
      title: getText('coachMessages'),
      description: getText('coachMessagesDesc'),
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                <BellOff className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900">{getText('title')}</h3>
              <p className="text-sm text-gray-500">
                {isSubscribed 
                  ? (language === 'uk' ? 'Увімкнено' : language === 'cs' ? 'Povoleno' : 'Enabled')
                  : (language === 'uk' ? 'Вимкнено' : language === 'cs' ? 'Zakázáno' : 'Disabled')
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 rounded-xl font-medium text-sm transition-colors',
              isSubscribed
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-primary-600 text-white hover:bg-primary-700',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading 
              ? '...' 
              : isSubscribed 
                ? getText('disableNotifications')
                : getText('enableNotifications')
            }
          </button>
        </div>

        {/* Test button */}
        {isSubscribed && (
          <button
            onClick={sendTestNotification}
            className="mt-3 w-full py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            🔔 {getText('testNotification')}
          </button>
        )}
      </Card>

      {/* Notification types */}
      {isSubscribed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4">
            <h4 className="font-bold text-gray-900 mb-4">{getText('notificationTypes')}</h4>
            
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('mt-0.5', type.color)}>
                      {type.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{type.title}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[type.key as keyof typeof preferences] as boolean}
                      onChange={(e) => updatePreferences({ [type.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Reminder time */}
      {isSubscribed && preferences.training_reminder && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{getText('reminderTime')}</p>
                <p className="text-xs text-gray-500">{getText('reminderTimeDesc')}</p>
              </div>
            </div>
            
            <input
              type="time"
              value={preferences.reminder_time}
              onChange={(e) => updatePreferences({ reminder_time: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default NotificationSettings;

