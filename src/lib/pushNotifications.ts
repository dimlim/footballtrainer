// @ts-nocheck
import { supabase } from './supabase';

// VAPID public key from https://vapidkeys.com/
const VAPID_PUBLIC_KEY = 'BHGM_c8d51D-ycaHpGPRhL1mZWYJz5rLsxRCng9dy8uGxdiXCPoSWR5AhV8kGZzi7wrd8WPmMlQctVUQmiierVM';

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Convert base64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Subscribe to push notifications
export async function subscribeToPush(playerId: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Subscribe to push
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Save subscription to database
    const subscriptionJSON = subscription.toJSON();
    
    await supabase
      .from('push_subscriptions')
      .upsert({
        player_id: playerId,
        endpoint: subscriptionJSON.endpoint,
        p256dh: subscriptionJSON.keys?.p256dh,
        auth: subscriptionJSON.keys?.auth,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'player_id',
      });

    console.log('Push subscription saved');
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(playerId: string): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
    }

    // Remove from database
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('player_id', playerId);

    console.log('Push subscription removed');
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
}

// Check if user is subscribed
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (error) {
    return false;
  }
}

// Show local notification (for testing or immediate notifications)
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot show notification - permission not granted');
    return;
  }

  // Use service worker to show notification
  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options,
    });
  });
}

// Schedule a local reminder (using setTimeout - works while app is open)
export function scheduleLocalReminder(
  title: string, 
  body: string, 
  delayMs: number
): number {
  const timeoutId = window.setTimeout(() => {
    showLocalNotification(title, { body });
  }, delayMs);
  
  return timeoutId;
}

// Cancel scheduled reminder
export function cancelReminder(timeoutId: number): void {
  window.clearTimeout(timeoutId);
}

// Notification types
export type NotificationType = 
  | 'training_reminder'
  | 'streak_warning'
  | 'achievement_unlocked'
  | 'team_update'
  | 'coach_message';

// Save notification preferences
export async function saveNotificationPreferences(
  playerId: string,
  preferences: {
    training_reminder: boolean;
    streak_warning: boolean;
    achievement_unlocked: boolean;
    team_update: boolean;
    coach_message: boolean;
    reminder_time?: string; // HH:MM format
  }
): Promise<void> {
  await supabase
    .from('notification_preferences')
    .upsert({
      player_id: playerId,
      ...preferences,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'player_id',
    });
}

// Get notification preferences
export async function getNotificationPreferences(playerId: string): Promise<{
  training_reminder: boolean;
  streak_warning: boolean;
  achievement_unlocked: boolean;
  team_update: boolean;
  coach_message: boolean;
  reminder_time: string;
} | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error || !data) {
    // Return defaults
    return {
      training_reminder: true,
      streak_warning: true,
      achievement_unlocked: true,
      team_update: true,
      coach_message: true,
      reminder_time: '18:00',
    };
  }

  return data;
}

