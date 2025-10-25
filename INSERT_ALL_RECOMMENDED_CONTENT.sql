-- ============================================
-- INSERT ALL RECOMMENDED WEBSITE CONTENT
-- GreenFig Nutrition & Wellness Platform
-- Run this in Supabase SQL Editor
-- ============================================

BEGIN;

-- ============================================
-- 1. HOMEPAGE SECTIONS (5 sections)
-- ============================================

INSERT INTO homepage_content (section_type, section_order, is_active, title, subtitle, description, cta_text, cta_link)
VALUES
-- Section 1: Hero
('hero', 0, true,
 'Transform Your Health with Personalized Nutrition',
 'AI-Powered Meal Plans & Expert Guidance',
 'Join thousands who''ve achieved their health goals with our science-backed nutrition platform. Get custom meal plans, track your progress, and connect with certified nutritionists.',
 'Start Your Free Trial',
 '/signup'),

-- Section 2: Features
('features', 1, true,
 'Everything You Need to Succeed',
 'Comprehensive Tools for Your Wellness Journey',
 'From personalized meal planning to real-time progress tracking, our platform provides all the tools you need to transform your health and achieve lasting results.',
 'Explore All Features',
 '/features'),

-- Section 3: Stats
('stats', 2, true,
 'Trusted by Health Enthusiasts Worldwide',
 'Real Results, Real People',
 '10,000+ Active Users | 95% Success Rate | 50+ Expert Nutritionists | 100,000+ Meals Planned',
 'Read Success Stories',
 '/testimonials'),

-- Section 4: Process
('process', 3, true,
 'Your Journey in 3 Simple Steps',
 'Getting Started is Easy',
 '1. Complete Your Health Assessment - Tell us about your goals, dietary preferences, and lifestyle
2. Get Your Custom Plan - Receive AI-generated meal plans reviewed by certified nutritionists
3. Track & Achieve - Monitor progress, adjust as needed, and celebrate your wins',
 'Get Started Now',
 '/signup'),

-- Section 5: Final CTA
('cta', 4, true,
 'Ready to Transform Your Health?',
 'Join our community today and start your personalized nutrition journey',
 'Start with our free 14-day trial. No credit card required. Cancel anytime. Access all premium features and connect with expert nutritionists.',
 'Start Free Trial',
 '/signup');

-- ============================================
-- 2. FEATURES (8 features)
-- ============================================

INSERT INTO features (name, description, feature_icon, category, category_icon, plan_tier, display_order)
VALUES
-- Feature 1: AI Meal Planning
('AI-Powered Meal Planning',
 'Get personalized meal plans tailored to your goals, dietary restrictions, and preferences. Our AI analyzes your nutritional needs and creates balanced, delicious meals.',
 'Brain',
 'Core Features',
 'Sparkles',
 'Premium',
 0),

-- Feature 2: Nutrition Tracking
('Smart Nutrition Tracking',
 'Effortlessly log meals with our barcode scanner and extensive food database. Track macros, calories, and micronutrients with precision and ease.',
 'Activity',
 'Core Features',
 'Sparkles',
 'Starter',
 1),

-- Feature 3: Expert Support
('Certified Nutritionist Support',
 'Connect with licensed nutritionists for personalized guidance. Get expert advice, meal plan reviews, and answers to your nutrition questions.',
 'Users',
 'Expert Support',
 'Heart',
 'Premium',
 2),

-- Feature 4: Progress Analytics
('Detailed Progress Analytics',
 'Visualize your journey with comprehensive charts and insights. Track weight, body measurements, energy levels, and nutritional goals over time.',
 'TrendingUp',
 'Analytics & Insights',
 'BarChart',
 'Premium',
 3),

-- Feature 5: Recipe Library
('5,000+ Healthy Recipes',
 'Access our vast library of nutritionist-approved recipes. Filter by dietary preference, cooking time, and nutritional goals. Save favorites and create shopping lists.',
 'BookOpen',
 'Content Library',
 'Book',
 'Premium',
 4),

