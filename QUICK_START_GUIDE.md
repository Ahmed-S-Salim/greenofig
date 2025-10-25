# Quick Start Guide - New Admin Features

**Last Updated:** October 18, 2025

This guide helps you quickly understand and use the new admin dashboard features that were just implemented.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run the Database Migration

Open Supabase SQL Editor and run:

```sql
-- Copy the entire content of create-activity-logs-table.sql and run it
-- This creates the activity_logs table with proper security
```

**Location:** `create-activity-logs-table.sql` in project root

### Step 2: Verify Your User Role

Check your role in Supabase:

```sql
SELECT id, full_name, email, role FROM user_profiles WHERE email = 'your@email.com';
```

**Available Roles:**
- `super_admin` - Full access to everything
- `admin` - Most admin features
- `content_editor` - Blog and website only
- `support_agent` - Support tickets only
- `analyst` - Analytics view only

### Step 3: Test the Features

1. Go to http://localhost:3000/app/admin
2. You should see tabs filtered by your role
3. Try navigating between sections
4. Check the Activity Logs (if you're admin)

---

## 🎯 Key Features at a Glance

### 1. Role-Based Access Control (RBAC)

**What it does:** Shows different admin tabs based on user role

**Example:**
- Super Admin sees all 12 tabs
- Content Editor sees only: Dashboard, Blog, Website, Analytics
- Support Agent sees only: Dashboard, Support, Customers

**How to use:**
- Your tabs are automatically filtered
- No action needed - just log in!

### 2. Activity Logging

**What it does:** Tracks every admin action for audit/compliance

**Where to view:** Admin Dashboard → Activity Logs tab (admins only)

**What's tracked:**
- User creation/updates/deletion
- Content changes
- Payment processing
- Subscription changes
- And 25+ more activity types

**How to add logging to your code:**

```javascript
import { logActivity, ACTIVITY_TYPES } from '@/lib/activityLogger';

// After creating a user
await logActivity(
  ACTIVITY_TYPES.USER_CREATED,
  { name: user.full_name, email: user.email },
  currentUser,
  user.id,
  'user'
);
```

### 3. Revenue Analytics Enhancements

**What it does:** Shows MRR, ARR, Churn Rate, and more

**Where to find:** Admin Dashboard → Revenue tab

**Features:**
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn Rate percentage
- Customer Lifetime Value
- Export to CSV button (top right)

**How to export:**
1. Go to Revenue tab
2. Click "Export CSV" button
3. File downloads automatically

### 4. Subscription Analytics

**What it does:** Shows subscription metrics

**Where to find:** Admin Dashboard → Subscriptions tab

**Metrics shown:**
- Total active subscriptions
- New subscriptions this month
- Canceled this month
- Payment failures this month

### 5. Error Boundaries

**What it does:** Prevents app crashes, shows friendly error messages

**User experience:**
- If a component errors, you see a nice error message
- Can click "Try Again" to reload
- Can click "Go to Dashboard" to navigate away

**Developer experience:**
- Error details shown in development mode
- Errors logged to console for debugging

### 6. Loading & Empty States

**What it does:** Better UX while data loads or when there's no data

**Components:**
- Loading spinners
- Skeleton loaders
- Empty state messages

**Automatic:** Already integrated into most admin pages

---

## 📖 Common Tasks

### Task 1: View Activity Logs

1. Log in as admin or super_admin
2. Go to Admin Dashboard
3. Click "Activity Logs" tab (might need to scroll tabs)
4. Use filters to find specific activities
5. Click "Export CSV" to download logs

### Task 2: Check Revenue Analytics

1. Go to Admin Dashboard → Revenue
2. Select time range (Week/Month/Year)
3. View MRR, ARR, Churn metrics
4. Click "Export CSV" to download report

### Task 3: Monitor Subscriptions

1. Go to Admin Dashboard → Subscriptions
2. View stats at top (Active, New, Canceled, Failures)
3. Scroll down to see subscription plans
4. Click "Add New Plan" to create a plan

### Task 4: Manage Customers with Segmentation

1. Go to Admin Dashboard → Customers
2. Use filters:
   - Filter by Role (user, nutritionist, admin)
   - Filter by Status (active, inactive)
   - Filter by Subscription (with, without)
3. Use search bar to find specific customers
4. Click "Export CSV" to download customer list

### Task 5: Check Your Permissions

```javascript
// In browser console
import { hasPermission, PERMISSIONS } from '@/lib/rbac';

// Get current user
const user = { role: 'admin' }; // Your actual user object

// Check a permission
console.log(hasPermission(user, PERMISSIONS.CUSTOMERS_EDIT)); // true/false
```

---

## 🔧 Troubleshooting

### Problem: Can't see all admin tabs

**Cause:** Your user role doesn't have permission

**Solution:**
1. Check your role in database
2. Update role if needed:
   ```sql
   UPDATE user_profiles
   SET role = 'admin'
   WHERE email = 'your@email.com';
   ```

### Problem: Activity Logs tab missing

**Cause:** Either not admin, or table doesn't exist

**Solution:**
1. Verify you're admin/super_admin
2. Run the SQL migration (create-activity-logs-table.sql)

### Problem: Export buttons not working

**Cause:** No data to export, or browser blocking downloads

**Solution:**
1. Ensure there's data in the table/list
2. Check browser's download settings
3. Check browser console for errors

### Problem: "Access Denied" message

**Cause:** You don't have permission for that feature

**Solution:**
- Normal behavior for your role
- Contact super admin to change your role if needed

---

## 📚 Reference

### All Available Roles

| Role | Access Level | Can See |
|------|-------------|---------|
| `super_admin` | Full access | Everything |
| `admin` | Most features | All except database studio |
| `content_editor` | Content only | Blog, Website, Analytics |
| `support_agent` | Support only | Support tickets, Customers (view) |
| `analyst` | Analytics only | Analytics, Revenue (view only) |
| `nutritionist` | Limited | Customers, Support |
| `user` | No admin | N/A (redirected) |

### Permission Examples

```javascript
// Customer permissions
PERMISSIONS.CUSTOMERS_VIEW     // Can view customer list
PERMISSIONS.CUSTOMERS_EDIT     // Can edit customers
PERMISSIONS.CUSTOMERS_DELETE   // Can delete customers
PERMISSIONS.CUSTOMERS_EXPORT   // Can export to CSV

// Content permissions
PERMISSIONS.BLOG_CREATE        // Can create blog posts
PERMISSIONS.BLOG_EDIT          // Can edit blog posts
PERMISSIONS.BLOG_PUBLISH       // Can publish blog posts
PERMISSIONS.WEBSITE_EDIT       // Can edit website content

// Analytics permissions
PERMISSIONS.REVENUE_VIEW       // Can view revenue analytics
PERMISSIONS.REVENUE_EXPORT     // Can export revenue data
PERMISSIONS.ANALYTICS_VIEW     // Can view analytics
```

### Activity Types Reference

```javascript
// User activities
ACTIVITY_TYPES.USER_CREATED
ACTIVITY_TYPES.USER_UPDATED
ACTIVITY_TYPES.USER_DELETED
ACTIVITY_TYPES.USER_ROLE_CHANGED

// Content activities
ACTIVITY_TYPES.BLOG_CREATED
ACTIVITY_TYPES.BLOG_PUBLISHED
ACTIVITY_TYPES.WEBSITE_UPDATED

// Subscription activities
ACTIVITY_TYPES.SUBSCRIPTION_CREATED
ACTIVITY_TYPES.SUBSCRIPTION_CANCELED

// Payment activities
ACTIVITY_TYPES.PAYMENT_PROCESSED
ACTIVITY_TYPES.PAYMENT_REFUNDED

// System activities
ACTIVITY_TYPES.SETTINGS_UPDATED
ACTIVITY_TYPES.DATA_EXPORTED
```

---

## 💡 Pro Tips

### Tip 1: Keyboard Navigation
- Tab through sections using Tab key
- Click numbers in pagination with keyboard
- Use Ctrl+F to search in tables

### Tip 2: Quick Exports
All managers now have CSV export:
- Customers → "Export CSV"
- Revenue → "Export CSV"
- Activity Logs → "Export CSV"

### Tip 3: Filter Combinations
Combine filters for powerful searches:
```
Customers tab:
- Filter: Role = "user"
- Filter: Status = "active"
- Filter: Subscription = "with"
- Search: "@gmail.com"
= Shows active Gmail users with subscriptions
```

### Tip 4: Activity Log Search
Search activity logs by:
- User name
- User email
- Activity type
- Then export filtered results

### Tip 5: Mobile Usage
All features work on mobile:
- Tabs scroll horizontally
- Tables scroll horizontally
- Cards stack vertically
- Touch-friendly buttons

---

## 🎓 Learn More

### Detailed Documentation
- **FINAL_IMPLEMENTATION_SUMMARY.md** - Complete technical documentation
- **ADMIN_DASHBOARD_RECOMMENDATIONS.md** - Original recommendations
- **ADMIN_IMPROVEMENTS_COMPLETED.md** - Priority 1 & 2 implementation

### Code Files to Explore
- **`src/lib/rbac.js`** - Permission system
- **`src/lib/activityLogger.js`** - Activity logging
- **`src/components/ErrorBoundary.jsx`** - Error handling
- **`src/components/LoadingState.jsx`** - Loading components
- **`src/components/admin/ActivityLogsManager.jsx`** - Activity log viewer

---

## ❓ FAQ

**Q: Can I customize permissions?**
A: Yes! Edit `src/lib/rbac.js` → `ROLE_PERMISSIONS` object

**Q: How long are activity logs kept?**
A: Forever (until you set up retention policy)

**Q: Can I see who made changes?**
A: Yes! Check Activity Logs tab

**Q: What if I need a new activity type?**
A: Add it to `ACTIVITY_TYPES` in `src/lib/activityLogger.js`

**Q: Can I undo changes?**
A: No, but activity logs show what changed

**Q: How do I add a new admin role?**
A: Add to `ROLES` in rbac.js, then define permissions

**Q: Is this production-ready?**
A: Yes! All features are tested and documented

---

## 🚨 Important Reminders

1. **Run SQL Migration:** Activity logs won't work without it
2. **Check User Roles:** Make sure roles are assigned in database
3. **Test Permissions:** Verify users see correct tabs
4. **Never change GreeonFig:** The spelling is intentional

---

## 📞 Need Help?

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tabs not showing | Check user role in database |
| Export not working | Ensure data exists, check browser console |
| Activity logs empty | Run SQL migration, log some activities |
| Access denied | Normal for your role, or contact admin |
| Error on page | Check browser console, error boundary will catch it |

### Debug Checklist

- [ ] User has correct role in database
- [ ] SQL migration completed (activity_logs table exists)
- [ ] No console errors (F12 → Console)
- [ ] Logged in as expected user
- [ ] Browser cache cleared if seeing old version

---

**Remember:** GreeonFig (not GreenFig) is the correct spelling! 🌱
