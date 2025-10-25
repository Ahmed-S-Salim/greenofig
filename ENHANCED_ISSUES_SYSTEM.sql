-- =====================================================
-- ENHANCED ISSUES MANAGEMENT SYSTEM - COMPLETE SQL
-- =====================================================
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click "Run" to create the enhanced issues system
-- =====================================================

-- =====================================================
-- 1. CREATE/UPDATE MAIN ISSUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Issue details
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('billing', 'technical', 'feature_request', 'bug', 'account', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Tracking
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Metadata
  internal_notes TEXT,
  customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (for existing issues table)
DO $$
BEGIN
  -- Add category if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='category') THEN
    ALTER TABLE issues ADD COLUMN category TEXT CHECK (category IN ('billing', 'technical', 'feature_request', 'bug', 'account', 'other'));
  END IF;

  -- Add assigned_to if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='assigned_to') THEN
    ALTER TABLE issues ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add first_response_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='first_response_at') THEN
    ALTER TABLE issues ADD COLUMN first_response_at TIMESTAMPTZ;
  END IF;

  -- Add resolved_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='resolved_at') THEN
    ALTER TABLE issues ADD COLUMN resolved_at TIMESTAMPTZ;
  END IF;

  -- Add closed_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='closed_at') THEN
    ALTER TABLE issues ADD COLUMN closed_at TIMESTAMPTZ;
  END IF;

  -- Add internal_notes if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='internal_notes') THEN
    ALTER TABLE issues ADD COLUMN internal_notes TEXT;
  END IF;

  -- Add customer_satisfaction_rating if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='issues' AND column_name='customer_satisfaction_rating') THEN
    ALTER TABLE issues ADD COLUMN customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating BETWEEN 1 AND 5);
  END IF;
END $$;

-- Indexes for issues table
CREATE INDEX IF NOT EXISTS idx_issues_user ON issues(user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);

-- =====================================================
-- 2. ISSUE COMMENTS TABLE (Conversation Threads)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Comment details
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes only admins can see
  is_resolution BOOLEAN DEFAULT false, -- Mark this comment as the resolution

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_comments_issue ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at);

