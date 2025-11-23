# 🚀 GreenoFig Platform Deployment Guide

**Version:** 2.0
**Date:** November 23, 2025
**Platform:** React + Vite + Supabase

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [Build Process](#build-process)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Rollback Procedure](#rollback-procedure)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### 1. Code Quality Checks

- [ ] All components built without errors
- [ ] ESLint passes with no errors
- [ ] All console.logs removed from production code
- [ ] No TODO comments in critical paths
- [ ] All API keys are in environment variables (not hardcoded)

### 2. Testing Verification

- [ ] Mobile responsiveness tested (320px, 375px, 768px, 1024px+)
- [ ] Tier-based access control verified for all features
- [ ] All database queries tested and working
- [ ] Service Worker registration tested
- [ ] Push notifications tested (if applicable)
- [ ] All forms validated and error handling tested
- [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)

### 3. Database Preparation

- [ ] SQL migration file reviewed: `supabase/migrations/20251123_comprehensive_improvements.sql`
- [ ] Backup of production database created
- [ ] RLS policies verified
- [ ] Database indexes created
- [ ] Helper functions tested

### 4. Environment Variables

- [ ] `.env.production` file created with production values
- [ ] Supabase production URL configured
- [ ] Supabase anon key configured
- [ ] VAPID keys generated for push notifications
- [ ] All API keys secured and added to server environment

### 5. Assets & Dependencies

- [ ] All images optimized (compressed, appropriate formats)
- [ ] All dependencies up to date (`npm outdated`)
- [ ] No unused dependencies in package.json
- [ ] Favicon and app icons present
- [ ] Offline fallback page created (`public/offline.html`)

---

## 🔧 Environment Setup

### 1. Production Environment Variables

Create `.env.production` in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Push Notifications (VAPID Keys)
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# App Configuration
VITE_APP_NAME=GreenoFig
VITE_APP_URL=https://greenofig.com
VITE_API_URL=https://greenofig.com/api

# Feature Flags
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_ANALYTICS=true

# Stripe (if using)
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
```

### 2. Generate VAPID Keys for Push Notifications

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys

# Output:
# =======================================
# Public Key:
# your_public_key_here
#
# Private Key:
# your_private_key_here
# =======================================

# Add these to .env.production
```

---

## 🗄️ Database Migration

### Step 1: Backup Production Database

```bash
# Using Supabase Dashboard
# 1. Go to https://app.supabase.com
# 2. Select your project
# 3. Database > Backups
# 4. Create new backup
```

### Step 2: Run Migration

```bash
# Using Supabase Dashboard (Recommended)
# 1. Go to SQL Editor
# 2. Copy contents of supabase/migrations/20251123_comprehensive_improvements.sql
# 3. Paste and execute
# 4. Verify "Success" message
```

### Step 3: Verify Migration

```sql
-- Check all new tables exist (should return 19 rows)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_levels', 'achievements', 'user_achievements', 'streaks',
    'leaderboard', 'quick_actions', 'saved_recipes', 'progress_photos',
    'body_measurements', 'weekly_reports', 'client_tags', 'message_templates',
    'scheduled_reminders', 'notifications', 'notification_settings',
    'push_subscriptions', 'onboarding_progress', 'user_activity_log',
    'nutritionist_analytics'
  );
```

---

## 🏗️ Build Process

### Step 1: Clean Previous Build

```bash
rm -rf dist/
rm -rf node_modules/.vite/
```

### Step 2: Install Dependencies

```bash
npm ci
```

### Step 3: Run Production Build

```bash
npm run build
```

### Step 4: Test Build Locally

```bash
npm run preview
# Test at http://localhost:4173
```

---

## 📦 Deployment Steps

### Step 1: Create Deployment Tarball

```bash
cd dist
tar -czf ../greenofig-deploy-$(date +%Y%m%d-%H%M%S).tar.gz .
cd ..
```

### Step 2: Upload to Server

```bash
scp -P 65002 greenofig-deploy-*.tar.gz u492735793@157.173.209.161:domains/greenofig.com/
```

### Step 3: Deploy on Server

```bash
ssh -p 65002 u492735793@157.173.209.161

cd domains/greenofig.com
mv public_html public_html.backup.$(date +%Y%m%d-%H%M%S)
mkdir public_html
tar -xzf greenofig-deploy-*.tar.gz -C public_html/
chmod -R 755 public_html/
find public_html -type f -exec chmod 644 {} \;
rm greenofig-deploy-*.tar.gz
```

### Step 4: Update .htaccess

```bash
cat > public_html/.htaccess << 'HTACCESS_END'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header set X-Deployment-Time "2025-11-23-12:00:00"

  <FilesMatch "\.(jpg|jpeg|png|gif|svg|webp|ico|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>

  <FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>

  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
HTACCESS_END
```

---

## ✅ Post-Deployment Verification

### 1. Immediate Checks

```bash
curl -I https://greenofig.com
# Expected: HTTP/2 200

curl -I https://greenofig.com/sw.js
# Expected: HTTP/2 200
```

### 2. Browser Testing

- [ ] Homepage loads without errors
- [ ] Login/Signup works
- [ ] Dashboard loads and displays data
- [ ] Mobile menu works
- [ ] Service Worker registers
- [ ] Gamification features load

### 3. Mobile Testing

- [ ] Responsive design (320px, 375px, 768px)
- [ ] Touch interactions work
- [ ] Forms work on mobile
- [ ] Images display correctly

---

## 🔄 Rollback Procedure

```bash
ssh -p 65002 u492735793@157.173.209.161
cd domains/greenofig.com
rm -rf public_html
mv public_html.backup.YYYYMMDD-HHMMSS public_html
```

---

## 🔧 Troubleshooting

### White Screen on Load
- Check browser console for errors
- Clear Service Worker cache
- Verify .htaccess rewrite rules
- Hard refresh (Ctrl+Shift+R)

### 404 Errors on Refresh
- Verify .htaccess has correct rewrite rules

### Service Worker Not Registering
- Check HTTPS is enabled
- Verify sw.js is accessible
- Check browser console

### Database Connection Errors
- Verify Supabase URL/key in .env.production
- Check RLS policies
- Test connection with curl

---

**Last Updated:** November 23, 2025
**Version:** 2.0
**Status:** ✅ Ready for Production
