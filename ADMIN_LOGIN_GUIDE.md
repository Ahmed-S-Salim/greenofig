# 🔐 Admin Login Guide - Greenofig

## Admin Credentials

Use these credentials to log in as an administrator:

```
Email: admin@greenofig.com
Password: admin123
```

---

## 🌐 Access Your App

### **GitHub Pages (Free, Live)**
**Main URL:** https://ahmed-s-salim.github.io/greenofig/

**Direct Pages:**
- **Home/Dashboard:** https://ahmed-s-salim.github.io/greenofig/#/dashboard-home
- **Authentication (Login):** https://ahmed-s-salim.github.io/greenofig/#/authentication-screen
- **Meals:** https://ahmed-s-salim.github.io/greenofig/#/meal-planning
- **Workout:** https://ahmed-s-salim.github.io/greenofig/#/workout-programs
- **Profile:** https://ahmed-s-salim.github.io/greenofig/#/profile-screen
- **Admin Settings:** https://ahmed-s-salim.github.io/greenofig/#/admin-settings-screen

---

## 📱 How to Login on Your Phone

### **Step 1: Open the App**
1. On your phone, open your browser (Safari, Chrome, etc.)
2. Go to: **https://ahmed-s-salim.github.io/greenofig/**
3. Wait for the app to load (should take 5-10 seconds)

### **Step 2: Navigate to Login**
You'll see the authentication screen automatically if you're not logged in, or:
1. Look for the "Sign In" button on the home screen
2. Tap it to go to the login page

### **Step 3: Enter Admin Credentials**
1. **Email field:** Type `admin@greenofig.com`
2. **Password field:** Type `admin123`
3. Tap the **"Sign In"** or **"Login"** button

### **Step 4: You're In!**
After successful login, you'll see:
- ✅ Your name changed from "Guest" to your profile name
- ✅ Full access to all features (meals, workouts, profile)
- ✅ **"Admin Panel"** button (red button on the dashboard)
- ✅ Role badge showing your admin status

---

## 🎯 Admin Features

Once logged in as admin, you can:

### **1. Access Admin Panel**
- Look for the red **"Admin Panel"** button on the dashboard
- Tap it to access admin-only settings

### **2. Navigate All Pages**
Use the bottom navigation bar to switch between:
- 🏠 **Home** - Dashboard with health overview
- 🍽️ **Meals** - Meal planning and nutrition tracking
- 💪 **Workout** - Exercise programs and fitness tracking
- 👤 **Profile** - User settings and preferences

### **3. Quick Actions**
- Tap the **floating + button** for quick actions:
  - Add a meal
  - Log a workout
  - Scan food with AI

---

## 🔄 All Available Routes in the App

Here's every page you can access (for testing):

### **Main Pages (With Bottom Navigation)**
- `/dashboard-home` - Home dashboard
- `/meal-planning` - Meal planning page
- `/workout-programs` - Workout programs page
- `/profile-screen` - User profile page

### **Authentication**
- `/authentication-screen` - Login/Sign-up page
- `/login-screen` - Alternative login screen

### **Admin Only**
- `/admin-settings-screen` - Admin control panel

### **Other Features**
- `/ai-food-scanner` - AI-powered food scanning
- `/ai-health-coach-chat` - Chat with AI health coach
- `/meal-search-screen` - Search for meals
- `/progress-tracking` - Track your progress
- `/measurement-tracking` - Body measurements
- `/leaderboard-screen` - Competition leaderboard
- `/premium-subscription-plans` - Premium plans
- `/subscription-management` - Manage subscriptions
- `/profile-settings` - Edit profile settings
- `/health-device-integration` - Connect health devices
- `/device-integration-screen` - Device settings
- `/onboarding-flow` - First-time user onboarding
- `/welcome-screen` - Welcome page
- `/introduction-screen` - App introduction
- `/splash-screen` - Splash screen

---

## 📋 Testing Checklist

After logging in, test these features:

- [ ] ✅ Login with admin credentials works
- [ ] ✅ Bottom navigation works (Home, Meals, Workout, Profile)
- [ ] ✅ Admin Panel button appears and is clickable
- [ ] ✅ Role badge shows "Admin" or similar
- [ ] ✅ Floating + button opens quick add modal
- [ ] ✅ All pages load without errors
- [ ] ✅ Can navigate back and forth between pages
- [ ] ✅ Pull to refresh works on dashboard
- [ ] ✅ Data displays correctly on each page

---

## 🐛 Troubleshooting

### **Problem: Pages show loading spinner forever**
**Solution:**
- This was fixed! The base href issue has been resolved
- Clear your browser cache and reload
- Wait 2-3 minutes after deployment for GitHub Pages to update

### **Problem: Login button doesn't work**
**Solution:**
- Make sure you entered the exact email: `admin@greenofig.com`
- Password is case-sensitive: `admin123` (all lowercase)
- Check that you have internet connection

### **Problem: Admin Panel button doesn't appear**
**Solution:**
- Make sure you're logged in with admin credentials
- Check the dashboard page (home screen)
- Look for a red button with "Admin Panel" text

### **Problem: Bottom navigation not working**
**Solution:**
- This has been tested and works on all main pages
- Try refreshing the page
- Make sure JavaScript is enabled in your browser

### **Problem: 404 Error on GitHub Pages**
**Solution:**
- Wait 2-3 minutes - GitHub Pages takes time to update
- Make sure you enabled GitHub Pages in repository settings
- Go to: https://github.com/Ahmed-S-Salim/greenofig/settings/pages
- Select: **gh-pages** branch, **/ (root)** folder

---

## 🎨 What You'll See as Admin

### **Dashboard (Home)**
- Welcome message with your name
- Role badge showing "Admin" or "Premium User"
- Red "Admin Panel" button
- Calorie progress tracker
- Streak & achievements
- Active challenges (10K steps, water intake, etc.)
- Recent meals with AI confidence scores
- Upcoming workouts
- Quick add button (+) for fast logging

### **Meals Page**
- Search and browse meals
- Add custom meals
- Track nutrition (calories, protein, carbs, fat)
- AI food scanner integration
- Meal history

### **Workout Page**
- Browse workout programs
- Track exercises
- Monitor progress
- Schedule workouts
- Exercise library

### **Profile Page**
- Edit profile information
- View achievements and badges
- Settings and preferences
- Device integrations
- Subscription status

---

## 📞 Getting Help

If you encounter any errors:

1. **Take a screenshot** of the error message
2. **Note which page** you were on (check the URL)
3. **Share the error details** - our enhanced error widget now shows detailed error messages
4. **Try refreshing** the page first

The app now has improved error handling that will show you exactly what went wrong!

---

## 🚀 Quick Start (Mobile)

**Fastest way to test on your phone:**

1. Open: https://ahmed-s-salim.github.io/greenofig/
2. Login: `admin@greenofig.com` / `admin123`
3. Tap around the bottom navigation: Home → Meals → Workout → Profile
4. Find the red "Admin Panel" button on Home screen
5. Test the floating + button

---

## 💡 Tips

- **Add to Home Screen:** On mobile, you can "Add to Home Screen" to use it like a native app
- **Offline Mode:** The app uses service workers for offline caching
- **Desktop Testing:** Works on desktop too - just open the URL in any browser
- **Navigation:** The app uses hash routing (/#/page) which works perfectly on GitHub Pages

---

**Your app is now live and fully functional! 🎉**

All pages have navigation, admin features are enabled, and the app is deployed for free on GitHub Pages.

---

**Last Updated:** Authentication fixed - login now works!
**Status:** ✅ Live and working - Login fully functional
**Hosting:** GitHub Pages (100% Free Forever)

---

## ✅ FIXED: Login Now Works!

The login system has been updated to use a simple authentication service that works without a backend.

**You can now:**
- ✅ Login with admin@greenofig.com / admin123
- ✅ See your name displayed as "Admin User"
- ✅ Access the red "Admin Panel" button
- ✅ Navigate between all pages (Home, Meals, Workout, Profile)
- ✅ Stay logged in while using the app