-- Feature 6: Shopping Lists
('Auto-Generated Shopping Lists',
 'Get organized with automatically generated shopping lists based on your meal plans. Organized by category for efficient grocery shopping.',
 'ShoppingCart',
 'Meal Planning Tools',
 'Utensils',
 'Premium',
 5),

-- Feature 7: Mobile App
('Mobile App Sync',
 'Access your plans and track progress on-the-go with our iOS and Android apps. Seamless sync across all devices keeps you on track anywhere.',
 'Smartphone',
 'Platform Access',
 'Globe',
 'Starter',
 6),

-- Feature 8: Community
('Supportive Community',
 'Join our private community of health enthusiasts. Share recipes, celebrate wins, get motivation, and connect with like-minded individuals.',
 'Heart',
 'Community',
 'Users',
 'Starter',
 7);

-- ============================================
-- 3. PRICING PLANS (3 tiers)
-- ============================================

INSERT INTO pricing_plans (name, price_monthly, price_yearly, description, features, is_popular, display_order)
VALUES
-- Plan 1: Free Starter
('Starter',
 0,
 0,
 'Perfect for getting started with basic nutrition tracking',
 ARRAY[
   'Basic meal logging',
   'Calorie tracking',
   'Limited recipe access (100 recipes)',
   'Mobile app access',
   'Community forum access'
 ],
 false,
 0),

-- Plan 2: Premium (Most Popular)
('Premium',
 29,
 278,
 'Our most popular plan with AI meal planning and expert support',
 ARRAY[
   'Everything in Starter, plus:',
   'AI-powered meal planning',
   'Full recipe library (5,000+ recipes)',
   'Detailed nutrition analytics',
   'Progress tracking & insights',
   'Auto-generated shopping lists',
   'Email support',
   '2 nutritionist consultations/month'
 ],
 true,
 1),

-- Plan 3: Elite
('Elite',
 79,
 758,
 'For those who want premium support and advanced features',
 ARRAY[
   'Everything in Premium, plus:',
   'Dedicated nutritionist (weekly check-ins)',
   'Custom supplement recommendations',
   'Advanced body composition tracking',
   'Priority support (24/7)',
   'Exclusive masterclasses & webinars',
   'Early access to new features',
   'Family sharing (up to 4 members)'
 ],
 false,
 2);

-- ============================================
-- 4. TESTIMONIALS (6 testimonials)
-- ============================================

INSERT INTO testimonials (customer_name, customer_title, customer_company, quote, full_review, rating, category, is_featured, is_active, verified, display_order)
VALUES
-- Testimonial 1: Sarah Mitchell
('Sarah Mitchell', 'Busy Mom & Teacher', NULL,
 'I''ve lost 35 pounds and finally feel energized throughout the day. The meal plans fit perfectly into my busy schedule, and the nutritionist support kept me accountable!',
 'Before GreenFig, I was constantly exhausted and struggling with my weight. The personalized meal plans were a game-changer - they actually considered my hectic schedule and picky kids! My assigned nutritionist helped me navigate challenges and celebrate small wins. Six months later, I''m down 35 pounds, my energy is through the roof, and I''ve learned sustainable habits that''ll last a lifetime. This isn''t a diet, it''s a lifestyle transformation.',
 5, 'general', true, true, true, 0),

-- Testimonial 2: Marcus Thompson
('Marcus Thompson', 'Fitness Enthusiast', NULL,
 'The macro tracking and meal planning tools are incredible. I gained 12 pounds of lean muscle while staying shredded. Best investment in my fitness journey!',
 'As someone who''s tried every fitness app out there, GreenFig stands out for its precision and flexibility. The ability to customize macros based on training days vs. rest days is brilliant. The recipe library has amazing high-protein options that actually taste good. My nutritionist understood my bodybuilding goals and helped optimize my meal timing. The analytics dashboard shows exactly how my nutrition correlates with my gym performance. Absolutely worth every penny.',
 5, 'fitness', true, true, true, 1),

