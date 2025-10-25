import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function listUsers() {
  console.log('📋 Listing all users...\n');

  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log(`Found ${users.length} users:\n`);

  for (const user of users) {
    console.log('='.repeat(60));
    console.log('📧 Email:', user.email);
    console.log('🆔 ID:', user.id);
    console.log('👤 Metadata:', JSON.stringify(user.user_metadata, null, 2));
    console.log('📅 Created:', user.created_at);

    // Check for profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      console.log('✅ Profile exists:');
      console.log('   Name:', profile.full_name);
      console.log('   Role:', profile.role);
    } else {
      console.log('❌ No profile found - creating one...');

      const { error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata.full_name || 'User',
          role: user.user_metadata.role || 'user',
          email: user.email
        });

      if (createError) {
        console.log('   ❌ Failed:', createError.message);
      } else {
        console.log('   ✅ Profile created!');
      }
    }
  }

  console.log('\n' + '='.repeat(60));
}

listUsers().catch(console.error);
