-- =====================================================
-- DIAGNOSTIC SCRIPT - Run this to see what's wrong
-- =====================================================

-- Check if user_profiles table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name = 'user_profiles'
) as table_exists;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- Count users in auth.users
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Count profiles in user_profiles
SELECT COUNT(*) as total_profiles FROM public.user_profiles;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
