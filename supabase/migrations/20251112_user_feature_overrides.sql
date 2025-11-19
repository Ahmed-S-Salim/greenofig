-- Migration: User Feature Overrides Table
-- Created: 2025-11-12
-- Purpose: Allow super admins to override subscription-based features for specific users

-- Create user_feature_overrides table
CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  features JSONB NOT NULL DEFAULT '{}',
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add indexes
CREATE INDEX idx_user_feature_overrides_user_id ON user_feature_overrides(user_id);
CREATE INDEX idx_user_feature_overrides_expires_at ON user_feature_overrides(expires_at) WHERE expires_at IS NOT NULL;

-- Add RLS policies
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all overrides
CREATE POLICY "Super admins can manage feature overrides"
  ON user_feature_overrides
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can view their own overrides
CREATE POLICY "Users can view their own overrides"
  ON user_feature_overrides
  FOR SELECT
  USING (user_id = auth.uid());

-- Add comment
COMMENT ON TABLE user_feature_overrides IS 'Stores feature access overrides for individual users, allowing super admins to grant/revoke features regardless of subscription plan';

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_user_feature_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_feature_overrides_updated_at
  BEFORE UPDATE ON user_feature_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feature_overrides_updated_at();

-- Create admin audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES user_profiles(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX idx_admin_audit_log_target_user_id ON admin_audit_log(target_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
  ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Only super admins can insert audit logs (via app, not directly)
CREATE POLICY "Super admins can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

COMMENT ON TABLE admin_audit_log IS 'Tracks all administrative actions for security and compliance';
