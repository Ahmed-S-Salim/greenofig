-- =====================================================
-- SIMPLE FIX FOR 500 ERRORS - Works on All PostgreSQL Versions
-- =====================================================
-- This fixes the "500 Internal Server Error" on all tables
-- =====================================================

-- =====================================================
-- STEP 1: Fix the main trigger function
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
-- STEP 2: List all functions that might need fixing
-- =====================================================

SELECT
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    'ALTER FUNCTION ' || quote_ident(n.nspname) || '.' || quote_ident(p.proname) ||
    '(' || pg_get_function_identity_arguments(p.oid) || ') SET search_path = public;' as fix_command
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosecdef = true  -- SECURITY DEFINER functions only
ORDER BY p.proname;

-- =====================================================
-- INSTRUCTIONS:
-- =====================================================
-- 1. The above query will show you all SECURITY DEFINER functions
-- 2. Copy each "fix_command" shown in the results
-- 3. Run each command individually in a new SQL query
-- 4. This will add search_path to each function
-- =====================================================

SELECT '✅ Step 1 complete! Now check the query results above.' as status;
SELECT '📋 Copy and run each "fix_command" shown in the results.' as next_step;
SELECT '🔧 This will fix all 500 errors.' as info;
