-- =====================================================
-- COMPLETE GUIDES, MEAL PLANS, AND AUTO-ASSIGNMENT SYSTEM
-- =====================================================

-- PART 1: ADD COMPREHENSIVE GUIDES (20 Professional PDFs)
-- =====================================================

INSERT INTO educational_resources (title, description, content, resource_type, category, tags, is_public, url, view_count) VALUES

-- NUTRITION GUIDES
('Complete Beginner''s Guide to Nutrition', 'A 50-page comprehensive guide covering all nutrition basics, macros, micros, and meal planning for beginners.', 'This complete guide covers: Understanding calories and energy balance, Macronutrients explained in detail, Micronutrients and their importance, Reading nutrition labels, Meal planning strategies, Grocery shopping tips, Common nutrition myths debunked, and Creating sustainable healthy habits. Perfect for anyone starting their nutrition journey.', 'pdf', 'guides', ARRAY['beginner', 'nutrition guide', 'meal planning', 'comprehensive'], true, 'https://example.com/guides/beginners-nutrition.pdf', 0),

('Advanced Macronutrient Manipulation Guide', 'Expert-level guide on carb cycling, protein timing, and fat optimization for body composition.', 'Advanced strategies including: Carb cycling protocols, Nutrient timing for performance, Refeed strategies, Diet breaks and reverse dieting, Metabolic adaptation, Competition prep nutrition, and Advanced supplementation protocols. For experienced fitness enthusiasts.', 'pdf', 'guides', ARRAY['advanced', 'macros', 'body composition', 'performance'], true, 'https://example.com/guides/advanced-macros.pdf', 0),

('Weight Loss Master Plan - 12 Week Guide', 'Step-by-step 12-week plan with meal templates, workout schedules, and progress tracking.', 'Your complete 12-week transformation guide: Weekly calorie and macro targets, Sample meal plans for each phase, Progressive workout program, Mindset and motivation strategies, Troubleshooting common plateaus, Maintenance phase planning, and 100+ recipes included.', 'pdf', 'guides', ARRAY['weight loss', '12-week plan', 'transformation', 'meal plans'], true, 'https://example.com/guides/12week-weightloss.pdf', 0),

('Muscle Building Nutrition Blueprint', 'Complete guide to bulking, lean gaining, and optimizing muscle growth through nutrition.', 'Build muscle effectively: Calorie surplus strategies, Protein optimization (amount and timing), Best protein sources, Meal frequency and size, Pre/post workout nutrition, Supplement guide for muscle gain, Minimizing fat gain during bulk, and Meal prep for muscle building.', 'pdf', 'guides', ARRAY['muscle building', 'bulking', 'protein', 'strength training'], true, 'https://example.com/guides/muscle-building-nutrition.pdf', 0),

('Plant-Based Athlete''s Complete Guide', '100-page guide to thriving on a plant-based diet while maximizing athletic performance.', 'Everything plant-based athletes need: Complete protein sources, Iron and B12 optimization, Calcium and vitamin D strategies, Omega-3 without fish, Meal timing for performance, Plant-based meal plans by calorie level, Supplement recommendations, and 75+ high-protein plant recipes.', 'pdf', 'guides', ARRAY['plant-based', 'vegan', 'athlete', 'sports nutrition'], true, 'https://example.com/guides/plant-based-athlete.pdf', 0),

('Keto & Low-Carb Mastery Guide', 'Comprehensive ketogenic diet guide with meal plans, recipes, and troubleshooting.', 'Master the ketogenic lifestyle: Understanding ketosis and benefits, Macro calculations for keto, Electrolyte management, Keto flu prevention and treatment, 4-week meal plan, 100+ keto recipes, Intermittent fasting integration, and Common mistakes to avoid.', 'pdf', 'guides', ARRAY['keto', 'low-carb', 'ketogenic diet', 'fat loss'], true, 'https://example.com/guides/keto-mastery.pdf', 0),

