import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkBlogPosts() {
  console.log('Checking blog posts...');

  // First, check if there are any posts at all
  const { data: allPosts, error: allError } = await supabase
    .from('blog_posts')
    .select('id, title, status, published_at, featured_image_url')
    .limit(10);

  console.log('\nAll posts (any status):');
  if (allError) {
    console.error('Error:', allError);
  } else {
    console.log(`Found ${allPosts?.length || 0} posts`);
    allPosts?.forEach(post => {
      console.log(`- ${post.title} (${post.status}, published_at: ${post.published_at})`);
    });
  }

  // Now check published posts only
  const { data: publishedPosts, error: publishedError } = await supabase
    .from('blog_posts')
    .select('id, title, status, published_at, featured_image_url')
    .eq('status', 'published')
    .is('published_at', 'not.null');

  console.log('\nPublished posts with published_at:');
  if (publishedError) {
    console.error('Error:', publishedError);
  } else {
    console.log(`Found ${publishedPosts?.length || 0} posts`);
    publishedPosts?.forEach(post => {
      console.log(`- ${post.title}`);
    });
  }

  process.exit(0);
}

checkBlogPosts();
