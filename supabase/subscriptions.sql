-- ============================================
-- SUBSCRIPTIONS & PAYMENTS
-- Stripe integration for monetization
-- Run this in Supabase SQL Editor
-- ============================================

-- Stripe customers (link Supabase user to Stripe customer)
CREATE TABLE IF NOT EXISTS public.stripe_customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    stripe_customer_id TEXT NOT NULL UNIQUE,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products (synced from Stripe)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY, -- Stripe product ID
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    metadata JSONB, -- Additional product data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prices (synced from Stripe)
CREATE TABLE IF NOT EXISTS public.prices (
    id TEXT PRIMARY KEY, -- Stripe price ID
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    unit_amount INTEGER NOT NULL, -- Amount in cents
    type TEXT NOT NULL, -- 'one_time' or 'recurring'
    interval TEXT, -- 'month', 'year' (for recurring)
    interval_count INTEGER DEFAULT 1,
    trial_period_days INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Program pricing (link programs to Stripe prices)
CREATE TABLE IF NOT EXISTS public.program_prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    price_id TEXT REFERENCES public.prices(id) ON DELETE CASCADE NOT NULL,
    license_type TEXT NOT NULL, -- 'individual', 'team'
    max_users INTEGER DEFAULT 1, -- 1 for individual, 30 for team
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(program_id, price_id)
);

-- Bundles (multiple programs with discount)
CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name_uk TEXT NOT NULL,
    name_en TEXT,
    name_cs TEXT,
    description_uk TEXT,
    description_en TEXT,
    description_cs TEXT,
    price_id TEXT REFERENCES public.prices(id) ON DELETE SET NULL,
    discount_percent INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bundle items (programs in bundle)
CREATE TABLE IF NOT EXISTS public.bundle_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bundle_id UUID REFERENCES public.bundles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(bundle_id, program_id)
);

-- Subscriptions (active subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY, -- Stripe subscription ID
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    price_id TEXT REFERENCES public.prices(id) NOT NULL,
    status TEXT NOT NULL, -- 'trialing', 'active', 'canceled', 'past_due', 'unpaid'
    cancel_at_period_end BOOLEAN DEFAULT false,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One-time purchases (for bundles or lifetime access)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    price_id TEXT REFERENCES public.prices(id),
    bundle_id UUID REFERENCES public.bundles(id),
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Program access (who has access to what)
CREATE TABLE IF NOT EXISTS public.program_access (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    access_type TEXT NOT NULL, -- 'free', 'subscription', 'purchase', 'team'
    subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
    team_license_id UUID, -- Reference to team_subscriptions
    granted_by UUID REFERENCES public.profiles(id), -- Coach who granted access
    expires_at TIMESTAMPTZ, -- NULL = never expires (for purchases)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, program_id, access_type)
);

-- Team subscriptions (coaches buying for teams)
CREATE TABLE IF NOT EXISTS public.team_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    coach_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    max_players INTEGER NOT NULL DEFAULT 30,
    current_players INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, program_id)
);

-- Trial tracking
CREATE TABLE IF NOT EXISTS public.trial_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
    trial_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ NOT NULL,
    converted_to_paid BOOLEAN DEFAULT false,
    UNIQUE(user_id, program_id)
);

-- Payment history (for records)
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Stripe customers: users see only their own
CREATE POLICY "Users view own stripe customer" ON public.stripe_customers
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Products: everyone can view active products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (active = true);

-- Prices: everyone can view active prices
CREATE POLICY "Anyone can view active prices" ON public.prices
    FOR SELECT USING (active = true);

-- Program prices: everyone can view
CREATE POLICY "Anyone can view program prices" ON public.program_prices
    FOR SELECT USING (true);

-- Bundles: everyone can view active bundles
CREATE POLICY "Anyone can view active bundles" ON public.bundles
    FOR SELECT USING (is_active = true);

-- Bundle items: everyone can view
CREATE POLICY "Anyone can view bundle items" ON public.bundle_items
    FOR SELECT USING (true);

-- Subscriptions: users see only their own
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Purchases: users see only their own
CREATE POLICY "Users view own purchases" ON public.purchases
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Program access: users see their own, coaches see team access
CREATE POLICY "Users view own program access" ON public.program_access
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Coaches view team program access" ON public.program_access
    FOR SELECT TO authenticated
    USING (
        access_type = 'team' AND
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.coach_id = auth.uid()
            AND t.id IN (
                SELECT team_id FROM public.team_subscriptions ts
                WHERE ts.id = program_access.team_license_id
            )
        )
    );

-- Team subscriptions: coaches see their own
CREATE POLICY "Coaches view own team subscriptions" ON public.team_subscriptions
    FOR SELECT TO authenticated
    USING (coach_id = auth.uid());

CREATE POLICY "Coaches manage own team subscriptions" ON public.team_subscriptions
    FOR ALL TO authenticated
    USING (coach_id = auth.uid())
    WITH CHECK (coach_id = auth.uid());

