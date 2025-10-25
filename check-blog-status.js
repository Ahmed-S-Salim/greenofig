import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function checkBlogStatus() {
  console.log('Checking blog posts...\n');

  // Check total count
  const { count, error: countError } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting posts:', countError.message);
  } else {
    console.log(`Total blog posts in database: ${count}`);
  }

  // Try the same query as BlogPage
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      content,
      featured_image_url,
      published_at,
      author_id
    `)
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('\nError fetching published posts:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  } else {
    console.log(`\nPublished posts query successful: ${data ? data.length : 0} posts`);
    if (data && data.length > 0) {
      console.log('\nPost titles:');
      data.forEach((post, i) => {
        console.log(`${i + 1}. ${post.title}`);
      });
    }
  }

  process.exit(0);
}

checkBlogStatus();