-- =====================================================
-- 3. ISSUE CATEGORIES TABLE (Predefined Categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  color TEXT, -- Hex color code
  auto_assign_to UUID REFERENCES auth.users(id), -- Auto-assign issues in this category

  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO issue_categories (name, slug, description, icon, color, display_order) VALUES
  ('Billing', 'billing', 'Payment and subscription issues', 'CreditCard', '#10b981', 1),
  ('Technical', 'technical', 'Technical problems and errors', 'AlertTriangle', '#ef4444', 2),
  ('Feature Request', 'feature_request', 'New feature suggestions', 'Lightbulb', '#3b82f6', 3),
  ('Bug Report', 'bug', 'Software bugs and glitches', 'Bug', '#f59e0b', 4),
  ('Account', 'account', 'Account and profile issues', 'User', '#8b5cf6', 5),
  ('Other', 'other', 'General inquiries', 'HelpCircle', '#6b7280', 6)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 4. ISSUE ASSIGNMENTS TABLE (Assignment History)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  unassigned_at TIMESTAMPTZ,

  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_issue_assignments_issue ON issue_assignments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_assignments_user ON issue_assignments(assigned_to);

-- =====================================================
-- 5. ISSUE ATTACHMENTS TABLE (File Uploads)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES issue_comments(id) ON DELETE CASCADE, -- Optional: attach to specific comment
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- File details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_size INTEGER, -- Size in bytes
  file_type TEXT, -- MIME type

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_attachments_issue ON issue_attachments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_attachments_comment ON issue_attachments(comment_id);

-- =====================================================
-- 6. ISSUE ACTIVITY LOG TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Activity details
  action_type TEXT NOT NULL, -- 'created', 'status_changed', 'assigned', 'commented', 'priority_changed', etc.
  old_value TEXT,
  new_value TEXT,
  description TEXT, -- Human-readable description

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_activity_log_issue ON issue_activity_log(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_activity_log_created_at ON issue_activity_log(created_at DESC);

-- =====================================================
-- 7. ISSUE TAGS TABLE (Flexible Tagging System)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6b7280',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS issue_tag_relations (
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES issue_tags(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (issue_id, tag_id)
);

-- =====================================================
-- 8. ISSUE TEMPLATES TABLE (Quick Response Templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS issue_response_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,

  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO issue_response_templates (title, content, category) VALUES
  ('Welcome Message', 'Thank you for reaching out! We''ve received your request and will respond within 24 hours.', 'general'),
  ('Issue Resolved', 'Great news! We''ve resolved your issue. Please let us know if you need any further assistance.', 'general'),
  ('Need More Info', 'Thank you for contacting us. To better assist you, could you please provide more details about [SPECIFIC_ISSUE]?', 'general'),
  ('Billing Issue', 'We''ve reviewed your billing inquiry. [EXPLAIN_RESOLUTION]. If you have any questions, please let us know.', 'billing'),
  ('Technical Issue', 'We''ve identified the technical issue you reported. Our team is working on a fix and will update you soon.', 'technical')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_response_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. RLS POLICIES FOR ISSUES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own issues" ON issues;
DROP POLICY IF EXISTS "Users can create issues" ON issues;
DROP POLICY IF EXISTS "Admins can view all issues" ON issues;
DROP POLICY IF EXISTS "Admins can update issues" ON issues;
DROP POLICY IF EXISTS "Assigned users can view issues" ON issues;

-- Users can view their own issues
CREATE POLICY "Users can view their own issues"
  ON issues FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create issues
CREATE POLICY "Users can create issues"
  ON issues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all issues
CREATE POLICY "Admins can view all issues"
  ON issues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update issues
CREATE POLICY "Admins can update issues"
  ON issues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Assigned users can view their assigned issues
CREATE POLICY "Assigned users can view issues"
  ON issues FOR SELECT
  TO authenticated
  USING (auth.uid() = assigned_to);

-- =====================================================
-- 11. RLS POLICIES FOR ISSUE_COMMENTS
-- =====================================================

DROP POLICY IF EXISTS "Users can view comments on their issues" ON issue_comments;
DROP POLICY IF EXISTS "Users can create comments on their issues" ON issue_comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON issue_comments;
DROP POLICY IF EXISTS "Admins can create comments" ON issue_comments;
DROP POLICY IF EXISTS "Users cannot view internal comments" ON issue_comments;

CREATE POLICY "Users can view comments on their issues"
  ON issue_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = issue_comments.issue_id
      AND issues.user_id = auth.uid()
      AND issue_comments.is_internal = false -- Users can't see internal notes
    )
  );

CREATE POLICY "Users can create comments on their issues"
  ON issue_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = issue_comments.issue_id
      AND issues.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all comments"
  ON issue_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create comments"
  ON issue_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 12. RLS POLICIES FOR OTHER TABLES
-- =====================================================

-- Issue Categories - Anyone authenticated can view
CREATE POLICY "Anyone can view categories"
  ON issue_categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON issue_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Issue Assignments - Admins only
CREATE POLICY "Admins can manage assignments"
  ON issue_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Issue Attachments
CREATE POLICY "Users can view attachments on their issues"
  ON issue_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = issue_attachments.issue_id
      AND issues.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all attachments"
  ON issue_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can upload attachments to their issues"
  ON issue_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = issue_attachments.issue_id
      AND issues.user_id = auth.uid()
    )
  );

-- Activity Log - Read only for admins
CREATE POLICY "Admins can view activity log"
  ON issue_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Tags - Admins only
CREATE POLICY "Admins can manage tags"
  ON issue_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage tag relations"
  ON issue_tag_relations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Response Templates - Admins only
CREATE POLICY "Admins can manage templates"
  ON issue_response_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 13. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
DROP TRIGGER IF EXISTS update_issue_comments_updated_at ON issue_comments;
DROP TRIGGER IF EXISTS update_issue_categories_updated_at ON issue_categories;
DROP TRIGGER IF EXISTS update_issue_response_templates_updated_at ON issue_response_templates;

