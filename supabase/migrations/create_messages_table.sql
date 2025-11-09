-- =====================================================
-- MESSAGES TABLE FOR ADMIN-CUSTOMER CHAT - FIXED
-- =====================================================

-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  sender_role TEXT,
  recipient_role TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  offer_type TEXT,
  offer_data JSONB,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Add constraints
  CONSTRAINT messages_sender_fk FOREIGN KEY (sender_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  CONSTRAINT messages_recipient_fk FOREIGN KEY (recipient_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  CONSTRAINT message_type_check CHECK (message_type IN ('text', 'offer', 'system', 'file'))
);

-- Create indexes for performance
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read messages they sent or received
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- RLS Policy: Users can send messages (sender must be themselves)
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

-- RLS Policy: Users can mark messages as read (only recipients)
CREATE POLICY "Users can mark received messages as read"
ON messages FOR UPDATE
USING (recipient_id = auth.uid())
WITH CHECK (recipient_id = auth.uid());

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER messages_updated_at_trigger
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count_for_user(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(COUNT(*)::INTEGER, 0)
    FROM messages
    WHERE recipient_id = p_user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Stores all messages between users (admin-customer, user-nutritionist)';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text (normal), offer (special offer), system (automated), file (attachment)';
COMMENT ON COLUMN messages.offer_type IS 'Type of offer if message_type = offer: discount_10, discount_20, free_month, etc.';
COMMENT ON COLUMN messages.offer_data IS 'JSON data for offer details (amount, expiry, etc.)';
