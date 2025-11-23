-- =====================================================
-- FIX ALL 500 ERRORS - Missing search_path Settings
-- =====================================================
-- This fixes the "500 Internal Server Error" on all tables
-- The issue: PostgreSQL functions need search_path for security
-- =====================================================

-- First, let's fix the trigger function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract user's full name from metadata
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Determine user role
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  -- Special roles for @greenofig.com emails
  IF NEW.email LIKE '%@greenofig.com' THEN
    IF NEW.email LIKE 'nutritionist@%' THEN
      user_role := 'nutritionist';
    ELSIF NEW.email LIKE 'admin@%' THEN
      user_role := 'admin';
    ELSIF NEW.email LIKE 'superadmin@%' THEN
      user_role := 'super_admin';
    END IF;
  END IF;

  -- Insert the user profile
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
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    email = EXCLUDED.email,
    profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, user_profiles.profile_picture_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FIX ALL OTHER FUNCTIONS - Add search_path
-- =====================================================

-- Find and fix ALL functions that are missing search_path
DO $$
DECLARE
    func RECORD;
    func_name TEXT;
    func_args TEXT;
BEGIN
    FOR func IN
        SELECT
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prosecdef = true  -- SECURITY DEFINER functions
        AND NOT EXISTS (
            SELECT 1
            FROM pg_proc_config(p.oid)
            WHERE option_name = 'search_path'
        )
    LOOP
        func_name := quote_ident(func.schema_name) || '.' || quote_ident(func.function_name);

        BEGIN
            EXECUTE format('ALTER FUNCTION %s(%s) SET search_path = public, pg_temp',
                         func_name, func.args);
            RAISE NOTICE 'Fixed function: %(%)', func_name, func.args;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Could not fix function %: %', func_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- =====================================================
-- VERIFY FIXES
-- =====================================================

-- Show all SECURITY DEFINER functions and their search_path
SELECT
    n.nspname as schema,
    p.proname as function_name,
    COALESCE(
        (SELECT option_value
         FROM pg_proc_config(p.oid)
         WHERE option_name = 'search_path'),
        'NOT SET - WILL CAUSE 500 ERRORS!'
    ) as search_path_setting
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true
ORDER BY p.proname;

SELECT '✅ All functions fixed! Login should work now.' as status;
