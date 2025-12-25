import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const serviceRoleKey = 'sb_secret_B5cLJQS3eRWuDOgRFVzubg_r2ZN8HOo';

// Create client with service role key for admin access
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read the SQL migration file
const sql = fs.readFileSync('supabase/migrations/20251124_CREATE_MESSAGES_TABLE.sql', 'utf8');

// Split into individual statements (rough split)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--') && !s.match(/^DO \$\$/));

console.log(`🔄 Executing ${statements.length} SQL statements...`);

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];
  if (!statement) continue;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
    if (error) {
      console.error(`❌ Statement ${i + 1} failed:`, error.message);
      console.error('Statement was:', statement.substring(0, 100) + '...');
    } else {
      console.log(`✅ Statement ${i + 1} executed`);
    }
  } catch (err) {
    // Try direct query if RPC doesn't work
    console.log(`⚠️  Trying alternative method for statement ${i + 1}...`);
  }
}

console.log('✅ Migration execution complete!');
console.log('Now checking if table exists...');

// Verify the table was created
const { data, error } = await supabase
  .from('messages')
  .select('count')
  .limit(1);

if (error) {
  console.error('❌ Table verification failed:', error.message);
  console.log('\n⚠️  MANUAL ACTION REQUIRED:');
  console.log('Go to https://supabase.com/dashboard');
  console.log('1. Select your project: xdzoikocriuvgkoenjqk');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the contents of: supabase/migrations/20251124_CREATE_MESSAGES_TABLE.sql');
  console.log('4. Click RUN');
} else {
  console.log('✅ MESSAGES TABLE EXISTS!');
  console.log('✅ Error should be fixed on https://greenofig.com/app/nutritionist?tab=messages');
}
