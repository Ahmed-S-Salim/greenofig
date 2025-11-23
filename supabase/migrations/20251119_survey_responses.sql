-- Survey Responses Table
-- Stores individual survey submissions for analytics and tracking

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Demographics
  age INTEGER,
  gender VARCHAR(50),

  -- Body Metrics
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),

  -- Lifestyle
  activity_level VARCHAR(50),

  -- Goals and Preferences (stored as JSONB arrays)
  health_goals JSONB DEFAULT '[]'::jsonb,
  dietary_preferences JSONB DEFAULT '[]'::jsonb,
  health_conditions JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_completed_at ON survey_responses(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_responses_age ON survey_responses(age);
CREATE INDEX IF NOT EXISTS idx_survey_responses_gender ON survey_responses(gender);

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own survey responses
CREATE POLICY "Users can view own survey responses"
  ON survey_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own survey responses
CREATE POLICY "Users can insert own survey responses"
  ON survey_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own survey responses
CREATE POLICY "Users can update own survey responses"
  ON survey_responses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all survey responses
CREATE POLICY "Admins can view all survey responses"
  ON survey_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_survey_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_responses_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON survey_responses TO authenticated;
GRANT SELECT ON survey_responses TO anon;

COMMENT ON TABLE survey_responses IS 'Stores individual survey submissions for analytics and user tracking';
COMMENT ON COLUMN survey_responses.health_goals IS 'Array of health goals (e.g., ["lose_weight", "build_muscle"])';
COMMENT ON COLUMN survey_responses.dietary_preferences IS 'Array of dietary preferences (e.g., ["vegetarian", "gluten_free"])';
COMMENT ON COLUMN survey_responses.health_conditions IS 'Array of health conditions (e.g., ["diabetes", "high_blood_pressure"])';
