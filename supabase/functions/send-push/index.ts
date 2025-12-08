// Supabase Edge Function for sending push notifications
// Deploy with: supabase functions deploy send-push

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// VAPID keys - generate your own at https://vapidkeys.com/
// Set these as environment variables in Supabase
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@footballtrainer.app';

interface PushPayload {
  player_id?: string;
  team_id?: string;
  notification_type: 'training_reminder' | 'streak_warning' | 'achievement_unlocked' | 'team_update' | 'coach_message';
  title: string;
  body: string;
  data?: Record<string, any>;
  url?: string;
}

serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    const payload: PushPayload = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let subscriptions: any[] = [];

    // Get subscriptions based on target
    if (payload.player_id) {
      // Single player
      const { data } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('player_id', payload.player_id);
      
      if (data) subscriptions = data;
    } else if (payload.team_id) {
      // All team members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('player_id')
        .eq('team_id', payload.team_id);
      
      if (teamMembers) {
        const playerIds = teamMembers.map(m => m.player_id);
        const { data } = await supabase
          .from('push_subscriptions')
          .select('*')
          .in('player_id', playerIds);
        
        if (data) subscriptions = data;
      }
    }

    // Check notification preferences
    const filteredSubscriptions = [];
    for (const sub of subscriptions) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('player_id', sub.player_id)
        .single();
      
      // If no preferences, allow all
      if (!prefs || prefs[payload.notification_type] !== false) {
        filteredSubscriptions.push(sub);
      }
    }

    // Send push notifications
    const results = await Promise.allSettled(
      filteredSubscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const notificationPayload = JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: payload.notification_type,
          data: {
            url: payload.url || '/app',
            type: payload.notification_type,
            ...payload.data,
          },
        });

        // Send using Web Push protocol
        // Note: In production, use a proper web-push library
        // This is a simplified version
        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TTL': '86400',
            // Authorization headers would be added here with VAPID
          },
          body: notificationPayload,
        });

        // Log notification
        await supabase.from('notification_history').insert({
          player_id: subscription.player_id,
          notification_type: payload.notification_type,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sent_at: new Date().toISOString(),
        });

        return { player_id: subscription.player_id, status: response.status };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed: failed,
        total: filteredSubscriptions.length,
      }),
      { headers }
    );
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers }
    );
  }
});

