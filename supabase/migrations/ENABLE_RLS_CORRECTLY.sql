-- =====================================================
-- RE-ENABLE RLS WITH CORRECT POLICIES
-- =====================================================
-- Run this AFTER confirming login works with RLS disabled
-- =====================================================

-- =====================================================
-- PART 1: Fix user_profiles table
-- =====================================================

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "service_role_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;

-- Create CORRECT policies

-- 1. Service role needs full access (for triggers and backend operations)
CREATE POLICY "service_role_all_access"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Users can SELECT their own profile
CREATE POLICY "users_select_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 3. Users can INSERT their own profile (needed for signup)
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Users can UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Admins can SELECT all profiles
CREATE POLICY "admins_select_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('admin', 'super_admin')
  )
);

-- 6. Admins can UPDATE all profiles
CREATE POLICY "admins_update_all_profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.role IN ('admin', 'super_admin')
  )
);

-- =====================================================
-- PART 2: Fix other tables with proper policies
-- =====================================================

-- ad_campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ad_campaigns;
CREATE POLICY "Anyone can view active ads"
ON public.ad_campaigns
FOR SELECT
TO authenticated, anon
USING (is_active = true AND status = 'active');

DROP POLICY IF EXISTS "Service role all access" ON public.ad_campaigns;
CREATE POLICY "Service role all access"
ON public.ad_campaigns
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role all access subs" ON public.user_subscriptions;
CREATE POLICY "Service role all access subs"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view plans"
ON public.subscription_plans
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Service role all access plans" ON public.subscription_plans;
CREATE POLICY "Service role all access plans"
ON public.subscription_plans
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ad_placements
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view placements" ON public.ad_placements;
CREATE POLICY "Anyone can view placements"
ON public.ad_placements
FOR SELECT
TO authenticated, anon
USING (true);

DROP POLICY IF EXISTS "Service role all access placements" ON public.ad_placements;
CREATE POLICY "Service role all access placements"
ON public.ad_placements
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ai_chat_messages
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_chat_messages;
CREATE POLICY "Users can view own messages"
ON public.ai_chat_messages
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_chat_messages;
CREATE POLICY "Users can insert own messages"
ON public.ai_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role all access messages" ON public.ai_chat_messages;
CREATE POLICY "Service role all access messages"
ON public.ai_chat_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 3: Recreate signup trigger with search_path
-- =====================================================

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
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1)
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

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 4: Grant necessary permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

GRANT SELECT ON public.ad_campaigns TO authenticated;
GRANT SELECT ON public.ad_campaigns TO anon;

GRANT SELECT ON public.user_subscriptions TO authenticated;

GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT ON public.subscription_plans TO anon;

GRANT SELECT ON public.ad_placements TO authenticated;
GRANT SELECT ON public.ad_placements TO anon;

GRANT SELECT, INSERT ON public.ai_chat_messages TO authenticated;

-- =====================================================
-- SUCCESS - SECURITY IS NOW ENABLED PROPERLY!
-- =====================================================

SELECT '✅ RLS RE-ENABLED WITH CORRECT POLICIES' as status;
SELECT 'Login and Signup should work securely!' as result;
SELECT 'Try logging in now!' as instruction;
