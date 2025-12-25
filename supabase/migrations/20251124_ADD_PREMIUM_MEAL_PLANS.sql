-- =====================================================
-- ADD 6 ADDITIONAL MEAL PLANS FOR EACH PAID TIER
-- Premium: 6 plans, Ultimate: 6 plans, Elite: 6 plans
-- Total: 18 new meal plan templates
-- =====================================================

-- Extend tier_default_meal_plans to support multiple plans per tier
-- Add a plan_variant column to distinguish between different plans for same tier
ALTER TABLE tier_default_meal_plans DROP CONSTRAINT IF EXISTS tier_default_meal_plans_tier_name_key;
ALTER TABLE tier_default_meal_plans ADD COLUMN IF NOT EXISTS plan_variant VARCHAR(100) DEFAULT 'standard';
CREATE UNIQUE INDEX IF NOT EXISTS idx_tier_plan_variant ON tier_default_meal_plans(tier_name, plan_variant);

-- =====================================================
-- PREMIUM TIER - 6 ADDITIONAL MEAL PLANS
-- =====================================================

-- Premium Plan 1: High Protein Weight Loss
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Premium', 'high_protein_weight_loss', 'High Protein Weight Loss Plan', 'Aggressive fat loss with 40% protein, moderate carbs, optimized for muscle preservation.', 7, 1800, 180, 135, 60,
'{
  "goal": "Fat loss with muscle preservation",
  "protein_percentage": 40,
  "training_focus": "Strength training 4-5x/week",
  "day1": {
    "breakfast": {"name": "Protein Egg White Scramble", "calories": 320, "protein": 45, "carbs": 20, "fat": 8},
    "lunch": {"name": "Grilled Chicken Breast Salad", "calories": 420, "protein": 50, "carbs": 28, "fat": 12},
    "dinner": {"name": "Baked Cod with Asparagus", "calories": 380, "protein": 48, "carbs": 25, "fat": 10},
    "snacks": [
      {"name": "Protein Shake", "calories": 240, "protein": 40, "carbs": 15, "fat": 3},
      {"name": "Greek Yogurt", "calories": 180, "protein": 20, "carbs": 18, "fat": 2}
    ]
  },
  "notes": "Meal timing: Breakfast 7am, Lunch 12pm, Snack 3pm, Dinner 6pm, Evening snack 8pm"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Premium Plan 2: Carb Cycling Performance
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Premium', 'carb_cycling', 'Carb Cycling Performance Plan', 'Strategic carb cycling: high carbs on training days, low carbs on rest days.', 7, 2200, 165, 220, 75,
'{
  "goal": "Body recomposition with performance optimization",
  "cycle_type": "Training vs Rest Day",
  "training_days": {
    "calories": 2400,
    "protein": 165,
    "carbs": 280,
    "fat": 65,
    "sample_day": {
      "breakfast": {"name": "Oatmeal with Protein", "calories": 450, "protein": 30, "carbs": 65, "fat": 10},
      "pre_workout": {"name": "Rice Cakes with Honey", "calories": 180, "protein": 4, "carbs": 40, "fat": 1},
      "post_workout": {"name": "Chicken & Rice Bowl", "calories": 650, "protein": 55, "carbs": 85, "fat": 12},
      "dinner": {"name": "Salmon with Quinoa", "calories": 580, "protein": 48, "carbs": 60, "fat": 18},
      "snacks": [{"name": "Fruit & Protein Bar", "calories": 280, "protein": 20, "carbs": 40, "fat": 6}]
    }
  },
  "rest_days": {
    "calories": 2000,
    "protein": 180,
    "carbs": 120,
    "fat": 95,
    "sample_day": {
      "breakfast": {"name": "Eggs & Avocado", "calories": 420, "protein": 28, "carbs": 15, "fat": 28},
      "lunch": {"name": "Steak Salad", "calories": 520, "protein": 52, "carbs": 22, "fat": 28},
      "dinner": {"name": "Grilled Chicken Thighs", "calories": 580, "protein": 58, "carbs": 30, "fat": 26},
      "snacks": [
        {"name": "Nuts & Cheese", "calories": 260, "protein": 18, "carbs": 12, "fat": 18},
        {"name": "Protein Shake", "calories": 220, "protein": 35, "carbs": 10, "fat": 5}
      ]
    }
  }
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Premium Plan 3: Lean Muscle Building
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Premium', 'lean_bulk', 'Lean Muscle Building Plan', 'Controlled calorie surplus for clean muscle gain with minimal fat accumulation.', 7, 2600, 195, 300, 75,
'{
  "goal": "Lean muscle gain",
  "surplus": "+300-400 calories above maintenance",
  "training": "Progressive overload strength training",
  "day1": {
    "breakfast": {"name": "High-Calorie Oatmeal Bowl", "calories": 520, "protein": 35, "carbs": 70, "fat": 12},
    "mid_morning": {"name": "Protein Smoothie", "calories": 380, "protein": 30, "carbs": 48, "fat": 8},
    "lunch": {"name": "Double Chicken Rice Bowl", "calories": 720, "protein": 62, "carbs": 85, "fat": 16},
    "pre_workout": {"name": "Banana & Peanut Butter", "calories": 280, "protein": 10, "carbs": 42, "fat": 10},
    "post_workout": {"name": "Protein Shake with Dextrose", "calories": 350, "protein": 40, "carbs": 50, "fat": 3},
    "dinner": {"name": "Salmon with Sweet Potato", "calories": 620, "protein": 48, "carbs": 65, "fat": 18},
    "evening": {"name": "Casein Shake", "calories": 230, "protein": 30, "carbs": 12, "fat": 6}
  },
  "notes": "Eat every 2.5-3 hours, focus on whole foods, track weight weekly"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Premium Plan 4: Intermittent Fasting 16:8
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Premium', 'intermittent_fasting', 'Intermittent Fasting 16:8 Plan', '16-hour fast, 8-hour eating window optimized for fat loss and metabolic health.', 7, 2000, 170, 180, 70,
'{
  "goal": "Fat loss with metabolic optimization",
  "fasting_window": "8pm - 12pm (next day)",
  "eating_window": "12pm - 8pm",
  "protocol": "16:8 intermittent fasting",
  "typical_day": {
    "12pm_first_meal": {
      "name": "Breaking Fast Meal",
      "meal": "Grilled Chicken Salad with Avocado",
      "calories": 580,
      "protein": 52,
      "carbs": 35,
      "fat": 25,
      "notes": "Break fast with balanced meal, not too heavy"
    },
    "3pm_snack": {
      "name": "Protein Snack",
      "meal": "Greek Yogurt with Berries",
      "calories": 280,
      "protein": 30,
      "carbs": 32,
      "fat": 6
    },
    "6pm_main_meal": {
      "name": "Main Dinner",
      "meal": "Salmon with Quinoa and Vegetables",
      "calories": 720,
      "protein": 58,
      "carbs": 68,
      "fat": 26
    },
    "7:45pm_final_meal": {
      "name": "Last Meal Before Fast",
      "meal": "Protein Shake with Nut Butter",
      "calories": 420,
      "protein": 45,
      "carbs": 35,
      "fat": 15,
      "notes": "Consume before 8pm window closes"
    }
  },
  "fasting_tips": [
    "Drink water, black coffee, or tea during fasting",
    "Train in fasted state or late afternoon",
    "BCAAs optional during fasted training",
    "Stay busy during morning fasting hours"
  ]
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Premium Plan 5: Keto Performance
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Premium', 'keto', 'Keto Performance Plan', 'Ketogenic diet optimized for performance: under 50g carbs, high healthy fats.', 7, 2100, 140, 40, 165,
'{
  "goal": "Ketosis for fat loss and mental clarity",
  "macros": "5% carbs, 25% protein, 70% fat",
  "ketone_target": "1.5-3.0 mmol/L",
  "day1": {
    "breakfast": {"name": "Keto Bulletproof Coffee + Eggs", "calories": 480, "protein": 24, "carbs": 4, "fat": 42},
    "lunch": {"name": "Avocado Chicken Salad", "calories": 620, "protein": 42, "carbs": 12, "fat": 48},
    "dinner": {"name": "Ribeye Steak with Butter Broccoli", "calories": 720, "protein": 52, "carbs": 10, "fat": 58},
    "snacks": [
      {"name": "Macadamia Nuts", "calories": 200, "protein": 3, "carbs": 4, "fat": 22},
      {"name": "Cheese & Pepperoni", "calories": 180, "protein": 14, "carbs": 2, "fat": 14}
    ]
  },
  "electrolytes": {
    "sodium": "5000mg daily",
    "potassium": "3000mg daily",
    "magnesium": "400mg daily",
    "note": "Critical for preventing keto flu"
  },
  "allowed_foods": ["Meat", "Fish", "Eggs", "Cheese", "Nuts", "Avocado", "Leafy greens", "Healthy oils"],
  "avoid_foods": ["Bread", "Pasta", "Rice", "Sugar", "Most fruits", "Starchy vegetables"]
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Premium Plan 6: Plant-Based Athlete
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Premium', 'plant_based', 'Plant-Based Athlete Plan', 'High-performance vegan meal plan with complete proteins and optimal nutrition.', 7, 2300, 155, 280, 70,
'{
  "goal": "Athletic performance on plant-based diet",
  "protein_sources": ["Tofu", "Tempeh", "Seitan", "Legumes", "Quinoa", "Hemp seeds"],
  "day1": {
    "breakfast": {"name": "Protein Oatmeal with Hemp Seeds", "calories": 480, "protein": 28, "carbs": 68, "fat": 14},
    "lunch": {"name": "Tempeh Buddha Bowl", "calories": 620, "protein": 42, "carbs": 75, "fat": 18},
    "dinner": {"name": "Lentil Pasta with Tofu Marinara", "calories": 680, "protein": 48, "carbs": 88, "fat": 16},
    "snacks": [
      {"name": "Protein Smoothie with Pea Protein", "calories": 320, "protein": 35, "carbs": 38, "fat": 6},
      {"name": "Edamame & Hummus", "calories": 260, "protein": 18, "carbs": 28, "fat": 10}
    ]
  },
  "supplementation": {
    "required": ["B12", "Vitamin D", "Omega-3 (algae-based)"],
    "recommended": ["Iron", "Zinc", "Iodine"],
    "optional": ["Creatine", "Beta-alanine"]
  },
  "protein_combining": "Combine legumes + grains for complete amino acid profile"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;


