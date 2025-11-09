# 🔧 Hostinger Dark Page - COMPLETE FIX GUIDE

## Why You See a Black/Dark Page

The GreenoFig website has a **dark theme** by design. When you see a completely black page, it means:
- ✅ Files uploaded successfully
- ✅ HTML is loading
- ❌ **React app is NOT mounting/starting**
- ❌ JavaScript files might not be loading

Since there are **NO console errors**, this usually means files are in the wrong location or paths are incorrect.

---

## 🎯 SOLUTION: Fresh Upload with Correct Structure

### Step 1: Login to Hostinger

1. Go to https://hpanel.hostinger.com
2. Login with your credentials
3. Click on your **greenofig.com** hosting

---

### Step 2: Clear Everything in public_html

**IMPORTANT:** Delete ALL old files first!

1. Click **File Manager**
2. Navigate to `public_html` folder
3. **Select ALL files** (checkboxes or Ctrl+A)
4. Click **Delete** button
5. **Confirm deletion**
6. Verify `public_html` is now EMPTY

---

### Step 3: Upload Test File First (Diagnostic)

Before uploading the full site, let's test if Hostinger is working:

1. I created a `test.html` file for you
2. In File Manager, click **Upload**
3. Navigate to:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite
   ```
4. Upload the `test.html` file to `public_html`
5. Visit: **https://greenofig.com/test.html**

**What should happen:**
- ✅ You see a **white page** with green text "✅ Hostinger is Working!"
- ✅ Colors and styling are visible
- ✅ JavaScript adds a message at the bottom

**If test.html works**, Hostinger is fine and the issue is with the React build.

---

### Step 4: Upload the Correct Files

Now upload the React app:

1. In File Manager (`public_html`), click **Upload**
2. Navigate to your `dist` folder:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\dist
   ```

3. **IMPORTANT:** Upload files in this order:

   **First, upload these files:**
   - `index.html`
   - `404.html`
   - `favicon.png`
   - `logo.png`
   - `robots.txt`
   - `sitemap.xml`

   **Then upload the assets folder:**
   - Select the `assets` **FOLDER** (not the files inside)
   - Upload the entire folder
   - Wait for all files to upload (may take 2-5 minutes)

4. **Verify the structure** in public_html:
   ```
   public_html/
   ├── index.html
   ├── 404.html
   ├── favicon.png
   ├── logo.png
   ├── robots.txt
   ├── sitemap.xml
   └── assets/
       ├── index-decb2b81.js
       ├── vendor-react-c35372bd.js
       ├── index-4937ec1e.css
       └── (many other files)
   ```

---

### Step 5: Create .htaccess File

1. In File Manager (`public_html`), click **New File**
2. Name it EXACTLY: `.htaccess` (note the dot!)
3. Click to edit the file
4. Paste this content:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React Router - Redirect all requests to index.html
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

