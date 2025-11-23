-- Migration: Nutritionist Client Management System
-- Description: Creates tables for tier-based nutritionist-client management
-- Date: 2025-11-22

-- Create nutritionist_notes table for storing nutritionist notes about clients
CREATE TABLE IF NOT EXISTS nutritionist_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, nutritionist_id)
);

-- Create client_progress table for tracking client weight and progress
CREATE TABLE IF NOT EXISTS client_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg DECIMAL(5, 2),
  body_fat_percentage DECIMAL(4, 2),
  muscle_mass_kg DECIMAL(5, 2),
  waist_cm DECIMAL(5, 2),
  chest_cm DECIMAL(5, 2),
  hips_cm DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, date)
);

-- Create nutritionist_client_assignments table for explicit nutritionist-client relationships
CREATE TABLE IF NOT EXISTS nutritionist_client_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  tier TEXT DEFAULT 'Base' CHECK (tier IN ('Base', 'Premium', 'Elite')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nutritionist_id, client_id)
);

-- Create client_communication_log table for tracking messages
CREATE TABLE IF NOT EXISTS client_communication_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('message', 'email', 'video_call', 'phone_call', 'check_in')),
  subject TEXT,
  message TEXT,
  response_time_hours INTEGER,
  tier_at_time TEXT CHECK (tier_at_time IN ('Base', 'Premium', 'Elite')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_nutritionist_notes_client ON nutritionist_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_notes_nutritionist ON nutritionist_notes(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_client ON client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_date ON client_progress(date DESC);
CREATE INDEX IF NOT EXISTS idx_nutritionist_assignments_nutritionist ON nutritionist_client_assignments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_assignments_client ON nutritionist_client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_assignments_status ON nutritionist_client_assignments(status);
CREATE INDEX IF NOT EXISTS idx_communication_log_nutritionist ON client_communication_log(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_client ON client_communication_log(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_created ON client_communication_log(created_at DESC);

-- Add tier column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND column_name = 'tier'
    ) THEN
        ALTER TABLE user_profiles
        ADD COLUMN tier TEXT DEFAULT 'Base' CHECK (tier IN ('Base', 'Premium', 'Elite'));

        CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE nutritionist_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_client_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communication_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutritionist_notes

-- Nutritionists can view and edit notes for their clients
CREATE POLICY "Nutritionists can view their client notes"
  ON nutritionist_notes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = nutritionist_id
    OR auth.uid() = client_id
  );

CREATE POLICY "Nutritionists can insert notes for clients"
  ON nutritionist_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

CREATE POLICY "Nutritionists can update their notes"
  ON nutritionist_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can delete their notes"
  ON nutritionist_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = nutritionist_id);

-- RLS Policies for client_progress

-- Clients can view and edit their own progress
CREATE POLICY "Clients can view their own progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own progress"
  ON client_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own progress"
  ON client_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id);

-- Nutritionists can view progress of their assigned clients
CREATE POLICY "Nutritionists can view client progress"
  ON client_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

-- RLS Policies for nutritionist_client_assignments

CREATE POLICY "Nutritionists can view their assignments"
  ON nutritionist_client_assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = nutritionist_id
    OR auth.uid() = client_id
  );

CREATE POLICY "Nutritionists can create assignments"
  ON nutritionist_client_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

CREATE POLICY "Nutritionists can update their assignments"
  ON nutritionist_client_assignments FOR UPDATE
  TO authenticated
  USING (auth.uid() = nutritionist_id);

-- RLS Policies for client_communication_log

CREATE POLICY "Users can view their communication logs"
  ON client_communication_log FOR SELECT
  TO authenticated
  USING (
    auth.uid() = nutritionist_id
    OR auth.uid() = client_id
  );

CREATE POLICY "Nutritionists can insert communication logs"
  ON client_communication_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_nutritionist_notes_updated_at ON nutritionist_notes;
CREATE TRIGGER update_nutritionist_notes_updated_at
    BEFORE UPDATE ON nutritionist_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_progress_updated_at ON client_progress;
CREATE TRIGGER update_client_progress_updated_at
    BEFORE UPDATE ON client_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nutritionist_assignments_updated_at ON nutritionist_client_assignments;
CREATE TRIGGER update_nutritionist_assignments_updated_at
    BEFORE UPDATE ON nutritionist_client_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for nutritionist dashboard statistics
CREATE OR REPLACE VIEW nutritionist_dashboard_stats AS
SELECT
  n.id as nutritionist_id,
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT CASE WHEN c.tier = 'Base' THEN c.id END) as base_clients,
  COUNT(DISTINCT CASE WHEN c.tier = 'Premium' THEN c.id END) as premium_clients,
  COUNT(DISTINCT CASE WHEN c.tier = 'Elite' THEN c.id END) as elite_clients,
  COUNT(DISTINCT CASE WHEN cp.date >= CURRENT_DATE - INTERVAL '7 days' THEN c.id END) as active_clients,
  (COUNT(DISTINCT CASE WHEN c.tier = 'Premium' THEN c.id END) * 29 +
   COUNT(DISTINCT CASE WHEN c.tier = 'Elite' THEN c.id END) * 59) as estimated_monthly_revenue
FROM user_profiles n
LEFT JOIN user_profiles c ON c.role = 'user'
LEFT JOIN client_progress cp ON cp.client_id = c.id
WHERE n.role = 'nutritionist'
GROUP BY n.id;

-- Grant access to view
GRANT SELECT ON nutritionist_dashboard_stats TO authenticated;

-- Add helpful comments
COMMENT ON TABLE nutritionist_notes IS 'Stores private notes nutritionists make about their clients';
COMMENT ON TABLE client_progress IS 'Tracks client weight, measurements, and progress over time';
COMMENT ON TABLE nutritionist_client_assignments IS 'Manages explicit nutritionist-client relationships and tier levels';
COMMENT ON TABLE client_communication_log IS 'Logs all communication between nutritionists and clients';
COMMENT ON VIEW nutritionist_dashboard_stats IS 'Aggregated statistics for nutritionist dashboards';
