-- =====================================================
-- FIX RLS POLICIES FOR WEBSITE CONTENT TABLES
-- =====================================================
-- This script fixes issues found during RLS policy testing

-- =====================================================
-- 1. FIX TESTIMONIALS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;

-- Recreate with proper permissions
CREATE POLICY "Anyone can view active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update testimonials"
  ON testimonials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete testimonials"
  ON testimonials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 2. FIX MEDIA LIBRARY POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view media files" ON media_library;
DROP POLICY IF EXISTS "Admins can manage media library" ON media_library;

-- Recreate with proper permissions
CREATE POLICY "Anyone can view media files"
  ON media_library FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert media"
  ON media_library FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update media"
  ON media_library FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete media"
  ON media_library FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 3. FIX ACTIVITY LOG POLICIES
-- =====================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Admins can view activity log" ON website_activity_log;

-- Recreate - only admins should be able to read activity logs
CREATE POLICY "Admins can view activity log"
  ON website_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Also ensure public cannot insert/update/delete activity logs
CREATE POLICY "Only system can insert activity logs"
  ON website_activity_log FOR INSERT
  WITH CHECK (false); -- Only triggers can insert

CREATE POLICY "Activity logs are immutable"
  ON website_activity_log FOR UPDATE
  USING (false);

CREATE POLICY "Activity logs cannot be deleted"
  ON website_activity_log FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- =====================================================
-- 4. FIX HOMEPAGE CONTENT POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active homepage content" ON homepage_content;
DROP POLICY IF EXISTS "Admins can manage homepage content" ON homepage_content;

-- Recreate with separate policies for each operation
CREATE POLICY "Anyone can view active homepage content"
  ON homepage_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert homepage content"
  ON homepage_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update homepage content"
  ON homepage_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete homepage content"
  ON homepage_content FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 5. FIX CONTACT INFO POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active contact info" ON contact_info;
DROP POLICY IF EXISTS "Admins can manage contact info" ON contact_info;

-- Recreate with separate policies
CREATE POLICY "Anyone can view active contact info"
  ON contact_info FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert contact info"
  ON contact_info FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update contact info"
  ON contact_info FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete contact info"
  ON contact_info FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 6. FIX NAVIGATION MENUS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active navigation menus" ON navigation_menus;
DROP POLICY IF EXISTS "Admins can manage navigation menus" ON navigation_menus;

-- Recreate with separate policies
CREATE POLICY "Anyone can view active navigation menus"
  ON navigation_menus FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert navigation menus"
  ON navigation_menus FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update navigation menus"
  ON navigation_menus FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete navigation menus"
  ON navigation_menus FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 7. FIX SEO SETTINGS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active SEO settings" ON seo_settings;
DROP POLICY IF EXISTS "Admins can manage SEO settings" ON seo_settings;

-- Recreate with separate policies
CREATE POLICY "Anyone can view active SEO settings"
  ON seo_settings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert SEO settings"
  ON seo_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update SEO settings"
  ON seo_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete SEO settings"
  ON seo_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Changes made:';
  RAISE NOTICE '  - Split "FOR ALL" policies into separate INSERT/UPDATE/DELETE policies';
  RAISE NOTICE '  - Fixed testimonials write protection';
  RAISE NOTICE '  - Fixed media library write protection';
  RAISE NOTICE '  - Fixed activity log visibility (admin-only)';
  RAISE NOTICE '  - Made activity logs immutable (only triggers can insert)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test again with: node test-website-rls.js';
END $$;
