-- =====================================================
-- FIX: Update "Pro" tier to "Ultimate" tier
-- The database has "Pro" but the app uses "Ultimate"
-- =====================================================

-- 1. Update all "Pro" tier features to "Ultimate"
UPDATE features
SET
  plan_tier = 'Ultimate',
  updated_at = NOW()
WHERE LOWER(plan_tier) = 'pro';

-- 2. Verify the change
SELECT
  plan_tier,
  COUNT(*) as feature_count
FROM features
WHERE is_active = true
GROUP BY plan_tier
ORDER BY
  CASE plan_tier
    WHEN 'Basic' THEN 1
    WHEN 'Premium' THEN 2
    WHEN 'Ultimate' THEN 3
    WHEN 'Elite' THEN 4
    ELSE 5
  END;

-- 3. Show all Ultimate features
SELECT
  name,
  description,
  category,
  plan_tier,
  display_order
FROM features
WHERE plan_tier = 'Ultimate'
ORDER BY display_order;
