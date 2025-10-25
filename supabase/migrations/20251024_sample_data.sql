-- Sample Data for Testing Nutritionist Dashboard
-- Run this AFTER running the main migration (20251020_nutritionist_enhancements_clean.sql)

-- NOTE: Replace 'YOUR_NUTRITIONIST_ID' with your actual user ID from user_profiles table
-- To find your ID: SELECT id, email FROM user_profiles WHERE email = 'your-email@example.com';

-- Sample Recipes
INSERT INTO recipes (nutritionist_id, name, description, category, servings, prep_time_minutes, cook_time_minutes, calories_per_serving, protein_g, carbs_g, fat_g, fiber_g, tags, is_public, ingredients, instructions)
VALUES
  -- Breakfast Recipes
  ('YOUR_NUTRITIONIST_ID', 'Protein Pancakes', 'Fluffy high-protein pancakes with banana', 'breakfast', 2, 5, 10, 320, 25, 38, 8, 4, ARRAY['high-protein', 'vegetarian'], true,
   '[{"name":"oat flour","amount":"1","unit":"cup"},{"name":"protein powder","amount":"1","unit":"scoop"},{"name":"banana","amount":"1","unit":"whole"},{"name":"eggs","amount":"2","unit":"whole"},{"name":"milk","amount":"0.5","unit":"cup"}]'::jsonb,
   ARRAY['Mix dry ingredients', 'Blend wet ingredients', 'Combine and mix until smooth', 'Cook on medium heat for 2-3 minutes per side', 'Serve with fresh berries']
  ),
  ('YOUR_NUTRITIONIST_ID', 'Avocado Toast Bowl', 'Whole grain toast with smashed avocado and poached eggs', 'breakfast', 1, 5, 10, 380, 18, 42, 16, 9, ARRAY['vegetarian', 'high-fiber'], true,
   '[{"name":"whole grain bread","amount":"2","unit":"slices"},{"name":"avocado","amount":"1","unit":"whole"},{"name":"eggs","amount":"2","unit":"whole"},{"name":"cherry tomatoes","amount":"5","unit":"whole"},{"name":"feta cheese","amount":"30","unit":"g"}]'::jsonb,
   ARRAY['Toast bread', 'Smash avocado with salt and pepper', 'Poach eggs', 'Assemble and top with tomatoes and feta']
  ),

  -- Lunch Recipes
  ('YOUR_NUTRITIONIST_ID', 'Grilled Chicken Salad', 'Fresh garden salad with grilled chicken breast', 'lunch', 1, 10, 15, 420, 45, 28, 14, 7, ARRAY['high-protein', 'gluten-free'], true,
   '[{"name":"chicken breast","amount":"200","unit":"g"},{"name":"mixed greens","amount":"2","unit":"cups"},{"name":"cherry tomatoes","amount":"1","unit":"cup"},{"name":"cucumber","amount":"1","unit":"whole"},{"name":"olive oil","amount":"1","unit":"tbsp"},{"name":"lemon","amount":"1","unit":"whole"}]'::jsonb,
   ARRAY['Season and grill chicken breast', 'Chop vegetables', 'Toss salad with olive oil and lemon', 'Slice chicken and add on top']
  ),
  ('YOUR_NUTRITIONIST_ID', 'Quinoa Power Bowl', 'Nutrient-dense bowl with quinoa, roasted veggies, and tahini', 'lunch', 1, 10, 25, 450, 15, 52, 18, 10, ARRAY['vegan', 'gluten-free', 'high-fiber'], true,
   '[{"name":"quinoa","amount":"0.5","unit":"cup"},{"name":"sweet potato","amount":"1","unit":"medium"},{"name":"chickpeas","amount":"0.5","unit":"cup"},{"name":"kale","amount":"2","unit":"cups"},{"name":"tahini","amount":"2","unit":"tbsp"},{"name":"lemon juice","amount":"1","unit":"tbsp"}]'::jsonb,
   ARRAY['Cook quinoa according to package', 'Roast sweet potato and chickpeas at 400F for 20 min', 'Massage kale with lemon', 'Assemble bowl and drizzle with tahini dressing']
  ),

  -- Dinner Recipes
  ('YOUR_NUTRITIONIST_ID', 'Salmon with Asparagus', 'Pan-seared salmon with roasted asparagus and sweet potato', 'dinner', 1, 10, 20, 520, 38, 45, 18, 8, ARRAY['high-protein', 'gluten-free', 'paleo'], true,
   '[{"name":"salmon fillet","amount":"200","unit":"g"},{"name":"asparagus","amount":"200","unit":"g"},{"name":"sweet potato","amount":"1","unit":"medium"},{"name":"olive oil","amount":"1","unit":"tbsp"},{"name":"garlic","amount":"2","unit":"cloves"},{"name":"lemon","amount":"1","unit":"whole"}]'::jsonb,
   ARRAY['Preheat oven to 400F', 'Roast sweet potato for 25 minutes', 'Season salmon with salt, pepper, and garlic', 'Sear salmon skin-side down for 4 min, flip and cook 3 min', 'Roast asparagus for 12 minutes', 'Serve with lemon wedges']
  ),
  ('YOUR_NUTRITIONIST_ID', 'Turkey Meatballs with Zoodles', 'Lean turkey meatballs over zucchini noodles', 'dinner', 2, 15, 25, 380, 42, 22, 12, 6, ARRAY['high-protein', 'low-carb', 'gluten-free'], true,
   '[{"name":"ground turkey","amount":"400","unit":"g"},{"name":"zucchini","amount":"2","unit":"large"},{"name":"marinara sauce","amount":"1","unit":"cup"},{"name":"parmesan","amount":"30","unit":"g"},{"name":"egg","amount":"1","unit":"whole"},{"name":"Italian seasoning","amount":"1","unit":"tsp"}]'::jsonb,
   ARRAY['Mix turkey with egg, seasoning, and parmesan', 'Form into meatballs', 'Bake at 375F for 20 minutes', 'Spiralize zucchini into noodles', 'Heat marinara and add meatballs', 'Serve over zoodles']
  ),

  -- Snacks
  ('YOUR_NUTRITIONIST_ID', 'Greek Yogurt Parfait', 'Layered parfait with Greek yogurt, berries, and granola', 'snack', 1, 5, 0, 280, 20, 35, 6, 5, ARRAY['vegetarian', 'high-protein'], true,
   '[{"name":"Greek yogurt","amount":"200","unit":"g"},{"name":"mixed berries","amount":"1","unit":"cup"},{"name":"granola","amount":"0.25","unit":"cup"},{"name":"honey","amount":"1","unit":"tsp"},{"name":"chia seeds","amount":"1","unit":"tbsp"}]'::jsonb,
   ARRAY['Layer yogurt in a glass', 'Add berries', 'Top with granola and chia seeds', 'Drizzle with honey']
  ),
  ('YOUR_NUTRITIONIST_ID', 'Energy Balls', 'No-bake energy balls with dates and nuts', 'snack', 8, 10, 0, 120, 4, 16, 5, 3, ARRAY['vegan', 'gluten-free'], true,
   '[{"name":"dates","amount":"1","unit":"cup"},{"name":"almonds","amount":"0.5","unit":"cup"},{"name":"oats","amount":"0.5","unit":"cup"},{"name":"cocoa powder","amount":"2","unit":"tbsp"},{"name":"vanilla extract","amount":"1","unit":"tsp"}]'::jsonb,
   ARRAY['Blend dates until sticky', 'Add almonds and oats, pulse until combined', 'Mix in cocoa and vanilla', 'Roll into 1-inch balls', 'Refrigerate for 30 minutes']
  )
