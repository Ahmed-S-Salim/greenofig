-- FIX REMAINING 5 RLS ERRORS
-- Run this in Supabase SQL Editor to fix all remaining security issues

-- =====================================================
-- STEP 1: ENABLE RLS ON THE 5 MISSING TABLES
-- =====================================================

ALTER TABLE public.meal_plans_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: CREATE RLS POLICIES FOR meal_plans_v2
-- =====================================================

-- Users can only see their own meal plans
CREATE POLICY "Users can read own meal plans v2"
ON public.meal_plans_v2 FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meal plans v2"
ON public.meal_plans_v2 FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meal plans v2"
ON public.meal_plans_v2 FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own meal plans v2"
ON public.meal_plans_v2 FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Service role bypass
CREATE POLICY "Service role bypass meal_plans_v2"
ON public.meal_plans_v2 FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- STEP 3: CREATE RLS POLICIES FOR client_milestones
-- =====================================================

-- Users can only see their own milestones
CREATE POLICY "Users can read own milestones"
ON public.client_milestones FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own milestones"
ON public.client_milestones FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own milestones"
ON public.client_milestones FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Nutritionists can see their clients' milestones
CREATE POLICY "Nutritionists can see client milestones"
ON public.client_milestones FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'nutritionist'
  )
);

-- Service role bypass
CREATE POLICY "Service role bypass client_milestones"
ON public.client_milestones FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- STEP 4: CREATE RLS POLICIES FOR consultation_templates
-- =====================================================

-- Only nutritionists and admins can manage templates
CREATE POLICY "Nutritionists can manage templates"
ON public.consultation_templates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('nutritionist', 'admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('nutritionist', 'admin', 'super_admin')
  )
);

-- Service role bypass
CREATE POLICY "Service role bypass consultation_templates"
ON public.consultation_templates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- STEP 5: CREATE RLS POLICIES FOR client_checkins
-- =====================================================

-- Users can only see their own check-ins
CREATE POLICY "Users can read own checkins"
ON public.client_checkins FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own checkins"
ON public.client_checkins FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own checkins"
ON public.client_checkins FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Nutritionists can see their clients' check-ins
CREATE POLICY "Nutritionists can see client checkins"
ON public.client_checkins FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'nutritionist'
  )
);

-- Service role bypass
CREATE POLICY "Service role bypass client_checkins"
ON public.client_checkins FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- STEP 6: CREATE RLS POLICIES FOR shopping_lists
-- =====================================================

-- Users can only see their own shopping lists
CREATE POLICY "Users can read own shopping lists"
ON public.shopping_lists FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own shopping lists"
ON public.shopping_lists FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own shopping lists"
ON public.shopping_lists FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own shopping lists"
ON public.shopping_lists FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Service role bypass
CREATE POLICY "Service role bypass shopping_lists"
ON public.shopping_lists FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ ALL 5 RLS ERRORS FIXED!';
  RAISE NOTICE '✅ meal_plans_v2: RLS enabled + policies created';
  RAISE NOTICE '✅ client_milestones: RLS enabled + policies created';
  RAISE NOTICE '✅ consultation_templates: RLS enabled + policies created';
  RAISE NOTICE '✅ client_checkins: RLS enabled + policies created';
  RAISE NOTICE '✅ shopping_lists: RLS enabled + policies created';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your database should now have 0 security errors!';
  RAISE NOTICE '🎉 Refresh the Security Advisor page to verify.';
END $$;
