-- Add messaging_disabled column to user_profiles table
-- This allows admins to disable messaging for specific customers

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS messaging_disabled BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_messaging_disabled
ON user_profiles(messaging_disabled)
WHERE messaging_disabled = TRUE;

-- Add comment
COMMENT ON COLUMN user_profiles.messaging_disabled IS 'When true, the user cannot send or receive messages';
