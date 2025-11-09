# 🔔 Notification System - Complete Guide

## ✅ What's Been Built

### 1. **Database Schema** (Ready to Deploy)
**File**: `supabase/migrations/create_notifications_system.sql`

**Features**:
- ✅ `notifications` table with full tracking
- ✅ `notification_settings` table for user preferences
- ✅ Automatic notification triggers for:
  - New user registrations → Admins notified
  - Blog posts generated → Admins notified
  - Queue running low (≤2 topics) → Admins notified
  - Queue empty (0 topics) → Admins notified
- ✅ Helper functions: `create_notification()`, `mark_notification_read()`, etc.
- ✅ Row Level Security policies

### 2. **NotificationBell Component** (Ready to Deploy)
**File**: `src/components/NotificationBell.jsx`

**Features**:
- ✅ Bell icon with unread count badge
- ✅ Dropdown with all notifications
- ✅ Real-time updates via Supabase subscriptions
- ✅ Mark as read functionality
- ✅ Mark all as read
- ✅ Delete notifications
- ✅ Click to navigate to relevant page
- ✅ Different icons/colors based on priority
- ✅ Time ago formatting

### 3. **Integration** (Ready to Deploy)
- ✅ Added to `AppLayout.jsx` header
- ✅ Automatically appears on ALL dashboards:
  - User Dashboard
  - Admin Panel
  - Nutritionist Dashboard

---

## 🚀 Deployment Steps

### Step 1: Run Database Migration

Go to Supabase SQL Editor:
```
https://xdzoikocriuvgkoenjqk.supabase.co/project/xdzoikocriuvgkoenjqk/sql/new
```

Copy the entire content of:
```
supabase/migrations/create_notifications_system.sql
```

And execute it.

### Step 2: Build and Deploy

```bash
npm run build
# Package and deploy to Hostinger
```

---

## 📧 Email Notifications (Phase 2 - Optional)

To add email notifications, create: `src/lib/emailNotifications.js`

```javascript
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const sendBlogGeneratedEmail = async (adminEmail, blogTitle) => {
  await resend.emails.send({
    from: import.meta.env.VITE_FROM_EMAIL,
    to: adminEmail,
    subject: '✅ Blog Post Generated',
    html: `
      <h2>New Blog Post Generated</h2>
      <p>AI has successfully generated a new blog post:</p>
      <p><strong>"${blogTitle}"</strong></p>
      <p><a href="https://greenofig.com/app/admin?tab=blog">View in Admin Panel</a></p>
    `
  });
};

export const sendQueueLowEmail = async (adminEmail, remainingTopics) => {
  await resend.emails.send({
    from: import.meta.env.VITE_FROM_EMAIL,
    to: adminEmail,
    subject: '⚠️ Blog Queue Running Low',
    html: `
      <h2>Blog Queue Running Low</h2>
      <p>Only <strong>${remainingTopics}</strong> topic(s) remaining in the queue.</p>
      <p>Add more topics to continue auto-generation.</p>
      <p><a href="https://greenofig.com/app/admin?tab=blog">Manage Queue</a></p>
    `
  });
};

export const sendQueueEmptyEmail = async (adminEmail) => {
  await resend.emails.send({
    from: import.meta.env.VITE_FROM_EMAIL,
    to: adminEmail,
    subject: '🚨 Blog Queue Empty',
    html: `
      <h2>Blog Queue is Empty!</h2>
      <p>No topics left in the queue. Auto-generation has stopped.</p>
      <p><a href="https://greenofig.com/app/admin?tab=blog">Add Topics Now</a></p>
    `
  });
};
```

Then modify `cron-generate-blog.php` to also send emails by calling a PHP email function or Edge Function.

---

## 🎯 How Notifications Work

### **Automatic Triggers** (Database-Level):

1. **New User Registers**
   - Trigger: `on_new_user_notify_admins`
   - Notifies: All admins
   - Type: `new_user`
   - Priority: `normal`

2. **Blog Post Generated**
   - Trigger: `on_blog_post_generated`
   - Notifies: All admins
   - Type: `blog_generated`
   - Priority: `normal`
   - Includes: Post title and link

3. **Queue Running Low**
   - Trigger: `check_blog_queue_status`
   - Notifies: All admins when ≤2 topics
   - Type: `queue_low`
   - Priority: `high`

4. **Queue Empty**
   - Trigger: `check_blog_queue_status`
   - Notifies: All admins when 0 topics
   - Type: `queue_empty`
   - Priority: `urgent`

### **Manual Notifications** (Client-Side):

Call this function anywhere in your code:

```javascript
await supabase.from('notifications').insert({
  user_id: userId,
  type: 'system_alert',
  title: 'Notification Title',
  message: 'Notification message here',
  action_url: '/app/admin?tab=blog',
  priority: 'normal'
});
```

