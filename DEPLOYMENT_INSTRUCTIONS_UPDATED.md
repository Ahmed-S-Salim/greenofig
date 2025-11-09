# 🚀 UPDATED Deployment Instructions for Hostinger

## ⚠️ IMPORTANT - Dark Page Issue Resolved!

The **dark page issue** was caused by deploying an **old build** that didn't include the mobile menu fix.

**✅ NEW BUILD CREATED:** Oct 30, 2025 at 21:10
**✅ MOBILE MENU FIX INCLUDED:** Yes, fully functional
**✅ FILE SIZE:** HomePage-c8219e84.js (14.75 KB - larger than old version)
**✅ VERIFIED:** Production build tested and working

---

## 📁 Files to Upload (Fresh Build)

**Location on your computer:**
```
C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\dist
```

**Upload ALL files from the `dist` folder:**
- `index.html` (9.99 KB - Oct 30, 2025)
- `404.html`
- `assets/` folder (entire folder with all files)
- `favicon.png`
- `logo.png`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`

---

## Step-by-Step Deployment to Hostinger

### Step 1: Login to Hostinger
1. Go to: https://hpanel.hostinger.com
2. Enter your credentials
3. Select your greenofig.com hosting plan

### Step 2: Access File Manager
1. In hPanel, click **"File Manager"**
2. Navigate to the **`public_html`** folder
3. **DELETE ALL EXISTING FILES** in public_html
   - Select all files (Ctrl+A or Cmd+A)
   - Click Delete button
   - Confirm deletion

### Step 3: Upload New Build Files
1. Click the **"Upload"** button in File Manager toolbar
2. Navigate to your local `dist` folder:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\dist
   ```
3. **Select ALL files and folders** inside `dist`:
   - Hold Ctrl (Windows) or Cmd (Mac)
   - Click on each file to select all
   - OR press Ctrl+A to select all

4. Click **"Open"** or **"Upload"** to start uploading
5. **Wait for upload to complete** (may take 2-5 minutes)
6. Verify all files are uploaded:
   - You should see `index.html` in public_html
   - You should see an `assets` folder
   - You should see `logo.png`, `favicon.png`, etc.

