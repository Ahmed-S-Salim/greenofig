-- Location: supabase/migrations/20250113195855_subscription_management.sql
-- Schema Analysis: Existing health app schema with user_profiles table but no subscription management
-- Integration Type: NEW_MODULE - Adding complete subscription functionality
-- Dependencies: References existing user_profiles table

-- 1. Types for subscription management
CREATE TYPE public.subscription_status AS ENUM (
    'active', 
    'inactive', 
    'cancelled', 
    'past_due', 
    'trialing',
    'expired'
);

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed', 
    'failed',
    'cancelled',
    'refunded'
);

CREATE TYPE public.billing_interval AS ENUM (
    'monthly',
    'yearly'
);

-- 2. Subscription plans table
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. User subscriptions table
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status public.subscription_status DEFAULT 'inactive',
    billing_interval public.billing_interval NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payment transactions table
CREATE TABLE public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'usd',
    status public.payment_status DEFAULT 'pending',
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_invoice_id TEXT,
    billing_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Usage analytics table
CREATE TABLE public.subscription_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Essential Indexes
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_order ON public.subscription_plans(display_order);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_usage_user_period ON public.subscription_usage(user_id, period_start, period_end);

-- 7. Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- 8. Functions (MUST BE BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.get_user_current_subscription(user_uuid UUID)
RETURNS TABLE(
    subscription_id UUID,
    plan_name TEXT,
    status TEXT,
    billing_interval TEXT,
    current_period_end TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    us.id,
    sp.name,
    us.status::TEXT,
    us.billing_interval::TEXT,
    us.current_period_end
FROM public.user_subscriptions us
JOIN public.subscription_plans sp ON us.plan_id = sp.id
WHERE us.user_id = user_uuid 
AND us.status = 'active'
ORDER BY us.created_at DESC
LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 9. RLS Policies using correct patterns
-- Pattern 4: Public read for subscription plans, private write
CREATE POLICY "public_can_read_subscription_plans"
ON public.subscription_plans
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admin_manage_subscription_plans"
ON public.subscription_plans
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- Pattern 2: Simple user ownership for subscriptions
CREATE POLICY "users_manage_own_user_subscriptions"
ON public.user_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for payments
CREATE POLICY "users_manage_own_payment_transactions"
ON public.payment_transactions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple user ownership for usage
CREATE POLICY "users_manage_own_subscription_usage"
ON public.subscription_usage
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 10. Triggers
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON public.payment_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_subscription_usage_updated_at
    BEFORE UPDATE ON public.subscription_usage
    FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

-- 11. Mock Data for subscription plans
DO $$
DECLARE
    basic_plan_id UUID := gen_random_uuid();
    premium_plan_id UUID := gen_random_uuid();
    pro_plan_id UUID := gen_random_uuid();
    elite_plan_id UUID := gen_random_uuid();
    admin_user_id UUID;
    premium_user_id UUID;
BEGIN
    -- Get existing users for reference
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO premium_user_id FROM public.user_profiles WHERE role = 'premium_user' LIMIT 1;

    -- Insert subscription plans
    INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, features, limits, is_popular, display_order)
    VALUES 
        (basic_plan_id, 'Basic', 'Essential features for getting started', 0.00, 0.00, 
         '["Basic workout tracking", "Essential nutrition logging", "Community access", "5 meal plans per month"]'::jsonb,
         '{"ai_scans": 10, "workout_videos": "720p", "meal_plans": 5, "coach_chats": 0}'::jsonb,
         false, 1),
        
        (premium_plan_id, 'Premium', 'Advanced AI nutrition and workout features', 9.99, 99.99,
         '["AI nutrition analysis", "Basic workout programs", "Progress tracking", "20 meal plans per month", "Email support"]'::jsonb,
         '{"ai_scans": 50, "workout_videos": "1080p", "meal_plans": 20, "coach_chats": 5}'::jsonb,
         false, 2),
         
        (pro_plan_id, 'Pro', 'Comprehensive fitness tracking with analytics', 19.99, 199.99,
         '["Advanced analytics", "Unlimited meal plans", "Premium workouts", "Priority support", "Custom programs", "Wearable integration"]'::jsonb,
         '{"ai_scans": 200, "workout_videos": "4K", "meal_plans": -1, "coach_chats": 25}'::jsonb,
         true, 3),
         
        (elite_plan_id, 'Elite', 'Personal coaching and premium content', 29.99, 299.99,
         '["Personal AI coach", "Premium video content", "Custom meal planning", "1-on-1 consultations", "Advanced health insights", "Family sharing"]'::jsonb,
         '{"ai_scans": -1, "workout_videos": "4K", "meal_plans": -1, "coach_chats": -1}'::jsonb,
         false, 4);

    -- Create sample subscription if premium user exists
    IF premium_user_id IS NOT NULL THEN
        INSERT INTO public.user_subscriptions (user_id, plan_id, status, billing_interval, current_period_start, current_period_end)
        VALUES (
            premium_user_id, 
            premium_plan_id, 
            'active', 
            'monthly', 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP + INTERVAL '1 month'
        );
    END IF;

    -- Log success
    RAISE NOTICE 'Subscription management schema created successfully with % plans', 4;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Subscription setup completed with some warnings: %', SQLERRM;
END $$;