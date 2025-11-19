-- Update Doctor Consultations feature with Arabic translation
UPDATE features 
SET 
  name_ar = 'استشارات الأطباء',
  description_ar = 'جدولة استشارات افتراضية مع أطباء مرخصين للمخاوف الصحية والمشورة الطبية.'
WHERE name LIKE '%Doctor Consultation%' OR name LIKE '%Doctor consultation%';

-- Update Appointment Scheduling feature with Arabic translation  
UPDATE features
SET
  name_ar = 'جدولة المواعيد',
  description_ar = 'حجز المواعيد مع متخصصي الصحة مباشرة من خلال المنصة مع التكامل مع التقويم.'
WHERE name LIKE '%Appointment Scheduling%' OR name LIKE '%Appointment scheduling%';

-- Verify updates
SELECT name, name_ar, description, description_ar, tier_requirement 
FROM features 
WHERE name_ar IN ('استشارات الأطباء', 'جدولة المواعيد');
