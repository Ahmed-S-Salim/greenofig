-- Issues/Support Tickets Table
-- Tracks user support tickets and feedback

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Ticket details
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_issues_user ON issues(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_assigned ON issues(assigned_to, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category, created_at DESC);

-- Enable RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own issues" ON issues;
DROP POLICY IF EXISTS "Users can create issues" ON issues;
DROP POLICY IF EXISTS "Admins can view all issues" ON issues;
DROP POLICY IF EXISTS "Admins can update issues" ON issues;

-- RLS Policies

-- Users can view their own issues
CREATE POLICY "Users can view their own issues" ON issues
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create issues
CREATE POLICY "Users can create issues" ON issues
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins and nutritionists can view all issues
CREATE POLICY "Admins can view all issues" ON issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'nutritionist')
    )
  );

-- Admins can update all issues
CREATE POLICY "Admins can update issues" ON issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Issues table created! ✅' as status;
SELECT 'Users can now submit support tickets' as info;
