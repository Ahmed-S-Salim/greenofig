-- =====================================================
-- BLOG SYSTEM ENHANCEMENTS
-- Complete upgrade with SEO, Analytics, Tags, Scheduling
-- =====================================================

-- Step 1: Add SEO and metadata fields to blog_posts
-- =====================================================

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON blog_posts(scheduled_publish_at);

-- Step 2: Create blog tags system
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);

-- Step 3: Create blog analytics/views tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_post_views_post ON blog_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_views_date ON blog_post_views(viewed_at);

-- Step 4: Create blog categories
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);

-- Step 5: Create blog activity log
-- =====================================================

CREATE TABLE IF NOT EXISTS blog_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'created', 'updated', 'published', 'unpublished', 'deleted'
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_activity_log_post ON blog_activity_log(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_activity_log_date ON blog_activity_log(created_at);

-- Step 6: Trigger to update view count
-- =====================================================

CREATE OR REPLACE FUNCTION increment_blog_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_increment_blog_view_count ON blog_post_views;
CREATE TRIGGER trigger_increment_blog_view_count
AFTER INSERT ON blog_post_views
FOR EACH ROW
EXECUTE FUNCTION increment_blog_view_count();

-- Step 7: Trigger to log blog activity
-- =====================================================

CREATE OR REPLACE FUNCTION log_blog_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  old_vals JSONB;
  new_vals JSONB;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    action_type := 'created';
    new_vals := to_jsonb(NEW);

    INSERT INTO blog_activity_log (post_id, user_id, action, new_values)
    VALUES (NEW.id, NEW.author_id, action_type, new_vals);

  ELSIF (TG_OP = 'UPDATE') THEN
    -- Detect specific status changes
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'published' THEN
        action_type := 'published';
      ELSIF OLD.status = 'published' THEN
        action_type := 'unpublished';
      ELSE
        action_type := 'status_changed';
      END IF;
    ELSE
      action_type := 'updated';
    END IF;

    old_vals := to_jsonb(OLD);
    new_vals := to_jsonb(NEW);

    INSERT INTO blog_activity_log (post_id, user_id, action, old_values, new_values)
    VALUES (NEW.id, NEW.author_id, action_type, old_vals, new_vals);

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_blog_activity ON blog_posts;
CREATE TRIGGER trigger_log_blog_activity
AFTER INSERT OR UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION log_blog_activity();

-- Step 8: Trigger to auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_blog_updated_at ON blog_posts;
CREATE TRIGGER trigger_update_blog_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_updated_at();

-- Step 9: Function to auto-publish scheduled posts
-- =====================================================

CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET
    status = 'published',
    published_at = scheduled_publish_at
  WHERE
    status = 'scheduled'
    AND scheduled_publish_at IS NOT NULL
    AND scheduled_publish_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Helper function to get blog statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_blog_statistics()
RETURNS TABLE(
  total_posts BIGINT,
  published_posts BIGINT,
  draft_posts BIGINT,
  scheduled_posts BIGINT,
  archived_posts BIGINT,
  total_views BIGINT,
  total_tags BIGINT,
  total_categories BIGINT,
  most_viewed_post_id UUID,
  most_viewed_post_title TEXT,
  most_viewed_post_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM blog_posts) AS total_posts,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'published') AS published_posts,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'draft') AS draft_posts,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'scheduled') AS scheduled_posts,
    (SELECT COUNT(*) FROM blog_posts WHERE status = 'archived') AS archived_posts,
    (SELECT COALESCE(SUM(view_count), 0) FROM blog_posts) AS total_views,
    (SELECT COUNT(*) FROM blog_tags) AS total_tags,
    (SELECT COUNT(*) FROM blog_categories) AS total_categories,
    (SELECT id FROM blog_posts ORDER BY view_count DESC LIMIT 1) AS most_viewed_post_id,
    (SELECT title FROM blog_posts ORDER BY view_count DESC LIMIT 1) AS most_viewed_post_title,
    (SELECT view_count FROM blog_posts ORDER BY view_count DESC LIMIT 1) AS most_viewed_post_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Function to get popular posts
-- =====================================================

CREATE OR REPLACE FUNCTION get_popular_posts(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  view_count INTEGER,
  recent_views BIGINT,
  published_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bp.id,
    bp.title,
    bp.slug,
    bp.view_count,
    COUNT(bpv.id) AS recent_views,
    bp.published_at
  FROM blog_posts bp
  LEFT JOIN blog_post_views bpv ON bp.id = bpv.post_id
    AND bpv.viewed_at > NOW() - (days_back || ' days')::INTERVAL
  WHERE bp.status = 'published'
  GROUP BY bp.id, bp.title, bp.slug, bp.view_count, bp.published_at
  ORDER BY recent_views DESC, bp.view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Function to auto-generate slug from title
-- =====================================================

CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Trigger to auto-generate slug if not provided
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_blog_slug ON blog_posts;
CREATE TRIGGER trigger_auto_generate_blog_slug
BEFORE INSERT OR UPDATE OF title ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION auto_generate_blog_slug();

-- Step 14: RLS Policies for new tables
-- =====================================================

-- Blog tags - readable by all, writable by admins
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON blog_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Blog post tags - same as blog_tags
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post tags"
  ON blog_post_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage post tags"
  ON blog_post_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Blog categories - readable by all, writable by admins
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON blog_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Blog views - insertable by all (track anonymous views), readable by admins
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can add views"
  ON blog_post_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view analytics"
  ON blog_post_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Blog activity log - admins only
ALTER TABLE blog_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log"
  ON blog_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Step 15: Insert some default categories
-- =====================================================

INSERT INTO blog_categories (name, slug, description) VALUES
  ('Technology', 'technology', 'Posts about technology and innovation'),
  ('Business', 'business', 'Business insights and strategies'),
  ('Tutorials', 'tutorials', 'Step-by-step guides and tutorials'),
  ('News', 'news', 'Latest news and updates'),
  ('Case Studies', 'case-studies', 'Real-world case studies')
ON CONFLICT (slug) DO NOTHING;

-- Step 16: Insert some default tags
-- =====================================================

INSERT INTO blog_tags (name, slug) VALUES
  ('React', 'react'),
  ('Node.js', 'nodejs'),
  ('JavaScript', 'javascript'),
  ('Web Development', 'web-development'),
  ('Database', 'database'),
  ('API', 'api'),
  ('Security', 'security'),
  ('Performance', 'performance'),
  ('SEO', 'seo'),
  ('Best Practices', 'best-practices')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This migration adds:
-- 1. ✅ SEO fields (slug, meta_description, keywords)
-- 2. ✅ Analytics tracking (views, view_count)
-- 3. ✅ Tags and categories system
-- 4. ✅ Scheduled publishing
-- 5. ✅ Activity logging
-- 6. ✅ Featured posts flag
-- 7. ✅ Reading time estimate
-- 8. ✅ Auto-slug generation
-- 9. ✅ Helper functions for statistics
-- 10. ✅ RLS policies for security
-- 11. ✅ Default categories and tags
-- =====================================================
