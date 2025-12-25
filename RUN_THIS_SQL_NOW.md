# 🚨 FIX THE "Failed to load conversations" ERROR NOW

## Quick 2-Minute Fix

The deployment is LIVE but the database table is missing. Here's how to fix it:

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/xdzoikocriuvgkoenjqk
2. Click on **SQL Editor** in the left sidebar

### Step 2: Copy This SQL

Open the file: `supabase/migrations/20251124_CREATE_MESSAGES_TABLE.sql`

Or copy this SQL directly:

```sql
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
```

### Step 3: Run It
1. Paste the SQL into the SQL Editor
2. Click **RUN** (or press Ctrl+Enter)
3. You should see: "Success. No rows returned"

### Step 4: Verify
1. Go to: https://greenofig.com/app/nutritionist?tab=messages
2. The error "Failed to load conversations" should be GONE!
3. The messages tab should now work properly

---

## Why This Happened

The code was deployed but the database schema wasn't updated. The messages component tries to query the `messages` table which doesn't exist yet, causing the error.

Once you run this SQL, everything will work perfectly!
