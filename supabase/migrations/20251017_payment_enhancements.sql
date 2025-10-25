-- =====================================================
-- PAYMENT SYSTEM ENHANCEMENTS
-- Includes: Invoices, Refunds, Payment Methods,
-- Dunning, Notifications, Analytics
-- =====================================================

-- =====================================================
-- 1. INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  payment_transaction_id UUID REFERENCES payment_transactions(id),

  -- Invoice details
  amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void', 'refunded')),

  -- Billing details
  billing_name TEXT,
  billing_email TEXT,
  billing_address JSONB DEFAULT '{}',

  -- Dates
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,

  -- PDF storage
  pdf_url TEXT,

  -- Additional data
  line_items JSONB DEFAULT '[]',
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- =====================================================
-- 2. REFUNDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Refund details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  reason TEXT,
  refund_type TEXT CHECK (refund_type IN ('full', 'partial')) DEFAULT 'full',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected', 'failed')),

  -- Stripe info
  stripe_refund_id TEXT,

  -- Admin info
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  processed_by UUID REFERENCES auth.users(id),

  -- Dates
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Notes
  admin_notes TEXT,
  customer_notes TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refunds_user_id ON refunds(user_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_payment_transaction_id ON refunds(payment_transaction_id);

-- =====================================================
-- 3. PAYMENT METHODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Payment method details
  stripe_payment_method_id TEXT,
  payment_type TEXT CHECK (payment_type IN ('card', 'bank_account', 'paypal', 'apple_pay', 'google_pay')),

  -- Card details (if card)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_fingerprint TEXT,

  -- Bank details (if bank_account)
  bank_name TEXT,
  bank_last4 TEXT,

  -- Status
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'inactive', 'failed_verification')),

  -- Billing address
  billing_details JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_payment_methods_status ON payment_methods(status);

-- =====================================================
-- 4. DUNNING MANAGEMENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_failures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  payment_transaction_id UUID REFERENCES payment_transactions(id),

  -- Failure details
  failure_reason TEXT,
  failure_code TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Retry information
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_retry_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending_retry' CHECK (status IN (
    'pending_retry',
    'retrying',
    'recovered',
    'grace_period',
    'dunning_complete',
    'cancelled'
  )),

  -- Grace period
  grace_period_end TIMESTAMPTZ,

  -- Notifications sent
  notifications_sent INTEGER DEFAULT 0,
  last_notification_at TIMESTAMPTZ,

  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolution_type TEXT CHECK (resolution_type IN ('payment_succeeded', 'payment_method_updated', 'subscription_cancelled', 'manual_resolution')),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_failures_user_id ON payment_failures(user_id);
CREATE INDEX idx_payment_failures_status ON payment_failures(status);
CREATE INDEX idx_payment_failures_next_retry_at ON payment_failures(next_retry_at);

-- =====================================================
-- 5. PAYMENT NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'payment_succeeded',
    'payment_failed',
    'upcoming_renewal',
    'payment_method_expiring',
    'subscription_cancelled',
    'invoice_ready',
    'refund_processed',
    'trial_ending',
    'dunning_warning',
    'subscription_paused',
    'subscription_resumed'
  )),

  -- Content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  template_id TEXT,

  -- Delivery
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'in_app', 'sms', 'push')),
  recipient_email TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),

  -- Timestamps
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Related entities
  related_transaction_id UUID REFERENCES payment_transactions(id),
  related_subscription_id UUID REFERENCES user_subscriptions(id),
  related_invoice_id UUID REFERENCES invoices(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_notifications_user_id ON payment_notifications(user_id);
CREATE INDEX idx_payment_notifications_status ON payment_notifications(status);
CREATE INDEX idx_payment_notifications_notification_type ON payment_notifications(notification_type);
CREATE INDEX idx_payment_notifications_scheduled_at ON payment_notifications(scheduled_at);

-- =====================================================
-- 6. SUBSCRIPTION CHANGES TABLE (for upgrades/downgrades)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),

  -- Change details
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'plan_change', 'billing_cycle_change', 'pause', 'resume', 'cancel')),

  -- Old and new plans
  old_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  old_billing_cycle TEXT,
  new_billing_cycle TEXT,

  -- Pricing
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2),
  proration_amount DECIMAL(10, 2) DEFAULT 0,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'failed', 'cancelled')),

  -- Timing
  effective_date TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Reason
  change_reason TEXT,
  initiated_by UUID REFERENCES auth.users(id),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_changes_user_id ON subscription_changes(user_id);
