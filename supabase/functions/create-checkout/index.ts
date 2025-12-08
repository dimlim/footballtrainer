import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const {
      userId,
      priceId,
      productId,
      planId,
      teamId,
      programId,
      successUrl,
      cancelUrl,
      promoCode,
    } = await req.json();

    // Get or create Stripe customer
    let stripeCustomerId: string;
    
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email,
        name: profile?.full_name,
        metadata: {
          supabase_user_id: userId,
        },
      });

      stripeCustomerId = customer.id;

      // Save to database
      await supabase.from('stripe_customers').insert({
        user_id: userId,
        stripe_customer_id: customer.id,
        email: profile?.email,
      });
    }

    // Check trial eligibility
    let trialDays = 0;
    
    if (productId) {
      const { data: canTrial } = await supabase.rpc('can_start_trial', {
        p_user_id: userId,
        p_product_id: productId,
        p_plan_id: null,
      });
      
      if (canTrial) {
        const { data: product } = await supabase
          .from('products')
          .select('trial_days')
          .eq('id', productId)
          .single();
        trialDays = product?.trial_days || 0;
      }
    } else if (planId) {
      const { data: canTrial } = await supabase.rpc('can_start_trial', {
        p_user_id: userId,
        p_product_id: null,
        p_plan_id: planId,
      });
      
      if (canTrial) {
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('trial_days')
          .eq('id', planId)
          .single();
        trialDays = plan?.trial_days || 0;
      }
    }

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        product_id: productId || '',
        plan_id: planId || '',
        team_id: teamId || '',
        program_id: programId || '',
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          product_id: productId || '',
          plan_id: planId || '',
          team_id: teamId || '',
          program_id: programId || '',
        },
      },
    };

    // Add trial if eligible
    if (trialDays > 0) {
      sessionParams.subscription_data!.trial_period_days = trialDays;
    }

    // Add promo code if provided
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('stripe_coupon_id')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo?.stripe_coupon_id) {
        sessionParams.discounts = [{ coupon: promo.stripe_coupon_id }];
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

