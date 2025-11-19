-- Check for Ultimate tier features in the database
SELECT
  name,
  description,
  category,
  plan_tier,
  is_active,
  display_order
FROM features
WHERE LOWER(plan_tier) = 'ultimate'
ORDER BY display_order;

-- Check all unique plan tiers in the database
SELECT DISTINCT plan_tier, COUNT(*) as feature_count
FROM features
WHERE is_active = true
GROUP BY plan_tier
ORDER BY plan_tier;

-- Show all features with their plan tiers
SELECT
  plan_tier,
  name,
  category
FROM features
WHERE is_active = true
ORDER BY
  CASE plan_tier
    WHEN 'Basic' THEN 1
    WHEN 'Premium' THEN 2
    WHEN 'Pro' THEN 3
    WHEN 'Ultimate' THEN 4
    WHEN 'Elite' THEN 5
    ELSE 6
  END,
  display_order;
