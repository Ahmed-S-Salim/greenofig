# 🔧 FIX 403 FORBIDDEN ERROR

## Good News! ✅

Your test.html works perfectly! This means:
- ✅ Hostinger is working
- ✅ Domain is connected
- ✅ Files can be served

## The Problem

**403 Forbidden** = Server can't find `index.html` in public_html

This usually means **index.html is missing or in wrong location**.

---

## QUICK FIX - Check File Location

### Step 1: Check What's in public_html

1. In **File Manager**, make sure you're in `public_html`
2. Look at the files listed

**What you SHOULD see:**
```
public_html/
├── test.html (you have this - it works!)
├── index.html ← YOU NEED THIS!
├── 404.html
├── assets/ (folder)
├── favicon.png
├── logo.png
├── robots.txt
└── sitemap.xml
```

**What you might have (WRONG):**
```
public_html/
├── test.html
└── dist/ (folder)  ← FILES ARE INSIDE HERE!
    ├── index.html
    ├── assets/
    └── ...
```

---

## Fix Option 1: If Files are in a Subfolder

**If you see a `dist` folder or any other subfolder with the files:**

1. **Open the dist folder** (or whatever folder has index.html)
2. **Select ALL files inside** (Ctrl+A)
3. **Cut** or **Copy** them
4. Go back to `public_html`
5. **Paste** the files directly in public_html
6. **Delete** the now-empty dist folder

---

## Fix Option 2: If index.html is Missing

**If you don't see index.html at all:**

1. Click **Upload** in File Manager
2. Navigate to your computer:
   ```
   C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite\dist
   ```
3. **Important:** Upload files FROM INSIDE the dist folder, not the dist folder itself!
4. Select these files:
   - `index.html`
   - `404.html`
   - `favicon.png`
   - `logo.png`
   - `robots.txt`
   - `sitemap.xml`
5. **Also select the `assets` FOLDER**
6. Click **Upload**
7. Wait for upload to complete

---

## Fix Option 3: Check File Permissions

**If index.html exists in public_html but still shows 403:**

1. Right-click on `index.html`
2. Select **Change Permissions** or **Permissions**
3. Set permissions to **644**:
   - Owner: Read + Write (6)
   - Group: Read (4)
   - Public: Read (4)
4. Click **Save**

**Also check assets folder:**
1. Right-click on `assets` folder
2. Set to **755**:
   - Owner: Read + Write + Execute (7)
   - Group: Read + Execute (5)
   - Public: Read + Execute (5)
3. Apply to all files inside (if option available)

---

## After Fixing, You Should Have:

**In public_html (root level):**
```
public_html/
├── .htaccess (create this - see main guide)
├── test.html ✅
├── index.html ← MUST BE HERE!
├── 404.html
├── assets/
│   ├── index-decb2b81.js
│   ├── vendor-react-c35372bd.js
│   ├── index-4937ec1e.css
│   └── (50+ more files)
├── favicon.png
├── logo.png
├── robots.txt
└── sitemap.xml
```

---

## Test Again

1. Visit: **https://greenofig.com**
2. Should now show your website!
3. If still 403:
   - Take a screenshot of File Manager showing public_html contents
   - Check permissions on index.html

---

## Common Mistakes

❌ **WRONG:** Uploaded the entire `dist` folder
```
public_html/
└── dist/
    └── index.html (too deep!)
```

✅ **CORRECT:** Uploaded FILES from inside dist
```
public_html/
├── index.html (at root level!)
└── assets/
```

---

## Quick Checklist

After upload, verify:
- [ ] index.html is directly in public_html (not in a subfolder)
- [ ] assets folder is directly in public_html
- [ ] test.html works: greenofig.com/test.html ✅
- [ ] Main site works: greenofig.com

---

## If Still Getting 403

Try this:
1. Delete ALL files in public_html (except test.html for now)
2. In File Manager, click **Upload**
3. On your computer, **OPEN** the dist folder
4. **Inside** the dist folder, select ALL files (Ctrl+A)
5. Drag and drop OR click Upload
6. Make sure files go to public_html ROOT, not into a subfolder

The key is: **index.html must be at the same level as test.html**

If test.html works at greenofig.com/test.html, then index.html should work at greenofig.com when placed in the same location!

---

**Need help?** Take a screenshot of your File Manager showing public_html contents and we can diagnose from there!
