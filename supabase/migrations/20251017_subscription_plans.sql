-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_annual DECIMAL(10, 2),
  features JSONB NOT NULL DEFAULT '[]',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view active subscription plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policy: Admins can manage subscription plans
CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Delete all existing plans first to ensure clean state
DELETE FROM subscription_plans;

-- Insert the 4 main subscription plans with ACTUAL features

-- BASE PLAN (Free/Starter)
INSERT INTO subscription_plans (name, description, price_monthly, price_annual, features, is_popular, is_active)
VALUES (
  'Base',
  'Perfect for getting started with your fitness journey',
  0.00,
  0.00,
  '[
    "AI Personalized Plan",
    "Basic Progress Tracking",
    "Community Access",
    "Smart Meal Logging",
    "Workout Library & Planner",
    "Adaptive Goal Setting",
    "Lifestyle Habit Coaching",
    "Recipe & Meal Suggestions"
  ]'::jsonb,
  false,
  true
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  features = EXCLUDED.features,
  is_popular = EXCLUDED.is_popular;

-- PREMIUM PLAN
INSERT INTO subscription_plans (name, description, price_monthly, price_annual, features, is_popular, is_active)
VALUES (
  'Premium',
  'Advanced features for serious fitness enthusiasts',
  19.99,
  199.00,
  '[
    "All Base Features",
    "Macronutrient Tracking",
    "Wearable Device Sync",
    "Custom Workout Builder",
    "Advanced Analytics",
    "Weekly & Monthly Reports",
    "Priority Nutritionist Chat",
    "Sleep Cycle Analysis",
    "Grocery List Generator"
  ]'::jsonb,
  true,
  true
);

-- ULTIMATE PLAN
INSERT INTO subscription_plans (name, description, price_monthly, price_annual, features, is_popular, is_active)
VALUES (
  'Ultimate',
  'Complete transformation with personalized coaching',
  39.99,
  399.00,
  '[
    "All Premium Features",
    "Real-time Form Feedback",
    "Biomarker Integration",
    "1-on-1 Video Coaching (2/month)",
    "Exclusive Challenges",
    "Custom Meal Plans",
    "Performance Optimization",
    "Advanced Body Composition Analysis"
  ]'::jsonb,
  false,
  true
);

-- ELITE PLAN
INSERT INTO subscription_plans (name, description, price_monthly, price_annual, features, is_popular, is_active)
VALUES (
  'Elite',
  'The ultimate package with premium medical support',
  79.99,
  799.00,
  '[
    "All Ultimate Features",
    "Photo Food Recognition",
    "Priority Support (24/7)",
    "Doctor Consultations (2/month)",
    "Unlimited Video Coaching",
    "Personalized Supplement Plan",
    "VIP Community Access",
    "Concierge Service"
  ]'::jsonb,
  false,
  true
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
