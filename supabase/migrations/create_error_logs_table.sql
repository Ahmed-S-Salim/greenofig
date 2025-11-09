-- Create error_logs table for AI Error Monitoring System
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_type VARCHAR(100),
  component_name VARCHAR(255),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_agent TEXT,
  url TEXT,
  source_file TEXT,
  line_number INTEGER,
  column_number INTEGER,
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'analyzing', 'fixed', 'ignored'
  browser_info JSONB,
  ai_analysis JSONB, -- Store AI's root cause analysis
  ai_fix_suggestion TEXT, -- Store AI's suggested fix code
  ai_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view all errors
CREATE POLICY "Admins can view all error logs" ON error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Only admins can update errors (mark as fixed, etc.)
CREATE POLICY "Admins can update error logs" ON error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Anyone can insert errors (for logging)
CREATE POLICY "Anyone can insert error logs" ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE error_logs IS 'Stores application errors for AI-powered monitoring and auto-fixing';
