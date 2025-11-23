-- =====================================================
-- SIMPLE SIGNUP FIX - Run this in Supabase SQL Editor
-- =====================================================
-- This fixes ONLY the signup/login issue without touching other tables
-- =====================================================

-- =====================================================
-- STEP 1: Enable RLS on user_profiles
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop existing policies and recreate them
-- =====================================================
DROP POLICY IF EXISTS "Service role has full access" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Allow service role (for triggers) to do everything
CREATE POLICY "Service role has full access"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (needed for signup)
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'super_admin')
  )
);

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- STEP 3: Create the signup trigger function
-- =====================================================
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
  -- Get the user's name
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Get the role (default to 'user')
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

  -- Create the user profile
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

-- =====================================================
-- STEP 4: Drop existing trigger and create new one
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- DONE! Users can now sign up and login successfully
-- =====================================================
