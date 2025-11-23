# FIX LOGIN ERROR - Follow These Steps NOW

## Problem
When you try to login, you get error: **"Could not load profile. Please refresh the page."**

This is because the database RLS (Row Level Security) is blocking access to user profiles.

---

## Solution - Run SQL Script in Supabase

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Login to your account
3. Click on your project: **greenofig**

### Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click the **"New Query"** button (green button at top)

### Step 3: Copy the SQL Script
1. Open this file on your computer:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\supabase\migrations\SIMPLE_SIGNUP_FIX.sql
   ```

2. Select ALL the text in the file (Ctrl+A)

3. Copy it (Ctrl+C)

### Step 4: Paste and Run
1. In the Supabase SQL Editor, paste the SQL (Ctrl+V)

2. Click the **"Run"** button (green play button)

3. Wait for it to finish (should take 1-2 seconds)

4. You should see: **"Success. No rows returned"**

### Step 5: Test Login
1. Go to https://greenofig.com/login

2. Try to login with your email and password

3. It should work now! ✅

---

## What This SQL Script Does

✅ **Enables RLS** on the user_profiles table
✅ **Creates policies** that allow users to read their own profile
✅ **Creates signup trigger** that automatically creates profiles for new users
✅ **Fixes both login AND signup**

---

## If You Still Get Errors

### Check the Error in Browser Console:
1. Press `F12` to open Developer Tools
2. Click the **"Console"** tab
3. Try to login again
4. Look for any error messages in red
5. Take a screenshot and share it with me

### Common Issues:

**Error: "relation 'user_profiles' does not exist"**
- The table doesn't exist in your database
- You need to create the table first

**Error: "permission denied for table user_profiles"**
- RLS is enabled but policies aren't set correctly
- Run the SQL script again

**Error: "column 'id' does not exist"**
- The table structure is different
- Share the error and I'll create a custom fix

---

## Need Help?

If the SQL script gives you an error when you run it, copy the EXACT error message and share it with me. I'll fix it immediately.
