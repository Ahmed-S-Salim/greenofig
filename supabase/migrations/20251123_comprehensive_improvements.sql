-- =====================================================
-- COMPREHENSIVE DASHBOARD IMPROVEMENTS MIGRATION
-- Created: 2025-11-23
-- Purpose: Add all recommended features to the platform
-- =====================================================

-- =====================================================
-- 1. FIX MESSAGING CENTER RLS POLICIES
-- =====================================================

-- Enable RLS on messages table
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their sent messages" ON messages;

-- Allow users to read messages they sent or received
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to send messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow users to update their sent messages
CREATE POLICY "Users can update their sent messages"
ON messages FOR UPDATE
USING (auth.uid() = sender_id);

-- =====================================================
-- 2. GAMIFICATION SYSTEM TABLES
-- =====================================================

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL, -- 'logging', 'workouts', 'meals', 'water'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key VARCHAR(100) NOT NULL, -- 'first_meal', 'week_streak', 'goal_reached'
  achievement_name VARCHAR(200) NOT NULL,
  achievement_description TEXT,
  achievement_icon VARCHAR(50), -- emoji or icon name
  tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  points_earned INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- User Progress Levels
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level_name VARCHAR(50), -- 'Bronze Beginner', 'Silver Starter', 'Gold Champion'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 3. PREMIUM FEATURES TABLES
-- =====================================================

-- Saved Recipes
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL,
  recipe_name VARCHAR(200),
  recipe_data JSONB, -- full recipe details
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(20) DEFAULT 'front', -- 'front', 'side', 'back'
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  notes TEXT,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Body Measurements
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- 11-point body measurements
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

-- =====================================================
-- 4. ELITE TIER FEATURES
-- =====================================================

-- DNA Analysis Results
CREATE TABLE IF NOT EXISTS dna_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_provider VARCHAR(100), -- '23andMe', 'AncestryDNA', 'Custom'
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_data JSONB, -- parsed DNA results

  -- Nutrition recommendations based on DNA
  optimal_macros JSONB, -- {protein: 30, carbs: 40, fats: 30}
  food_sensitivities JSONB, -- array of foods to avoid
  vitamin_recommendations JSONB,
  metabolism_type VARCHAR(50), -- 'fast', 'normal', 'slow'

  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Masterclass Videos (Elite Content)
CREATE TABLE IF NOT EXISTS masterclass_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  instructor_name VARCHAR(100),
  instructor_bio TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  category VARCHAR(50), -- 'nutrition', 'fitness', 'mindset', 'cooking'
  tier_required VARCHAR(20) DEFAULT 'elite', -- who can access
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- User Video Progress
CREATE TABLE IF NOT EXISTS user_video_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES masterclass_videos(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- =====================================================
-- 5. NUTRITIONIST ENHANCEMENTS
-- =====================================================

-- Client Tags (for nutritionists)
CREATE TABLE IF NOT EXISTS client_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL, -- 'high-priority', 'at-risk', 'star-performer', 'needs-attention'
  color VARCHAR(20) DEFAULT 'blue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nutritionist_id, client_id, tag)
);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  template_body TEXT NOT NULL,
  category VARCHAR(50), -- 'welcome', 'check-in', 'milestone', 'encouragement'
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Messages
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program Templates
CREATE TABLE IF NOT EXISTS program_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_name VARCHAR(200) NOT NULL,
  program_type VARCHAR(50), -- 'weight-loss', 'muscle-gain', 'maintenance'
  duration_weeks INTEGER,
  description TEXT,
  meal_plan_template JSONB,
  workout_plan_template JSONB,
  check_in_frequency VARCHAR(20), -- 'daily', 'weekly', 'biweekly'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. DASHBOARD WIDGETS DATA
-- =====================================================

-- Daily Habits Tracking
CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Habit checkboxes
  water_intake_completed BOOLEAN DEFAULT FALSE,
  steps_goal_completed BOOLEAN DEFAULT FALSE,
  sleep_goal_completed BOOLEAN DEFAULT FALSE,
  meal_logged BOOLEAN DEFAULT FALSE,
  workout_completed BOOLEAN DEFAULT FALSE,
  weight_logged BOOLEAN DEFAULT FALSE,

  -- Actual values
  water_glasses INTEGER DEFAULT 0,
  steps_count INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, habit_date)
);

-- Weekly Goals
CREATE TABLE IF NOT EXISTS weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  goal_description TEXT NOT NULL,
  target_metric VARCHAR(50), -- 'weight', 'workouts', 'meals'
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. NOTIFICATION SYSTEM
-- =====================================================

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification types
  meal_reminders BOOLEAN DEFAULT TRUE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  water_reminders BOOLEAN DEFAULT TRUE,
  weight_log_reminders BOOLEAN DEFAULT TRUE,
  message_notifications BOOLEAN DEFAULT TRUE,
  milestone_notifications BOOLEAN DEFAULT TRUE,

  -- Timing preferences
  breakfast_time TIME DEFAULT '08:00:00',
  lunch_time TIME DEFAULT '12:00:00',
  dinner_time TIME DEFAULT '18:00:00',
  workout_time TIME DEFAULT '17:00:00',

  -- Push notification token
  push_token TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notification History
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200),
  message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT
);

-- =====================================================
-- 8. ONBOARDING SYSTEM
-- =====================================================

