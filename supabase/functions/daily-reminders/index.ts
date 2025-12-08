// Supabase Edge Function for daily training reminders
// This should be triggered by a cron job every hour
// Deploy with: supabase functions deploy daily-reminders
// Set up cron in Supabase Dashboard: pg_cron

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current hour (UTC)
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    
    // Format current time as HH:00
    const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

    // Find users who have training reminders enabled at this hour
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select(`
        player_id,
        reminder_time,
        training_reminder
      `)
      .eq('training_reminder', true);

    if (prefError) {
      throw prefError;
    }

    // Filter users whose reminder time matches current hour
    const usersToNotify = preferences?.filter(pref => {
      const reminderHour = pref.reminder_time?.split(':')[0];
      return reminderHour === currentHour.toString().padStart(2, '0');
    }) || [];

    console.log(`Found ${usersToNotify.length} users to notify at ${currentTime}`);

    // Get subscriptions for these users
    const playerIds = usersToNotify.map(u => u.player_id);
    
    if (playerIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, notified: 0, message: 'No users to notify at this hour' }),
        { headers }
      );
    }

    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('player_id', playerIds);

    if (subError) {
      throw subError;
    }

    // Check which users haven't trained today
    const today = new Date().toISOString().split('T')[0];
    
    const notificationsToSend = [];
    
    for (const subscription of subscriptions || []) {
      // Check if user has completed any training today
      const { data: todayProgress } = await supabase
        .from('player_day_completions')
        .select('id')
        .eq('player_id', subscription.player_id)
        .gte('completed_at', `${today}T00:00:00`)
        .limit(1);

      // Only send reminder if no training completed today
      if (!todayProgress || todayProgress.length === 0) {
        notificationsToSend.push(subscription);
      }
    }

    console.log(`Sending ${notificationsToSend.length} reminders`);

    // Send notifications
    const results = await Promise.allSettled(
      notificationsToSend.map(async (subscription) => {
        const notificationPayload = JSON.stringify({
          title: 'Час тренуватися! ⚽',
          body: 'Не забудь виконати сьогоднішнє тренування',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'training-reminder',
          data: {
            url: '/app',
            type: 'training_reminder',
          },
        });

        // Send push notification
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
          },
          body: notificationPayload,
        });

        // Log notification
        await supabase.from('notification_history').insert({
          player_id: subscription.player_id,
          notification_type: 'training_reminder',
          title: 'Час тренуватися! ⚽',
          body: 'Не забудь виконати сьогоднішнє тренування',
          sent_at: new Date().toISOString(),
        });

        return { player_id: subscription.player_id, status: response.status };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({
        success: true,
        notified: successful,
        total: notificationsToSend.length,
        time: currentTime,
      }),
      { headers }
    );
  } catch (error) {
    console.error('Daily reminders error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
});