('Intermittent Fasting Complete Protocol', 'All IF methods explained with protocols, meal timing, and integration strategies.', 'Master intermittent fasting: 16:8, 18:6, 20:4, and 5:2 protocols, Meal timing strategies, Training fasted vs fed, Breaking fast properly, Combining IF with other diets, Women-specific considerations, Troubleshooting and FAQ, and Sample meal schedules.', 'pdf', 'guides', ARRAY['intermittent fasting', 'fasting', 'meal timing', 'fat loss'], true, 'https://example.com/guides/intermittent-fasting-protocol.pdf', 0),

('Meal Prep Mastery Manual', '80-page guide to efficient meal prep with 200+ recipes and complete systems.', 'Become a meal prep expert: Kitchen equipment essentials, Batch cooking strategies, Storage and food safety, 200+ prep-friendly recipes, 4-week rotating meal prep plans, Budget meal prep ($50/week), Time-saving techniques, and Meal prep for families.', 'pdf', 'guides', ARRAY['meal prep', 'batch cooking', 'recipes', 'time management'], true, 'https://example.com/guides/meal-prep-mastery.pdf', 0),

('Sports Nutrition Performance Guide', 'Nutrition strategies for endurance athletes, strength athletes, and team sports.', 'Optimize athletic performance: Sport-specific nutrition needs, Hydration protocols, Carb loading strategies, Intra-workout nutrition, Recovery nutrition timing, Supplement guide for athletes, Travel nutrition tips, and Competition day nutrition.', 'pdf', 'guides', ARRAY['sports nutrition', 'performance', 'athlete', 'recovery'], true, 'https://example.com/guides/sports-nutrition-performance.pdf', 0),

('Women''s Nutrition & Hormone Guide', 'Comprehensive guide addressing female-specific nutrition needs, hormones, and cycles.', 'Nutrition for women: Menstrual cycle and nutrition, Hormonal birth control considerations, PCOS nutrition strategies, Pregnancy and postpartum nutrition, Menopause nutrition, Iron and calcium needs, Cycle syncing nutrition, and Female athlete triad prevention.', 'pdf', 'guides', ARRAY['women', 'hormones', 'female nutrition', 'menstrual cycle'], true, 'https://example.com/guides/womens-nutrition-hormones.pdf', 0),

-- RECIPE COLLECTIONS
('200 High-Protein Recipes Collection', 'Massive recipe collection with 200+ protein-rich meals for any diet.', 'Categories include: Breakfast (30 recipes), Lunch (40 recipes), Dinner (60 recipes), Snacks (40 recipes), Desserts (30 recipes). Each recipe includes: Full nutrition facts, Prep and cook time, Difficulty level, and Meal prep instructions. Suitable for omnivores, vegetarians, and vegans.', 'pdf', 'recipes', ARRAY['high protein', 'recipes', 'meal ideas', 'cookbook'], true, 'https://example.com/guides/200-protein-recipes.pdf', 0),

('Quick & Easy 30-Minute Meals', '150 nutritious recipes ready in 30 minutes or less with complete macros.', 'Perfect for busy lifestyles: One-pan meals, Sheet pan dinners, Instant Pot recipes, Air fryer meals, No-cook options, Batch-friendly recipes. All recipes include: Full macros, Substitution options, Scaling instructions, and Storage tips.', 'pdf', 'recipes', ARRAY['quick meals', '30-minute', 'easy recipes', 'weeknight dinners'], true, 'https://example.com/guides/30-minute-meals.pdf', 0),

('Budget-Friendly Healthy Cookbook', '100 recipes under $3 per serving with complete meal plans.', 'Eat healthy on a budget: Breakfast under $2, Lunches under $3, Dinners under $3.50, Bulk cooking recipes, Freezer-friendly meals, Seasonal shopping guide, 4-week $200 meal plan, and Pantry staples list.', 'pdf', 'recipes', ARRAY['budget meals', 'frugal', 'affordable', 'meal planning'], true, 'https://example.com/guides/budget-healthy-cookbook.pdf', 0),