-- Create triggers
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issue_comments_updated_at
  BEFORE UPDATE ON issue_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issue_categories_updated_at
  BEFORE UPDATE ON issue_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issue_response_templates_updated_at
  BEFORE UPDATE ON issue_response_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. TRIGGERS FOR AUTOMATIC ACTIVITY LOGGING
-- =====================================================

-- Function to log issue status changes
CREATE OR REPLACE FUNCTION log_issue_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO issue_activity_log (issue_id, user_id, action_type, old_value, new_value, description)
    VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      OLD.status,
      NEW.status,
      'Status changed from ' || OLD.status || ' to ' || NEW.status
    );

    -- Update resolved_at timestamp
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
      NEW.resolved_at = NOW();
    END IF;

    -- Update closed_at timestamp
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
      NEW.closed_at = NOW();
    END IF;
  END IF;

  -- Log priority change
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO issue_activity_log (issue_id, user_id, action_type, old_value, new_value, description)
    VALUES (
      NEW.id,
      auth.uid(),
      'priority_changed',
      OLD.priority,
      NEW.priority,
      'Priority changed from ' || OLD.priority || ' to ' || NEW.priority
    );
  END IF;

  -- Log assignment change
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO issue_activity_log (issue_id, user_id, action_type, old_value, new_value, description)
    VALUES (
      NEW.id,
      auth.uid(),
      'assigned',
      OLD.assigned_to::TEXT,
      NEW.assigned_to::TEXT,
      CASE
        WHEN NEW.assigned_to IS NULL THEN 'Issue unassigned'
        ELSE 'Issue assigned to user'
      END
    );

    -- Create assignment record
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO issue_assignments (issue_id, assigned_to, assigned_by)
      VALUES (NEW.id, NEW.assigned_to, auth.uid());
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_issue_changes ON issues;
CREATE TRIGGER log_issue_changes
  BEFORE UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_status_change();

-- Function to log issue creation
CREATE OR REPLACE FUNCTION log_issue_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO issue_activity_log (issue_id, user_id, action_type, description)
  VALUES (
    NEW.id,
    NEW.user_id,
    'created',
    'Issue created: ' || NEW.subject
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_new_issue ON issues;
CREATE TRIGGER log_new_issue
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION log_issue_creation();

-- Function to log comments and update first_response_at
CREATE OR REPLACE FUNCTION log_comment_and_update_response_time()
RETURNS TRIGGER AS $$
DECLARE
  issue_user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get issue user_id
  SELECT user_id INTO issue_user_id FROM issues WHERE id = NEW.issue_id;

  -- Check if commenter is admin
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = NEW.user_id AND role IN ('admin', 'super_admin')
  ) INTO is_admin;

  -- Log comment
  INSERT INTO issue_activity_log (issue_id, user_id, action_type, description)
  VALUES (
    NEW.issue_id,
    NEW.user_id,
    'commented',
    CASE
      WHEN NEW.is_internal THEN 'Added internal note'
      ELSE 'Added comment'
    END
  );

  -- Update first_response_at if this is first admin response
  IF is_admin AND NEW.user_id != issue_user_id THEN
    UPDATE issues
    SET first_response_at = NOW()
    WHERE id = NEW.issue_id
    AND first_response_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_comment_activity ON issue_comments;
CREATE TRIGGER log_comment_activity
  AFTER INSERT ON issue_comments
  FOR EACH ROW
  EXECUTE FUNCTION log_comment_and_update_response_time();

-- =====================================================
-- 15. HELPER FUNCTIONS FOR STATISTICS
-- =====================================================

-- Function to get issue statistics
CREATE OR REPLACE FUNCTION get_issue_statistics(
  time_period TEXT DEFAULT 'all' -- 'today', 'week', 'month', 'all'
)
RETURNS TABLE (
  total_issues BIGINT,
  open_issues BIGINT,
  in_progress_issues BIGINT,
  resolved_issues BIGINT,
  closed_issues BIGINT,
  urgent_issues BIGINT,
  high_priority_issues BIGINT,
  avg_first_response_minutes NUMERIC,
  avg_resolution_hours NUMERIC
) AS $$
DECLARE
  start_date TIMESTAMPTZ;
