-- ============================================
-- MONETIZATION SYSTEM
-- Products, Subscriptions, Purchases
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PRODUCTS & PRICING
-- ============================================

-- Product types
CREATE TYPE product_type AS ENUM ('program', 'bundle', 'subscription_plan');
CREATE TYPE license_type AS ENUM ('individual', 'team');
CREATE TYPE billing_period AS ENUM ('monthly', 'yearly', 'lifetime');

-- Products table (programs with pricing)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Product info
    name_uk TEXT NOT NULL,
    name_en TEXT,
    name_cs TEXT,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    
    -- Type and reference
    product_type product_type NOT NULL DEFAULT 'program',
    program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL, -- For program products
    
    -- Pricing
    price_usd DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_eur DECIMAL(10,2),
    price_czk DECIMAL(10,2),
    
    -- License type
    license_type license_type NOT NULL DEFAULT 'individual',
    max_users INTEGER DEFAULT 1, -- For team licenses
    
    -- Billing
    billing_period billing_period NOT NULL DEFAULT 'monthly',
    trial_days INTEGER DEFAULT 0,
    
    -- Stripe
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bundles (multiple programs)
CREATE TABLE IF NOT EXISTS public.product_bundles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, program_id)
);

-- Subscription plans (for "all access" type subscriptions)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Plan info
    name_uk TEXT NOT NULL,
    name_en TEXT,
    name_cs TEXT,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    
    -- Type
    license_type license_type NOT NULL DEFAULT 'individual',
    max_users INTEGER DEFAULT 1,
    
    -- Pricing
    price_monthly_usd DECIMAL(10,2) NOT NULL,
    price_yearly_usd DECIMAL(10,2),
    price_monthly_eur DECIMAL(10,2),
    price_yearly_eur DECIMAL(10,2),
    price_monthly_czk DECIMAL(10,2),
    price_yearly_czk DECIMAL(10,2),
    
    -- Features
    includes_all_programs BOOLEAN DEFAULT false,
    included_programs UUID[], -- Specific programs if not all
    max_teams INTEGER DEFAULT 1, -- For coaches
    
    -- Trial
    trial_days INTEGER DEFAULT 7,
    
    -- Stripe
    stripe_product_id TEXT,
    stripe_price_monthly_id TEXT,
    stripe_price_yearly_id TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. CUSTOMERS & SUBSCRIPTIONS
-- ============================================

-- Stripe customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- What they subscribed to
    subscription_plan_id UUID REFERENCES public.subscription_plans(id),
    product_id UUID REFERENCES public.products(id),
    
    -- Stripe info
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing, paused
    
    -- Dates
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Billing
    billing_period billing_period NOT NULL DEFAULT 'monthly',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team subscriptions (for coaches)
CREATE TABLE IF NOT EXISTS public.team_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- What program
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id),
    
    -- Stripe info
    stripe_subscription_id TEXT UNIQUE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active',
    max_players INTEGER DEFAULT 30,
    
    -- Dates
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(team_id, program_id)
);

-- ============================================
-- 3. ONE-TIME PURCHASES
-- ============================================

-- Individual program purchases
CREATE TABLE IF NOT EXISTS public.program_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    
    -- Stripe info
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    
    -- Payment details
    amount_paid DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'completed', -- completed, refunded
    
    -- Access
    access_granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    access_expires_at TIMESTAMPTZ, -- NULL = lifetime
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, program_id)
);

-- ============================================
-- 4. ACCESS CONTROL
-- ============================================

-- View to check user's program access
CREATE OR REPLACE VIEW public.user_program_access AS
SELECT DISTINCT
    p.id as user_id,
    prog.id as program_id,
    CASE
        -- Free programs
        WHEN prog.is_premium = false THEN 'free'
        -- Direct purchase
        WHEN pp.id IS NOT NULL AND (pp.access_expires_at IS NULL OR pp.access_expires_at > NOW()) THEN 'purchased'
        -- Individual subscription
        WHEN us.id IS NOT NULL AND us.status IN ('active', 'trialing') AND us.current_period_end > NOW() THEN 'subscription'
        -- Team subscription
        WHEN ts.id IS NOT NULL AND ts.status = 'active' AND ts.current_period_end > NOW() THEN 'team'
        ELSE 'none'
    END as access_type,
    COALESCE(
        pp.access_expires_at,
        us.current_period_end,
        ts.current_period_end
    ) as access_until
