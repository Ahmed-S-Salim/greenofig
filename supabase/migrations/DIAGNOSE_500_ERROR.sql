-- =====================================================
-- DIAGNOSE 500 ERRORS - Find Out What's Wrong
-- =====================================================

-- Check 1: Does user_profiles table exist?
SELECT
    'Table Exists?' as check_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'user_profiles'
        ) THEN 'YES ✅'
        ELSE 'NO ❌ - Table does not exist!'
    END as result;

-- Check 2: What columns does it have?
SELECT
    'Column: ' || column_name as column_info,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check 3: Is RLS enabled?
SELECT
    'RLS Enabled?' as check_name,
    CASE WHEN rowsecurity THEN 'YES ✅' ELSE 'NO ❌' END as result
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- Check 4: What policies exist?
SELECT
    'Policy: ' || policyname as policy_info,
    cmd as command_type,
    roles,
    CASE WHEN qual IS NOT NULL THEN 'Has USING clause' ELSE 'No USING' END as using_clause,
    CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK' ELSE 'No WITH CHECK' END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- Check 5: Does the trigger exist?
SELECT
    'Trigger Exists?' as check_name,
    CASE
        WHEN EXISTS (
            SELECT FROM information_schema.triggers
            WHERE event_object_schema = 'auth'
            AND event_object_table = 'users'
            AND trigger_name = 'on_auth_user_created'
        ) THEN 'YES ✅'
        ELSE 'NO ❌ - Trigger missing!'
    END as result;

-- Check 6: Does the function exist?
SELECT
    'Function Exists?' as check_name,
    CASE
        WHEN EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = 'handle_new_user'
        ) THEN 'YES ✅'
        ELSE 'NO ❌ - Function missing!'
    END as result;

-- Check 7: Check for foreign key constraints that might be broken
SELECT
    'Foreign Key: ' || conname as constraint_info,
    'References: ' || (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = (
            SELECT relname
            FROM pg_class
            WHERE oid = c.confrelid
        )
    ) as references
FROM pg_constraint c
WHERE conrelid = (
    SELECT oid
    FROM pg_class
    WHERE relname = 'user_profiles'
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
)
AND contype = 'f';

-- Check 8: Try to SELECT from the table (will show permission error if that's the issue)
DO $$
BEGIN
    PERFORM * FROM public.user_profiles LIMIT 1;
    RAISE NOTICE 'SELECT works! ✅';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'SELECT failed! ❌ Error: %', SQLERRM;
END $$;

-- Check 9: Check schema permissions
SELECT
    'Schema Permissions' as check_name,
    'Owner: ' || nspowner::regrole as info
FROM pg_namespace
WHERE nspname = 'public';

-- Final summary
SELECT '====== DIAGNOSTIC COMPLETE ======' as summary;
SELECT 'Check the results above to find the issue' as instruction;
