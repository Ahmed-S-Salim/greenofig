-- Create activity_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  target_id UUID,
  target_type TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target ON activity_logs(target_id, target_type);

-- Enable Row Level Security
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;

-- Policy: Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'analyst')
    )
  );

-- Policy: System can insert activity logs (authenticated users can log their own activities)
CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

-- Policy: Admins can insert activity logs for any user
CREATE POLICY "Admins can insert any activity logs" ON activity_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

COMMENT ON TABLE activity_logs IS 'Tracks all admin and user activities for audit purposes';
COMMENT ON COLUMN activity_logs.activity_type IS 'Type of activity performed (e.g., user_created, blog_published)';
COMMENT ON COLUMN activity_logs.details IS 'JSON object containing additional details about the activity';
COMMENT ON COLUMN activity_logs.target_id IS 'ID of the resource that was affected by the activity';
COMMENT ON COLUMN activity_logs.target_type IS 'Type of the affected resource (e.g., user, blog_post, subscription)';
COMMENT ON COLUMN activity_logs.ip_address IS 'IP address from which the activity was performed';
COMMENT ON COLUMN activity_logs.user_agent IS 'Browser user agent string';
