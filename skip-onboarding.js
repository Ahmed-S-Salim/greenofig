import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function skipOnboarding() {
  console.log('⏭️  Setting up admin profiles to skip onboarding...\n');

  // Update superadmin profile
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      age: 30,  // Dummy data to skip onboarding
      gender: 'male',  // or 'female' or 'other'
      height_cm: 170,
      weight_kg: 70,
      activity_level: 'moderately_active',
      health_goals: ['eat_healthier']
    })
    .eq('email', 'superadmin@greenofig.com')
    .select();

  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log('✅ Updated superadmin profile:', data);
  }

  console.log('\n✅ Now you can login and go straight to the admin dashboard!');
  console.log('   Email: superadmin@greenofig.com');
  console.log('   Password: (your password)');
}

skipOnboarding().catch(console.error);
