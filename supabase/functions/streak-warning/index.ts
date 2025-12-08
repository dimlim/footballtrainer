// Supabase Edge Function for streak warning notifications
// Runs every evening to warn users about losing their streak
// Deploy with: supabase functions deploy streak-warning

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Get all users with active streaks who have streak_warning enabled
    const { data: usersWithStreaks, error: statsError } = await supabase
      .from('player_stats')
      .select('player_id, current_streak')
      .gt('current_streak', 0);

    if (statsError) throw statsError;

    const notificationsToSend = [];

    for (const user of usersWithStreaks || []) {
      // Check if user has streak_warning enabled
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('streak_warning')
        .eq('player_id', user.player_id)
        .single();

      if (prefs?.streak_warning === false) continue;

      // Check if user trained today
      const { data: todayTraining } = await supabase
        .from('player_day_completions')
        .select('id')
        .eq('player_id', user.player_id)
        .gte('completed_at', `${today}T00:00:00`)
        .limit(1);

      // If no training today and has streak, send warning
      if (!todayTraining || todayTraining.length === 0) {
        // Get subscription
        const { data: subscription } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('player_id', user.player_id)
          .single();

        if (subscription) {
          notificationsToSend.push({
            subscription,
            streak: user.current_streak,
          });
        }
      }
    }

    console.log(`Sending ${notificationsToSend.length} streak warnings`);

    // Send notifications
    const results = await Promise.allSettled(
      notificationsToSend.map(async ({ subscription, streak }) => {
        const notificationPayload = JSON.stringify({
          title: '🔥 Твоя серія під загрозою!',
          body: `Не втрать свою ${streak}-денну серію! Виконай тренування сьогодні.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'streak-warning',
          requireInteraction: true,
          data: {
            url: '/app',
            type: 'streak_warning',
            streak,
          },
        });

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
          notification_type: 'streak_warning',
          title: '🔥 Твоя серія під загрозою!',
          body: `Не втрать свою ${streak}-денну серію!`,
          data: { streak },
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
      }),
      { headers }
    );
  } catch (error) {
    console.error('Streak warning error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
});

