# Quick Deployment Checklist for Hostinger

## ✅ Pre-Deployment (Already Done)
- [x] Fixed mobile menu on HomePage
- [x] Updated vite.config.js base path to `/`
- [x] Updated package.json homepage to `https://greenofig.com`
- [x] Created production build in `dist` folder

---

## 📋 Your Deployment Steps

### Step 1: Login to Hostinger
1. Go to https://hpanel.hostinger.com
2. Login with your credentials
3. Select greenofig.com hosting

### Step 2: Access File Manager
1. Click **File Manager** in hPanel
2. Navigate to `public_html` folder
3. Delete all existing files (if any)

### Step 3: Upload Your Files
1. Click **Upload** button
2. Navigate to: `C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\dist`
3. Select ALL files and folders inside `dist`:
   - `index.html`
   - `404.html`
   - `assets` folder
   - `favicon.png`
   - `logo.png`
   - `robots.txt`
   - `sitemap.xml`
   - `llms.txt`
   - `cache-test.html`
4. Upload and wait for completion

### Step 4: Create .htaccess File
1. In File Manager (public_html), click **New File**
2. Name it: `.htaccess` (with the dot!)
3. Paste this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

4. Save the file

### Step 5: Enable SSL/HTTPS
1. In hPanel, go to **SSL**
2. Install free SSL certificate if not already installed
3. Wait 10-30 minutes for activation

### Step 6: Test Your Website
1. Visit: https://greenofig.com
2. Test mobile menu (hamburger icon)
3. Navigate through pages
4. Test on mobile device
5. If you see old content, clear browser cache

---

## ⚠️ Important Note

**I cannot directly access your Hostinger account** - you'll need to follow these steps manually. However, everything is ready for deployment:

- ✅ All files are in the `dist` folder
- ✅ Mobile menu is fixed
- ✅ Configuration is set for greenofig.com
- ✅ Detailed guide available in HOSTINGER_DEPLOYMENT_GUIDE.md

---

## 🆘 Need Help?

If something doesn't work:
1. Read HOSTINGER_DEPLOYMENT_GUIDE.md for detailed troubleshooting
2. Contact Hostinger support through hPanel
3. Clear browser cache and try again

---

**Time to deploy: ~15-20 minutes**
**Good luck! 🚀**
