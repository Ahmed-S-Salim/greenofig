-- Performance Indexes Migration
-- Created: 2025-12-07
-- Purpose: Add database indexes to optimize common queries and reduce response times
--
-- INSTRUCTIONS: Run this entire file in Supabase SQL Editor.
-- Each section is wrapped in exception handling so errors won't stop execution.

-- =====================================================
-- 1. USER PROFILES INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_user_profiles_role: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_user_profiles_role_tier ON user_profiles(role, subscription_tier);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_user_profiles_role_tier: %', SQLERRM;
END $$;

-- =====================================================
-- 2. MESSAGES TABLE INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_messages_recipient_id: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_messages_sender_id: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = false;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_messages_unread: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_messages_conversation: %', SQLERRM;
END $$;

-- =====================================================
-- 3. CLIENT PROGRESS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_client_progress_client_date ON client_progress(client_id, date DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_client_progress_client_date: %', SQLERRM;
END $$;

-- =====================================================
-- 4. APPOINTMENTS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date, appointment_time);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_appointments_date: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, appointment_date DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_appointments_client: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist ON appointments(nutritionist_id, appointment_date DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_appointments_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status, appointment_date);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_appointments_status: %', SQLERRM;
END $$;

-- =====================================================
-- 5. NOTIFICATIONS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_notifications_user_created: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_notifications_unread: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_notifications_type: %', SQLERRM;
END $$;

-- =====================================================
-- 6. MEAL PLANS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_meal_plans_client ON meal_plans(client_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_meal_plans_client: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist ON meal_plans(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_meal_plans_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON meal_plans(is_active, start_date, end_date) WHERE is_active = true;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_meal_plans_active: %', SQLERRM;
END $$;

-- Also try meal_plans_v2 table
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_meal_plans_v2_client ON meal_plans_v2(client_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_meal_plans_v2_client: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_meal_plans_v2_nutritionist ON meal_plans_v2(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_meal_plans_v2_nutritionist: %', SQLERRM;
END $$;

-- =====================================================
-- 7. CLIENT GOALS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_client_goals_active ON client_goals(client_id, status) WHERE status = 'active';
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_client_goals_active: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_client_goals_progress ON client_goals(client_id, target_date);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_client_goals_progress: %', SQLERRM;
END $$;

-- =====================================================
-- 8. BLOG POSTS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC) WHERE is_published = true;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_blog_posts_published: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_blog_posts_author: %', SQLERRM;
END $$;

-- Full text search index (more complex, may fail on some setups)
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '')));
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_blog_posts_search: %', SQLERRM;
END $$;

-- =====================================================
-- 9. CLIENT INTAKE FORMS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_intake_forms_nutritionist ON client_intake_forms(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_intake_forms_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_intake_forms_client ON client_intake_forms(client_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_intake_forms_client: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_intake_forms_status ON client_intake_forms(status, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_intake_forms_status: %', SQLERRM;
END $$;

-- =====================================================
-- 10. FORM LINKS / FORM ASSIGNMENTS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_form_links_code ON form_links(link_code) WHERE is_active = true;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_form_links_code: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_form_links_nutritionist ON form_links(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_form_links_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_form_assignments_nutritionist ON form_assignments(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_form_assignments_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_form_assignments_client ON form_assignments(client_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_form_assignments_client: %', SQLERRM;
END $$;

-- =====================================================
-- 11. PUSH SUBSCRIPTIONS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_push_subscriptions_user: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(user_id, is_active) WHERE is_active = true;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_push_subscriptions_active: %', SQLERRM;
END $$;

-- =====================================================
-- 12. VIDEO CALL ROOMS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_video_rooms_active ON video_call_rooms(status, created_at DESC) WHERE status = 'active';
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_video_rooms_active: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_video_rooms_host ON video_call_rooms(host_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_video_rooms_host: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_video_rooms_participant ON video_call_rooms(participant_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_video_rooms_participant: %', SQLERRM;
END $$;

-- =====================================================
-- 13. FOLLOW-UP REMINDERS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_reminders_due ON follow_up_reminders(reminder_date, reminder_time) WHERE status = 'pending';
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_reminders_due: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_reminders_nutritionist ON follow_up_reminders(nutritionist_id, reminder_date);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_reminders_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_reminders_client ON follow_up_reminders(client_id, reminder_date);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_reminders_client: %', SQLERRM;
END $$;

-- =====================================================
-- 14. CONVERSATIONS INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, last_message_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_conversations_user: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_conversations_nutritionist ON conversations(nutritionist_id, last_message_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_conversations_nutritionist: %', SQLERRM;
END $$;

-- =====================================================
-- 15. RECIPES INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_recipes_nutritionist ON recipes(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_recipes_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public, created_at DESC) WHERE is_public = true;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_recipes_public: %', SQLERRM;
END $$;

-- =====================================================
-- 16. EDUCATIONAL RESOURCES INDEXES
-- =====================================================
DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_resources_nutritionist ON educational_resources(nutritionist_id, created_at DESC);
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_resources_nutritionist: %', SQLERRM;
END $$;

DO $$ BEGIN
  CREATE INDEX IF NOT EXISTS idx_resources_public ON educational_resources(is_public, created_at DESC) WHERE is_public = true;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'idx_resources_public: %', SQLERRM;
END $$;

-- =====================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- =====================================================
DO $$ BEGIN ANALYZE user_profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE messages; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE client_progress; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE appointments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE notifications; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE meal_plans; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE meal_plans_v2; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE client_goals; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE blog_posts; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE client_intake_forms; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE form_links; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE form_assignments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE push_subscriptions; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE video_call_rooms; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE follow_up_reminders; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE conversations; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE recipes; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ANALYZE educational_resources; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- DONE! Check messages above for any errors.
-- =====================================================
SELECT 'Performance indexes migration completed! Check NOTICE messages for any skipped indexes.' as status;
