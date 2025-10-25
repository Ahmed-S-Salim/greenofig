// Email Queue Processor - Run this every minute with a cron job
// Usage: node process-email-queue.js

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const resendApiKey = process.env.VITE_RESEND_API_KEY;
const fromEmail = process.env.VITE_FROM_EMAIL || 'support@greenofig.com';

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

async function processEmailQueue() {
  console.log(`[${new Date().toISOString()}] Starting email queue processing...`);

  try {
    // Get unsent emails
    const { data: emails, error } = await supabase
      .from('issue_email_queue')
      .select('*')
      .eq('sent', false)
      .lt('retry_count', 3) // Only retry up to 3 times
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error fetching emails:', error);
      return;
    }

    if (!emails || emails.length === 0) {
      console.log('No emails to process');
      return;
    }

    console.log(`Found ${emails.length} emails to send`);

    let successCount = 0;
    let failCount = 0;

    for (const email of emails) {
      try {
        // Send email via Resend
        const result = await resend.emails.send({
          from: fromEmail,
          to: email.recipient_email,
          subject: email.subject,
          text: email.body,
          html: email.body.replace(/\n/g, '<br>')
        });

        console.log(`✓ Sent email to ${email.recipient_email} - ${email.subject}`);

        // Mark as sent
        await supabase
          .from('issue_email_queue')
          .update({
            sent: true,
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        successCount++;

      } catch (error) {
        console.error(`✗ Failed to send email to ${email.recipient_email}:`, error.message);

        // Update error and retry count
        await supabase
          .from('issue_email_queue')
          .update({
            error_message: error.message,
            retry_count: email.retry_count + 1
          })
          .eq('id', email.id);

        failCount++;
      }

      // Small delay to avoid rate limits (100ms between emails)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Completed: ${successCount} sent, ${failCount} failed`);

  } catch (error) {
    console.error('Fatal error processing queue:', error);
  }
}

// Run the processor
processEmailQueue()
  .then(() => {
    console.log('Email queue processing complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
