import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzg2NzUsImV4cCI6MjA3NTkxNDY3NX0.hh2GkNEdFHI9wlPfM6-oDraPz-s-zS1HlJpSTElQxHc';

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const userClient = createClient(supabaseUrl, anonKey);

async function testAuth() {
  console.log('🔍 Diagnosing authentication issue...\n');

  // Test 1: Check if we can list users
  console.log('[1] Checking existing users...');
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();

  if (usersError) {
    console.log('   ❌ Error listing users:', usersError.message);
  } else {
    console.log(`   ✅ Found ${users.length} existing users`);
    const adminUser = users.find(u => u.email === 'admin@greenofig.com');
    if (adminUser) {
      console.log('   ⚠️  admin@greenofig.com already exists!');
      console.log('   User ID:', adminUser.id);
      console.log('   Created:', adminUser.created_at);
      console.log('\n   → Need to delete this user first!');
    }
  }

  console.log('\n[2] Testing signup with anon key...');
  const testEmail = `test${Date.now()}@greenofig.com`;
  const { data: signUpData, error: signUpError } = await userClient.auth.signUp({
    email: testEmail,
    password: 'test123456',
    options: {
      data: {
        full_name: 'Test User',
        role: 'user'
      }
    }
  });

  if (signUpError) {
    console.log('   ❌ Signup error:', signUpError.message);
  } else {
    console.log('   ✅ Signup successful!');
    console.log('   User ID:', signUpData.user?.id);
    console.log('   Session:', signUpData.session ? 'Created' : 'Not created (email confirmation?)');

    // Check if profile was created
    if (signUpData.user?.id) {
      console.log('\n[3] Checking if user_profile was created...');
      const { data: profile, error: profileError } = await adminClient
        .from('user_profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.log('   ❌ Profile error:', profileError.message);
        console.log('   → This means the trigger is NOT working!');
      } else if (profile) {
        console.log('   ✅ Profile created successfully!');
        console.log('   Profile:', JSON.stringify(profile, null, 2));
      } else {
        console.log('   ❌ No profile found - trigger not working!');
      }

      // Clean up test user
      console.log('\n[4] Cleaning up test user...');
      await adminClient.auth.admin.deleteUser(signUpData.user.id);
      console.log('   ✅ Test user deleted');
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('DIAGNOSIS COMPLETE');
  console.log('='.repeat(70));
}

testAuth().catch(console.error);
