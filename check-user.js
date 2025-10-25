import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkUser() {
  console.log('🔍 Checking admin@greenofig.com...\n');

  // Get user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const adminUser = users.find(u => u.email === 'admin@greenofig.com');

  if (!adminUser) {
    console.log('❌ User not found!');
    return;
  }

  console.log('✅ User found:');
  console.log('   ID:', adminUser.id);
  console.log('   Email:', adminUser.email);
  console.log('   Created:', adminUser.created_at);
  console.log('   Metadata:', JSON.stringify(adminUser.user_metadata, null, 2));

  // Check profile
  console.log('\n🔍 Checking user_profile...');
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', adminUser.id)
    .single();

  if (error) {
    console.log('❌ Profile error:', error.message);
  } else if (profile) {
    console.log('✅ Profile found:');
    console.log(JSON.stringify(profile, null, 2));
  } else {
    console.log('❌ No profile found!');
    console.log('\n🔧 Creating profile manually...');

    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: adminUser.id,
        full_name: adminUser.user_metadata.full_name || 'Admin User',
        role: adminUser.user_metadata.role || 'admin',
        email: adminUser.email
      })
      .select()
      .single();

    if (createError) {
      console.log('❌ Failed to create profile:', createError.message);
    } else {
      console.log('✅ Profile created:', newProfile);
    }
  }
}

checkUser().catch(console.error);
