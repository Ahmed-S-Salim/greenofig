-- Create AI chat messages table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_user_id ON ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created_at ON ai_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_user_time ON ai_chat_messages(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own messages
CREATE POLICY "Users can view own chat messages" ON ai_chat_messages
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Policy: Users can insert their own messages
CREATE POLICY "Users can create own chat messages" ON ai_chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Admins can view all chat messages
CREATE POLICY "Admins can view all chat messages" ON ai_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can delete chat messages
CREATE POLICY "Admins can delete chat messages" ON ai_chat_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

COMMENT ON TABLE ai_chat_messages IS 'Stores AI coach chat conversations';
COMMENT ON COLUMN ai_chat_messages.sender IS 'Either user or ai';
COMMENT ON COLUMN ai_chat_messages.text IS 'The message content';
