-- Fix Signup - Ensure trigger to create user profiles exists

-- First, check if user_profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
        RAISE EXCEPTION 'user_profiles table does not exist. Please create it first.';
    END IF;
END $$;

-- Create or replace the function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract full_name from Google OAuth or regular signup
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',      -- From regular signup
    NEW.raw_user_meta_data->>'name',           -- From Google OAuth
    SPLIT_PART(NEW.email, '@', 1)              -- Fallback to email username
  );

  -- Determine role based on email
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

  -- Insert or update the user profile
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
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    'Base',  -- Default tier for new users
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    email = EXCLUDED.email,
    profile_picture_url = COALESCE(EXCLUDED.profile_picture_url, user_profiles.profile_picture_url),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the trigger was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '✅ Trigger on_auth_user_created successfully created!';
    ELSE
        RAISE WARNING '❌ Trigger creation may have failed';
    END IF;
END $$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user_profiles record when a new auth user is created';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Triggers user profile creation for new signups';
