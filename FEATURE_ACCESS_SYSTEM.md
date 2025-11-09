# Feature Access Control System

## Overview
Implemented a subscription-based feature access control system that restricts features based on user's plan.

## Files Created

### 1. `src/hooks/useSubscription.js`
Hook to get user's current subscription and plan details.

**Returns:**
- `subscription` - Full subscription object
- `plan` - Plan details
- `loading` - Loading state
- `isActive` - Is subscription active
- `isPremium`, `isPro`, `isElite`, `isFree` - Plan type booleans
- `refresh()` - Function to reload subscription

### 2. `src/hooks/useFeatureAccess.js`
Hook to check feature access based on subscription plan.

**Returns:**
- `hasAccess(featureName)` - Check if user has access to a feature
- `canUse(featureName, currentUsage)` - Check if user can still use a limited feature
- `getRemainingUsage(featureName, currentUsage)` - Get remaining usage count
- `hasAds` - Boolean: should show ads
- `features` - All features for current plan
- `planKey` - Current plan key ('free', 'premium', 'pro', 'elite')
- `planName` - Display name of plan

### 3. `src/components/AdBanner.jsx`
Ad banner component shown to free users.

**Features:**
- Auto-shows for free users
- Dismissible (will return on next session)
- Promotes upgrade to premium
- Shows discount offer

## Plan Features

### Free Plan
```javascript
{
  // Basic features
  basicDashboard: true,
  quickLog: true,
  progressTracking: true,

  // Limitations
  hasAds: true,                    // ✅ Shows ads
  maxMealPlansPerMonth: 2,         // Only 2 meal plans per month
  maxWorkoutsPerMonth: 2,          // Only 2 workouts per month
  aiChatMessages: 10,              // Only 10 AI chat messages
  advancedAnalytics: false,        // ❌ No advanced analytics
  wearableIntegration: false,      // ❌ No wearable sync
  photoRecognition: false,         // ❌ No food photo recognition
  nutritionistAccess: false,       // ❌ No nutritionist access
  downloadReports: false,          // ❌ Can't download reports
  customGoals: false,              // ❌ Can't set custom goals
  prioritySupport: false,          // ❌ No priority support
}
```

### Premium Plan ($9.99/mo)
```javascript
{
  // All free features
  basicDashboard: true,
  quickLog: true,
  progressTracking: true,

  // Premium perks
  hasAds: false,                   // ✅ No ads!
  maxMealPlansPerMonth: -1,        // ✅ Unlimited meal plans
  maxWorkoutsPerMonth: -1,         // ✅ Unlimited workouts
  aiChatMessages: -1,              // ✅ Unlimited AI chat
  advancedAnalytics: true,         // ✅ Advanced analytics
  downloadReports: true,           // ✅ Download reports
  customGoals: true,               // ✅ Custom goals

  // Still locked
  wearableIntegration: false,
  photoRecognition: false,
  nutritionistAccess: false,
  prioritySupport: false,
}
```

### Pro Plan ($19.99/mo)
```javascript
{
  // All premium features +
  wearableIntegration: true,       // ✅ Sync with Apple Watch, Fitbit, etc.
  nutritionistAccess: true,        // ✅ Message nutritionists
  prioritySupport: true,           // ✅ Priority support
  mealPlanHistory: true,           // ✅ View all past meal plans
  workoutHistory: true,            // ✅ View all past workouts
  biometricTracking: true,         // ✅ Track biometrics

  // Still locked
  photoRecognition: false,
}
```

### Elite Plan ($29.99/mo)
```javascript
{
  // All pro features +
  photoRecognition: true,          // ✅ Take photo of food for instant nutrition
  personalCoach: true,             // ✅ Dedicated personal coach
  videoConsultations: true,        // ✅ Video calls with experts
  dnaAnalysis: true,               // ✅ DNA-based nutrition
  premiumRecipes: true,            // ✅ Premium recipe database
  aiNutritionOptimization: true,   // ✅ AI nutrition optimization
}
```

## Usage Examples

### Check if user can access a feature:
```javascript
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const MyComponent = () => {
  const { hasAccess, hasAds } = useFeatureAccess();

  if (!hasAccess('advancedAnalytics')) {
    return <UpgradePrompt feature="Advanced Analytics" />;
  }

  return (
    <div>
      {hasAds && <AdBanner />}
      <AdvancedAnalytics />
    </div>
  );
};
```

### Check usage limits:
```javascript
const { canUse, getRemainingUsage } = useFeatureAccess();

const [mealPlansThisMonth, setMealPlansThisMonth] = useState(1);

const handleGenerateMealPlan = () => {
  if (!canUse('maxMealPlansPerMonth', mealPlansThisMonth)) {
    // Show upgrade prompt
    showUpgradeDialog('Meal Plan Limit Reached');
    return;
  }

  // Generate meal plan
  generateMealPlan();
  setMealPlansThisMonth(prev => prev + 1);
};

const remaining = getRemainingUsage('maxMealPlansPerMonth', mealPlansThisMonth);
// -1 = unlimited, 0+ = remaining count
```

### Show plan badge:
```javascript
const { planName } = useFeatureAccess();

<Badge>{planName} Plan</Badge>
```

## Current Implementation

### ✅ Implemented:
1. **Subscription tracking** - Knows what plan user has
2. **Feature access control** - Can check if user has access to features
3. **Ad display** - Shows ads to free users in dashboard
4. **Plan badge** - Shows plan name in dashboard
5. **Usage limits** - Defined limits for free users

### 🔄 Ready to Implement:
1. Add usage limit checks to AI Meal Plan Generator
2. Add usage limit checks to AI Workout Planner
3. Add usage limit checks to AI Chat
4. Lock advanced analytics for free users
5. Lock wearable integration for premium users
6. Lock photo recognition for pro users

## How to Extend

### Add a new feature:
1. Add it to `PLAN_FEATURES` in `src/hooks/useFeatureAccess.js`
2. Define which plans have access
3. Use `hasAccess('featureName')` to check

### Add usage tracking:
1. Store usage count in database (e.g., `user_monthly_usage` table)
2. Fetch count in component
3. Use `canUse('featureName', currentCount)` to check
4. Show remaining with `getRemainingUsage('featureName', currentCount)`

## Database

Currently uses:
- `user_subscriptions` - Active subscriptions
- `subscription_plans` - Plan definitions

Will need:
- `user_monthly_usage` (future) - Track usage per month for limits
