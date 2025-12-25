import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const anonKey = 'sb_publishable_VXiUtpRKA79e51E2p2csvw_vmmek-LL';

const supabase = createClient(supabaseUrl, anonKey);

console.log('🔍 CHECKING DATABASE STATUS...\n');

// Check 1: Does messages table exist?
console.log('1. Checking if messages table exists...');
const { data: messagesData, error: messagesError } = await supabase
  .from('messages')
  .select('*')
  .limit(1);

if (messagesError) {
  console.log('❌ Messages table error:', messagesError.message);
  console.log('   Code:', messagesError.code);
  console.log('   Details:', messagesError.details);
} else {
  console.log('✅ Messages table EXISTS');
  console.log('   Rows found:', messagesData?.length || 0);
}

// Check 2: List all tables
console.log('\n2. Attempting to list all tables...');
const { data: tablesData, error: tablesError } = await supabase
  .rpc('get_tables');

if (tablesError) {
  console.log('❌ Cannot list tables:', tablesError.message);
} else {
  console.log('✅ Tables:', tablesData);
}

// Check 3: Check users table
console.log('\n3. Checking auth.users access...');
const { data: usersData, error: usersError } = await supabase.auth.getUser();

if (usersError) {
  console.log('❌ Not authenticated:', usersError.message);
} else {
  console.log('✅ Current user:', usersData?.user?.email || 'No user');
}

// Check 4: Try to check schema via information_schema
console.log('\n4. Checking for messages table in schema...');
const { data: schemaData, error: schemaError } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_name', 'messages');

if (schemaError) {
  console.log('❌ Schema check failed:', schemaError.message);
} else {
  console.log('Schema result:', schemaData);
}

console.log('\n========================================');
console.log('DIAGNOSIS COMPLETE');
console.log('========================================\n');
