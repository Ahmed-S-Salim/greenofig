-- Create custom_offers table
CREATE TABLE IF NOT EXISTS custom_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),

  -- Pricing
  custom_price DECIMAL(10, 2),
  discount_percentage INTEGER,
  discount_amount DECIMAL(10, 2),

  -- Subscription details
  subscription_type TEXT, -- 'premium', 'pro', 'elite', 'custom'
  billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual', 'lifetime'

  -- Features
  features JSONB DEFAULT '{}', -- Custom features object
  feature_limits JSONB DEFAULT '{}', -- e.g., {"ai_messages": 100, "workouts": 50}

  -- Perks
  has_priority_support BOOLEAN DEFAULT false,
  has_beta_access BOOLEAN DEFAULT false,
  remove_branding BOOLEAN DEFAULT false,

  -- Trial
  trial_days INTEGER DEFAULT 0,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  offer_start_date TIMESTAMPTZ DEFAULT NOW(),
  offer_end_date TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table for admin-customer chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,

  -- Metadata
  sender_role TEXT, -- 'admin', 'user', etc.
  recipient_role TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create offer_history table for tracking changes
CREATE TABLE IF NOT EXISTS offer_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES custom_offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  changed_by UUID REFERENCES auth.users(id),

  change_type TEXT, -- 'created', 'updated', 'activated', 'deactivated'
  changes JSONB, -- Store what changed

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_offers_user_id ON custom_offers(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_offers_active ON custom_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_offer_history_offer_id ON offer_history(offer_id);

-- Enable Row Level Security
ALTER TABLE custom_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_offers
CREATE POLICY "Users can view their own offers"
  ON custom_offers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all offers"
  ON custom_offers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert offers"
  ON custom_offers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update offers"
  ON custom_offers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

-- RLS Policies for offer_history
CREATE POLICY "Admins can view offer history"
  ON offer_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_custom_offers_updated_at
  BEFORE UPDATE ON custom_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
