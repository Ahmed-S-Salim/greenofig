/**
 * Payment Notifications Service
 * Handles sending and tracking payment-related notifications
 */

import { supabase } from './customSupabaseClient';

/**
 * Notification types and their default templates
 */
export const NOTIFICATION_TYPES = {
  PAYMENT_SUCCEEDED: 'payment_succeeded',
  PAYMENT_FAILED: 'payment_failed',
  UPCOMING_RENEWAL: 'upcoming_renewal',
  PAYMENT_METHOD_EXPIRING: 'payment_method_expiring',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  INVOICE_READY: 'invoice_ready',
  REFUND_PROCESSED: 'refund_processed',
  TRIAL_ENDING: 'trial_ending',
  DUNNING_WARNING: 'dunning_warning',
  SUBSCRIPTION_PAUSED: 'subscription_paused',
  SUBSCRIPTION_RESUMED: 'subscription_resumed',
};

/**
 * Email templates for notifications
 */
const EMAIL_TEMPLATES = {
  [NOTIFICATION_TYPES.PAYMENT_SUCCEEDED]: {
    subject: 'Payment Successful - GreenoFig',
    getContent: (data) => `
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment of $${data.amount} for your ${data.planName} subscription.</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
      <p>Your subscription is now active and will renew on ${new Date(data.nextBillingDate).toLocaleDateString()}.</p>
      <p>You can view your invoice and payment history in your account dashboard.</p>
    `,
  },
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: {
    subject: 'Payment Failed - Action Required',
    getContent: (data) => `
      <h2>Payment Failed</h2>
      <p>We were unable to process your payment of $${data.amount} for your ${data.planName} subscription.</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p>Please update your payment method to continue your subscription.</p>
      <p>We'll automatically retry the payment in ${data.retryDays} days.</p>
      <p><a href="${data.updatePaymentUrl}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Method</a></p>
    `,
  },
  [NOTIFICATION_TYPES.UPCOMING_RENEWAL]: {
    subject: 'Your Subscription Renews Soon',
    getContent: (data) => `
      <h2>Subscription Renewal Reminder</h2>
      <p>Your ${data.planName} subscription will renew on ${new Date(data.renewalDate).toLocaleDateString()}.</p>
      <p><strong>Amount:</strong> $${data.amount}</p>
      <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      <p>No action is required. Your subscription will automatically renew.</p>
      <p>If you wish to cancel or modify your subscription, you can do so in your account settings.</p>
    `,
  },
  [NOTIFICATION_TYPES.PAYMENT_METHOD_EXPIRING]: {
    subject: 'Payment Method Expiring Soon',
    getContent: (data) => `
      <h2>Update Your Payment Method</h2>
      <p>Your payment method ending in ${data.last4} will expire on ${data.expiryDate}.</p>
      <p>Please update your payment method to avoid any interruption to your ${data.planName} subscription.</p>
      <p><a href="${data.updatePaymentUrl}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Method</a></p>
    `,
  },
  [NOTIFICATION_TYPES.SUBSCRIPTION_CANCELLED]: {
    subject: 'Subscription Cancelled',
    getContent: (data) => `
      <h2>Subscription Cancelled</h2>
      <p>Your ${data.planName} subscription has been cancelled.</p>
      <p>You will continue to have access until ${new Date(data.accessUntil).toLocaleDateString()}.</p>
      <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime.</p>
      <p><a href="${data.reactivateUrl}">Reactivate Subscription</a></p>
    `,
  },
  [NOTIFICATION_TYPES.INVOICE_READY]: {
    subject: 'Your Invoice is Ready',
    getContent: (data) => `
      <h2>Invoice Available</h2>
      <p>Your invoice for ${data.planName} is now available.</p>
      <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
      <p><strong>Amount:</strong> $${data.amount}</p>
      <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
      <p><a href="${data.invoiceUrl}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
    `,
  },
  [NOTIFICATION_TYPES.REFUND_PROCESSED]: {
    subject: 'Refund Processed',
    getContent: (data) => `
      <h2>Refund Processed</h2>
      <p>Your refund of $${data.amount} has been processed successfully.</p>
      <p><strong>Refund ID:</strong> ${data.refundId}</p>
      <p><strong>Original Transaction:</strong> ${data.originalTransactionId}</p>
      <p>The refund will appear in your account within 5-10 business days.</p>
    `,
  },
  [NOTIFICATION_TYPES.TRIAL_ENDING]: {
    subject: 'Your Trial is Ending Soon',
    getContent: (data) => `
      <h2>Trial Ending Soon</h2>
      <p>Your ${data.planName} trial will end on ${new Date(data.trialEndDate).toLocaleDateString()}.</p>
      <p>After your trial ends, you'll be charged $${data.amount} for your subscription.</p>
      <p>To avoid being charged, you can cancel your subscription anytime before the trial ends.</p>
      <p><a href="${data.manageUrl}">Manage Subscription</a></p>
    `,
  },
  [NOTIFICATION_TYPES.DUNNING_WARNING]: {
    subject: 'Urgent: Payment Issue - Subscription at Risk',
    getContent: (data) => `
      <h2>Payment Issue - Action Required</h2>
      <p>We've been unable to process your payment for ${data.attemptCount} attempts.</p>
      <p>Your subscription will be cancelled on ${new Date(data.gracePeriodEnd).toLocaleDateString()} if we cannot process your payment.</p>
      <p><strong>Amount Due:</strong> $${data.amount}</p>
      <p>Please update your payment method immediately to keep your subscription active.</p>
      <p><a href="${data.updatePaymentUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Method Now</a></p>
    `,
  },
  [NOTIFICATION_TYPES.SUBSCRIPTION_PAUSED]: {
    subject: 'Subscription Paused',
    getContent: (data) => `
      <h2>Subscription Paused</h2>
      <p>Your ${data.planName} subscription has been paused.</p>
      <p>Your subscription will resume on ${new Date(data.resumeDate).toLocaleDateString()}.</p>
      <p>You can resume your subscription early anytime from your account settings.</p>
      <p><a href="${data.manageUrl}">Manage Subscription</a></p>
    `,
  },
  [NOTIFICATION_TYPES.SUBSCRIPTION_RESUMED]: {
    subject: 'Subscription Resumed',
    getContent: (data) => `
      <h2>Subscription Resumed</h2>
      <p>Welcome back! Your ${data.planName} subscription has been resumed.</p>
      <p>Your next billing date is ${new Date(data.nextBillingDate).toLocaleDateString()}.</p>
      <p>Thank you for continuing with GreenoFig!</p>
    `,
  },
};

