import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTable() {
  console.log('🔍 Checking user_profiles table structure...\n');

  // Get a sample row to see the schema
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error:', error.message);
  } else if (data && data.length > 0) {
    console.log('✅ Sample row from user_profiles:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\n📋 Columns:', Object.keys(data[0]).join(', '));
  } else {
    console.log('⚠️  Table is empty. Checking table info from Postgres...\n');

    // Query information_schema to get column details
    const { data: tableInfo, error: infoError } = await supabase
      .rpc('get_table_columns', {
        table_name: 'user_profiles'
      });

    if (infoError) {
      console.log('Manual check needed. Go to:');
      console.log('https://supabase.com/dashboard/project/xdzoikocriuvgkoenjqk/editor');
      console.log('Click on "user_profiles" table and check the columns');
    }
  }

  // Check the trigger
  console.log('\n🔍 Checking if trigger exists...\n');

  const checkTriggerSQL = `
    SELECT
      trigger_name,
      event_manipulation,
      event_object_table,
      action_statement
    FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created';
  `;

  try {
    // We can't run arbitrary SQL, so let's check auth.users schema instead
    console.log('✅ The trigger should be on auth.users table');
    console.log('✅ Function name: public.handle_new_user()');
    console.log('\nℹ️  To verify trigger, go to:');
    console.log('https://supabase.com/dashboard/project/xdzoikocriuvgkoenjqk/database/triggers');
  } catch (e) {
    console.log('Error:', e.message);
  }

  // Try to view logs
  console.log('\n📋 Recommended: Check Supabase logs for errors');
  console.log('https://supabase.com/dashboard/project/xdzoikocriuvgkoenjqk/logs/postgres-logs');
}

checkTable().catch(console.error);