-- =====================================================
-- ULTIMATE TIER - 6 ADDITIONAL MEAL PLANS
-- =====================================================

-- Ultimate Plan 1: Advanced Carb Cycling
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Ultimate', 'advanced_carb_cycling', 'Advanced Carb Cycling Protocol', '4-day rotation: 2 high, 1 moderate, 1 low carb days with strategic refeeds.', 14, 2400, 200, 240, 75,
'{
  "goal": "Maximum body recomposition",
  "cycle": "High/High/Moderate/Low - repeat",
  "refeed_days": [7, 14],
  "high_carb_days": {
    "calories": 2600,
    "protein": 200,
    "carbs": 325,
    "fat": 60,
    "training": "Heavy compound lifts",
    "sample": {
      "breakfast": {"name": "Pancakes with Protein", "calories": 520, "protein": 38, "carbs": 75, "fat": 10},
      "lunch": {"name": "Teriyaki Chicken & Rice", "calories": 720, "protein": 58, "carbs": 90, "fat": 14},
      "dinner": {"name": "Pasta with Lean Turkey", "calories": 680, "protein": 52, "carbs": 88, "fat": 12}
    }
  },
  "low_carb_days": {
    "calories": 2000,
    "protein": 220,
    "carbs": 100,
    "fat": 95,
    "training": "Active recovery or rest",
    "sample": {
      "breakfast": {"name": "Egg White Omelet", "calories": 380, "protein": 48, "carbs": 12, "fat": 18},
      "lunch": {"name": "Tuna Avocado Bowl", "calories": 520, "protein": 58, "carbs": 18, "fat": 28},
      "dinner": {"name": "Chicken Thighs with Greens", "calories": 580, "protein": 62, "carbs": 15, "fat": 32}
    }
  },
  "refeed_protocol": {
    "calories": 3200,
    "protein": 200,
    "carbs": 500,
    "fat": 50,
    "purpose": "Leptin boost, glycogen replenishment, psychological break",
    "foods": "Focus on clean carbs: rice, pasta, potatoes, fruits"
  }
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Ultimate Plan 2: Competition Prep
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Ultimate', 'competition_prep', 'Competition Prep Protocol', 'Contest-ready nutrition: aggressive fat loss with muscle preservation for physique competition.', 14, 1900, 220, 150, 50,
'{
  "goal": "Stage-ready conditioning",
  "phase": "Final 12 weeks prep",
  "weeks_out": 12,
  "protein_priority": "2.2g per kg bodyweight minimum",
  "daily_structure": {
    "meal1": {"time": "7am", "name": "Egg Whites & Oats", "calories": 320, "protein": 42, "carbs": 35, "fat": 5},
    "meal2": {"time": "10am", "name": "Chicken & Rice", "calories": 380, "protein": 48, "carbs": 40, "fat": 6},
    "meal3": {"time": "1pm", "name": "Tilapia & Asparagus", "calories": 280, "protein": 52, "carbs": 15, "fat": 4},
    "meal4_pre": {"time": "4pm", "name": "Pre-Workout Shake", "calories": 220, "protein": 35, "carbs": 25, "fat": 2},
    "meal5_post": {"time": "6pm", "name": "Post-Workout Chicken", "calories": 420, "protein": 58, "carbs": 42, "fat": 6},
    "meal6": {"time": "9pm", "name": "Casein & Veggies", "calories": 280, "protein": 48, "carbs": 12, "fat": 8}
  },
  "water_protocol": "1-2 gallons daily, reduce 3 days out",
  "sodium_manipulation": "Normal until 4 days out, then deplete",
  "cardio": "2x daily: fasted AM + post-workout",
  "refeed_schedule": "Every 7-10 days to preserve metabolism"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Ultimate Plan 3: Metabolic Reset
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Ultimate', 'metabolic_reset', 'Metabolic Reset & Reverse Diet', 'Gradually increase calories to restore metabolism after prolonged dieting.', 14, 2400, 180, 270, 80,
'{
  "goal": "Restore metabolic rate after diet",
  "starting_calories": 1800,
  "ending_calories": 2600,
  "weekly_increase": 200,
  "duration_weeks": 8,
  "week1-2": {
    "calories": 2000,
    "protein": 180,
    "carbs": 200,
    "fat": 70,
    "notes": "First small increase, monitor weight daily"
  },
  "week3-4": {
    "calories": 2200,
    "protein": 180,
    "carbs": 240,
    "fat": 75,
    "notes": "Add carbs primarily, slight fat increase"
  },
  "week5-6": {
    "calories": 2400,
    "protein": 180,
    "carbs": 270,
    "fat": 80,
    "notes": "Continue gradual carb increase"
  },
  "monitoring": {
    "weight": "Should stay stable or slight increase (1-2lbs max)",
    "energy": "Should improve significantly",
    "strength": "Should increase in gym",
    "hunger": "Should normalize"
  },
  "meal_timing": "Spread calories evenly, focus on whole foods"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Ultimate Plan 4: Endurance Athlete Fueling
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Ultimate', 'endurance', 'Endurance Athlete Fueling Plan', 'High-carb nutrition for marathon, triathlon, and endurance training.', 7, 3200, 160, 480, 90,
'{
  "goal": "Sustained energy for endurance training",
  "sport_focus": ["Marathon", "Triathlon", "Cycling", "Swimming"],
  "carb_loading_days": {
    "calories": 3500,
    "protein": 160,
    "carbs": 550,
    "fat": 75,
    "timing": "3 days before race/long training"
  },
  "training_day": {
    "pre_workout_2hr": {"meal": "Oatmeal with Banana", "calories": 420, "carbs": 80},
    "during_workout": {"fuel": "Sports drink + gels", "carbs_per_hour": 60},
    "post_workout_30min": {"meal": "Recovery shake + fruit", "calories": 450, "carbs": 75, "protein": 25},
    "main_meals": [
      {"name": "Pasta with Chicken", "calories": 820, "protein": 52, "carbs": 115, "fat": 18},
      {"name": "Rice Bowl with Salmon", "calories": 780, "protein": 48, "carbs": 105, "fat": 22}
    ]
  },
  "hydration": {
    "daily": "3-4 liters minimum",
    "during_training": "500-1000ml per hour",
    "electrolytes": "Sodium 500-700mg per hour"
  },
  "recovery_focus": "High carbs immediately post-workout, protein within 2 hours"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Ultimate Plan 5: Women's Hormone Optimization
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Ultimate', 'womens_hormones', 'Women''s Hormone Optimization Plan', 'Nutrition synchronized with menstrual cycle for optimal hormone balance.', 28, 2100, 150, 220, 75,
'{
  "goal": "Hormone balance and cycle-synced nutrition",
  "cycle_phases": {
    "follicular_phase": {
      "days": "1-14",
      "calories": 2000,
      "carbs": 200,
      "fat": 70,
      "focus": "Higher carbs, moderate fat, support estrogen",
      "foods": ["Flax seeds", "Fermented foods", "Cruciferous vegetables"]
    },
    "ovulation": {
      "days": "14-16",
      "calories": 2100,
      "carbs": 220,
      "fat": 75,
      "focus": "Highest carbs, support peak energy",
      "foods": ["Berries", "Dark chocolate", "Leafy greens"]
    },
    "luteal_phase": {
      "days": "17-28",
      "calories": 2200,
      "carbs": 180,
      "fat": 90,
      "focus": "Higher fat, lower carbs, support progesterone",
      "foods": ["Avocado", "Nuts", "Pumpkin seeds", "Sweet potato"]
    },
    "menstruation": {
      "days": "1-5",
      "calories": 2100,
      "carbs": 200,
      "fat": 80,
      "iron": "20mg+ daily",
      "focus": "Iron-rich foods, anti-inflammatory",
      "foods": ["Red meat", "Spinach", "Lentils", "Vitamin C foods"]
    }
  },
  "supplementation": ["Iron", "Magnesium", "B-complex", "Omega-3", "Vitamin D"],
  "avoid": ["Excess caffeine in luteal phase", "High sugar", "Processed foods"]
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Ultimate Plan 6: Bodybuilding Offseason
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Ultimate', 'bodybuilding_offseason', 'Bodybuilding Offseason Mass Gain', 'High-calorie muscle building for serious bodybuilders in growth phase.', 7, 3500, 250, 425, 105,
'{
  "goal": "Maximum muscle growth",
  "surplus": "+500-700 calories",
  "training_split": "Push/Pull/Legs 2x per week",
  "daily_meals": {
    "meal1_7am": {"name": "Massive Breakfast", "calories": 720, "protein": 52, "carbs": 88, "fat": 18},
    "meal2_10am": {"name": "Mid-Morning Shake", "calories": 520, "protein": 45, "carbs": 68, "fat": 12},
    "meal3_1pm": {"name": "Lunch Feast", "calories": 820, "protein": 62, "carbs": 95, "fat": 22},
    "meal4_4pm": {"name": "Pre-Workout", "calories": 420, "protein": 35, "carbs": 58, "fat": 8},
    "meal5_post": {"name": "Post-Workout", "calories": 580, "protein": 55, "carbs": 75, "fat": 10},
    "meal6_8pm": {"name": "Dinner", "calories": 780, "protein": 58, "carbs": 88, "fat": 24},
    "meal7_11pm": {"name": "Before Bed", "calories": 380, "protein": 48, "carbs": 22, "fat": 14}
  },
  "intra_workout": "Carbs + EAAs during training",
  "weight_gain_target": "2-3 lbs per month",
  "deload_weeks": "Every 4-6 weeks, reduce volume not nutrition"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;


