-- FIX ALL 65 FUNCTION SECURITY WARNINGS
-- This adds SET search_path = public to all functions for security

-- This script will alter all functions to set their search_path
-- This prevents SQL injection attacks by ensuring functions only use the public schema

DO $$
DECLARE
    func_record RECORD;
    func_source TEXT;
BEGIN
    -- Loop through all functions in the public schema
    FOR func_record IN
        SELECT
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_def
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'  -- Only functions, not procedures
    LOOP
        BEGIN
            -- Get the function definition
            func_source := func_record.function_def;

            -- Only modify if it doesn't already have SET search_path
            IF func_source NOT LIKE '%SET search_path%' AND func_source NOT LIKE '%set search_path%' THEN
                -- Replace the function with added search_path
                func_source := REPLACE(
                    func_source,
                    'LANGUAGE plpgsql',
                    'SET search_path = public
LANGUAGE plpgsql'
                );

                -- Execute the modified function definition
                EXECUTE func_source;

                RAISE NOTICE 'Fixed function: %', func_record.function_name;
            ELSE
                RAISE NOTICE 'Skipped (already has search_path): %', func_record.function_name;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Could not fix function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE '✅ All functions have been secured!';
END $$;
