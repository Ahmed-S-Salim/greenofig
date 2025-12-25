-- =====================================================
-- COMPREHENSIVE DASHBOARD IMPROVEMENTS MIGRATION (FIXED V3)
-- Created: 2025-11-23
-- Purpose: Add all recommended features to the platform
-- Fixed: Properly reference auth.users(id) instead of non-existent user_id
-- =====================================================

-- =====================================================
-- 1. GAMIFICATION SYSTEM TABLES
-- =====================================================

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  streak_type VARCHAR(50) NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Add foreign key constraint separately (safer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_streaks_user_id_fkey'
  ) THEN
    ALTER TABLE user_streaks
    ADD CONSTRAINT user_streaks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_key VARCHAR(100) NOT NULL,
  achievement_name VARCHAR(200) NOT NULL,
  achievement_description TEXT,
  achievement_icon VARCHAR(50),
  tier VARCHAR(20) DEFAULT 'bronze',
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_achievements_user_id_fkey'
  ) THEN
    ALTER TABLE user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- User Progress Levels
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_levels_user_id_fkey'
  ) THEN
    ALTER TABLE user_levels
    ADD CONSTRAINT user_levels_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 2. PREMIUM FEATURES TABLES
-- =====================================================

-- Saved Recipes
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  recipe_name VARCHAR(200),
  recipe_data JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_recipes_user_id_fkey'
  ) THEN
    ALTER TABLE saved_recipes
    ADD CONSTRAINT saved_recipes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(20) DEFAULT 'front',
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  notes TEXT,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'progress_photos_user_id_fkey'
  ) THEN
    ALTER TABLE progress_photos
    ADD CONSTRAINT progress_photos_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Body Measurements
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  neck_cm DECIMAL(5,2),
  shoulders_cm DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  left_bicep_cm DECIMAL(5,2),
  right_bicep_cm DECIMAL(5,2),
  left_thigh_cm DECIMAL(5,2),
  right_thigh_cm DECIMAL(5,2),
  left_calf_cm DECIMAL(5,2),
  right_calf_cm DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, measurement_date)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'body_measurements_user_id_fkey'
  ) THEN
    ALTER TABLE body_measurements
    ADD CONSTRAINT body_measurements_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 3. ELITE TIER FEATURES
-- =====================================================

-- DNA Analysis Results
CREATE TABLE IF NOT EXISTS dna_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'dna_analysis_user_id_fkey'
  ) THEN
    ALTER TABLE dna_analysis
    ADD CONSTRAINT dna_analysis_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Masterclass Videos (Elite Content)
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

-- User Video Progress
CREATE TABLE IF NOT EXISTS user_video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_video_progress_user_id_fkey'
  ) THEN
    ALTER TABLE user_video_progress
    ADD CONSTRAINT user_video_progress_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_video_progress_video_id_fkey'
  ) THEN
    ALTER TABLE user_video_progress
    ADD CONSTRAINT user_video_progress_video_id_fkey
    FOREIGN KEY (video_id) REFERENCES masterclass_videos(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 4. NUTRITIONIST ENHANCEMENTS
-- =====================================================

-- Client Tags
CREATE TABLE IF NOT EXISTS client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL,
  client_id UUID NOT NULL,
  tag VARCHAR(50) NOT NULL,
  color VARCHAR(20) DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nutritionist_id, client_id, tag)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_tags_nutritionist_id_fkey'
  ) THEN
    ALTER TABLE client_tags
    ADD CONSTRAINT client_tags_nutritionist_id_fkey
    FOREIGN KEY (nutritionist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_tags_client_id_fkey'
  ) THEN
    ALTER TABLE client_tags
    ADD CONSTRAINT client_tags_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  template_body TEXT NOT NULL,
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'message_templates_nutritionist_id_fkey'
  ) THEN
    ALTER TABLE message_templates
    ADD CONSTRAINT message_templates_nutritionist_id_fkey
    FOREIGN KEY (nutritionist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Scheduled Messages
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message_body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_messages_sender_id_fkey'
  ) THEN
    ALTER TABLE scheduled_messages
    ADD CONSTRAINT scheduled_messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scheduled_messages_recipient_id_fkey'
  ) THEN
    ALTER TABLE scheduled_messages
    ADD CONSTRAINT scheduled_messages_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Program Templates
CREATE TABLE IF NOT EXISTS program_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'program_templates_nutritionist_id_fkey'
  ) THEN
    ALTER TABLE program_templates
    ADD CONSTRAINT program_templates_nutritionist_id_fkey
    FOREIGN KEY (nutritionist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 5. DASHBOARD WIDGETS DATA
-- =====================================================

-- Daily Habits Tracking
CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_habits_user_id_fkey'
  ) THEN
    ALTER TABLE daily_habits
    ADD CONSTRAINT daily_habits_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Weekly Goals
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'weekly_goals_user_id_fkey'
  ) THEN
    ALTER TABLE weekly_goals
    ADD CONSTRAINT weekly_goals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 6. NOTIFICATION SYSTEM
