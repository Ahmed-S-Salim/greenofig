-- =====================================================
-- UPDATE ELITE PLAN FEATURES IN SUPABASE
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. UPDATE subscription_plans table - Elite plan features array
UPDATE subscription_plans
SET features = '[
  "All Ultimate Features",
  "Photo Food Recognition & Logging",
  "Unlimited Video Coaching",
  "Schedule virtual consultations with licensed doctors for health concerns and medical advice (2/month)",
  "Book appointments with health professionals directly through the platform",
  "Priority 24/7 Support",
  "Personalized Supplement Plan",
  "VIP Community Access",
  "Concierge Service"
]'::jsonb,
updated_at = NOW()
WHERE name = 'Elite';


-- 2. UPDATE features table - Doctor Consultations description
UPDATE features
SET
  description = 'Schedule virtual consultations with licensed doctors for health concerns and medical advice (2 per month)',
  updated_at = NOW()
WHERE name = 'Doctor Consultations';


-- 3. INSERT new Appointment Scheduling feature (if it doesn't exist)
INSERT INTO features (
  name,
  description,
  category,
  category_icon,
  feature_icon,
  plan_tier,
  is_active,
  display_order
)
VALUES (
  'Appointment Scheduling',
  'Book appointments with health professionals directly through the platform with calendar integration and reminders',
  'Professional Support',
  'Users',
  'Calendar',
  'Elite',
  true,
  42
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  category_icon = EXCLUDED.category_icon,
  feature_icon = EXCLUDED.feature_icon,
  plan_tier = EXCLUDED.plan_tier,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();


-- =====================================================
-- ADD ARABIC TRANSLATIONS (if arabic columns exist)
-- =====================================================

-- Check if arabic columns exist first
DO $$
BEGIN
  -- Update features table with Arabic translations
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'features' AND column_name = 'name_ar'
  ) THEN

    -- Update Doctor Consultations Arabic
    UPDATE features
    SET
      name_ar = 'استشارات طبية',
      description_ar = 'جدولة استشارات افتراضية مع أطباء مرخصين للمخاوف الصحية والمشورة الطبية (2 شهرياً)',
      category_ar = 'الدعم المهني'
    WHERE name = 'Doctor Consultations';

    -- Update Appointment Scheduling Arabic
    UPDATE features
    SET
      name_ar = 'جدولة المواعيد',
      description_ar = 'حجز المواعيد مع متخصصي الصحة مباشرة من خلال المنصة مع التكامل مع التقويم والتذكيرات',
      category_ar = 'الدعم المهني'
    WHERE name = 'Appointment Scheduling';

    RAISE NOTICE 'Arabic translations updated successfully';
  ELSE
    RAISE NOTICE 'Arabic columns do not exist - skipping Arabic translations';
  END IF;
END $$;


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify Elite plan features
SELECT name, features, updated_at
FROM subscription_plans
WHERE name = 'Elite';

-- Verify Doctor Consultations feature
SELECT name, description, plan_tier, is_active
FROM features
WHERE name = 'Doctor Consultations';

-- Verify Appointment Scheduling feature
SELECT name, description, plan_tier, is_active
FROM features
WHERE name = 'Appointment Scheduling';

-- Show all Elite tier features
SELECT name, description, category, display_order
FROM features
WHERE plan_tier = 'Elite'
ORDER BY display_order;
