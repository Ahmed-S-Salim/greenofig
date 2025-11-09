import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.30.0';
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Parse request body
    const { planId, billingCycle, successUrl, cancelUrl, couponCode } = await req.json();

    // Fetch plan details from database
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Calculate amount based on billing cycle
    const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const unitAmount = Math.round(amount * 100); // Convert to cents

    // Get or create Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to user profile
      await supabaseClient
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Prepare line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.description,
          },
          unit_amount: unitAmount,
          recurring: {
            interval: billingCycle === 'yearly' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get('origin')}/app/user?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/pricing?payment=cancelled`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
          billing_cycle: billingCycle,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    // Apply coupon if provided
    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Create pending payment transaction
    await supabaseClient.from('payment_transactions').insert({
      user_id: user.id,
      subscription_plan_id: planId,
      amount,
      billing_cycle: billingCycle,
      payment_intent_id: session.id,
      payment_method: 'stripe',
      status: 'pending',
      currency: 'USD',
      stripe_customer_id: customerId,
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