---

## 📊 Notification Types

| Type | Description | Priority | Icon |
|------|-------------|----------|------|
| `blog_generated` | Blog post created | Normal | ℹ️ |
| `queue_low` | 2 or fewer topics | High | ⚠️ |
| `queue_empty` | No topics left | Urgent | 🚨 |
| `new_user` | User registered | Normal | 👤 |
| `user_login` | User logged in | Low | 🔓 |
| `nutritionist_login` | Nutritionist logged in | Low | 👨‍⚕️ |
| `nutritionist_activity` | Nutritionist action | Normal | 📋 |
| `new_subscription` | New subscription | High | 💳 |
| `subscription_cancelled` | Subscription cancelled | High | ❌ |
| `new_message` | New message received | Normal | 💬 |
| `appointment_scheduled` | Appointment booked | Normal | 📅 |
| `system_alert` | System notification | Urgent | 🔔 |

---

## 🔧 Customization

### Add New Notification Type:

1. **Add to database enum** (in migration):
```sql
ALTER TABLE notifications
ALTER COLUMN type
TYPE TEXT CHECK (type IN ('blog_generated', 'queue_low', 'your_new_type'));
```

2. **Add icon in NotificationBell.jsx**:
```javascript
case 'your_new_type':
  return <YourIcon className="w-5 h-5 text-blue-400" />;
```

3. **Create notification**:
```javascript
await supabase.from('notifications').insert({
  user_id: userId,
  type: 'your_new_type',
  title: 'Your Title',
  message: 'Your message',
  priority: 'normal'
});
```

### User Notification Settings:

Future enhancement - allow users to control:
- Email notifications on/off
- Push notifications on/off
- Which types of notifications they want
- Notification frequency (instant/hourly/daily)
- Quiet hours

Access via: `notification_settings` table

---

## 🎨 UI Customization

The NotificationBell uses your existing design system:
- `glass-effect` class for glassmorphism
- `custom-scrollbar` for styled scrollbars
- Tailwind colors and animations
- Framer Motion for smooth transitions

Customize colors in `NotificationBell.jsx`:
```javascript
const iconClass = priority === 'urgent'
  ? 'text-red-400'   // Change these colors
  : priority === 'high'
  ? 'text-orange-400'
  : 'text-blue-400';
```

---

## 📱 Real-time Features

Notifications update in **real-time** using Supabase subscriptions:

```javascript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`,
  }, () => {
    loadNotifications(); // Refresh notifications
  })
  .subscribe();
```

Users see new notifications instantly without refreshing!

---

## ✅ Testing Checklist

After deployment, test these scenarios:

### Database Triggers:
- [ ] Generate a blog post → Check if notification appears
- [ ] Generate posts until queue has 2 left → Check "queue low" notification
- [ ] Generate last post → Check "queue empty" notification
- [ ] Create new user account → Check if admin gets notified

### UI Features:
- [ ] Click bell icon → Dropdown opens
- [ ] Unread count badge shows correct number
- [ ] Click notification → Marks as read & navigates to page
- [ ] Click "Mark all read" → All notifications marked
- [ ] Delete notification → Removes from list
- [ ] Real-time test: Open 2 browser windows, trigger notification in one, see it appear in other

### Mobile:
- [ ] Bell icon visible on mobile
- [ ] Dropdown scrollable on small screens
- [ ] Touch targets large enough (44px minimum)

---

## 🐛 Troubleshooting

### Notifications not appearing?

1. **Check if migration ran successfully**:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'notifications'
);
-- Should return: true
```

2. **Check if triggers exist**:
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'blog_content_queue';
-- Should show: on_blog_queue_status_change
```

3. **Check browser console** for errors

4. **Check Supabase logs** for trigger execution

### Unread count not updating?

- Check if Supabase Realtime is enabled for your project
- Check browser network tab for websocket connection
- Try hard refresh: Ctrl+Shift+R

### Email notifications not working?

- Verify Resend API key in `.env.local`
- Check Resend dashboard for delivery status
- Verify `from` email is verified in Resend

---

## 🚀 Future Enhancements

### Phase 3 (Optional):
- [ ] Push notifications (browser API)
- [ ] Notification preferences page
- [ ] Notification grouping (e.g., "5 new users today")
- [ ] Notification history page (/app/notifications)
- [ ] Export notification logs
- [ ] Slack/Discord webhook integration
- [ ] SMS notifications (via Twilio)

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify database migration ran successfully
4. Test notifications manually using SQL:

```sql
-- Test notification manually
SELECT create_notification(
  'YOUR_USER_ID',
  'system_alert',
  'Test Notification',
  'This is a test notification',
  '/app/admin',
  'normal',
  NULL
);
```

---

**System is ready to deploy! Run the migration and build to activate. 🎉**
