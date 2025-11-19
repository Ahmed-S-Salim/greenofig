-- Add messaging_disabled column to user_profiles table
-- This allows admins to control which users can send/receive messages

-- Add the column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS messaging_disabled BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_messaging_disabled
ON user_profiles(messaging_disabled);

-- Update existing users to have messaging enabled by default
UPDATE user_profiles
SET messaging_disabled = false
WHERE messaging_disabled IS NULL;

-- Verify the changes
SELECT id, full_name, email, role, messaging_disabled
FROM user_profiles
WHERE role = 'user'
ORDER BY full_name
LIMIT 10;
