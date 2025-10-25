// Auto-Publish Scheduled Blog Posts - Run this every minute with a cron job
// Usage: node auto-publish-scheduled-posts.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function autoPublishScheduledPosts() {
  console.log(`[${new Date().toISOString()}] Checking for scheduled posts to publish...`);

  try {
    // Get all scheduled posts where the scheduled time has passed
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'scheduled')
      .not('scheduled_publish_at', 'is', null)
      .lte('scheduled_publish_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError);
      return;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('No posts ready to publish');
      return;
    }

    console.log(`Found ${scheduledPosts.length} post(s) ready to publish`);

    let successCount = 0;
    let failCount = 0;

    for (const post of scheduledPosts) {
      try {
        // Update post status to published
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            status: 'published',
            published_at: post.scheduled_publish_at
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`✗ Failed to publish post "${post.title}":`, updateError.message);
          failCount++;
        } else {
          console.log(`✓ Published: "${post.title}"`);
          successCount++;
        }
      } catch (error) {
        console.error(`✗ Error publishing post "${post.title}":`, error.message);
        failCount++;
      }
    }

    console.log(`Completed: ${successCount} published, ${failCount} failed`);

  } catch (error) {
    console.error('Fatal error processing scheduled posts:', error);
  }
}

// Run the auto-publish function
autoPublishScheduledPosts()
  .then(() => {
    console.log('Auto-publish process complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