-- Testimonial 3: Dr. Jennifer Lee
('Dr. Jennifer Lee', 'Physician', 'Seattle Medical Center',
 'As a doctor, I appreciate the science-backed approach. I recommend GreenFig to my patients struggling with nutrition-related health issues.',
 'I''m impressed by the evidence-based methodology behind GreenFig''s recommendations. The platform considers not just calories, but nutrient density, meal timing, and individual health conditions. I''ve seen my patients with prediabetes, high cholesterol, and hypertension make remarkable improvements. The certified nutritionists on staff are knowledgeable and professional. This is one of the few nutrition apps I confidently recommend to patients.',
 5, 'wellness', true, true, true, 2),

-- Testimonial 4: David Rodriguez
('David Rodriguez', 'Type 2 Diabetic', NULL,
 'My A1C dropped from 8.2 to 5.9 in just 4 months. My doctor was amazed. The diabetic-friendly meal plans and portion control tools saved my life.',
 'When I was diagnosed with Type 2 diabetes, I felt overwhelmed and scared. GreenFig''s diabetic-specific meal plans made managing my condition so much easier. The blood sugar tracking integration helped me see how different foods affected me. My nutritionist taught me about glycemic index and load in practical ways. Four months in, my A1C went from 8.2 to 5.9, my doctor reduced my medication, and I lost 28 pounds. This platform literally changed my life trajectory.',
 5, 'wellness', true, true, true, 3),

-- Testimonial 5: Emily Chang
('Emily Chang', 'Plant-Based Athlete', NULL,
 'Finally, a nutrition app that understands vegan athletes! The plant-based meal plans are creative, delicious, and perfectly balanced for my training.',
 'I''ve been vegan for 5 years and training for marathons for 3. Finding the right balance of plant-based protein, carbs, and healthy fats was always challenging. GreenFig''s vegan athlete meal plans are phenomenal - they ensure I''m getting complete proteins, enough iron, B12, and omega-3s. The recipes are creative and actually enjoyable to eat. My recovery has improved, my running times are better, and I finally feel confident I''m fueling my body properly.',
 5, 'nutrition', false, true, true, 4),

-- Testimonial 6: Robert Jackson
('Robert Jackson', 'CEO', 'TechStart Innovations',
 'The time I save with meal planning and grocery lists is incredible. My productivity is up, stress is down, and I''ve never eaten healthier.',
 'As a CEO, time is my most valuable resource. GreenFig has given me back hours every week. The auto-generated shopping lists and simple meal prep guidance mean I''m not thinking about food constantly. The quick, healthy recipes fit my schedule. What surprised me most was the mental clarity and energy boost from proper nutrition. My team has noticed the difference - I''m more focused, less stressed, and making better decisions. Several of my executives have joined because of my results.',
 5, 'general', false, true, true, 5);

-- ============================================
-- 5. CONTACT INFORMATION
-- ============================================

-- Deactivate existing contact info
UPDATE contact_info SET is_active = false WHERE is_active = true;

-- Insert new contact information
INSERT INTO contact_info (email, phone, address, city, state, country, postal_code, facebook_url, twitter_url, instagram_url, linkedin_url, youtube_url, tiktok_url, is_active)
VALUES (
  'support@greenfig.com',
  '+1 (555) 743-3644',
  '2150 Wellness Boulevard',
  'San Francisco',
  'CA',
  'USA',
  '94105',
  'https://facebook.com/greenfignutrition',
  'https://twitter.com/greenfighealth',
  'https://instagram.com/greenfig_wellness',
  'https://linkedin.com/company/greenfig-nutrition',
  'https://youtube.com/@greenfignutrition',
  'https://tiktok.com/@greenfig_health',
  true
);

-- ============================================
-- 6. SEO SETTINGS (5 key pages)
-- ============================================

