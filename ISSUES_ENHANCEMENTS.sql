-- =====================================================
-- ISSUES SYSTEM ENHANCEMENTS
-- =====================================================
-- Email notifications, satisfaction ratings, SLA tracking, etc.
-- =====================================================

-- =====================================================
-- 1. EMAIL NOTIFICATION QUEUE TABLE
-- =====================================================
-- Store emails to be sent (processed by Edge Function or cron job)
CREATE TABLE IF NOT EXISTS issue_email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'new_ticket', 'admin_reply', 'status_change', 'satisfaction_request'

  -- Processing
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_sent ON issue_email_queue(sent, created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_issue ON issue_email_queue(issue_id);

-- =====================================================
-- 2. FUNCTION TO QUEUE EMAIL NOTIFICATIONS
-- =====================================================
CREATE OR REPLACE FUNCTION queue_issue_email(
  p_issue_id UUID,
  p_recipient_email TEXT,
  p_recipient_name TEXT,
  p_subject TEXT,
  p_body TEXT,
  p_email_type TEXT
)
RETURNS UUID AS $$
DECLARE
  email_id UUID;
BEGIN
  INSERT INTO issue_email_queue (
    issue_id,
    recipient_email,
    recipient_name,
    subject,
    body,
    email_type
  )
  VALUES (
    p_issue_id,
    p_recipient_email,
    p_recipient_name,
    p_subject,
    p_body,
    p_email_type
  )
  RETURNING id INTO email_id;

  RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. TRIGGER TO SEND EMAIL WHEN ADMIN REPLIES
-- =====================================================
CREATE OR REPLACE FUNCTION notify_customer_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  issue_record RECORD;
  customer_record RECORD;
  admin_record RECORD;
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Only send email for non-internal comments
  IF NEW.is_internal = true THEN
    RETURN NEW;
  END IF;

  -- Get issue details
  SELECT * INTO issue_record FROM issues WHERE id = NEW.issue_id;

  -- Get customer details
  SELECT * INTO customer_record FROM user_profiles WHERE id = issue_record.user_id;

  -- Get admin details
  SELECT * INTO admin_record FROM user_profiles WHERE id = NEW.user_id;

  -- Only send if comment is from admin (not from customer themselves)
  IF NEW.user_id = issue_record.user_id THEN
    RETURN NEW;
  END IF;

  -- Build email
  email_subject := 'Update on your support ticket: ' || issue_record.subject;
  email_body := 'Hi ' || customer_record.full_name || ',

An admin has replied to your support ticket:

Ticket: ' || issue_record.subject || '
Status: ' || issue_record.status || '

---
' || admin_record.full_name || ' replied:

' || NEW.comment_text || '
---

View your ticket: https://yourdomain.com/app/support

Thank you,
GreenoFig Support Team';

  -- Queue email
  PERFORM queue_issue_email(
    NEW.issue_id,
    customer_record.email,
    customer_record.full_name,
    email_subject,
    email_body,
    'admin_reply'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_on_admin_reply ON issue_comments;
CREATE TRIGGER notify_on_admin_reply
  AFTER INSERT ON issue_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_customer_on_reply();

-- =====================================================
-- 4. TRIGGER TO NOTIFY CUSTOMER ON STATUS CHANGE
-- =====================================================
CREATE OR REPLACE FUNCTION notify_customer_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  customer_record RECORD;
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Only notify on status change to resolved or closed
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('resolved', 'closed') THEN
    RETURN NEW;
  END IF;

  -- Get customer details
  SELECT * INTO customer_record FROM user_profiles WHERE id = NEW.user_id;

  -- Build email based on status
  IF NEW.status = 'resolved' THEN
    email_subject := 'Your support ticket has been resolved: ' || NEW.subject;
    email_body := 'Hi ' || customer_record.full_name || ',

Great news! Your support ticket has been resolved.

Ticket: ' || NEW.subject || '

If this resolves your issue, no action is needed. If you need further assistance, please reply to this ticket or create a new one.

We''d love to hear your feedback! Please rate your support experience:
https://yourdomain.com/app/support?rate=' || NEW.id || '

Thank you,
GreenoFig Support Team';
  ELSE
    email_subject := 'Your support ticket has been closed: ' || NEW.subject;
    email_body := 'Hi ' || customer_record.full_name || ',

Your support ticket has been closed.

Ticket: ' || NEW.subject || '

If you need further assistance, please create a new support ticket.

Thank you,
GreenoFig Support Team';
  END IF;

  -- Queue email
  PERFORM queue_issue_email(
    NEW.id,
    customer_record.email,
    customer_record.full_name,
    email_subject,
    email_body,
    'status_change'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_on_status_change ON issues;
CREATE TRIGGER notify_on_status_change
  AFTER UPDATE OF status ON issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_customer_on_status_change();

-- =====================================================
-- 5. TRIGGER TO NOTIFY ADMINS ON NEW TICKET
-- =====================================================
CREATE OR REPLACE FUNCTION notify_admins_on_new_ticket()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  customer_record RECORD;
  email_subject TEXT;
  email_body TEXT;
BEGIN
  -- Get customer details
  SELECT * INTO customer_record FROM user_profiles WHERE id = NEW.user_id;

  -- Build email
  email_subject := '[New Ticket] ' || NEW.subject;
  email_body := 'New support ticket received:

Customer: ' || customer_record.full_name || ' (' || customer_record.email || ')
Subject: ' || NEW.subject || '
Priority: ' || NEW.priority || '
Category: ' || COALESCE(NEW.category, 'uncategorized') || '

Description:
' || NEW.description || '

View ticket: https://yourdomain.com/app/admin?tab=issues

---
GreenoFig Admin Notification';

  -- Send to all admins
  FOR admin_record IN
    SELECT email, full_name
    FROM user_profiles
    WHERE role IN ('admin', 'super_admin')
  LOOP
    PERFORM queue_issue_email(
      NEW.id,
      admin_record.email,
      admin_record.full_name,
      email_subject,
      email_body,
      'new_ticket'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS notify_admins_new_ticket ON issues;
CREATE TRIGGER notify_admins_new_ticket
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_new_ticket();

-- =====================================================
-- 6. SLA TRACKING FIELDS
-- =====================================================
-- Add SLA deadline fields to issues table
DO $$
BEGIN
  -- Add sla_first_response_deadline
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='sla_first_response_deadline') THEN
    ALTER TABLE issues ADD COLUMN sla_first_response_deadline TIMESTAMPTZ;
  END IF;

  -- Add sla_resolution_deadline
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='sla_resolution_deadline') THEN
    ALTER TABLE issues ADD COLUMN sla_resolution_deadline TIMESTAMPTZ;
  END IF;

  -- Add sla_first_response_met
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='sla_first_response_met') THEN
    ALTER TABLE issues ADD COLUMN sla_first_response_met BOOLEAN;
  END IF;

  -- Add sla_resolution_met
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='sla_resolution_met') THEN
    ALTER TABLE issues ADD COLUMN sla_resolution_met BOOLEAN;
  END IF;