-- =====================================================
-- ELITE TIER - 6 ADDITIONAL MEAL PLANS
-- =====================================================

-- Elite Plan 1: Personalized DNA-Based Nutrition
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Elite', 'dna_optimized', 'DNA-Optimized Nutrition Protocol', 'Personalized plan based on genetic testing for optimal macros and food selection.', 30, 2500, 200, 260, 85,
'{
  "goal": "Genetically optimized nutrition",
  "testing_required": "DNA analysis for nutrient metabolism genes",
  "genetic_factors": {
    "carb_tolerance": "Based on PPARG, TCF7L2 genes",
    "fat_metabolism": "Based on APOA2, FTO genes",
    "lactose_tolerance": "MCM6 gene",
    "caffeine_metabolism": "CYP1A2 gene",
    "vitamin_d_needs": "VDR gene",
    "folate_needs": "MTHFR gene"
  },
  "personalization": {
    "macros": "Adjusted based on carb/fat metabolism genes",
    "meal_timing": "Aligned with circadian rhythm genes",
    "supplements": "Targeted based on genetic deficiencies",
    "food_selection": "Optimized for nutrient absorption genes"
  },
  "biomarker_tracking": [
    "Blood glucose patterns",
    "Lipid panels",
    "Inflammation markers",
    "Vitamin/mineral levels",
    "Hormone panels"
  ],
  "adjustments": "Weekly based on biomarker feedback and progress"
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Elite Plan 2: Medical-Grade Metabolic Optimization
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Elite', 'medical_metabolic', 'Medical-Grade Metabolic Optimization', 'Physician-supervised nutrition for optimal metabolic health and longevity.', 30, 2300, 180, 230, 85,
'{
  "goal": "Metabolic health and longevity",
  "medical_oversight": "Monthly doctor consultations included",
  "lab_monitoring": {
    "frequency": "Monthly comprehensive panels",
    "markers": [
      "Fasting glucose & insulin",
      "HbA1c",
      "Lipid panel (LDL, HDL, triglycerides)",
      "CRP (inflammation)",
      "Homocysteine",
      "Vitamin D, B12",
      "Thyroid panel",
      "Sex hormones"
    ]
  },
  "nutrition_interventions": {
    "time_restricted_eating": "12-14 hour overnight fast",
    "mediterranean_base": "Primary dietary pattern",
    "anti_inflammatory": "Focus on polyphenol-rich foods",
    "gut_health": "Prebiotic and probiotic foods daily",
    "glycemic_control": "Low-GI carbohydrate selection"
  },
  "supplementation_protocol": {
    "core": ["Omega-3", "Vitamin D3", "Magnesium", "Probiotic"],
    "conditional": "Based on blood work deficiencies",
    "pharmaceutical_grade": "Only highest quality supplements"
  },
  "longevity_focus": [
    "Calorie restriction mimetics",
    "Autophagy promotion",
    "mTOR modulation",
    "Inflammation reduction"
  ]
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Elite Plan 3: Executive Performance Nutrition
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Elite', 'executive_performance', 'Executive Performance Nutrition', 'Optimized for cognitive performance, stress management, and busy executive lifestyle.', 30, 2400, 170, 240, 90,
'{
  "goal": "Peak cognitive and physical performance",
  "lifestyle": "High-stress executive, frequent travel",
  "cognitive_optimization": {
    "brain_foods": ["Fatty fish", "Blueberries", "Walnuts", "Dark chocolate", "Green tea"],
    "nootropic_stack": ["Omega-3 DHA", "Phosphatidylserine", "Lion''s Mane", "Bacopa"],
    "meal_timing": "Aligned with meeting schedule and circadian rhythm"
  },
  "stress_management_nutrition": {
    "adaptogenic_herbs": ["Ashwagandha", "Rhodiola", "Holy basil"],
    "magnesium_rich": "Evening intake for sleep and stress",
    "b_vitamins": "Support neurotransmitter production",
    "avoid": "Excess caffeine after 2pm, alcohol before important events"
  },
  "meal_prep_service": {
    "included": "Private chef meal delivery",
    "customization": "Based on weekly schedule and preferences",
    "convenience": "Grab-and-go options for busy days"
  },
  "performance_tracking": {
    "cognitive_tests": "Monthly assessments",
    "sleep_quality": "Tracked via wearable",
    "stress_biomarkers": "Quarterly cortisol testing",
    "hrv_monitoring": "Daily heart rate variability"
  }
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Elite Plan 4: Concierge Recovery & Healing
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Elite', 'recovery_healing', 'Concierge Recovery & Healing Protocol', 'Medical nutrition therapy for injury recovery, surgery prep/recovery, or chronic condition management.', 30, 2200, 180, 200, 90,
'{
  "goal": "Accelerated healing and recovery",
  "medical_team": "Physician, nutritionist, physical therapist coordination",
  "healing_phases": {
    "acute_inflammation": {
      "days": "1-5",
      "focus": "Anti-inflammatory, easy to digest",
      "calories": 2000,
      "protein": 160,
      "key_nutrients": ["Omega-3", "Vitamin C", "Zinc", "Collagen"]
    },
    "proliferation": {
      "days": "6-21",
      "focus": "Tissue repair, increased protein",
      "calories": 2200,
      "protein": 200,
      "key_nutrients": ["Protein", "Vitamin A", "Copper", "Glutamine"]
    },
    "remodeling": {
      "days": "21+",
      "focus": "Strength rebuilding, balanced nutrition",
      "calories": 2400,
      "protein": 180,
      "key_nutrients": ["Calcium", "Vitamin D", "Magnesium", "Collagen"]
    }
  },
  "therapeutic_foods": {
    "anti_inflammatory": ["Turmeric", "Ginger", "Berries", "Fatty fish"],
    "collagen_building": ["Bone broth", "Collagen peptides", "Vitamin C foods"],
    "gut_healing": ["Bone broth", "Fermented foods", "Glutamine", "Aloe vera"]
  },
  "supplement_protocol": {
    "phase_specific": "Adjusted based on healing phase",
    "pharmaceutical_grade": "Only medical-grade supplements",
    "monitored": "Blood work every 2 weeks"
  }
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Elite Plan 5: Athletic Peak Performance
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Elite', 'athletic_peak', 'Elite Athletic Peak Performance', 'Professional athlete nutrition with sports nutritionist, timing protocols, and supplementation.', 30, 3200, 220, 400, 95,
'{
  "goal": "Elite athletic performance",
  "athlete_type": "Professional or high-level competitive",
  "team": {
    "sports_nutritionist": "Weekly consultations",
    "strength_coach": "Coordination on training nutrition",
    "sports_physician": "Medical oversight",
    "chef": "Custom meal preparation"
  },
  "periodization": {
    "off_season": {
      "calories": 3500,
      "protein": 220,
      "carbs": 450,
      "fat": 105,
      "goal": "Muscle building"
    },
    "pre_season": {
      "calories": 3200,
      "protein": 220,
      "carbs": 400,
      "fat": 95,
      "goal": "Performance optimization"
    },
    "in_season": {
      "calories": 3400,
      "protein": 220,
      "carbs": 425,
      "fat": 100,
      "goal": "Maintain performance, recovery"
    },
    "competition_week": {
      "specific": "Individualized based on sport and athlete"
    }
  },
  "supplement_stack": {
    "performance": ["Creatine", "Beta-alanine", "Citrulline", "Caffeine"],
    "recovery": ["Protein", "BCAAs", "Glutamine", "Tart cherry"],
    "health": ["Omega-3", "Vitamin D", "Magnesium", "Probiotics"],
    "testing": "Regular screening for banned substances"
  },
  "nutrient_timing": {
    "precision": "Minute-by-minute timing around training",
    "intra_workout": "Sport-specific fuel protocols",
    "recovery_window": "Immediate post-exercise nutrition"
  }
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;

