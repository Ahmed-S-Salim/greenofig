-- =====================================================
-- COMPREHENSIVE NUTRITIONIST PLATFORM FEATURES
-- Date: 2025-11-22
-- Implements:
--   1. Client Assignment & Onboarding
--   2. Progress Tracking & Goals
--   3. Communication Management
--   4. Notifications
--   5. Payment Processing
-- =====================================================

-- =====================================================
-- 1. CLIENT ASSIGNMENT & ONBOARDING SYSTEM
-- =====================================================

-- Client intake forms
CREATE TABLE IF NOT EXISTS client_intake_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Personal Information
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm DECIMAL(5, 2),
  current_weight_kg DECIMAL(5, 2),
  target_weight_kg DECIMAL(5, 2),

  -- Health Information
  medical_conditions TEXT[], -- Array of conditions
  allergies TEXT[],
  medications TEXT[],
  dietary_restrictions TEXT[], -- vegetarian, vegan, gluten-free, etc.

  -- Lifestyle
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'extremely_active')),
  sleep_hours INTEGER,
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
  water_intake_liters DECIMAL(3, 1),

  -- Goals & Motivation
  primary_goal TEXT CHECK (primary_goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'athletic_performance', 'health_improvement')),
  goal_deadline DATE,
  motivation_level TEXT CHECK (motivation_level IN ('low', 'medium', 'high')),
  previous_diet_experience TEXT,

  -- Preferences
  preferred_meal_times TEXT,
  cooking_skill_level TEXT CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  budget_per_week DECIMAL(8, 2),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_id)
);

-- Client assignment requests
CREATE TABLE IF NOT EXISTS client_assignment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_tier TEXT DEFAULT 'Base' CHECK (requested_tier IN ('Base', 'Premium', 'Elite')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PROGRESS TRACKING & GOALS SYSTEM
-- =====================================================

-- Client goals
CREATE TABLE IF NOT EXISTS client_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- SMART Goal attributes
  goal_type TEXT NOT NULL CHECK (goal_type IN ('weight', 'body_fat', 'muscle_mass', 'measurements', 'habit', 'nutrition', 'fitness', 'other')),
  title TEXT NOT NULL,
  description TEXT,

  -- Specific & Measurable
  target_value DECIMAL(10, 2),
  current_value DECIMAL(10, 2),
  unit TEXT, -- kg, %, cm, servings, workouts, etc.

  -- Achievable & Relevant
  difficulty TEXT CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'very_challenging')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Time-bound
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,

  -- Progress tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled', 'failed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,

  -- Milestones
  milestones JSONB, -- [{ value: 75, date: '2024-01-15', achieved: true }]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal progress updates
CREATE TABLE IF NOT EXISTS goal_progress_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES client_goals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  current_value DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'okay', 'struggling', 'frustrated')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Body measurements tracking (enhanced)
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Weight & Composition
  weight_kg DECIMAL(5, 2),
  body_fat_percentage DECIMAL(4, 2),
  muscle_mass_kg DECIMAL(5, 2),
  bmi DECIMAL(4, 2),

  -- Circumferences
  neck_cm DECIMAL(5, 2),
  shoulders_cm DECIMAL(5, 2),
  chest_cm DECIMAL(5, 2),
  waist_cm DECIMAL(5, 2),
  hips_cm DECIMAL(5, 2),
  thigh_left_cm DECIMAL(5, 2),
  thigh_right_cm DECIMAL(5, 2),
  calf_left_cm DECIMAL(5, 2),
  calf_right_cm DECIMAL(5, 2),
  bicep_left_cm DECIMAL(5, 2),
  bicep_right_cm DECIMAL(5, 2),

  -- Photos
  front_photo_url TEXT,
  side_photo_url TEXT,
  back_photo_url TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_id, date)
);

-- Achievement badges
CREATE TABLE IF NOT EXISTS client_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'first_goal_completed', 'weight_milestone_5kg', 'weight_milestone_10kg',
    'consistency_7days', 'consistency_30days', 'consistency_90days',
    'perfect_week', 'early_riser', 'hydration_master', 'meal_prep_pro',
    'fitness_enthusiast', 'transformation_hero'
  )),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 0,
  achieved_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. COMMUNICATION MANAGEMENT (TIER-BASED)
-- =====================================================

