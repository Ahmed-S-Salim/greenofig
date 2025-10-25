import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local file manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running blog posts migration...');
    
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251025_insert_blog_posts.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error:', error);
      
      // If RPC doesn't exist, try reading the file and executing parts manually
      console.log('\nTrying alternative method...');
      
      // Check if we can insert posts manually
      const { data: adminUser } = await supabase
        .from('user_profiles')
        .select('id')
        .in('role', ['admin', 'super_admin'])
        .limit(1)
        .single();
      
      if (!adminUser) {
        console.error('No admin user found!');
        process.exit(1);
      }
      
      console.log('Admin user found:', adminUser.id);
      console.log('\nPlease run the migration file directly in your Supabase SQL editor:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy the contents of: supabase/migrations/20251025_insert_blog_posts.sql');
      console.log('3. Paste and run');
      
    } else {
      console.log('Success!', data);
    }
    
  } catch (error) {
    console.error('Error running migration:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
