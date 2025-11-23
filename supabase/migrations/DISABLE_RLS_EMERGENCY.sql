-- =====================================================
-- EMERGENCY FIX - DISABLE RLS TEMPORARILY
-- =====================================================
-- WARNING: This removes all security temporarily!
-- Use ONLY for testing, then run SIMPLE_SIGNUP_FIX.sql
-- =====================================================

-- Disable RLS on user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- This allows all users to access user_profiles without restrictions
-- REMEMBER: This is insecure! Enable RLS again after testing!

SELECT 'RLS DISABLED - Login should work now. ENABLE IT AGAIN AFTER TESTING!' as status;
