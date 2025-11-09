-- Add content_format column to blog_posts table
-- This allows us to differentiate between markdown and HTML content

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'blog_posts'
        AND column_name = 'content_format'
    ) THEN
        ALTER TABLE blog_posts
        ADD COLUMN content_format TEXT DEFAULT 'html' CHECK (content_format IN ('html', 'markdown'));

        -- Update all existing posts to be 'html' format (they were created before markdown support)
        UPDATE blog_posts
        SET content_format = 'html'
        WHERE content_format IS NULL;

        -- Create index for faster queries
        CREATE INDEX IF NOT EXISTS idx_blog_posts_content_format ON blog_posts(content_format);

        RAISE NOTICE 'Successfully added content_format column to blog_posts';
    ELSE
        RAISE NOTICE 'content_format column already exists';
    END IF;
END $$;

COMMENT ON COLUMN blog_posts.content_format IS 'Format of the content: html (old posts) or markdown (AI-generated posts)';
