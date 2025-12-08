// @ts-nocheck
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Stripe public key from environment
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

// Types
export interface Product {
  id: string;
  name_uk: string;
  name_en: string | null;
  name_cs: string | null;
  description_uk: string | null;
  description_en: string | null;
  description_cs: string | null;
  product_type: 'program' | 'bundle' | 'subscription_plan';
  program_id: string | null;
  price_usd: number;
  price_eur: number | null;
  price_czk: number | null;
  license_type: 'individual' | 'team';
  max_users: number;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
  trial_days: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name_uk: string;
  name_en: string | null;
  name_cs: string | null;
  description_uk: string | null;
  description_en: string | null;
  description_cs: string | null;
  license_type: 'individual' | 'team';
  max_users: number;
  price_monthly_usd: number;
  price_yearly_usd: number | null;
  price_monthly_eur: number | null;
  price_yearly_eur: number | null;
  price_monthly_czk: number | null;
  price_yearly_czk: number | null;
  includes_all_programs: boolean;
  included_programs: string[] | null;
  max_teams: number;
  trial_days: number;
  stripe_product_id: string | null;
  stripe_price_monthly_id: string | null;
  stripe_price_yearly_id: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_plan_id: string | null;
  product_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  canceled_at: string | null;
  billing_period: 'monthly' | 'yearly' | 'lifetime';
}

export interface TeamSubscription {
  id: string;
  team_id: string;
  coach_id: string;
  program_id: string;
  product_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  max_players: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  canceled_at: string | null;
}

export interface ProgramAccess {
  has_access: boolean;
  access_type: 'free' | 'purchased' | 'subscription' | 'team' | 'none';
  access_until: string | null;
}

export interface ProgramPrice {
  id: string;
  product_id: string;
  program_id: string;
  license_type: 'individual' | 'team';
  max_users: number;
  price_id: string;
  price: {
    unit_amount: number;
    currency: string;
    interval: 'month' | 'year';
    trial_period_days: number | null;
  };
}

// API Functions
export const stripeService = {
  // Get all active products
  async getProducts(): Promise<Product[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data || [];
  },

  // Get all subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
    return data || [];
  },

  // Get user's active subscriptions
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing']);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
    return data || [];
  },

  // Get team subscriptions for coach
  async getTeamSubscriptions(coachId: string): Promise<TeamSubscription[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('team_subscriptions')
      .select('*')
      .eq('coach_id', coachId)
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching team subscriptions:', error);
      return [];
    }
    return data || [];
  },

  // Check if user has access to program
  async checkProgramAccess(userId: string, programId: string): Promise<ProgramAccess> {
    // @ts-ignore
    const { data, error } = await supabase
      .rpc('check_program_access', {
        p_user_id: userId,
        p_program_id: programId
      });

    if (error || !data || data.length === 0) {
      return { has_access: false, access_type: 'none', access_until: null };
    }

    return data[0];
  },

  // Check if user can start trial
  async canStartTrial(userId: string, productId?: string, planId?: string): Promise<boolean> {
    // @ts-ignore
    const { data, error } = await supabase
      .rpc('can_start_trial', {
        p_user_id: userId,
        p_product_id: productId || null,
        p_plan_id: planId || null
      });

    if (error) {
      console.error('Error checking trial eligibility:', error);
      return false;
    }
    return data || false;
  },

  // Create checkout session (calls Edge Function)
  async createCheckoutSession(params: {
    userId: string;
    priceId: string;
    productId?: string;
    planId?: string;
    teamId?: string;
    programId?: string;
    successUrl: string;
    cancelUrl: string;
    promoCode?: string;
  }): Promise<{ sessionId: string; url: string } | null> {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: params
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
    return data;
  },

  // Create customer portal session
  async createPortalSession(userId: string, returnUrl: string): Promise<{ url: string } | null> {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { userId, returnUrl }
    });

    if (error) {
      console.error('Error creating portal session:', error);
      return null;
    }
    return data;
  },

  // Validate promo code
  async validatePromoCode(code: string, productId?: string, planId?: string): Promise<{
    valid: boolean;
    discount_type?: string;
    discount_value?: number;
    error?: string;
  }> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid promo code' };
    }

    // Check validity period
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      return { valid: false, error: 'Promo code expired' };
    }

    // Check usage limit
    if (data.max_uses && data.current_uses >= data.max_uses) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    // Check if applies to this product/plan
    if (productId && data.applies_to_products && !data.applies_to_products.includes(productId)) {
      return { valid: false, error: 'Promo code not valid for this product' };
    }

    if (planId && data.applies_to_plans && !data.applies_to_plans.includes(planId)) {
      return { valid: false, error: 'Promo code not valid for this plan' };
    }

    return {
      valid: true,
      discount_type: data.discount_type,
      discount_value: data.discount_value
    };
  },

  // Get user's purchase history
  async getPurchaseHistory(userId: string): Promise<any[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
    return data || [];
  },

  // Get user's purchased programs
  async getPurchasedPrograms(userId: string): Promise<string[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('program_purchases')
      .select('program_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching purchased programs:', error);
      return [];
    }
    return data?.map(p => p.program_id) || [];
  },

  // Get prices for a specific program
  async getProgramPrices(programId: string): Promise<ProgramPrice[]> {
    // @ts-ignore
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('program_id', programId)
      .eq('is_active', true)
      .order('license_type');

    if (error) {
      console.error('Error fetching program prices:', error);
      return [];
    }

    return (data || []).map(product => ({
      id: product.id,
      product_id: product.id,
      program_id: product.program_id,
      license_type: product.license_type,
      max_users: product.max_users,
      price_id: product.stripe_price_id,
      price: {
        unit_amount: product.price_usd * 100, // Convert to cents
        currency: 'usd',
        interval: product.billing_period === 'yearly' ? 'year' : 'month',
        trial_period_days: product.trial_days || null,
      },
    }));
  }
};

// Helper to format price
export const formatPrice = (
  amount: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper to get localized price
export const getLocalizedPrice = (
  product: Product | SubscriptionPlan,
  currency: 'usd' | 'eur' | 'czk' = 'usd',
  isYearly: boolean = false
): number => {
  if ('price_monthly_usd' in product) {
    // Subscription plan
    const plan = product as SubscriptionPlan;
    if (isYearly) {
      switch (currency) {
        case 'eur': return plan.price_yearly_eur || plan.price_yearly_usd || 0;
        case 'czk': return plan.price_yearly_czk || plan.price_yearly_usd || 0;
        default: return plan.price_yearly_usd || 0;
      }
    } else {
      switch (currency) {
        case 'eur': return plan.price_monthly_eur || plan.price_monthly_usd;
        case 'czk': return plan.price_monthly_czk || plan.price_monthly_usd;
        default: return plan.price_monthly_usd;
      }
    }
  } else {
    // Product
    const prod = product as Product;
    switch (currency) {
      case 'eur': return prod.price_eur || prod.price_usd;
      case 'czk': return prod.price_czk || prod.price_usd;
      default: return prod.price_usd;
    }
  }
};
