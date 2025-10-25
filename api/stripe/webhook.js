/**
 * Stripe Webhook Handler
 *
 * This endpoint receives webhook events from Stripe and processes them.
 * It should be deployed as a serverless function or Express endpoint.
 *
 * Setup Instructions:
 * 1. Deploy this as an API endpoint (e.g., Vercel, Netlify, or Express)
 * 2. Configure webhook URL in Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * 3. Set webhook endpoint to: https://your-domain.com/api/stripe/webhook
 * 4. Select events to listen for (see list below)
 * 5. Copy the webhook signing secret to your environment variables
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations
);

/**
 * Main webhook handler
 */
module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event
  await logWebhookEvent(event);

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await markWebhookProcessed(event.id);

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    await markWebhookFailed(event.id, error.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Log webhook event to database
 */
async function logWebhookEvent(event) {
  await supabase.from('webhook_events').insert([
    {
      event_id: event.id,
      event_type: event.type,
      provider: 'stripe',
      status: 'pending',
      payload: event,
      api_version: event.api_version,
    },
  ]);
}

/**
 * Mark webhook as processed
 */
async function markWebhookProcessed(eventId) {
  await supabase
    .from('webhook_events')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString(),
    })
    .eq('event_id', eventId);
}

/**
 * Mark webhook as failed
 */
async function markWebhookFailed(eventId, error) {
  await supabase
    .from('webhook_events')
    .update({
      status: 'failed',
      last_error: error,
      processing_attempts: supabase.raw('processing_attempts + 1'),
    })
    .eq('event_id', eventId);
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session) {
  const userId = session.client_reference_id;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planId = subscription.metadata.plan_id;

  // Create payment transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .insert([
      {
        user_id: userId,
        subscription_plan_id: planId,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        status: 'succeeded',
        payment_method: 'stripe',
        payment_intent_id: session.payment_intent,
        stripe_customer_id: customerId,
        billing_cycle: subscription.items.data[0].plan.interval,
      },
    ])
    .select()
    .single();

  // Update user subscription
  await supabase.from('user_subscriptions').upsert(
    {
      user_id: userId,
      subscription_plan_id: planId,
      stripe_subscription_id: subscriptionId,
      status: 'active',
      billing_cycle: subscription.items.data[0].plan.interval,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );

  // Create invoice
  await createInvoiceFromTransaction(transaction.id);

  // Send notification
  await sendPaymentSuccessNotification(userId, transaction);
}

/**
 * Handle payment succeeded
 */
async function handlePaymentSucceeded(paymentIntent) {
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .update({
      status: 'succeeded',
    })
    .eq('payment_intent_id', paymentIntent.id)
    .select()
    .single();

  if (transaction) {
    await sendPaymentSuccessNotification(transaction.user_id, transaction);
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(paymentIntent) {
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      failure_code: paymentIntent.last_payment_error?.code,
      failure_message: paymentIntent.last_payment_error?.message,
    })
    .eq('payment_intent_id', paymentIntent.id)
    .select()
    .single();

  if (transaction) {
    // Create payment failure record for dunning
    await supabase.from('payment_failures').insert([
      {
        user_id: transaction.user_id,
        payment_transaction_id: transaction.id,
        failure_reason: paymentIntent.last_payment_error?.message,
        failure_code: paymentIntent.last_payment_error?.code,
        amount: transaction.amount,
        status: 'pending_retry',
        retry_count: 0,
        next_retry_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Retry in 3 days
      },
    ]);

    await sendPaymentFailedNotification(transaction.user_id, transaction);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription) {
  // Subscription is already created in checkout.session.completed
  console.log('Subscription created:', subscription.id);
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription) {
  const { data: userSub } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (userSub) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('id', userSub.id);
  }
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription) {
  const { data: userSub } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (userSub) {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('id', userSub.id);

    await sendSubscriptionCancelledNotification(userSub.user_id);
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice) {
  // Find the transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('payment_intent_id', invoice.payment_intent)
    .single();

  if (transaction) {
    // Create invoice record
    await createInvoiceFromTransaction(transaction.id);
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log('Invoice payment failed:', invoice.id);
  // Dunning is already handled in payment_intent.payment_failed
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge) {
  const refundId = charge.refunds.data[0]?.id;

  // Update refund record
  await supabase
    .from('refunds')
    .update({
      status: 'completed',
      stripe_refund_id: refundId,
      completed_at: new Date().toISOString(),
    })
    .eq('payment_transaction_id', charge.metadata.transaction_id);

  // Update transaction
  await supabase
    .from('payment_transactions')
    .update({
      status: 'refunded',
      is_refunded: true,
      refunded_amount: charge.amount_refunded / 100,
    })
    .eq('payment_intent_id', charge.payment_intent);
}

/**
 * Helper: Create invoice from transaction
 */
async function createInvoiceFromTransaction(transactionId) {
  // This would call your invoice generation service
  // For now, just log it
  console.log('Creating invoice for transaction:', transactionId);
  // In production: await invoiceService.createInvoiceFromTransaction(transactionId);
}

/**
 * Helper: Send notifications
 */
async function sendPaymentSuccessNotification(userId, transaction) {
  await supabase.from('payment_notifications').insert([
    {
      user_id: userId,
      notification_type: 'payment_succeeded',
      subject: 'Payment Successful',
      message: `Your payment of $${transaction.amount} was successful`,
      status: 'pending',
      related_transaction_id: transaction.id,
    },
  ]);
}

async function sendPaymentFailedNotification(userId, transaction) {
  await supabase.from('payment_notifications').insert([
    {
      user_id: userId,
      notification_type: 'payment_failed',
      subject: 'Payment Failed',
      message: `Your payment of $${transaction.amount} failed`,
      status: 'pending',
      related_transaction_id: transaction.id,
    },
  ]);
}

async function sendSubscriptionCancelledNotification(userId) {
  await supabase.from('payment_notifications').insert([
    {
      user_id: userId,
      notification_type: 'subscription_cancelled',
      subject: 'Subscription Cancelled',
      message: 'Your subscription has been cancelled',
      status: 'pending',
    },
  ]);
}
