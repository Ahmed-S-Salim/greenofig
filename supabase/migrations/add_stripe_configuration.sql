-- =====================================================
-- STRIPE INTEGRATION SETUP
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Create payment_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert Stripe publishable key
INSERT INTO payment_settings (provider, public_key, is_active)
VALUES ('stripe', 'pk_test_51SHrlbPPAckGFnuTvYujWq9sz4oO2cpWTlSRURA62g3MDIcqSx8wBV65fL5hP7hmaWylbAlY8CjZl5yirP27JzKg00OkbSgYy8', true)
ON CONFLICT (provider)
DO UPDATE SET
  public_key = EXCLUDED.public_key,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 3. Add stripe_customer_id to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id
ON user_profiles(stripe_customer_id);

-- 5. Verify payment_transactions table exists
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  amount DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  payment_intent_id TEXT,
  payment_method TEXT DEFAULT 'stripe',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')) DEFAULT 'pending',
  currency TEXT DEFAULT 'USD',
  stripe_customer_id TEXT,
  failure_code TEXT,
  failure_message TEXT,
  is_refunded BOOLEAN DEFAULT false,
  refunded_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create index on payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- 7. Verify user_subscriptions table exists
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'past_due', 'canceled', 'paused', 'trialing')) DEFAULT 'active',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  cancellation_feedback TEXT,
  pause_reason TEXT,
  paused_at TIMESTAMP WITH TIME ZONE,
  resume_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create indexes on user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_sub_id ON user_subscriptions(stripe_subscription_id);

-- 9. Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  billing_details JSONB,
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes on payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

-- 11. Create refunds table if it doesn't exist
CREATE TABLE IF NOT EXISTS refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_transaction_id UUID REFERENCES payment_transactions(id),
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  refund_type TEXT CHECK (refund_type IN ('full', 'partial')) DEFAULT 'full',
  customer_notes TEXT,
  admin_notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'completed')) DEFAULT 'pending',
  stripe_refund_id TEXT,
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create indexes on refunds
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- 13. Create subscription_changes table for upgrades/downgrades
CREATE TABLE IF NOT EXISTS subscription_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  change_type TEXT CHECK (change_type IN ('upgrade', 'downgrade')) NOT NULL,
  old_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  old_billing_cycle TEXT,
  new_billing_cycle TEXT,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2),
  proration_amount DECIMAL(10, 2) DEFAULT 0,
  effective_date TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  change_reason TEXT,
  initiated_by UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'completed', 'canceled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Create indexes on subscription_changes
CREATE INDEX IF NOT EXISTS idx_subscription_changes_user_id ON subscription_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_status ON subscription_changes(status);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if payment_settings was created successfully
SELECT * FROM payment_settings WHERE provider = 'stripe';

-- Check if stripe_customer_id column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'stripe_customer_id';

-- Verify all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'payment_settings',
  'payment_transactions',
  'user_subscriptions',
  'payment_methods',
  'refunds',
  'subscription_changes'
)
ORDER BY table_name;
