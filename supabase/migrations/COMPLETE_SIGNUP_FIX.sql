-- =====================================================
-- COMPLETE SIGNUP FIX - Make Signup Work 100%
-- =====================================================

-- =====================================================
-- STEP 1: Check what's blocking the trigger
-- =====================================================

-- First, let's see if the trigger even exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
    AND event_object_table = 'users'
    AND event_object_schema = 'auth'
  ) THEN
    RAISE NOTICE 'Trigger EXISTS ✅';
  ELSE
    RAISE WARNING 'Trigger MISSING ❌';
  END IF;
END $$;

-- Check if function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE 'Function EXISTS ✅';
  ELSE
    RAISE WARNING 'Function MISSING ❌';
  END IF;
END $$;

-- =====================================================
-- STEP 2: Drop and recreate EVERYTHING cleanly
-- =====================================================

-- Drop trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate function with VERBOSE logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  -- Log start
  RAISE NOTICE '====== TRIGGER STARTED for % ======', NEW.email;

  -- Get user data
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );
  RAISE NOTICE 'Full name: %', user_full_name;

  -- Get role
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  -- Check for @greenofig.com
  IF NEW.email LIKE '%@greenofig.com' THEN
    IF NEW.email LIKE 'nutritionist@%' THEN
      user_role := 'nutritionist';
    ELSIF NEW.email LIKE 'admin@%' THEN
      user_role := 'admin';
    ELSIF NEW.email LIKE 'superadmin@%' THEN
      user_role := 'super_admin';
    END IF;
  END IF;
  RAISE NOTICE 'Role: %', user_role;

  -- Try to insert profile
  BEGIN
    RAISE NOTICE 'Attempting to insert profile...';

    INSERT INTO public.user_profiles (
      id,
      full_name,
      role,
      email,
      profile_picture_url,
      tier,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      user_full_name,
      user_role,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture'
      ),
      'Base',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Profile inserted successfully! ✅';

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'FAILED TO INSERT PROFILE! Error: % - Detail: %', SQLERRM, SQLSTATE;
    -- Re-raise the error so we can see it in logs
    RAISE;
  END;

  -- If admin/nutritionist, add to admin_roles
  IF user_role IN ('admin', 'super_admin', 'nutritionist') THEN
    BEGIN
      INSERT INTO public.admin_roles (user_id, role, created_at, updated_at)
      VALUES (NEW.id, user_role, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();
      RAISE NOTICE 'Added to admin_roles ✅';
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to add to admin_roles: %', SQLERRM;
      -- Don't fail the whole signup for this
    END;
  END IF;

  RAISE NOTICE '====== TRIGGER COMPLETED ======';
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 3: Grant ALL necessary permissions
-- =====================================================

-- Grant schema access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- Grant to service role (for triggers)
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.admin_roles TO service_role;

-- =====================================================
-- STEP 4: Make sure RLS policies are correct
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all policies first
DROP POLICY IF EXISTS "service_role_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_delete_all_profiles" ON public.user_profiles;

-- Service role bypass (CRITICAL for triggers!)
CREATE POLICY "service_role_all_access"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can SELECT their own profile
CREATE POLICY "users_select_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role IN ('admin', 'super_admin')
  )
);

-- Users can INSERT their own profile (needed for signup)
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Users can UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role IN ('admin', 'super_admin')
  )
);

-- Only super admins can delete
CREATE POLICY "admins_delete_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role = 'super_admin'
  )
);

-- =====================================================
-- STEP 5: Test the trigger manually
-- =====================================================

DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  RAISE NOTICE 'Testing manual insert with UUID: %', test_user_id;

  -- Try to insert directly (simulating what trigger does)
  INSERT INTO public.user_profiles (
    id, full_name, role, email, tier, created_at, updated_at
  )
  VALUES (
    test_user_id,
    'Test User Manual',
    'user',
    'test-manual@example.com',
    'Base',
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Manual insert SUCCESS! ✅';

  -- Clean up
  DELETE FROM public.user_profiles WHERE id = test_user_id;
  RAISE NOTICE 'Test data cleaned up';

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Manual insert FAILED! Error: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
  'Trigger' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as status;

SELECT
  'Function' as component,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN 'EXISTS ✅' ELSE 'MISSING ❌' END as status;

SELECT
  'RLS on user_profiles' as component,
  CASE WHEN rowsecurity THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END as status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Final message
SELECT '✅ SETUP COMPLETE!' as status;
SELECT 'Now try to signup with a NEW email address' as instruction;
SELECT 'Check Supabase Logs > Postgres Logs to see trigger messages' as tip;