-- Elite Plan 6: Longevity & Anti-Aging
INSERT INTO tier_default_meal_plans (tier_name, plan_variant, plan_name, description, duration_days, target_calories, target_protein_g, target_carbs_g, target_fat_g, meal_structure) VALUES
('Elite', 'longevity', 'Longevity & Anti-Aging Protocol', 'Science-based nutrition for healthspan extension, cellular health, and biological age optimization.', 30, 2100, 160, 180, 95,
'{
  "goal": "Maximize healthspan and longevity",
  "scientific_basis": ["Caloric restriction mimetics", "Autophagy promotion", "NAD+ optimization", "Sirtuin activation"],
  "eating_pattern": {
    "time_restricted": "16:8 daily",
    "periodic_fasting": "24-hour fast weekly",
    "fmd": "Fasting mimicking diet quarterly",
    "calorie_restriction": "15% below maintenance without malnutrition"
  },
  "longevity_foods": {
    "polyphenols": ["Green tea", "Dark chocolate", "Berries", "Extra virgin olive oil"],
    "cruciferous": ["Broccoli", "Cauliflower", "Brussels sprouts"],
    "omega3_rich": ["Wild salmon", "Sardines", "Walnuts"],
    "fermented": ["Kimchi", "Sauerkraut", "Kefir"],
    "minimize": ["Processed foods", "Added sugars", "Excess animal protein"]
  },
  "longevity_supplements": {
    "nad_boosters": ["NMN or NR", "Niacin"],
    "sirtuin_activators": ["Resveratrol", "Pterostilbene"],
    "senolytics": ["Fisetin", "Quercetin"],
    "mtor_modulators": ["Berberine", "Metformin (prescription)"],
    "foundational": ["Omega-3", "Vitamin D", "Magnesium"]
  },
  "biomarker_optimization": {
    "tracked_monthly": [
      "Biological age tests",
      "Telomere length",
      "Inflammatory markers",
      "Metabolic health",
      "Cognitive function"
    ]
  },
  "lifestyle_integration": {
    "sleep": "8 hours minimum",
    "exercise": "Zone 2 cardio + strength training",
    "stress": "Daily meditation/mindfulness",
    "social": "Strong social connections"
  }
}'::jsonb)
ON CONFLICT (tier_name, plan_variant) DO UPDATE SET meal_structure = EXCLUDED.meal_structure;


-- =====================================================
-- SUCCESS SUMMARY
-- =====================================================

SELECT
  '✅ ADDED 18 NEW MEAL PLANS (6 per paid tier)!' as status,
  COUNT(DISTINCT tier_name) as tiers,
  COUNT(*) as total_plans,
  COUNT(CASE WHEN tier_name = 'Premium' THEN 1 END) as premium_plans,
  COUNT(CASE WHEN tier_name = 'Ultimate' THEN 1 END) as ultimate_plans,
  COUNT(CASE WHEN tier_name = 'Elite' THEN 1 END) as elite_plans
FROM tier_default_meal_plans
WHERE tier_name != 'Base';
