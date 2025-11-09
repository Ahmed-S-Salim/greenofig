# Hostinger Deployment Guide for GreenoFig

## Overview
This guide will help you deploy your GreenoFig website to Hostinger hosting with the greenofig.com domain.

## Prerequisites
- Hostinger hosting account with greenofig.com domain
- Production build files (already generated in the `dist` folder)
- FTP or File Manager access to your Hostinger account

---

## Step 1: Access Your Hostinger Control Panel

1. Go to https://hpanel.hostinger.com
2. Log in with your Hostinger credentials
3. Select your greenofig.com hosting plan

---

## Step 2: Prepare Your Environment Variables

Before uploading, you need to ensure your production environment variables are set correctly.

### Important: Environment Variables in Vite

Since Vite bundles environment variables at build time, they are already included in your build. However, for future builds in production, note these important variables:

**Current Environment Variables (from .env.local):**
```
VITE_SUPABASE_URL=https://xdzoikocriuvgkoenjqk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_RESEND_API_KEY=re_XUA7ZwcE_7yo6KdRqeUpmBPLzNRqBpBnt
VITE_FROM_EMAIL=support@greenofig.com
VITE_GEMINI_API_KEY=AIzaSyBUH3HZjwbIzMqrk-RfxqqK5iU9TRiRrw0
```

> **Security Note:** These are already compiled into your build files. Make sure to keep your .env.local file secure and never commit it to version control.

---

## Step 3: Upload Files to Hostinger

### Option A: Using File Manager (Recommended for Beginners)

1. In Hostinger hPanel, click on **File Manager**
2. Navigate to the `public_html` folder (this is your website's root directory)
3. **DELETE all existing files** in public_html (if this is a fresh install)
4. Click **Upload** button in the top toolbar
5. Navigate to your local `dist` folder:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\dist
   ```
6. Select ALL files and folders inside the `dist` directory:
   - `index.html`
   - `404.html`
   - `assets` folder
   - `favicon.png`
   - `logo.png`
   - `robots.txt`
   - `sitemap.xml`
   - `llms.txt`
   - `cache-test.html`
7. Upload all files
8. Wait for the upload to complete

### Option B: Using FTP (Advanced Users)

1. In Hostinger hPanel, go to **Files** → **FTP Accounts**
2. Note your FTP credentials:
   - **FTP Host:** Usually `ftp.greenofig.com` or similar
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** 21 (or 22 for SFTP)

3. Use an FTP client like FileZilla:
   - Download FileZilla: https://filezilla-project.org/
   - Connect using your FTP credentials
   - Navigate to `/public_html/` on the server
   - Upload all contents from your local `dist` folder to `public_html`

---

## Step 4: Configure Domain Settings

1. In Hostinger hPanel, go to **Domains**
2. Click on **greenofig.com**
3. Verify that it points to your hosting account
4. Ensure **HTTPS/SSL is enabled**:
   - Go to **SSL** in hPanel
   - If not installed, install a free SSL certificate
   - This usually takes 10-30 minutes to activate

---

## Step 5: Set Up .htaccess for Single Page Application (SPA)

Since GreenoFig is a React SPA, you need to configure proper routing.

1. In File Manager, navigate to `public_html`
2. Create a new file named `.htaccess` (note the dot at the beginning)
3. Add the following content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l

  # Rewrite everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

4. Save the file

---

## Step 6: Verify Your Deployment

1. Open your browser and navigate to:
   - https://greenofig.com
   - https://www.greenofig.com (make sure both work)

2. Test the following:
   - ✅ Homepage loads correctly
   - ✅ Mobile menu works (hamburger icon opens menu)
   - ✅ Navigation between pages works
   - ✅ Login/Signup functionality works
   - ✅ All images load correctly
   - ✅ HTTPS is working (green padlock in browser)

3. Test on mobile devices:
   - Open on your phone's browser
   - Test the mobile menu (hamburger icon)
   - Navigate through different pages

---

## Step 7: Clear Browser Cache

If you see old content or the mobile menu still doesn't work:

**On Desktop (Chrome/Edge):**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Choose "All time"
4. Click "Clear data"

**On Mobile Safari (iPhone):**
1. Settings → Safari
2. "Clear History and Website Data"
3. OR use Private Browsing mode

**On Mobile Chrome (Android):**
1. Chrome Menu → Settings → Privacy
2. "Clear browsing data"
3. Select "Cached images and files"

---

## Troubleshooting

### Issue: 404 errors on page refresh
**Solution:** Make sure the `.htaccess` file is properly configured (Step 5)

### Issue: Mobile menu still showing error
**Solution:**
1. Clear browser cache completely
2. Try opening in private/incognito mode
3. The fix has been applied to HomePage.jsx - make sure you uploaded the latest build

### Issue: HTTPS not working
**Solution:**
1. Wait 10-30 minutes for SSL to activate
2. In hPanel, go to SSL and verify certificate is installed
3. Force HTTPS by adding this to .htaccess:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Issue: Images not loading
**Solution:** Check that all files in the `assets` folder were uploaded correctly

### Issue: Supabase/API not working
**Solution:**
1. Verify environment variables were included in build
2. Check browser console for errors
3. Verify Supabase project is active at https://app.supabase.com

---

## Future Updates

When you need to update your website:

1. Make changes to your code locally
2. Run `npm run build` to create a new production build
3. Upload the contents of the new `dist` folder to `public_html`
4. Clear your browser cache

---

## Important Notes

1. **Never commit sensitive files:** Keep `.env.local` out of version control
2. **Regular backups:** Hostinger usually provides automatic backups, but verify this
3. **SSL Certificate:** Renews automatically with Let's Encrypt
4. **Database:** Your Supabase database is hosted separately and will continue working

---

## Support

If you encounter issues:
1. Check Hostinger knowledge base: https://support.hostinger.com
2. Contact Hostinger support through hPanel
3. Check browser console (F12) for JavaScript errors
4. Verify all files uploaded correctly in File Manager

---

## Summary

✅ Mobile menu fix applied to HomePage.jsx
✅ Production build created in `dist` folder
✅ Vite config updated with base path `/` for root domain
✅ All files ready for upload to public_html
✅ .htaccess configuration for SPA routing
✅ SSL/HTTPS setup instructions
✅ Environment variables already bundled in build

**Your website is ready to deploy!**
