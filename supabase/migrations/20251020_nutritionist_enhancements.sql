-- Enhanced Nutritionist Dashboard Database Schema

-- Client Progress Tracking
CREATE TABLE IF NOT EXISTS client_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  waist_cm DECIMAL(5,2),
  hips_cm DECIMAL(5,2),
  chest_cm DECIMAL(5,2),
  arms_cm DECIMAL(5,2),
  thighs_cm DECIMAL(5,2),
  progress_notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, date)
);

-- Client Health Data
CREATE TABLE IF NOT EXISTS client_health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  medical_history TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  dietary_restrictions TEXT[],
  food_preferences TEXT[],
  sleep_hours_avg DECIMAL(3,1),
  stress_level VARCHAR(20), -- low, medium, high
  water_intake_ml INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  consultation_type VARCHAR(50), -- initial, follow_up, check_in
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  servings INTEGER DEFAULT 1,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  ingredients JSONB, -- [{"name": "chicken", "amount": "200", "unit": "g"}]
  instructions TEXT[],
  calories_per_serving DECIMAL(6,2),
  protein_g DECIMAL(5,2),
  carbs_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  sugar_g DECIMAL(5,2),
  sodium_mg DECIMAL(6,2),
  category VARCHAR(100), -- breakfast, lunch, dinner, snack, dessert
  tags TEXT[], -- vegetarian, vegan, gluten-free, etc.
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Meal Plans
CREATE TABLE IF NOT EXISTS meal_plans_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  meal_schedule JSONB, -- {"monday": {"breakfast": recipe_id, "lunch": recipe_id, ...}}
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  attachments JSONB, -- [{"url": "...", "name": "...", "type": "..."}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit Tracking
CREATE TABLE IF NOT EXISTS client_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  habit_name VARCHAR(255) NOT NULL,
  habit_type VARCHAR(50), -- water, exercise, meal_compliance, custom
  target_value INTEGER, -- e.g., 8 glasses of water
  unit VARCHAR(50), -- glasses, minutes, times
  frequency VARCHAR(50) DEFAULT 'daily', -- daily, weekly
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES client_habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- Educational Resources
CREATE TABLE IF NOT EXISTS educational_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  resource_type VARCHAR(50), -- article, video, pdf, recipe_collection
  file_url TEXT,
  thumbnail_url TEXT,
  category VARCHAR(100), -- nutrition_basics, weight_loss, meal_prep, etc.
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Milestones
CREATE TABLE IF NOT EXISTS client_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  milestone_type VARCHAR(100), -- weight_loss, streak, program_completion
  milestone_name VARCHAR(255) NOT NULL,
  description TEXT,
  achieved_date DATE NOT NULL DEFAULT CURRENT_DATE,
  badge_icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation Notes Templates
CREATE TABLE IF NOT EXISTS consultation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50), -- initial, follow_up, check_in
  sections JSONB, -- [{"title": "Assessment", "content": "..."}, ...]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-in Forms
CREATE TABLE IF NOT EXISTS client_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 10),
  hunger_level INTEGER CHECK (hunger_level >= 1 AND hunger_level <= 10),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  meal_compliance_percentage INTEGER CHECK (meal_compliance_percentage >= 0 AND meal_compliance_percentage <= 100),
  exercise_completed BOOLEAN,
  water_intake_glasses INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping Lists
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans_v2(id) ON DELETE CASCADE,
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  items JSONB, -- [{"name": "chicken breast", "quantity": "1kg", "category": "protein", "checked": false}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_progress_client ON client_progress(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist ON appointments(nutritionist_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(habit_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_nutritionist ON recipes(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_client ON meal_plans_v2(client_id, status);

-- RLS Policies

-- Client Progress
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nutritionists can manage their clients' progress" ON client_progress
  FOR ALL USING (
    auth.uid() = nutritionist_id OR
    auth.uid() = client_id
  );

-- Client Health Data
ALTER TABLE client_health_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own health data" ON client_health_data
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Nutritionists can view their clients' health data" ON client_health_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Clients can update their own health data" ON client_health_data
  FOR ALL USING (auth.uid() = client_id);

-- Appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR ALL USING (
    auth.uid() = nutritionist_id OR
    auth.uid() = client_id
  );

-- Recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public recipes" ON recipes
  FOR SELECT USING (is_public = true OR auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can manage their recipes" ON recipes
  FOR ALL USING (auth.uid() = nutritionist_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Habits
ALTER TABLE client_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can manage their habits" ON client_habits
  FOR ALL USING (auth.uid() = client_id);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can manage their habit logs" ON habit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM client_habits
      WHERE id = habit_logs.habit_id
      AND client_id = auth.uid()
    )
  );

-- Educational Resources
ALTER TABLE educational_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public resources" ON educational_resources
  FOR SELECT USING (is_public = true OR auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can manage their resources" ON educational_resources
  FOR ALL USING (auth.uid() = nutritionist_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_client_health_data_updated_at BEFORE UPDATE ON client_health_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_v2_updated_at BEFORE UPDATE ON meal_plans_v2
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educational_resources_updated_at BEFORE UPDATE ON educational_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
