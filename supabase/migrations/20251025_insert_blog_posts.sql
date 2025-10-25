-- Insert 10 AI-Generated Blog Posts for GreenoFig
-- Topics: Health, Nutrition, Wellness, Fitness

-- First, get an admin user ID to be the author
DO $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Get the first admin or super_admin user
  SELECT id INTO v_author_id
  FROM user_profiles
  WHERE role IN ('admin', 'super_admin')
  LIMIT 1;

  -- If no admin exists, use the first user
  IF v_author_id IS NULL THEN
    SELECT id INTO v_author_id FROM user_profiles LIMIT 1;
  END IF;

  -- Insert 10 blog posts
  INSERT INTO blog_posts (
    author_id,
    title,
    slug,
    excerpt,
    content,
    featured_image_url,
    meta_title,
    meta_description,
    focus_keyword,
    keywords,
    status,
    published_at,
    category,
    tags,
    ai_generated
  ) VALUES

  -- Post 1: Intermittent Fasting
  (
    v_author_id,
    'The Complete Guide to Intermittent Fasting for Beginners',
    'complete-guide-intermittent-fasting-beginners',
    'Discover how intermittent fasting can transform your health, boost energy levels, and help you achieve your wellness goals with this comprehensive beginner-friendly guide.',
    '<h2>What is Intermittent Fasting?</h2>
    <p>Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. Unlike traditional diets that focus on <em>what</em> you eat, intermittent fasting focuses on <em>when</em> you eat.</p>

    <h2>Popular Intermittent Fasting Methods</h2>
    <h3>1. The 16/8 Method</h3>
    <p>This involves fasting for 16 hours and eating within an 8-hour window. For example, you might eat between 12 PM and 8 PM, then fast until noon the next day.</p>

    <h3>2. The 5:2 Diet</h3>
    <p>Eat normally for 5 days of the week and restrict calories to 500-600 on the other 2 days.</p>

    <h3>3. Eat-Stop-Eat</h3>
    <p>This involves a 24-hour fast once or twice per week.</p>

    <h2>Health Benefits of Intermittent Fasting</h2>
    <ul>
      <li><strong>Weight Loss:</strong> IF helps reduce calorie intake and boosts metabolism</li>
      <li><strong>Improved Insulin Sensitivity:</strong> Can reduce insulin resistance and lower blood sugar levels</li>
      <li><strong>Enhanced Brain Function:</strong> May improve brain health and protect against neurodegenerative diseases</li>
      <li><strong>Cellular Repair:</strong> Fasting triggers autophagy, a process where cells remove damaged components</li>
      <li><strong>Longevity:</strong> Studies in animals suggest IF may extend lifespan</li>
    </ul>

    <h2>Getting Started: Tips for Beginners</h2>
    <ol>
      <li>Start with the 16/8 method - it''s the easiest to maintain</li>
      <li>Stay hydrated during fasting periods (water, black coffee, and tea are allowed)</li>
      <li>Eat nutrient-dense foods during your eating window</li>
      <li>Listen to your body and adjust as needed</li>
      <li>Be patient - it may take 2-4 weeks to adapt</li>
    </ol>

    <h2>Who Should Avoid Intermittent Fasting?</h2>
    <p>IF may not be suitable for:</p>
    <ul>
      <li>Pregnant or breastfeeding women</li>
      <li>People with a history of eating disorders</li>
      <li>Children and teenagers</li>
      <li>Those with certain medical conditions (consult your doctor first)</li>
    </ul>

    <p><strong>Bottom Line:</strong> Intermittent fasting is a powerful tool for improving health and achieving weight loss goals. Start slowly, stay consistent, and consult with a healthcare provider if you have any concerns.</p>',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=675',
    'Complete Guide to Intermittent Fasting for Beginners',
    'Learn everything about intermittent fasting - benefits, methods, and tips to get started safely and effectively.',
    'intermittent fasting',
    ARRAY['intermittent fasting', 'weight loss', 'health', 'nutrition', 'fasting benefits'],
    'published',
    NOW() - INTERVAL '10 days',
    'Nutrition Basics',
    ARRAY['Nutrition', 'Weight Loss', 'Wellness'],
    true
  ),

  -- Post 2: Protein-Rich Foods
  (
    v_author_id,
    '15 High-Protein Foods That Should Be in Your Diet',
    '15-high-protein-foods-diet',
    'Protein is essential for building muscle, losing weight, and maintaining overall health. Here are 15 delicious high-protein foods to add to your meal plan.',
    '<h2>Why Protein Matters</h2>
    <p>Protein is a crucial macronutrient that plays a vital role in building and repairing tissues, making enzymes and hormones, and supporting immune function. Getting enough protein is essential for muscle growth, weight management, and overall health.</p>

    <h2>How Much Protein Do You Need?</h2>
    <p>The recommended dietary allowance (RDA) for protein is 0.8 grams per kilogram of body weight. However, active individuals and those looking to build muscle may need 1.2-2.0 grams per kilogram.</p>

    <h2>Top 15 High-Protein Foods</h2>

    <h3>Animal-Based Proteins</h3>
    <ol>
      <li><strong>Chicken Breast</strong> - 31g protein per 100g</li>
      <li><strong>Greek Yogurt</strong> - 10g protein per 100g</li>
      <li><strong>Eggs</strong> - 6g protein per large egg</li>
      <li><strong>Salmon</strong> - 25g protein per 100g</li>
      <li><strong>Cottage Cheese</strong> - 11g protein per 100g</li>
      <li><strong>Turkey Breast</strong> - 30g protein per 100g</li>
      <li><strong>Tuna</strong> - 30g protein per 100g</li>
    </ol>

    <h3>Plant-Based Proteins</h3>
    <ol start="8">
      <li><strong>Lentils</strong> - 9g protein per 100g (cooked)</li>
      <li><strong>Chickpeas</strong> - 9g protein per 100g (cooked)</li>
      <li><strong>Quinoa</strong> - 4g protein per 100g (cooked)</li>
      <li><strong>Tofu</strong> - 8g protein per 100g</li>
      <li><strong>Almonds</strong> - 21g protein per 100g</li>
      <li><strong>Peanut Butter</strong> - 25g protein per 100g</li>
      <li><strong>Edamame</strong> - 11g protein per 100g</li>
      <li><strong>Chia Seeds</strong> - 17g protein per 100g</li>
    </ol>

    <h2>Tips for Increasing Protein Intake</h2>
    <ul>
      <li>Add protein to every meal and snack</li>
      <li>Choose protein-rich snacks like Greek yogurt, nuts, or protein bars</li>
      <li>Start your day with a high-protein breakfast</li>
      <li>Consider protein supplements if needed (whey, plant-based powders)</li>
      <li>Meal prep protein-rich foods for convenience</li>
    </ul>

    <h2>Sample High-Protein Day</h2>
    <p><strong>Breakfast:</strong> Greek yogurt with berries and almonds (25g protein)<br>
    <strong>Lunch:</strong> Grilled chicken salad with quinoa (40g protein)<br>
    <strong>Snack:</strong> Hummus with veggies (8g protein)<br>
    <strong>Dinner:</strong> Baked salmon with lentils (45g protein)<br>
    <strong>Total:</strong> ~118g protein</p>',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=675',
    '15 High-Protein Foods That Should Be in Your Diet',
    'Discover the best high-protein foods to fuel your body, build muscle, and support weight loss goals.',
    'high protein foods',
    ARRAY['protein', 'nutrition', 'muscle building', 'healthy eating', 'diet'],
    'published',
    NOW() - INTERVAL '9 days',
    'Nutrition Basics',
    ARRAY['Nutrition', 'Healthy Recipes', 'Meal Prep'],
    true
  ),

  -- Post 3: Morning Workout
  (
    v_author_id,
    '10-Minute Morning Workout to Energize Your Day',
    '10-minute-morning-workout-energize-day',
    'Start your day with this quick and effective 10-minute morning workout routine. No equipment needed - just you and your commitment to feeling amazing!',
    '<h2>Why Morning Workouts?</h2>
    <p>Morning exercise has incredible benefits: it boosts your metabolism, improves focus, enhances mood, and helps you sleep better at night. Plus, getting your workout done first thing means it won''t get pushed aside by other commitments.</p>

    <h2>The 10-Minute Morning Routine</h2>

    <h3>Warm-Up (2 minutes)</h3>
    <ul>
      <li>30 seconds: Arm circles</li>
      <li>30 seconds: Hip circles</li>
      <li>30 seconds: Leg swings</li>
      <li>30 seconds: Light jogging in place</li>
    </ul>

    <h3>Main Workout (7 minutes)</h3>
    <p>Perform each exercise for 40 seconds, with 20 seconds rest between exercises:</p>

    <ol>
      <li><strong>Jumping Jacks</strong> - Full-body cardio to get your heart pumping</li>
      <li><strong>Bodyweight Squats</strong> - Targets legs and glutes</li>
      <li><strong>Push-Ups</strong> - Upper body strength (modify on knees if needed)</li>
      <li><strong>Mountain Climbers</strong> - Core and cardio</li>
      <li><strong>Lunges</strong> - Alternating legs for balance and leg strength</li>
      <li><strong>Plank</strong> - Core stability and strength</li>
      <li><strong>Burpees</strong> - Full-body intensity</li>
    </ol>

    <h3>Cool-Down (1 minute)</h3>
    <ul>
      <li>20 seconds: Child''s pose stretch</li>
      <li>20 seconds: Standing quad stretch</li>
      <li>20 seconds: Deep breathing</li>
    </ul>

    <h2>Tips for Success</h2>
    <ul>
      <li><strong>Consistency is key:</strong> Aim for 5-6 mornings per week</li>
      <li><strong>Prepare the night before:</strong> Lay out your workout clothes</li>
      <li><strong>Hydrate:</strong> Drink water before and after</li>
      <li><strong>Listen to your body:</strong> Modify exercises as needed</li>
      <li><strong>Track your progress:</strong> Use the GreenoFig app to log your workouts</li>
    </ul>

    <h2>Making It a Habit</h2>
    <p>The key to making morning workouts stick is creating a routine. Set your alarm 15 minutes earlier, keep your workout space ready, and remember - it''s only 10 minutes! You''ve got this.</p>

    <blockquote><p>"The secret of getting ahead is getting started." - Mark Twain</p></blockquote>',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=675',
    '10-Minute Morning Workout to Energize Your Day',
    'Quick and effective morning workout routine that takes only 10 minutes. No equipment needed!',
    'morning workout',
    ARRAY['morning workout', 'fitness', 'exercise routine', 'workout at home', 'quick workout'],
    'published',
    NOW() - INTERVAL '8 days',
    'Wellness Tips',
    ARRAY['Fitness', 'Wellness', 'Morning Routine'],
    true
  ),

  -- Post 4: Meal Prep Sunday
  (
    v_author_id,
    'Meal Prep Sunday: 5 Healthy Recipes for the Week',
    'meal-prep-sunday-5-healthy-recipes',
    'Save time, eat healthier, and stick to your nutrition goals with these 5 delicious meal prep recipes that will last all week long.',
    '<h2>Why Meal Prep?</h2>
    <p>Meal prepping is one of the most effective strategies for eating healthy consistently. It saves time, reduces stress, prevents unhealthy food choices, and can save you money.</p>

    <h2>Meal Prep Basics</h2>
    <ul>
      <li>Choose one day per week (usually Sunday) for meal prep</li>
      <li>Invest in quality glass containers</li>
      <li>Cook in batches to save time</li>
      <li>Label containers with dates</li>
      <li>Most prepped meals last 4-5 days in the fridge</li>
    </ul>

    <h2>5 Meal Prep Recipes</h2>

    <h3>1. Mediterranean Chicken Bowls</h3>
    <p><strong>Ingredients:</strong> Grilled chicken breast, quinoa, cherry tomatoes, cucumber, red onion, feta cheese, olive oil, lemon juice</p>
    <p><strong>Prep time:</strong> 30 minutes | <strong>Servings:</strong> 5</p>
    <p><strong>Nutrition per serving:</strong> 420 calories, 35g protein, 40g carbs, 15g fat</p>

    <h3>2. Turkey Taco Meal Prep</h3>
    <p><strong>Ingredients:</strong> Ground turkey, taco seasoning, brown rice, black beans, corn, bell peppers, salsa, Greek yogurt</p>
    <p><strong>Prep time:</strong> 25 minutes | <strong>Servings:</strong> 5</p>
    <p><strong>Nutrition per serving:</strong> 380 calories, 30g protein, 45g carbs, 10g fat</p>

    <h3>3. Asian-Inspired Salmon Bowls</h3>
    <p><strong>Ingredients:</strong> Baked salmon, brown rice, edamame, carrots, broccoli, sesame seeds, soy sauce, ginger</p>
    <p><strong>Prep time:</strong> 35 minutes | <strong>Servings:</strong> 5</p>
    <p><strong>Nutrition per serving:</strong> 450 calories, 32g protein, 42g carbs, 18g fat</p>

    <h3>4. Vegetarian Buddha Bowls</h3>
    <p><strong>Ingredients:</strong> Chickpeas, sweet potato, quinoa, kale, avocado, tahini dressing</p>
    <p><strong>Prep time:</strong> 40 minutes | <strong>Servings:</strong> 5</p>
    <p><strong>Nutrition per serving:</strong> 390 calories, 15g protein, 52g carbs, 14g fat</p>

    <h3>5. Beef and Broccoli Stir-Fry</h3>
    <p><strong>Ingredients:</strong> Lean beef strips, broccoli, brown rice, garlic, ginger, low-sodium soy sauce, sesame oil</p>
    <p><strong>Prep time:</strong> 30 minutes | <strong>Servings:</strong> 5</p>
    <p><strong>Nutrition per serving:</strong> 410 calories, 33g protein, 38g carbs, 14g fat</p>

    <h2>Meal Prep Timeline</h2>
    <ol>
      <li><strong>Sunday 10 AM:</strong> Cook all grains (rice, quinoa)</li>
      <li><strong>11 AM:</strong> Prep proteins (bake, grill, cook)</li>
      <li><strong>12 PM:</strong> Chop vegetables</li>
      <li><strong>12:30 PM:</strong> Assemble containers</li>
      <li><strong>1 PM:</strong> Done! Relax knowing your meals are ready</li>
    </ol>

    <h2>Storage Tips</h2>
    <ul>
      <li>Keep dressings separate until ready to eat</li>
      <li>Store leafy greens separately to prevent wilting</li>
      <li>Freeze extra portions if making larger batches</li>
      <li>Reheat in microwave for 2-3 minutes</li>
    </ul>',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=675',
    'Meal Prep Sunday: 5 Healthy Recipes for the Week',
    'Easy meal prep recipes to save time and eat healthy all week. Includes nutrition info and prep timeline.',
    'meal prep',
    ARRAY['meal prep', 'healthy recipes', 'meal planning', 'batch cooking', 'nutrition'],
    'published',
    NOW() - INTERVAL '7 days',
    'Meal Prep',
    ARRAY['Meal Prep', 'Healthy Recipes', 'Nutrition'],
    true
  ),

  -- Post 5: Hydration
  (
    v_author_id,
    'The Ultimate Guide to Staying Hydrated: More Than Just Water',
    'ultimate-guide-staying-hydrated',
    'Learn why hydration is crucial for your health, how much water you really need, and creative ways to stay hydrated throughout the day.',
    '<h2>Why Hydration Matters</h2>
    <p>Water makes up about 60% of your body weight and is involved in every bodily function. Proper hydration is essential for:</p>
    <ul>
      <li>Regulating body temperature</li>
      <li>Transporting nutrients</li>
      <li>Removing waste products</li>
      <li>Lubricating joints</li>
      <li>Supporting cognitive function</li>
      <li>Maintaining healthy skin</li>
    </ul>

    <h2>How Much Water Do You Need?</h2>
    <p>While the "8 glasses a day" rule is common, your actual needs depend on several factors:</p>

    <h3>General Guidelines:</h3>
    <ul>
      <li><strong>Men:</strong> About 15.5 cups (3.7 liters) per day</li>
      <li><strong>Women:</strong> About 11.5 cups (2.7 liters) per day</li>
    </ul>

    <h3>Factors That Increase Water Needs:</h3>
    <ul>
      <li>Exercise and physical activity</li>
      <li>Hot or humid weather</li>
      <li>High altitude</li>
      <li>Illness (fever, vomiting, diarrhea)</li>
      <li>Pregnancy or breastfeeding</li>
    </ul>

    <h2>Signs of Dehydration</h2>
    <p>Watch for these warning signs:</p>
    <ul>
      <li>Dark yellow urine</li>
      <li>Fatigue and low energy</li>
      <li>Headaches</li>
      <li>Dry skin and lips</li>
      <li>Dizziness</li>
      <li>Difficulty concentrating</li>
    </ul>

    <h2>10 Creative Ways to Stay Hydrated</h2>
    <ol>
      <li><strong>Infused Water:</strong> Add cucumber, lemon, berries, or mint for flavor</li>
      <li><strong>Eat Water-Rich Foods:</strong> Watermelon, cucumbers, oranges, strawberries</li>
      <li><strong>Set Reminders:</strong> Use the GreenoFig app to track water intake</li>
      <li><strong>Use a Marked Water Bottle:</strong> Visual goals throughout the day</li>
      <li><strong>Herbal Tea:</strong> Caffeine-free options count toward hydration</li>
      <li><strong>Coconut Water:</strong> Natural electrolytes for post-workout</li>
      <li><strong>Smoothies:</strong> Blend fruits and vegetables for hydration</li>
      <li><strong>Sparkling Water:</strong> Zero-calorie fizzy alternative</li>
      <li><strong>Soup and Broth:</strong> Especially hydrating in winter</li>
      <li><strong>Morning Ritual:</strong> Start each day with 16 oz of water</li>
    </ol>

    <h2>Hydration and Exercise</h2>
    <p><strong>Before Exercise:</strong> Drink 16-20 oz of water 2-3 hours before<br>
    <strong>During Exercise:</strong> 7-10 oz every 10-20 minutes<br>
    <strong>After Exercise:</strong> 16-24 oz for every pound lost through sweat</p>

    <h2>The Bottom Line</h2>
    <p>Staying hydrated doesn''t have to be complicated. Listen to your body, drink when you''re thirsty, and use creative strategies to make hydration enjoyable. Your body will thank you!</p>',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=675',
    'The Ultimate Guide to Staying Hydrated',
    'Everything you need to know about hydration - benefits, daily needs, and creative ways to drink more water.',
    'hydration',
    ARRAY['hydration', 'water intake', 'health tips', 'wellness', 'healthy habits'],
    'published',
    NOW() - INTERVAL '6 days',
    'Wellness Tips',
    ARRAY['Wellness', 'Health Tips', 'Hydration'],
    true
  ),

  -- Post 6: Sleep and Recovery
  (
    v_author_id,
    'Sleep and Fitness: Why Recovery is Just as Important as Training',
    'sleep-fitness-recovery-important-training',
    'Understanding the crucial relationship between sleep, recovery, and fitness performance. Learn how to optimize your sleep for better results.',
    '<h2>The Sleep-Fitness Connection</h2>
    <p>While we often focus on workouts and nutrition, sleep is the third pillar of fitness that''s often overlooked. Quality sleep is when your body repairs muscle tissue, consolidates memories, and regulates hormones.</p>

    <h2>How Sleep Affects Your Fitness</h2>

    <h3>Muscle Recovery and Growth</h3>
    <p>During deep sleep, your body releases growth hormone, which is essential for muscle repair and growth. Without adequate sleep, your muscles can''t properly recover from workouts.</p>

    <h3>Performance and Endurance</h3>
    <p>Studies show that athletes who sleep 7-9 hours per night have:</p>
    <ul>
      <li>Better reaction times</li>
      <li>Improved accuracy</li>
      <li>Increased stamina</li>
      <li>Faster sprint times</li>
      <li>Better decision-making</li>
    </ul>

    <h3>Weight Management</h3>
    <p>Poor sleep disrupts hunger hormones:</p>
    <ul>
      <li><strong>Increases Ghrelin:</strong> The "hunger hormone"</li>
      <li><strong>Decreases Leptin:</strong> The "fullness hormone"</li>
      <li>Result: Increased cravings and overeating</li>
    </ul>

    <h2>Signs You''re Not Getting Enough Recovery Sleep</h2>
    <ul>
      <li>Decreased strength and performance</li>
      <li>Prolonged muscle soreness</li>
      <li>Frequent injuries</li>
      <li>Mood changes and irritability</li>
      <li>Weakened immune system</li>
      <li>Lack of motivation to train</li>
    </ul>

    <h2>10 Tips for Better Recovery Sleep</h2>

    <h3>1. Stick to a Schedule</h3>
    <p>Go to bed and wake up at the same time every day, even on weekends.</p>

    <h3>2. Create a Sleep-Friendly Environment</h3>
    <ul>
      <li>Keep room cool (65-68°F)</li>
      <li>Use blackout curtains</li>
      <li>Minimize noise (use white noise if needed)</li>
      <li>Invest in a quality mattress</li>
    </ul>

    <h3>3. Limit Screen Time</h3>
    <p>Avoid blue light from devices 1-2 hours before bed. Use blue light filters if you must use screens.</p>

    <h3>4. Watch Your Pre-Bed Nutrition</h3>
    <ul>
      <li>Avoid caffeine after 2 PM</li>
      <li>Limit alcohol (disrupts sleep cycles)</li>
      <li>Don''t eat large meals close to bedtime</li>
      <li>Try sleep-promoting snacks: chamomile tea, almonds, tart cherry juice</li>
    </ul>

    <h3>5. Develop a Bedtime Routine</h3>
    <p>Signal to your body it''s time to wind down:</p>
    <ul>
      <li>Gentle stretching or yoga</li>
      <li>Reading</li>
      <li>Meditation or deep breathing</li>
      <li>Warm bath or shower</li>
    </ul>

    <h3>6-10. Additional Tips</h3>
    <ul>
      <li>Exercise regularly (but not too close to bedtime)</li>
      <li>Get morning sunlight exposure</li>
      <li>Use your bed only for sleep</li>
      <li>Try relaxation techniques</li>
      <li>Track your sleep with the GreenoFig app</li>
    </ul>

    <h2>The Ideal Sleep Schedule for Athletes</h2>
    <p><strong>Total Sleep:</strong> 7-9 hours per night<br>
    <strong>Sleep Cycles:</strong> 4-6 complete 90-minute cycles<br>
    <strong>Deep Sleep:</strong> Aim for 1.5-2 hours<br>
    <strong>REM Sleep:</strong> 1.5-2 hours</p>

    <h2>Recovery Beyond Sleep</h2>
    <ul>
      <li><strong>Active Recovery:</strong> Light walking, swimming, or yoga</li>
      <li><strong>Rest Days:</strong> 1-2 days per week with no intense training</li>
      <li><strong>Nutrition:</strong> Adequate protein and carbs for recovery</li>
      <li><strong>Hydration:</strong> Maintain fluid balance</li>
      <li><strong>Stress Management:</strong> Meditation, massage, or hobbies</li>
    </ul>

    <p><strong>Remember:</strong> You don''t get stronger during your workout - you get stronger during recovery. Prioritize sleep as much as you prioritize training!</p>',
    'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&h=675',
    'Sleep & Fitness: Recovery is Key to Training',
    'Learn how sleep affects fitness performance, muscle recovery, and weight management. Plus 10 tips for better sleep.',
    'sleep and fitness',
    ARRAY['sleep', 'fitness recovery', 'muscle recovery', 'rest and recovery', 'sleep optimization'],
    'published',
    NOW() - INTERVAL '5 days',
    'Wellness Tips',
    ARRAY['Wellness', 'Fitness', 'Sleep'],
    true
  ),

  -- Post 7: Strength Training for Women
  (
    v_author_id,
    'Strength Training for Women: Myths, Benefits, and Getting Started',
    'strength-training-women-myths-benefits-guide',
    'Debunking common myths and exploring the incredible benefits of strength training for women. Your complete guide to getting started with confidence.',
    '<h2>Breaking Down the Myths</h2>

    <h3>Myth #1: "Lifting weights will make me bulky"</h3>
    <p><strong>Truth:</strong> Women don''t have enough testosterone to build large, bulky muscles naturally. Strength training creates a lean, toned physique.</p>

    <h3>Myth #2: "Cardio is better for weight loss"</h3>
    <p><strong>Truth:</strong> Strength training builds muscle, which increases your resting metabolic rate, helping you burn more calories 24/7.</p>

    <h3>Myth #3: "I''m too old to start"</h3>
    <p><strong>Truth:</strong> It''s never too late! Strength training is especially beneficial for maintaining bone density and muscle mass as we age.</p>

    <h2>Amazing Benefits of Strength Training</h2>

    <h3>Physical Benefits</h3>
    <ul>
      <li><strong>Increased Bone Density:</strong> Reduces risk of osteoporosis</li>
      <li><strong>Improved Metabolism:</strong> More muscle = more calories burned</li>
      <li><strong>Better Body Composition:</strong> Reduce body fat while maintaining muscle</li>
      <li><strong>Enhanced Strength:</strong> Makes daily tasks easier</li>
      <li><strong>Injury Prevention:</strong> Stronger muscles protect joints</li>
      <li><strong>Improved Posture:</strong> Stronger back and core muscles</li>
    </ul>

    <h3>Mental and Emotional Benefits</h3>
    <ul>
      <li>Increased confidence and self-esteem</li>
      <li>Reduced anxiety and depression</li>
      <li>Better stress management</li>
      <li>Improved sleep quality</li>
      <li>Sense of empowerment</li>
    </ul>

    <h2>Getting Started: Beginner''s Guide</h2>

    <h3>Equipment Options</h3>
    <ol>
      <li><strong>Bodyweight:</strong> Push-ups, squats, lunges, planks</li>
      <li><strong>Dumbbells:</strong> Start with 5-10 lb weights</li>
      <li><strong>Resistance Bands:</strong> Portable and affordable</li>
      <li><strong>Kettlebells:</strong> Versatile for full-body workouts</li>
      <li><strong>Gym Machines:</strong> Great for learning proper form</li>
    </ol>

    <h3>Sample Beginner Workout (3x per week)</h3>

    <h4>Day 1: Upper Body</h4>
    <ul>
      <li>Push-ups: 3 sets of 8-12 reps</li>
      <li>Dumbbell rows: 3 sets of 10 reps</li>
      <li>Shoulder press: 3 sets of 10 reps</li>
      <li>Bicep curls: 3 sets of 12 reps</li>
      <li>Tricep dips: 3 sets of 10 reps</li>
    </ul>

    <h4>Day 2: Lower Body</h4>
    <ul>
      <li>Squats: 3 sets of 12 reps</li>
      <li>Lunges: 3 sets of 10 reps per leg</li>
      <li>Deadlifts: 3 sets of 10 reps</li>
      <li>Glute bridges: 3 sets of 15 reps</li>
      <li>Calf raises: 3 sets of 15 reps</li>
    </ul>

    <h4>Day 3: Full Body</h4>
    <ul>
      <li>Goblet squats: 3 sets of 12 reps</li>
      <li>Bent-over rows: 3 sets of 10 reps</li>
      <li>Overhead press: 3 sets of 10 reps</li>
      <li>Romanian deadlifts: 3 sets of 10 reps</li>
      <li>Plank: 3 sets of 30-60 seconds</li>
    </ul>

    <h2>Essential Tips for Success</h2>

    <h3>1. Start with Proper Form</h3>
    <p>Quality over quantity! Learn correct form before increasing weight. Consider working with a trainer initially.</p>

    <h3>2. Progressive Overload</h3>
    <p>Gradually increase weight, reps, or sets over time to continue making progress.</p>

    <h3>3. Rest and Recovery</h3>
    <p>Allow 48 hours between training the same muscle groups. Muscles grow during rest, not during workouts!</p>

    <h3>4. Nutrition is Key</h3>
    <ul>
      <li>Eat adequate protein (0.8-1g per lb body weight)</li>
      <li>Don''t fear carbs - they fuel your workouts</li>
      <li>Stay hydrated</li>
      <li>Eat enough calories to support muscle growth</li>
    </ul>

    <h3>5. Track Your Progress</h3>
    <p>Use the GreenoFig app to log workouts, track weights lifted, and celebrate your progress!</p>

    <h2>Common Mistakes to Avoid</h2>
    <ul>
      <li>Lifting weights that are too light (challenge yourself!)</li>
      <li>Doing the same routine for months</li>
      <li>Neglecting proper warm-up and cool-down</li>
      <li>Comparing yourself to others</li>
      <li>Giving up too soon (results take 4-6 weeks)</li>
    </ul>

    <blockquote><p>"Strong is the new skinny. Embrace your strength, inside and out."</p></blockquote>

    <p><strong>Ready to start your strength training journey?</strong> Remember, every expert was once a beginner. Take that first step today!</p>',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&h=675',
    'Strength Training for Women: Complete Guide',
    'Complete guide to strength training for women - debunk myths, discover benefits, and get a beginner workout plan.',
    'strength training for women',
    ARRAY['strength training', 'women fitness', 'weight lifting', 'muscle building', 'workout guide'],
    'published',
    NOW() - INTERVAL '4 days',
    'Wellness Tips',
    ARRAY['Fitness', 'Women Health', 'Strength Training'],
    true
  ),

  -- Post 8: Gut Health
  (
    v_author_id,
    'Gut Health 101: Foods and Habits for a Healthy Microbiome',
    'gut-health-foods-habits-healthy-microbiome',
    'Your gut health affects everything from digestion to immunity to mental health. Learn how to nurture your microbiome with the right foods and habits.',
    '<h2>What is the Gut Microbiome?</h2>
    <p>Your gut is home to trillions of microorganisms - bacteria, fungi, and viruses - collectively known as the gut microbiome. These tiny organisms play a massive role in your overall health.</p>

    <h2>Why Gut Health Matters</h2>

    <h3>The Gut-Body Connection</h3>
    <ul>
      <li><strong>Digestion:</strong> Breaks down food and absorbs nutrients</li>
      <li><strong>Immunity:</strong> 70% of immune system is in the gut</li>
      <li><strong>Mental Health:</strong> Produces 90% of serotonin (the "happy hormone")</li>
      <li><strong>Weight Management:</strong> Influences metabolism and fat storage</li>
      <li><strong>Inflammation:</strong> Affects inflammatory responses throughout the body</li>
      <li><strong>Heart Health:</strong> Impacts cholesterol and blood pressure</li>
    </ul>

    <h2>Signs of an Unhealthy Gut</h2>
    <ul>
      <li>Frequent digestive issues (bloating, gas, constipation, diarrhea)</li>
      <li>Food intolerances</li>
      <li>Frequent fatigue</li>
      <li>Skin problems (acne, eczema)</li>
      <li>Autoimmune conditions</li>
      <li>Mood disorders (anxiety, depression)</li>
      <li>Frequent infections</li>
      <li>Unexplained weight changes</li>
    </ul>

    <h2>15 Foods for a Healthy Gut</h2>

    <h3>Probiotic Foods (contain beneficial bacteria)</h3>
    <ol>
      <li><strong>Yogurt:</strong> Look for "live and active cultures"</li>
      <li><strong>Kefir:</strong> Fermented milk drink with diverse probiotics</li>
      <li><strong>Sauerkraut:</strong> Fermented cabbage (unpasteurized)</li>
      <li><strong>Kimchi:</strong> Korean fermented vegetables</li>
      <li><strong>Kombucha:</strong> Fermented tea beverage</li>
      <li><strong>Miso:</strong> Fermented soybean paste</li>
      <li><strong>Tempeh:</strong> Fermented soybean product</li>
    </ol>

    <h3>Prebiotic Foods (feed beneficial bacteria)</h3>
    <ol start="8">
      <li><strong>Garlic:</strong> Contains inulin fiber</li>
      <li><strong>Onions:</strong> Rich in prebiotic fibers</li>
      <li><strong>Bananas:</strong> Especially green bananas</li>
      <li><strong>Asparagus:</strong> High in inulin</li>
      <li><strong>Oats:</strong> Contains beta-glucan fiber</li>
      <li><strong>Apples:</strong> Pectin feeds good bacteria</li>
      <li><strong>Flaxseeds:</strong> High in fiber and omega-3s</li>
      <li><strong>Chicory Root:</strong> 47% inulin fiber by weight</li>
    </ol>

    <h2>10 Habits for Better Gut Health</h2>

    <h3>1. Eat Diverse Foods</h3>
    <p>Aim for 30+ different plant foods per week. Diversity in diet = diversity in gut bacteria.</p>

    <h3>2. Increase Fiber Intake</h3>
    <p>Target 25-35g of fiber daily from whole grains, fruits, vegetables, and legumes.</p>

    <h3>3. Stay Hydrated</h3>
    <p>Water is essential for the mucosal lining of the intestines and beneficial bacteria balance.</p>

    <h3>4. Reduce Stress</h3>
    <p>Chronic stress damages gut health. Practice meditation, yoga, or deep breathing.</p>

    <h3>5. Get Quality Sleep</h3>
    <p>Poor sleep disrupts gut bacteria. Aim for 7-9 hours nightly.</p>

    <h3>6. Exercise Regularly</h3>
    <p>Physical activity increases gut bacteria diversity and produces beneficial short-chain fatty acids.</p>

    <h3>7. Limit Antibiotics</h3>
    <p>Only use when medically necessary. They kill both bad AND good bacteria.</p>

    <h3>8. Avoid Artificial Sweeteners</h3>
    <p>Studies show they may negatively affect gut bacteria balance.</p>

    <h3>9. Reduce Processed Foods</h3>
    <p>High sugar and unhealthy fats promote growth of harmful bacteria.</p>

    <h3>10. Consider a Probiotic Supplement</h3>
    <p>Especially helpful after antibiotics or during digestive issues. Look for multi-strain formulas.</p>

    <h2>Sample Day of Gut-Healthy Eating</h2>
    <p><strong>Breakfast:</strong> Greek yogurt with berries, flaxseeds, and sliced banana<br>
    <strong>Snack:</strong> Apple slices with almond butter<br>
    <strong>Lunch:</strong> Mixed green salad with chickpeas, kimchi, and olive oil dressing<br>
    <strong>Snack:</strong> Kombucha and a handful of almonds<br>
    <strong>Dinner:</strong> Grilled salmon with roasted asparagus and quinoa<br>
    <strong>Evening:</strong> Chamomile tea</p>

    <h2>The Bottom Line</h2>
    <p>A healthy gut is the foundation of overall health. By eating diverse, fiber-rich foods and maintaining healthy lifestyle habits, you can nurture your microbiome and feel your best from the inside out.</p>',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=1200&h=675',
    'Gut Health 101: Foods and Habits for a Healthy Microbiome',
    'Complete guide to gut health - learn about the microbiome, best foods for gut health, and daily habits to improve digestion.',
    'gut health',
    ARRAY['gut health', 'microbiome', 'probiotics', 'digestive health', 'healthy eating'],
    'published',
    NOW() - INTERVAL '3 days',
    'Nutrition Basics',
    ARRAY['Nutrition', 'Gut Health', 'Wellness'],
    true
  ),

  -- Post 9: HIIT Workouts
  (
    v_author_id,
    'HIIT Workouts: Maximum Results in Minimum Time',
    'hiit-workouts-maximum-results-minimum-time',
    'Discover the science behind High-Intensity Interval Training and get 3 effective HIIT workouts you can do anywhere in just 20 minutes.',
    '<h2>What is HIIT?</h2>
    <p>High-Intensity Interval Training (HIIT) involves short bursts of intense exercise alternated with low-intensity recovery periods. It''s one of the most time-efficient ways to exercise and offers incredible benefits.</p>

    <h2>The Science Behind HIIT</h2>

    <h3>EPOC (Excess Post-Exercise Oxygen Consumption)</h3>
    <p>Also known as the "afterburn effect," HIIT increases your metabolism for up to 24 hours after your workout, meaning you continue burning calories long after you''ve finished exercising.</p>

    <h3>Proven Benefits</h3>
    <ul>
      <li><strong>Burns More Calories:</strong> Can burn 25-30% more calories than other exercises</li>
      <li><strong>Increases Metabolic Rate:</strong> Metabolism stays elevated for hours</li>
      <li><strong>Builds Muscle:</strong> Particularly in areas being trained</li>
      <li><strong>Improves Oxygen Consumption:</strong> Better cardiovascular health</li>
      <li><strong>Reduces Heart Rate and Blood Pressure:</strong> Especially in overweight individuals</li>
      <li><strong>Reduces Blood Sugar:</strong> Can reduce insulin resistance</li>
      <li><strong>Time-Efficient:</strong> Get same benefits in half the time</li>
    </ul>

    <h2>HIIT Workout #1: Beginner Full-Body Blast (15 minutes)</h2>

    <h3>Format: 30 seconds work, 30 seconds rest, 3 rounds</h3>
    <ol>
      <li>Jumping Jacks</li>
      <li>Bodyweight Squats</li>
      <li>Push-ups (modified on knees if needed)</li>
      <li>High Knees</li>
      <li>Plank Hold</li>
    </ol>
    <p><em>Rest 1 minute between rounds</em></p>

    <h2>HIIT Workout #2: Intermediate Cardio Blast (20 minutes)</h2>

    <h3>Format: 40 seconds work, 20 seconds rest, 4 rounds</h3>
    <ol>
      <li>Burpees</li>
      <li>Mountain Climbers</li>
      <li>Jump Squats</li>
      <li>High Knees</li>
      <li>Plank Jacks</li>
      <li>Bicycle Crunches</li>
    </ol>
    <p><em>Rest 90 seconds between rounds</em></p>

    <h2>HIIT Workout #3: Advanced Tabata (20 minutes)</h2>

    <h3>Format: 20 seconds max effort, 10 seconds rest, 8 rounds per exercise</h3>

    <h4>Set 1: Lower Body</h4>
    <ul>
      <li>Jump Squats (8 rounds)</li>
    </ul>

    <h4>Set 2: Core</h4>
    <ul>
      <li>Mountain Climbers (8 rounds)</li>
    </ul>

    <h4>Set 3: Upper Body</h4>
    <ul>
      <li>Push-ups (8 rounds)</li>
    </ul>

    <h4>Set 4: Full Body</h4>
    <ul>
      <li>Burpees (8 rounds)</li>
    </ul>
    <p><em>Rest 1 minute between sets</em></p>

    <h2>HIIT Safety and Best Practices</h2>

    <h3>Who Should Be Cautious</h3>
    <ul>
      <li>People with heart conditions (consult doctor first)</li>
      <li>Those with joint issues</li>
      <li>Complete beginners to exercise</li>
      <li>Anyone recovering from injury</li>
    </ul>

    <h3>Essential Tips</h3>

    <h4>1. Warm Up Properly</h4>
    <p>5-10 minutes of light cardio and dynamic stretching before starting.</p>

    <h4>2. Focus on Form</h4>
    <p>Quality over speed. Poor form leads to injury.</p>

    <h4>3. Start Slow</h4>
    <p>Begin with 1-2 HIIT sessions per week, gradually increase.</p>

    <h4>4. Listen to Your Body</h4>
    <p>HIIT should be challenging but not painful. Stop if you feel dizzy or experience chest pain.</p>

    <h4>5. Allow Recovery</h4>
    <p>Don''t do HIIT on consecutive days. Your body needs time to recover.</p>

    <h4>6. Stay Hydrated</h4>
    <p>Drink water before, during, and after your workout.</p>

    <h4>7. Cool Down</h4>
    <p>5-10 minutes of light movement and stretching after your workout.</p>

    <h2>Sample Weekly Workout Schedule</h2>
    <p><strong>Monday:</strong> HIIT Workout (20 min)<br>
    <strong>Tuesday:</strong> Strength Training<br>
    <strong>Wednesday:</strong> Active Recovery (yoga, walking)<br>
    <strong>Thursday:</strong> HIIT Workout (20 min)<br>
    <strong>Friday:</strong> Strength Training<br>
    <strong>Saturday:</strong> Moderate Cardio (30 min)<br>
    <strong>Sunday:</strong> Rest</p>

    <h2>Maximizing Your HIIT Results</h2>

    <h3>Nutrition</h3>
    <ul>
      <li>Eat a small snack 30-60 minutes before (banana with peanut butter)</li>
      <li>Post-workout: protein + carbs within 30 minutes</li>
      <li>Stay in a slight calorie deficit for fat loss</li>
      <li>Prioritize protein for muscle maintenance</li>
    </ul>

    <h3>Tracking Progress</h3>
    <ul>
      <li>Log workouts in the GreenoFig app</li>
      <li>Take progress photos monthly</li>
      <li>Track how you feel (energy, mood, sleep)</li>
      <li>Measure fitness improvements (longer work intervals, shorter rest)</li>
    </ul>

    <h2>Common HIIT Mistakes</h2>
    <ol>
      <li><strong>Not going hard enough:</strong> "High-intensity" means 80-95% max effort</li>
      <li><strong>Doing too much too soon:</strong> Build up gradually</li>
      <li><strong>Skipping warm-up/cool-down:</strong> Increases injury risk</li>
      <li><strong>Poor form during fatigue:</strong> Slow down if form breaks</li>
      <li><strong>Not allowing recovery:</strong> More isn''t always better</li>
    </ol>

    <blockquote><p>"20 minutes of focused HIIT beats an hour of unfocused cardio. Work smarter, not longer."</p></blockquote>

    <p><strong>Ready to transform your fitness in just 20 minutes?</strong> Pick a workout and get started today!</p>',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=675',
    'HIIT Workouts: Maximum Results in Minimum Time',
    'Complete guide to High-Intensity Interval Training with 3 effective HIIT workouts for all fitness levels.',
    'HIIT workouts',
    ARRAY['HIIT', 'interval training', 'cardio workout', 'fat burning', 'fitness'],
    'published',
    NOW() - INTERVAL '2 days',
    'Wellness Tips',
    ARRAY['Fitness', 'HIIT', 'Workout Routines'],
    true
  ),

  -- Post 10: Mindful Eating
  (
    v_author_id,
    'Mindful Eating: Transform Your Relationship with Food',
    'mindful-eating-transform-relationship-food',
    'Learn the practice of mindful eating to stop emotional eating, improve digestion, and develop a healthier relationship with food.',
    '<h2>What is Mindful Eating?</h2>
    <p>Mindful eating is the practice of being fully present while eating - paying attention to the taste, texture, and experience of food without judgment or distraction. It''s about awareness, not restriction.</p>

    <h2>Why Mindful Eating Matters</h2>

    <h3>Common Eating Problems It Addresses</h3>
    <ul>
      <li><strong>Emotional Eating:</strong> Eating when stressed, bored, or sad</li>
      <li><strong>Mindless Eating:</strong> Eating while distracted (TV, phone, work)</li>
      <li><strong>Overeating:</strong> Eating past fullness</li>
      <li><strong>Restrictive Eating:</strong> Strict dieting followed by binging</li>
      <li><strong>Guilt and Shame:</strong> Negative feelings around food choices</li>
    </ul>

    <h3>Benefits of Mindful Eating</h3>
    <ul>
      <li>Better digestion and nutrient absorption</li>
      <li>Natural portion control without counting calories</li>
      <li>Reduced stress around food</li>
      <li>Enhanced enjoyment of meals</li>
      <li>Weight management without dieting</li>
      <li>Improved recognition of hunger and fullness cues</li>
      <li>Healthier relationship with food</li>
    </ul>

    <h2>The Science Behind Mindful Eating</h2>

    <h3>The Hunger-Fullness Signals</h3>
    <p>It takes 20 minutes for your brain to receive fullness signals from your stomach. Eating slowly and mindfully allows you to recognize these signals before overeating.</p>

    <h3>The Stress-Eating Connection</h3>
    <p>Stress increases cortisol, which triggers cravings for high-calorie comfort foods. Mindful eating helps break this automatic response.</p>

    <h2>10 Principles of Mindful Eating</h2>

    <h3>1. Eat Without Distractions</h3>
    <p>Turn off the TV, put away your phone, and step away from work. Make eating a dedicated activity.</p>

    <h3>2. Listen to Your Hunger Cues</h3>
    <p>Use the hunger scale (1-10):</p>
    <ul>
      <li>1-2: Starving (avoid getting this hungry)</li>
      <li>3-4: Hungry (good time to eat)</li>
      <li>5-6: Satisfied (ideal stopping point)</li>
      <li>7-8: Full</li>
      <li>9-10: Uncomfortably full (avoid)</li>
    </ul>
    <p>Aim to eat around 3-4 and stop at 6-7.</p>

    <h3>3. Engage All Your Senses</h3>
    <p>Notice:</p>
    <ul>
      <li><strong>Sight:</strong> Colors and presentation</li>
      <li><strong>Smell:</strong> Aromas before eating</li>
      <li><strong>Touch:</strong> Textures and temperature</li>
      <li><strong>Taste:</strong> Flavors and how they change</li>
      <li><strong>Sound:</strong> Crunching, sizzling</li>
    </ul>

    <h3>4. Chew Thoroughly</h3>
    <p>Aim for 20-30 chews per bite. This aids digestion and slows eating pace.</p>

    <h3>5. Put Down Your Utensils</h3>
    <p>Between bites, set down your fork or spoon. This naturally slows your eating pace.</p>

    <h3>6. Practice Gratitude</h3>
    <p>Take a moment before eating to appreciate your food - where it came from, who prepared it, and the nourishment it provides.</p>

    <h3>7. Distinguish Physical vs. Emotional Hunger</h3>
    <p><strong>Physical Hunger:</strong></p>
    <ul>
      <li>Develops gradually</li>
      <li>Satisfied by any food</li>
      <li>Stops when full</li>
      <li>No guilt after eating</li>
    </ul>
    <p><strong>Emotional Hunger:</strong></p>
    <ul>
      <li>Comes on suddenly</li>
      <li>Craves specific foods</li>
      <li>Continues past fullness</li>
      <li>Triggers guilt or shame</li>
    </ul>

    <h3>8. Eat Sitting Down</h3>
    <p>Create a dedicated eating space. Standing or eating on-the-go makes it harder to be mindful.</p>

    <h3>9. Check In Mid-Meal</h3>
    <p>Halfway through your meal, pause and assess:</p>
    <ul>
      <li>How hungry am I now?</li>
      <li>How does the food taste?</li>
      <li>Am I eating out of hunger or habit?</li>
    </ul>

    <h3>10. Let Go of Judgment</h3>
    <p>No food is "good" or "bad." Remove moral labels and eat without guilt.</p>

    <h2>Practical Mindful Eating Exercises</h2>

    <h3>The Raisin Exercise (Beginner)</h3>
    <ol>
      <li>Hold a single raisin</li>
      <li>Observe it like you''ve never seen one before</li>
      <li>Notice texture, color, smell</li>
      <li>Place it in your mouth without chewing</li>
      <li>Notice how it feels on your tongue</li>
      <li>Slowly chew, noticing flavors and textures</li>
      <li>Swallow mindfully</li>
    </ol>
    <p><em>This 5-minute exercise helps you understand mindful eating principles.</em></p>

    <h3>The Pause Practice</h3>
    <p>Before eating, take 3 deep breaths and ask:</p>
    <ul>
      <li>Am I physically hungry?</li>
      <li>What am I feeling emotionally?</li>
      <li>What does my body need right now?</li>
    </ul>

    <h3>The Gratitude Practice</h3>
    <p>Before each meal, spend 30 seconds appreciating:</p>
    <ul>
      <li>The farmers who grew the food</li>
      <li>The people who prepared it</li>
      <li>Your body''s ability to receive nourishment</li>
    </ul>

    <h2>Overcoming Common Challenges</h2>

    <h3>"I Don''t Have Time"</h3>
    <p><strong>Solution:</strong> Start with one mindful meal per day. Even 10 minutes makes a difference.</p>

    <h3>"I Eat With Others Who Rush"</h3>
    <p><strong>Solution:</strong> You can eat mindfully in any environment. Focus on your own pace.</p>

    <h3>"I Forget to Be Mindful"</h3>
    <p><strong>Solution:</strong> Set reminders, place visual cues (e.g., note at table), or use the GreenoFig app to track mindful meals.</p>

    <h3>"I Still Overeat"</h3>
    <p><strong>Solution:</strong> Be patient with yourself. Mindful eating is a practice, not perfection. Each meal is a new opportunity.</p>

    <h2>Mindful Eating for Weight Management</h2>
    <p>Studies show mindful eating can lead to:</p>
    <ul>
      <li>Reduced binge eating by 4x</li>
      <li>Decreased emotional eating</li>
      <li>Average weight loss of 4-8 pounds over 6 months without dieting</li>
      <li>Better long-term weight maintenance than traditional dieting</li>
    </ul>

    <h2>Creating a Mindful Eating Environment</h2>
    <ul>
      <li>Use smaller plates (8-10 inches)</li>
      <li>Eat at a table, not your desk or couch</li>
      <li>Create pleasant ambiance (lighting, music)</li>
      <li>Meal prep to reduce decision fatigue</li>
      <li>Keep distracting foods out of sight</li>
    </ul>

    <h2>30-Day Mindful Eating Challenge</h2>
    <p><strong>Week 1:</strong> Eat one meal per day without distractions<br>
    <strong>Week 2:</strong> Practice the hunger scale before and after meals<br>
    <strong>Week 3:</strong> Chew each bite 20-30 times<br>
    <strong>Week 4:</strong> Begin each meal with 3 gratitude thoughts</p>

    <blockquote><p>"Mindful eating is not a diet. It''s a way to rediscover one of the most pleasurable things we do as human beings. It''s also a path to uncovering many wonderful activities that nourish body, mind, and spirit."</p></blockquote>

    <p><strong>Ready to transform your relationship with food?</strong> Start with just one mindful meal today. Your body and mind will thank you.</p>',
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1200&h=675',
    'Mindful Eating: Transform Your Relationship with Food',
    'Learn mindful eating practices to stop emotional eating, improve digestion, and develop a healthy relationship with food.',
    'mindful eating',
    ARRAY['mindful eating', 'emotional eating', 'healthy habits', 'nutrition', 'wellness'],
    'published',
    NOW() - INTERVAL '1 day',
    'Nutrition Basics',
    ARRAY['Nutrition', 'Wellness', 'Mindfulness'],
    true
  );

  RAISE NOTICE '✅ Successfully inserted 10 blog posts!';

END $$;

-- Success message
SELECT 'Blog posts created successfully! 🎉' as status;
SELECT '10 health & wellness blog posts added' as info;
