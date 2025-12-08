// Supabase Edge Function for weekly progress reports
// Runs every Sunday to send weekly summary to users
// Deploy with: supabase functions deploy weekly-report

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

    // Calculate week range
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // Get users who want weekly reports
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('player_id')
      .eq('weekly_report', true);

    if (prefError) throw prefError;

    const notificationsToSend = [];

    for (const pref of preferences || []) {
      // Get user's weekly stats
      const { data: completions } = await supabase
        .from('player_day_completions')
        .select('id, xp_earned')
        .eq('player_id', pref.player_id)
        .gte('completed_at', `${weekStartStr}T00:00:00`)
        .lte('completed_at', `${todayStr}T23:59:59`);

      const trainingsCompleted = completions?.length || 0;
      const xpEarned = completions?.reduce((sum, c) => sum + (c.xp_earned || 0), 0) || 0;

      // Get subscription
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('player_id', pref.player_id)
        .single();

      if (subscription && trainingsCompleted > 0) {
        notificationsToSend.push({
          subscription,
          trainingsCompleted,
          xpEarned,
          playerId: pref.player_id,
        });
      }
    }

    console.log(`Sending ${notificationsToSend.length} weekly reports`);

    // Send notifications
    const results = await Promise.allSettled(
      notificationsToSend.map(async ({ subscription, trainingsCompleted, xpEarned, playerId }) => {
        const emoji = trainingsCompleted >= 5 ? '🏆' : trainingsCompleted >= 3 ? '💪' : '⚽';
        const message = trainingsCompleted >= 5 
          ? 'Чудовий тиждень! Продовжуй в тому ж дусі!' 
          : trainingsCompleted >= 3 
          ? 'Гарний тиждень! Можеш ще краще!' 
          : 'Новий тиждень - новий старт!';

        const notificationPayload = JSON.stringify({
          title: `${emoji} Твій тижневий звіт`,
          body: `Тренувань: ${trainingsCompleted} | XP: +${xpEarned}. ${message}`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'weekly-report',
          data: {
            url: '/app/stats',
            type: 'weekly_report',
            trainingsCompleted,
            xpEarned,
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
          player_id: playerId,
          notification_type: 'weekly_report',
          title: `${emoji} Твій тижневий звіт`,
          body: `Тренувань: ${trainingsCompleted} | XP: +${xpEarned}`,
          data: { trainingsCompleted, xpEarned },
          sent_at: new Date().toISOString(),
        });

        return { player_id: playerId, status: response.status };
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
    console.error('Weekly report error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
});

