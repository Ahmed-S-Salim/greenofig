-- Fix Blog Tables - Run this in Supabase SQL Editor
-- This ensures all blog tables exist with proper relationships

-- Step 1: Create blog_posts table if not exists
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  featured BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  category_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- Step 4: Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Add category_id foreign key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'blog_posts_category_id_fkey'
  ) THEN
    ALTER TABLE blog_posts
    ADD CONSTRAINT blog_posts_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Step 7: Enable RLS (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for blog_posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can insert their own posts" ON blog_posts;
CREATE POLICY "Authors can insert their own posts" ON blog_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Authors can update their own posts" ON blog_posts;
CREATE POLICY "Authors can update their own posts" ON blog_posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Authors can delete their own posts" ON blog_posts;
CREATE POLICY "Authors can delete their own posts" ON blog_posts
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Step 9: Create RLS policies for blog_tags
DROP POLICY IF EXISTS "Anyone can view tags" ON blog_tags;
CREATE POLICY "Anyone can view tags" ON blog_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tags" ON blog_tags;
CREATE POLICY "Admins can manage tags" ON blog_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Step 10: Create RLS policies for blog_post_tags
DROP POLICY IF EXISTS "Anyone can view post tags" ON blog_post_tags;
CREATE POLICY "Anyone can view post tags" ON blog_post_tags
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authors can manage their post tags" ON blog_post_tags;
CREATE POLICY "Authors can manage their post tags" ON blog_post_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM blog_posts
      WHERE id = post_id
      AND (author_id = auth.uid() OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
      ))
    )
  );

-- Step 11: Create RLS policies for blog_categories
DROP POLICY IF EXISTS "Anyone can view categories" ON blog_categories;
CREATE POLICY "Anyone can view categories" ON blog_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
CREATE POLICY "Admins can manage categories" ON blog_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Step 12: Insert default categories if they don't exist
INSERT INTO blog_categories (name, slug, description)
VALUES
  ('Nutrition', 'nutrition', 'Posts about nutrition and healthy eating'),
  ('Fitness', 'fitness', 'Posts about fitness and exercise'),
  ('Wellness', 'wellness', 'Posts about overall health and wellness'),
  ('Recipes', 'recipes', 'Healthy recipes and meal ideas')
ON CONFLICT (slug) DO NOTHING;

-- Step 13: Insert default tags if they don't exist
INSERT INTO blog_tags (name, slug, description)
VALUES
  ('Weight Loss', 'weight-loss', 'Weight loss tips and advice'),
  ('Healthy Eating', 'healthy-eating', 'Healthy eating habits'),
  ('Workout', 'workout', 'Workout routines and exercises'),
  ('Mental Health', 'mental-health', 'Mental health and mindfulness')
ON CONFLICT (slug) DO NOTHING;

-- Verify tables exist
SELECT 'blog_posts' as table_name, COUNT(*) as row_count FROM blog_posts
UNION ALL
SELECT 'blog_tags', COUNT(*) FROM blog_tags
UNION ALL
SELECT 'blog_post_tags', COUNT(*) FROM blog_post_tags
UNION ALL
SELECT 'blog_categories', COUNT(*) FROM blog_categories;
