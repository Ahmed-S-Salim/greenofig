-- =====================================================
-- ABSOLUTE FIX - Run this EXACTLY as shown
-- =====================================================

-- Step 1: Drop messages table completely
DROP TABLE IF EXISTS public.messages CASCADE;

-- Step 2: Check if user_profiles exists and has id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'user_profiles table does not exist!';
  END IF;
END $$;

-- Step 3: Create messages table with foreign keys to user_profiles
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add foreign keys with EXACT names
ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES public.user_profiles(id)
  ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_recipient_id_fkey
  FOREIGN KEY (recipient_id)
  REFERENCES public.user_profiles(id)
  ON DELETE CASCADE;

-- Step 5: Create indexes
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON public.messages(is_read) WHERE is_read = FALSE;

-- Step 6: Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their sent messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Step 8: Grant permissions
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

-- Step 9: Verify foreign keys were created
SELECT
  conname as constraint_name,
  contype as type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.messages'::regclass
  AND contype = 'f';

-- Step 10: Success message
SELECT
  '✅ SUCCESS! Messages table created with proper foreign keys!' as status,
  COUNT(*) FILTER (WHERE conname = 'messages_sender_id_fkey') as sender_fkey_exists,
  COUNT(*) FILTER (WHERE conname = 'messages_recipient_id_fkey') as recipient_fkey_exists
FROM pg_constraint
WHERE conrelid = 'public.messages'::regclass;