INSERT INTO seo_settings (page_path, page_name, meta_title, meta_description, og_title, og_description, og_image_url, twitter_title, twitter_description, twitter_image_url, canonical_url, robots_meta, sitemap_priority, sitemap_changefreq, is_active)
VALUES
-- Homepage SEO
('/', 'Homepage',
 'GreenFig - AI-Powered Nutrition & Meal Planning Platform',
 'Transform your health with personalized meal plans, expert nutritionist support, and smart tracking. Join 10,000+ users achieving their wellness goals. Start free trial today!',
 'GreenFig: Your Personal Nutrition & Wellness Platform',
 'Get AI-powered meal plans, track nutrition, and connect with certified nutritionists. Achieve your health goals with science-backed guidance.',
 'https://yourdomain.com/images/og-homepage.jpg',
 'GreenFig - Transform Your Health with AI Nutrition',
 'Personalized meal plans + expert support + smart tracking. Join 10,000+ users. Start free!',
 'https://yourdomain.com/images/twitter-homepage.jpg',
 'https://yourdomain.com/',
 'index,follow',
 1.0,
 'weekly',
 true),

-- Features Page SEO
('/features', 'Features',
 'Features - AI Meal Planning, Nutrition Tracking & Expert Support | GreenFig',
 'Explore GreenFig''s powerful features: AI meal planning, smart nutrition tracking, 5,000+ recipes, certified nutritionist support, and detailed analytics. See all features.',
 'GreenFig Platform Features - Everything You Need to Succeed',
 'AI-powered meal planning, nutrition tracking, expert nutritionist support, recipe library, progress analytics, and more.',
 'https://yourdomain.com/images/og-features.jpg',
 'GreenFig Features: AI Meal Planning & Nutrition Tracking',
 'Discover all the tools you need for your wellness journey. AI meal plans, expert support, and comprehensive tracking.',
 'https://yourdomain.com/images/twitter-features.jpg',
 'https://yourdomain.com/features',
 'index,follow',
 0.9,
 'monthly',
 true),

-- Pricing Page SEO
('/pricing', 'Pricing',
 'Pricing Plans - Start Free Trial | GreenFig Nutrition Platform',
 'Choose the perfect plan for your wellness journey. Free Starter, Premium ($29/mo), or Elite ($79/mo). All plans include 14-day free trial. No credit card required.',
 'GreenFig Pricing - Plans Starting at $0/month',
 'Flexible pricing for everyone. Start free or upgrade to Premium for AI meal planning and nutritionist support. 14-day free trial on all paid plans.',
 'https://yourdomain.com/images/og-pricing.jpg',
 'GreenFig Pricing - Start Your Free Trial Today',
 'Plans from $0-$79/mo. 14-day free trial on Premium & Elite. No credit card required.',
 'https://yourdomain.com/images/twitter-pricing.jpg',
 'https://yourdomain.com/pricing',
 'index,follow',
 0.9,
 'monthly',
 true),

-- About Page SEO
('/about', 'About',
 'About GreenFig - Our Mission to Transform Health Through Nutrition',
 'Learn about GreenFig''s mission to make personalized nutrition accessible to everyone. Meet our team of certified nutritionists and discover our science-backed approach.',
 'About GreenFig - Revolutionizing Personal Nutrition',
 'Founded by nutritionists and tech experts, GreenFig combines AI technology with human expertise to make healthy eating accessible and sustainable.',
 'https://yourdomain.com/images/og-about.jpg',
 'About GreenFig - Our Story & Mission',
 'Combining AI technology with certified nutritionist expertise to transform lives through better nutrition.',
 'https://yourdomain.com/images/twitter-about.jpg',
 'https://yourdomain.com/about',
 'index,follow',
 0.7,
 'yearly',
 true),

-- Blog Page SEO
('/blog', 'Blog',
 'Nutrition Blog - Expert Tips, Recipes & Wellness Advice | GreenFig',
 'Expert nutrition advice, healthy recipes, meal planning tips, and wellness guidance from certified nutritionists. Stay informed on your health journey.',
 'GreenFig Blog - Nutrition Tips & Wellness Advice',
 'Expert articles on nutrition, meal planning, healthy recipes, and wellness. Learn from certified nutritionists.',
 'https://yourdomain.com/images/og-blog.jpg',
 'GreenFig Nutrition Blog - Expert Health Tips',
 'Recipes, nutrition science, meal planning tips, and wellness advice from experts.',
 'https://yourdomain.com/images/twitter-blog.jpg',
 'https://yourdomain.com/blog',
 'index,follow',
 0.8,
 'daily',
 true);

