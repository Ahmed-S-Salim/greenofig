-- STEP 1: Create Blog Tables Only
-- Run this first in Supabase SQL Editor

-- Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
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

-- Blog Keyword Rankings
CREATE TABLE IF NOT EXISTS blog_keyword_rankings (
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

-- Blog Post Views
CREATE TABLE IF NOT EXISTS blog_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  time_spent INTEGER,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog SEO Audits
CREATE TABLE IF NOT EXISTS blog_seo_audits (
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

-- Blog AI Prompts
CREATE TABLE IF NOT EXISTS blog_ai_prompts (
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
