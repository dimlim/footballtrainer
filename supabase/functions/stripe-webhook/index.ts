import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Received Stripe event:', event.type);

    switch (event.type) {
      // Checkout completed - create subscription record
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          await handleSubscriptionCreated(supabase, subscription);
        }
        break;
      }

      // Subscription created
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(supabase, subscription);
        break;
      }

      // Subscription updated
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      // Subscription deleted/canceled
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      // Invoice paid - record payment
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      // Invoice payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  const metadata = subscription.metadata;
  const userId = metadata.user_id;
  const productId = metadata.product_id || null;
  const planId = metadata.plan_id || null;
  const teamId = metadata.team_id || null;
  const programId = metadata.program_id || null;

  const status = subscription.status;
  const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  
  const trialStart = subscription.trial_start 
    ? new Date(subscription.trial_start * 1000).toISOString() 
    : null;
  const trialEnd = subscription.trial_end 
    ? new Date(subscription.trial_end * 1000).toISOString() 
    : null;

  // Determine billing period from price
  const priceId = subscription.items.data[0]?.price.id;
  let billingPeriod = 'monthly';
  if (subscription.items.data[0]?.price.recurring?.interval === 'year') {
    billingPeriod = 'yearly';
  }

  if (teamId && programId) {
    // Team subscription
    await supabase.from('team_subscriptions').upsert({
      team_id: teamId,
      coach_id: userId,
      program_id: programId,
      product_id: productId,
      stripe_subscription_id: subscription.id,
      status: status,
      max_players: 30,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
    }, {
      onConflict: 'team_id,program_id'
    });
  } else {
    // Individual subscription
    await supabase.from('user_subscriptions').insert({
      user_id: userId,
      subscription_plan_id: planId,
      product_id: productId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      status: status,
      trial_start: trialStart,
      trial_end: trialEnd,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      billing_period: billingPeriod,
    });
  }

  // Record trial usage if applicable
  if (trialStart) {
    await supabase.from('trial_history').insert({
      user_id: userId,
      product_id: productId,
      subscription_plan_id: planId,
      trial_started_at: trialStart,
      trial_ended_at: trialEnd,
    });
  }

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  const status = subscription.status;
  const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const cancelAt = subscription.cancel_at 
    ? new Date(subscription.cancel_at * 1000).toISOString() 
    : null;
  const canceledAt = subscription.canceled_at 
    ? new Date(subscription.canceled_at * 1000).toISOString() 
    : null;

  // Try to update user subscription
  const { data: userSub } = await supabase
    .from('user_subscriptions')
    .update({
      status: status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at: cancelAt,
      canceled_at: canceledAt,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)
    .select();

  if (!userSub || userSub.length === 0) {
    // Try team subscription
    await supabase
      .from('team_subscriptions')
      .update({
        status: status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at: cancelAt,
        canceled_at: canceledAt,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  // Update trial history if converted
  if (status === 'active' && subscription.trial_end) {
    const metadata = subscription.metadata;
    await supabase
      .from('trial_history')
      .update({ converted_to_paid: true })
      .eq('user_id', metadata.user_id)
      .or(`product_id.eq.${metadata.product_id},subscription_plan_id.eq.${metadata.plan_id}`);
  }

  console.log(`Subscription ${subscription.id} updated to status: ${status}`);
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  const canceledAt = new Date().toISOString();

  // Update user subscription
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: canceledAt,
      updated_at: canceledAt,
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update team subscription
  await supabase
    .from('team_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: canceledAt,
      updated_at: canceledAt,
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription ${subscription.id} deleted`);
}

async function handleInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  // Get user from Stripe customer
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (!customer) return;

  // Record payment
  await supabase.from('payment_history').insert({
    user_id: customer.user_id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent,
    amount: (invoice.amount_paid || 0) / 100,
    currency: invoice.currency,
    status: 'succeeded',
    description: invoice.lines.data[0]?.description || 'Subscription payment',
    receipt_url: invoice.hosted_invoice_url,
    invoice_pdf: invoice.invoice_pdf,
  });

  console.log(`Invoice ${invoice.id} paid for user ${customer.user_id}`);
}

async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.customer) return;

  // Get user from Stripe customer
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer)
    .single();

  if (!customer) return;

  // Record failed payment
  await supabase.from('payment_history').insert({
    user_id: customer.user_id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent,
    amount: (invoice.amount_due || 0) / 100,
    currency: invoice.currency,
    status: 'failed',
    description: 'Payment failed',
  });

  // Update subscription status
  if (invoice.subscription) {
    await supabase
      .from('user_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription);
  }

  console.log(`Payment failed for invoice ${invoice.id}`);

  // TODO: Send notification to user about failed payment
}
