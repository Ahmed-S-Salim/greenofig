# Supabase Configuration Fix Guide

## ⚠️ CRITICAL ISSUE
**Error: "database error saving new user"**

This means the user_profiles table can't be written to due to RLS policies and missing database trigger.

## Issues Found

1. **Database Trigger Missing** - No automatic user_profile creation on signup
2. **RLS Policy Infinite Recursion** - Prevents reading/writing to user_profiles table
3. **Email Confirmation Required** - Prevents users from logging in immediately after signup

---

## 🔧 COMPLETE FIX (Follow ALL steps in order)

### Step 1: Go to Supabase Dashboard

1. Open: https://supabase.com/dashboard
2. Select your project (the one with ID: `xdzoikocriuvgkoenjqk`)
3. Click on **SQL Editor** in the left sidebar

---

### Step 2: Run This SQL (Copy & Paste Everything Below)

Click **"+ New Query"** in SQL Editor, then copy and paste ALL of this SQL:

```sql
-- Step 1: Drop all existing problematic policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Step 2: Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 3: Create the trigger function that auto-creates user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**After pasting, click the "RUN" button (or press Ctrl+Enter)**

You should see success messages. If you see any errors, copy them and let me know.

---

### Step 3: Disable Email Confirmation

1. In Supabase dashboard, go to **Authentication** → **Settings** (left sidebar)
2. Scroll down to **Email Auth** section
3. Find **"Enable email confirmations"**
4. **TOGGLE IT OFF** (disable it)
5. Click **Save** at the bottom

---

## ✅ Testing After Fixes

### Test Signup:

1. Go to http://localhost:3000/signup
2. Fill in:
   - **Email**: `admin@greenofig.com`
   - **Password**: `admin123` (or anything you want)
   - **Name**: `Admin User`
3. Click **"Sign Up"**
4. ✅ You should be automatically logged in
5. ✅ You should be redirected to `/app/admin` (Admin Dashboard)

### If It Works:

You'll see the Admin Dashboard with tabs for:
- Analytics
- Blog Manager
- **Pricing** ← Click this to edit the Elite plan
- Customers
- Features
- etc.

### To Edit Elite Plan:

1. Go to **Pricing** tab in Admin Dashboard
2. Find the **Elite** plan row
3. Click the **Edit** button (pencil icon)
4. In the **Features** textarea, paste this:

```
AI Personalized Plan
Basic Progress Tracking
Community Access
Smart Meal Logging
Workout Library & Planner
Adaptive Goal Setting
Lifestyle Habit Coaching
Recipe & Meal Suggestions
Macronutrient Tracking
Wearable Device Sync
Custom Workout Builder
Advanced Analytics
Weekly & Monthly Reports
Priority Nutritionist Chat
Sleep Cycle Analysis
Grocery List Generator
Real-time Form Feedback
Biomarker Integration
1-on-1 Video Coaching
Exclusive Challenges
Photo Food Recognition
Priority Support
Doctor Consultations
Personalized Supplement Recommendations
VIP Community Access
```

5. Click **Save**
6. Go to http://localhost:3000/pricing to verify the changes

---

## 🆘 Troubleshooting

**If signup still fails:**
- Check that you completed ALL steps above
- Check browser console for error messages (F12 → Console tab)
- Copy the error message and let me know

**If you see "email already exists":**
- The previous signup attempt created a partial user
- Go to Supabase Dashboard → Authentication → Users
- Delete the user with email `admin@greenofig.com`
- Try signing up again
