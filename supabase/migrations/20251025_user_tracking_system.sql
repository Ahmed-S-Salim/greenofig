-- User Tracking System for Dashboard
-- Daily metrics, meals, workouts, sleep, water, achievements

-- Daily Metrics Table
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Physical Metrics
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),

  -- Activity Metrics
  steps INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  active_minutes INTEGER DEFAULT 0,

  -- Nutrition Metrics
  calories_consumed INTEGER DEFAULT 0,
  protein_g DECIMAL(6,2) DEFAULT 0,
  carbs_g DECIMAL(6,2) DEFAULT 0,
  fats_g DECIMAL(6,2) DEFAULT 0,
  water_ml INTEGER DEFAULT 0,

  -- Sleep Metrics
  sleep_hours DECIMAL(4,2),
  sleep_quality VARCHAR(20), -- poor, fair, good, excellent

  -- Wellness
  mood VARCHAR(20), -- sad, neutral, happy, great
  energy_level INTEGER, -- 1-10
  stress_level INTEGER, -- 1-10

  -- Notes
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Meals Logging Table
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Meal Info
  meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
  meal_name VARCHAR(255),
  description TEXT,
  image_url TEXT,

  -- Nutrition
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fats_g DECIMAL(6,2),
  fiber_g DECIMAL(6,2),

  -- Timing
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,

  -- AI Generated
  ai_generated BOOLEAN DEFAULT false,
  ai_meal_plan_id UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Logs Table
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Workout Info
  workout_name VARCHAR(255) NOT NULL,
  workout_type VARCHAR(100), -- cardio, strength, yoga, sports, etc.
  description TEXT,

  -- Metrics
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  intensity VARCHAR(50), -- light, moderate, intense

  -- Details
  exercises JSONB, -- [{name, sets, reps, weight}, ...]

  -- Timing
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,

  -- AI Generated
  ai_generated BOOLEAN DEFAULT false,
  ai_workout_plan_id UUID,

  -- Notes
  notes TEXT,
  feeling VARCHAR(50), -- tired, good, energized, exhausted

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Meal Plans Table
CREATE TABLE IF NOT EXISTS ai_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Plan Info
  plan_name VARCHAR(255),
  plan_type VARCHAR(100), -- daily, weekly, custom
  target_date DATE,

  -- Nutritional Targets
  target_calories INTEGER,
  target_protein_g DECIMAL(6,2),
  target_carbs_g DECIMAL(6,2),
  target_fats_g DECIMAL(6,2),

  -- Meals
  meals JSONB NOT NULL, -- [{meal_type, name, ingredients, nutrition, instructions}, ...]

  -- AI Metadata
  ai_prompt TEXT,
  ai_model VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Workout Plans Table
CREATE TABLE IF NOT EXISTS ai_workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Plan Info
  plan_name VARCHAR(255),
  plan_type VARCHAR(100), -- daily, weekly, program
  target_date DATE,
  difficulty VARCHAR(50), -- beginner, intermediate, advanced

  -- Workout Details
  workouts JSONB NOT NULL, -- [{name, type, duration, exercises: [{name, sets, reps}]}, ...]

  -- AI Metadata
  ai_prompt TEXT,
  ai_model VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'active',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  achievement_type VARCHAR(100) NOT NULL, -- first_login, 7_day_streak, weight_loss_5kg, etc.
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  icon_name VARCHAR(100), -- lucide icon name

  -- Progress
  current_value INTEGER DEFAULT 0,
  target_value INTEGER,

  -- Status
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  streak_type VARCHAR(100) NOT NULL, -- login, workout, meal_log, water_intake
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, streak_type)
);

-- Activity Feed Table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  activity_type VARCHAR(100) NOT NULL, -- logged_meal, completed_workout, weight_update, achievement
  activity_title VARCHAR(255) NOT NULL,
  activity_description TEXT,

  -- Related Data
  related_id UUID, -- ID of related meal_log, workout_log, etc.
  related_type VARCHAR(50), -- meal, workout, metric, achievement

  -- Metadata
  metadata JSONB, -- {calories: 500, duration: 30, etc.}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS user_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  reminder_type VARCHAR(100) NOT NULL, -- workout, meal, water, weight_log, appointment
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Timing
  reminder_time TIME,
  reminder_days TEXT[], -- ['monday', 'wednesday', 'friday']
  next_reminder_at TIMESTAMP WITH TIME ZONE,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON meal_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_meal_plans_user ON ai_meal_plans(user_id, status, target_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_workout_plans_user ON ai_workout_plans(user_id, status, target_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, unlocked);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user ON user_reminders(user_id, is_active);

-- Enable RLS
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data

-- Daily Metrics
CREATE POLICY "Users can view their own metrics" ON daily_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics" ON daily_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics" ON daily_metrics
  FOR UPDATE USING (auth.uid() = user_id);

-- Meal Logs
CREATE POLICY "Users can manage their meal logs" ON meal_logs
  FOR ALL USING (auth.uid() = user_id);

-- Workout Logs
CREATE POLICY "Users can manage their workout logs" ON workout_logs
  FOR ALL USING (auth.uid() = user_id);

-- AI Meal Plans
CREATE POLICY "Users can manage their meal plans" ON ai_meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- AI Workout Plans
CREATE POLICY "Users can manage their workout plans" ON ai_workout_plans
  FOR ALL USING (auth.uid() = user_id);

-- User Achievements
CREATE POLICY "Users can view their achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- User Streaks
CREATE POLICY "Users can view their streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- Activity Feed
CREATE POLICY "Users can view their activity feed" ON activity_feed
  FOR ALL USING (auth.uid() = user_id);

-- User Reminders
CREATE POLICY "Users can manage their reminders" ON user_reminders
  FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_daily_metrics_updated_at BEFORE UPDATE ON daily_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_meal_plans_updated_at BEFORE UPDATE ON ai_meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_workout_plans_updated_at BEFORE UPDATE ON ai_workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reminders_updated_at BEFORE UPDATE ON user_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update streaks
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type VARCHAR,
  p_activity_date DATE
)
RETURNS void AS $$
DECLARE
  v_current_streak INTEGER;
  v_last_date DATE;
BEGIN
  -- Get current streak data
  SELECT current_streak, last_activity_date INTO v_current_streak, v_last_date
  FROM user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, p_activity_date);
    RETURN;
  END IF;

  -- If same day, do nothing
  IF v_last_date = p_activity_date THEN
    RETURN;
  END IF;

  -- If consecutive day, increment streak
  IF v_last_date = p_activity_date - INTERVAL '1 day' THEN
    UPDATE user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = p_activity_date
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_streaks
    SET current_streak = 1,
        last_activity_date = p_activity_date
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'User tracking system created successfully! ✅' as status;