CREATE INDEX idx_subscription_changes_subscription_id ON subscription_changes(subscription_id);
CREATE INDEX idx_subscription_changes_status ON subscription_changes(status);

-- =====================================================
-- 7. REVENUE ANALYTICS TABLE (for caching/aggregation)
-- =====================================================
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Time period
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Revenue metrics
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  new_revenue DECIMAL(12, 2) DEFAULT 0,
  recurring_revenue DECIMAL(12, 2) DEFAULT 0,
  mrr DECIMAL(12, 2) DEFAULT 0,
  arr DECIMAL(12, 2) DEFAULT 0,

  -- Customer metrics
  new_customers INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  total_active_customers INTEGER DEFAULT 0,

  -- Subscription metrics
  new_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  upgraded_subscriptions INTEGER DEFAULT 0,
  downgraded_subscriptions INTEGER DEFAULT 0,

  -- Churn metrics
  churn_rate DECIMAL(5, 2) DEFAULT 0,
  revenue_churn DECIMAL(12, 2) DEFAULT 0,

  -- Payment metrics
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  refunded_amount DECIMAL(12, 2) DEFAULT 0,

  -- Average metrics
  avg_revenue_per_user DECIMAL(10, 2) DEFAULT 0,
  customer_lifetime_value DECIMAL(10, 2) DEFAULT 0,

  -- Plan breakdown
  revenue_by_plan JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(period_type, period_start)
);

CREATE INDEX idx_revenue_analytics_period ON revenue_analytics(period_type, period_start);
CREATE INDEX idx_revenue_analytics_period_start ON revenue_analytics(period_start);

-- =====================================================
-- 8. WEBHOOK EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  event_id TEXT UNIQUE NOT NULL, -- Stripe event ID or other provider
  event_type TEXT NOT NULL,
  provider TEXT DEFAULT 'stripe' CHECK (provider IN ('stripe', 'paypal', 'manual')),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'ignored')),

  -- Payload
  payload JSONB NOT NULL,

  -- Processing
  processed_at TIMESTAMPTZ,
  processing_attempts INTEGER DEFAULT 0,
  last_error TEXT,

  -- Metadata
  api_version TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- =====================================================
-- 9. UPDATE EXISTING TABLES
-- =====================================================

-- Add new columns to payment_transactions if not exist
ALTER TABLE payment_transactions
ADD COLUMN IF NOT EXISTS failure_code TEXT,
ADD COLUMN IF NOT EXISTS failure_message TEXT,
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id),
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_refunded BOOLEAN DEFAULT false;

-- Add new columns to user_subscriptions if not exist
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancellation_feedback TEXT,
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;

-- =====================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_failures_updated_at BEFORE UPDATE ON payment_failures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_notifications_updated_at BEFORE UPDATE ON payment_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_changes_updated_at BEFORE UPDATE ON subscription_changes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_analytics_updated_at BEFORE UPDATE ON revenue_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all invoices" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "System can insert invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update invoices" ON invoices FOR UPDATE USING (true);

-- RLS Policies for refunds
CREATE POLICY "Users can view their own refunds" ON refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can request refunds" ON refunds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all refunds" ON refunds FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update refunds" ON refunds FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own payment methods" ON payment_methods FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for payment_failures
CREATE POLICY "Users can view their own payment failures" ON payment_failures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage payment failures" ON payment_failures FOR ALL USING (true);

-- RLS Policies for payment_notifications
CREATE POLICY "Users can view their own notifications" ON payment_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage notifications" ON payment_notifications FOR ALL USING (true);

-- RLS Policies for subscription_changes
CREATE POLICY "Users can view their own subscription changes" ON subscription_changes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can initiate subscription changes" ON subscription_changes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update subscription changes" ON subscription_changes FOR UPDATE USING (true);

-- RLS Policies for revenue_analytics (admin only)
CREATE POLICY "Admins can view revenue analytics" ON revenue_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "System can manage revenue analytics" ON revenue_analytics FOR ALL USING (true);

-- RLS Policies for webhook_events (admin only)
CREATE POLICY "Admins can view webhook events" ON webhook_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "System can manage webhook events" ON webhook_events FOR ALL USING (true);

-- =====================================================
-- 12. FUNCTIONS FOR INVOICE NUMBERING
-- =====================================================

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  -- Get the next invoice number
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-%';

  -- Format as INV-YYYYMM-NNNN
  invoice_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || LPAD(next_number::TEXT, 4, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