# MIME Types for JavaScript modules
AddType application/javascript .js
AddType text/javascript .js

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"

  # Force no-cache for HTML
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>
</IfModule>
```

5. **Save** the file (Ctrl+S or Save button)

---

### Step 6: Verify SSL/HTTPS

1. In hPanel, go to **SSL** (left sidebar)
2. Check if SSL certificate is active for greenofig.com
3. If not active:
   - Click **Install SSL**
   - Select **Free SSL** (Let's Encrypt)
   - Wait 10-30 minutes

---

### Step 7: Test Your Website

1. **IMPORTANT:** Clear browser cache FIRST!

   **Chrome/Edge (Desktop):**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Time range: "All time"
   - Click "Clear data"

   **Or use Incognito Mode:**
   - Press `Ctrl + Shift + N`
   - Visit greenofig.com in incognito

2. Visit: **https://greenofig.com**

3. **What you should see:**
   - Homepage loads with content
   - NOT a black page
   - Images visible
   - Can navigate

---

## 🐛 Troubleshooting

### Problem: Still seeing black/dark page

**Check 1: View Page Source**
1. On the black page, press `Ctrl + U` (View Source)
2. Scroll down to line ~129
3. Look for: `<script type="module" crossorigin src="/assets/index-decb2b81.js"></script>`
4. Click that link
5. **If you get 404 error:** Files are in wrong location

**Check 2: Browser Console**
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for errors (red text)
4. Take a screenshot and share

**Check 3: Network Tab**
1. Press `F12`
2. Go to **Network** tab
3. Refresh the page (`Ctrl + R`)
4. Look for red failed requests
5. Check if `/assets/index-decb2b81.js` loads (should show 200 status)

**Check 4: File Structure**
1. Go back to File Manager
2. Verify `assets` folder exists in `public_html`
3. Click into `assets` folder
4. You should see MANY files (50+ JavaScript and CSS files)

**Fix:**
- If assets folder is missing: Re-upload it
- If files show 404: Delete everything and re-upload
- If .htaccess is missing: Create it (Step 5)

---

### Problem: Page loads but looks broken (unstyled)

**Cause:** CSS file not loading

**Fix:**
1. Check if `assets/index-4937ec1e.css` exists
2. View source, look for: `<link rel="stylesheet" href="/assets/index-4937ec1e.css">`
3. Click the CSS link - should load, not 404
4. If 404, re-upload the assets folder

---

### Problem: 404 error when clicking links

**Cause:** .htaccess missing or incorrect

**Fix:**
1. Verify `.htaccess` exists in public_html
2. Check the content matches Step 5
3. Make sure filename starts with a dot: `.htaccess`

---

### Problem: HTTPS not working (insecure warning)

**Cause:** SSL not installed

**Fix:**
1. Go to hPanel → SSL
2. Install free SSL certificate
3. Wait 10-30 minutes
4. Refresh your site

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] test.html works (shows green text)
- [ ] https://greenofig.com loads (not dark/black)
- [ ] Homepage shows content and images
- [ ] Can click "Features" and see features page
- [ ] Can click "Pricing" and see pricing page
- [ ] Mobile menu works (if on mobile)
- [ ] HTTPS padlock shows in browser
- [ ] No console errors (F12)

---

## 📁 File Structure Reference

**Your computer (source):**
```
C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\
└── dist/                  ← Upload files from HERE
    ├── index.html
    ├── 404.html
    ├── assets/
    │   ├── index-decb2b81.js
    │   ├── vendor-react-c35372bd.js
    │   ├── index-4937ec1e.css
    │   └── ... (50+ more files)
    ├── favicon.png
    ├── logo.png
    ├── robots.txt
    └── sitemap.xml
```

**Hostinger (destination):**
```
public_html/               ← Upload files TO here
├── .htaccess              ← CREATE this manually
├── test.html              ← Upload for testing
├── index.html             ← From dist/
├── 404.html               ← From dist/
├── assets/                ← From dist/assets/ (entire folder)
│   ├── index-decb2b81.js
│   ├── vendor-react-c35372bd.js
│   ├── index-4937ec1e.css
│   └── ... (50+ more files)
├── favicon.png            ← From dist/
├── logo.png               ← From dist/
├── robots.txt             ← From dist/
└── sitemap.xml            ← From dist/
```

---

## 🆘 Still Having Issues?

If you still see a black page after following ALL steps:

1. **Take screenshots of:**
   - The black page
   - Browser console (F12 → Console tab)
   - Network tab showing failed requests
   - File Manager showing public_html contents

2. **Check that:**
   - You uploaded from the `dist` folder (not the root project folder)
   - The `assets` folder has files in it (not empty)
   - The .htaccess file exists

3. **Try this:**
   - Delete everything in public_html
   - Upload ONLY `test.html` first
   - If test.html works, the issue is with the React build
   - If test.html doesn't work, contact Hostinger support

4. **Contact Hostinger Support:**
   - Through hPanel live chat
   - Tell them: "React app shows black page, need help with file permissions and .htaccess"

---

**Expected result after fix:** Full website loading at https://greenofig.com with all features working! 🎉
