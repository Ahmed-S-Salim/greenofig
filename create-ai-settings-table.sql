-- Create AI Coach settings table for flexible AI provider configuration
CREATE TABLE IF NOT EXISTS ai_coach_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'claude', 'custom')),
  is_active BOOLEAN DEFAULT false,
  api_key TEXT NOT NULL,
  model_name TEXT,
  temperature DECIMAL(3, 2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 500,
  system_prompt TEXT,
  api_endpoint TEXT,
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active provider lookup
CREATE INDEX IF NOT EXISTS idx_ai_coach_active ON ai_coach_settings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_coach_provider ON ai_coach_settings(provider);

-- Enable Row Level Security
ALTER TABLE ai_coach_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active AI settings (needed for the app)
CREATE POLICY "Anyone can view active AI settings" ON ai_coach_settings
  FOR SELECT USING (is_active = true);

-- Policy: Admins can view all AI settings
CREATE POLICY "Admins can view all AI settings" ON ai_coach_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can insert AI settings
CREATE POLICY "Admins can create AI settings" ON ai_coach_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can update AI settings
CREATE POLICY "Admins can update AI settings" ON ai_coach_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can delete AI settings
CREATE POLICY "Admins can delete AI settings" ON ai_coach_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default Gemini configuration
INSERT INTO ai_coach_settings (
  provider,
  is_active,
  api_key,
  model_name,
  temperature,
  max_tokens,
  display_name,
  description,
  system_prompt
) VALUES (
  'gemini',
  true,
  'AIzaSyBUH3HZjwbIzMqrk-RfxqqK5iU9TRiRrw0',
  'gemini-2.5-flash',
  0.7,
  500,
  'Gemini 2.5 Flash',
  'Google Gemini - Fast and efficient AI model for health coaching',
  'You are a friendly and knowledgeable health and wellness AI coach for GreeonFig. Provide personalized health advice, meal suggestions, workout tips, and motivation. Keep responses concise, friendly, and actionable. Use emojis occasionally to be engaging.'
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE ai_coach_settings IS 'Stores AI provider configurations for the AI Coach feature';
COMMENT ON COLUMN ai_coach_settings.provider IS 'AI provider: gemini, openai, claude, or custom';
COMMENT ON COLUMN ai_coach_settings.is_active IS 'Only one provider should be active at a time';
COMMENT ON COLUMN ai_coach_settings.api_key IS 'API key for the provider';
COMMENT ON COLUMN ai_coach_settings.model_name IS 'Specific model to use (e.g., gpt-4, claude-3-opus)';
COMMENT ON COLUMN ai_coach_settings.api_endpoint IS 'Custom API endpoint (for custom providers)';
