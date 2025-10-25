# 🚀 Deployment Guide - GreenoFig

## Pre-Deployment Checklist

Before deploying to production, ensure you complete these steps:

### 1. Security ✅
- [ ] All API keys moved to environment variables
- [ ] `.env.local` added to `.gitignore`
- [ ] Revoked any exposed API keys
- [ ] Supabase RLS policies enabled on all tables
- [ ] CORS properly configured
- [ ] HTTPS enforced

### 2. Database ✅
- [ ] All migrations applied to production Supabase
- [ ] Test data removed from production
- [ ] Backups configured
- [ ] RLS policies tested

### 3. Performance ✅
- [ ] Production build tested (`npm run build`)
- [ ] Lighthouse audit score > 90
- [ ] Images optimized (WebP format recommended)
- [ ] Bundle size checked
- [ ] CDN configured for static assets (optional)

### 4. SEO & Compliance ✅
- [ ] Sitemap.xml in place
- [ ] Robots.txt configured
- [ ] Privacy Policy page live
- [ ] Terms of Service page live
- [ ] Meta tags on all pages
- [ ] Google Search Console verified
- [ ] Google Analytics installed (if using)

### 5. Testing ✅
- [ ] All critical user flows tested
- [ ] Payment flow tested with Stripe test mode
- [ ] Email notifications working
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is optimized for Vite and provides excellent performance.

#### Steps:

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# From project root
vercel

# Follow the prompts
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? greenofig
# - Directory? ./
# - Override settings? No
```

4. **Set Environment Variables**

Go to Vercel Dashboard → Project → Settings → Environment Variables

Add all variables from `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_RESEND_API_KEY`
- `VITE_APP_URL` (set to your production URL)

5. **Deploy to Production**
```bash
vercel --prod
```

#### Custom Domain Setup

1. Go to Vercel Dashboard → Domains
2. Add your custom domain (e.g., greenofig.com)
3. Update DNS records as instructed
4. SSL certificate is auto-provisioned

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Initialize**
```bash
netlify init
```

4. **Configure Build Settings**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

5. **Set Environment Variables**
```bash
netlify env:set VITE_SUPABASE_URL "your_value"
netlify env:set VITE_SUPABASE_ANON_KEY "your_value"
# ... (add all environment variables)
```

6. **Deploy**
```bash
netlify deploy --prod
```

### Option 3: Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages
2. Connect your Git repository
3. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `18`
4. Add environment variables in Pages settings
5. Deploy

## Post-Deployment Steps

### 1. Update CORS Settings

Update Supabase Edge Function CORS to allow your production domain:

```typescript
// In ai-coach-memory/index.ts
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];
```

Redeploy edge function:
```bash
npx supabase functions deploy ai-coach-memory
```

### 2. Update Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, etc.
4. Copy webhook secret to environment variables

### 3. Update Email Service

Update Resend domain verification:
1. Verify your domain in Resend dashboard
2. Update DNS records
3. Test emails

### 4. Configure Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Verify ownership (via DNS or HTML file)
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 5. Set Up Monitoring

#### Performance Monitoring
- Enable Web Vitals tracking
- Set up alerts for performance degradation

#### Error Tracking (Optional but Recommended)
Install Sentry:
```bash
npm install @sentry/react
```

Configure in `main.jsx`:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

#### Uptime Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

### 6. Enable Analytics

**Google Analytics (if using):**
Add to `index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Or use Plausible (privacy-friendly):**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## Environment-Specific Configuration

### Development
```env
VITE_APP_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Staging (Optional)
```env
VITE_APP_URL=https://staging.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Production
```env
VITE_APP_URL=https://yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Rollback Procedure

### Vercel
```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Netlify
```bash
# List deploys
netlify deploy:list

# Rollback
netlify rollback
```

## Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Performance Optimization Checklist

- [ ] Enable Brotli compression
- [ ] Configure CDN for static assets
- [ ] Enable HTTP/2
- [ ] Implement service worker (optional)
- [ ] Configure cache headers
- [ ] Enable image optimization

## Security Checklist

- [ ] HTTPS enforced
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization
- [ ] SQL injection prevention (via RLS)
- [ ] XSS prevention
- [ ] CSRF protection

## Monitoring & Alerts

Set up alerts for:
- Site downtime
- Performance degradation
- Error rate spikes
- Failed payments
- Database connection issues

## Backup Strategy

1. **Database Backups**
   - Supabase automatic backups (check your plan)
   - Weekly manual exports

2. **Code Backups**
   - Git repository (GitHub/GitLab)
   - Regular tags for releases

3. **Environment Variables**
   - Secure storage of all secrets
   - Documentation of all variables

## Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Monitor uptime

**Monthly:**
- [ ] Update dependencies
- [ ] Security audit
- [ ] Backup verification
- [ ] Performance optimization review

**Quarterly:**
- [ ] Full security audit
- [ ] Lighthouse audit
- [ ] User feedback review
- [ ] Feature prioritization

---

## Need Help?

If you encounter deployment issues:

1. Check deployment logs
2. Verify all environment variables are set
3. Test build locally: `npm run build && npm run preview`
4. Review error messages in browser console
5. Check Supabase logs for API errors

**Support Channels:**
- Documentation: [Link]
- Email: devops@greenofig.com
- Slack: [Team channel]
