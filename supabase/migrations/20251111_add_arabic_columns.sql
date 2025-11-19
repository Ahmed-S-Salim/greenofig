-- Migration: Add Arabic language support columns to all content tables
-- Created: 2025-11-11

-- Add Arabic columns to site_content table (for AboutPage and FaqPage)
ALTER TABLE site_content
ADD COLUMN IF NOT EXISTS content_ar JSONB;

-- Add Arabic columns to testimonials table (for ReviewsPage)
ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS customer_title_ar TEXT,
ADD COLUMN IF NOT EXISTS quote_ar TEXT;

-- Add Arabic columns to blog_posts table (for BlogPage)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS title_ar TEXT,
ADD COLUMN IF NOT EXISTS excerpt_ar TEXT,
ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- Add Arabic columns to features table (for FeaturesPage)
ALTER TABLE features
ADD COLUMN IF NOT EXISTS name_ar TEXT,
ADD COLUMN IF NOT EXISTS description_ar TEXT,
ADD COLUMN IF NOT EXISTS category_ar TEXT;

-- Add comment to document the migration
COMMENT ON COLUMN site_content.content_ar IS 'Arabic translation of page content (JSONB format)';
COMMENT ON COLUMN testimonials.customer_title_ar IS 'Arabic translation of customer title';
COMMENT ON COLUMN testimonials.quote_ar IS 'Arabic translation of testimonial quote';
COMMENT ON COLUMN blog_posts.title_ar IS 'Arabic translation of post title';
COMMENT ON COLUMN blog_posts.excerpt_ar IS 'Arabic translation of post excerpt';
COMMENT ON COLUMN blog_posts.content_ar IS 'Arabic translation of post content';
COMMENT ON COLUMN features.name_ar IS 'Arabic translation of feature name';
COMMENT ON COLUMN features.description_ar IS 'Arabic translation of feature description';
COMMENT ON COLUMN features.category_ar IS 'Arabic translation of feature category';
