-- Revenue and Payment Tracking for Nutritionists
CREATE TABLE IF NOT EXISTS nutritionist_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50), -- stripe, paypal, cash, etc.
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  transaction_id VARCHAR(255),
  description TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Documents (shared by nutritionists)
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100), -- meal_plan, progress_report, assessment, lab_results, etc.
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(100),
  description TEXT,
  is_shared_with_client BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutritionist Settings & Preferences
CREATE TABLE IF NOT EXISTS nutritionist_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,

  -- Business Information
  business_name VARCHAR(255),
  business_address TEXT,
  business_phone VARCHAR(50),
  license_number VARCHAR(100),
  specializations TEXT[], -- weight_loss, sports_nutrition, diabetes, etc.

  -- Availability & Scheduling
  consultation_duration_default INTEGER DEFAULT 60, -- minutes
  buffer_time_minutes INTEGER DEFAULT 15,
  working_hours JSONB, -- {"monday": {"start": "09:00", "end": "17:00"}, ...}
  time_zone VARCHAR(50) DEFAULT 'UTC',
  booking_advance_days INTEGER DEFAULT 30, -- how far in advance clients can book

  -- Pricing
  hourly_rate DECIMAL(10, 2),
  initial_consultation_fee DECIMAL(10, 2),
  follow_up_fee DECIMAL(10, 2),
  package_pricing JSONB, -- [{"name": "3 Month Plan", "sessions": 12, "price": 600}, ...]

  -- Notifications
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  appointment_reminders BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,

  -- Branding
  brand_color VARCHAR(7) DEFAULT '#10b981',
  logo_url TEXT,
  custom_email_signature TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Plan Templates (pre-built templates for quick assignment)
CREATE TABLE IF NOT EXISTS meal_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 7,
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  meal_structure JSONB, -- {"day1": {"breakfast": recipe_id, "lunch": recipe_id, ...}}
  tags TEXT[], -- weight_loss, muscle_gain, vegetarian, etc.
  is_public BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Goals Tracking
CREATE TABLE IF NOT EXISTS client_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_type VARCHAR(50), -- weight_loss, muscle_gain, health_improvement, habit_building
  target_value DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  unit VARCHAR(50), -- kg, lbs, %, etc.
  target_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, achieved, abandoned
  priority INTEGER DEFAULT 1, -- 1-5, where 1 is highest
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment Reminders/Notifications Queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- appointment_reminder, payment_due, milestone_achieved, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, cancelled
  delivery_method VARCHAR(50) DEFAULT 'email', -- email, sms, push
  metadata JSONB, -- additional data like appointment_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_earnings_nutritionist ON nutritionist_earnings(nutritionist_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON nutritionist_earnings(payment_status);
CREATE INDEX IF NOT EXISTS idx_documents_client ON client_documents(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_nutritionist ON client_documents(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_goals_client ON client_goals(client_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for, status);

-- RLS Policies

-- Nutritionist Earnings
ALTER TABLE nutritionist_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can view their own earnings" ON nutritionist_earnings;
CREATE POLICY "Nutritionists can view their own earnings" ON nutritionist_earnings
  FOR SELECT USING (auth.uid() = nutritionist_id);

DROP POLICY IF EXISTS "Nutritionists can manage their earnings" ON nutritionist_earnings;
CREATE POLICY "Nutritionists can manage their earnings" ON nutritionist_earnings
  FOR ALL USING (auth.uid() = nutritionist_id);

DROP POLICY IF EXISTS "Admins can view all earnings" ON nutritionist_earnings;
CREATE POLICY "Admins can view all earnings" ON nutritionist_earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Client Documents
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can manage documents" ON client_documents;
CREATE POLICY "Nutritionists can manage documents" ON client_documents
  FOR ALL USING (auth.uid() = nutritionist_id);

DROP POLICY IF EXISTS "Clients can view their shared documents" ON client_documents;
CREATE POLICY "Clients can view their shared documents" ON client_documents
  FOR SELECT USING (
    auth.uid() = client_id AND is_shared_with_client = true
  );

-- Nutritionist Settings
ALTER TABLE nutritionist_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can manage their settings" ON nutritionist_settings;
CREATE POLICY "Nutritionists can manage their settings" ON nutritionist_settings
  FOR ALL USING (auth.uid() = nutritionist_id);

-- Meal Plan Templates
ALTER TABLE meal_plan_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can manage their templates" ON meal_plan_templates;
CREATE POLICY "Nutritionists can manage their templates" ON meal_plan_templates
  FOR ALL USING (auth.uid() = nutritionist_id);

DROP POLICY IF EXISTS "Anyone can view public templates" ON meal_plan_templates;
CREATE POLICY "Anyone can view public templates" ON meal_plan_templates
  FOR SELECT USING (is_public = true);

-- Client Goals
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their goals" ON client_goals;
CREATE POLICY "Users can manage their goals" ON client_goals
  FOR ALL USING (
    auth.uid() = client_id OR
    auth.uid() = nutritionist_id
  );

-- Notification Queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON notification_queue;
CREATE POLICY "Users can view their notifications" ON notification_queue
  FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_nutritionist_earnings_updated_at ON nutritionist_earnings;
CREATE TRIGGER update_nutritionist_earnings_updated_at BEFORE UPDATE ON nutritionist_earnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_documents_updated_at ON client_documents;
CREATE TRIGGER update_client_documents_updated_at BEFORE UPDATE ON client_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nutritionist_settings_updated_at ON nutritionist_settings;
CREATE TRIGGER update_nutritionist_settings_updated_at BEFORE UPDATE ON nutritionist_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plan_templates_updated_at ON meal_plan_templates;
CREATE TRIGGER update_meal_plan_templates_updated_at BEFORE UPDATE ON meal_plan_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_goals_updated_at ON client_goals;
CREATE TRIGGER update_client_goals_updated_at BEFORE UPDATE ON client_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