### Step 4: Create .htaccess for React Routing
1. In File Manager (`public_html`), click **"New File"**
2. Name it: `.htaccess` (note the dot at the beginning!)
3. Click on the `.htaccess` file to edit it
4. Paste this content:

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

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

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
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"

  # Force no-cache for HTML files
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>
</IfModule>
```

5. **Save the file** (Ctrl+S or click Save button)

### Step 5: Verify SSL/HTTPS
1. In hPanel sidebar, go to **"SSL"**
2. Check if SSL certificate is installed
3. If not installed:
   - Click **"Install SSL"**
   - Select **"Free SSL"** (Let's Encrypt)
   - Wait 10-30 minutes for activation

### Step 6: Test Your Website

1. **Open your browser** and go to:
   - https://greenofig.com

2. **Clear your browser cache FIRST** (very important!):

   **Desktop Chrome/Edge:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Time range: "All time"
   - Click "Clear data"

   **Mobile Safari:**
   - Settings → Safari → "Clear History and Website Data"
   - OR use Private Browsing mode

   **Mobile Chrome:**
   - Menu → Settings → Privacy
   - "Clear browsing data"
   - Select "Cached images and files"

3. **After clearing cache**, reload: https://greenofig.com

4. **Test these features:**
   - ✅ Page loads (not dark/black)
   - ✅ Homepage displays correctly
   - ✅ Click the hamburger menu icon (☰) on mobile
   - ✅ Mobile menu slides in from right side
   - ✅ Navigation links work
   - ✅ Login/Signup buttons work
   - ✅ All pages navigate correctly

---

## 🐛 Troubleshooting

### Issue: Still seeing dark/black page
**Solutions:**
1. **Clear browser cache completely** (see instructions above)
2. **Try incognito/private mode**
3. **Force refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. **Check browser console for errors:**
   - Press F12
   - Look for red errors
   - Take a screenshot and check what's failing

### Issue: Mobile menu still shows error toast
**Solution:**
- This means you uploaded the OLD build
- Delete all files in public_html
- Re-upload from the dist folder (the new build from Oct 30)
- Make sure the dist folder shows recent modification dates

### Issue: 404 errors on page refresh
**Solution:**
- Check that `.htaccess` file exists in public_html
- Verify the content is correct (see Step 4)
- Make sure the filename starts with a dot: `.htaccess`

### Issue: HTTPS not working
**Solutions:**
1. Wait 10-30 minutes after installing SSL
2. Check SSL status in hPanel → SSL
3. If expired, renew the certificate

### Issue: Images not loading
**Solutions:**
1. Verify the `assets` folder was uploaded
2. Check browser console (F12) for 404 errors
3. Re-upload the assets folder

### Issue: Supabase/Login not working
**Solutions:**
1. Check browser console for API errors
2. Verify Supabase project is active: https://app.supabase.com
3. Check that environment variables are correct (they're built into the bundle)

---

## ✅ Deployment Checklist

Before you start:
- [ ] Read this entire guide
- [ ] Have Hostinger login credentials ready
- [ ] Confirm dist folder path on your computer

During deployment:
- [ ] Login to hPanel
- [ ] Open File Manager
- [ ] Delete old files from public_html
- [ ] Upload ALL files from dist folder
- [ ] Create .htaccess file
- [ ] Install SSL certificate (if needed)

After deployment:
- [ ] Clear browser cache
- [ ] Test https://greenofig.com
- [ ] Test mobile menu (hamburger icon)
- [ ] Navigate through all pages
- [ ] Test on mobile device
- [ ] Check login/signup works

---

## 📊 What Changed

### Old Build (Causing Dark Page):
- Created: Oct 28, 2025
- HomePage: HomePage-682e1640.js (12.8 KB)
- Mobile menu: NOT working (showed error toast)
- Issue: Deployed before mobile menu was fixed

### New Build (Fixed):
- Created: Oct 30, 2025 at 21:10
- HomePage: HomePage-c8219e84.js (14.75 KB)
- Mobile menu: ✅ FULLY WORKING with slide-in animation
- Mobile menu includes: All nav links, login/signup buttons
- Base URL: Updated to `/` for greenofig.com

---

## 🎯 Expected Result

After successful deployment, you should see:

1. **Homepage loads** with full content (not dark/empty)
2. **Mobile menu works:**
   - Tap hamburger icon (☰)
   - Menu slides in from right
   - Shows all navigation links
   - Shows login/signup buttons
   - Can close with X button or backdrop click
3. **All pages work** (Features, Pricing, Blog, etc.)
4. **HTTPS is active** (green padlock in browser)
5. **Fast loading** (optimized build)

---

## 💡 Tips

- **Always clear cache** when testing after deployment
- **Use incognito mode** for testing to avoid cache issues
- **Test on actual mobile device** not just browser dev tools
- **Check browser console** if something doesn't work (F12)
- **Contact Hostinger support** if you have server issues

---

## 🆘 Still Having Issues?

If the deployment still shows problems:

1. **Take screenshots** of what you're seeing
2. **Check browser console** (F12) for errors
3. **Verify file upload:**
   - Login to File Manager
   - Check that index.html exists in public_html
   - Check that assets folder exists with files
   - Check file dates (should be Oct 30, 2025)

4. **Contact Hostinger Support:**
   - Through hPanel chat support
   - Provide them with error details
   - Ask them to check .htaccess and file permissions

---

## 🎉 Success!

Once deployed successfully:
- Your website will be live at https://greenofig.com
- Mobile users can use the menu properly
- All features will work as expected
- SSL will keep your site secure

**Good luck with your deployment! 🚀**

---

**Estimated deployment time:** 15-20 minutes
**Difficulty:** Easy (just follow the steps)
**Technical requirements:** None (just access to Hostinger)