-- Message threads
CREATE TABLE IF NOT EXISTS message_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  message_text TEXT NOT NULL,
  attachments JSONB, -- [{ url: '...', filename: '...', type: 'image/pdf' }]

  -- Status tracking
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Tier-based tracking
  client_tier TEXT CHECK (client_tier IN ('Base', 'Premium', 'Elite')),
  response_time_minutes INTEGER, -- Time taken to respond

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message templates for common responses
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('welcome', 'encouragement', 'meal_plan', 'workout', 'progress_check', 'general')),
  template_text TEXT NOT NULL,
  variables JSONB, -- { "client_name": "{{name}}", "goal": "{{goal}}" }
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video consultation scheduling (Elite tier)
CREATE TABLE IF NOT EXISTS video_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  scheduled_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_url TEXT,
  meeting_id TEXT,

  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  recording_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. NOTIFICATION SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification details
  type TEXT NOT NULL CHECK (type IN (
    'message', 'appointment_reminder', 'goal_milestone', 'payment_due',
    'client_inactive', 'new_client', 'progress_update', 'achievement',
    'tier_upgrade', 'tier_downgrade'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Action details
  action_url TEXT, -- Where to navigate when clicked
  action_type TEXT, -- 'navigate', 'modal', etc.
  metadata JSONB, -- Additional data for the notification

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Delivery channels
  sent_push BOOLEAN DEFAULT false,
  sent_email BOOLEAN DEFAULT false,
  sent_sms BOOLEAN DEFAULT false,

  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Auto-delete after expiry
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel preferences
  enable_push BOOLEAN DEFAULT true,
  enable_email BOOLEAN DEFAULT true,
  enable_sms BOOLEAN DEFAULT false,

  -- Notification type preferences
  messages BOOLEAN DEFAULT true,
  appointments BOOLEAN DEFAULT true,
  goals BOOLEAN DEFAULT true,
  payments BOOLEAN DEFAULT true,
  achievements BOOLEAN DEFAULT true,

  -- Quiet hours
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- =====================================================
-- 5. PAYMENT PROCESSING SYSTEM
-- =====================================================

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Tier information
  tier TEXT NOT NULL CHECK (tier IN ('Base', 'Premium', 'Elite')),
  price_per_month DECIMAL(8, 2) NOT NULL,

  -- Stripe details
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- Billing cycle
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'quarterly', 'annually')),
  current_period_start DATE,
  current_period_end DATE,
  next_billing_date DATE,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'paused', 'trialing')),
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,

  trial_start DATE,
  trial_end DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Payment details
  amount DECIMAL(8, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Stripe details
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('card', 'bank_transfer', 'other')),

  -- Dates
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  invoice_number TEXT UNIQUE NOT NULL,

  -- Amounts
  subtotal DECIMAL(8, 2) NOT NULL,
  tax DECIMAL(8, 2) DEFAULT 0,
  discount DECIMAL(8, 2) DEFAULT 0,
  total DECIMAL(8, 2) NOT NULL,

  -- Stripe details
  stripe_invoice_id TEXT UNIQUE,
  stripe_invoice_url TEXT,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

  -- Dates
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,

  -- PDF
  invoice_pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Revenue by tier
  base_tier_revenue DECIMAL(8, 2) DEFAULT 0,
  premium_tier_revenue DECIMAL(8, 2) DEFAULT 0,
  elite_tier_revenue DECIMAL(8, 2) DEFAULT 0,
  total_revenue DECIMAL(8, 2) DEFAULT 0,

  -- Client counts
  base_tier_clients INTEGER DEFAULT 0,
  premium_tier_clients INTEGER DEFAULT 0,
  elite_tier_clients INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,

  -- Metrics
  new_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  upgraded_clients INTEGER DEFAULT 0,
  downgraded_clients INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(nutritionist_id, date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Client intake forms
CREATE INDEX IF NOT EXISTS idx_intake_forms_client ON client_intake_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_nutritionist ON client_intake_forms(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_status ON client_intake_forms(status);

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_client ON client_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_goals_nutritionist ON client_goals(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON client_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON client_goals(target_date);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_nutritionist ON subscriptions(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payment_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payment_history(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payment_history(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE client_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assignment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Clients can view/edit their own data
CREATE POLICY "Clients can view their intake forms"
  ON client_intake_forms FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

CREATE POLICY "Clients can insert their intake forms"
  ON client_intake_forms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients and nutritionists can update intake forms"
  ON client_intake_forms FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

-- Goals policies
CREATE POLICY "Clients can view their goals"
  ON client_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can create goals for clients"
  ON client_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'nutritionist')
  );

CREATE POLICY "Nutritionists and clients can update goals"
  ON client_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Clients can view their subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

-- Payment history policies
CREATE POLICY "Clients can view their payment history"
  ON payment_history FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id OR auth.uid() = nutritionist_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_intake_forms_updated_at
  BEFORE UPDATE ON client_intake_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON client_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, priority)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_priority)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Function to send appointment reminder notifications
CREATE OR REPLACE FUNCTION send_appointment_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_appointment RECORD;
BEGIN
  -- Find appointments in next 24 hours
  FOR v_appointment IN
    SELECT a.*, up.full_name, up.tier
    FROM video_consultations a
    JOIN user_profiles up ON up.id = a.client_id
    WHERE a.status = 'scheduled'
    AND a.scheduled_time > NOW()
    AND a.scheduled_time <= NOW() + INTERVAL '24 hours'
  LOOP
    -- Send notification to client
    PERFORM create_notification(
      v_appointment.client_id,
      'appointment_reminder',
      'Upcoming Consultation',
      'You have a video consultation tomorrow at ' || to_char(v_appointment.scheduled_time, 'HH24:MI'),
      '/app/schedule',
      'high'
    );

    -- Send notification to nutritionist
    PERFORM create_notification(
      v_appointment.nutritionist_id,
      'appointment_reminder',
      'Upcoming Consultation',
      'You have a consultation with ' || v_appointment.full_name || ' tomorrow at ' || to_char(v_appointment.scheduled_time, 'HH24:MI'),
      '/app/schedule',
      'high'
    );
  END LOOP;
END;
$$;

-- =====================================================
-- HELPFUL VIEWS
-- =====================================================

-- View for nutritionist revenue dashboard
CREATE OR REPLACE VIEW nutritionist_revenue_overview AS
SELECT
  n.id as nutritionist_id,
  n.full_name as nutritionist_name,
  COUNT(DISTINCT s.id) as total_subscriptions,
  COUNT(DISTINCT CASE WHEN s.tier = 'Base' THEN s.id END) as base_subscriptions,
  COUNT(DISTINCT CASE WHEN s.tier = 'Premium' THEN s.id END) as premium_subscriptions,
  COUNT(DISTINCT CASE WHEN s.tier = 'Elite' THEN s.id END) as elite_subscriptions,
  SUM(CASE WHEN s.status = 'active' THEN s.price_per_month ELSE 0 END) as monthly_recurring_revenue,
  SUM(CASE WHEN ph.status = 'succeeded' AND ph.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN ph.amount ELSE 0 END) as revenue_last_30_days,
  SUM(CASE WHEN ph.status = 'succeeded' THEN ph.amount ELSE 0 END) as total_lifetime_revenue
FROM user_profiles n
LEFT JOIN subscriptions s ON s.nutritionist_id = n.id
LEFT JOIN payment_history ph ON ph.nutritionist_id = n.id
WHERE n.role = 'nutritionist'
GROUP BY n.id, n.full_name;

GRANT SELECT ON nutritionist_revenue_overview TO authenticated;

-- View for client dashboard stats
CREATE OR REPLACE VIEW client_dashboard_stats AS
SELECT
  c.id as client_id,
  c.full_name as client_name,
  c.tier,
  COUNT(DISTINCT cg.id) as total_goals,
  COUNT(DISTINCT CASE WHEN cg.status = 'active' THEN cg.id END) as active_goals,
  COUNT(DISTINCT CASE WHEN cg.status = 'completed' THEN cg.id END) as completed_goals,
  AVG(CASE WHEN cg.status = 'active' THEN cg.progress_percentage END) as avg_goal_progress,
  COUNT(DISTINCT ca.id) as total_achievements
FROM user_profiles c
LEFT JOIN client_goals cg ON cg.client_id = c.id
LEFT JOIN client_achievements ca ON ca.client_id = c.id
WHERE c.role = 'user'
GROUP BY c.id, c.full_name, c.tier;

GRANT SELECT ON client_dashboard_stats TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE client_intake_forms IS 'Initial client questionnaire and health assessment';
COMMENT ON TABLE client_goals IS 'SMART goals for client progress tracking';
COMMENT ON TABLE body_measurements IS 'Detailed body measurements and progress photos';
COMMENT ON TABLE client_achievements IS 'Gamification badges and rewards';
COMMENT ON TABLE messages IS 'Client-nutritionist messaging with tier-based restrictions';
COMMENT ON TABLE video_consultations IS 'Video call scheduling for Elite tier clients';
COMMENT ON TABLE notifications IS 'System notifications and alerts';
COMMENT ON TABLE subscriptions IS 'Client subscription management with Stripe integration';
COMMENT ON TABLE payment_history IS 'Payment transaction history';
COMMENT ON TABLE revenue_analytics IS 'Daily revenue analytics for nutritionists';

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default notification preferences for all existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;
