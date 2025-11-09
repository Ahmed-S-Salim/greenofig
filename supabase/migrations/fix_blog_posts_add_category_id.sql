-- Fix blog_posts table to add category_id and other missing columns
-- This fixes the "could not find 'category_id' column" error

DO $$
BEGIN
    -- Add category_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blog_posts' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;

        CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);

        RAISE NOTICE 'Added category_id column to blog_posts';
    ELSE
        RAISE NOTICE 'category_id column already exists';
    END IF;

    -- Add cover_image_url if it doesn't exist (replaces featured_image_url)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blog_posts' AND column_name = 'cover_image_url'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN cover_image_url TEXT;

        -- Copy data from featured_image_url if it exists
        UPDATE blog_posts SET cover_image_url = featured_image_url WHERE featured_image_url IS NOT NULL;

        RAISE NOTICE 'Added cover_image_url column to blog_posts';
    ELSE
        RAISE NOTICE 'cover_image_url column already exists';
    END IF;

    -- Add reading_time_minutes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blog_posts' AND column_name = 'reading_time_minutes'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN reading_time_minutes INTEGER DEFAULT 5;

        RAISE NOTICE 'Added reading_time_minutes column to blog_posts';
    ELSE
        RAISE NOTICE 'reading_time_minutes column already exists';
    END IF;

    -- Add featured flag if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blog_posts' AND column_name = 'featured'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN featured BOOLEAN DEFAULT false;

        RAISE NOTICE 'Added featured column to blog_posts';
    ELSE
        RAISE NOTICE 'featured column already exists';
    END IF;

    -- Add scheduled_publish_at if it doesn't exist (replaces scheduled_for)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blog_posts' AND column_name = 'scheduled_publish_at'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE;

        -- Copy data from scheduled_for if it exists
        UPDATE blog_posts SET scheduled_publish_at = scheduled_for WHERE scheduled_for IS NOT NULL;

        RAISE NOTICE 'Added scheduled_publish_at column to blog_posts';
    ELSE
        RAISE NOTICE 'scheduled_publish_at column already exists';
    END IF;

END $$;

-- Update the publish_scheduled_posts function to use new column name
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET status = 'published',
      published_at = NOW()
  WHERE status = 'scheduled'
  AND scheduled_publish_at <= NOW()
  AND published_at IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN blog_posts.category_id IS 'Foreign key reference to blog_categories table';
COMMENT ON COLUMN blog_posts.cover_image_url IS 'URL for the blog post cover/featured image';
COMMENT ON COLUMN blog_posts.reading_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blog_posts.featured IS 'Whether this post is featured on homepage';
COMMENT ON COLUMN blog_posts.scheduled_publish_at IS 'Scheduled publishing date and time';
