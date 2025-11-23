# Fix Signup Error - Quick Guide

## Problem
Users cannot signup because the database trigger is not set up to automatically create user profiles.

## Solution
Run the SQL script in your Supabase dashboard to enable automatic signup.

## Steps:

1. **Go to Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project: `greenofig`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the SQL Script**
   - Open the file: `supabase/migrations/20251120_FIX_ALL_ISSUES_MASTER.sql`
   - Copy the ENTIRE contents
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify It Worked**
   - Try signing up with a new test account
   - You should be able to create an account and login successfully

## What This Script Does:

✅ **Enables RLS (Row Level Security)** on user_profiles table
✅ **Creates signup trigger** that automatically creates user profiles when users sign up
✅ **Sets up RLS policies** so users can:
   - Read their own profile
   - Insert their own profile (needed for signup)
   - Update their own profile
✅ **Fixes 5 RLS errors** on other tables
✅ **Fixes 65 function security warnings**
✅ **Adds survey_responses table** for analytics

## Important Notes:

- This script is safe to run multiple times (it uses `DROP IF EXISTS` and `ON CONFLICT`)
- It only needs to be run ONCE
- After running, all new signups will work automatically
- Existing users are not affected

## If You Still Get Errors:

Check the Supabase logs:
1. Go to "Logs" in Supabase Dashboard
2. Select "Postgres Logs"
3. Look for any errors when trying to signup
4. Share the error message so we can fix it