-- ============================================
-- 7. ABOUT PAGE CONTENT
-- ============================================

INSERT INTO site_content (page_key, content)
VALUES (
  'about',
  '{
    "title": "About GreenFig",
    "subtitle": "Transforming Lives Through Personalized Nutrition",
    "sections": [
      {
        "heading": "Our Mission",
        "content": "We believe everyone deserves access to personalized, science-backed nutrition guidance. GreenFig combines cutting-edge AI technology with certified nutritionist expertise to make healthy eating accessible, sustainable, and enjoyable."
      },
      {
        "heading": "Our Story",
        "content": "Founded in 2023 by a team of registered dietitians and technology experts, GreenFig was born from a simple observation: traditional diet plans fail because they''re not personalized. We set out to create a platform that understands you as an individual - your goals, preferences, lifestyle, and unique nutritional needs."
      },
      {
        "heading": "What Makes Us Different",
        "bullets": [
          {
            "title": "Science-Backed Approach",
            "description": "Every recommendation is rooted in nutritional science and reviewed by certified professionals."
          },
          {
            "title": "Human + AI",
            "description": "We combine AI efficiency with human expertise. Technology creates your plans; nutritionists refine and support you."
          },
          {
            "title": "Sustainability Focus",
            "description": "We don''t believe in restrictive diets. We teach sustainable habits that fit your real life."
          },
          {
            "title": "Comprehensive Support",
            "description": "From meal planning to progress tracking to one-on-one nutritionist consultations, we support every step of your journey."
          }
        ]
      },
      {
        "heading": "Our Team",
        "content": "Our team includes 50+ certified nutritionists, registered dietitians, and wellness coaches, backed by experienced software engineers and data scientists. Together, we''re passionate about making nutrition simple, personal, and effective."
      },
      {
        "heading": "Our Values",
        "bullets": [
          {"title": "Evidence-Based", "description": "Science always leads our recommendations"},
          {"title": "Personalization", "description": "No two people are the same; no two plans should be either"},
          {"title": "Accessibility", "description": "Quality nutrition guidance shouldn''t be a luxury"},
          {"title": "Sustainability", "description": "Quick fixes don''t work; sustainable habits do"},
          {"title": "Community", "description": "Support and connection accelerate success"}
        ]
      },
      {
        "heading": "Join Our Mission",
        "content": "Whether you''re managing a health condition, training for athletic performance, or simply want to feel better, we''re here to guide you. Join thousands who''ve transformed their health with GreenFig."
      }
    ]
  }'::jsonb
)
ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content;

-- ============================================
-- 8. FAQ PAGE CONTENT
-- ============================================

