import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  getNotificationPreferences,
  saveNotificationPreferences,
  showLocalNotification,
} from '@/lib/pushNotifications';

export interface NotificationPreferences {
  training_reminder: boolean;
  streak_warning: boolean;
  achievement_unlocked: boolean;
  team_update: boolean;
  coach_message: boolean;
  reminder_time: string;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  preferences: NotificationPreferences;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  sendTestNotification: () => void;
}

const defaultPreferences: NotificationPreferences = {
  training_reminder: true,
  streak_warning: true,
  achievement_unlocked: true,
  team_update: true,
  coach_message: true,
  reminder_time: '18:00',
};

export function usePushNotifications(playerId?: string): UsePushNotificationsReturn {
  const [isSupported] = useState(isPushSupported());
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);

  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      
      const subscribed = await isSubscribedToPush();
      setIsSubscribed(subscribed);
      setPermission(getNotificationPermission());
      
      if (playerId) {
        const prefs = await getNotificationPreferences(playerId);
        if (prefs) {
          setPreferences(prefs);
        }
      }
      
      setIsLoading(false);
    };

    checkStatus();
  }, [playerId]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!playerId) return false;
    
    setIsLoading(true);
    
    // First request permission if not granted
    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') {
        setIsLoading(false);
        return false;
      }
    }
    
    const subscription = await subscribeToPush(playerId);
    const success = !!subscription;
    
    setIsSubscribed(success);
    setIsLoading(false);
    
    if (success) {
      showLocalNotification('Сповіщення увімкнено! 🔔', {
        body: 'Тепер ви будете отримувати нагадування про тренування',
      });
    }
    
    return success;
  }, [playerId, permission, requestPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!playerId) return false;
    
    setIsLoading(true);
    
    const success = await unsubscribeFromPush(playerId);
    
    if (success) {
      setIsSubscribed(false);
    }
    
    setIsLoading(false);
    return success;
  }, [playerId]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>): Promise<void> => {
    if (!playerId) return;
    
    const newPreferences = { ...preferences, ...prefs };
    setPreferences(newPreferences);
    
    await saveNotificationPreferences(playerId, newPreferences);
  }, [playerId, preferences]);

  // Send test notification
  const sendTestNotification = useCallback((): void => {
    if (permission === 'granted') {
      showLocalNotification('Тестове сповіщення ⚽', {
        body: 'Сповіщення працюють коректно!',
        tag: 'test',
      });
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
  };
}

