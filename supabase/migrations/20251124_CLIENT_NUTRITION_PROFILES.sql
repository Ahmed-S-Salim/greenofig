-- Client Nutrition Profiles Table
-- Stores personalized nutrition data for each client

CREATE TABLE IF NOT EXISTS client_nutrition_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Basic measurements
  height_cm NUMERIC(5,1),
  current_weight_kg NUMERIC(5,1),
  target_weight_kg NUMERIC(5,1),
  date_of_birth DATE,
  gender VARCHAR(20),
  activity_level VARCHAR(20) DEFAULT 'moderate',

  -- Health conditions (stored as JSON array)
  health_conditions JSONB DEFAULT '[]',
  medications TEXT,

  -- Dietary preferences
  diet_type VARCHAR(30) DEFAULT 'omnivore',
  allergies JSONB DEFAULT '[]',
  food_intolerances JSONB DEFAULT '[]',
  disliked_foods JSONB DEFAULT '[]',
  favorite_foods JSONB DEFAULT '[]',

  -- Goals
  primary_goal VARCHAR(30) DEFAULT 'weight_loss',
  secondary_goals JSONB DEFAULT '[]',
  target_calories INTEGER DEFAULT 2000,
  target_protein_g INTEGER DEFAULT 150,
  target_carbs_g INTEGER DEFAULT 200,
  target_fat_g INTEGER DEFAULT 65,

  -- Lifestyle
  meals_per_day INTEGER DEFAULT 3,
  snacks_per_day INTEGER DEFAULT 2,
  cooking_skill VARCHAR(20) DEFAULT 'intermediate',
  prep_time_minutes INTEGER DEFAULT 30,
  budget VARCHAR(20) DEFAULT 'moderate',

  -- Notes
  notes TEXT,
  special_instructions TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_client ON client_nutrition_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_profiles_nutritionist ON client_nutrition_profiles(nutritionist_id);

-- Enable RLS
ALTER TABLE client_nutrition_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Nutritionists can view all profiles" ON client_nutrition_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Nutritionists can insert profiles" ON client_nutrition_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Nutritionists can update profiles" ON client_nutrition_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Clients can view own profile" ON client_nutrition_profiles
  FOR SELECT USING (client_id = auth.uid());

-- Client Goals table (if not exists)
CREATE TABLE IF NOT EXISTS client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  goal_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2),
  unit VARCHAR(30),
  target_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_goals_client ON client_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_client_goals_status ON client_goals(status);

ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage goals" ON client_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Clients can view own goals" ON client_goals
  FOR SELECT USING (client_id = auth.uid());
