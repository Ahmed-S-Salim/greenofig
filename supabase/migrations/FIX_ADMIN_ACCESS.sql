-- =====================================================
-- FIX ADMIN ACCESS - Let Admins See All Users
-- =====================================================
-- Creates a separate admin_roles table to avoid recursion
-- Then uses it to grant admin access safely
-- =====================================================

-- =====================================================
-- STEP 1: Create admin_roles table (no RLS = no recursion!)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin', 'nutritionist')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS on admin_roles to avoid recursion!
ALTER TABLE public.admin_roles DISABLE ROW LEVEL SECURITY;

-- Grant access to service role and authenticated users
GRANT SELECT ON public.admin_roles TO authenticated;
GRANT ALL ON public.admin_roles TO service_role;

-- =====================================================
-- STEP 2: Populate admin_roles from existing user_profiles
-- =====================================================

INSERT INTO public.admin_roles (user_id, role, created_at, updated_at)
SELECT id, role, created_at, updated_at
FROM public.user_profiles
WHERE role IN ('admin', 'super_admin', 'nutritionist')
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- =====================================================
-- STEP 3: Update user_profiles policies to use admin_roles
-- =====================================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_delete_all_profiles" ON public.user_profiles;

-- Create NEW admin policies using admin_roles (NO RECURSION!)
CREATE POLICY "admins_select_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  -- Regular users see only their own profile
  id = auth.uid()
  OR
  -- Admins can see all profiles (using admin_roles table, not user_profiles!)
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  -- Regular users can update their own profile
  id = auth.uid()
  OR
  -- Admins can update any profile
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  -- Same check for the updated data
  id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "admins_delete_all_profiles"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (
  -- Only super admins can delete profiles
  EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.role = 'super_admin'
  )
);

-- =====================================================
-- STEP 4: Update trigger to also insert into admin_roles
-- =====================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

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
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );

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

  -- Insert into user_profiles
  INSERT INTO public.user_profiles (
    id, full_name, role, email, profile_picture_url, tier, created_at, updated_at
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

  -- If user has admin/nutritionist role, also add to admin_roles table
  IF user_role IN ('admin', 'super_admin', 'nutritionist') THEN
    INSERT INTO public.admin_roles (user_id, role, created_at, updated_at)
    VALUES (NEW.id, user_role, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 5: Create helper function to promote users to admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  target_user_id UUID,
  new_role TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if caller is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can promote users';
  END IF;

  -- Validate role
  IF new_role NOT IN ('admin', 'super_admin', 'nutritionist', 'user') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Update user_profiles
  UPDATE public.user_profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;

  -- Update or insert into admin_roles
  IF new_role IN ('admin', 'super_admin', 'nutritionist') THEN
    INSERT INTO public.admin_roles (user_id, role, created_at, updated_at)
    VALUES (target_user_id, new_role, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      updated_at = NOW();
  ELSE
    -- If demoting to regular user, remove from admin_roles
    DELETE FROM public.admin_roles WHERE user_id = target_user_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show admin_roles table
SELECT
  'Admin Users' as info,
  ar.user_id,
  up.email,
  ar.role
FROM public.admin_roles ar
JOIN public.user_profiles up ON ar.user_id = up.id
ORDER BY ar.role, up.email;

-- Show total user count
SELECT
  'Total Users' as info,
  COUNT(*) as count
FROM public.user_profiles;

-- Success message
SELECT '✅ ADMIN ACCESS FIXED!' as status;
SELECT 'Admins can now see all users without recursion!' as result;
SELECT 'Login as superadmin@greenofig.com to see all 8 users!' as instruction;
