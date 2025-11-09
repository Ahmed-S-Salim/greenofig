-- Create visitor_inquiries table for storing lead captures from website visitors
CREATE TABLE IF NOT EXISTS visitor_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  question TEXT,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'closed')),
  assigned_to UUID REFERENCES user_profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  contacted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visitor_inquiries_email ON visitor_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_visitor_inquiries_status ON visitor_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_visitor_inquiries_created_at ON visitor_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_inquiries_assigned_to ON visitor_inquiries(assigned_to);

-- Add RLS policies
ALTER TABLE visitor_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can submit visitor inquiries" ON visitor_inquiries;
DROP POLICY IF EXISTS "Admins and nutritionists can view inquiries" ON visitor_inquiries;
DROP POLICY IF EXISTS "Admins and nutritionists can update inquiries" ON visitor_inquiries;

-- Allow public to insert (for lead capture)
CREATE POLICY "Anyone can submit visitor inquiries"
  ON visitor_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins and nutritionists to view all inquiries
CREATE POLICY "Admins and nutritionists can view inquiries"
  ON visitor_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'nutritionist')
    )
  );

-- Allow admins and nutritionists to update inquiries
CREATE POLICY "Admins and nutritionists can update inquiries"
  ON visitor_inquiries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'nutritionist')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin', 'nutritionist')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_visitor_inquiry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_visitor_inquiry_timestamp ON visitor_inquiries;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_visitor_inquiry_timestamp
  BEFORE UPDATE ON visitor_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_visitor_inquiry_timestamp();

-- Add comment to table
COMMENT ON TABLE visitor_inquiries IS 'Stores lead captures from website visitors who want to contact the team';