FROM public.profiles p
CROSS JOIN public.programs prog
LEFT JOIN public.program_purchases pp ON pp.user_id = p.id AND pp.program_id = prog.id AND pp.status = 'completed'
LEFT JOIN public.user_subscriptions us ON us.user_id = p.id 
    AND us.status IN ('active', 'trialing')
    AND (
        us.subscription_plan_id IN (SELECT id FROM subscription_plans WHERE includes_all_programs = true)
        OR prog.id = ANY(SELECT unnest(included_programs) FROM subscription_plans WHERE id = us.subscription_plan_id)
        OR us.product_id IN (SELECT id FROM products WHERE program_id = prog.id)
    )
LEFT JOIN public.team_members tm ON tm.player_id = p.id
LEFT JOIN public.team_subscriptions ts ON ts.team_id = tm.team_id AND ts.program_id = prog.id AND ts.status = 'active';

-- Function to check if user has access to program
CREATE OR REPLACE FUNCTION check_program_access(p_user_id UUID, p_program_id UUID)
RETURNS TABLE (
    has_access BOOLEAN,
    access_type TEXT,
    access_until TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN upa.access_type != 'none' THEN true ELSE false END,
        upa.access_type,
        upa.access_until
    FROM user_program_access upa
    WHERE upa.user_id = p_user_id AND upa.program_id = p_program_id
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check team subscription player count
CREATE OR REPLACE FUNCTION check_team_player_limit(p_team_id UUID, p_program_id UUID)
RETURNS TABLE (
    current_players INTEGER,
    max_players INTEGER,
    can_add_more BOOLEAN
) AS $$
DECLARE
    v_current INTEGER;
    v_max INTEGER;
BEGIN
    -- Get current player count
    SELECT COUNT(*) INTO v_current
    FROM team_members
    WHERE team_id = p_team_id;
    
    -- Get max players from subscription
    SELECT ts.max_players INTO v_max
    FROM team_subscriptions ts
    WHERE ts.team_id = p_team_id 
    AND ts.program_id = p_program_id
    AND ts.status = 'active';
    
    IF v_max IS NULL THEN
        v_max := 0;
    END IF;
    
    RETURN QUERY SELECT v_current, v_max, v_current < v_max;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. TRIAL TRACKING
-- ============================================

-- Track trial usage (prevent multiple trials)
CREATE TABLE IF NOT EXISTS public.trial_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id),
    subscription_plan_id UUID REFERENCES public.subscription_plans(id),
    trial_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_ended_at TIMESTAMPTZ,
    converted_to_paid BOOLEAN DEFAULT false
);

-- Create unique index for trial tracking (user can only have one trial per product OR plan)
CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_history_user_product 
    ON public.trial_history(user_id, product_id) 
    WHERE product_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_history_user_plan 
    ON public.trial_history(user_id, subscription_plan_id) 
    WHERE subscription_plan_id IS NOT NULL;

