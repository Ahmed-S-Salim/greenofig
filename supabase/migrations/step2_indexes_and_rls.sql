-- STEP 2: Add Indexes and RLS Policies
-- Run this AFTER step1_create_tables.sql succeeds

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_keyword_rankings_post ON blog_keyword_rankings(blog_post_id, ranking_position);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(blog_post_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_blog_post_views_post ON blog_post_views(blog_post_id, viewed_at DESC);

-- Blog Posts RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published' AND published_at IS NOT NULL);

DROP POLICY IF EXISTS "Authors can manage their posts" ON blog_posts;
CREATE POLICY "Authors can manage their posts" ON blog_posts
  FOR ALL USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Nutritionists can manage posts" ON blog_posts;
CREATE POLICY "Nutritionists can manage posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

-- Keyword Rankings RLS
ALTER TABLE blog_keyword_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authors can view their keyword rankings" ON blog_keyword_rankings;
CREATE POLICY "Authors can view their keyword rankings" ON blog_keyword_rankings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_keyword_rankings.blog_post_id
      AND author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authors can manage keyword rankings" ON blog_keyword_rankings;
CREATE POLICY "Authors can manage keyword rankings" ON blog_keyword_rankings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_keyword_rankings.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- Blog Comments RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved comments" ON blog_comments;
CREATE POLICY "Anyone can view approved comments" ON blog_comments
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can create comments" ON blog_comments;
CREATE POLICY "Users can create comments" ON blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors can manage comments on their posts" ON blog_comments;
CREATE POLICY "Authors can manage comments on their posts" ON blog_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_comments.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- Blog Categories RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON blog_categories;
CREATE POLICY "Anyone can view categories" ON blog_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Blog Post Views RLS
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record views" ON blog_post_views;
CREATE POLICY "Anyone can record views" ON blog_post_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authors can view their post analytics" ON blog_post_views;
CREATE POLICY "Authors can view their post analytics" ON blog_post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_post_views.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- SEO Audits RLS
ALTER TABLE blog_seo_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authors can view their SEO audits" ON blog_seo_audits;
CREATE POLICY "Authors can view their SEO audits" ON blog_seo_audits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_seo_audits.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- AI Prompts RLS
ALTER TABLE blog_ai_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their AI prompts" ON blog_ai_prompts;
CREATE POLICY "Users can view their AI prompts" ON blog_ai_prompts
  FOR ALL USING (auth.uid() = user_id);

-- Function to auto-publish scheduled posts
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET status = 'published',
      published_at = NOW()
  WHERE status = 'scheduled'
  AND scheduled_for <= NOW()
  AND published_at IS NULL;
END;
$$ LANGUAGE plpgsql;
