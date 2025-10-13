-- Location: supabase/migrations/20250113200000_update_subscription_plans.sql
-- Schema Analysis: Existing subscription system with subscription_plans table
-- Integration Type: MODIFICATIVE - Update existing plans and add new Elite plan
-- Dependencies: Existing subscription_plans, user_profiles, payment_transactions tables

-- Update existing subscription plans with correct pricing
UPDATE public.subscription_plans 
SET 
    name = 'Premium',
    description = 'Essential health features with AI nutrition analysis and basic workouts for beginners.',
    price_monthly = 9.99,
    price_yearly = 99.99,
    features = '[
        "AI nutrition analysis", 
        "Basic workout tracking", 
        "Essential meal planning", 
        "Basic health insights", 
        "Community access",
        "Email support"
    ]'::jsonb,
    limits = '{
        "ai_scans": 50,
        "meal_plans": 15,
        "workouts": 10,
        "device_connections": 2,
        "storage_gb": 5
    }'::jsonb,
    display_order = 2,
    is_popular = false
WHERE name = 'Premium';

-- Add new Pro plan (rename existing Premium to Pro)
INSERT INTO public.subscription_plans (
    name, 
    description, 
    price_monthly, 
    price_yearly,
    features,
    limits,
    display_order,
    is_popular,
    is_active
) VALUES (
    'Pro',
    'Advanced features with unlimited meal plans and comprehensive analytics for serious fitness enthusiasts.',
    19.99,
    199.99,
    '[
        "Unlimited AI nutrition analysis",
        "Advanced workout programs", 
        "Unlimited meal plans",
        "Detailed health analytics",
        "Progress photo tracking",
        "Device integrations",
        "Priority support",
        "Custom workout creation"
    ]'::jsonb,
    '{
        "ai_scans": -1,
        "meal_plans": -1,
        "workouts": -1,
        "device_connections": 5,
        "storage_gb": 50
    }'::jsonb,
    3,
    true,
    true
);

-- Add new Elite plan
INSERT INTO public.subscription_plans (
    name, 
    description, 
    price_monthly, 
    price_yearly,
    features,
    limits,
    display_order,
    is_popular,
    is_active
) VALUES (
    'Elite',
    'Premium tier with personal coaching and exclusive content for professional athletes and fitness experts.',
    29.99,
    299.99,
    '[
        "Everything in Pro",
        "Personal AI health coach",
        "1-on-1 virtual consultations", 
        "Premium workout library",
        "Personalized nutrition coaching",
        "Advanced biometric tracking",
        "Health data export",
        "24/7 priority support",
        "Exclusive content access",
        "Custom meal prep plans"
    ]'::jsonb,
    '{
        "ai_scans": -1,
        "meal_plans": -1,
        "workouts": -1,
        "device_connections": -1,
        "storage_gb": 100,
        "consultations_monthly": 4,
        "custom_plans": -1
    }'::jsonb,
    4,
    false,
    true
);