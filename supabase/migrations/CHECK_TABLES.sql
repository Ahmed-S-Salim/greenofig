-- =====================================================
-- CHECK WHICH TABLES EXIST IN YOUR DATABASE
-- =====================================================
-- Run this to see which of the 5 RLS error tables actually exist
-- =====================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  table_name TEXT;
  column_name TEXT;
  tables_to_check TEXT[] := ARRAY['meal_plans_v2', 'client_milestones', 'consultation_templates', 'client_checkins', 'shopping_lists'];
  existing_tables TEXT[] := ARRAY[]::TEXT[];
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '=== CHECKING WHICH TABLES EXIST ===';
  RAISE NOTICE ' ';

  FOREACH table_name IN ARRAY tables_to_check
  LOOP
    -- Check if table exists
    SELECT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename = table_name
    ) INTO table_exists;

    IF table_exists THEN
      existing_tables := array_append(existing_tables, table_name);
      RAISE NOTICE 'EXISTS: %', table_name;

      -- Check if table has user_id column
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name = 'user_id'
      ) INTO table_exists;

      IF table_exists THEN
        RAISE NOTICE '  -> Has user_id column: YES';
      ELSE
        RAISE NOTICE '  -> Has user_id column: NO';

        -- Try to find what column name it uses
        SELECT string_agg(column_name, ', ')
        INTO column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = table_name
        AND column_name LIKE '%user%' OR column_name LIKE '%client%';

        IF column_name IS NOT NULL THEN
          RAISE NOTICE '  -> Found these columns: %', column_name;
        END IF;
      END IF;
    ELSE
      missing_tables := array_append(missing_tables, table_name);
      RAISE NOTICE 'MISSING: %', table_name;
    END IF;

    RAISE NOTICE ' ';
  END LOOP;

  RAISE NOTICE ' ';
  RAISE NOTICE '=== SUMMARY ===';
  RAISE NOTICE 'Existing tables: %', array_length(existing_tables, 1);
  RAISE NOTICE 'Missing tables: %', array_length(missing_tables, 1);
  RAISE NOTICE ' ';

  IF array_length(existing_tables, 1) > 0 THEN
    RAISE NOTICE 'Tables that exist:';
    FOREACH table_name IN ARRAY existing_tables
    LOOP
      RAISE NOTICE '  - %', table_name;
    END LOOP;
  END IF;

  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE ' ';
    RAISE NOTICE 'Tables that do NOT exist (safe to ignore):';
    FOREACH table_name IN ARRAY missing_tables
    LOOP
      RAISE NOTICE '  - %', table_name;
    END LOOP;
  END IF;
END $$;
