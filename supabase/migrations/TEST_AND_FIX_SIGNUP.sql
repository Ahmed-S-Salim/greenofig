-- =====================================================
-- TEST AND FIX SIGNUP TRIGGER
-- =====================================================

-- Step 1: Check if trigger exists and is working
SELECT
    'Trigger Check' as test,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- Step 2: Check if function exists
SELECT
    'Function Check' as test,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- Step 3: Recreate the trigger properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
  -- Log that function is being called (for debugging)
  RAISE NOTICE 'handle_new_user triggered for user: %', NEW.email;

  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );

  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');

  IF NEW.email LIKE '%@greenofig.com' THEN
    IF NEW.email LIKE 'nutritionist@%' THEN
      user_role := 'nutritionist';
    ELSIF NEW.email LIKE 'admin@%' THEN
      user_role := 'admin';
    ELSIF NEW.email LIKE 'superadmin@%' THEN
      user_role := 'super_admin';
    END IF;
  END IF;

  -- Try to insert profile
  BEGIN
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

    RAISE NOTICE 'Profile created successfully for: %', NEW.email;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for %: %', NEW.email, SQLERRM;
    -- Don't fail the whole signup, just log the error
  END;

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Test that we can insert into user_profiles
DO $$
DECLARE
  test_id UUID := gen_random_uuid();
BEGIN
  -- Try to insert a test profile
  INSERT INTO public.user_profiles (
    id, full_name, role, email, tier, created_at, updated_at
  )
  VALUES (
    test_id,
    'Test User',
    'user',
    'test@example.com',
    'Base',
    NOW(),
    NOW()
  );

  -- Clean up test data
  DELETE FROM public.user_profiles WHERE id = test_id;

  RAISE NOTICE 'SUCCESS: Can insert into user_profiles!';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'FAILED: Cannot insert into user_profiles! Error: %', SQLERRM;
END $$;

-- Step 5: Show current policies
SELECT
    'Current Policies' as info,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

SELECT '✅ Trigger recreated! Try signing up with a new email now.' as status;
