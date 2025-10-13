# Greenofig Web Deployment Guide

## 🌐 Live Web Deployment Setup

Your app is configured for web deployment with all your existing services:
- ✅ Supabase (Database & Auth)
- ✅ Google Cloud Console
- ✅ Netlify (Web Hosting)
- ✅ Stripe (Payments)
- ✅ Gemini AI

---

## 📋 Quick Start

### Option 1: Deploy to Netlify (Recommended)

1. **Push to Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for web deployment"
   ```

2. **Connect to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository (GitHub, GitLab, or Bitbucket)
   - Netlify will auto-detect the `netlify.toml` configuration

3. **Set Environment Variables in Netlify**:
   - Go to Site settings → Environment variables
   - Add these variables (already in your `.env.production`):
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `GEMINI_API_KEY`
     - `STRIPE_PUBLISHABLE_KEY`

4. **Deploy**:
   - Click "Deploy site"
   - Your app will be live at: `https://your-site-name.netlify.app`

---

### Option 2: Test Locally First

Run the build script to create a production build:

**Windows:**
```bash
build_web.bat
```

**Manual build:**
```bash
flutter clean
flutter pub get
flutter build web --release --web-renderer canvaskit
```

**Test locally:**
```bash
flutter run -d chrome --web-port=8080
```

---

## 🔧 Configuration Files Created

### 1. `netlify.toml`
- Build command: `flutter build web --release --web-renderer canvaskit`
- Publish directory: `build/web`
- Redirects for single-page app
- Security headers
- Cache optimization

### 2. `.env.production`
- Contains your API keys for production
- **Important**: These should be set as environment variables in Netlify Dashboard

### 3. `web/index.html`
- Updated with proper meta tags
- Responsive viewport settings
- Loading screen

### 4. `web/manifest.json`
- Updated with your app branding
- Dark theme (#0D0D0D background, #00FF41 primary)
- PWA configuration

---

## 🚀 Deployment Checklist

- [x] Netlify configuration (`netlify.toml`)
- [x] Environment variables file (`.env.production`)
- [x] Web index.html optimized
- [x] PWA manifest configured
- [ ] **TODO**: Set environment variables in Netlify Dashboard
- [ ] **TODO**: Update Google OAuth redirect URIs to include your Netlify domain
- [ ] **TODO**: Update Stripe webhook URLs if using webhooks
- [ ] **TODO**: Configure Supabase URL redirects for your domain

---

## 🔐 Security Notes

### API Keys Preserved:
- ✅ Supabase URL & Anon Key
- ✅ Gemini API Key
- ✅ Stripe Publishable Key

### To Add (Optional):
- OpenAI API Key
- Anthropic API Key
- Perplexity API Key
- Google Web Client ID (for OAuth)

**IMPORTANT**: Never commit API keys to public repositories. Use Netlify's environment variables for production.

---

## 📱 Post-Deployment Steps

### 1. Update Google Cloud Console
- Add your Netlify URL to OAuth redirect URIs:
  - `https://your-site-name.netlify.app`
  - `https://your-site-name.netlify.app/auth/callback`

### 2. Update Supabase Settings
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your Netlify URL to Site URL
- Add redirect URLs

### 3. Update Stripe (if using webhooks)
- Go to Stripe Dashboard → Developers → Webhooks
- Add your Netlify domain

### 4. Test All Features
- [ ] Authentication (Google Sign-In)
- [ ] Stripe payments
- [ ] AI features (Gemini)
- [ ] Supabase database operations
- [ ] Camera/media uploads

---

## 🔄 Continuous Deployment

Once connected to Netlify:
- Every push to your main branch triggers automatic deployment
- Preview deployments for pull requests
- Instant rollback to previous versions

---

## 📊 Monitor Your Site

- **Netlify Dashboard**: View build logs, analytics, and performance
- **Custom Domain**: Add your own domain in Netlify settings
- **HTTPS**: Automatically enabled with free SSL certificate

---

## 🆘 Troubleshooting

### Build fails on Netlify:
- Check build logs in Netlify Dashboard
- Ensure Flutter version is compatible (3.6.0+)
- Verify all dependencies are in pubspec.yaml

### API calls fail:
- Verify environment variables are set in Netlify
- Check CORS settings in Supabase
- Ensure API keys are correct

### Camera not working:
- Web browsers require HTTPS for camera access
- Netlify provides HTTPS automatically

---

## 📧 Support

For issues with:
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Flutter Web**: [docs.flutter.dev/platform-integration/web](https://docs.flutter.dev/platform-integration/web)

---

## 🎉 Your App is Ready for the Web!

All your existing integrations (Supabase, Stripe, Gemini) will work seamlessly on the web version.
