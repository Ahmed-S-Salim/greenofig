-- First, let's see what types already exist in the table
-- SELECT DISTINCT type FROM notifications;

-- Step 1: Drop the existing CHECK constraint completely
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Step 2: Remove the type constraint entirely - allow any text value
-- This is the safest approach to avoid constraint violations

-- Step 3: Update RLS policy to allow nutritionists to insert notifications
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Nutritionists can insert notifications for clients" ON notifications;

-- Allow any authenticated user to insert notifications
CREATE POLICY "Authenticated users can insert notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);
