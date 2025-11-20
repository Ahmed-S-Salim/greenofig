-- =====================================================
-- ENABLE RLS ON THE 5 MISSING TABLES
-- =====================================================
-- This simply enables RLS without creating any policies
-- After running this, the 5 errors will disappear
-- You can add specific policies later based on your needs
-- =====================================================

-- Enable RLS on all 5 tables
ALTER TABLE IF EXISTS public.meal_plans_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create a service role bypass policy for each table
-- This allows the backend to work with these tables while RLS is enabled
-- Without this, these tables would be completely inaccessible

DO $$
DECLARE
  table_name TEXT;
  tables_to_fix TEXT[] := ARRAY['meal_plans_v2', 'client_milestones', 'consultation_templates', 'client_checkins', 'shopping_lists'];
BEGIN
  FOREACH table_name IN ARRAY tables_to_fix
  LOOP
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = table_name) THEN
      -- Drop existing service role policy if it exists
      EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I', table_name);

      -- Create service role bypass policy
      EXECUTE format('CREATE POLICY "Service role full access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);

      RAISE NOTICE 'Enabled RLS on: %', table_name;
    ELSE
      RAISE NOTICE 'Table does not exist: %', table_name;
    END IF;
  END LOOP;

  RAISE NOTICE ' ';
  RAISE NOTICE '=== RLS ENABLED ON 5 TABLES ===';
  RAISE NOTICE 'The 5 security errors should now be gone!';
  RAISE NOTICE ' ';
  RAISE NOTICE 'NOTE: These tables now have RLS enabled with service role access only.';
  RAISE NOTICE 'You can add user-specific policies later when you build those features.';
END $$;
