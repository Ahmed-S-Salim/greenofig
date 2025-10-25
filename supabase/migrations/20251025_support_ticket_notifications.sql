-- Support Ticket Notifications System
-- Auto-creates conversations when users submit support tickets/feedback

-- Function to create conversation from support ticket
CREATE OR REPLACE FUNCTION create_conversation_from_ticket()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
  v_conversation_id UUID;
  v_ticket_message TEXT;
BEGIN
  -- Find an admin or super_admin to assign the ticket to
  SELECT id INTO v_admin_id
  FROM user_profiles
  WHERE role IN ('admin', 'super_admin')
  ORDER BY created_at ASC
  LIMIT 1;

  -- If no admin found, skip conversation creation
  IF v_admin_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Create ticket message text
  v_ticket_message := format(
    E'**Support Ticket #%s**\n\n**Subject:** %s\n\n**Category:** %s\n**Priority:** %s\n\n**Description:**\n%s',
    LEFT(NEW.id::TEXT, 8),
    NEW.subject,
    COALESCE(NEW.category, 'General'),
    UPPER(NEW.priority),
    NEW.description
  );

  -- Create conversation
  INSERT INTO conversations (user_id, nutritionist_id, subject, status)
  VALUES (NEW.user_id, v_admin_id, 'Support: ' || NEW.subject, 'active')
  RETURNING id INTO v_conversation_id;

  -- Create initial message
  INSERT INTO conversation_messages (
    conversation_id,
    sender_id,
    sender_role,
    message_text
  )
  VALUES (
    v_conversation_id,
    NEW.user_id,
    'user',
    v_ticket_message
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create conversation when ticket is created
DROP TRIGGER IF EXISTS on_ticket_created ON issues;

CREATE TRIGGER on_ticket_created
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_from_ticket();

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count unread messages for user
  SELECT COALESCE(SUM(unread_by_user), 0)::INTEGER INTO v_count
  FROM conversations
  WHERE user_id = p_user_id AND status = 'active';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for nutritionist/admin
CREATE OR REPLACE FUNCTION get_nutritionist_unread_count(p_nutritionist_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count unread messages for nutritionist
  SELECT COALESCE(SUM(unread_by_nutritionist), 0)::INTEGER INTO v_count
  FROM conversations
  WHERE nutritionist_id = p_nutritionist_id AND status = 'active';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Support ticket notification system created! ✅' as status;
SELECT 'Tickets will now auto-create conversations with admins' as info;
