-- =====================================================
-- DEPLOYMENT VERIFICATION SCRIPT
-- =====================================================
-- Run this AFTER running the master fix to verify everything is working
-- This will show you a detailed report of your database security status
-- =====================================================

DO $$
DECLARE
  rls_enabled_count INTEGER;
  rls_disabled_count INTEGER;
  trigger_exists BOOLEAN;
  function_exists BOOLEAN;
  survey_table_exists BOOLEAN;
  functions_with_search_path INTEGER;
  functions_without_search_path INTEGER;
  total_policies INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '   GREENOFIG DEPLOYMENT VERIFICATION';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';

  -- Check RLS status
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;

  SELECT COUNT(*) INTO rls_disabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = false;

  RAISE NOTICE '📊 ROW LEVEL SECURITY (RLS) STATUS:';
  RAISE NOTICE '   Tables with RLS enabled: %', rls_enabled_count;
  RAISE NOTICE '   Tables with RLS disabled: %', rls_disabled_count;

  IF rls_disabled_count > 0 THEN
    RAISE NOTICE '   ⚠️  WARNING: Some tables still have RLS disabled!';
    RAISE NOTICE '';
    RAISE NOTICE '   Tables without RLS:';
    FOR rec IN
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND rowsecurity = false
      ORDER BY tablename
    LOOP
      RAISE NOTICE '      - %', rec.tablename;
    END LOOP;
  ELSE
    RAISE NOTICE '   ✅ All tables have RLS enabled!';
  END IF;
  RAISE NOTICE '';

  -- Check signup trigger
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) INTO trigger_exists;

  RAISE NOTICE '🔧 SIGNUP FUNCTIONALITY:';
  IF trigger_exists THEN
    RAISE NOTICE '   ✅ Signup trigger exists (on_auth_user_created)';
  ELSE
    RAISE NOTICE '   ❌ Signup trigger NOT found!';
  END IF;

  -- Check handle_new_user function
  SELECT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user'
  ) INTO function_exists;

  IF function_exists THEN
    RAISE NOTICE '   ✅ handle_new_user() function exists';
  ELSE
    RAISE NOTICE '   ❌ handle_new_user() function NOT found!';
  END IF;
  RAISE NOTICE '';

  -- Check survey_responses table
  SELECT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'survey_responses'
  ) INTO survey_table_exists;

  RAISE NOTICE '📋 SURVEY FUNCTIONALITY:';
  IF survey_table_exists THEN
    RAISE NOTICE '   ✅ survey_responses table exists';

    -- Check if table has RLS
    SELECT rowsecurity INTO STRICT rls_enabled_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'survey_responses';

    IF rls_enabled_count THEN
      RAISE NOTICE '   ✅ survey_responses has RLS enabled';
    ELSE
      RAISE NOTICE '   ❌ survey_responses does NOT have RLS enabled!';
    END IF;
  ELSE
    RAISE NOTICE '   ❌ survey_responses table NOT found!';
  END IF;
  RAISE NOTICE '';

  -- Check function security (search_path)
  SELECT COUNT(*) INTO functions_with_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND pg_get_functiondef(p.oid) LIKE '%SET search_path%';

  SELECT COUNT(*) INTO functions_without_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND pg_get_functiondef(p.oid) NOT LIKE '%SET search_path%';

  RAISE NOTICE '🔒 FUNCTION SECURITY:';
  RAISE NOTICE '   Functions with search_path: %', functions_with_search_path;
  RAISE NOTICE '   Functions without search_path: %', functions_without_search_path;

  IF functions_without_search_path > 0 THEN
    RAISE NOTICE '   ⚠️  WARNING: % functions still missing search_path!', functions_without_search_path;
  ELSE
    RAISE NOTICE '   ✅ All functions have search_path security!';
  END IF;
  RAISE NOTICE '';

  -- Check RLS policies count
  SELECT COUNT(*) INTO total_policies
  FROM pg_policies
  WHERE schemaname = 'public';

  RAISE NOTICE '🛡️  RLS POLICIES:';
  RAISE NOTICE '   Total policies created: %', total_policies;

  -- Check specific critical tables
  RAISE NOTICE '';
  RAISE NOTICE '   Critical table policies:';

  FOR rec IN
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('user_profiles', 'meal_plans_v2', 'client_milestones',
                      'consultation_templates', 'client_checkins', 'shopping_lists',
                      'survey_responses')
    GROUP BY tablename
    ORDER BY tablename
  LOOP
    RAISE NOTICE '      - %: % policies', rec.tablename, rec.policy_count;
  END LOOP;
  RAISE NOTICE '';

  -- Final summary
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '           DEPLOYMENT SUMMARY';
  RAISE NOTICE '==========================================';

  IF rls_disabled_count = 0
     AND trigger_exists
     AND function_exists
     AND survey_table_exists
     AND functions_without_search_path = 0
     AND total_policies >= 30 THEN
    RAISE NOTICE '✅ ✅ ✅  ALL CHECKS PASSED! ✅ ✅ ✅';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Your GreenoFig database is production-ready!';
    RAISE NOTICE '🚀 You can now handle 100+ users with confidence!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable leaked password protection in Auth settings';
    RAISE NOTICE '2. Test signup with a new user';
    RAISE NOTICE '3. Verify survey data collection';
    RAISE NOTICE '4. Check Security Advisor for 0 errors';
  ELSE
    RAISE NOTICE '⚠️  SOME ISSUES DETECTED!';
    RAISE NOTICE '';
    RAISE NOTICE 'Please review the warnings above and:';
    RAISE NOTICE '1. Re-run the master fix SQL if needed';
    RAISE NOTICE '2. Check Supabase logs for errors';
    RAISE NOTICE '3. Contact support if issues persist';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
END $$;
