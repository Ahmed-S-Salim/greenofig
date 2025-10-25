import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdzoikocriuvgkoenjqk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkem9pa29jcml1dmdrb2VuanFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDMzODY3NSwiZXhwIjoyMDc1OTE0Njc1fQ.EmlqZcGS9_8l6AFSl2OJjtBPfXwSAElMo8vQPruIWCk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking blog tables...\n');

  const tables = [
    'blog_posts',
    'blog_keyword_rankings',
    'blog_comments',
    'blog_categories',
    'blog_post_views',
    'blog_seo_audits',
    'blog_ai_prompts'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: Does not exist`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists (${data.length} rows checked)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error checking - ${err.message}`);
    }
  }

  // Check for default categories
  try {
    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('name, post_count');

    if (!error && categories) {
      console.log('\n📋 Blog Categories:');
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.post_count} posts)`);
      });
    }
  } catch (err) {
    // Categories table doesn't exist yet
  }
}

checkTables();
