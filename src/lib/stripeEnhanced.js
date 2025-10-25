/**
 * Enhanced Stripe Service
 * Includes: Real checkout, refunds, payment methods, subscriptions management
 */

import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './customSupabaseClient';

let stripePromise = null;

export const getStripe = async () => {
  if (!stripePromise) {
    const { data: settings } = await supabase
      .from('payment_settings')
      .select('public_key, is_active')
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .single();

    if (settings && settings.public_key) {
      stripePromise = loadStripe(settings.public_key);
    } else {
      console.error('Stripe is not configured or not active');
      return null;
    }
  }
  return stripePromise;
};

// =====================================================
// CHECKOUT & PAYMENT INTENTS
// =====================================================

/**
 * Create a real Stripe checkout session
 */
export const createCheckoutSession = async ({
  planId,
  billingCycle,
  userId,
  successUrl,
  cancelUrl,
  couponCode = null
}) => {
  try {
    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    // In production, this should call your backend API
    // Example backend endpoint:
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        planId,
        billingCycle,
        userId,
        successUrl: successUrl || `${window.location.origin}/app/user?payment=success`,
        cancelUrl: cancelUrl || `${window.location.origin}/pricing?payment=cancelled`,
        couponCode
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { sessionId, url } = await response.json();

    return {
      sessionId,
      url,
      amount,
      plan,
      billingCycle,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Redirect to Stripe Checkout
 */
export const redirectToCheckout = async (sessionId) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not initialized');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    throw error;
  }
};

// =====================================================
// TRANSACTIONS
// =====================================================

export const createPaymentTransaction = async ({
  userId,
  subscriptionPlanId,
  amount,
  billingCycle,
  paymentIntentId,
  status = 'pending',
  stripeCustomerId = null,
  failureCode = null,
  failureMessage = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([
        {
          user_id: userId,
          subscription_plan_id: subscriptionPlanId,
          amount,
          billing_cycle: billingCycle,
          payment_intent_id: paymentIntentId,
          payment_method: 'stripe',
          status,
          currency: 'USD',
          stripe_customer_id: stripeCustomerId,
          failure_code: failureCode,
          failure_message: failureMessage,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw error;
  }
};

export const updatePaymentTransaction = async (transactionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payment transaction:', error);
    throw error;
  }
};

// =====================================================
// SUBSCRIPTIONS
// =====================================================

export const updateSubscription = async ({
  userId,
  subscriptionPlanId,
  stripeSubscriptionId,
  status,
  billingCycle,
  currentPeriodStart,
  currentPeriodEnd,
  trialStart = null,
  trialEnd = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(
        {
          user_id: userId,
          subscription_plan_id: subscriptionPlanId,
          stripe_subscription_id: stripeSubscriptionId,
          status,
          billing_cycle: billingCycle,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          trial_start: trialStart,
          trial_end: trialEnd,
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const getUserSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};

export const cancelSubscription = async (userId, reason = null, feedback = null) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: true,
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancellation_reason: reason,
        cancellation_feedback: feedback,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const pauseSubscription = async (userId, reason = null, resumeAt = null) => {
  try {
    const { data, error} = await supabase
      .from('user_subscriptions')
      .update({
        status: 'paused',
        pause_reason: reason,
        paused_at: new Date().toISOString(),
        resume_at: resumeAt,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error pausing subscription:', error);
    throw error;
  }
};

export const resumeSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        pause_reason: null,
        paused_at: null,
        resume_at: null,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
};

// =====================================================
// SUBSCRIPTION UPGRADES / DOWNGRADES
// =====================================================

export const createSubscriptionChange = async ({
  userId,
  subscriptionId,
  changeType,
  oldPlanId,
  newPlanId,
  oldBillingCycle,
  newBillingCycle,
  oldPrice,
  newPrice,
  prorationAmount = 0,
  effectiveDate,
  changeReason = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('subscription_changes')
      .insert([
        {
          user_id: userId,
          subscription_id: subscriptionId,
          change_type: changeType,
          old_plan_id: oldPlanId,
          new_plan_id: newPlanId,
          old_billing_cycle: oldBillingCycle,
          new_billing_cycle: newBillingCycle,
          old_price: oldPrice,
          new_price: newPrice,
          proration_amount: prorationAmount,
          effective_date: effectiveDate,
          scheduled_for: effectiveDate,
          change_reason: changeReason,
          initiated_by: userId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription change:', error);
    throw error;
  }
};

export const processSubscriptionUpgrade = async (userId, newPlanId, newBillingCycle) => {
  try {
    // Get current subscription
    const currentSub = await getUserSubscription(userId);
    if (!currentSub) {
      throw new Error('No active subscription found');
    }

    // Get new plan
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single();

    if (planError || !newPlan) {
      throw new Error('New plan not found');
    }

    const oldPrice = currentSub.billing_cycle === 'yearly'
      ? currentSub.subscription_plans.price_yearly
      : currentSub.subscription_plans.price_monthly;

    const newPrice = newBillingCycle === 'yearly'
      ? newPlan.price_yearly
      : newPlan.price_monthly;

    // Calculate proration
    const now = new Date();
    const periodEnd = new Date(currentSub.current_period_end);
    const daysRemaining = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));
    const totalDays = currentSub.billing_cycle === 'yearly' ? 365 : 30;
    const unusedAmount = (oldPrice * daysRemaining) / totalDays;
    const prorationAmount = newPrice - unusedAmount;

    // Create change record
    await createSubscriptionChange({
      userId,
      subscriptionId: currentSub.id,
      changeType: newPrice > oldPrice ? 'upgrade' : 'downgrade',
      oldPlanId: currentSub.subscription_plan_id,
      newPlanId,
      oldBillingCycle: currentSub.billing_cycle,
      newBillingCycle,
      oldPrice,
      newPrice,
      prorationAmount,
      effectiveDate: new Date().toISOString(),
    });

    // Update subscription
    await updateSubscription({
      userId,
      subscriptionPlanId: newPlanId,
      stripeSubscriptionId: currentSub.stripe_subscription_id,
      status: 'active',
      billingCycle: newBillingCycle,
      currentPeriodStart: currentSub.current_period_start,
      currentPeriodEnd: currentSub.current_period_end,
    });

    return {
      success: true,
      prorationAmount,
      newPlan,
    };
  } catch (error) {
    console.error('Error processing subscription upgrade:', error);
    throw error;
  }
};

// =====================================================
// PAYMENT METHODS
// =====================================================

export const addPaymentMethod = async ({
  userId,
  stripePaymentMethodId,
  paymentType,
  cardBrand = null,
  cardLast4 = null,
  cardExpMonth = null,
  cardExpYear = null,
  billingDetails = {},
  isDefault = false,
}) => {
  try {
    // If setting as default, unset other defaults first
    if (isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert([
        {
          user_id: userId,
          stripe_payment_method_id: stripePaymentMethodId,
          payment_type: paymentType,
          card_brand: cardBrand,
          card_last4: cardLast4,
          card_exp_month: cardExpMonth,
          card_exp_year: cardExpYear,
          billing_details: billingDetails,
          is_default: isDefault,
          is_verified: true,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

export const getUserPaymentMethods = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
};

export const setDefaultPaymentMethod = async (userId, paymentMethodId) => {
  try {
    // Unset all defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set new default
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

export const removePaymentMethod = async (userId, paymentMethodId) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ status: 'inactive' })
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw error;
  }
};

// =====================================================
// REFUNDS
// =====================================================

export const requestRefund = async ({
  userId,
  paymentTransactionId,
  amount,
  reason,
  refundType = 'full',
  customerNotes = null,
}) => {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .insert([
        {
          user_id: userId,
          payment_transaction_id: paymentTransactionId,
          amount,
          reason,
          refund_type: refundType,
          customer_notes: customerNotes,
          status: 'pending',
          requested_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
};

export const approveRefund = async (refundId, adminUserId, adminNotes = null) => {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .update({
        status: 'approved',
        approved_by: adminUserId,
        approved_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', refundId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error approving refund:', error);
    throw error;
  }
};

export const processRefund = async (refundId, stripeRefundId) => {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .update({
        status: 'completed',
        stripe_refund_id: stripeRefundId,
        processed_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq('id', refundId)
      .select()
      .single();

    if (error) throw error;

    // Update the original transaction
    const { data: refundData } = await supabase
      .from('refunds')
      .select('payment_transaction_id, amount')
      .eq('id', refundId)
      .single();

    if (refundData) {
      await supabase
        .from('payment_transactions')
        .update({
          status: 'refunded',
          is_refunded: true,
          refunded_amount: refundData.amount,
        })
        .eq('id', refundData.payment_transaction_id);
    }

    return data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

export const getUserRefunds = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('refunds')
      .select(`
        *,
        payment_transactions (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user refunds:', error);
    return [];
  }
};

// =====================================================
// EXPORT
// =====================================================

export default {
  getStripe,
  createCheckoutSession,
  redirectToCheckout,
  createPaymentTransaction,
  updatePaymentTransaction,
  updateSubscription,
  getUserSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  createSubscriptionChange,
  processSubscriptionUpgrade,
  addPaymentMethod,
  getUserPaymentMethods,
  setDefaultPaymentMethod,
  removePaymentMethod,
  requestRefund,
  approveRefund,
  processRefund,
  getUserRefunds,
};
