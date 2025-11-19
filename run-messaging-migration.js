import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

async function runMigration() {
  console.log('🚀 Starting messaging_disabled column migration...\n');

  try {
    // Step 1: Add the column
    console.log('📝 Step 1: Adding messaging_disabled column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS messaging_disabled BOOLEAN DEFAULT false;
      `
    });

    // If RPC doesn't exist, try direct query
    if (alterError && alterError.message.includes('function')) {
      console.log('⚠️  Using direct query method...');

      // Try to add column directly via raw SQL
      const { error: directError } = await supabase
        .from('user_profiles')
        .select('messaging_disabled')
        .limit(1);

      if (directError && directError.message.includes('does not exist')) {
        console.log('Column does not exist. Please run the SQL migration manually in Supabase Dashboard:');
        console.log('\n--- Copy and run this SQL in Supabase SQL Editor ---');
        const sqlContent = fs.readFileSync('./add-messaging-disabled-column.sql', 'utf8');
        console.log(sqlContent);
        console.log('--- End of SQL ---\n');
      } else if (!directError) {
        console.log('✅ Column already exists!');
      }
    } else if (alterError) {
      throw alterError;
    } else {
      console.log('✅ Column added successfully!\n');
    }

    // Step 2: Verify by fetching some users
    console.log('📝 Step 2: Verifying column exists...');
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role, messaging_disabled')
      .eq('role', 'user')
      .limit(5);

    if (fetchError) {
      if (fetchError.message.includes('does not exist')) {
        console.log('\n⚠️  Column does not exist yet. Please run the SQL migration manually.');
        console.log('Go to: Supabase Dashboard → SQL Editor');
        console.log('Run the SQL from: add-messaging-disabled-column.sql');
        return;
      }
      throw fetchError;
    }

    console.log('✅ Column verified!\n');

    if (users && users.length > 0) {
      console.log('📊 Sample users (first 5):');
      console.log('═'.repeat(80));
      users.forEach(user => {
        const name = user.full_name || 'Unknown';
        const email = user.email || 'No email';
        const msgStatus = user.messaging_disabled ? '❌ DISABLED' : '✅ ENABLED';
        console.log(`${name.padEnd(25)} | ${email.padEnd(30)} | ${msgStatus}`);
      });
      console.log('═'.repeat(80));
    } else {
      console.log('ℹ️  No users found in database yet.');
    }

    console.log('\n✅ SUCCESS! Migration completed successfully!');
    console.log('\n📌 Next steps:');
    console.log('1. Go to Admin Dashboard → Messaging tab → Customer Access');
    console.log('2. You can now enable/disable messaging for individual users!');

  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
    console.log('\n💡 Manual fix required:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the contents of add-messaging-disabled-column.sql');
    process.exit(1);
  }
}

// Run the migration
runMigration();
