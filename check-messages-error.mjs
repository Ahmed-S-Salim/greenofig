import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const anonKey = 'sb_publishable_VXiUtpRKA79e51E2p2csvw_vmmek-LL';

const supabase = createClient(supabaseUrl, anonKey);

console.log('🔍 Testing the exact query that fails...\n');

// This is the exact query from the console error
const userId = '3ef91031-c04b-4fd2-89e7-720822ef52b3';

const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:user_profiles!messages_sender_id_fkey(id, full_name, email, profile_picture_url),
    recipient:user_profiles!messages_recipient_id_fkey(id, full_name, email, profile_picture_url)
  `)
  .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
  .order('created_at', { ascending: false });

if (error) {
  console.log('❌ ERROR DETAILS:');
  console.log('Message:', error.message);
  console.log('Details:', error.details);
  console.log('Hint:', error.hint);
  console.log('Code:', error.code);
  console.log('\n📋 Full error object:', JSON.stringify(error, null, 2));
} else {
  console.log('✅ Query succeeded!');
  console.log('Results:', data);
}

// Also check what foreign keys actually exist
console.log('\n🔍 Checking messages table schema...');
const { data: schemaData, error: schemaError } = await supabase
  .rpc('exec_sql', {
    query: `
      SELECT
        conname as constraint_name,
        contype as constraint_type
      FROM pg_constraint
      WHERE conrelid = 'messages'::regclass;
    `
  });

if (schemaError) {
  console.log('Cannot check schema (RPC not available)');
} else {
  console.log('Constraints:', schemaData);
}
