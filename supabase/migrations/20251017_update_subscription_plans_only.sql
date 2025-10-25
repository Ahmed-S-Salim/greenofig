-- Delete all existing plans first to ensure clean state
DELETE FROM subscription_plans;

-- Insert the 4 main subscription plans with ACTUAL features

-- BASE PLAN (Free/Starter)
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, is_popular, is_active)
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
);

-- PREMIUM PLAN
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, is_popular, is_active)
VALUES (
  'Premium',
  'Advanced features for serious fitness enthusiasts',
  9.99,
  99.00,
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
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, is_popular, is_active)
VALUES (
  'Ultimate',
  'Complete transformation with personalized coaching',
  19.99,
  199.00,
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
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, is_popular, is_active)
VALUES (
  'Elite',
  'The ultimate package with premium medical support',
  29.99,
  299.00,
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
