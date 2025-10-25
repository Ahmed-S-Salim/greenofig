-- Check and Fix Blog Tables
-- Run this in Supabase SQL Editor to diagnose and fix the issue

-- First, let's drop all blog tables if they exist (to start fresh)
DROP TABLE IF EXISTS blog_ai_prompts CASCADE;
DROP TABLE IF EXISTS blog_seo_audits CASCADE;
DROP TABLE IF EXISTS blog_post_views CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_keyword_rankings CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;

-- Now create them fresh with all correct columns
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  focus_keyword VARCHAR(100),
  keywords TEXT[],
  canonical_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  avg_time_on_page INTEGER,
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  ai_model VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  keyword VARCHAR(255) NOT NULL,
  search_engine VARCHAR(50) DEFAULT 'google',
  ranking_position INTEGER,
  search_volume INTEGER,
  difficulty_score INTEGER,
  traffic_potential INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_comments (
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

CREATE TABLE blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  time_spent INTEGER,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_seo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  overall_score INTEGER,
  content_score INTEGER,
  readability_score INTEGER,
  keyword_score INTEGER,
  meta_score INTEGER,
  issues JSONB,
  suggestions JSONB,
  audited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blog_ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  model VARCHAR(50),
  generated_content TEXT,
  tokens_used INTEGER,
  context_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_keyword_rankings_post ON blog_keyword_rankings(blog_post_id, ranking_position);
CREATE INDEX idx_blog_comments_post ON blog_comments(blog_post_id, is_approved);
CREATE INDEX idx_blog_post_views_post ON blog_post_views(blog_post_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_keyword_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_seo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_ai_prompts ENABLE ROW LEVEL SECURITY;

-- Blog Posts RLS Policies
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "Authors can manage their posts" ON blog_posts
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Nutritionists can manage posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

-- Keyword Rankings RLS
CREATE POLICY "Authors can view their keyword rankings" ON blog_keyword_rankings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_keyword_rankings.blog_post_id
      AND author_id = auth.uid()
    )
  );

CREATE POLICY "Authors can manage keyword rankings" ON blog_keyword_rankings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_keyword_rankings.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- Blog Comments RLS
CREATE POLICY "Anyone can view approved comments" ON blog_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can manage comments on their posts" ON blog_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_comments.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- Blog Categories RLS
CREATE POLICY "Anyone can view categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Blog Post Views RLS
CREATE POLICY "Anyone can record views" ON blog_post_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authors can view their post analytics" ON blog_post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_post_views.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- SEO Audits RLS
CREATE POLICY "Authors can view their SEO audits" ON blog_seo_audits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = blog_seo_audits.blog_post_id
      AND author_id = auth.uid()
    )
  );

-- AI Prompts RLS
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

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Nutrition Basics', 'nutrition-basics', 'Fundamental nutrition concepts and principles'),
  ('Weight Loss', 'weight-loss', 'Tips and strategies for healthy weight loss'),
  ('Meal Prep', 'meal-prep', 'Meal preparation guides and recipes'),
  ('Sports Nutrition', 'sports-nutrition', 'Nutrition for athletes and active individuals'),
  ('Healthy Recipes', 'healthy-recipes', 'Nutritious and delicious recipes'),
  ('Wellness Tips', 'wellness-tips', 'General health and wellness advice'),
  ('Diet Plans', 'diet-plans', 'Various diet approaches and plans'),
  ('Supplements', 'supplements', 'Information about nutritional supplements');

-- Success message
SELECT 'Blog system created successfully! ✅' as status;
