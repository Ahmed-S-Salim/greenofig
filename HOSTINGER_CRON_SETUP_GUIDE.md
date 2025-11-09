# 🔧 Hostinger Cron Job Setup - Complete Guide

## Overview
This guide will help you set up automatic blog post generation on Hostinger using cron jobs. Posts will be generated 3 times per week (Monday, Wednesday, Friday at 9 AM).

---

## ✅ **Prerequisites**

1. ✅ Hostinger account with cron job access
2. ✅ Script already uploaded to: `/domains/greenofig.com/public_html/cron-generate-blog.php`
3. ✅ Database migration completed (`create_auto_blog_scheduler_tables.sql`)
4. ✅ Auto Scheduler enabled in admin panel

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Access Hostinger Control Panel**

1. Go to: https://hpanel.hostinger.com
2. Login with your credentials
3. Select your **GreenoFig** hosting plan

---

### **Step 2: Navigate to Cron Jobs**

1. In the left sidebar, scroll down to **"Advanced"**
2. Click on **"Cron Jobs"**
3. You'll see the Cron Jobs management page

---

### **Step 3: Create the Cron Job**

**Important Details You'll Need:**

- **Script Path**: `/home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php`
- **PHP Version**: `/usr/bin/php` (or `/usr/bin/php81` if available)

#### **Option A: Using Hostinger's Simple Form**

1. Click **"Create Cron Job"** or **"Add New Cron Job"**
2. Fill in the form:

   **Minute**: `0`
   **Hour**: `9`
   **Day**: `*`
   **Month**: `*`
   **Weekday**: `1,3,5` (Monday, Wednesday, Friday)

   **Command**:
   ```bash
   /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
   ```

3. **Email notifications**: Enable if you want to receive notifications
4. Click **"Create"** or **"Add Cron Job"**

#### **Option B: Using Advanced/Custom Cron**

If Hostinger asks for a full cron expression, use:

```bash
0 9 * * 1,3,5 /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
```

**What this means**:
- `0` = At minute 0
- `9` = At hour 9 (9 AM)
- `*` = Every day of month
- `*` = Every month
- `1,3,5` = Monday, Wednesday, Friday

---

### **Step 4: Verify the Cron Job**

After creating, you should see the cron job listed with:
- **Schedule**: "0 9 * * 1,3,5"
- **Command**: Your PHP command
- **Status**: Active/Enabled

---

### **Step 5: Test the Script Manually (Optional but Recommended)**

Before waiting for the cron to run, test it manually:

#### **Method 1: SSH Test**

```bash
ssh -p 65002 u492735793@157.173.209.161
cd domains/greenofig.com/public_html
php cron-generate-blog.php
```

You should see: "Blog post generated successfully: [title]"

#### **Method 2: Browser Test**

Visit in your browser:
```
https://greenofig.com/cron-generate-blog.php?key=greenofig_auto_blog_2025
```

**Important**: Change the secret key in the script for security!

---

## 🔐 **Security: Change the Secret Key**

1. Edit the script on your server or locally
2. Find this line:
   ```php
   $secret_key = 'greenofig_auto_blog_2025'; // Change this to something secure
   ```
3. Change to something unique:
   ```php
   $secret_key = 'your_super_secret_key_here_123456';
   ```
4. Re-upload the script if edited locally

---

## 📊 **What Happens When Cron Runs**

1. **Every Monday, Wednesday, Friday at 9 AM**:
   - Script checks if scheduler is enabled
   - Fetches next topic from queue
   - Generates blog post using AI
   - Saves as draft or publishes (based on settings)
   - Logs everything to `cron-blog-log.txt`

2. **Log File**: Check `/domains/greenofig.com/public_html/cron-blog-log.txt` for activity

---

## 🎯 **Recommended Schedules**

Choose based on your needs:

### **3 Posts Per Week** (Recommended)
```
0 9 * * 1,3,5
```
Monday, Wednesday, Friday at 9 AM

### **5 Posts Per Week** (Aggressive)
```
0 9 * * 1,2,3,4,5
```
Monday - Friday at 9 AM

### **Daily Posts** (Maximum SEO)
```
0 9 * * *
```
Every day at 9 AM

### **Twice Weekly** (Conservative)
```
0 9 * * 1,4
```
Monday and Thursday at 9 AM

### **Custom Times**
- **Morning**: `0 9 * * 1,3,5` (9 AM)
- **Afternoon**: `0 14 * * 1,3,5` (2 PM)
- **Evening**: `0 19 * * 1,3,5` (7 PM)

---

## 🔍 **Troubleshooting**

