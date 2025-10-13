import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*' // DO NOT CHANGE THIS
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }
    
    try {
        // Create a Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Create a Stripe client
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const stripe = new Stripe(stripeKey);
        
        // Get the authorization token from the request headers
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        // Extract the token from the Authorization header
        const token = authHeader.replace('Bearer ', '');

        // Get user information from the JWT token
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            throw new Error('Invalid or expired token');
        }

        // Get the request body
        const requestData = await req.json();
        const { planId, billingInterval, returnUrl } = requestData;

        // Validate input data
        if (!planId || !billingInterval) {
            throw new Error('Missing required fields: planId, billingInterval');
        }

        if (!['monthly', 'yearly'].includes(billingInterval)) {
            throw new Error('Invalid billing interval. Must be monthly or yearly');
        }

        // Get subscription plan details
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .eq('is_active', true)
            .single();

        if (planError || !plan) {
            throw new Error('Subscription plan not found or inactive');
        }

        // Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            throw new Error('User profile not found');
        }

        // Calculate price based on billing interval
        const price = billingInterval === 'yearly' ? plan.price_yearly : plan.price_monthly;
        const stripePriceId = billingInterval === 'yearly' 
            ? plan.stripe_price_id_yearly 
            : plan.stripe_price_id_monthly;

        // Create or get Stripe customer
        let stripeCustomerId = null;
        
        // Check if user already has a Stripe customer ID
        const { data: existingSubscription } = await supabase
            .from('user_subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .not('stripe_customer_id', 'is', null)
            .limit(1)
            .single();

        if (existingSubscription?.stripe_customer_id) {
            stripeCustomerId = existingSubscription.stripe_customer_id;
        } else {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: userProfile.email,
                name: userProfile.full_name,
                metadata: {
                    user_id: user.id,
                    plan_id: planId
                }
            });
            stripeCustomerId = customer.id;
        }

        // Create Stripe checkout session for subscription
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${plan.name} Plan`,
                            description: plan.description,
                            metadata: {
                                plan_id: planId,
                                billing_interval: billingInterval
                            }
                        },
                        unit_amount: Math.round(price * 100),
                        recurring: {
                            interval: billingInterval === 'yearly' ? 'year' : 'month'
                        }
                    },
                    quantity: 1,
                }
            ],
            mode: 'subscription',
            success_url: `${returnUrl || 'https://yourapp.com'}?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${returnUrl || 'https://yourapp.com'}?cancelled=true`,
            metadata: {
                user_id: user.id,
                plan_id: planId,
                billing_interval: billingInterval
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    plan_id: planId,
                    billing_interval: billingInterval
                },
                trial_period_days: plan.name.toLowerCase() === 'basic' ? 0 : 14, // 14-day trial for paid plans
            },
            allow_promotion_codes: true,
            billing_address_collection: 'required',
            customer_update: {
                address: 'auto'
            }
        });

        // Create pending subscription record in database
        const subscriptionData = {
            user_id: user.id,
            plan_id: planId,
            status: 'inactive',
            billing_interval: billingInterval,
            stripe_customer_id: stripeCustomerId,
            current_period_start: null,
            current_period_end: null,
            trial_end: plan.name.toLowerCase() !== 'basic' 
                ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() 
                : null
        };

        const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .insert(subscriptionData);

        if (subscriptionError) {
            console.error('Failed to create subscription record:', subscriptionError);
            // Don't throw error here as Stripe session is already created
        }

        // Record payment transaction
        const { error: transactionError } = await supabase
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                amount: price,
                currency: 'usd',
                status: 'pending',
                billing_reason: 'subscription_create'
            });

        if (transactionError) {
            console.error('Failed to record payment transaction:', transactionError);
        }

        // Return the Stripe checkout session
        return new Response(JSON.stringify({
            success: true,
            checkout_url: checkoutSession.url,
            session_id: checkoutSession.id,
            plan_name: plan.name,
            amount: price,
            billing_interval: billingInterval,
            trial_days: plan.name.toLowerCase() === 'basic' ? 0 : 14
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 200
        });
        
    } catch (error) {
        console.error('Subscription payment creation error:', error.message);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 400
        });
    }
});