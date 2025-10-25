import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixAuth() {
  console.log('🔧 Fixing authentication issues...\n');

  // Step 1: Delete existing admin user
  console.log('[1] Deleting old admin@greenofig.com user...');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const adminUser = users.find(u => u.email === 'admin@greenofig.com');

  if (adminUser) {
    const { error } = await supabase.auth.admin.deleteUser(adminUser.id);
    if (error) {
      console.log('   ❌ Error deleting user:', error.message);
    } else {
      console.log('   ✅ Deleted user:', adminUser.email);
    }
  } else {
    console.log('   ℹ️  No admin user to delete');
  }

  // Step 2: Check user_profiles table structure
  console.log('\n[2] Checking user_profiles table structure...');
  const { data: profiles, error: tableError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);

  if (tableError) {
    console.log('   ❌ Error:', tableError.message);
  } else {
    console.log('   ✅ Table accessible');
  }

  // Step 3: Try to manually create a test profile (bypass trigger)
  console.log('\n[3] Testing direct profile insert with service role...');
  const testId = 'test-' + Date.now();
  const { data: insertData, error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      id: testId,
      full_name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    })
    .select();

  if (insertError) {
    console.log('   ❌ Insert failed:', insertError.message);
    console.log('   → RLS policies are still blocking!');
  } else {
    console.log('   ✅ Insert successful!');
    // Clean up
    await supabase.from('user_profiles').delete().eq('id', testId);
    console.log('   ✅ Test profile cleaned up');
  }

  console.log('\n' + '='.repeat(70));
  console.log('NEXT STEP: Need to disable RLS or add service_role policy');
  console.log('='.repeat(70));
  console.log('\nRun this SQL in Supabase Dashboard SQL Editor:\n');
  console.log('-- Option 1: Add service_role policy (recommended)');
  console.log('CREATE POLICY "Service role has full access"');
  console.log('ON user_profiles');
  console.log('TO service_role');
  console.log('USING (true)');
  console.log('WITH CHECK (true);');
  console.log('\n-- Option 2: Temporarily disable RLS (not recommended for production)');
  console.log('-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;');
}

fixAuth().catch(console.error);