ON CONFLICT DO NOTHING;

-- Sample Client Progress Data
-- NOTE: Replace 'CLIENT_USER_ID' with an actual user ID from user_profiles where role='user'
INSERT INTO client_progress (client_id, nutritionist_id, date, weight_kg, body_fat_percentage, waist_cm, progress_notes)
VALUES
  ('CLIENT_USER_ID', 'YOUR_NUTRITIONIST_ID', CURRENT_DATE - INTERVAL '30 days', 82.5, 28.5, 95.0, 'Starting measurements'),
  ('CLIENT_USER_ID', 'YOUR_NUTRITIONIST_ID', CURRENT_DATE - INTERVAL '23 days', 81.8, 28.0, 94.0, 'Week 1 - Good progress'),
  ('CLIENT_USER_ID', 'YOUR_NUTRITIONIST_ID', CURRENT_DATE - INTERVAL '16 days', 80.9, 27.5, 93.0, 'Week 2 - Consistent with meal plan'),
  ('CLIENT_USER_ID', 'YOUR_NUTRITIONIST_ID', CURRENT_DATE - INTERVAL '9 days', 80.2, 27.0, 92.0, 'Week 3 - Great adherence'),
  ('CLIENT_USER_ID', 'YOUR_NUTRITIONIST_ID', CURRENT_DATE - INTERVAL '2 days', 79.5, 26.5, 91.0, 'Week 4 - Excellent results!')
