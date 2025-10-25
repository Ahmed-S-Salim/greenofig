-- Fix Google OAuth User Profile Creation
-- This ensures Google sign-in users get proper profiles created

-- Drop and recreate the trigger function with better Google OAuth support
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
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_full_name,
    user_role,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually fix existing OAuth users without profiles
CREATE OR REPLACE FUNCTION public.fix_missing_user_profiles()
RETURNS TABLE(user_id UUID, email TEXT, created BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  WITH missing_profiles AS (
    SELECT
      au.id,
      au.email,
      COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        SPLIT_PART(au.email, '@', 1)
      ) as full_name,
      COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture'
      ) as picture
    FROM auth.users au
    LEFT JOIN user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  )
  INSERT INTO user_profiles (id, full_name, email, role, profile_picture_url, created_at, updated_at)
  SELECT
    id,
    full_name,
    email,
    'user' as role,
    picture,
    NOW(),
    NOW()
  FROM missing_profiles
  RETURNING id, email, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix for existing users
SELECT * FROM public.fix_missing_user_profiles();

-- Success message
SELECT 'Google OAuth profile creation fixed! ✅' as status;