-- =====================================================

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meal_reminders BOOLEAN DEFAULT TRUE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  water_reminders BOOLEAN DEFAULT TRUE,
  weight_log_reminders BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  milestone_notifications BOOLEAN DEFAULT TRUE,
  breakfast_time TIME DEFAULT '08:00:00',
  lunch_time TIME DEFAULT '12:00:00',
  dinner_time TIME DEFAULT '18:00:00',
  workout_time TIME DEFAULT '17:00:00',
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_preferences_user_id_fkey'
  ) THEN
    ALTER TABLE notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Notification History
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_history_user_id_fkey'
  ) THEN
    ALTER TABLE notification_history
    ADD CONSTRAINT notification_history_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 7. ONBOARDING SYSTEM
-- =====================================================

-- Onboarding Checklist
CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'onboarding_checklist_user_id_fkey'
  ) THEN
    ALTER TABLE onboarding_checklist
    ADD CONSTRAINT onboarding_checklist_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 8. ANALYTICS & REPORTING
-- =====================================================

-- Client Retention Analytics
CREATE TABLE IF NOT EXISTS client_retention_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_retention_metrics_nutritionist_id_fkey'
  ) THEN
    ALTER TABLE client_retention_metrics
    ADD CONSTRAINT client_retention_metrics_nutritionist_id_fkey
    FOREIGN KEY (nutritionist_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 9. PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id_taken_at ON progress_photos(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_id_date ON daily_habits(user_id, habit_date DESC);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_id ON weekly_goals(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_tags_nutritionist_id ON client_tags(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_client_tags_client_id ON client_tags(client_id);

-- =====================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON user_streaks;
CREATE POLICY "Users can view their own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON user_streaks FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own level" ON user_levels;
DROP POLICY IF EXISTS "Users can update their own level" ON user_levels;
CREATE POLICY "Users can view their own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own level" ON user_levels FOR ALL USING (auth.uid() = user_id);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own progress photos" ON progress_photos;
CREATE POLICY "Users can manage their own progress photos" ON progress_photos FOR ALL USING (auth.uid() = user_id);

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own measurements" ON body_measurements;
CREATE POLICY "Users can manage their own measurements" ON body_measurements FOR ALL USING (auth.uid() = user_id);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own saved recipes" ON saved_recipes;
CREATE POLICY "Users can manage their own saved recipes" ON saved_recipes FOR ALL USING (auth.uid() = user_id);

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

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Nutritionists can manage their own templates" ON message_templates;
CREATE POLICY "Nutritionists can manage their own templates" ON message_templates FOR ALL USING (auth.uid() = nutritionist_id);

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

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notification prefs" ON notification_preferences;
CREATE POLICY "Users can manage their own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

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
-- 11. FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type VARCHAR
) RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_activity_date, current_streak
  INTO v_last_activity, v_current_streak
  FROM user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF v_last_activity = CURRENT_DATE THEN
    RETURN;
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    UPDATE user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  ELSE
    UPDATE user_streaks
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  END IF;

  IF v_current_streak >= 3 THEN
    INSERT INTO user_achievements (user_id, achievement_key, achievement_name, achievement_description, achievement_icon, tier, points_earned)
    VALUES (p_user_id, '3_day_streak', '3-Day Streak', 'Logged activity for 3 days in a row!', '🔥', 'bronze', 10)
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
  END IF;

  IF v_current_streak >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_key, achievement_name, achievement_description, achievement_icon, tier, points_earned)
    VALUES (p_user_id, '7_day_streak', 'Week Warrior', 'Logged activity for 7 days in a row!', '🏆', 'silver', 25)
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
  END IF;

  IF v_current_streak >= 30 THEN
    INSERT INTO user_achievements (user_id, achievement_key, achievement_name, achievement_description, achievement_icon, tier, points_earned)
    VALUES (p_user_id, '30_day_streak', 'Monthly Master', 'Logged activity for 30 days in a row!', '👑', 'gold', 100)
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
-- 12. SEED DATA
-- =====================================================

INSERT INTO masterclass_videos (title, description, instructor_name, video_url, thumbnail_url, duration_minutes, category, tier_required)
VALUES
  ('Nutrition Fundamentals', 'Learn the science behind nutrition and how to fuel your body optimally', 'Dr. Sarah Johnson', 'https://example.com/video1', 'https://example.com/thumb1.jpg', 45, 'nutrition', 'elite'),
  ('Advanced Meal Prep Strategies', 'Master the art of meal prepping for the entire week', 'Chef Marcus Lee', 'https://example.com/video2', 'https://example.com/thumb2.jpg', 60, 'cooking', 'elite'),
  ('Mindset for Success', 'Develop the mental framework for achieving your health goals', 'Dr. Emily Chen', 'https://example.com/video3', 'https://example.com/thumb3.jpg', 30, 'mindset', 'elite')
ON CONFLICT DO NOTHING;