ON CONFLICT DO NOTHING;

-- Sample Client Health Data
INSERT INTO client_health_data (client_id, medical_history, allergies, current_medications, dietary_restrictions, food_preferences, sleep_hours_avg, stress_level, water_intake_ml)
VALUES
  ('CLIENT_USER_ID', ARRAY['Type 2 Diabetes (managed)'], ARRAY['Peanuts', 'Shellfish'], ARRAY['Metformin 500mg'], ARRAY['No peanuts', 'No shellfish'], ARRAY['Prefers Mediterranean cuisine', 'Likes fish', 'Not a fan of spicy food'], 7.5, 'medium', 2500)
ON CONFLICT (client_id) DO UPDATE SET
  medical_history = EXCLUDED.medical_history,
  allergies = EXCLUDED.allergies,
  updated_at = NOW();

-- Sample Appointments
INSERT INTO appointments (nutritionist_id, client_id, title, description, appointment_date, duration_minutes, status, consultation_type, notes)
VALUES
  ('YOUR_NUTRITIONIST_ID', 'CLIENT_USER_ID', 'Initial Consultation', 'First meeting to assess goals and create meal plan', CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00', 60, 'scheduled', 'initial', NULL),
  ('YOUR_NUTRITIONIST_ID', 'CLIENT_USER_ID', 'Week 2 Check-in', 'Review progress and adjust meal plan', CURRENT_DATE + INTERVAL '16 days' + TIME '14:00:00', 30, 'scheduled', 'follow_up', NULL),
  ('YOUR_NUTRITIONIST_ID', 'CLIENT_USER_ID', 'Monthly Progress Review', 'Comprehensive review of first month', CURRENT_DATE + INTERVAL '32 days' + TIME '10:30:00', 45, 'scheduled', 'follow_up', NULL)
ON CONFLICT DO NOTHING;

-- Sample Meal Plan
-- This creates a sample 7-day meal plan
INSERT INTO meal_plans_v2 (nutritionist_id, client_id, name, description, start_date, end_date, target_calories, target_protein_g, target_carbs_g, target_fat_g, status, notes)
VALUES
  ('YOUR_NUTRITIONIST_ID', 'CLIENT_USER_ID', 'Weight Loss Plan - Week 1', 'Balanced meal plan focused on gradual weight loss with high protein', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 1800, 140, 180, 60, 'active', 'Drink at least 2.5L water daily. Track meals in app.')
ON CONFLICT DO NOTHING;

-- Sample Client Habits
INSERT INTO client_habits (client_id, habit_name, habit_type, target_value, unit, frequency, is_active)
VALUES
  ('CLIENT_USER_ID', 'Daily Water Intake', 'water', 8, 'glasses', 'daily', true),
  ('CLIENT_USER_ID', 'Morning Walk', 'exercise', 30, 'minutes', 'daily', true),
  ('CLIENT_USER_ID', 'Meal Plan Compliance', 'meal_compliance', 3, 'meals', 'daily', true)
ON CONFLICT DO NOTHING;

-- Sample Habit Logs (last 7 days)
INSERT INTO habit_logs (habit_id, log_date, value, notes)
SELECT h.id, CURRENT_DATE - (n || ' days')::interval,
  CASE
    WHEN h.habit_name = 'Daily Water Intake' THEN 7 + (random() * 2)::int
    WHEN h.habit_name = 'Morning Walk' THEN 25 + (random() * 10)::int
    ELSE 3
  END,
  'Sample log entry'
FROM client_habits h
CROSS JOIN generate_series(0, 6) AS n
WHERE h.client_id = 'CLIENT_USER_ID'
ON CONFLICT DO NOTHING;

-- Sample Client Milestones
INSERT INTO client_milestones (client_id, milestone_type, milestone_name, description, achieved_date, badge_icon)
VALUES
  ('CLIENT_USER_ID', 'weight_loss', 'First 5 lbs Lost', 'Lost the first 5 pounds!', CURRENT_DATE - INTERVAL '15 days', '🎯'),
  ('CLIENT_USER_ID', 'streak', '7-Day Streak', 'Completed 7 days of meal plan compliance', CURRENT_DATE - INTERVAL '23 days', '🔥'),
  ('CLIENT_USER_ID', 'program_completion', 'First Month Complete', 'Successfully completed first month of program', CURRENT_DATE - INTERVAL '2 days', '🏆')
ON CONFLICT DO NOTHING;

-- Sample Educational Resources
INSERT INTO educational_resources (nutritionist_id, title, description, content, resource_type, category, tags, is_public)
VALUES
  ('YOUR_NUTRITIONIST_ID', 'Understanding Macronutrients', 'Learn about proteins, carbs, and fats', 'Macronutrients are the nutrients your body needs in large amounts...', 'article', 'nutrition_basics', ARRAY['beginner', 'nutrition'], true),
  ('YOUR_NUTRITIONIST_ID', 'Meal Prep 101', 'Step-by-step guide to weekly meal preparation', 'Meal prepping can save time and help you stick to your nutrition goals...', 'article', 'meal_prep', ARRAY['beginner', 'meal-prep'], true),
  ('YOUR_NUTRITIONIST_ID', 'Protein Guide', 'How much protein do you really need?', 'Protein requirements vary based on your goals and activity level...', 'article', 'nutrition_basics', ARRAY['protein', 'nutrition'], false)
ON CONFLICT DO NOTHING;

-- Sample Client Check-ins
INSERT INTO client_checkins (client_id, checkin_date, mood_rating, energy_rating, hunger_level, sleep_quality, stress_level, meal_compliance_percentage, exercise_completed, water_intake_glasses, notes)
VALUES
  ('CLIENT_USER_ID', CURRENT_DATE - INTERVAL '1 day', 8, 7, 5, 8, 4, 100, true, 8, 'Feeling great! Meal plan is working well.'),
  ('CLIENT_USER_ID', CURRENT_DATE - INTERVAL '2 days', 7, 6, 6, 7, 5, 90, true, 7, 'Slightly more hungry today, but stayed on track.'),
  ('CLIENT_USER_ID', CURRENT_DATE - INTERVAL '3 days', 9, 8, 4, 9, 3, 100, true, 9, 'Best day so far! Lots of energy.'),
  ('CLIENT_USER_ID', CURRENT_DATE - INTERVAL '4 days', 6, 5, 7, 6, 6, 80, false, 6, 'Stressful day at work, missed evening workout.'),
  ('CLIENT_USER_ID', CURRENT_DATE - INTERVAL '5 days', 8, 7, 5, 8, 4, 95, true, 8, 'Back on track today!')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Sample data inserted successfully!';
  RAISE NOTICE '⚠️  Remember to replace YOUR_NUTRITIONIST_ID and CLIENT_USER_ID with actual IDs from your user_profiles table';
  RAISE NOTICE '📊 You can now test all nutritionist dashboard features!';
END $$;
