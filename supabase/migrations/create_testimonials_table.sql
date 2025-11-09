-- =====================================================
-- TESTIMONIALS TABLE FOR CUSTOMER REVIEWS - FIXED
-- =====================================================

-- Drop the table if it exists to start fresh (IMPORTANT: This will delete existing data)
-- If you have existing data, skip the DROP and use ALTER TABLE instead
DROP TABLE IF EXISTS testimonials CASCADE;

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_title VARCHAR(255),
  customer_company VARCHAR(255),
  customer_location VARCHAR(255),
  customer_image VARCHAR(500),
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  category VARCHAR(100) DEFAULT 'general',
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  source VARCHAR(50) DEFAULT 'direct',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Add constraints
  CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT category_check CHECK (category IN ('general', 'weight_loss', 'muscle_gain', 'health', 'fitness', 'nutrition')),
  CONSTRAINT source_check CHECK (source IN ('direct', 'google', 'trustpilot', 'facebook', 'email'))
);

-- Create indexes
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured, is_approved, display_order) WHERE is_approved = TRUE;
CREATE INDEX idx_testimonials_category ON testimonials(category, is_approved) WHERE is_approved = TRUE;
CREATE INDEX idx_testimonials_rating ON testimonials(rating, is_approved) WHERE is_approved = TRUE;
CREATE INDEX idx_testimonials_source ON testimonials(source, created_at DESC);

-- Enable Row Level Security
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can read approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
ON testimonials FOR SELECT
USING (is_approved = TRUE);

-- RLS Policy: Users can view their own testimonials (even if not approved)
CREATE POLICY "Users can view their own testimonials"
ON testimonials FOR SELECT
USING (user_id = auth.uid());

-- RLS Policy: Admins and super_admins can do everything
CREATE POLICY "Admins can manage testimonials"
ON testimonials FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at_trigger
BEFORE UPDATE ON testimonials
FOR EACH ROW
EXECUTE FUNCTION update_testimonials_updated_at();

-- Create function to get average rating
CREATE OR REPLACE FUNCTION get_testimonials_average_rating()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
    FROM testimonials
    WHERE is_approved = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get testimonials count by category
CREATE OR REPLACE FUNCTION get_testimonials_count_by_category()
RETURNS TABLE(category VARCHAR, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.category, COUNT(*)
  FROM testimonials t
  WHERE t.is_approved = TRUE
  GROUP BY t.category
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE testimonials IS 'Customer testimonials and reviews for the website';
COMMENT ON COLUMN testimonials.is_featured IS 'Whether this testimonial appears on homepage';
COMMENT ON COLUMN testimonials.is_verified IS 'Whether customer identity is verified';
COMMENT ON COLUMN testimonials.is_approved IS 'Admin approval status';
COMMENT ON COLUMN testimonials.display_order IS 'Order in which testimonials appear (lower = first)';
COMMENT ON COLUMN testimonials.metadata IS 'Additional data: video_url, before_after_images, etc.';
