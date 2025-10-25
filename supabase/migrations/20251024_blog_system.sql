-- Blog Posts Management System with SEO

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,

  -- SEO Fields
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  focus_keyword VARCHAR(100),
  keywords TEXT[], -- Array of target keywords
  canonical_url TEXT,

  -- Status & Publishing
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, scheduled, archived
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,

  -- Organization
  category VARCHAR(100),
  tags TEXT[],

  -- Analytics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  avg_time_on_page INTEGER, -- seconds

  -- AI Generation Metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  ai_model VARCHAR(50),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Keyword Rankings
CREATE TABLE IF NOT EXISTS blog_keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  search_engine VARCHAR(50) DEFAULT 'google', -- google, bing, etc.
  ranking_position INTEGER,
  search_volume INTEGER,
  difficulty_score INTEGER, -- 0-100
  traffic_potential INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Categories (predefined)
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Post Views (for analytics)
CREATE TABLE IF NOT EXISTS blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  time_spent INTEGER, -- seconds
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEO Audit History
CREATE TABLE IF NOT EXISTS blog_seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,

  -- SEO Scores
  overall_score INTEGER, -- 0-100
  content_score INTEGER,
  readability_score INTEGER,
  keyword_score INTEGER,
  meta_score INTEGER,

  -- Issues Found
  issues JSONB, -- [{"type": "missing_meta", "severity": "high", "message": "..."}]

  -- Suggestions
  suggestions JSONB, -- [{"type": "keyword_density", "suggestion": "..."}]

  audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Writing Prompts History
CREATE TABLE IF NOT EXISTS blog_ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,

  prompt TEXT NOT NULL,
  model VARCHAR(50),
  generated_content TEXT,
  tokens_used INTEGER,

  -- Context
  context_type VARCHAR(50), -- full_post, section, outline, title, meta_description

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_keyword_rankings_post ON blog_keyword_rankings(blog_post_id, ranking_position);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(blog_post_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_blog_post_views_post ON blog_post_views(blog_post_id, viewed_at DESC);

-- RLS Policies

-- Blog Posts
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

-- Keyword Rankings
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

-- Blog Comments
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

-- Blog Categories
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

-- Blog Post Views
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

-- SEO Audits
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

-- AI Prompts
ALTER TABLE blog_ai_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their AI prompts" ON blog_ai_prompts;
CREATE POLICY "Users can view their AI prompts" ON blog_ai_prompts
  FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Nutrition Basics', 'nutrition-basics', 'Fundamental nutrition concepts and principles'),
  ('Weight Loss', 'weight-loss', 'Tips and strategies for healthy weight loss'),
  ('Meal Prep', 'meal-prep', 'Meal preparation guides and recipes'),
  ('Sports Nutrition', 'sports-nutrition', 'Nutrition for athletes and active individuals'),
  ('Healthy Recipes', 'healthy-recipes', 'Nutritious and delicious recipes'),
  ('Wellness Tips', 'wellness-tips', 'General health and wellness advice'),
  ('Diet Plans', 'diet-plans', 'Various diet approaches and plans'),
  ('Supplements', 'supplements', 'Information about nutritional supplements')
ON CONFLICT (slug) DO NOTHING;