BEGIN
  -- Determine start date based on period
  CASE time_period
    WHEN 'today' THEN start_date := CURRENT_DATE;
    WHEN 'week' THEN start_date := CURRENT_DATE - INTERVAL '7 days';
    WHEN 'month' THEN start_date := CURRENT_DATE - INTERVAL '30 days';
    ELSE start_date := '1970-01-01'::TIMESTAMPTZ;
  END CASE;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_issues,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT AS open_issues,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT AS in_progress_issues,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT AS resolved_issues,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT AS closed_issues,
    COUNT(*) FILTER (WHERE priority = 'urgent')::BIGINT AS urgent_issues,
    COUNT(*) FILTER (WHERE priority = 'high')::BIGINT AS high_priority_issues,
    ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60), 2) AS avg_first_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600), 2) AS avg_resolution_hours
  FROM issues
  WHERE created_at >= start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get issue count by category
CREATE OR REPLACE FUNCTION get_issues_by_category()
RETURNS TABLE (
  category TEXT,
  issue_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(i.category, 'uncategorized') AS category,
    COUNT(*)::BIGINT AS issue_count
  FROM issues i
  WHERE i.status IN ('open', 'in_progress')
  GROUP BY i.category
  ORDER BY issue_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-escalate old issues
CREATE OR REPLACE FUNCTION auto_escalate_old_issues()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Escalate open issues older than 3 days from medium to high
  UPDATE issues
  SET
    priority = 'high',
    updated_at = NOW()
  WHERE
    status = 'open'
    AND priority = 'medium'
    AND created_at < NOW() - INTERVAL '3 days';

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  updated_count := updated_count + temp_count;

  -- Escalate open issues older than 7 days from high to urgent
  UPDATE issues
  SET
    priority = 'urgent',
    updated_at = NOW()
  WHERE
    status = 'open'
    AND priority = 'high'
    AND created_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  updated_count := updated_count + temp_count;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 16. FUNCTION TO GET FULL ISSUE DETAILS
-- =====================================================

CREATE OR REPLACE FUNCTION get_issue_details(issue_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'issue', row_to_json(i),
    'customer', row_to_json(up),
    'assigned_user', row_to_json(au),
    'comments', (
      SELECT json_agg(
        json_build_object(
          'comment', row_to_json(ic),
          'user', row_to_json(cu)
        ) ORDER BY ic.created_at
      )
      FROM issue_comments ic
      LEFT JOIN user_profiles cu ON cu.id = ic.user_id
      WHERE ic.issue_id = issue_uuid
    ),
    'attachments', (
      SELECT json_agg(row_to_json(ia) ORDER BY ia.created_at)
      FROM issue_attachments ia
      WHERE ia.issue_id = issue_uuid
    ),
    'activity', (
      SELECT json_agg(
        json_build_object(
          'activity', row_to_json(ial),
          'user', row_to_json(au)
        ) ORDER BY ial.created_at DESC
      )
      FROM issue_activity_log ial
      LEFT JOIN user_profiles au ON au.id = ial.user_id
      WHERE ial.issue_id = issue_uuid
    ),
    'tags', (
      SELECT json_agg(row_to_json(it))
      FROM issue_tags it
      JOIN issue_tag_relations itr ON itr.tag_id = it.id
      WHERE itr.issue_id = issue_uuid
    )
  ) INTO result
  FROM issues i
  LEFT JOIN user_profiles up ON up.id = i.user_id
  LEFT JOIN user_profiles au ON au.id = i.assigned_to
  WHERE i.id = issue_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- You now have a complete enhanced issues system with:
-- ✓ Main issues table with tracking fields
-- ✓ Comment/conversation threads
-- ✓ Category management
-- ✓ Assignment tracking
-- ✓ File attachments support
-- ✓ Complete activity audit log
-- ✓ Tagging system
-- ✓ Response templates
-- ✓ Automatic activity logging
-- ✓ Statistics functions
-- ✓ Auto-escalation capability
-- ✓ Full RLS policies
-- ✓ Performance indexes
-- =====================================================