INSERT INTO site_content (page_key, content)
VALUES (
  'faq',
  '{
    "title": "Frequently Asked Questions",
    "subtitle": "Everything you need to know about GreenFig",
    "categories": [
      {
        "name": "Features",
        "faqs": [
          {
            "question": "How does the AI meal planning work?",
            "answer": "Our AI analyzes your profile (goals, dietary restrictions, preferences, activity level) and generates personalized meal plans optimized for your nutritional needs. Each plan is then reviewed by a certified nutritionist to ensure it''s safe, balanced, and effective. The AI learns from your feedback, continuously improving recommendations."
          },
          {
            "question": "What dietary preferences do you support?",
            "answer": "We support all major dietary preferences including vegan, vegetarian, pescatarian, keto, paleo, Mediterranean, low-carb, high-protein, gluten-free, dairy-free, and more. You can also specify allergies and foods you dislike. Our meal plans adapt to your exact needs."
          },
          {
            "question": "How accurate is the nutrition tracking?",
            "answer": "Very accurate! Our database contains over 1 million verified foods with detailed nutritional information. We also integrate with fitness trackers and support barcode scanning for packaged foods. For restaurant meals, we provide estimates based on standard recipes. You can always manually adjust values if needed."
          },
          {
            "question": "Do I need to cook every meal from scratch?",
            "answer": "Not at all! Our meal plans include a mix of quick recipes (10-15 minutes), batch cooking options, and suggestions for healthy convenience foods. You can set your cooking time preferences, and we''ll adjust accordingly. We also provide eating-out guides for when you dine at restaurants."
          },
          {
            "question": "What if I don''t like the meal plans?",
            "answer": "You have full control! You can regenerate meal plans anytime, swap individual meals, mark foods you dislike (we''ll never suggest them again), and adjust portion sizes. Your nutritionist can also help refine plans based on your feedback. The AI learns from your preferences over time, getting better at suggesting meals you''ll love."
          }
        ]
      },
      {
        "name": "Support",
        "faqs": [
          {
            "question": "Can I speak with a real nutritionist?",
            "answer": "Absolutely! Premium and Elite members get access to certified nutritionists. Premium members receive 2 consultations per month via messaging or video call. Elite members get a dedicated nutritionist with weekly check-ins. Our nutritionists are all licensed professionals with specialized training."
          }
        ]
      },
      {
        "name": "Pricing",
        "faqs": [
          {
            "question": "How much does GreenFig cost?",
            "answer": "We offer three plans: Starter (free forever), Premium ($29/month), and Elite ($79/month). Premium and Elite plans include a 14-day free trial with no credit card required. Annual billing saves 20%. All plans include access to our mobile apps and community."
          },
          {
            "question": "Can I cancel anytime?",
            "answer": "Yes! There are no long-term contracts. You can cancel your subscription at any time from your account settings. You''ll retain access until the end of your current billing period. If you cancel during your free trial, you won''t be charged anything."
          },
          {
            "question": "Can my whole family use one account?",
            "answer": "The Elite plan includes family sharing for up to 4 members, each with their own personalized meal plans and tracking. Starter and Premium plans are designed for individual use. Each family member gets their own profile, preferences, and customized recommendations."
          }
        ]
      },
      {
        "name": "Platform",
        "faqs": [
          {
            "question": "Do you have a mobile app?",
            "answer": "Yes! We have native apps for both iOS (iPhone/iPad) and Android devices. The apps sync seamlessly with the web platform, allowing you to log meals, track progress, view meal plans, and communicate with nutritionists on-the-go. Download from the App Store or Google Play."
          }
        ]
      },
      {
        "name": "Health",
        "faqs": [
          {
            "question": "Can GreenFig help with medical conditions like diabetes or high blood pressure?",
            "answer": "Many of our users successfully manage health conditions with GreenFig''s nutrition plans, always in coordination with their healthcare providers. Our nutritionists can create plans that support various health goals. However, GreenFig is not a medical service and should not replace professional medical advice. Always consult your doctor before making significant dietary changes."
          }
        ]
      },
      {
        "name": "General",
        "faqs": [
          {
            "question": "How long does it take to see results?",
            "answer": "Results vary based on individual goals and consistency. Most users report increased energy within 1-2 weeks. For weight loss goals, healthy sustainable loss is 1-2 pounds per week. For athletic performance, users often see improvements in 3-4 weeks. The key is consistency - our platform helps you build sustainable habits for long-term success."
          }
        ]
      }
    ]
  }'::jsonb
)
ON CONFLICT (page_key) DO UPDATE SET content = EXCLUDED.content;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT '✅ CONTENT INSERTION COMPLETE!' as status;
SELECT '';
SELECT 'Homepage Sections: ' || COUNT(*) || ' active' as count FROM homepage_content WHERE is_active = true;
SELECT 'Features: ' || COUNT(*) || ' active' as count FROM features WHERE is_active = true;
SELECT 'Pricing Plans: ' || COUNT(*) || ' active' as count FROM pricing_plans WHERE is_active = true;
SELECT 'Testimonials: ' || COUNT(*) || ' active' as count FROM testimonials WHERE is_active = true;
SELECT 'SEO Settings: ' || COUNT(*) || ' pages configured' as count FROM seo_settings WHERE is_active = true;
SELECT 'Contact Info: ' || COUNT(*) || ' active' as count FROM contact_info WHERE is_active = true;
SELECT 'Site Content Pages: ' || COUNT(*) || ' pages (about, faq)' as count FROM site_content WHERE page_key IN ('about', 'faq');
