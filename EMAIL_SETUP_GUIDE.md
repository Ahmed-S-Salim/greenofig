# Email Service Setup Guide - Resend

## Why Resend?
- Modern, developer-friendly API
- Generous free tier (3,000 emails/month)
- No credit card required to start
- Easy setup

## Step 1: Create Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address
4. Login to dashboard

## Step 2: Get Your API Key

1. In Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Name it: "GreenoFig Support System"
4. Copy the API key (starts with `re_`)

## Step 3: Add API Key to Environment

Create/update `.env` file in your project root:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

**IMPORTANT:** Never commit this to git! Add to `.gitignore`:
```
.env
.env.local
```

## Step 4: Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter: `greenofig.com` (or your domain)
4. Add the DNS records they provide to your domain registrar
5. Wait for verification (usually 5-15 minutes)

**For testing/development:**
- You can use the default sandbox: `onboarding@resend.dev`
- Emails will only go to addresses you've verified

## Step 5: Install Resend Package

I'll do this for you in the next step, but the command is:
```bash
npm install resend
```

## Step 6: Test Your Setup

After I create the email service, you can test with:
```javascript
// This will be in the code I create
await sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  body: 'This is a test from GreenoFig!'
});
```

## Alternative: SendGrid (if you prefer)

If you'd rather use SendGrid:

1. Go to https://signup.sendgrid.com/
2. Create account (free tier: 100 emails/day)
3. Get API key from Settings → API Keys
4. Use env var: `VITE_SENDGRID_API_KEY`
5. Install: `npm install @sendgrid/mail`

Let me know which you prefer and I'll set it up!

## Pricing Comparison

**Resend (Recommended):**
- Free: 3,000 emails/month, 100/day
- Pro: $20/month for 50,000 emails

**SendGrid:**
- Free: 100 emails/day (3,000/month)
- Essentials: $19.95/month for 50,000 emails

Both are good! Resend is newer and more modern, SendGrid is more established.
