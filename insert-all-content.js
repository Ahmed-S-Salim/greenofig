/**
 * Script to insert all recommended website content into Supabase
 * Run with: node insert-all-content.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Need: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertAllContent() {
  console.log('🚀 Starting content insertion...\n');

  try {
    // ============================================
    // 0. CLEAR EXISTING DATA (Optional - comment out to keep existing data)
    // ============================================
    console.log('🗑️  Clearing existing demo data...');
    await supabase.from('homepage_content').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('features').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pricing_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('seo_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Existing data cleared\n');

    // ============================================
    // 1. HOMEPAGE SECTIONS
    // ============================================
    console.log('📝 Inserting Homepage Sections...');
    const { data: homepageData, error: homepageError } = await supabase
      .from('homepage_content')
      .insert([
        {
          section_type: 'hero',
          section_order: 0,
          is_active: true,
          title: 'Transform Your Health with Personalized Nutrition',
          subtitle: 'AI-Powered Meal Plans & Expert Guidance',
          description: 'Join thousands who\'ve achieved their health goals with our science-backed nutrition platform. Get custom meal plans, track your progress, and connect with certified nutritionists.',
          cta_text: 'Start Your Free Trial',
          cta_link: '/signup'
        },
        {
          section_type: 'features',
          section_order: 1,
          is_active: true,
          title: 'Everything You Need to Succeed',
          subtitle: 'Comprehensive Tools for Your Wellness Journey',
          description: 'From personalized meal planning to real-time progress tracking, our platform provides all the tools you need to transform your health and achieve lasting results.',
          cta_text: 'Explore All Features',
          cta_link: '/features'
        },
        {
          section_type: 'stats',
          section_order: 2,
          is_active: true,
          title: 'Trusted by Health Enthusiasts Worldwide',
          subtitle: 'Real Results, Real People',
          description: '10,000+ Active Users | 95% Success Rate | 50+ Expert Nutritionists | 100,000+ Meals Planned',
          cta_text: 'Read Success Stories',
          cta_link: '/testimonials'
        },
        {
          section_type: 'process',
          section_order: 3,
          is_active: true,
          title: 'Your Journey in 3 Simple Steps',
          subtitle: 'Getting Started is Easy',
          description: '1. Complete Your Health Assessment - Tell us about your goals, dietary preferences, and lifestyle\n2. Get Your Custom Plan - Receive AI-generated meal plans reviewed by certified nutritionists\n3. Track & Achieve - Monitor progress, adjust as needed, and celebrate your wins',
          cta_text: 'Get Started Now',
          cta_link: '/signup'
        },
        {
          section_type: 'cta',
          section_order: 4,
          is_active: true,
          title: 'Ready to Transform Your Health?',
          subtitle: 'Join our community today and start your personalized nutrition journey',
          description: 'Start with our free 14-day trial. No credit card required. Cancel anytime. Access all premium features and connect with expert nutritionists.',
          cta_text: 'Start Free Trial',
          cta_link: '/signup'
        }
      ]);

    if (homepageError) throw homepageError;
    console.log('✅ Homepage Sections: 5 inserted\n');

    // ============================================
    // 2. FEATURES
    // ============================================
    console.log('📝 Inserting Features...');
    const { data: featuresData, error: featuresError } = await supabase
      .from('features')
      .insert([
        {
          name: 'AI-Powered Meal Planning',
          description: 'Get personalized meal plans tailored to your goals, dietary restrictions, and preferences. Our AI analyzes your nutritional needs and creates balanced, delicious meals.',
          feature_icon: 'Brain',
          category: 'Core Features',
          category_icon: 'Sparkles',
          plan_tier: 'Premium',
          display_order: 0
        },
        {
          name: 'Smart Nutrition Tracking',
          description: 'Effortlessly log meals with our barcode scanner and extensive food database. Track macros, calories, and micronutrients with precision and ease.',
          feature_icon: 'Activity',
          category: 'Core Features',
          category_icon: 'Sparkles',
          plan_tier: 'Starter',
          display_order: 1
        },
        {
          name: 'Certified Nutritionist Support',
          description: 'Connect with licensed nutritionists for personalized guidance. Get expert advice, meal plan reviews, and answers to your nutrition questions.',
          feature_icon: 'Users',
          category: 'Expert Support',
          category_icon: 'Heart',
          plan_tier: 'Premium',
          display_order: 2
        },
        {
          name: 'Detailed Progress Analytics',
          description: 'Visualize your journey with comprehensive charts and insights. Track weight, body measurements, energy levels, and nutritional goals over time.',
          feature_icon: 'TrendingUp',
          category: 'Analytics & Insights',
          category_icon: 'BarChart',
          plan_tier: 'Premium',
          display_order: 3
        },
        {
          name: '5,000+ Healthy Recipes',
          description: 'Access our vast library of nutritionist-approved recipes. Filter by dietary preference, cooking time, and nutritional goals. Save favorites and create shopping lists.',
          feature_icon: 'BookOpen',
          category: 'Content Library',
          category_icon: 'Book',
          plan_tier: 'Premium',
          display_order: 4
        },
        {
          name: 'Auto-Generated Shopping Lists',
          description: 'Get organized with automatically generated shopping lists based on your meal plans. Organized by category for efficient grocery shopping.',
          feature_icon: 'ShoppingCart',
          category: 'Meal Planning Tools',
          category_icon: 'Utensils',
          plan_tier: 'Premium',
          display_order: 5
        },
        {
          name: 'Mobile App Sync',
          description: 'Access your plans and track progress on-the-go with our iOS and Android apps. Seamless sync across all devices keeps you on track anywhere.',
          feature_icon: 'Smartphone',
          category: 'Platform Access',
          category_icon: 'Globe',
          plan_tier: 'Starter',
          display_order: 6
        },
        {
          name: 'Supportive Community',
          description: 'Join our private community of health enthusiasts. Share recipes, celebrate wins, get motivation, and connect with like-minded individuals.',
          feature_icon: 'Heart',
          category: 'Community',
          category_icon: 'Users',
          plan_tier: 'Starter',
          display_order: 7
        }
      ]);

    if (featuresError) throw featuresError;
    console.log('✅ Features: 8 inserted\n');

    // ============================================
    // 3. PRICING PLANS
    // ============================================
    console.log('📝 Inserting Pricing Plans...');
    const { data: pricingData, error: pricingError } = await supabase
      .from('pricing_plans')
      .insert([
        {
          name: 'Starter',
          price_monthly: 0,
          price_yearly: 0,
          description: 'Perfect for getting started with basic nutrition tracking',
          features: [
            'Basic meal logging',
            'Calorie tracking',
            'Limited recipe access (100 recipes)',
            'Mobile app access',
            'Community forum access'
          ],
          is_popular: false,
          display_order: 0
        },
        {
          name: 'Premium',
          price_monthly: 29,
          price_yearly: 278,
          description: 'Our most popular plan with AI meal planning and expert support',
          features: [
            'Everything in Starter, plus:',
            'AI-powered meal planning',
            'Full recipe library (5,000+ recipes)',
            'Detailed nutrition analytics',
            'Progress tracking & insights',
            'Auto-generated shopping lists',
            'Email support',
            '2 nutritionist consultations/month'
          ],
          is_popular: true,
          display_order: 1
        },
        {
          name: 'Elite',
          price_monthly: 79,
          price_yearly: 758,
          description: 'For those who want premium support and advanced features',
          features: [
            'Everything in Premium, plus:',
            'Dedicated nutritionist (weekly check-ins)',
            'Custom supplement recommendations',
            'Advanced body composition tracking',
            'Priority support (24/7)',
            'Exclusive masterclasses & webinars',
            'Early access to new features',
            'Family sharing (up to 4 members)'
          ],
          is_popular: false,
          display_order: 2
        }
      ]);

    if (pricingError) throw pricingError;
    console.log('✅ Pricing Plans: 3 inserted\n');

    // ============================================
    // 4. TESTIMONIALS
    // ============================================
    console.log('📝 Inserting Testimonials...');
    const { data: testimonialsData, error: testimonialsError } = await supabase
      .from('testimonials')
      .insert([
        {
          customer_name: 'Sarah Mitchell',
          customer_title: 'Busy Mom & Teacher',
          quote: 'I\'ve lost 35 pounds and finally feel energized throughout the day. The meal plans fit perfectly into my busy schedule, and the nutritionist support kept me accountable!',
          full_review: 'Before GreenFig, I was constantly exhausted and struggling with my weight. The personalized meal plans were a game-changer - they actually considered my hectic schedule and picky kids! My assigned nutritionist helped me navigate challenges and celebrate small wins. Six months later, I\'m down 35 pounds, my energy is through the roof, and I\'ve learned sustainable habits that\'ll last a lifetime. This isn\'t a diet, it\'s a lifestyle transformation.',
          rating: 5,
          category: 'general',
          is_featured: true,
          is_active: true,
          verified: true,
          display_order: 0
        },
        {
          customer_name: 'Marcus Thompson',
          customer_title: 'Fitness Enthusiast',
          quote: 'The macro tracking and meal planning tools are incredible. I gained 12 pounds of lean muscle while staying shredded. Best investment in my fitness journey!',
          full_review: 'As someone who\'s tried every fitness app out there, GreenFig stands out for its precision and flexibility. The ability to customize macros based on training days vs. rest days is brilliant. The recipe library has amazing high-protein options that actually taste good. My nutritionist understood my bodybuilding goals and helped optimize my meal timing. The analytics dashboard shows exactly how my nutrition correlates with my gym performance. Absolutely worth every penny.',
          rating: 5,
          category: 'fitness',
          is_featured: true,
          is_active: true,
          verified: true,
          display_order: 1
        },
        {
          customer_name: 'Dr. Jennifer Lee',
          customer_title: 'Physician',
          customer_company: 'Seattle Medical Center',
          quote: 'As a doctor, I appreciate the science-backed approach. I recommend GreenFig to my patients struggling with nutrition-related health issues.',
          full_review: 'I\'m impressed by the evidence-based methodology behind GreenFig\'s recommendations. The platform considers not just calories, but nutrient density, meal timing, and individual health conditions. I\'ve seen my patients with prediabetes, high cholesterol, and hypertension make remarkable improvements. The certified nutritionists on staff are knowledgeable and professional. This is one of the few nutrition apps I confidently recommend to patients.',
          rating: 5,
          category: 'wellness',
          is_featured: true,
          is_active: true,
          verified: true,
          display_order: 2
        },
        {
          customer_name: 'David Rodriguez',
          customer_title: 'Type 2 Diabetic',
          quote: 'My A1C dropped from 8.2 to 5.9 in just 4 months. My doctor was amazed. The diabetic-friendly meal plans and portion control tools saved my life.',
          full_review: 'When I was diagnosed with Type 2 diabetes, I felt overwhelmed and scared. GreenFig\'s diabetic-specific meal plans made managing my condition so much easier. The blood sugar tracking integration helped me see how different foods affected me. My nutritionist taught me about glycemic index and load in practical ways. Four months in, my A1C went from 8.2 to 5.9, my doctor reduced my medication, and I lost 28 pounds. This platform literally changed my life trajectory.',
          rating: 5,
          category: 'wellness',
          is_featured: true,
          is_active: true,
          verified: true,
          display_order: 3
        },
        {
          customer_name: 'Emily Chang',
          customer_title: 'Plant-Based Athlete',
          quote: 'Finally, a nutrition app that understands vegan athletes! The plant-based meal plans are creative, delicious, and perfectly balanced for my training.',
          full_review: 'I\'ve been vegan for 5 years and training for marathons for 3. Finding the right balance of plant-based protein, carbs, and healthy fats was always challenging. GreenFig\'s vegan athlete meal plans are phenomenal - they ensure I\'m getting complete proteins, enough iron, B12, and omega-3s. The recipes are creative and actually enjoyable to eat. My recovery has improved, my running times are better, and I finally feel confident I\'m fueling my body properly.',
          rating: 5,
          category: 'nutrition',
          is_featured: false,
          is_active: true,
          verified: true,
          display_order: 4
        },
        {
          customer_name: 'Robert Jackson',
          customer_title: 'CEO',
          customer_company: 'TechStart Innovations',
          quote: 'The time I save with meal planning and grocery lists is incredible. My productivity is up, stress is down, and I\'ve never eaten healthier.',
          full_review: 'As a CEO, time is my most valuable resource. GreenFig has given me back hours every week. The auto-generated shopping lists and simple meal prep guidance mean I\'m not thinking about food constantly. The quick, healthy recipes fit my schedule. What surprised me most was the mental clarity and energy boost from proper nutrition. My team has noticed the difference - I\'m more focused, less stressed, and making better decisions. Several of my executives have joined because of my results.',
          rating: 5,
          category: 'general',
          is_featured: false,
          is_active: true,
          verified: true,
          display_order: 5
        }
      ]);

    if (testimonialsError) throw testimonialsError;
    console.log('✅ Testimonials: 6 inserted\n');

    // ============================================
    // 5. CONTACT INFORMATION
    // ============================================
    console.log('📝 Inserting Contact Information...');

    // Deactivate existing contact info
    await supabase.from('contact_info').update({ is_active: false }).eq('is_active', true);

    const { data: contactData, error: contactError } = await supabase
      .from('contact_info')
      .insert([
        {
          email: 'support@greenfig.com',
          phone: '+1 (555) 743-3644',
          address: '2150 Wellness Boulevard',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postal_code: '94105',
          facebook_url: 'https://facebook.com/greenfignutrition',
          twitter_url: 'https://twitter.com/greenfighealth',
          instagram_url: 'https://instagram.com/greenfig_wellness',
          linkedin_url: 'https://linkedin.com/company/greenfig-nutrition',
          youtube_url: 'https://youtube.com/@greenfignutrition',
          tiktok_url: 'https://tiktok.com/@greenfig_health',
          is_active: true
        }
      ]);

    if (contactError) throw contactError;
    console.log('✅ Contact Information: 1 inserted\n');

    // ============================================
    // 6. SEO SETTINGS
    // ============================================
    console.log('📝 Inserting SEO Settings...');
    const { data: seoData, error: seoError } = await supabase
      .from('seo_settings')
      .insert([
        {
          page_path: '/',
          page_name: 'Homepage',
          meta_title: 'GreenFig - AI-Powered Nutrition & Meal Planning Platform',
          meta_description: 'Transform your health with personalized meal plans, expert nutritionist support, and smart tracking. Join 10,000+ users achieving their wellness goals. Start free trial today!',
          og_title: 'GreenFig: Your Personal Nutrition & Wellness Platform',
          og_description: 'Get AI-powered meal plans, track nutrition, and connect with certified nutritionists. Achieve your health goals with science-backed guidance.',
          og_image_url: 'https://yourdomain.com/images/og-homepage.jpg',
          twitter_title: 'GreenFig - Transform Your Health with AI Nutrition',
          twitter_description: 'Personalized meal plans + expert support + smart tracking. Join 10,000+ users. Start free!',
          twitter_image_url: 'https://yourdomain.com/images/twitter-homepage.jpg',
          canonical_url: 'https://yourdomain.com/',
          robots_meta: 'index,follow',
          sitemap_priority: 1.0,
          sitemap_changefreq: 'weekly',
          is_active: true
        },
        {
          page_path: '/features',
          page_name: 'Features',
          meta_title: 'Features - AI Meal Planning, Nutrition Tracking & Expert Support | GreenFig',
          meta_description: 'Explore GreenFig\'s powerful features: AI meal planning, smart nutrition tracking, 5,000+ recipes, certified nutritionist support, and detailed analytics. See all features.',
          og_title: 'GreenFig Platform Features - Everything You Need to Succeed',
          og_description: 'AI-powered meal planning, nutrition tracking, expert nutritionist support, recipe library, progress analytics, and more.',
          og_image_url: 'https://yourdomain.com/images/og-features.jpg',
          twitter_title: 'GreenFig Features: AI Meal Planning & Nutrition Tracking',
          twitter_description: 'Discover all the tools you need for your wellness journey. AI meal plans, expert support, and comprehensive tracking.',
          twitter_image_url: 'https://yourdomain.com/images/twitter-features.jpg',
          canonical_url: 'https://yourdomain.com/features',
          robots_meta: 'index,follow',
          sitemap_priority: 0.9,
          sitemap_changefreq: 'monthly',
          is_active: true
        },
        {
          page_path: '/pricing',
          page_name: 'Pricing',
          meta_title: 'Pricing Plans - Start Free Trial | GreenFig Nutrition Platform',
          meta_description: 'Choose the perfect plan for your wellness journey. Free Starter, Premium ($29/mo), or Elite ($79/mo). All plans include 14-day free trial. No credit card required.',
          og_title: 'GreenFig Pricing - Plans Starting at $0/month',
          og_description: 'Flexible pricing for everyone. Start free or upgrade to Premium for AI meal planning and nutritionist support. 14-day free trial on all paid plans.',
          og_image_url: 'https://yourdomain.com/images/og-pricing.jpg',
          twitter_title: 'GreenFig Pricing - Start Your Free Trial Today',
          twitter_description: 'Plans from $0-$79/mo. 14-day free trial on Premium & Elite. No credit card required.',
          twitter_image_url: 'https://yourdomain.com/images/twitter-pricing.jpg',
          canonical_url: 'https://yourdomain.com/pricing',
          robots_meta: 'index,follow',
          sitemap_priority: 0.9,
          sitemap_changefreq: 'monthly',
          is_active: true
        },
        {
          page_path: '/about',
          page_name: 'About',
          meta_title: 'About GreenFig - Our Mission to Transform Health Through Nutrition',
          meta_description: 'Learn about GreenFig\'s mission to make personalized nutrition accessible to everyone. Meet our team of certified nutritionists and discover our science-backed approach.',
          og_title: 'About GreenFig - Revolutionizing Personal Nutrition',
          og_description: 'Founded by nutritionists and tech experts, GreenFig combines AI technology with human expertise to make healthy eating accessible and sustainable.',
          og_image_url: 'https://yourdomain.com/images/og-about.jpg',
          twitter_title: 'About GreenFig - Our Story & Mission',
          twitter_description: 'Combining AI technology with certified nutritionist expertise to transform lives through better nutrition.',
          twitter_image_url: 'https://yourdomain.com/images/twitter-about.jpg',
          canonical_url: 'https://yourdomain.com/about',
          robots_meta: 'index,follow',
          sitemap_priority: 0.7,
          sitemap_changefreq: 'yearly',
          is_active: true
        },
        {
          page_path: '/blog',
          page_name: 'Blog',
          meta_title: 'Nutrition Blog - Expert Tips, Recipes & Wellness Advice | GreenFig',
          meta_description: 'Expert nutrition advice, healthy recipes, meal planning tips, and wellness guidance from certified nutritionists. Stay informed on your health journey.',
          og_title: 'GreenFig Blog - Nutrition Tips & Wellness Advice',
          og_description: 'Expert articles on nutrition, meal planning, healthy recipes, and wellness. Learn from certified nutritionists.',
          og_image_url: 'https://yourdomain.com/images/og-blog.jpg',
          twitter_title: 'GreenFig Nutrition Blog - Expert Health Tips',
          twitter_description: 'Recipes, nutrition science, meal planning tips, and wellness advice from experts.',
          twitter_image_url: 'https://yourdomain.com/images/twitter-blog.jpg',
          canonical_url: 'https://yourdomain.com/blog',
          robots_meta: 'index,follow',
          sitemap_priority: 0.8,
          sitemap_changefreq: 'daily',
          is_active: true
        }
      ]);

    if (seoError) throw seoError;
    console.log('✅ SEO Settings: 5 pages configured\n');

    // ============================================
    // 7. ABOUT PAGE CONTENT
    // ============================================
    console.log('📝 Inserting About Page Content...');
    const aboutContent = {
      title: 'About GreenFig',
      subtitle: 'Transforming Lives Through Personalized Nutrition',
      sections: [
        {
          heading: 'Our Mission',
          content: 'We believe everyone deserves access to personalized, science-backed nutrition guidance. GreenFig combines cutting-edge AI technology with certified nutritionist expertise to make healthy eating accessible, sustainable, and enjoyable.'
        },
        {
          heading: 'Our Story',
          content: 'Founded in 2023 by a team of registered dietitians and technology experts, GreenFig was born from a simple observation: traditional diet plans fail because they\'re not personalized. We set out to create a platform that understands you as an individual - your goals, preferences, lifestyle, and unique nutritional needs.'
        },
        {
          heading: 'What Makes Us Different',
          bullets: [
            { title: 'Science-Backed Approach', description: 'Every recommendation is rooted in nutritional science and reviewed by certified professionals.' },
            { title: 'Human + AI', description: 'We combine AI efficiency with human expertise. Technology creates your plans; nutritionists refine and support you.' },
            { title: 'Sustainability Focus', description: 'We don\'t believe in restrictive diets. We teach sustainable habits that fit your real life.' },
            { title: 'Comprehensive Support', description: 'From meal planning to progress tracking to one-on-one nutritionist consultations, we support every step of your journey.' }
          ]
        },
        {
          heading: 'Our Team',
          content: 'Our team includes 50+ certified nutritionists, registered dietitians, and wellness coaches, backed by experienced software engineers and data scientists. Together, we\'re passionate about making nutrition simple, personal, and effective.'
        },
        {
          heading: 'Our Values',
          bullets: [
            { title: 'Evidence-Based', description: 'Science always leads our recommendations' },
            { title: 'Personalization', description: 'No two people are the same; no two plans should be either' },
            { title: 'Accessibility', description: 'Quality nutrition guidance shouldn\'t be a luxury' },
            { title: 'Sustainability', description: 'Quick fixes don\'t work; sustainable habits do' },
            { title: 'Community', description: 'Support and connection accelerate success' }
          ]
        },
        {
          heading: 'Join Our Mission',
          content: 'Whether you\'re managing a health condition, training for athletic performance, or simply want to feel better, we\'re here to guide you. Join thousands who\'ve transformed their health with GreenFig.'
        }
      ]
    };

    const { data: aboutData, error: aboutError } = await supabase
      .from('site_content')
      .upsert({
        page_key: 'about',
        content: aboutContent
      }, { onConflict: 'page_key' });

    if (aboutError) throw aboutError;
    console.log('✅ About Page: 1 page configured\n');

    // ============================================
    // 8. FAQ PAGE CONTENT
    // ============================================
    console.log('📝 Inserting FAQ Page Content...');
    const faqContent = {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about GreenFig',
      categories: [
        {
          name: 'Features',
          faqs: [
            {
              question: 'How does the AI meal planning work?',
              answer: 'Our AI analyzes your profile (goals, dietary restrictions, preferences, activity level) and generates personalized meal plans optimized for your nutritional needs. Each plan is then reviewed by a certified nutritionist to ensure it\'s safe, balanced, and effective. The AI learns from your feedback, continuously improving recommendations.'
            },
            {
              question: 'What dietary preferences do you support?',
              answer: 'We support all major dietary preferences including vegan, vegetarian, pescatarian, keto, paleo, Mediterranean, low-carb, high-protein, gluten-free, dairy-free, and more. You can also specify allergies and foods you dislike. Our meal plans adapt to your exact needs.'
            },
            {
              question: 'How accurate is the nutrition tracking?',
              answer: 'Very accurate! Our database contains over 1 million verified foods with detailed nutritional information. We also integrate with fitness trackers and support barcode scanning for packaged foods. For restaurant meals, we provide estimates based on standard recipes. You can always manually adjust values if needed.'
            },
            {
              question: 'Do I need to cook every meal from scratch?',
              answer: 'Not at all! Our meal plans include a mix of quick recipes (10-15 minutes), batch cooking options, and suggestions for healthy convenience foods. You can set your cooking time preferences, and we\'ll adjust accordingly. We also provide eating-out guides for when you dine at restaurants.'
            },
            {
              question: 'What if I don\'t like the meal plans?',
              answer: 'You have full control! You can regenerate meal plans anytime, swap individual meals, mark foods you dislike (we\'ll never suggest them again), and adjust portion sizes. Your nutritionist can also help refine plans based on your feedback. The AI learns from your preferences over time, getting better at suggesting meals you\'ll love.'
            }
          ]
        },
        {
          name: 'Support',
          faqs: [
            {
              question: 'Can I speak with a real nutritionist?',
              answer: 'Absolutely! Premium and Elite members get access to certified nutritionists. Premium members receive 2 consultations per month via messaging or video call. Elite members get a dedicated nutritionist with weekly check-ins. Our nutritionists are all licensed professionals with specialized training.'
            }
          ]
        },
        {
          name: 'Pricing',
          faqs: [
            {
              question: 'How much does GreenFig cost?',
              answer: 'We offer three plans: Starter (free forever), Premium ($29/month), and Elite ($79/month). Premium and Elite plans include a 14-day free trial with no credit card required. Annual billing saves 20%. All plans include access to our mobile apps and community.'
            },
            {
              question: 'Can I cancel anytime?',
              answer: 'Yes! There are no long-term contracts. You can cancel your subscription at any time from your account settings. You\'ll retain access until the end of your current billing period. If you cancel during your free trial, you won\'t be charged anything.'
            },
            {
              question: 'Can my whole family use one account?',
              answer: 'The Elite plan includes family sharing for up to 4 members, each with their own personalized meal plans and tracking. Starter and Premium plans are designed for individual use. Each family member gets their own profile, preferences, and customized recommendations.'
            }
          ]
        },
        {
          name: 'Platform',
          faqs: [
            {
              question: 'Do you have a mobile app?',
              answer: 'Yes! We have native apps for both iOS (iPhone/iPad) and Android devices. The apps sync seamlessly with the web platform, allowing you to log meals, track progress, view meal plans, and communicate with nutritionists on-the-go. Download from the App Store or Google Play.'
            }
          ]
        },
        {
          name: 'Health',
          faqs: [
            {
              question: 'Can GreenFig help with medical conditions like diabetes or high blood pressure?',
              answer: 'Many of our users successfully manage health conditions with GreenFig\'s nutrition plans, always in coordination with their healthcare providers. Our nutritionists can create plans that support various health goals. However, GreenFig is not a medical service and should not replace professional medical advice. Always consult your doctor before making significant dietary changes.'
            }
          ]
        },
        {
          name: 'General',
          faqs: [
            {
              question: 'How long does it take to see results?',
              answer: 'Results vary based on individual goals and consistency. Most users report increased energy within 1-2 weeks. For weight loss goals, healthy sustainable loss is 1-2 pounds per week. For athletic performance, users often see improvements in 3-4 weeks. The key is consistency - our platform helps you build sustainable habits for long-term success.'
            }
          ]
        }
      ]
    };

    const { data: faqData, error: faqError } = await supabase
      .from('site_content')
      .upsert({
        page_key: 'faq',
        content: faqContent
      }, { onConflict: 'page_key' });

    if (faqError) throw faqError;
    console.log('✅ FAQ Page: 1 page configured (12 FAQs)\n');

    // ============================================
    // SUCCESS SUMMARY
    // ============================================
    console.log('═'.repeat(50));
    console.log('✅ ALL CONTENT SUCCESSFULLY INSERTED!');
    console.log('═'.repeat(50));
    console.log('');
    console.log('Summary:');
    console.log('  📄 Homepage Sections: 5');
    console.log('  ⚡ Features: 8');
    console.log('  💰 Pricing Plans: 3');
    console.log('  💬 Testimonials: 6');
    console.log('  🔍 SEO Settings: 5 pages');
    console.log('  📞 Contact Info: 1');
    console.log('  ℹ️  About Page: 1');
    console.log('  ❓ FAQ Page: 1 (12 FAQs)');
    console.log('');
    console.log('🎉 Your website is now fully populated with content!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Visit http://localhost:3000/app/admin?tab=website');
    console.log('  2. Review and customize the content');
    console.log('  3. Add custom images for OG/Twitter cards');
    console.log('  4. Update contact information with your real details');
    console.log('');

  } catch (error) {
    console.error('❌ Error inserting content:', error);
    process.exit(1);
  }
}

insertAllContent();
