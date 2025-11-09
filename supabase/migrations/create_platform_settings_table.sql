-- Create platform_settings table for storing application-wide settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);

-- Add RLS policies
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to read settings
CREATE POLICY "Admins can view platform settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to insert/update settings
CREATE POLICY "Admins can manage platform settings"
  ON platform_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert default messaging configuration
INSERT INTO platform_settings (key, value, description)
VALUES (
  'messaging_config',
  '{"messaging_enabled": true, "ai_auto_reply_enabled": true, "ai_auto_reply_message": "Thank you for your message! Our team has been notified and will get back to you shortly. In the meantime, feel free to check out our AI Health Coach for instant assistance! 🌟"}'::jsonb,
  'Customer messaging and AI auto-reply settings'
)
ON CONFLICT (key) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE platform_settings IS 'Stores platform-wide configuration settings as key-value pairs with JSONB values';
