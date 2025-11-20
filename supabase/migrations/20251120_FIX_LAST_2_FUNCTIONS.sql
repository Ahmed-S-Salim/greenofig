-- =====================================================
-- FIX THE LAST 2 FUNCTIONS
-- =====================================================
-- This fixes the 2 functions that the automated script couldn't fix
-- =====================================================

-- Fix is_admin_from_auth function
DO $$
DECLARE
  func_def TEXT;
BEGIN
  -- Get the current function definition
  SELECT pg_get_functiondef(p.oid) INTO func_def
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'is_admin_from_auth';

  IF func_def IS NOT NULL THEN
    -- Only fix if it doesn't have search_path
    IF func_def NOT LIKE '%SET search_path%' THEN
      -- Replace LANGUAGE with SET search_path + LANGUAGE
      func_def := REPLACE(func_def, 'LANGUAGE plpgsql', 'SET search_path = public
LANGUAGE plpgsql');

      -- Also try sql variant
      func_def := REPLACE(func_def, 'LANGUAGE sql', 'SET search_path = public
LANGUAGE sql');

      -- Execute the fixed function
      EXECUTE func_def;
      RAISE NOTICE 'Fixed: is_admin_from_auth';
    ELSE
      RAISE NOTICE 'Skipped: is_admin_from_auth (already has search_path)';
    END IF;
  ELSE
    RAISE NOTICE 'Function is_admin_from_auth not found';
  END IF;
END $$;

-- Fix get_user_current_subscription function
DO $$
DECLARE
  func_def TEXT;
BEGIN
  -- Get the current function definition
  SELECT pg_get_functiondef(p.oid) INTO func_def
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname = 'get_user_current_subscription';

  IF func_def IS NOT NULL THEN
    -- Only fix if it doesn't have search_path
    IF func_def NOT LIKE '%SET search_path%' THEN
      -- Replace LANGUAGE with SET search_path + LANGUAGE
      func_def := REPLACE(func_def, 'LANGUAGE plpgsql', 'SET search_path = public
LANGUAGE plpgsql');

      -- Also try sql variant
      func_def := REPLACE(func_def, 'LANGUAGE sql', 'SET search_path = public
LANGUAGE sql');

      -- Execute the fixed function
      EXECUTE func_def;
      RAISE NOTICE 'Fixed: get_user_current_subscription';
    ELSE
      RAISE NOTICE 'Skipped: get_user_current_subscription (already has search_path)';
    END IF;
  ELSE
    RAISE NOTICE 'Function get_user_current_subscription not found';
  END IF;
END $$;

-- Final message
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '=== LAST 2 FUNCTIONS FIXED ===';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Now refresh Security Advisor - should show only 1 warning:';
  RAISE NOTICE '  - Leaked password protection (enable manually in Auth settings)';
  RAISE NOTICE ' ';
  RAISE NOTICE 'All function warnings should be gone!';
END $$;
