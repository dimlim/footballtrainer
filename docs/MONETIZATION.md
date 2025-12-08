# 💰 Monetization System - Football Trainer Pro

## Overview

Система монетизації підтримує три типи доступу:

1. **Безкоштовні програми** - доступні всім користувачам
2. **Тренерські ліцензії** - підписка на місяць для команди до 30 гравців
3. **Індивідуальні підписки** - для окремих користувачів з 7-денним trial

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  PricingPage          - Сторінка з планами підписки             │
│  SubscriptionManager  - Компонент управління підпискою          │
│  ProgramPricing       - Ціни для конкретної програми            │
│  subscriptionStore    - Zustand store для стану підписок        │
│  stripe.ts           - Stripe клієнт та API функції             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS                       │
├─────────────────────────────────────────────────────────────────┤
│  create-checkout       - Створення Stripe Checkout Session      │
│  create-portal-session - Stripe Customer Portal                 │
│  stripe-webhook        - Обробка Stripe webhooks                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STRIPE                                    │
├─────────────────────────────────────────────────────────────────┤
│  Products & Prices     - Продукти та ціни                       │
│  Subscriptions         - Управління підписками                  │
│  Customer Portal       - Портал для клієнтів                    │
│  Webhooks             - Сповіщення про події                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│  products              - Продукти з цінами                      │
│  subscription_plans    - Плани підписки                         │
│  user_subscriptions    - Підписки користувачів                  │
│  team_subscriptions    - Командні підписки                      │
│  program_purchases     - Разові покупки                         │
│  payment_history       - Історія платежів                       │
│  promo_codes          - Промокоди                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Products Table
```sql
products (
  id UUID PRIMARY KEY,
  name_uk TEXT,
  name_en TEXT,
  name_cs TEXT,
  description_uk TEXT,
  product_type ENUM('program', 'bundle', 'subscription_plan'),
  program_id UUID REFERENCES programs(id),
  price_usd DECIMAL,
  price_eur DECIMAL,
  price_czk DECIMAL,
  license_type ENUM('individual', 'team'),
  max_users INTEGER DEFAULT 1,
  billing_period ENUM('monthly', 'yearly', 'lifetime'),
  trial_days INTEGER DEFAULT 0,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN,
  is_featured BOOLEAN
)
```

### Subscription Plans Table
```sql
subscription_plans (
  id UUID PRIMARY KEY,
  name_uk TEXT,
  name_en TEXT,
  name_cs TEXT,
  license_type ENUM('individual', 'team'),
  max_users INTEGER DEFAULT 1,
  price_monthly_usd DECIMAL,
  price_yearly_usd DECIMAL,
  includes_all_programs BOOLEAN,
  included_programs UUID[],
  max_teams INTEGER DEFAULT 1,
  trial_days INTEGER DEFAULT 7,
  stripe_product_id TEXT,
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT
)
```

### User Subscriptions Table
```sql
user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  product_id UUID REFERENCES products(id),
  stripe_subscription_id TEXT,
  status TEXT, -- active, canceled, past_due, trialing, paused
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  billing_period ENUM('monthly', 'yearly', 'lifetime')
)
```

### Team Subscriptions Table
```sql
team_subscriptions (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  coach_id UUID REFERENCES profiles(id),
  program_id UUID REFERENCES programs(id),
  product_id UUID REFERENCES products(id),
  stripe_subscription_id TEXT,
  status TEXT,
  max_players INTEGER DEFAULT 30,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ
)
```

---

## 🔧 Stripe Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account and verify business
3. Get API keys from Dashboard > Developers > API keys

### 2. Environment Variables

Add to `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

Add to Supabase Edge Function secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Create Products in Stripe

#### Individual Plan (Pro Player)
```json
{
  "name": "Pro Player",
  "description": "Access to all premium programs",
  "prices": [
    { "unit_amount": 999, "currency": "usd", "recurring": { "interval": "month" } },
    { "unit_amount": 7999, "currency": "usd", "recurring": { "interval": "year" } }
  ]
}
```

#### Team Plan (Coach Basic)
```json
{
  "name": "Coach Basic",
  "description": "For team up to 30 players",
  "prices": [
    { "unit_amount": 2999, "currency": "usd", "recurring": { "interval": "month" } },
    { "unit_amount": 24999, "currency": "usd", "recurring": { "interval": "year" } }
  ]
}
```

#### Team Plan (Coach Pro)
```json
{
  "name": "Coach Pro",
  "description": "All programs for team up to 30 players",
  "prices": [
    { "unit_amount": 4999, "currency": "usd", "recurring": { "interval": "month" } },
    { "unit_amount": 39999, "currency": "usd", "recurring": { "interval": "year" } }
  ]
}
```

### 4. Configure Webhooks

In Stripe Dashboard > Developers > Webhooks:

1. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
2. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

### 5. Configure Customer Portal

In Stripe Dashboard > Settings > Customer portal:

1. Enable portal
2. Configure features:
   - ✅ Update subscription
   - ✅ Cancel subscription
   - ✅ Update payment method
   - ✅ View invoices

---

## 💳 Pricing Structure

### Individual Plans

| Plan | Monthly | Yearly | Trial |
|------|---------|--------|-------|
| Pro Player | $9.99 | $79.99 (33% off) | 7 days |

### Team Plans

| Plan | Monthly | Yearly | Players | Trial |
|------|---------|--------|---------|-------|
| Coach Basic | $29.99 | $249.99 | 30 | 7 days |
| Coach Pro | $49.99 | $399.99 | 30 | 7 days |

### Program Prices (One-time)

| Program | Individual | Team (30 players) |
|---------|------------|-------------------|
| Explosiveness 30 | $9.99 | $49.99/month |
| Technique Pro | $14.99 | $49.99/month |

---

## 🔐 Access Control

### Check Program Access

```typescript
// In component
const { checkProgramAccess, hasProgramAccess } = useSubscriptionStore();

