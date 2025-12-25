-- =====================================================
-- ADD ONLY NEW TABLES (that don't already exist)
-- Created: 2025-11-23
-- Purpose: Add missing gamification and premium features
-- =====================================================

-- NOTE: These tables already exist in your database, so we're NOT creating them:
-- - user_streaks (EXISTS)
-- - user_achievements (EXISTS)
-- - body_measurements (EXISTS)
-- - message_templates (EXISTS)
-- - notification_preferences (EXISTS)

-- =====================================================
-- 1. NEW TABLES ONLY
-- =====================================================

-- User Levels (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Saved Recipes (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL,
  recipe_name VARCHAR(200),
  recipe_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Progress Photos (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(20) DEFAULT 'front',
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  notes TEXT,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DNA Analysis (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS dna_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_provider VARCHAR(100),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_data JSONB,
  optimal_macros JSONB,
  food_sensitivities JSONB,
  vitamin_recommendations JSONB,
  metabolism_type VARCHAR(50),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Masterclass Videos (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS masterclass_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructor_name VARCHAR(100),
  instructor_bio TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  category VARCHAR(50),
  tier_required VARCHAR(20) DEFAULT 'elite',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- User Video Progress (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES masterclass_videos(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Client Tags (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nutritionist_id, client_id, tag)
);

-- Scheduled Messages (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program Templates (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS program_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name VARCHAR(200) NOT NULL,
  program_type VARCHAR(50),
  duration_weeks INTEGER,
  description TEXT,
  meal_plan_template JSONB,
  workout_plan_template JSONB,
  check_in_frequency VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Habits (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_intake_completed BOOLEAN DEFAULT FALSE,
  steps_goal_completed BOOLEAN DEFAULT FALSE,
  sleep_goal_completed BOOLEAN DEFAULT FALSE,
  meal_logged BOOLEAN DEFAULT FALSE,
  workout_completed BOOLEAN DEFAULT FALSE,
  weight_logged BOOLEAN DEFAULT FALSE,
  water_glasses INTEGER DEFAULT 0,
  steps_count INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_date)
);

-- Weekly Goals (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  goal_description TEXT NOT NULL,
  target_metric VARCHAR(50),
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification History (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT
);

-- Onboarding Checklist (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed BOOLEAN DEFAULT FALSE,
  first_goal_set BOOLEAN DEFAULT FALSE,
  first_meal_logged BOOLEAN DEFAULT FALSE,
  first_workout_logged BOOLEAN DEFAULT FALSE,
  first_weight_logged BOOLEAN DEFAULT FALSE,
  survey_completed BOOLEAN DEFAULT FALSE,
  tour_completed BOOLEAN DEFAULT FALSE,
  completion_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Client Retention Metrics (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS client_retention_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL,
  total_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  retention_rate DECIMAL(5,2),
  base_clients INTEGER DEFAULT 0,
  premium_clients INTEGER DEFAULT 0,
  pro_clients INTEGER DEFAULT 0,
  elite_clients INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  revenue_per_client DECIMAL(10,2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nutritionist_id, month_year)
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id_taken_at ON progress_photos(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_id_date ON daily_habits(user_id, habit_date DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_id ON weekly_goals(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_tags_nutritionist_id ON client_tags(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_client_id ON client_tags(client_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own level" ON user_levels;
DROP POLICY IF EXISTS "Users can update their own level" ON user_levels;
CREATE POLICY "Users can view their own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own level" ON user_levels FOR ALL USING (auth.uid() = user_id);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own saved recipes" ON saved_recipes;
CREATE POLICY "Users can manage their own saved recipes" ON saved_recipes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own progress photos" ON progress_photos;
CREATE POLICY "Users can manage their own progress photos" ON progress_photos FOR ALL USING (auth.uid() = user_id);

ALTER TABLE dna_analysis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own DNA analysis" ON dna_analysis;
CREATE POLICY "Users can manage their own DNA analysis" ON dna_analysis FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own video progress" ON user_video_progress;
CREATE POLICY "Users can manage their own video progress" ON user_video_progress FOR ALL USING (auth.uid() = user_id);

ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can manage their client tags" ON client_tags;
DROP POLICY IF EXISTS "Clients can view their own tags" ON client_tags;
CREATE POLICY "Nutritionists can manage their client tags" ON client_tags FOR ALL USING (auth.uid() = nutritionist_id);
CREATE POLICY "Clients can view their own tags" ON client_tags FOR SELECT USING (auth.uid() = client_id);

ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages they sent or will receive" ON scheduled_messages;
DROP POLICY IF EXISTS "Users can create scheduled messages" ON scheduled_messages;
CREATE POLICY "Users can view messages they sent or will receive" ON scheduled_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create scheduled messages" ON scheduled_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

ALTER TABLE program_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can manage their own programs" ON program_templates;
CREATE POLICY "Nutritionists can manage their own programs" ON program_templates FOR ALL USING (auth.uid() = nutritionist_id);

ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own habits" ON daily_habits;
CREATE POLICY "Users can manage their own habits" ON daily_habits FOR ALL USING (auth.uid() = user_id);

ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own goals" ON weekly_goals;
CREATE POLICY "Users can manage their own goals" ON weekly_goals FOR ALL USING (auth.uid() = user_id);

ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notification_history;
CREATE POLICY "Users can view their own notifications" ON notification_history FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE onboarding_checklist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own onboarding" ON onboarding_checklist;
CREATE POLICY "Users can manage their own onboarding" ON onboarding_checklist FOR ALL USING (auth.uid() = user_id);

ALTER TABLE client_retention_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can view their own metrics" ON client_retention_metrics;
DROP POLICY IF EXISTS "Nutritionists can manage their own metrics" ON client_retention_metrics;
CREATE POLICY "Nutritionists can view their own metrics" ON client_retention_metrics FOR SELECT USING (auth.uid() = nutritionist_id);
CREATE POLICY "Nutritionists can manage their own metrics" ON client_retention_metrics FOR ALL USING (auth.uid() = nutritionist_id);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_user_level(p_total_xp INTEGER)
RETURNS TABLE(level INTEGER, level_name VARCHAR, xp_for_next INTEGER) AS $$
DECLARE
  v_level INTEGER;
  v_level_name VARCHAR;
  v_xp_for_next INTEGER;
BEGIN
  v_level := FLOOR(SQRT(p_total_xp / 100.0)) + 1;
  v_xp_for_next := (v_level * v_level * 100) - p_total_xp;

  v_level_name := CASE
    WHEN v_level <= 5 THEN 'Bronze Beginner'
    WHEN v_level <= 10 THEN 'Silver Starter'
    WHEN v_level <= 20 THEN 'Gold Champion'
    WHEN v_level <= 30 THEN 'Platinum Pro'
    ELSE 'Diamond Legend'
  END;

  RETURN QUERY SELECT v_level, v_level_name, v_xp_for_next;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. SEED DATA
-- =====================================================

INSERT INTO masterclass_videos (title, description, instructor_name, video_url, thumbnail_url, duration_minutes, category, tier_required)
VALUES
  ('Nutrition Fundamentals', 'Learn the science behind nutrition and how to fuel your body optimally', 'Dr. Sarah Johnson', 'https://example.com/video1', 'https://example.com/thumb1.jpg', 45, 'nutrition', 'elite'),
  ('Advanced Meal Prep Strategies', 'Master the art of meal prepping for the entire week', 'Chef Marcus Lee', 'https://example.com/video2', 'https://example.com/thumb2.jpg', 60, 'cooking', 'elite'),
  ('Mindset for Success', 'Develop the mental framework for achieving your health goals', 'Dr. Emily Chen', 'https://example.com/video3', 'https://example.com/thumb3.jpg', 30, 'mindset', 'elite')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE user_levels IS 'Tracks user level progression and XP';
COMMENT ON TABLE saved_recipes IS 'User saved recipes collection';
COMMENT ON TABLE progress_photos IS 'Stores before/after progress photos';
COMMENT ON TABLE daily_habits IS 'Daily habit tracking with checkboxes';
COMMENT ON TABLE notification_history IS 'User notification history';
COMMENT ON TABLE onboarding_checklist IS 'Track new user onboarding progress';
