# Stripe Integration Setup Guide

This guide will help you complete the Stripe payment integration for GreenoFig.

## Prerequisites

- Stripe account ([sign up at stripe.com](https://dashboard.stripe.com/register))
- Supabase project with CLI installed
- Access to your server/hosting environment

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

**Important:** Use test keys for development, live keys only for production.

## Step 2: Configure Supabase Edge Functions

### Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### Deploy Edge Functions

1. Navigate to your project directory:
```bash
cd "C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite"
```

2. Link your Supabase project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

3. Set Stripe secret key as environment variable:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

4. Deploy the Edge Functions:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

## Step 3: Add Stripe Keys to Database

You need to store your Stripe publishable key in the database so the frontend can load it.

### Option A: Using Supabase SQL Editor

Run this SQL in your Supabase SQL Editor:

```sql
-- Create payment_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Stripe publishable key
INSERT INTO payment_settings (provider, public_key, is_active)
VALUES ('stripe', 'pk_test_YOUR_PUBLISHABLE_KEY', true)
ON CONFLICT (provider)
DO UPDATE SET
  public_key = EXCLUDED.public_key,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

### Option B: Using Admin Panel

1. Navigate to `/app/admin` in your application
2. Go to **Database Studio**
3. Find the `payment_settings` table
4. Add a new row with:
   - provider: `stripe`
   - public_key: `pk_test_YOUR_PUBLISHABLE_KEY`
   - is_active: `true`

## Step 4: Update User Profiles Table

Add a column to store Stripe customer IDs:

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id
ON user_profiles(stripe_customer_id);
```

## Step 5: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your app about payment events.

1. Go to **Developers** → **Webhooks** in your Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Supabase secrets:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## Step 6: Test the Integration

### Test Mode (Development)

1. Ensure you're using test API keys
2. Navigate to `/pricing` in your app
3. Click on a subscription plan
4. In the checkout, use Stripe test cards:
   - **Success:** `4242 4242 4242 4242`
   - **Declined:** `4000 0000 0000 0002`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC

### Verify Subscription Created

After successful payment:
1. Check your Stripe Dashboard → **Payments** to see the test payment
2. Check your Supabase database → `user_subscriptions` table
3. Log in to your app → Navigate to **Dashboard** to see subscription details

## Step 7: Production Deployment

### Before Going Live:

1. **Switch to Live Keys:**
   - Replace test keys with live keys in Supabase secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
   ```
   - Update `payment_settings` table with live publishable key

2. **Update Webhook:**
   - Create a new webhook endpoint with live mode enabled
   - Use the same URL as before
   - Update webhook secret in Supabase secrets

3. **Verify Database:**
   - Ensure all required tables exist
   - Run migrations if needed

4. **Test Again:**
   - Use test mode one final time
   - Switch to live mode
   - Make a real $1 test purchase (you can refund it later)

## Troubleshooting

### "Payment system is not configured" Error

**Cause:** Stripe secret key not set in Supabase Edge Functions

**Solution:**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
supabase functions deploy create-checkout-session
```

### Checkout Session Not Creating

**Causes:**
- Stripe key is invalid
- Plan ID doesn't exist in database
- User not authenticated

**Solution:** Check browser console for errors and Supabase Edge Function logs:
```bash
supabase functions logs create-checkout-session
```

### Webhook Not Working

**Causes:**
- Wrong webhook URL
- Webhook secret not set
- Selected events don't include required events

**Solution:**
1. Verify webhook URL in Stripe Dashboard
2. Check webhook secret:
```bash
supabase secrets list
```
3. Ensure all required events are selected

### Subscription Not Activating After Payment

**Cause:** Webhook not being received or processed

**Solution:**
1. Check Stripe Dashboard → **Developers** → **Events** to see if webhook was sent
2. Check Supabase Edge Function logs:
```bash
supabase functions logs stripe-webhook
```
3. Manually trigger webhook from Stripe Dashboard for testing

## Database Schema Reference

### Required Tables:

- `subscription_plans` - Your pricing plans
- `user_subscriptions` - Active user subscriptions
- `payment_transactions` - Payment history
- `payment_settings` - Stripe configuration
- `user_profiles` - Must have `stripe_customer_id` column

### Optional Tables (for advanced features):

- `payment_methods` - Saved payment methods
- `refunds` - Refund requests
- `subscription_changes` - Plan upgrades/downgrades

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always validate** webhook signatures
3. **Use HTTPS** for all production endpoints
4. **Regularly rotate** API keys
5. **Monitor** Stripe Dashboard for suspicious activity
6. **Set up alerts** for failed payments
7. **Test webhooks** before going live

## Support

- **Stripe Documentation:** https://stripe.com/docs
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions
- **Stripe Testing:** https://stripe.com/docs/testing

## Quick Reference Commands

```bash
# Deploy Edge Functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

# View logs
supabase functions logs create-checkout-session
supabase functions logs stripe-webhook

# List secrets
supabase secrets list
```

---

**Status:** Ready for testing with test API keys
**Next Step:** Add your Stripe test keys and deploy Edge Functions