END $$;

-- =====================================================
-- 7. FUNCTION TO SET SLA DEADLINES
-- =====================================================
CREATE OR REPLACE FUNCTION set_sla_deadlines()
RETURNS TRIGGER AS $$
BEGIN
  -- Set SLA deadlines based on priority
  CASE NEW.priority
    WHEN 'urgent' THEN
      NEW.sla_first_response_deadline := NEW.created_at + INTERVAL '1 hour';
      NEW.sla_resolution_deadline := NEW.created_at + INTERVAL '4 hours';
    WHEN 'high' THEN
      NEW.sla_first_response_deadline := NEW.created_at + INTERVAL '4 hours';
      NEW.sla_resolution_deadline := NEW.created_at + INTERVAL '1 day';
    WHEN 'medium' THEN
      NEW.sla_first_response_deadline := NEW.created_at + INTERVAL '8 hours';
      NEW.sla_resolution_deadline := NEW.created_at + INTERVAL '3 days';
    WHEN 'low' THEN
      NEW.sla_first_response_deadline := NEW.created_at + INTERVAL '24 hours';
      NEW.sla_resolution_deadline := NEW.created_at + INTERVAL '7 days';
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_issue_sla ON issues;
CREATE TRIGGER set_issue_sla
  BEFORE INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_deadlines();

-- =====================================================
-- 8. FUNCTION TO CHECK SLA COMPLIANCE
-- =====================================================
CREATE OR REPLACE FUNCTION check_sla_compliance()
RETURNS TRIGGER AS $$
BEGIN
  -- Check first response SLA when first_response_at is set
  IF NEW.first_response_at IS NOT NULL AND OLD.first_response_at IS NULL THEN
    NEW.sla_first_response_met := (NEW.first_response_at <= NEW.sla_first_response_deadline);
  END IF;

  -- Check resolution SLA when resolved
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.sla_resolution_met := (NEW.resolved_at <= NEW.sla_resolution_deadline);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_issue_sla ON issues;
CREATE TRIGGER check_issue_sla
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION check_sla_compliance();

