-- Quick check to see column names in the 5 tables
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('meal_plans_v2', 'client_milestones', 'consultation_templates', 'client_checkins', 'shopping_lists')
ORDER BY table_name, ordinal_position;