/**
 * Create a notification record
 */
export const createNotification = async ({
  userId,
  notificationType,
  subject,
  message,
  recipientEmail,
  deliveryMethod = 'email',
  relatedTransactionId = null,
  relatedSubscriptionId = null,
  relatedInvoiceId = null,
  scheduledAt = null,
  metadata = {},
}) => {
  try {
    const { data, error } = await supabase
      .from('payment_notifications')
      .insert([
        {
          user_id: userId,
          notification_type: notificationType,
          subject,
          message,
          recipient_email: recipientEmail,
          delivery_method: deliveryMethod,
          related_transaction_id: relatedTransactionId,
          related_subscription_id: relatedSubscriptionId,
          related_invoice_id: relatedInvoiceId,
          scheduled_at: scheduledAt || new Date().toISOString(),
          status: 'pending',
          metadata,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send notification based on template
 */
export const sendTemplatedNotification = async ({
  userId,
  notificationType,
  data,
  recipientEmail,
  relatedTransactionId = null,
  relatedSubscriptionId = null,
  relatedInvoiceId = null,
}) => {
  try {
    const template = EMAIL_TEMPLATES[notificationType];
    if (!template) {
      throw new Error(`No template found for notification type: ${notificationType}`);
    }

    const subject = template.subject;
    const message = template.getContent(data);

    // Create notification record
    const notification = await createNotification({
      userId,
      notificationType,
      subject,
      message,
      recipientEmail,
      deliveryMethod: 'email',
      relatedTransactionId,
      relatedSubscriptionId,
      relatedInvoiceId,
      metadata: data,
    });

    // In production, you would send the email here via your email service
    // Example: await sendEmail({ to: recipientEmail, subject, html: message });

    // For now, mark as sent
    await markNotificationAsSent(notification.id);

    return notification;
  } catch (error) {
    console.error('Error sending templated notification:', error);
    throw error;
  }
};

/**
 * Mark notification as sent
 */
export const markNotificationAsSent = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('payment_notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('payment_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
};

/**
 * Helper functions for specific notification types
 */

export const notifyPaymentSuccess = async (userId, transactionData) => {
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (!user?.email) return;

  return sendTemplatedNotification({
    userId,
    notificationType: NOTIFICATION_TYPES.PAYMENT_SUCCEEDED,
    data: {
      amount: transactionData.amount,
      planName: transactionData.planName,
      transactionId: transactionData.id,
      date: transactionData.created_at,
      nextBillingDate: transactionData.nextBillingDate,
    },
    recipientEmail: user.email,
    relatedTransactionId: transactionData.id,
  });
};

export const notifyPaymentFailed = async (userId, failureData) => {
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (!user?.email) return;

  return sendTemplatedNotification({
    userId,
    notificationType: NOTIFICATION_TYPES.PAYMENT_FAILED,
    data: {
      amount: failureData.amount,
      planName: failureData.planName,
      reason: failureData.reason,
      retryDays: failureData.retryDays || 3,
      updatePaymentUrl: `${window.location.origin}/app/profile?tab=billing`,
    },
    recipientEmail: user.email,
    relatedTransactionId: failureData.transactionId,
  });
};

export const notifyUpcomingRenewal = async (userId, subscriptionData) => {
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (!user?.email) return;

  return sendTemplatedNotification({
    userId,
    notificationType: NOTIFICATION_TYPES.UPCOMING_RENEWAL,
    data: {
      planName: subscriptionData.planName,
      renewalDate: subscriptionData.currentPeriodEnd,
      amount: subscriptionData.amount,
      paymentMethod: subscriptionData.paymentMethod,
    },
    recipientEmail: user.email,
    relatedSubscriptionId: subscriptionData.id,
  });
};

export const notifyInvoiceReady = async (userId, invoiceData) => {
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (!user?.email) return;

  return sendTemplatedNotification({
    userId,
    notificationType: NOTIFICATION_TYPES.INVOICE_READY,
    data: {
      planName: invoiceData.planName,
      invoiceNumber: invoiceData.invoiceNumber,
      amount: invoiceData.amount,
      date: invoiceData.issueDate,
      invoiceUrl: `${window.location.origin}/app/profile?tab=billing&invoice=${invoiceData.id}`,
    },
    recipientEmail: user.email,
    relatedInvoiceId: invoiceData.id,
  });
};

export const notifyRefundProcessed = async (userId, refundData) => {
  const { data: user } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();

  if (!user?.email) return;

  return sendTemplatedNotification({
    userId,
    notificationType: NOTIFICATION_TYPES.REFUND_PROCESSED,
    data: {
      amount: refundData.amount,
      refundId: refundData.id,
      originalTransactionId: refundData.paymentTransactionId,
    },
    recipientEmail: user.email,
  });
};

export default {
  NOTIFICATION_TYPES,
  createNotification,
  sendTemplatedNotification,
  markNotificationAsSent,
  getUserNotifications,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  notifyUpcomingRenewal,
  notifyInvoiceReady,
  notifyRefundProcessed,
};