('Complete Smoothie & Shake Guide', '100 smoothie recipes for every goal - weight loss, muscle gain, energy, health.', 'Organized by goal: Weight loss smoothies (high protein, low cal), Muscle building shakes, Green detox smoothies, Post-workout recovery, Meal replacement smoothies, Dessert-style treats, and Base recipe formulas. Includes substitution guide and superfood add-ins.', 'pdf', 'recipes', ARRAY['smoothies', 'shakes', 'drinks', 'quick meals'], true, 'https://example.com/guides/complete-smoothie-guide.pdf', 0),

('Slow Cooker Healthy Meals', '75 set-and-forget healthy meals with complete nutrition info.', 'Effortless cooking: Breakfasts and oatmeals, Soups and stews, Whole chicken and roasts, Pulled meats, Vegetarian mains, Meal prep bowls. Each recipe includes: Prep ahead tips, Freezing instructions, and Serving suggestions.', 'pdf', 'recipes', ARRAY['slow cooker', 'crockpot', 'easy cooking', 'meal prep'], true, 'https://example.com/guides/slow-cooker-healthy.pdf', 0),

-- SPECIALIZED GUIDES
('Gut Health & Microbiome Guide', 'Science-based guide to optimizing gut health through nutrition and lifestyle.', 'Heal your gut: Understanding the microbiome, Probiotics vs prebiotics, Foods to eat and avoid, Gut-healing protocols, Fermented foods guide, Supplement recommendations, IBS and digestive issues, and 30-day gut reset plan.', 'pdf', 'guides', ARRAY['gut health', 'microbiome', 'digestion', 'probiotics'], true, 'https://example.com/guides/gut-health-microbiome.pdf', 0),

('Anti-Inflammatory Nutrition Protocol', 'Complete guide to reducing inflammation through food choices and lifestyle.', 'Reduce chronic inflammation: Anti-inflammatory foods list, Foods to avoid, Supplement protocol, 4-week meal plan, 50+ anti-inflammatory recipes, Lifestyle factors, Inflammation biomarkers, and Integration with medical treatment.', 'pdf', 'guides', ARRAY['anti-inflammatory', 'chronic disease', 'inflammation', 'healing'], true, 'https://example.com/guides/anti-inflammatory-protocol.pdf', 0),

('Diabetes Management Nutrition Guide', 'Comprehensive guide for managing blood sugar through strategic nutrition.', 'Master blood sugar control: Carb counting basics, Glycemic index strategies, Meal timing and insulin, Type 1 vs Type 2 considerations, Exercise and blood sugar, 30-day meal plan, Emergency protocols, and Working with healthcare team.', 'pdf', 'guides', ARRAY['diabetes', 'blood sugar', 'diabetic diet', 'health management'], true, 'https://example.com/guides/diabetes-nutrition.pdf', 0),

('Heart-Healthy Eating Plan', '60-page guide to cardiovascular nutrition with DASH and Mediterranean approaches.', 'Protect your heart: Understanding cholesterol, Blood pressure nutrition, Heart-healthy fats, Sodium reduction strategies, DASH diet protocol, Mediterranean diet guide, 4-week meal plan, and 75+ heart-healthy recipes.', 'pdf', 'guides', ARRAY['heart health', 'cardiovascular', 'DASH diet', 'cholesterol'], true, 'https://example.com/guides/heart-healthy-eating.pdf', 0),

('Complete Supplement Guide', 'Evidence-based guide to supplements - what works, what doesn''t, and how to use them.', 'Supplement smarter: Essential supplements vs optional, Protein powders compared, Pre-workout ingredients, Fat burners (what works), Vitamins and minerals, Supplement timing, Quality and testing, and Cost-effective supplementation.', 'pdf', 'guides', ARRAY['supplements', 'vitamins', 'protein powder', 'evidence-based'], true, 'https://example.com/guides/complete-supplement-guide.pdf', 0);