-- Onboarding Checklist
CREATE TABLE IF NOT EXISTS onboarding_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Checklist items
  profile_completed BOOLEAN DEFAULT FALSE,
  first_goal_set BOOLEAN DEFAULT FALSE,
  first_meal_logged BOOLEAN DEFAULT FALSE,
  first_workout_logged BOOLEAN DEFAULT FALSE,
  first_weight_logged BOOLEAN DEFAULT FALSE,
  survey_completed BOOLEAN DEFAULT FALSE,
  tour_completed BOOLEAN DEFAULT FALSE,

  -- Progress percentage
  completion_percentage INTEGER DEFAULT 0,

  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 9. ANALYTICS & REPORTING
-- =====================================================

-- Client Retention Analytics
CREATE TABLE IF NOT EXISTS client_retention_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- '2025-11'

  -- Retention metrics
  total_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  retention_rate DECIMAL(5,2), -- percentage

  -- By tier
  base_clients INTEGER DEFAULT 0,
  premium_clients INTEGER DEFAULT 0,
  pro_clients INTEGER DEFAULT 0,
  elite_clients INTEGER DEFAULT 0,

  -- Revenue
  total_revenue DECIMAL(10,2) DEFAULT 0,
  revenue_per_client DECIMAL(10,2) DEFAULT 0,

  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nutritionist_id, month_year)
);

-- =====================================================
-- 10. PERFORMANCE INDEXES
-- =====================================================

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- User profiles tier index
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);

-- Client progress indexes
CREATE INDEX IF NOT EXISTS idx_client_progress_client_id_date ON client_progress(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_client_progress_date ON client_progress(date DESC);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);

-- Progress photos index
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id_taken_at ON progress_photos(user_id, taken_at DESC);

-- Daily habits index
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_id_date ON daily_habits(user_id, habit_date DESC);

-- Notifications index
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id, sent_at DESC);

-- =====================================================
-- 11. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- User Streaks RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own streaks" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON user_streaks FOR ALL USING (auth.uid() = user_id);

-- User Achievements RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Levels RLS
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own level" ON user_levels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own level" ON user_levels FOR ALL USING (auth.uid() = user_id);

-- Progress Photos RLS
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own progress photos" ON progress_photos FOR ALL USING (auth.uid() = user_id);

-- Body Measurements RLS
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own measurements" ON body_measurements FOR ALL USING (auth.uid() = user_id);

-- Daily Habits RLS
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own habits" ON daily_habits FOR ALL USING (auth.uid() = user_id);

-- Notification Preferences RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Onboarding Checklist RLS
ALTER TABLE onboarding_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own onboarding" ON onboarding_checklist FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 12. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update streak
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
    -- Already logged today, do nothing
    RETURN;
  ELSIF v_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  ELSE
    -- Streak broken, reset
    UPDATE user_streaks
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  END IF;

  -- Award achievements for streaks
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

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_user_level(p_total_xp INTEGER)
RETURNS TABLE(level INTEGER, level_name VARCHAR, xp_for_next INTEGER) AS $$
DECLARE
  v_level INTEGER;
  v_level_name VARCHAR;
  v_xp_for_next INTEGER;
BEGIN
  -- Simple level formula: level = sqrt(total_xp / 100)
  v_level := FLOOR(SQRT(p_total_xp / 100.0)) + 1;

  -- Calculate XP needed for next level
  v_xp_for_next := (v_level * v_level * 100) - p_total_xp;

  -- Assign level name
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
-- 13. SEED DATA
-- =====================================================

-- Insert default masterclass videos (Elite content)
INSERT INTO masterclass_videos (title, description, instructor_name, video_url, thumbnail_url, duration_minutes, category, tier_required)
VALUES
  ('Nutrition Fundamentals', 'Learn the science behind nutrition and how to fuel your body optimally', 'Dr. Sarah Johnson', 'https://example.com/video1', 'https://example.com/thumb1.jpg', 45, 'nutrition', 'elite'),
  ('Advanced Meal Prep Strategies', 'Master the art of meal prepping for the entire week', 'Chef Marcus Lee', 'https://example.com/video2', 'https://example.com/thumb2.jpg', 60, 'cooking', 'elite'),
  ('Mindset for Success', 'Develop the mental framework for achieving your health goals', 'Dr. Emily Chen', 'https://example.com/video3', 'https://example.com/thumb3.jpg', 30, 'mindset', 'elite')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comments
COMMENT ON TABLE user_streaks IS 'Tracks user activity streaks for gamification';
COMMENT ON TABLE user_achievements IS 'Stores unlocked achievements and badges';
COMMENT ON TABLE user_levels IS 'Tracks user level progression and XP';
COMMENT ON TABLE progress_photos IS 'Stores before/after progress photos';
COMMENT ON TABLE body_measurements IS '11-point body measurement tracking';
COMMENT ON TABLE message_templates IS 'Reusable message templates for nutritionists';
COMMENT ON TABLE scheduled_messages IS 'Messages scheduled to be sent later';
COMMENT ON TABLE daily_habits IS 'Daily habit tracking with checkboxes';
COMMENT ON TABLE notification_preferences IS 'User notification settings and preferences';
COMMENT ON TABLE onboarding_checklist IS 'Track new user onboarding progress';
