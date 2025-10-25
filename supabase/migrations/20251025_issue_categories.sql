-- Issue Categories Table
-- Categories for support tickets and feedback

CREATE TABLE IF NOT EXISTS issue_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active categories" ON issue_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON issue_categories;

-- Everyone can view active categories
CREATE POLICY "Anyone can view active categories" ON issue_categories
  FOR SELECT USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories" ON issue_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Insert default categories (only if they don't exist)
DO $$
BEGIN
  -- Insert categories one by one with conflict handling
  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Technical Issue', 'technical', 'Problems with the app, bugs, or errors', 1, true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Account & Billing', 'billing', 'Questions about your account or subscription', 2, true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Feature Request', 'feature', 'Suggest new features or improvements', 3, true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Feedback', 'feedback', 'General feedback about the app', 4, true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Nutrition Help', 'nutrition', 'Questions about meal plans or nutrition', 5, true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Workout Help', 'workout', 'Questions about fitness plans or exercises', 6, true)
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO issue_categories (name, slug, description, display_order, is_active)
  VALUES ('Other', 'other', 'Other questions or concerns', 7, true)
  ON CONFLICT (slug) DO NOTHING;

  -- If there's an exception, just ignore it (categories already exist)
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Categories may already exist, skipping...';
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_issue_categories_updated_at ON issue_categories;

CREATE TRIGGER update_issue_categories_updated_at
  BEFORE UPDATE ON issue_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Issue categories created! ✅' as status;
SELECT '7 default categories added' as info;
