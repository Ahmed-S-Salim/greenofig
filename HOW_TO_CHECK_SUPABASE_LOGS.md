# How to Check Supabase Error Logs

## The 500 errors mean there's a database error we can't see in the browser.
## We need to check the Supabase logs to see the REAL error.

---

## Step 1: Open Supabase Logs

1. Go to https://supabase.com/dashboard
2. Select your project: **greenofig**
3. In the left sidebar, click **"Logs"**
4. Click on **"Postgres Logs"**

---

## Step 2: Trigger the Error

1. Keep the logs page open
2. In another tab, go to https://greenofig.com/login
3. Try to login
4. Go back to the Supabase logs tab

---

## Step 3: Find the Error

Look for RED error messages that say something like:

- `ERROR: permission denied for schema public`
- `ERROR: relation "user_profiles" does not exist`
- `ERROR: column "role" does not exist`
- `ERROR: function ... does not exist`
- `ERROR: insert or update on table ... violates foreign key constraint`

---

## Step 4: Share the Error with Me

Copy the FULL error message and send it to me.

It will look something like:
```
2025-11-21 04:01:51.407 UTC [12345] ERROR: permission denied for schema public at character 15
2025-11-21 04:01:51.407 UTC [12345] STATEMENT: SELECT * FROM user_profiles WHERE id = '...'
```

---

## Alternative: Check Database Structure

If you can't access logs, let's check if the table structure is correct:

### Run this in SQL Editor:

```sql
-- Check if user_profiles table exists and its structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
```

Share the results with me!

---

## What We're Looking For:

The 500 error could be caused by:

1. ❌ Missing columns in the table
2. ❌ Wrong data types
3. ❌ Missing foreign key constraints
4. ❌ Schema permission issues
5. ❌ Something else entirely

Once I see the actual error log or table structure, I can create the exact fix!
