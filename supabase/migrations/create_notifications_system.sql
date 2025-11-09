-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
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
        'system_alert'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: System can insert notifications for any user (for triggers)
CREATE POLICY "Service role can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Policy: Admins can see all notifications
CREATE POLICY "Admins can view all notifications"
    ON notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Create notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    blog_notifications BOOLEAN DEFAULT TRUE,
    user_activity_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'instant' CHECK (notification_frequency IN ('instant', 'hourly', 'daily')),
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own settings
CREATE POLICY "Users can manage own notification settings"
    ON notification_settings FOR ALL
    USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal',
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, action_url, priority, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_priority, p_metadata)
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE, read_at = NOW()
    WHERE user_id = auth.uid() AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = auth.uid() AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create notification settings for new users
CREATE OR REPLACE FUNCTION create_notification_settings_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_notification_settings
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_settings_for_new_user();

-- Trigger: Notify admins when new user registers
CREATE OR REPLACE FUNCTION notify_admins_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
    v_user_email TEXT;
BEGIN
    -- Get the new user's email
    SELECT email INTO v_user_email FROM auth.users WHERE id = NEW.id;

    -- Notify all admins
    FOR v_admin_id IN
        SELECT id FROM user_profiles WHERE role = 'admin'
    LOOP
        PERFORM create_notification(
            v_admin_id,
            'new_user',
            'New User Registered',
            'A new user has signed up: ' || COALESCE(v_user_email, 'Unknown'),
            '/app/admin?tab=users',
            'normal',
            jsonb_build_object('user_id', NEW.id, 'email', v_user_email)
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_user_notify_admins
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_user();

-- Trigger: Notify when blog post is generated
CREATE OR REPLACE FUNCTION notify_blog_generated()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    -- Only notify if AI generated
    IF NEW.ai_generated = TRUE THEN
        -- Notify all admins
        FOR v_admin_id IN
            SELECT id FROM user_profiles WHERE role = 'admin'
        LOOP
            PERFORM create_notification(
                v_admin_id,
                'blog_generated',
                'Blog Post Generated',
                'AI generated: "' || NEW.title || '"',
                '/app/admin?tab=blog',
                'normal',
                jsonb_build_object('post_id', NEW.id, 'title', NEW.title)
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_blog_post_generated
    AFTER INSERT ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION notify_blog_generated();

-- Trigger: Check queue status and notify when low/empty
CREATE OR REPLACE FUNCTION check_blog_queue_status()
RETURNS TRIGGER AS $$
DECLARE
    v_pending_count INTEGER;
    v_admin_id UUID;
BEGIN
    -- Count pending topics
    SELECT COUNT(*) INTO v_pending_count
    FROM blog_content_queue
    WHERE status = 'pending';

    -- Notify if queue is empty
    IF v_pending_count = 0 THEN
        FOR v_admin_id IN
            SELECT id FROM user_profiles WHERE role = 'admin'
        LOOP
            PERFORM create_notification(
                v_admin_id,
                'queue_empty',
                'Blog Queue Empty',
                'No topics left in the blog content queue. Add more topics to continue auto-generation.',
                '/app/admin?tab=blog',
                'urgent',
                jsonb_build_object('pending_count', 0)
            );
        END LOOP;
    -- Notify if queue is running low (2 or less)
    ELSIF v_pending_count <= 2 THEN
        FOR v_admin_id IN
            SELECT id FROM user_profiles WHERE role = 'admin'
        LOOP
            PERFORM create_notification(
                v_admin_id,
                'queue_low',
                'Blog Queue Running Low',
                'Only ' || v_pending_count || ' topic(s) left in the queue. Consider adding more topics.',
                '/app/admin?tab=blog',
                'high',
                jsonb_build_object('pending_count', v_pending_count)
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_blog_queue_status_change
    AFTER UPDATE OF status ON blog_content_queue
    FOR EACH ROW
    WHEN (OLD.status = 'pending' AND NEW.status != 'pending')
    EXECUTE FUNCTION check_blog_queue_status();

COMMENT ON TABLE notifications IS 'Stores all system notifications for users';
COMMENT ON TABLE notification_settings IS 'User preferences for notification delivery';
