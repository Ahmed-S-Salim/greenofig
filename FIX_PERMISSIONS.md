# 🔧 FIX 403 - Files are Correct, Check Permissions

## Your Files are PERFECT! ✅

You have all the right files in public_html:
- index.html ✅
- assets/ ✅
- .htaccess ✅
- All other files ✅

Since test.html works but index.html gives 403, this is likely a **permissions** or **.htaccess** issue.

---

## FIX 1: Check index.html Permissions (Most Likely)

### In Hostinger File Manager:

1. **Right-click** on `index.html`
2. Click **Permissions** or **Change Permissions**
3. Set to **644**:
   - ✅ Owner: Read + Write
   - ✅ Group: Read
   - ✅ Public: Read
4. Click **Save** or **Apply**

**In number format:**
- Enter: `644`

---

## FIX 2: Check assets Folder Permissions

1. **Right-click** on `assets` folder
2. Click **Permissions**
3. Set to **755**:
   - ✅ Owner: Read + Write + Execute
   - ✅ Group: Read + Execute
   - ✅ Public: Read + Execute
4. **Check** "Apply to all files/folders inside" if available
5. Click **Save**

---

## FIX 3: Check .htaccess Content

The .htaccess might be blocking access. Let's verify it:

1. Click on `.htaccess` to edit it
2. **Replace ALL content** with this:

```apache
# Enable directory indexes
DirectoryIndex index.html index.php

# React Router - Redirect all requests to index.html
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>

# MIME Types
AddType application/javascript .js
AddType text/javascript .js
AddType text/html .html

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

  # Force no-cache for HTML
  <FilesMatch "\.(html)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>
</IfModule>
```

3. **Save** the file
4. Set .htaccess permissions to **644**

---

## FIX 4: Delete .nojekyll (Not Needed on Hostinger)

1. Select `.nojekyll`
2. Click **Delete**
3. Confirm

(This file is for GitHub Pages, not needed on Hostinger)

---

## FIX 5: Try Renaming index.html (Test)

If permissions look correct, try this test:

1. **Rename** `index.html` to `home.html`
2. Visit: **greenofig.com/home.html**
3. **If this works:** The issue is with directory index settings
4. **If this gives 403:** Permissions are wrong

If home.html works:
1. Rename it back to `index.html`
2. Check .htaccess has `DirectoryIndex index.html`

---

## Test After Each Fix

After each change:
1. **Clear browser cache** (Ctrl + Shift + Delete)
2. Visit: **https://greenofig.com**
3. Check if it works

---

## Expected Permissions Summary

| File/Folder | Permission | Number |
|-------------|------------|--------|
| index.html | rw-r--r-- | 644 |
| .htaccess | rw-r--r-- | 644 |
| 404.html | rw-r--r-- | 644 |
| assets/ | rwxr-xr-x | 755 |
| favicon.png | rw-r--r-- | 644 |
| logo.png | rw-r--r-- | 644 |
| All files | rw-r--r-- | 644 |
| All folders | rwxr-xr-x | 755 |

---

## Still 403? Contact Hostinger Support

If none of these work:

1. **Hostinger Support** can check server-side permissions
2. Click **Support** in hPanel
3. Say: "My index.html gives 403 but test.html works. Files and permissions are correct. Need help."

They can check:
- Server configuration
- PHP settings
- mod_rewrite status
- Directory listing permissions

---

## Most Likely Fix

**90% of the time**, it's the index.html permissions. Make sure it's **644**!
