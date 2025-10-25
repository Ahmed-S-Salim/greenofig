-- Update yearly pricing with 25% discount for all subscription plans

-- Premium: $9.99/month × 12 = $119.88 → 25% off = $89.91
UPDATE subscription_plans
SET price_yearly = 89.91
WHERE name = 'Premium';

-- Ultimate: $19.99/month × 12 = $239.88 → 25% off = $179.91
UPDATE subscription_plans
SET price_yearly = 179.91
WHERE name = 'Ultimate';

-- Elite: $29.99/month × 12 = $359.88 → 25% off = $269.91
UPDATE subscription_plans
SET price_yearly = 269.91
WHERE name = 'Elite';

-- Base plan stays at 0 (free)
UPDATE subscription_plans
SET price_yearly = 0.00
WHERE name = 'Base';
