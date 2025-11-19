import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUltimatePopular() {
  console.log('🚀 Starting Ultimate plan popularity update...\n');

  try {
    // Step 1: Set all plans to NOT popular
    console.log('📝 Step 1: Setting all plans to NOT popular...');
    const { error: resetError } = await supabase
      .from('subscription_plans')
      .update({ is_popular: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

    if (resetError) {
      throw new Error(`Failed to reset popularity: ${resetError.message}`);
    }
    console.log('✅ All plans set to NOT popular\n');

    // Step 2: Set ONLY Ultimate as popular
    console.log('📝 Step 2: Setting Ultimate as the ONLY popular plan...');
    const { error: updateError } = await supabase
      .from('subscription_plans')
      .update({ is_popular: true })
      .eq('name', 'Ultimate');

    if (updateError) {
      throw new Error(`Failed to set Ultimate as popular: ${updateError.message}`);
    }
    console.log('✅ Ultimate plan is now the most popular!\n');

    // Step 3: Verify the changes
    console.log('📝 Step 3: Verifying changes...');
    const { data: plans, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('id, name, is_popular, price_monthly')
      .order('price_monthly', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch plans: ${fetchError.message}`);
    }

    console.log('\n📊 Current Subscription Plans Status:');
    console.log('═'.repeat(80));
    plans.forEach(plan => {
      const popularBadge = plan.is_popular ? '⭐ POPULAR' : '';
      console.log(`${plan.name.padEnd(20)} | $${plan.price_monthly.toString().padEnd(6)} | ${popularBadge}`);
    });
    console.log('═'.repeat(80));

    // Count popular plans
    const popularCount = plans.filter(p => p.is_popular).length;
    if (popularCount === 1) {
      const popularPlan = plans.find(p => p.is_popular);
      if (popularPlan.name === 'Ultimate') {
        console.log('\n✅ SUCCESS! Ultimate is now the ONLY popular plan!');
      } else {
        console.log(`\n⚠️  WARNING: ${popularPlan.name} is marked as popular instead of Ultimate!`);
      }
    } else {
      console.log(`\n⚠️  WARNING: ${popularCount} plans are marked as popular! Should be exactly 1.`);
    }

  } catch (error) {
    console.error('\n❌ Error updating plans:', error.message);
    process.exit(1);
  }
}

// Run the update
updateUltimatePopular();
