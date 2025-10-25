-- =====================================================
-- WEBSITE CONTENT MANAGEMENT SYSTEM - SQL MIGRATION
-- =====================================================
-- This migration adds comprehensive website content management capabilities
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. HOMEPAGE CONTENT TABLE
-- =====================================================
-- Stores homepage sections (hero, features, CTA, etc.)

CREATE TABLE IF NOT EXISTS homepage_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type TEXT NOT NULL, -- 'hero', 'features', 'cta', 'stats', 'process'
  section_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Content fields
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content JSONB, -- Flexible JSON for complex content

  -- Media
  image_url TEXT,
  video_url TEXT,
  background_image_url TEXT,

  -- CTA fields
  cta_text TEXT,
  cta_link TEXT,
  cta_type TEXT, -- 'primary', 'secondary', 'outline'

  -- Styling
  background_color TEXT,
  text_color TEXT,
  custom_css JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_homepage_content_section_type ON homepage_content(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_content_is_active ON homepage_content(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_content_order ON homepage_content(section_order);

-- =====================================================
-- 2. TESTIMONIALS TABLE
-- =====================================================
-- Stores customer reviews and testimonials

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Customer info
  customer_name TEXT NOT NULL,
  customer_title TEXT, -- e.g., "CEO", "Fitness Enthusiast"
  customer_company TEXT,
  customer_avatar_url TEXT,
  customer_location TEXT,

  -- Testimonial content
  quote TEXT NOT NULL,
  full_review TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Social proof
  verified BOOLEAN DEFAULT false,
  source TEXT, -- 'website', 'google', 'trustpilot', 'app_store'
  source_url TEXT,

  -- Categorization
  category TEXT, -- 'nutrition', 'fitness', 'wellness', 'general'
  tags TEXT[],

  -- Display settings
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_category ON testimonials(category);

-- =====================================================
-- 3. CONTACT INFO TABLE
-- =====================================================
-- Stores contact information and social links

CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact details
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,

  -- Business hours
  business_hours JSONB, -- e.g., {"monday": "9am-5pm", "tuesday": "9am-5pm"}
  timezone TEXT,

  -- Social media
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,

  -- Other links
  blog_url TEXT,
  support_url TEXT,
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,

  -- Settings
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Only allow one active contact info record
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_info_single_active
  ON contact_info(is_active) WHERE is_active = true;

-- =====================================================
-- 4. NAVIGATION MENUS TABLE
-- =====================================================
-- Stores header and footer navigation menus

CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Menu identification
  menu_type TEXT NOT NULL, -- 'header', 'footer', 'mobile', 'sidebar'
  menu_name TEXT NOT NULL,

  -- Menu structure (hierarchical JSON)
  menu_items JSONB NOT NULL, -- Array of menu items with children

  -- Settings
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_navigation_menus_type ON navigation_menus(menu_type);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_active ON navigation_menus(is_active);

-- =====================================================
-- 5. SEO SETTINGS TABLE
-- =====================================================
-- Stores global and page-specific SEO settings

CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Page identification
  page_path TEXT UNIQUE NOT NULL, -- '/', '/about', '/pricing', etc.
  page_name TEXT NOT NULL,

  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT, -- Open Graph title
  og_description TEXT,
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image_url TEXT,

  -- Schema.org structured data
  schema_markup JSONB,

  -- Canonical and indexing
  canonical_url TEXT,
  robots_meta TEXT DEFAULT 'index,follow',

  -- Priority and change frequency for sitemap
  sitemap_priority DECIMAL(2,1) DEFAULT 0.5 CHECK (sitemap_priority >= 0 AND sitemap_priority <= 1),
  sitemap_changefreq TEXT DEFAULT 'weekly', -- 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'

  -- Settings
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_seo_settings_page_path ON seo_settings(page_path);
CREATE INDEX IF NOT EXISTS idx_seo_settings_active ON seo_settings(is_active);

-- =====================================================
-- 6. MEDIA LIBRARY TABLE
-- =====================================================
-- Centralized media management

CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL, -- 'image', 'video', 'document', 'audio'
  mime_type TEXT,
  file_size_bytes BIGINT,

  -- Image-specific
  width INTEGER,
  height INTEGER,
  alt_text TEXT,

  -- Organization
  folder TEXT DEFAULT 'root',
  tags TEXT[],

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  used_in JSONB, -- Track where this media is used

  -- SEO
  seo_title TEXT,
  seo_description TEXT,

  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);

-- =====================================================
-- 7. WEBSITE ACTIVITY LOG
-- =====================================================
-- Track all website content changes

CREATE TABLE IF NOT EXISTS website_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Activity info
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'published', 'unpublished'

  -- User info
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,

  -- Change details
  old_data JSONB,
  new_data JSONB,
  changes JSONB,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_website_activity_log_table ON website_activity_log(table_name);
CREATE INDEX IF NOT EXISTS idx_website_activity_log_created_at ON website_activity_log(created_at DESC);

-- =====================================================
-- 8. TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_website_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER trigger_update_homepage_content_updated_at
  BEFORE UPDATE ON homepage_content
  FOR EACH ROW EXECUTE FUNCTION update_website_updated_at();

CREATE TRIGGER trigger_update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_website_updated_at();

CREATE TRIGGER trigger_update_contact_info_updated_at
  BEFORE UPDATE ON contact_info
  FOR EACH ROW EXECUTE FUNCTION update_website_updated_at();

CREATE TRIGGER trigger_update_navigation_menus_updated_at
  BEFORE UPDATE ON navigation_menus
  FOR EACH ROW EXECUTE FUNCTION update_website_updated_at();

CREATE TRIGGER trigger_update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_website_updated_at();

CREATE TRIGGER trigger_update_media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_website_updated_at();

-- =====================================================
-- 9. ACTIVITY LOGGING TRIGGERS
-- =====================================================

-- Generic activity logging function
CREATE OR REPLACE FUNCTION log_website_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Log the activity
  INSERT INTO website_activity_log (
    table_name,
    record_id,
    action,
    user_id,
    user_email,
    old_data,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' THEN 'updated'
      WHEN TG_OP = 'DELETE' THEN 'deleted'
    END,
    auth.uid(),
    v_user_email,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to all tables
CREATE TRIGGER trigger_log_homepage_content_activity
  AFTER INSERT OR UPDATE OR DELETE ON homepage_content
  FOR EACH ROW EXECUTE FUNCTION log_website_activity();

CREATE TRIGGER trigger_log_testimonials_activity
  AFTER INSERT OR UPDATE OR DELETE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION log_website_activity();

CREATE TRIGGER trigger_log_contact_info_activity
  AFTER INSERT OR UPDATE OR DELETE ON contact_info
  FOR EACH ROW EXECUTE FUNCTION log_website_activity();

CREATE TRIGGER trigger_log_navigation_menus_activity
  AFTER INSERT OR UPDATE OR DELETE ON navigation_menus
  FOR EACH ROW EXECUTE FUNCTION log_website_activity();

CREATE TRIGGER trigger_log_seo_settings_activity
  AFTER INSERT OR UPDATE OR DELETE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION log_website_activity();

CREATE TRIGGER trigger_log_media_library_activity
  AFTER INSERT OR UPDATE OR DELETE ON media_library
  FOR EACH ROW EXECUTE FUNCTION log_website_activity();

-- =====================================================
-- 10. UTILITY FUNCTIONS
-- =====================================================

-- Function to get website statistics
CREATE OR REPLACE FUNCTION get_website_statistics()
RETURNS TABLE(
  total_homepage_sections BIGINT,
  active_homepage_sections BIGINT,
  total_testimonials BIGINT,
  featured_testimonials BIGINT,
  total_media_files BIGINT,
  total_media_size_mb DECIMAL,
  total_seo_pages BIGINT,
  recent_activities BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM homepage_content)::BIGINT,
    (SELECT COUNT(*) FROM homepage_content WHERE is_active = true)::BIGINT,
    (SELECT COUNT(*) FROM testimonials)::BIGINT,
    (SELECT COUNT(*) FROM testimonials WHERE is_featured = true)::BIGINT,
    (SELECT COUNT(*) FROM media_library)::BIGINT,
    (SELECT COALESCE(SUM(file_size_bytes), 0) / 1024.0 / 1024.0 FROM media_library)::DECIMAL,
    (SELECT COUNT(*) FROM seo_settings)::BIGINT,
    (SELECT COUNT(*) FROM website_activity_log WHERE created_at > NOW() - INTERVAL '7 days')::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Function to get testimonials by rating
CREATE OR REPLACE FUNCTION get_testimonials_by_rating()
RETURNS TABLE(
  rating INTEGER,
  count BIGINT,
  percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.rating,
    COUNT(*)::BIGINT as count,
    ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM testimonials), 0))::DECIMAL, 2) as percentage
  FROM testimonials t
  WHERE t.is_active = true
  GROUP BY t.rating
  ORDER BY t.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to increment media usage count
