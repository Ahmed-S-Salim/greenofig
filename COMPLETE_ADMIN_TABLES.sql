-- =====================================================
-- COMPLETE ADMIN TABLES FOR COUPONS, REFERRALS & REVENUE
-- =====================================================
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click "Run" to create all necessary tables
-- =====================================================

-- =====================================================
-- 1. COUPON CODES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,

  -- Discount details
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,

  -- Usage limits
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,

  -- Restrictions
  min_purchase_amount DECIMAL(10, 2),
  applicable_plans TEXT[],

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  description TEXT,
  internal_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon indexes
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_active ON coupon_codes(is_active);

-- =====================================================
-- 2. COUPON REDEMPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupon_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Redemption details
  discount_applied DECIMAL(10, 2),
  original_amount DECIMAL(10, 2),
  final_amount DECIMAL(10, 2),

  -- Related records
  subscription_id UUID,
  payment_id UUID,

  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);

-- =====================================================
-- 3. REFERRAL PROGRAM TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS referral_program (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Reward settings
  referrer_reward_type TEXT DEFAULT 'credit' CHECK (referrer_reward_type IN ('credit', 'discount_percentage', 'free_months')),
  referrer_reward_value DECIMAL(10, 2) DEFAULT 10.00,

  referee_reward_type TEXT DEFAULT 'discount_percentage' CHECK (referee_reward_type IN ('credit', 'discount_percentage', 'free_months')),
  referee_reward_value DECIMAL(10, 2) DEFAULT 20.00,

  -- Requirements
  min_referee_subscription_months INTEGER DEFAULT 1,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. REFERRALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Referral code
  referral_code TEXT NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),

  -- Rewards
  referrer_rewarded BOOLEAN DEFAULT false,
  referrer_reward_details JSONB,
  referee_rewarded BOOLEAN DEFAULT false,
  referee_reward_details JSONB,

  -- Dates
  referred_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  referrer_rewarded_at TIMESTAMPTZ,
  referee_rewarded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(referrer_id, referee_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS POLICIES FOR COUPON_CODES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupon_codes;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupon_codes;

CREATE POLICY "Anyone can view active coupons"
  ON coupon_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON coupon_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 7. RLS POLICIES FOR COUPON_REDEMPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their redemptions" ON coupon_redemptions;
DROP POLICY IF EXISTS "Admins can view all redemptions" ON coupon_redemptions;
DROP POLICY IF EXISTS "Users can redeem coupons" ON coupon_redemptions;

CREATE POLICY "Users can view their redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON coupon_redemptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can redeem coupons"
  ON coupon_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 8. RLS POLICIES FOR REFERRAL_PROGRAM
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active referral program" ON referral_program;
DROP POLICY IF EXISTS "Admins can manage referral program" ON referral_program;

CREATE POLICY "Anyone can view active referral program"
  ON referral_program FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage referral program"
  ON referral_program FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 9. RLS POLICIES FOR REFERRALS
-- =====================================================

DROP POLICY IF EXISTS "Users can view their referrals" ON referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can update referrals" ON referrals;

CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_coupon_codes_updated_at ON coupon_codes;
DROP TRIGGER IF EXISTS update_referral_program_updated_at ON referral_program;

-- Create triggers
CREATE TRIGGER update_coupon_codes_updated_at
  BEFORE UPDATE ON coupon_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_program_updated_at
  BEFORE UPDATE ON referral_program
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to check coupon validity
CREATE OR REPLACE FUNCTION is_coupon_valid(coupon_code_text TEXT, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  coupon RECORD;
  user_redemptions INTEGER;
BEGIN
  -- Get coupon details
  SELECT * INTO coupon FROM coupon_codes WHERE code = coupon_code_text AND is_active = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check date validity
  IF coupon.valid_until IS NOT NULL AND coupon.valid_until < NOW() THEN
    RETURN false;
  END IF;

  IF coupon.valid_from > NOW() THEN
    RETURN false;
  END IF;

  -- Check max uses
  IF coupon.max_uses IS NOT NULL AND coupon.current_uses >= coupon.max_uses THEN
    RETURN false;
  END IF;

  -- Check user-specific usage limit
  SELECT COUNT(*) INTO user_redemptions
  FROM coupon_redemptions
  WHERE coupon_id = coupon.id AND user_id = user_uuid;

  IF user_redemptions >= coupon.max_uses_per_user THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. INSERT DEFAULT REFERRAL PROGRAM SETTINGS
-- =====================================================

INSERT INTO referral_program (
  referrer_reward_type,
  referrer_reward_value,
  referee_reward_type,
  referee_reward_value,
  min_referee_subscription_months,
  is_active
) VALUES (
  'credit',
  10.00,
  'discount_percentage',
  20.00,
  1,
  true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- You should now have these tables:
-- ✓ coupon_codes
-- ✓ coupon_redemptions
-- ✓ referral_program
-- ✓ referrals
--
-- Plus all necessary:
-- ✓ Indexes
-- ✓ RLS Policies
-- ✓ Triggers
-- ✓ Helper Functions
-- =====================================================
