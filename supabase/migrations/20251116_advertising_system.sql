-- GreenoFig Advertising System Database Schema
-- Comprehensive ad management for monetizing Basic (free) tier users

-- =====================================================
-- 1. AD PLACEMENTS - Define where ads can appear
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  placement_type VARCHAR(50) NOT NULL, -- 'banner', 'interstitial', 'video', 'native', 'sidebar'
  page_location VARCHAR(255), -- 'homepage', 'dashboard', 'blog', 'all'
  position VARCHAR(50), -- 'top', 'bottom', 'sidebar', 'inline', 'fullscreen'
  dimensions JSONB DEFAULT '{"width": 320, "height": 50}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default ad placements
INSERT INTO ad_placements (name, display_name, description, placement_type, page_location, position, dimensions, priority) VALUES
  ('top_banner', 'Top Banner', 'Banner ad at the top of pages', 'banner', 'all', 'top', '{"width": 728, "height": 90}', 10),
  ('bottom_banner', 'Bottom Banner', 'Persistent banner at bottom of screen', 'banner', 'all', 'bottom', '{"width": 320, "height": 50}', 9),
  ('dashboard_sidebar', 'Dashboard Sidebar', 'Sidebar ad in user dashboard', 'sidebar', 'dashboard', 'sidebar', '{"width": 300, "height": 250}', 8),
  ('after_ai_generation', 'After AI Generation', 'Interstitial after AI generates meal/workout plan', 'interstitial', 'dashboard', 'fullscreen', '{"width": 600, "height": 400}', 7),
  ('blog_inline', 'Blog Inline', 'Native ad within blog content', 'native', 'blog', 'inline', '{"width": 600, "height": 300}', 6),
  ('rewarded_video', 'Rewarded Video', 'Video ad for bonus features', 'video', 'dashboard', 'fullscreen', '{"width": 1280, "height": 720}', 5),
  ('homepage_inline', 'Homepage Inline', 'Native ad shown between sections on homepage', 'native', 'homepage', 'inline', '{"width": 800, "height": 300}', 11),
  ('homepage_hero', 'Homepage Hero', 'Featured ad on homepage', 'native', 'homepage', 'inline', '{"width": 800, "height": 400}', 4),
  ('features_inline', 'Features Page Inline', 'Native ad on features page', 'native', 'features', 'inline', '{"width": 800, "height": 300}', 10),
  ('pricing_sidebar', 'Pricing Sidebar', 'Sidebar ad on pricing page', 'sidebar', 'pricing', 'sidebar', '{"width": 300, "height": 250}', 7),
  ('contact_banner', 'Contact Page Banner', 'Banner ad on contact page', 'banner', 'contact', 'inline', '{"width": 728, "height": 90}', 6),
  ('meal_log_completion', 'Meal Log Completion', 'Ad shown after logging a meal', 'interstitial', 'dashboard', 'fullscreen', '{"width": 500, "height": 350}', 3)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. AD CAMPAIGNS - Advertiser campaigns
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign Info
  name VARCHAR(255) NOT NULL,
  advertiser_name VARCHAR(255),
  description TEXT,

  -- Creative Content
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  body_text TEXT,
  image_url TEXT,
  video_url TEXT,
  cta_text VARCHAR(100) DEFAULT 'Learn More',
  cta_url TEXT NOT NULL,
  background_color VARCHAR(20) DEFAULT '#ffffff',
  text_color VARCHAR(20) DEFAULT '#000000',

  -- Targeting
  placement_id UUID REFERENCES ad_placements(id) ON DELETE SET NULL,
  target_plans TEXT[] DEFAULT ARRAY['Base'], -- Only show to these plans
  target_countries VARCHAR(2)[], -- ISO country codes
  target_languages VARCHAR(10)[],

  -- Scheduling
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Budget & Billing
  budget_total DECIMAL(10, 2), -- Total budget
  budget_daily DECIMAL(10, 2), -- Daily spending limit
  cost_per_click DECIMAL(8, 4), -- CPC rate
  cost_per_impression DECIMAL(8, 6), -- CPM rate (per impression)
  cost_per_view DECIMAL(8, 4), -- For video ads

  -- Performance Limits
  max_impressions INTEGER,
  max_clicks INTEGER,
  max_daily_impressions INTEGER DEFAULT 10000,
  frequency_cap INTEGER DEFAULT 5, -- Max times shown to same user per day

  -- Analytics (denormalized for performance)
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,

  -- Admin
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'pending_review', 'active', 'paused', 'completed', 'rejected'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_campaigns_active ON ad_campaigns(is_active, status) WHERE is_active = true;
CREATE INDEX idx_ad_campaigns_placement ON ad_campaigns(placement_id);
CREATE INDEX idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);

