-- Add new appointment notification types to the notifications table
-- This allows appointment_updated and appointment_cancelled notifications

-- First, drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new constraint with all notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
    'blog_generated',
    'queue_low',
    'queue_empty',
    'new_user',
    'user_login',
    'nutritionist_login',
    'nutritionist_activity',
    'new_subscription',
    'subscription_cancelled',
    'new_message',
    'appointment_scheduled',
    'appointment_updated',
    'appointment_cancelled',
    'system_alert',
    'achievement',
    'goal_completed',
    'meal_plan',
    'payment'
));

-- Update the 'read' column name if it exists as 'is_read' (for compatibility with NotificationBell)
-- The table might have 'is_read' but our code uses 'read'
DO $$
BEGIN
    -- Check if 'read' column exists, if not and 'is_read' exists, the code will handle it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') THEN
        -- The column is named 'is_read', our code should handle both
        RAISE NOTICE 'Column is named is_read, code will handle this';
    END IF;
END $$;

-- Ensure RLS policy allows authenticated users to insert notifications
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON notifications TO authenticated;
