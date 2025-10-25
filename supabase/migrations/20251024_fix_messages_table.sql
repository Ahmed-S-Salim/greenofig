-- Fix messages table to match MessagingCenter component expectations

-- 1. Rename message_text to message
ALTER TABLE messages RENAME COLUMN message_text TO message;

-- 2. Add subject column
ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject TEXT;

-- 3. Add parent_message_id for threading support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE;

-- 4. Create index for parent_message_id
CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_message_id);

-- Note: The following columns already exist from the original migration:
-- - sender_id
-- - recipient_id
-- - is_read
-- - sender_role
-- - recipient_role
-- - created_at
-- - updated_at

-- RLS policies already exist and should work correctly with these changes