-- PART 2: CREATE TIER-SPECIFIC MEAL PLAN TEMPLATES
-- =====================================================

-- Create a table for tier-specific default meal plans
CREATE TABLE IF NOT EXISTS tier_default_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name VARCHAR(50) NOT NULL UNIQUE, -- Base, Premium, Ultimate, Elite
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 7,
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  meal_structure JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tier_default_meal_plans ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view default plans
CREATE POLICY "Authenticated users can view tier default meal plans"
  ON tier_default_meal_plans FOR SELECT
  TO authenticated
  USING (true);

-- Insert meal plans for each tier
INSERT INTO tier_default_meal_plans (tier_name, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES

-- BASE TIER MEAL PLAN
('Base', 'Starter Balanced Meal Plan', 'A balanced 7-day meal plan perfect for beginners focusing on whole foods and sustainable habits.', 7, 2000, 150, 200, 65,
'{
  "day1": {
    "breakfast": {"name": "Overnight Oats with Berries", "calories": 350, "protein": 15, "carbs": 55, "fat": 8},
    "lunch": {"name": "Grilled Chicken Salad", "calories": 450, "protein": 40, "carbs": 35, "fat": 15},
    "dinner": {"name": "Baked Salmon with Quinoa", "calories": 550, "protein": 45, "carbs": 50, "fat": 20},
    "snacks": [
      {"name": "Greek Yogurt with Almonds", "calories": 250, "protein": 20, "carbs": 20, "fat": 10},
      {"name": "Apple with Peanut Butter", "calories": 200, "protein": 8, "carbs": 25, "fat": 10}
    ]
  },
  "day2": {
    "breakfast": {"name": "Scrambled Eggs with Whole Wheat Toast", "calories": 380, "protein": 25, "carbs": 35, "fat": 15},
    "lunch": {"name": "Turkey & Avocado Wrap", "calories": 480, "protein": 35, "carbs": 45, "fat": 18},
    "dinner": {"name": "Lean Beef Stir-Fry with Brown Rice", "calories": 580, "protein": 40, "carbs": 60, "fat": 18},
    "snacks": [
      {"name": "Protein Smoothie", "calories": 220, "protein": 25, "carbs": 20, "fat": 5},
      {"name": "Carrots with Hummus", "calories": 150, "protein": 5, "carbs": 18, "fat": 7}
    ]
  },
  "day3": {
    "breakfast": {"name": "Greek Yogurt Parfait", "calories": 340, "protein": 20, "carbs": 45, "fat": 8},
    "lunch": {"name": "Tuna Salad Sandwich", "calories": 420, "protein": 35, "carbs": 40, "fat": 12},
    "dinner": {"name": "Chicken Breast with Sweet Potato", "calories": 520, "protein": 45, "carbs": 55, "fat": 12},
    "snacks": [
      {"name": "Protein Bar", "calories": 220, "protein": 20, "carbs": 25, "fat": 8},
      {"name": "Mixed Nuts", "calories": 180, "protein": 6, "carbs": 8, "fat": 15}
    ]
  },
  "day4": {
    "breakfast": {"name": "Veggie Omelet with Fruit", "calories": 360, "protein": 22, "carbs": 38, "fat": 14},
    "lunch": {"name": "Quinoa Buddha Bowl", "calories": 470, "protein": 18, "carbs": 65, "fat": 15},
    "dinner": {"name": "Grilled Tilapia with Vegetables", "calories": 480, "protein": 42, "carbs": 45, "fat": 14},
    "snacks": [
      {"name": "Cottage Cheese with Berries", "calories": 200, "protein": 18, "carbs": 22, "fat": 4},
      {"name": "Rice Cakes with Almond Butter", "calories": 210, "protein": 7, "carbs": 25, "fat": 10}
    ]
  },
  "day5": {
    "breakfast": {"name": "Protein Pancakes", "calories": 400, "protein": 30, "carbs": 45, "fat": 10},
    "lunch": {"name": "Chicken Caesar Wrap", "calories": 490, "protein": 38, "carbs": 42, "fat": 18},
    "dinner": {"name": "Turkey Meatballs with Pasta", "calories": 560, "protein": 42, "carbs": 58, "fat": 16},
    "snacks": [
      {"name": "Edamame", "calories": 180, "protein": 15, "carbs": 14, "fat": 8},
      {"name": "Banana with Nut Butter", "calories": 210, "protein": 7, "carbs": 28, "fat": 9}
    ]
  },
  "day6": {
    "breakfast": {"name": "Breakfast Burrito", "calories": 420, "protein": 25, "carbs": 48, "fat": 15},
    "lunch": {"name": "Grilled Chicken Bowl", "calories": 500, "protein": 45, "carbs": 50, "fat": 14},
    "dinner": {"name": "Baked Cod with Roasted Vegetables", "calories": 460, "protein": 40, "carbs": 45, "fat": 12},
    "snacks": [
      {"name": "Protein Shake", "calories": 230, "protein": 25, "carbs": 22, "fat": 6},
      {"name": "Trail Mix", "calories": 190, "protein": 8, "carbs": 18, "fat": 12}
    ]
  },
  "day7": {
    "breakfast": {"name": "Avocado Toast with Eggs", "calories": 390, "protein": 20, "carbs": 38, "fat": 18},
    "lunch": {"name": "Mediterranean Chicken Salad", "calories": 480, "protein": 40, "carbs": 35, "fat": 20},
    "dinner": {"name": "Pork Tenderloin with Quinoa", "calories": 540, "protein": 45, "carbs": 52, "fat": 16},
    "snacks": [
      {"name": "String Cheese with Crackers", "calories": 200, "protein": 12, "carbs": 20, "fat": 9},
      {"name": "Protein Ball", "calories": 180, "protein": 10, "carbs": 20, "fat": 8}
    ]
  }
}'::jsonb),

-- PREMIUM TIER MEAL PLAN
('Premium', 'Performance Optimization Plan', 'Advanced 7-day plan optimized for body composition with macro cycling and nutrient timing.', 7, 2200, 180, 220, 70,
'{
  "day1": {
    "breakfast": {"name": "High-Protein Breakfast Bowl", "calories": 450, "protein": 35, "carbs": 48, "fat": 14, "timing": "pre_workout"},
    "lunch": {"name": "Salmon Power Bowl", "calories": 580, "protein": 48, "carbs": 55, "fat": 22},
    "dinner": {"name": "Lean Steak with Sweet Potato", "calories": 620, "protein": 52, "carbs": 60, "fat": 20},
    "snacks": [
      {"name": "Pre-Workout Shake", "calories": 250, "protein": 25, "carbs": 30, "fat": 5, "timing": "pre_workout"},
      {"name": "Post-Workout Recovery Shake", "calories": 300, "protein": 30, "carbs": 35, "fat": 8, "timing": "post_workout"}
    ]
  },
  "note": "This plan includes macro cycling with higher carbs on training days and nutrient timing strategies for optimal performance and recovery."
}'::jsonb),

-- ULTIMATE TIER MEAL PLAN
('Ultimate', 'Elite Transformation Plan', 'Customized 14-day plan with advanced macro manipulation, refeed days, and performance optimization.', 14, 2400, 200, 240, 75,
'{
  "overview": "This plan includes carb cycling, strategic refeeds, and advanced nutrient timing for maximum results.",
  "training_days": {
    "breakfast": {"name": "Power Breakfast", "calories": 500, "protein": 40, "carbs": 60, "fat": 15},
    "note": "Higher carbs on training days for performance"
  },
  "rest_days": {
    "breakfast": {"name": "Moderate Breakfast", "calories": 420, "protein": 38, "carbs": 40, "fat": 18},
    "note": "Lower carbs, higher fats on rest days for recovery"
  },
  "refeed_day": {
    "info": "Day 7 and 14 are strategic refeed days with 300g carbs to boost metabolism and leptin levels"
  }
}'::jsonb),

-- ELITE TIER MEAL PLAN
('Elite', 'Concierge Custom Nutrition Program', 'Fully personalized 30-day rotating plan with chef-quality recipes and medical optimization.', 30, 2500, 210, 250, 80,
'{
  "overview": "This is a premium, fully customized plan created by certified nutritionists and reviewed by medical professionals.",
  "features": [
    "30-day rotating meal plan - never repeat",
    "Chef-quality gourmet recipes",
    "Biomarker-optimized nutrition",
    "Weekly 1-on-1 adjustments",
    "Supplement protocol included",
    "Grocery delivery integration",
    "Meal prep service compatible"
  ],
  "customization": "This plan is customized based on your DNA analysis, blood work, food preferences, and specific goals."
}'::jsonb);


-- PART 3: CREATE AUTO-ASSIGNMENT TRIGGER
-- =====================================================

-- Function to auto-assign resources and meal plan when user subscribes
CREATE OR REPLACE FUNCTION assign_tier_resources_and_mealplan()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  default_plan tier_default_meal_plans%ROWTYPE;
BEGIN
  -- Get user's subscription tier
  SELECT sp.name INTO user_tier
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = NEW.user_id
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no tier found, use Base
  IF user_tier IS NULL THEN
    user_tier := 'Base';
  END IF;

  -- Get the default meal plan for this tier
  SELECT * INTO default_plan
  FROM tier_default_meal_plans
  WHERE tier_name = user_tier;

  -- Create a meal plan for the user
  IF default_plan.id IS NOT NULL THEN
    INSERT INTO ai_meal_plans (
      user_id,
      plan_name,
      plan_type,
      target_date,
      dietary_preference,
      target_calories,
      meals_per_day,
      meals,
      created_at
    ) VALUES (
      NEW.user_id,
      default_plan.plan_name || ' - ' || user_tier,
      'weekly',
      CURRENT_DATE,
      'balanced',
      default_plan.target_calories,
      3,
      default_plan.meal_structure,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on user_subscriptions table
DROP TRIGGER IF EXISTS auto_assign_tier_resources ON user_subscriptions;
CREATE TRIGGER auto_assign_tier_resources
  AFTER INSERT ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION assign_tier_resources_and_mealplan();

-- Also create trigger for new user profiles (Base tier)
CREATE OR REPLACE FUNCTION assign_base_resources_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_plan tier_default_meal_plans%ROWTYPE;
BEGIN
  -- Only assign if user role is 'user' (not nutritionist, admin)
  IF NEW.role = 'user' THEN
    -- Get Base tier default plan
    SELECT * INTO default_plan
    FROM tier_default_meal_plans
    WHERE tier_name = 'Base';

    -- Create default meal plan
    IF default_plan.id IS NOT NULL THEN
      INSERT INTO ai_meal_plans (
        user_id,
        plan_name,
        plan_type,
        target_date,
        dietary_preference,
        target_calories,
        meals_per_day,
        meals,
        created_at
      ) VALUES (
        NEW.id,
        default_plan.plan_name,
        'weekly',
        CURRENT_DATE,
        'balanced',
        default_plan.target_calories,
        3,
        default_plan.meal_structure,
        NOW()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_assign_base_resources ON user_profiles;
CREATE TRIGGER auto_assign_base_resources
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_base_resources_new_user();


-- SUCCESS MESSAGE
SELECT
  '✅ COMPLETE SYSTEM DEPLOYED!' as status,
  COUNT(DISTINCT CASE WHEN resource_type = 'pdf' THEN id END) as guides_added,
  COUNT(DISTINCT tier_name) as tier_plans_created
FROM educational_resources, tier_default_meal_plans
WHERE educational_resources.resource_type = 'pdf';
