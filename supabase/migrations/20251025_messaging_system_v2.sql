-- Messaging System V2 for User-Nutritionist-Admin Communication
-- This version renames tables to avoid conflicts with existing messaging

-- Drop existing conversation-based tables if they exist from previous attempts
DROP TABLE IF EXISTS message_notifications CASCADE;
DROP TABLE IF EXISTS new_messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Conversations Table (tracks 1-on-1 conversations)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Metadata
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, archived, closed

  -- Last message tracking
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,

  -- Unread counts
  unread_by_user INTEGER DEFAULT 0,
  unread_by_nutritionist INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure user and nutritionist are different
  CHECK (user_id != nutritionist_id)
);

-- New Messages Table (conversation-based)
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Sender info
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  sender_role VARCHAR(50) NOT NULL, -- user, nutritionist, admin

  -- Message content
  message_text TEXT NOT NULL,

  -- Attachments
  attachments JSONB, -- [{name, url, type, size}, ...]

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Editing
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Notifications Table
CREATE TABLE conversation_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  message_id UUID REFERENCES conversation_messages(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Notification details
  notification_type VARCHAR(50) DEFAULT 'new_message',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_nutritionist ON conversations(nutritionist_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender ON conversation_messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_notifications_user ON conversation_notifications(user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Nutritionists can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Participants can send messages" ON conversation_messages;
DROP POLICY IF EXISTS "Senders can edit their messages" ON conversation_messages;
DROP POLICY IF EXISTS "Users can view their notifications" ON conversation_notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON conversation_notifications;

-- RLS Policies for Conversations

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = user_id OR auth.uid() = nutritionist_id
  );

-- Nutritionists and admins can view all conversations they're part of
CREATE POLICY "Nutritionists can view their conversations" ON conversations
  FOR SELECT USING (
    auth.uid() = nutritionist_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('nutritionist', 'admin', 'super_admin')
    )
  );

-- Users can create conversations with nutritionists
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Participants can update conversation metadata
CREATE POLICY "Participants can update conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() = user_id OR auth.uid() = nutritionist_id
  );

-- RLS Policies for Messages

-- Participants can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_messages.conversation_id
      AND (user_id = auth.uid() OR nutritionist_id = auth.uid())
    )
  );

-- Participants can send messages
CREATE POLICY "Participants can send messages" ON conversation_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_messages.conversation_id
      AND (user_id = auth.uid() OR nutritionist_id = auth.uid())
    )
  );

-- Senders can edit their own messages
CREATE POLICY "Senders can edit their messages" ON conversation_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for Message Notifications

CREATE POLICY "Users can view their notifications" ON conversation_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON conversation_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Triggers

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation metadata when message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_nutritionist_id UUID;
BEGIN
  -- Get conversation participants
  SELECT user_id, nutritionist_id INTO v_user_id, v_nutritionist_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Update conversation
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.message_text, 100),
    unread_by_user = CASE
      WHEN NEW.sender_id = v_user_id THEN unread_by_user
      ELSE unread_by_user + 1
    END,
    unread_by_nutritionist = CASE
      WHEN NEW.sender_id = v_nutritionist_id THEN unread_by_nutritionist
      ELSE unread_by_nutritionist + 1
    END
  WHERE id = NEW.conversation_id;

  -- Create notification for recipient
  IF NEW.sender_id = v_user_id THEN
    -- User sent message, notify nutritionist
    INSERT INTO conversation_notifications (user_id, message_id, conversation_id, notification_type)
    VALUES (v_nutritionist_id, NEW.id, NEW.conversation_id, 'new_message');
  ELSE
    -- Nutritionist sent message, notify user
    INSERT INTO conversation_notifications (user_id, message_id, conversation_id, notification_type)
    VALUES (v_user_id, NEW.id, NEW.conversation_id, 'new_message');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_created ON conversation_messages;

CREATE TRIGGER on_message_created
  AFTER INSERT ON conversation_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_nutritionist_id UUID;
BEGIN
  -- Get conversation participants
  SELECT user_id, nutritionist_id INTO v_user_id, v_nutritionist_id
  FROM conversations
  WHERE id = p_conversation_id;

  -- Mark messages as read
  UPDATE conversation_messages
  SET is_read = true, read_at = NOW()
  WHERE conversation_id = p_conversation_id
  AND sender_id != p_user_id
  AND is_read = false;

  -- Update unread count
  IF p_user_id = v_user_id THEN
    UPDATE conversations
    SET unread_by_user = 0
    WHERE id = p_conversation_id;
  ELSIF p_user_id = v_nutritionist_id THEN
    UPDATE conversations
    SET unread_by_nutritionist = 0
    WHERE id = p_conversation_id;
  END IF;

  -- Mark notifications as read
  UPDATE conversation_notifications
  SET is_read = true, read_at = NOW()
  WHERE conversation_id = p_conversation_id
  AND user_id = p_user_id
  AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Messaging system V2 created successfully! ✅' as status;
SELECT 'Note: Your existing messages table was kept. This creates a new conversation-based system.' as info;
SELECT 'Tables created: conversations, conversation_messages, conversation_notifications' as tables;
