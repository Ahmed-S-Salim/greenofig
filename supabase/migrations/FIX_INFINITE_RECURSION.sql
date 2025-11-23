-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =====================================================
-- The admin policies were causing infinite recursion
-- This fixes it by removing the recursive check
-- =====================================================

-- =====================================================
-- PART 1: Fix user_profiles table (NO RECURSION)
-- =====================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DROP POLICY IF EXISTS "service_role_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_delete_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;

-- Create SIMPLE policies WITHOUT recursion

-- 1. Service role - full access
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
USING (id = auth.uid());

-- 3. Users can INSERT their own profile
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 4. Users can UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 5. Users can DELETE their own profile
CREATE POLICY "users_delete_own_profile"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- =====================================================
-- PART 2: Fix other tables
-- =====================================================

-- ad_campaigns
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.ad_campaigns;
DROP POLICY IF EXISTS "Service role all access" ON public.ad_campaigns;

CREATE POLICY "Anyone can view active ads"
ON public.ad_campaigns
FOR SELECT
TO authenticated, anon
USING (is_active = true AND status = 'active');

CREATE POLICY "Service role all access"
ON public.ad_campaigns
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role all access subs" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role all access subs"
ON public.user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Service role all access plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view plans"
ON public.subscription_plans
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Service role all access plans"
ON public.subscription_plans
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ad_placements
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view placements" ON public.ad_placements;
DROP POLICY IF EXISTS "Service role all access placements" ON public.ad_placements;

CREATE POLICY "Anyone can view placements"
ON public.ad_placements
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Service role all access placements"
ON public.ad_placements
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ai_chat_messages
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_chat_messages;
DROP POLICY IF EXISTS "Service role all access messages" ON public.ai_chat_messages;

CREATE POLICY "Users can view own messages"
ON public.ai_chat_messages
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
ON public.ai_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role all access messages"
ON public.ai_chat_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- PART 3: Recreate signup trigger
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
-- PART 4: Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
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
-- SUCCESS - NO MORE INFINITE RECURSION!
-- =====================================================

SELECT '✅ FIXED! No more infinite recursion!' as status;
SELECT 'Login should work now!' as result;
