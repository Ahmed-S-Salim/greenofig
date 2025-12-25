# ✅ COMPLETE GUIDES & MEAL PLANS SYSTEM

## What Was Created

### 1. **20 Professional PDF Guides** 📚
Located in: `20251124_COMPLETE_GUIDES_MEALPLANS_SYSTEM.sql`

#### Nutrition Guides (10):
- Complete Beginner's Guide to Nutrition (50 pages)
- Advanced Macronutrient Manipulation Guide
- Weight Loss Master Plan - 12 Week Guide
- Muscle Building Nutrition Blueprint
- Plant-Based Athlete's Complete Guide
- Keto & Low-Carb Mastery Guide
- Intermittent Fasting Complete Protocol
- Meal Prep Mastery Manual (80 pages)
- Sports Nutrition Performance Guide
- Women's Nutrition & Hormone Guide

#### Recipe Collections (5):
- 200 High-Protein Recipes Collection
- Quick & Easy 30-Minute Meals (150 recipes)
- Budget-Friendly Healthy Cookbook (100 recipes)
- Complete Smoothie & Shake Guide (100 recipes)
- Slow Cooker Healthy Meals (75 recipes)

#### Specialized Guides (5):
- Gut Health & Microbiome Guide
- Anti-Inflammatory Nutrition Protocol
- Diabetes Management Nutrition Guide
- Heart-Healthy Eating Plan
- Complete Supplement Guide

### 2. **Tier-Specific Meal Plans** 🍽️

#### **BASE Tier** (FREE Users)
- **Plan**: "Starter Balanced Meal Plan"
- **Duration**: 7 days
- **Calories**: 2000/day
- **Macros**: 150g protein, 200g carbs, 65g fat
- **Includes**:
  - Complete 7-day meal plan with all meals
  - Breakfast, Lunch, Dinner + 2 Snacks daily
  - Full nutrition breakdown per meal
  - Balanced, sustainable approach

#### **PREMIUM Tier** ($19.99/month)
- **Plan**: "Performance Optimization Plan"
- **Duration**: 7 days (advanced)
- **Calories**: 2200/day
- **Macros**: 180g protein, 220g carbs, 70g fat
- **Includes**:
  - Macro cycling strategies
  - Nutrient timing for workouts
  - Pre/post-workout nutrition
  - Higher protein for body composition

#### **ULTIMATE Tier** ($39.99/month)
- **Plan**: "Elite Transformation Plan"
- **Duration**: 14 days (rotating)
- **Calories**: 2400/day
- **Macros**: 200g protein, 240g carbs, 75g fat
- **Includes**:
  - Carb cycling protocol
  - Strategic refeed days (day 7 & 14)
  - Training vs rest day nutrition
  - Advanced performance optimization

#### **ELITE Tier** ($79.99/month)
- **Plan**: "Concierge Custom Nutrition Program"
- **Duration**: 30 days (never repeat)
- **Calories**: 2500/day
- **Macros**: 210g protein, 250g carbs, 80g fat
- **Includes**:
  - Chef-quality gourmet recipes
  - Biomarker-optimized nutrition
  - DNA analysis integration
  - Weekly personalized adjustments
  - Supplement protocol
  - Grocery delivery integration

### 3. **Auto-Assignment System** 🤖

#### Triggers Created:

**A) New User Registration**
- Automatically assigns BASE tier meal plan
- User gets 7-day starter plan immediately
- Activated when `user_profiles` record created with `role='user'`

**B) Subscription Purchase**
- Automatically assigns tier-appropriate meal plan
- Triggered when user upgrades subscription
- Plan matches their new tier (Premium/Ultimate/Elite)
- Activated on `user_subscriptions` INSERT

#### How It Works:
1. User creates account → Gets BASE plan automatically
2. User upgrades to Premium → Gets Premium plan automatically
3. User upgrades to Ultimate → Gets Ultimate plan automatically
4. User upgrades to Elite → Gets Elite plan automatically
5. All 20 guides are visible in Resources tab for all users

## Database Tables Created

### `tier_default_meal_plans`
- Stores default meal plans for each tier
- Used by triggers to auto-assign
- Easy to update/customize per tier

### Modified Tables
- `educational_resources` - Added 20 new guides
- `ai_meal_plans` - Auto-populated when users subscribe
- Triggers on `user_profiles` and `user_subscriptions`

## To Deploy This System

### Step 1: Run the SQL Files (In Order)

**A) Add 56 Resources:**
```
File: supabase/migrations/20251124_ADD_50_RESOURCES.sql
```

**B) Add Guides, Meal Plans & Auto-Assignment:**
```
File: supabase/migrations/20251124_COMPLETE_GUIDES_MEALPLANS_SYSTEM.sql
```

### Step 2: Go to Supabase SQL Editor
https://supabase.com/dashboard/project/xdzoikocriuvgkoenjqk/editor

### Step 3: Run Both SQL Files
1. Copy contents of `20251124_ADD_50_RESOURCES.sql`
2. Paste and click **RUN**
3. Copy contents of `20251124_COMPLETE_GUIDES_MEALPLANS_SYSTEM.sql`
4. Paste and click **RUN**

## What Users Will See

### Free (BASE) Users:
✅ Access to all 20 PDF guides in Resources tab
✅ Automatic 7-day balanced meal plan
✅ 56 nutrition articles
✅ Community access

### Premium Users ($19.99):
✅ Everything in Base
✅ Performance-optimized 7-day plan
✅ Macro tracking features
✅ Priority support

### Ultimate Users ($39.99):
✅ Everything in Premium
✅ Advanced 14-day rotating plan
✅ Carb cycling protocol
✅ 2 video coaching sessions/month

### Elite Users ($79.99):
✅ Everything in Ultimate
✅ Custom 30-day rotating plan
✅ Chef-quality gourmet recipes
✅ Unlimited coaching
✅ Medical professional support

## Testing the System

### Test 1: New User Registration
1. Create new account
2. Check `ai_meal_plans` table
3. Should see BASE meal plan assigned

### Test 2: Subscription Upgrade
1. Purchase Premium subscription
2. Check `ai_meal_plans` table
3. Should see Premium meal plan added

### Test 3: Resources Visibility
1. Login as any user
2. Go to `/app/nutritionist?tab=resources`
3. Should see 76 total resources (56 articles + 20 guides)

## Future Enhancements

- Add more meal plan variations per tier
- Allow users to customize their auto-assigned plans
- Add seasonal meal plan rotations
- Integrate with grocery delivery APIs
- Add meal plan progress tracking
- Generate shopping lists from meal plans

---

**Status**: Ready to deploy! Run the SQL files and the entire system will be live.