// Check access
const access = await checkProgramAccess(userId, programId);
// Returns: { has_access: true, access_type: 'subscription', access_until: '2024-12-31' }

// Quick check
if (hasProgramAccess(programId)) {
  // Show program content
} else {
  // Show pricing
}
```

### Access Types

- `free` - Free program, no payment needed
- `purchased` - One-time purchase
- `subscription` - Active subscription
- `team` - Access through team subscription
- `none` - No access

---

## 🎁 Trial Period

### Flow

1. User clicks "Start Free Trial"
2. Check if user already used trial (`can_start_trial` function)
3. Create Stripe subscription with trial period
4. User gets access immediately
5. After trial ends:
   - If payment method added → auto-charge
   - If no payment method → subscription canceled

### Database Tracking

```sql
trial_history (
  user_id UUID,
  product_id UUID,
  subscription_plan_id UUID,
  trial_started_at TIMESTAMPTZ,
  trial_ended_at TIMESTAMPTZ,
  converted_to_paid BOOLEAN
)
```

---

## 🏷️ Promo Codes

### Create Promo Code

```sql
INSERT INTO promo_codes (
  code, 
  discount_type, 
  discount_value,
  max_uses,
  valid_until
) VALUES (
  'LAUNCH2024',
  'percent',
  20,
  100,
  '2024-12-31'
);
```

### Discount Types

- `percent` - Percentage discount (e.g., 20% off)
- `fixed` - Fixed amount (e.g., $5 off)

---

## 📱 Frontend Components

### PricingPage
Main pricing page showing all plans.

```tsx
<PricingPage />
// Route: /app/pricing
```

### SubscriptionManager
Widget for profile page to manage subscription.

```tsx
<SubscriptionManager />
```

### ProgramPricing
Show pricing for specific program.

```tsx
<ProgramPricing 
  programId="xxx" 
  programName="Explosiveness 30" 
/>
```

---

## 🔄 Webhook Events

### checkout.session.completed
- Create subscription record in database
- Record trial usage if applicable

### customer.subscription.updated
- Update subscription status
- Update period dates
- Track cancellation

### customer.subscription.deleted
- Mark subscription as canceled
- User keeps access until period end

### invoice.paid
- Record payment in history
- Update subscription period

### invoice.payment_failed
- Mark subscription as past_due
- Send notification to user

---

## 🚀 Deployment

### 1. Deploy Edge Functions

```bash
cd football-trainer-app
supabase functions deploy create-checkout
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
```

### 2. Set Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Run Database Migration

```sql
-- Run in Supabase SQL Editor
-- Content of supabase/monetization.sql
```

### 4. Sync Stripe Products

After creating products in Stripe, update database:

```sql
UPDATE subscription_plans 
SET stripe_product_id = 'prod_xxx',
    stripe_price_monthly_id = 'price_xxx',
    stripe_price_yearly_id = 'price_yyy'
WHERE id = 'plan-uuid';
```

---

## 📊 Analytics Events

```typescript
// Track subscription events
trackEvent('subscription_started', { plan: 'pro_player', billing: 'monthly' });
trackEvent('trial_started', { plan: 'pro_player' });
trackEvent('subscription_canceled', { plan: 'pro_player', reason: 'user_canceled' });
trackEvent('payment_failed', { plan: 'pro_player' });
```

---

## 🔍 Troubleshooting

### Subscription not showing
1. Check `user_subscriptions` table
2. Verify Stripe webhook received
3. Check Edge Function logs

### Payment failed
1. Check Stripe Dashboard for error
2. Verify payment method is valid
3. Check `payment_history` for details

### Trial not starting
1. Check `trial_history` for existing trial
2. Verify `can_start_trial` function
3. Check product has `trial_days > 0`

---

## 📚 Related Files

- `supabase/monetization.sql` - Database schema
- `src/lib/stripe.ts` - Stripe client
- `src/stores/subscriptionStore.ts` - State management
- `src/pages/PricingPage.tsx` - Pricing UI
- `src/components/subscription/*` - Subscription components
- `supabase/functions/create-checkout/` - Checkout function
- `supabase/functions/stripe-webhook/` - Webhook handler

