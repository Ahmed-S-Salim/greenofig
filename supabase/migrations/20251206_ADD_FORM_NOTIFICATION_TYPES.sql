-- Add new notification types for form assignments and other features
-- This removes the restrictive CHECK constraint and allows any type

-- Drop the existing CHECK constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add a more flexible constraint that allows additional types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
    -- Original types
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
    'system_alert',
    -- New types for forms
    'form_assigned',
    'form_submitted',
    'form_approved',
    'edit_request_response',
    -- Video call types
    'incoming_call',
    'missed_call',
    'completed_call',
    'call_ended',
    -- Other types
    'meal_plan_assigned',
    'achievement_unlocked',
    'goal_progress',
    'reminder',
    'payment_received',
    'subscription_expiring'
));

-- Also update RLS policy to allow authenticated users to insert their own notifications
-- (nutritionists creating notifications for their clients)
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;

CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow nutritionists and admins to insert notifications for any user
CREATE POLICY "Nutritionists can insert notifications for clients"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('nutritionist', 'admin', 'super_admin')
        )
        OR user_id = auth.uid()
    );