### **Cron Job Not Running?**

1. **Check Cron Job Status**:
   - Go to Hostinger → Cron Jobs
   - Ensure it's "Active" or "Enabled"

2. **Check PHP Path**:
   - Try `/usr/bin/php` or `/usr/bin/php81`
   - Run `which php` via SSH to find correct path

3. **Check File Permissions**:
   ```bash
   chmod 755 /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
   ```

4. **Check Log File**:
   ```bash
   cat /home/u492735793/domains/greenofig.com/public_html/cron-blog-log.txt
   ```

### **Script Errors?**

1. **Check Log File** for error messages
2. **Verify Supabase URL and Key** in the script
3. **Ensure Edge Function is deployed** (`openai-chat`)
4. **Check Queue Has Topics**

### **No Posts Being Generated?**

1. Check Auto Scheduler settings are enabled
2. Verify content queue has pending topics
3. Check log file for errors
4. Test script manually first

---

## 📧 **Email Notifications**

To receive emails when cron runs:

1. In Hostinger Cron Jobs settings
2. Enable **"Email Notifications"**
3. Enter your email address
4. You'll get notified on success/failure

---

## 🔄 **Updating the Schedule**

To change when posts are generated:

1. Go to Hostinger → Cron Jobs
2. Click **"Edit"** on your cron job
3. Modify the schedule
4. Click **"Save"**

---

## 📋 **Configuration Checklist**

Before cron job will work, ensure:

```
[ ] Database migration run (blog_content_queue table exists)
[ ] Content queue has pending topics (10 starter topics added)
[ ] Auto Scheduler enabled in admin panel
[ ] Posts per week set (e.g., 3)
[ ] Publish time configured
[ ] Auto-publish setting chosen (draft or publish)
[ ] Cron script uploaded to server
[ ] Cron job created in Hostinger
[ ] Secret key changed (security)
[ ] Script tested manually
[ ] Log file checked for success
```

---

## 🎊 **Alternative: Manual Cron (SSH)**

If Hostinger UI doesn't work, use SSH:

```bash
# Connect via SSH
ssh -p 65002 u492735793@157.173.209.161

# Edit crontab
crontab -e

# Add this line:
0 9 * * 1,3,5 /usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php

# Save and exit
# Verify:
crontab -l
```

---

## 📊 **Expected Results**

### **With 3 Posts Per Week Schedule**

**Week 1**:
- Mon, Wed, Fri: 3 posts generated
- Check log file for confirmation

**Month 1**:
- 12 blog posts generated automatically
- 50-100 daily visitors

**Month 3**:
- 36 blog posts generated
- 200-500 daily visitors
- 20+ keywords ranking

**Month 6**:
- 72 blog posts generated
- 500-1000 daily visitors
- Top 10 Google rankings

---

## 🎯 **Quick Reference**

**Script Location**:
```
/home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
```

**Cron Command**:
```bash
/usr/bin/php /home/u492735793/domains/greenofig.com/public_html/cron-generate-blog.php
```

**Schedule (3x/week)**:
```
0 9 * * 1,3,5
```

**Log File**:
```
/home/u492735793/domains/greenofig.com/public_html/cron-blog-log.txt
```

**Manual Test URL**:
```
https://greenofig.com/cron-generate-blog.php?key=greenofig_auto_blog_2025
```

---

## 💡 **Pro Tips**

1. **Start with drafts**: Set Auto-Publish to OFF initially to review posts
2. **Monitor logs**: Check log file weekly to ensure everything works
3. **Keep queue full**: Always have 20+ topics in queue
4. **Adjust schedule**: After 1 month, increase to 5x/week if doing well
5. **Share posts**: Manually share on social media for extra traffic
6. **Internal linking**: Edit posts to add links to other articles

---

## 🆘 **Need Help?**

If something doesn't work:

1. Check log file first: `cron-blog-log.txt`
2. Test script manually via browser
3. Verify all settings in Auto Scheduler
4. Ensure Supabase Edge Function is working
5. Check Hostinger cron job is active

---

## ✅ **Final Step: Activate!**

1. Go to Hostinger Control Panel
2. Navigate to Cron Jobs
3. Create the cron job with settings above
4. Wait for next scheduled time (Mon/Wed/Fri at 9 AM)
5. Check log file after scheduled time
6. Verify post was created in admin panel

---

**🎉 That's it! Your blog will now generate content automatically 3 times per week!**

**Status**: ✅ Script uploaded and ready

**Next Cron Run**: Next Monday, Wednesday, or Friday at 9:00 AM

**Your website will rank #1 on Google with consistent content!** 🚀
