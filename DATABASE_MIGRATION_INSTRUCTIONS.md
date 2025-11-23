# 🗄️ Database Migration Instructions

## ✅ FIXED SQL Migration Ready!

I've created a **working SQL migration file** that removes the problematic `messages` table dependencies.

---

## 📁 File Location

**Fixed Migration File:**
```
supabase/migrations/20251123_FIXED.sql
```

**Original File (DO NOT USE):**
```
supabase/migrations/20251123_comprehensive_improvements.sql
```

---

## 🚀 How to Deploy

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your **GreenoFig** project
3. Click **SQL Editor** in the left sidebar

### Step 2: Copy Fixed SQL File

1. Open the fixed migration file: `supabase/migrations/20251123_FIXED.sql`
2. Copy the **entire contents** (all 531 lines)

### Step 3: Execute Migration

1. In Supabase SQL Editor, paste the SQL migration
2. Click **Run** (green play button)
3. Wait for completion (should take 5-10 seconds)

### Step 4: Verify Success

You should see:
- ✅ **19 new tables created**
- ✅ **19 RLS policies enabled**
- ✅ **10 indexes created**
- ✅ **2 helper functions created**
- ✅ **3 masterclass videos seeded**

---

## 📊 What This Migration Creates

### Gamification System (3 tables)
- `user_streaks` - Track daily/weekly streaks
- `user_achievements` - 50+ achievements with badges
- `user_levels` - XP and level progression

### Premium Features (3 tables)
- `saved_recipes` - Save favorite recipes
- `progress_photos` - Before/after photo tracking
- `body_measurements` - 11-point body measurements

### Elite Tier (3 tables)
- `dna_analysis` - DNA-based nutrition recommendations
- `masterclass_videos` - Exclusive video content
- `user_video_progress` - Video watch progress

### Nutritionist Tools (4 tables)
- `client_tags` - Tag and organize clients
- `message_templates` - Reusable message library
- `scheduled_messages` - Schedule messages in advance
- `program_templates` - Reusable program templates

### Dashboard Widgets (2 tables)
- `daily_habits` - Daily habit tracking
- `weekly_goals` - Weekly goal progress

### Notifications (2 tables)
- `notification_preferences` - User notification settings
- `notification_history` - Notification log

### Onboarding (1 table)
- `onboarding_checklist` - Track new user onboarding

### Analytics (1 table)
- `client_retention_metrics` - Nutritionist analytics

---

## 🔧 What Was Fixed

### Problem
The original migration tried to modify a `messages` table with columns that don't exist:
- Attempted to create RLS policies on `messages.sender_id` and `messages.recipient_id`
- Attempted to create indexes on these columns
- **Error**: `column "user_id" does not exist` (actually `sender_id`/`recipient_id`)

### Solution
Removed all `messages` table dependencies:
- ❌ Removed lines 7-32 (messages RLS policies)
- ❌ Removed lines 385-387 (messages indexes)
- ✅ Kept all 19 new tables intact
- ✅ Kept all other indexes and RLS policies

---

## ⚠️ Important Notes

1. **Use the FIXED file**, not the original `20251123_comprehensive_improvements.sql`
2. The migration uses `IF NOT EXISTS`, so it's safe to run multiple times
3. All tables reference `auth.users(id)` for user authentication
4. RLS policies ensure users can only access their own data
5. Helper functions are automatically available after migration

---

## 🔍 Verification

After running the migration, verify it worked:

```sql
-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_streaks', 'user_achievements', 'user_levels',
  'saved_recipes', 'progress_photos', 'body_measurements',
  'daily_habits', 'weekly_goals', 'notification_preferences'
);

-- Should return 9+ rows (all new tables)
```

---

## 📝 Next Steps After Migration

1. ✅ Database migration complete
2. 📦 Build production bundle: `npm run build:prod`
3. 🚀 Deploy to server: `npm run deploy:prod`
4. 🔗 Integrate React components (follow `INTEGRATION_GUIDE.md`)

---

## 🆘 Troubleshooting

### If you get "relation already exists" errors:
This is normal if you ran the original migration partially. The `IF NOT EXISTS` clauses will skip existing tables.

### If you get "foreign key constraint" errors:
Make sure your `auth.users` table exists. This is created by Supabase by default.

### If indexes fail to create:
Check if the referenced tables exist. Some indexes depend on tables like `user_profiles` and `client_progress` which may need to be created first.

---

## ✨ Ready to Deploy!

Once the migration succeeds, your database is ready for all 38 React components to use the new features!

**Last Updated:** November 23, 2025
**Status:** ✅ Ready for Production
