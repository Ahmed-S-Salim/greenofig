-- Set Ultimate as the most popular plan everywhere

-- First, set all plans to NOT popular
UPDATE subscription_plans
SET is_popular = false;

-- Then set ONLY Ultimate as popular
UPDATE subscription_plans
SET is_popular = true
WHERE name = 'Ultimate';

-- Verify the changes
SELECT id, name, is_popular, price_monthly
FROM subscription_plans
ORDER BY price_monthly ASC;
