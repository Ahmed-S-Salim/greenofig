# GreenoFig Production Deployment Guide

## 🎯 What This Fixes

This deployment fixes ALL remaining issues in your Supabase database:

✅ **Signup Functionality** - Users can now sign up automatically without manual intervention
✅ **5 RLS Errors** - Security enabled on meal_plans_v2, client_milestones, consultation_templates, client_checkins, shopping_lists
✅ **65 Function Warnings** - All functions now have proper search_path security settings
✅ **Survey Responses** - New table to collect survey data for analytics
✅ **FAQ Pricing** - Arabic FAQ now shows correct pricing (9.99, 19.99, 29.99)

---

## 📝 Step-by-Step Deployment

### Step 1: Run the Master SQL Migration

1. **Open the master SQL file:**
   - File location: `supabase/migrations/20251120_FIX_ALL_ISSUES_MASTER.sql`

2. **Copy the entire contents** (Ctrl+A, then Ctrl+C)

3. **Go to Supabase Dashboard:**
   - Open your browser
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Click on **SQL Editor** in the left sidebar

4. **Create a new query:**
   - Click **New Query** button
   - Paste the entire SQL script (Ctrl+V)

5. **Run the script:**
   - Click the **Run** button (or press Ctrl+Enter)
   - Wait for it to complete (should take 10-30 seconds)

6. **Verify success:**
   - You should see multiple green success messages:
     - ✅ PART 1 COMPLETE: Signup fixed + user_profiles RLS enabled
     - ✅ PART 2 COMPLETE: 5 RLS errors fixed
     - ✅ PART 3 COMPLETE: Survey responses table created
     - ✅ PART 4 COMPLETE: FAQ Arabic pricing fixed
     - ✅ PART 5 COMPLETE: Function security warnings fixed
     - 🎉 ALL FIXES COMPLETED SUCCESSFULLY!

---

### Step 2: Enable Leaked Password Protection (Manual Setting)

1. **Go to Supabase Dashboard:**
   - Navigate to: **Authentication** → **Settings**

2. **Find Password Strength section:**
   - Scroll down to "Password Strength and Leaked Password Protection"

3. **Enable the setting:**
   - Toggle ON: **"Check for leaked passwords using HaveIBeenPwned.org"**
   - Click **Save**

This prevents users from using passwords that have been leaked in data breaches.

---

### Step 3: Verify Everything Works

#### Check Security Advisor (Should show 0 errors now)
1. Go to: **Dashboard** → **Security Advisor**
2. Verify: **0 errors, 0-1 warnings**
3. If you see 1 warning, it should only be the leaked password protection (which you just enabled)

#### Test Signup Functionality
1. Open your website: https://greenofig.com
2. Click **Sign Up**
3. Create a test account with a new email
4. Verify:
   - ✅ Signup completes successfully
   - ✅ You're redirected to the survey page
   - ✅ No "database error saving new user" error

#### Test Survey (Arabic Translation)
1. After signing up, you should be on the survey page
2. Click the language switcher to change to Arabic
3. Verify:
   - ✅ All survey questions are in Arabic
   - ✅ "Back", "Next", "Finish" buttons are in Arabic
   - ✅ Survey submits successfully

#### Verify Survey Data Collection
1. Go to: **Supabase Dashboard** → **Table Editor**
2. Open the **survey_responses** table
3. Verify:
   - ✅ Your test survey response appears in the table
   - ✅ All data fields are populated correctly

#### Check FAQ Pricing (Arabic)
1. Go to: https://greenofig.com/faq
2. Switch language to Arabic
3. Find the question: "كم تكلفة GreenoFig؟"
4. Verify pricing shows:
   - ✅ بريميوم: 9.99 دولار شهرياً
   - ✅ ألتيميت: 19.99 دولار شهرياً
   - ✅ النخبة: 29.99 دولار شهرياً

---

## 🔒 Security Checklist

Before going live with 100+ users, ensure:

- [x] RLS enabled on all user data tables
- [x] Signup trigger installed (automatic profile creation)
- [x] Function search_path security settings applied
- [x] Leaked password protection enabled
- [x] All Supabase credentials have been reset (after accidental exposure)
- [x] Service role key is stored securely in .env file (never committed to git)

---

## 🚀 Production Ready!

After completing all steps above, your GreenoFig app is now:

✅ **Secure** - All RLS policies and function security settings in place
✅ **Scalable** - Automatic signup works for unlimited users
✅ **Multilingual** - Full Arabic translation support
✅ **Data-driven** - Survey responses collected for analytics
✅ **Production-ready** - Ready to handle 100+ users

---

## 📊 What Happens Automatically Now

### When a new user signs up:
1. Supabase creates auth user in `auth.users` table
2. **Trigger automatically fires** (`on_auth_user_created`)
3. **Function automatically runs** (`handle_new_user()`)
4. User profile automatically created in `user_profiles` table
5. User gets Base tier by default
6. User redirected to survey page

### When a user completes the survey:
1. Survey data saved to `user_profiles` table (for personalization)
2. Survey data saved to `survey_responses` table (for analytics)
3. Admins can view all survey responses in Supabase Dashboard

### Security (RLS) automatically enforces:
- Users can only see their own data (meal plans, workouts, messages, etc.)
- Nutritionists can see their clients' data
- Admins can see all data
- Public can see published blog posts and testimonials
- Service role (for triggers) can bypass RLS

---

## ❓ Troubleshooting

### If signup still shows "database error":
1. Check Supabase logs: **Dashboard** → **Logs** → **Postgres Logs**
2. Look for error messages related to `handle_new_user` function
3. Verify RLS is enabled: Run this query in SQL Editor:
   ```sql
   SELECT relname, relrowsecurity
   FROM pg_class
   WHERE relname = 'user_profiles';
   ```
   Should show: `relrowsecurity = true`

### If survey doesn't translate to Arabic:
1. Clear browser cache (Ctrl+Shift+R)
2. Verify translation keys exist in `src/i18n/locales/ar.json`
3. Check browser console for any i18n errors

### If FAQ pricing is still wrong:
1. Go to: **Table Editor** → **site_content** table
2. Find row where `page_key = 'faq_page'`
3. Check the `content_ar` JSON field
4. Verify pricing values are: 9.99, 19.99, 29.99

---

## 📞 Need Help?

If you encounter any issues:

1. Check Supabase logs first (Dashboard → Logs)
2. Run this verification query in SQL Editor:
   ```sql
   -- Check if trigger exists
   SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

   -- Check if RLS is enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND rowsecurity = false;
   ```

Good luck with your production launch! 🚀