-- Trial usage: users see their own
CREATE POLICY "Users view own trial usage" ON public.trial_usage
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users insert own trial" ON public.trial_usage
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Payment history: users see their own
CREATE POLICY "Users view own payment history" ON public.payment_history
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe ON public.stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_prices_product ON public.prices(product_id);
CREATE INDEX IF NOT EXISTS idx_program_prices_program ON public.program_prices(program_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_program_access_user ON public.program_access(user_id);
CREATE INDEX IF NOT EXISTS idx_program_access_program ON public.program_access(program_id);
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_team ON public.team_subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_subscriptions_coach ON public.team_subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_trial_usage_user ON public.trial_usage(user_id);

-- Function to check if user has access to program
CREATE OR REPLACE FUNCTION check_program_access(p_user_id UUID, p_program_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN := false;
    v_program_is_free BOOLEAN := false;
BEGIN
    -- Check if program is free
    SELECT NOT is_premium INTO v_program_is_free
    FROM public.programs
    WHERE id = p_program_id;
    
    IF v_program_is_free THEN
        RETURN true;
    END IF;
    
    -- Check direct access (subscription or purchase)
    SELECT EXISTS (
        SELECT 1 FROM public.program_access pa
        WHERE pa.user_id = p_user_id
        AND pa.program_id = p_program_id
        AND (pa.expires_at IS NULL OR pa.expires_at > NOW())
    ) INTO v_has_access;
    
    IF v_has_access THEN
        RETURN true;
    END IF;
    
    -- Check team access
    SELECT EXISTS (
        SELECT 1 FROM public.team_subscriptions ts
        JOIN public.team_members tm ON tm.team_id = ts.team_id
        WHERE tm.player_id = p_user_id
        AND ts.program_id = p_program_id
        AND ts.status = 'active'
        AND ts.current_period_end > NOW()
    ) INTO v_has_access;
    
    IF v_has_access THEN
        RETURN true;
    END IF;
    
    -- Check active trial
    SELECT EXISTS (
        SELECT 1 FROM public.trial_usage tu
        WHERE tu.user_id = p_user_id
        AND tu.program_id = p_program_id
        AND tu.trial_ends_at > NOW()
        AND tu.converted_to_paid = false
    ) INTO v_has_access;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start trial
CREATE OR REPLACE FUNCTION start_program_trial(p_user_id UUID, p_program_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_existing_trial RECORD;
    v_trial_days INTEGER := 7;
    v_result JSONB;
BEGIN
    -- Check if already had trial for this program
    SELECT * INTO v_existing_trial
    FROM public.trial_usage
    WHERE user_id = p_user_id AND program_id = p_program_id;
    
    IF v_existing_trial IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Trial already used for this program'
        );
    END IF;
    
    -- Check if already has access
    IF check_program_access(p_user_id, p_program_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Already has access to this program'
        );
    END IF;
    
    -- Start trial
    INSERT INTO public.trial_usage (user_id, program_id, trial_started_at, trial_ends_at)
    VALUES (p_user_id, p_program_id, NOW(), NOW() + (v_trial_days || ' days')::INTERVAL);
    
    -- Grant temporary access
    INSERT INTO public.program_access (user_id, program_id, access_type, expires_at)
    VALUES (p_user_id, p_program_id, 'trial', NOW() + (v_trial_days || ' days')::INTERVAL);
    
    RETURN jsonb_build_object(
        'success', true,
        'trial_ends_at', NOW() + (v_trial_days || ' days')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant team access to player
CREATE OR REPLACE FUNCTION grant_team_program_access(
    p_coach_id UUID,
    p_player_id UUID,
    p_team_subscription_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_team_sub RECORD;
BEGIN
    -- Get team subscription
    SELECT * INTO v_team_sub
    FROM public.team_subscriptions
    WHERE id = p_team_subscription_id AND coach_id = p_coach_id;
    
    IF v_team_sub IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Team subscription not found');
    END IF;
    
    IF v_team_sub.status != 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Subscription is not active');
    END IF;
    
    IF v_team_sub.current_players >= v_team_sub.max_players THEN
        RETURN jsonb_build_object('success', false, 'error', 'Maximum players reached');
    END IF;
    
    -- Grant access
    INSERT INTO public.program_access (
        user_id, program_id, access_type, team_license_id, granted_by, expires_at
    )
    VALUES (
        p_player_id, v_team_sub.program_id, 'team', p_team_subscription_id, p_coach_id, v_team_sub.current_period_end
    )
    ON CONFLICT (user_id, program_id, access_type) DO UPDATE SET
        expires_at = v_team_sub.current_period_end;
    
    -- Update player count
    UPDATE public.team_subscriptions
    SET current_players = current_players + 1
    WHERE id = p_team_subscription_id;
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscriptions summary
CREATE OR REPLACE FUNCTION get_user_subscriptions_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'active_subscriptions', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'id', s.id,
                'program_id', pp.program_id,
                'status', s.status,
                'current_period_end', s.current_period_end,
                'cancel_at_period_end', s.cancel_at_period_end
            )), '[]'::jsonb)
            FROM public.subscriptions s
            JOIN public.prices pr ON pr.id = s.price_id
            JOIN public.program_prices pp ON pp.price_id = pr.id
            WHERE s.user_id = p_user_id
            AND s.status IN ('active', 'trialing')
        ),
        'active_trials', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'program_id', tu.program_id,
                'trial_ends_at', tu.trial_ends_at
            )), '[]'::jsonb)
            FROM public.trial_usage tu
            WHERE tu.user_id = p_user_id
            AND tu.trial_ends_at > NOW()
            AND tu.converted_to_paid = false
        ),
        'purchases', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'id', p.id,
                'bundle_id', p.bundle_id,
                'created_at', p.created_at
            )), '[]'::jsonb)
            FROM public.purchases p
            WHERE p.user_id = p_user_id
            AND p.status = 'completed'
        ),
        'team_access', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'program_id', pa.program_id,
                'expires_at', pa.expires_at,
                'granted_by', pa.granted_by
            )), '[]'::jsonb)
            FROM public.program_access pa
            WHERE pa.user_id = p_user_id
            AND pa.access_type = 'team'
            AND (pa.expires_at IS NULL OR pa.expires_at > NOW())
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Subscriptions tables created successfully' as status;