-- Function to check if user can start trial
CREATE OR REPLACE FUNCTION can_start_trial(
    p_user_id UUID, 
    p_product_id UUID DEFAULT NULL,
    p_plan_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM trial_history
        WHERE user_id = p_user_id
        AND (
            (p_product_id IS NOT NULL AND product_id = p_product_id)
            OR (p_plan_id IS NOT NULL AND subscription_plan_id = p_plan_id)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. INVOICES & PAYMENTS HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Stripe info
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    stripe_charge_id TEXT,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL, -- succeeded, failed, refunded
    
    -- What was paid for
    description TEXT,
    product_id UUID REFERENCES public.products(id),
    subscription_id UUID REFERENCES public.user_subscriptions(id),
    team_subscription_id UUID REFERENCES public.team_subscriptions(id),
    
    -- Receipt
    receipt_url TEXT,
    invoice_pdf TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. PROMO CODES & DISCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    
    -- Discount
    discount_type TEXT NOT NULL DEFAULT 'percent', -- percent, fixed
    discount_value DECIMAL(10,2) NOT NULL,
    
    -- Applicability
    applies_to_products UUID[], -- NULL = all
    applies_to_plans UUID[], -- NULL = all
    
    -- Limits
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    
    -- Validity
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    
    -- Stripe
    stripe_coupon_id TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promo_code_uses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discount_applied DECIMAL(10,2),
    UNIQUE(promo_code_id, user_id)
);

-- ============================================
-- 8. RLS POLICIES
-- ============================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_uses ENABLE ROW LEVEL SECURITY;

-- Products: everyone can read active products
CREATE POLICY "Products are viewable by everyone"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Product bundles: everyone can read
CREATE POLICY "Bundles are viewable by everyone"
    ON public.product_bundles FOR SELECT
    USING (true);

-- Subscription plans: everyone can read active
CREATE POLICY "Plans are viewable by everyone"
    ON public.subscription_plans FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage plans"
    ON public.subscription_plans FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Stripe customers: users see own
CREATE POLICY "Users view own stripe customer"
    ON public.stripe_customers FOR SELECT
    USING (user_id = auth.uid());

-- User subscriptions: users see own
CREATE POLICY "Users view own subscriptions"
    ON public.user_subscriptions FOR SELECT
    USING (user_id = auth.uid());

-- Team subscriptions: coaches see own teams
CREATE POLICY "Coaches view own team subscriptions"
    ON public.team_subscriptions FOR SELECT
    USING (coach_id = auth.uid());

-- Program purchases: users see own
CREATE POLICY "Users view own purchases"
    ON public.program_purchases FOR SELECT
    USING (user_id = auth.uid());

-- Trial history: users see own
CREATE POLICY "Users view own trial history"
    ON public.trial_history FOR SELECT
    USING (user_id = auth.uid());

-- Payment history: users see own
CREATE POLICY "Users view own payment history"
    ON public.payment_history FOR SELECT
    USING (user_id = auth.uid());

-- Promo codes: everyone can read active
CREATE POLICY "Active promo codes are viewable"
    ON public.promo_codes FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Promo code uses: users see own
CREATE POLICY "Users view own promo uses"
    ON public.promo_code_uses FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- 9. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_program ON public.products(program_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_user ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe ON public.stripe_customers(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_subs_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subs_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subs_stripe ON public.user_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_team_subs_team ON public.team_subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_subs_coach ON public.team_subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_team_subs_program ON public.team_subscriptions(program_id);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.program_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_program ON public.program_purchases(program_id);

CREATE INDEX IF NOT EXISTS idx_payment_history_user ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_created ON public.payment_history(created_at);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);

-- ============================================
-- 10. SAMPLE DATA (Optional)
-- ============================================

-- Insert sample subscription plans
INSERT INTO public.subscription_plans (
    name_uk, name_en, name_cs,
    description_uk, description_en, description_cs,
    license_type, max_users,
    price_monthly_usd, price_yearly_usd,
    includes_all_programs, trial_days,
    is_active, is_featured, sort_order
) VALUES 
(
    'Pro Гравець', 'Pro Player', 'Pro Hráč',
    'Доступ до всіх преміум програм', 'Access to all premium programs', 'Přístup ke všem prémiovým programům',
    'individual', 1,
    9.99, 79.99,
    true, 7,
    true, true, 1
),
(
    'Тренер Basic', 'Coach Basic', 'Trenér Basic',
    'Для команди до 30 гравців', 'For team up to 30 players', 'Pro tým do 30 hráčů',
    'team', 30,
    29.99, 249.99,
    false, 7,
    true, false, 2
),
(
    'Тренер Pro', 'Coach Pro', 'Trenér Pro',
    'Всі програми для команди до 30 гравців', 'All programs for team up to 30 players', 'Všechny programy pro tým do 30 hráčů',
    'team', 30,
    49.99, 399.99,
    true, 7,
    true, true, 3
)
ON CONFLICT DO NOTHING;

SELECT 'Monetization tables created successfully' as status;

