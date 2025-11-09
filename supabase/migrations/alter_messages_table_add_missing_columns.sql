-- =====================================================
-- ALTER MESSAGES TABLE - ADD MISSING COLUMNS
-- =====================================================
-- This migration adds missing columns to the existing messages table
-- Run this if you get error: column "offer_data" does not exist
-- =====================================================

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add offer_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'offer_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN offer_type TEXT;
        RAISE NOTICE 'Added column: offer_type';
    END IF;

    -- Add offer_data column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'offer_data'
    ) THEN
        ALTER TABLE messages ADD COLUMN offer_data JSONB;
        RAISE NOTICE 'Added column: offer_data';
    END IF;

    -- Add file_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'file_url'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_url TEXT;
        RAISE NOTICE 'Added column: file_url';
    END IF;

    -- Add file_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'file_name'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_name TEXT;
        RAISE NOTICE 'Added column: file_name';
    END IF;

    -- Add file_size column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE messages ADD COLUMN file_size INTEGER;
        RAISE NOTICE 'Added column: file_size';
    END IF;

    -- Add sender_role column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'sender_role'
    ) THEN
        ALTER TABLE messages ADD COLUMN sender_role TEXT;
        RAISE NOTICE 'Added column: sender_role';
    END IF;

    -- Add recipient_role column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'recipient_role'
    ) THEN
        ALTER TABLE messages ADD COLUMN recipient_role TEXT;
        RAISE NOTICE 'Added column: recipient_role';
    END IF;

    -- Add message_type column (with check constraint)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'message_type'
    ) THEN
        ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text';
        ALTER TABLE messages ADD CONSTRAINT messages_type_check
            CHECK (message_type IN ('text', 'offer', 'system', 'file'));
        RAISE NOTICE 'Added column: message_type with check constraint';
    END IF;

    -- Add is_read column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: is_read';
    END IF;

    -- Add read_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'read_at'
    ) THEN
        ALTER TABLE messages ADD COLUMN read_at TIMESTAMPTZ;
        RAISE NOTICE 'Added column: read_at';
    END IF;

END $$;

-- Create indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = FALSE;

-- Enable Row Level Security (idempotent)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can read their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can mark received messages as read" ON messages;

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
DROP TRIGGER IF EXISTS messages_updated_at_trigger ON messages;
CREATE TRIGGER messages_updated_at_trigger
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count_for_user(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE recipient_id = p_user_id AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE messages IS 'Stores all messages between users (admin-customer, user-nutritionist)';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text (normal), offer (special offer), system (automated), file (attachment)';
COMMENT ON COLUMN messages.offer_type IS 'Type of offer if message_type = offer: discount_10, discount_20, free_month, etc.';
COMMENT ON COLUMN messages.offer_data IS 'JSON data for offer details (amount, expiry, etc.)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Messages table migration completed successfully!';
    RAISE NOTICE 'All missing columns have been added.';
    RAISE NOTICE 'RLS policies have been created.';
    RAISE NOTICE 'Indexes have been created for performance.';
END $$;