-- =====================================================
-- 3. AD IMPRESSIONS - Track every view
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  placement_id UUID REFERENCES ad_placements(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Context
  page_path VARCHAR(500),
  referrer TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  country_code VARCHAR(2),
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'

  -- Engagement
  view_duration_ms INTEGER, -- How long ad was visible
  was_visible BOOLEAN DEFAULT true, -- Viewability tracking

  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX idx_impressions_user ON ad_impressions(user_id);
CREATE INDEX idx_impressions_viewed_at ON ad_impressions(viewed_at);
CREATE INDEX idx_impressions_placement ON ad_impressions(placement_id);

-- =====================================================
-- 4. AD CLICKS - Track interactions
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  impression_id UUID REFERENCES ad_impressions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Context
  page_path VARCHAR(500),
  ip_address VARCHAR(45),

  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clicks_campaign ON ad_clicks(campaign_id);
CREATE INDEX idx_clicks_user ON ad_clicks(user_id);
CREATE INDEX idx_clicks_impression ON ad_clicks(impression_id);

-- =====================================================
-- 5. AD CONVERSIONS - Track results
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  click_id UUID REFERENCES ad_clicks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Conversion Details
  conversion_type VARCHAR(50) NOT NULL, -- 'signup', 'upgrade', 'purchase', 'lead'
  conversion_value DECIMAL(10, 2) DEFAULT 0,
  attribution_window_hours INTEGER DEFAULT 24,

  converted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversions_campaign ON ad_conversions(campaign_id);
CREATE INDEX idx_conversions_type ON ad_conversions(conversion_type);

-- =====================================================
-- 6. USER AD PREFERENCES - Frequency capping
-- =====================================================
CREATE TABLE IF NOT EXISTS user_ad_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,

  -- Tracking
  impressions_today INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_clicked_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT false,

  -- Reset tracking
  date DATE DEFAULT CURRENT_DATE,

  UNIQUE(user_id, campaign_id, date)
);

CREATE INDEX idx_user_ad_interactions_user ON user_ad_interactions(user_id);
CREATE INDEX idx_user_ad_interactions_campaign ON user_ad_interactions(campaign_id);

-- =====================================================
-- 7. AD REVENUE REPORTS - Daily summaries
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_revenue_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,

  -- Metrics
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,

  -- Revenue
  impression_revenue DECIMAL(10, 2) DEFAULT 0,
  click_revenue DECIMAL(10, 2) DEFAULT 0,
  conversion_revenue DECIMAL(10, 2) DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,

  -- Performance
  ctr DECIMAL(8, 4) DEFAULT 0, -- Click-through rate
  cvr DECIMAL(8, 4) DEFAULT 0, -- Conversion rate
  ecpm DECIMAL(10, 4) DEFAULT 0, -- Effective CPM

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(date)
);

CREATE INDEX idx_ad_revenue_date ON ad_revenue_daily(date);

-- =====================================================
-- 8. FUNCTIONS - Helper functions
-- =====================================================

