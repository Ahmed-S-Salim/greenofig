-- =====================================================
-- CREATE MESSAGES TABLE FOR NUTRITIONIST MESSAGING
-- Created: 2025-11-24
-- Purpose: Fix "Failed to load conversations" error
-- =====================================================

-- Messages table for nutritionist-client communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their sent messages" ON messages;

-- Users can see messages where they are sender or recipient
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

-- Users can send messages (insert)
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update their received messages"
  ON messages
  FOR UPDATE
  USING (
    auth.uid() = recipient_id
  )
  WITH CHECK (
    auth.uid() = recipient_id
  );

-- Users can delete their own sent messages
CREATE POLICY "Users can delete their sent messages"
  ON messages
  FOR DELETE
  USING (
    auth.uid() = sender_id
  );

-- Grant permissions
GRANT ALL ON messages TO authenticated;
GRANT USAGE ON SEQUENCE messages_id_seq TO authenticated;

-- Add comment to table
COMMENT ON TABLE messages IS 'Stores messages between nutritionists and clients';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Messages table created successfully!';
  RAISE NOTICE 'Nutritionists can now send and receive messages without errors.';
END $$;
