import { Resend } from 'resend';
import { supabase } from './customSupabaseClient';

// Initialize Resend with API key from environment
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

// Default sender email
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'support@greenofig.com';

/**
 * Send a single email using Resend
 */
export const sendEmail = async ({ to, subject, body, html }) => {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      text: body,
      html: html || body.replace(/\n/g, '<br>')
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Process email queue - sends all pending emails
 * Call this function periodically (e.g., every minute via cron job)
 */
export const processEmailQueue = async () => {
  try {
    // Get unsent emails from queue
    const { data: emails, error } = await supabase
      .from('issue_email_queue')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(50); // Process 50 at a time to avoid rate limits

    if (error) {
      console.error('Error fetching email queue:', error);
      return { success: false, error: error.message };
    }

    if (!emails || emails.length === 0) {
      return { success: true, processed: 0, message: 'No emails to process' };
    }

    console.log(`Processing ${emails.length} emails...`);

    let successCount = 0;
    let failCount = 0;

    // Process each email
    for (const email of emails) {
      const result = await sendEmail({
        to: email.recipient_email,
        subject: email.subject,
        body: email.body
      });

      if (result.success) {
        // Mark as sent
        await supabase
          .from('issue_email_queue')
          .update({
            sent: true,
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        successCount++;
      } else {
        // Mark error and increment retry count
        await supabase
          .from('issue_email_queue')
          .update({
            error_message: result.error,
            retry_count: email.retry_count + 1
          })
          .eq('id', email.id);

        failCount++;
      }

      // Small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: true,
      processed: emails.length,
      successCount,
      failCount,
      message: `Processed ${emails.length} emails: ${successCount} sent, ${failCount} failed`
    };
  } catch (error) {
    console.error('Error processing email queue:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  try {
    const { data, error } = await supabase
      .from('issue_email_queue')
      .select('sent, created_at');

    if (error) throw error;

    const total = data.length;
    const sent = data.filter(e => e.sent).length;
    const pending = total - sent;
    const last24h = data.filter(e =>
      new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return {
      total,
      sent,
      pending,
      last24h
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return null;
  }
};

/**
 * Manually queue an email (for testing or special cases)
 */
export const queueEmail = async ({ issueId, to, toName, subject, body, emailType }) => {
  try {
    const { data, error } = await supabase
      .from('issue_email_queue')
      .insert({
        issue_id: issueId,
        recipient_email: to,
        recipient_name: toName,
        subject: subject,
        body: body,
        email_type: emailType
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error queueing email:', error);
    return { success: false, error: error.message };
  }
};
