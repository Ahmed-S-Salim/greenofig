const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting Arabic columns migration...\n');
  console.log('⚠️  NOTE: This migration requires direct database access.');
  console.log('If you see permission errors, you need to run this SQL manually in Supabase Dashboard.\n');

  // Read the migration file for display
  const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251111_add_arabic_columns.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration SQL to run:');
  console.log('='.repeat(80));
  console.log(migrationSQL);
  console.log('='.repeat(80));
  console.log('\n');

  console.log('✅ Migration file created at:');
  console.log(`   ${migrationPath}\n`);

  console.log('📋 To apply this migration:');
  console.log('   1. Go to your Supabase Dashboard');
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy and paste the SQL above');
  console.log('   4. Click "Run"\n');

  console.log('Or if you have Supabase CLI installed:');
  console.log('   npx supabase db push\n');

  console.log('Once completed, the following columns will be added:');
  console.log('  ✓ site_content.content_ar (JSONB)');
  console.log('  ✓ testimonials.customer_title_ar (TEXT)');
  console.log('  ✓ testimonials.quote_ar (TEXT)');
  console.log('  ✓ posts.title_ar (TEXT)');
  console.log('  ✓ posts.excerpt_ar (TEXT)');
  console.log('  ✓ posts.content_ar (TEXT)');
  console.log('  ✓ features.name_ar (TEXT)');
  console.log('  ✓ features.description_ar (TEXT)');
  console.log('  ✓ features.category_ar (TEXT)');
}

runMigration();
