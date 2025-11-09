import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.30.0';
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const planId = session.metadata?.plan_id;
        const billingCycle = session.metadata?.billing_cycle;

        if (!userId || !planId || !billingCycle) {
          throw new Error('Missing metadata in checkout session');
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Update payment transaction to succeeded
        await supabaseClient
          .from('payment_transactions')
          .update({
            status: 'succeeded',
            payment_intent_id: subscription.latest_invoice as string,
          })
          .eq('payment_intent_id', session.id);

        // Create or update user subscription
        await supabaseClient.from('user_subscriptions').upsert({
          user_id: userId,
          subscription_plan_id: planId,
          stripe_subscription_id: subscription.id,
          status: 'active',
          billing_cycle: billingCycle,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        console.log('Subscription activated for user:', userId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.user_id;

          if (userId) {
            // Update subscription period
            await supabaseClient
              .from('user_subscriptions')
              .update({
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                status: 'active',
              })
              .eq('stripe_subscription_id', subscriptionId);

            console.log('Subscription renewed for user:', userId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await supabaseClient
            .from('user_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);

          console.log('Payment failed for subscription:', subscriptionId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabaseClient
            .from('user_subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id);

          console.log('Subscription updated for user:', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Subscription canceled:', subscription.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
