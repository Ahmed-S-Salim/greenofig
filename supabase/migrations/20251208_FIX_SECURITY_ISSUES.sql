-- Fix Security Issues: SECURITY DEFINER Views and RLS on tables
-- Run this in Supabase SQL Editor

-- =====================================================
-- PART 1: Fix SECURITY DEFINER views
-- Recreate views WITHOUT SECURITY DEFINER (use default SECURITY INVOKER)
-- =====================================================

-- Drop and recreate nutritionist_dashboard_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.nutritionist_dashboard_stats CASCADE;

CREATE VIEW public.nutritionist_dashboard_stats
WITH (security_invoker = true) AS
SELECT
  n.id as nutritionist_id,
  COUNT(DISTINCT c.id) as total_clients,
  COUNT(DISTINCT CASE WHEN c.tier = 'Base' THEN c.id END) as base_clients,
  COUNT(DISTINCT CASE WHEN c.tier = 'Premium' THEN c.id END) as premium_clients,
  COUNT(DISTINCT CASE WHEN c.tier = 'Elite' THEN c.id END) as elite_clients,
  COUNT(DISTINCT CASE WHEN cp.date >= CURRENT_DATE - INTERVAL '7 days' THEN c.id END) as active_clients,
  (COUNT(DISTINCT CASE WHEN c.tier = 'Premium' THEN c.id END) * 29 +
   COUNT(DISTINCT CASE WHEN c.tier = 'Elite' THEN c.id END) * 59) as estimated_monthly_revenue
FROM user_profiles n
LEFT JOIN user_profiles c ON c.role = 'user'
LEFT JOIN client_progress cp ON cp.client_id = c.id
WHERE n.role = 'nutritionist'
GROUP BY n.id;

-- Grant access to view
GRANT SELECT ON public.nutritionist_dashboard_stats TO authenticated;

-- Drop and recreate client_dashboard_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.client_dashboard_stats CASCADE;

CREATE VIEW public.client_dashboard_stats
WITH (security_invoker = true) AS
SELECT
  c.id as client_id,
  c.full_name as client_name,
  c.tier,
  COUNT(DISTINCT cg.id) as total_goals,
  COUNT(DISTINCT CASE WHEN cg.status = 'active' THEN cg.id END) as active_goals,
  COUNT(DISTINCT CASE WHEN cg.status = 'completed' THEN cg.id END) as completed_goals,
  AVG(CASE WHEN cg.status = 'active' THEN cg.progress_percentage END) as avg_goal_progress,
  COUNT(DISTINCT ca.id) as total_achievements
FROM user_profiles c
LEFT JOIN client_goals cg ON cg.client_id = c.id
LEFT JOIN client_achievements ca ON ca.client_id = c.id
WHERE c.role = 'user'
GROUP BY c.id, c.full_name, c.tier;

GRANT SELECT ON public.client_dashboard_stats TO authenticated;

-- Drop and recreate nutritionist_revenue_overview view without SECURITY DEFINER
DROP VIEW IF EXISTS public.nutritionist_revenue_overview CASCADE;

CREATE VIEW public.nutritionist_revenue_overview
WITH (security_invoker = true) AS
SELECT
  n.id as nutritionist_id,
  n.full_name as nutritionist_name,
  COUNT(DISTINCT s.id) as total_subscriptions,
  COUNT(DISTINCT CASE WHEN s.tier = 'Base' THEN s.id END) as base_subscriptions,
  COUNT(DISTINCT CASE WHEN s.tier = 'Premium' THEN s.id END) as premium_subscriptions,
  COUNT(DISTINCT CASE WHEN s.tier = 'Elite' THEN s.id END) as elite_subscriptions,
  SUM(CASE WHEN s.status = 'active' THEN s.price_per_month ELSE 0 END) as monthly_recurring_revenue,
  SUM(CASE WHEN ph.status = 'succeeded' AND ph.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN ph.amount ELSE 0 END) as revenue_last_30_days,
  SUM(CASE WHEN ph.status = 'succeeded' THEN ph.amount ELSE 0 END) as total_lifetime_revenue
FROM user_profiles n
LEFT JOIN subscriptions s ON s.nutritionist_id = n.id
LEFT JOIN payment_history ph ON ph.nutritionist_id = n.id
WHERE n.role = 'nutritionist'
GROUP BY n.id, n.full_name;

GRANT SELECT ON public.nutritionist_revenue_overview TO authenticated;

-- =====================================================
-- PART 2: Enable RLS on tables missing it
-- =====================================================

-- Enable RLS on admin_roles table
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_roles
-- Only super_admins can view/modify admin roles
DROP POLICY IF EXISTS "Super admins can view admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can view admin roles" ON public.admin_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;
CREATE POLICY "Super admins can manage admin roles" ON public.admin_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'super_admin'
        )
    );

-- Enable RLS on masterclass_videos table
ALTER TABLE public.masterclass_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for masterclass_videos
-- Users can view videos based on their tier
DROP POLICY IF EXISTS "Users can view videos based on tier" ON public.masterclass_videos;
CREATE POLICY "Users can view videos based on tier" ON public.masterclass_videos
    FOR SELECT
    USING (
        published_at IS NOT NULL
        AND (
            -- Free tier videos (tier_required = 'base' or null)
            tier_required IS NULL
            OR tier_required = 'base'
            -- Or user has matching or higher tier
            OR (
                EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND (
                        -- User tier matches or exceeds required tier
                        (tier_required = 'premium' AND user_profiles.tier IN ('Premium', 'Pro', 'Elite'))
                        OR (tier_required = 'elite' AND user_profiles.tier = 'Elite')
                        -- Admins can see all
                        OR user_profiles.role IN ('admin', 'super_admin')
                    )
                )
            )
        )
    );

-- Only admins can create/update/delete masterclass videos
DROP POLICY IF EXISTS "Admins can manage masterclass videos" ON public.masterclass_videos;
CREATE POLICY "Admins can manage masterclass videos" ON public.masterclass_videos
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- Verify the changes
-- =====================================================
SELECT 'Security fixes applied successfully!' AS status;
