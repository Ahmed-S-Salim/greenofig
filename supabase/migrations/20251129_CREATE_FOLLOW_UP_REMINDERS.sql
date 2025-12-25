-- Create follow_up_reminders table for nutritionist follow-up reminders
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL DEFAULT 'custom',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence VARCHAR(20) DEFAULT 'once', -- once, daily, weekly, biweekly, monthly
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, overdue, snoozed
  auto_send_message BOOLEAN DEFAULT FALSE,
  message_template TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_nutritionist ON follow_up_reminders(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_client ON follow_up_reminders(client_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_status ON follow_up_reminders(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_due_date ON follow_up_reminders(due_date);

-- Enable RLS
ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Nutritionists can manage their own reminders
CREATE POLICY "Nutritionists can manage their reminders" ON follow_up_reminders
  FOR ALL USING (
    auth.uid() = nutritionist_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Clients can view reminders about them (read-only)
CREATE POLICY "Clients can view their reminders" ON follow_up_reminders
  FOR SELECT USING (auth.uid() = client_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_follow_up_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_up_reminders_updated_at
  BEFORE UPDATE ON follow_up_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_up_reminders_updated_at();

-- Grant access
GRANT ALL ON follow_up_reminders TO authenticated;
