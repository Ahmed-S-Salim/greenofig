# 🔴 IMPORTANT - Apply This SQL Now!

## The Problem

You're seeing errors in the Referrals, Coupons, and Revenue pages because the database tables don't exist yet.

## The Solution

I've created a complete SQL file with ALL the tables you need: **`COMPLETE_ADMIN_TABLES.sql`**

## 📋 Step-by-Step Instructions

### Step 1: Open the SQL File
1. Open the file `COMPLETE_ADMIN_TABLES.sql` from your project root folder
2. Select ALL the content (Ctrl+A)
3. Copy it (Ctrl+C)

### Step 2: Go to Supabase
1. Open your browser
2. Go to: https://supabase.com/dashboard
3. Select your project
4. Click on **"SQL Editor"** in the left sidebar

### Step 3: Create New Query
1. Click the **"New Query"** button
2. Delete any placeholder text in the editor

### Step 4: Paste and Run
1. Paste ALL the SQL you copied (Ctrl+V)
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for the success message

### Step 5: Verify Tables Created
1. Click on **"Table Editor"** in the left sidebar
2. You should see these NEW tables:
   - ✅ `coupon_codes`
   - ✅ `coupon_redemptions`
   - ✅ `referral_program`
   - ✅ `referrals`

### Step 6: Refresh Your App
1. Go back to http://localhost:3000
2. Refresh the page (F5)
3. Navigate to Admin Dashboard
4. Click on Coupons, Referrals, or Revenue tabs
5. **No more errors!** ✅

## What This SQL Creates

### For Coupons:
- `coupon_codes` table - Store discount codes
- `coupon_redemptions` table - Track who used which coupons

### For Referrals:
- `referral_program` table - Referral program settings
- `referrals` table - Track referral relationships

### For Revenue Analytics:
- Uses existing `payment_transactions` table
- Uses existing `user_subscriptions` table
- (These should already exist from previous migrations)

### Plus:
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updating timestamps
- ✅ Helper functions for validation
- ✅ Default referral program settings

## Common Issues

### Issue 1: "relation already exists"
**Solution:** This is OK! It means some tables were already created. The SQL uses `CREATE TABLE IF NOT EXISTS` so it won't break anything.

### Issue 2: "permission denied"
**Solution:** Make sure you're using the SQL Editor in Supabase Dashboard, not a regular SQL client.

### Issue 3: "function update_updated_at_column already exists"
**Solution:** This is OK! The SQL uses `CREATE OR REPLACE FUNCTION` so it will update the existing function.

## After Applying

Once you've applied the SQL:

1. ✅ Coupons page will work - create and manage discount codes
2. ✅ Referrals page will work - track referral program
3. ✅ Revenue Analytics will work - view revenue data

## Need Help?

If you see any errors after applying the SQL, let me know the exact error message and I'll fix it!

## Quick Summary

1. Open `COMPLETE_ADMIN_TABLES.sql`
2. Copy everything
3. Paste in Supabase SQL Editor
4. Click Run
5. Done!

**File to use:** `COMPLETE_ADMIN_TABLES.sql` (in your project root folder)