CREATE OR REPLACE FUNCTION increment_media_usage(media_id UUID, used_location TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE media_library
  SET
    usage_count = usage_count + 1,
    used_in = COALESCE(used_in, '[]'::jsonb) || jsonb_build_object('location', used_location, 'added_at', NOW())
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_activity_log ENABLE ROW LEVEL SECURITY;

-- Public read access for active content
CREATE POLICY "Anyone can view active homepage content"
  ON homepage_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active contact info"
  ON contact_info FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active navigation menus"
  ON navigation_menus FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active SEO settings"
  ON seo_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view media files"
  ON media_library FOR SELECT
  USING (true);

-- Admin full access policies
CREATE POLICY "Admins can manage homepage content"
  ON homepage_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage contact info"
  ON contact_info FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage navigation menus"
  ON navigation_menus FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage SEO settings"
  ON seo_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage media library"
  ON media_library FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view activity log"
  ON website_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 12. DEFAULT DATA
-- =====================================================

-- Insert default contact info
INSERT INTO contact_info (
  email,
  phone,
  address,
  city,
  state,
  country,
  business_hours,
  is_active
) VALUES (
  'support@greenofig.com',
  '+1 (555) 123-4567',
  '123 Wellness Street',
  'San Francisco',
  'CA',
  'USA',
  '{"monday": "9:00 AM - 6:00 PM", "tuesday": "9:00 AM - 6:00 PM", "wednesday": "9:00 AM - 6:00 PM", "thursday": "9:00 AM - 6:00 PM", "friday": "9:00 AM - 6:00 PM", "saturday": "10:00 AM - 4:00 PM", "sunday": "Closed"}'::jsonb,
  true
) ON CONFLICT DO NOTHING;

-- Insert default SEO settings for main pages
INSERT INTO seo_settings (page_path, page_name, meta_title, meta_description, sitemap_priority, sitemap_changefreq) VALUES
  ('/', 'Home', 'GreenoFig - AI-Powered Health & Wellness Platform', 'Transform your health with GreenoFig''s AI-powered personalized nutrition, fitness, and wellness coaching. Start your journey today.', 1.0, 'daily'),
  ('/features', 'Features', 'Features - GreenoFig AI Health Coach', 'Discover GreenoFig''s powerful features including AI nutrition coaching, personalized meal plans, fitness tracking, and wellness insights.', 0.9, 'weekly'),
  ('/pricing', 'Pricing', 'Pricing Plans - GreenoFig', 'Choose the perfect plan for your health journey. Flexible pricing options with AI-powered coaching and personalized support.', 0.9, 'weekly'),
  ('/about', 'About', 'About Us - GreenoFig', 'Learn about GreenoFig''s mission to make personalized health and wellness accessible to everyone through AI technology.', 0.7, 'monthly'),
  ('/contact', 'Contact', 'Contact Us - GreenoFig', 'Get in touch with the GreenoFig team. We''re here to help you on your health and wellness journey.', 0.6, 'monthly'),
  ('/blog', 'Blog', 'Health & Wellness Blog - GreenoFig', 'Expert insights, tips, and guides on nutrition, fitness, and wellness from the GreenoFig team.', 0.8, 'daily')
ON CONFLICT (page_path) DO NOTHING;

-- Insert sample homepage content
INSERT INTO homepage_content (section_type, section_order, title, subtitle, description, cta_text, cta_link, is_active) VALUES
  ('hero', 1, 'Transform Your Health with AI-Powered Coaching', 'Your Personal Health Companion', 'Get personalized nutrition, fitness, and wellness guidance powered by advanced AI technology. Start your journey to a healthier you today.', 'Get Started Free', '/signup', true),
  ('features', 2, 'Everything You Need to Succeed', 'Comprehensive Health Platform', 'From meal planning to workout tracking, we provide all the tools you need for your wellness journey.', 'Explore Features', '/features', true),
  ('cta', 3, 'Ready to Transform Your Life?', 'Join thousands achieving their health goals', 'Start your free trial today and experience the power of AI-driven health coaching.', 'Start Free Trial', '/signup', true)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, customer_title, quote, rating, is_featured, is_active, category) VALUES
  ('Sarah Johnson', 'Fitness Enthusiast', 'GreenoFig completely changed how I approach nutrition. The AI recommendations are spot-on and have helped me reach my goals faster than I ever thought possible.', 5, true, true, 'nutrition'),
  ('Michael Chen', 'Busy Professional', 'As someone with a hectic schedule, having an AI coach that adapts to my lifestyle has been a game-changer. I''ve lost 20 pounds and feel amazing!', 5, true, true, 'general'),
  ('Emily Rodriguez', 'Wellness Coach', 'I recommend GreenoFig to all my clients. The personalized approach and data-driven insights make it an invaluable tool for anyone serious about their health.', 5, true, true, 'wellness'),
  ('David Thompson', 'Marathon Runner', 'The nutrition tracking and meal planning features have optimized my training. I''ve seen significant improvements in my performance and recovery.', 5, false, true, 'fitness')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✅ Website content management tables created successfully!';
  RAISE NOTICE '📊 Tables: homepage_content, testimonials, contact_info, navigation_menus, seo_settings, media_library, website_activity_log';
  RAISE NOTICE '🔧 Functions: get_website_statistics(), get_testimonials_by_rating(), increment_media_usage()';
  RAISE NOTICE '🔒 RLS policies applied';
  RAISE NOTICE '📝 Default data inserted';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '1. Verify tables in Supabase Dashboard → Table Editor';
  RAISE NOTICE '2. Check functions in Database → Functions';
  RAISE NOTICE '3. Verify triggers in Database → Triggers';
  RAISE NOTICE '4. Test RLS policies with admin user';
END $$;