-- =====================================================
-- 9. FUNCTION TO GET SLA STATUS
-- =====================================================
CREATE OR REPLACE FUNCTION get_sla_status(issue_uuid UUID)
RETURNS TABLE (
  first_response_status TEXT,
  first_response_time_remaining INTERVAL,
  resolution_status TEXT,
  resolution_time_remaining INTERVAL
) AS $$
DECLARE
  issue_record RECORD;
BEGIN
  SELECT * INTO issue_record FROM issues WHERE id = issue_uuid;

  -- First response status
  IF issue_record.first_response_at IS NOT NULL THEN
    first_response_status := CASE
      WHEN issue_record.sla_first_response_met THEN 'met'
      ELSE 'breached'
    END;
    first_response_time_remaining := INTERVAL '0';
  ELSIF NOW() > issue_record.sla_first_response_deadline THEN
    first_response_status := 'breached';
    first_response_time_remaining := NOW() - issue_record.sla_first_response_deadline;
  ELSE
    first_response_status := 'pending';
    first_response_time_remaining := issue_record.sla_first_response_deadline - NOW();
  END IF;

  -- Resolution status
  IF issue_record.status = 'resolved' OR issue_record.status = 'closed' THEN
    resolution_status := CASE
      WHEN issue_record.sla_resolution_met THEN 'met'
      ELSE 'breached'
    END;
    resolution_time_remaining := INTERVAL '0';
  ELSIF NOW() > issue_record.sla_resolution_deadline THEN
    resolution_status := 'breached';
    resolution_time_remaining := NOW() - issue_record.sla_resolution_deadline;
  ELSE
    resolution_status := 'pending';
    resolution_time_remaining := issue_record.sla_resolution_deadline - NOW();
  END IF;

  RETURN QUERY SELECT
    first_response_status,
    first_response_time_remaining,
    resolution_status,
    resolution_time_remaining;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. RLS POLICIES FOR EMAIL QUEUE
-- =====================================================
ALTER TABLE issue_email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view email queue" ON issue_email_queue;
CREATE POLICY "Admins can view email queue"
  ON issue_email_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 11. FUNCTION TO GET SLA COMPLIANCE STATS
-- =====================================================
CREATE OR REPLACE FUNCTION get_sla_compliance_stats()
RETURNS TABLE (
  total_tickets BIGINT,
  first_response_met_count BIGINT,
  first_response_breached_count BIGINT,
  first_response_compliance_rate NUMERIC,
  resolution_met_count BIGINT,
  resolution_breached_count BIGINT,
  resolution_compliance_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_tickets,
    COUNT(*) FILTER (WHERE sla_first_response_met = true)::BIGINT AS first_response_met_count,
    COUNT(*) FILTER (WHERE sla_first_response_met = false)::BIGINT AS first_response_breached_count,
    ROUND(
      (COUNT(*) FILTER (WHERE sla_first_response_met = true)::NUMERIC /
       NULLIF(COUNT(*) FILTER (WHERE first_response_at IS NOT NULL), 0) * 100),
      2
    ) AS first_response_compliance_rate,
    COUNT(*) FILTER (WHERE sla_resolution_met = true)::BIGINT AS resolution_met_count,
    COUNT(*) FILTER (WHERE sla_resolution_met = false)::BIGINT AS resolution_breached_count,
    ROUND(
      (COUNT(*) FILTER (WHERE sla_resolution_met = true)::NUMERIC /
       NULLIF(COUNT(*) FILTER (WHERE status IN ('resolved', 'closed')), 0) * 100),
      2
    ) AS resolution_compliance_rate
  FROM issues
  WHERE created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENHANCEMENTS COMPLETE
-- =====================================================
-- You now have:
-- ✓ Email notification queue system
-- ✓ Auto-emails when admin replies
-- ✓ Auto-emails on status changes
-- ✓ Admin notifications for new tickets
-- ✓ SLA deadline tracking
-- ✓ SLA compliance checking
-- ✓ SLA statistics
-- =====================================================

-- NOTE: To actually SEND emails, you need to:
-- 1. Set up Supabase Edge Function or external service
-- 2. Process the issue_email_queue table
-- 3. Mark emails as sent when delivered
--
-- Example query to get unsent emails:
-- SELECT * FROM issue_email_queue WHERE sent = false ORDER BY created_at;
-- =====================================================