-- Function to increment campaign impressions
CREATE OR REPLACE FUNCTION increment_campaign_impressions(campaign_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE ad_campaigns
  SET total_impressions = total_impressions + 1,
      updated_at = NOW()
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment campaign clicks
CREATE OR REPLACE FUNCTION increment_campaign_clicks(campaign_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE ad_campaigns
  SET total_clicks = total_clicks + 1,
      updated_at = NOW()
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment campaign conversions
CREATE OR REPLACE FUNCTION increment_campaign_conversions(campaign_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE ad_campaigns
  SET total_conversions = total_conversions + 1,
      updated_at = NOW()
  WHERE id = campaign_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get active campaigns for a placement
CREATE OR REPLACE FUNCTION get_active_campaigns_for_placement(
  placement_name VARCHAR,
  user_plan TEXT DEFAULT 'Base'
)
RETURNS SETOF ad_campaigns AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM ad_campaigns c
  JOIN ad_placements p ON c.placement_id = p.id
  WHERE p.name = placement_name
    AND c.is_active = true
    AND c.status = 'active'
    AND c.start_date <= NOW()
    AND (c.end_date IS NULL OR c.end_date > NOW())
    AND user_plan = ANY(c.target_plans)
    AND (c.max_impressions IS NULL OR c.total_impressions < c.max_impressions)
  ORDER BY c.cost_per_click DESC, c.priority DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. RLS POLICIES - Security
-- =====================================================

-- Enable RLS
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ad_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_revenue_daily ENABLE ROW LEVEL SECURITY;

-- Placements: Anyone can read, only admins can modify
CREATE POLICY "Anyone can view ad placements" ON ad_placements FOR SELECT USING (true);
CREATE POLICY "Admins can manage placements" ON ad_placements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Campaigns: Admins can manage, users can view active ones
CREATE POLICY "Anyone can view active campaigns" ON ad_campaigns FOR SELECT USING (true);
CREATE POLICY "Admins can manage campaigns" ON ad_campaigns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Impressions: Users can insert for themselves, admins can view all
CREATE POLICY "Users can record their own impressions" ON ad_impressions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all impressions" ON ad_impressions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Clicks: Users can insert for themselves
CREATE POLICY "Users can record their own clicks" ON ad_clicks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can view all clicks" ON ad_clicks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Conversions: System/admins only
CREATE POLICY "Admins can manage conversions" ON ad_conversions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- User interactions: Users can manage their own
CREATE POLICY "Users can manage their ad interactions" ON user_ad_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Revenue: Admins only
CREATE POLICY "Admins can view revenue" ON ad_revenue_daily FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- =====================================================
-- 10. SAMPLE DATA - Demo campaigns
-- =====================================================

-- Insert sample campaigns (will be linked to placements after creation)
INSERT INTO ad_campaigns (
  name, advertiser_name, title, subtitle, body_text,
  cta_text, cta_url, target_plans, status, is_active,
  cost_per_click, cost_per_impression
) VALUES
(
  'Premium Upgrade Banner',
  'GreenoFig',
  'Upgrade to Premium',
  'Unlock unlimited AI meal plans',
  'Get personalized nutrition guidance without limits. Upgrade now for advanced analytics, unlimited AI chats, and more!',
  'Upgrade Now',
  '/pricing',
  ARRAY['Base'],
  'active',
  true,
  0.50,
  0.005
),
(
  'Health Supplement Promo',
  'VitaBoost Co.',
  'Boost Your Results',
  'Premium supplements for peak performance',
  'Scientifically formulated vitamins and supplements to complement your GreenoFig journey.',
  'Shop Now',
  'https://example.com/supplements',
  ARRAY['Base'],
  'active',
  true,
  1.00,
  0.008
),
(
  'Fitness Equipment Ad',
  'FitGear Pro',
  'Level Up Your Workouts',
  'Professional home gym equipment',
  'Transform your home into a professional gym. Quality equipment delivered to your door.',
  'View Products',
  'https://example.com/fitness-gear',
  ARRAY['Base'],
  'active',
  true,
  0.75,
  0.006
);

-- Link campaigns to placements
UPDATE ad_campaigns SET placement_id = (SELECT id FROM ad_placements WHERE name = 'top_banner' LIMIT 1)
WHERE name = 'Premium Upgrade Banner';

UPDATE ad_campaigns SET placement_id = (SELECT id FROM ad_placements WHERE name = 'dashboard_sidebar' LIMIT 1)
WHERE name = 'Health Supplement Promo';

UPDATE ad_campaigns SET placement_id = (SELECT id FROM ad_placements WHERE name = 'blog_inline' LIMIT 1)
WHERE name = 'Fitness Equipment Ad';

-- Grant necessary permissions
GRANT SELECT ON ad_placements TO authenticated;
GRANT SELECT ON ad_campaigns TO authenticated;
GRANT INSERT ON ad_impressions TO authenticated;
GRANT INSERT ON ad_clicks TO authenticated;
GRANT ALL ON user_ad_interactions TO authenticated;

-- Allow service role full access for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
