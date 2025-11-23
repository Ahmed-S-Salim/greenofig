-- =====================================================
-- ADD USERNAME SUPPORT FOR PROFILE URLs (SAFE VERSION)
-- =====================================================
-- Allows users to have URLs like /@ahmedsalim instead of /app/user
-- =====================================================

-- Step 1: Add username column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Step 2: Create function to generate username from full_name
CREATE OR REPLACE FUNCTION generate_username(full_name_input TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert full name to username format: "Ahmed Salim" → "ahmedsalim"
  base_username := lower(regexp_replace(full_name_input, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_username := regexp_replace(base_username, '\s+', '', 'g');  -- Remove spaces
  base_username := regexp_replace(base_username, '-+', '-', 'g');
  base_username := trim(both '-' from base_username);

  -- If empty, use user_id substring
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'user' || substring(user_id::text, 1, 8);
  END IF;

  final_username := base_username;

  -- Check if username exists, if yes, add number
  WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter;
  END LOOP;

  RETURN final_username;
END;
$$;

-- Step 3: Generate usernames for existing users
UPDATE public.user_profiles
SET username = generate_username(full_name, id)
WHERE username IS NULL;

-- Step 4: Update trigger to auto-generate username on signup
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
  generated_username TEXT;
BEGIN
  RAISE NOTICE '====== TRIGGER STARTED for % ======', NEW.email;

  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );
  RAISE NOTICE 'Full name: %', user_full_name;

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
  RAISE NOTICE 'Role: %', user_role;

  -- Generate unique username
  generated_username := generate_username(user_full_name, NEW.id);
  RAISE NOTICE 'Generated username: %', generated_username;

  BEGIN
    RAISE NOTICE 'Attempting to insert profile...';

    INSERT INTO public.user_profiles (
      id, full_name, username, role, email, profile_picture_url, tier, created_at, updated_at
    )
    VALUES (
      NEW.id,
      user_full_name,
      generated_username,
      user_role::user_role,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
      'Base',
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Profile inserted successfully! ✅';

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'FAILED TO INSERT PROFILE! Error: % - Detail: %', SQLERRM, SQLSTATE;
    RAISE;
  END;

  RAISE NOTICE '====== TRIGGER COMPLETED ======';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- Step 6: Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "users_can_view_profiles_by_username" ON public.user_profiles;

CREATE POLICY "users_can_view_profiles_by_username"
ON public.user_profiles
FOR SELECT
TO authenticated, anon
USING (true);  -- Anyone can view profiles by username (public profiles)

SELECT '✅ Username support added! Users can now have URLs like /@ahmedsalim' as status;
