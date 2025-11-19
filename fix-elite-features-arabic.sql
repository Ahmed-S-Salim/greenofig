-- Fix Arabic translations for Elite tier features
-- Run this in Supabase Dashboard > SQL Editor

-- Update Doctor Consultations feature
UPDATE features
SET
  name_ar = 'استشارات الأطباء',
  description_ar = 'جدولة استشارات افتراضية مع أطباء مرخصين للمخاوف الصحية والمشورة الطبية.'
WHERE name ILIKE '%Doctor%' AND name ILIKE '%Consultation%';

-- Update Appointment Scheduling feature
UPDATE features
SET
  name_ar = 'جدولة المواعيد',
  description_ar = 'حجز المواعيد مع متخصصي الصحة مباشرة من خلال المنصة مع التكامل مع التقويم.'
WHERE name ILIKE '%Appointment%' AND name ILIKE '%Scheduling%';

-- Verify the updates
SELECT
  name,
  name_ar,
  SUBSTRING(description, 1, 50) as description_short,
  SUBSTRING(description_ar, 1, 50) as description_ar_short,
  tier_requirement
FROM features
WHERE name ILIKE '%Doctor%' OR name ILIKE '%Appointment%'
ORDER BY tier_requirement, name;
