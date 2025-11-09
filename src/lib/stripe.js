import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './customSupabaseClient';

// Use Stripe publishable key directly for faster loading
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SHrlbPPAckGFnuTvYujWq9sz4oO2cpWTlSRURA62g3MDIcqSx8wBV65fL5hP7hmaWylbAlY8CjZl5yirP27JzKg00OkbSgYy8';
let stripePromise = null;

export const getStripe = async () => {
  if (!stripePromise) {
    // Use hardcoded key for faster loading
    if (STRIPE_PUBLISHABLE_KEY) {
      stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    } else {
      // Fallback to database
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
  }
  return stripePromise;
};

// Create a checkout session (this would normally call your backend API)
export const createCheckoutSession = async ({ planId, billingCycle, userId }) => {
  try {
    // In a real app, this would call your backend API endpoint
    // For now, we'll create a mock checkout session

    // Fetch plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

    // TODO: Replace with actual backend API call
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ planId, billingCycle, userId }),
    // });
    // const { sessionId } = await response.json();

    // For now, return a mock session
    return {
      sessionId: 'mock_session_' + Date.now(),
      amount,
      plan,
      billingCycle,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create a payment transaction record
export const createPaymentTransaction = async ({
  userId,
  subscriptionPlanId,
  amount,
  billingCycle,
  paymentIntentId,
  status = 'pending',
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

// Update subscription status
export const updateSubscription = async ({
  userId,
  subscriptionPlanId,
  stripeSubscriptionId,
  status,
  billingCycle,
  currentPeriodStart,
  currentPeriodEnd,
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

// Get user's current subscription
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

// Cancel subscription
export const cancelSubscription = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: true,
        status: 'canceled',
        canceled_at: new Date().toISOString(),
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
