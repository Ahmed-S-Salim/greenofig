# 🚀 Deploy to Hostinger NOW - Quick Guide

## Your Hostinger Details

**SSH Connection:**
```
Host: 157.173.209.161
Port: 65002
Username: u492735793
Password: Ahmed93@93
```

---

## ⚡ Quick Deploy (3 Methods)

### **Method 1: Using Git Bash (Recommended)** ⭐

1. **Open Git Bash** in your project folder:
   - Right-click in: `C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite`
   - Select "Git Bash Here"

2. **Test SSH connection:**
   ```bash
   ssh -p 65002 u492735793@157.173.209.161
   ```
   - Enter password: `Ahmed93@93`
   - Type `exit` to disconnect

3. **Create backup on server:**
   ```bash
   ssh -p 65002 u492735793@157.173.209.161 "cd public_html && tar -czf ../backup-$(date +%Y%m%d).tar.gz . 2>/dev/null || true"
   ```

4. **Deploy files using rsync:**
   ```bash
   rsync -avz --delete -e "ssh -p 65002" dist/ u492735793@157.173.209.161:~/public_html/
   ```
   - Enter password when prompted
   - Wait for upload to complete

5. **Set permissions:**
   ```bash
   ssh -p 65002 u492735793@157.173.209.161 "cd public_html && find . -type f -exec chmod 644 {} \; && find . -type d -exec chmod 755 {} \;"
   ```

6. **Done!** Visit: https://greenofig.com

---

### **Method 2: Using FileZilla** (Easy, GUI-based)

1. **Download FileZilla:** https://filezilla-project.org/

2. **Connect:**
   - Host: `sftp://157.173.209.161`
   - Username: `u492735793`
   - Password: `Ahmed93@93`
   - Port: `65002`
   - Click "Quickconnect"

3. **Navigate:**
   - Remote site (right side): Go to `public_html` folder
   - Local site (left side): Go to `dist` folder

4. **Upload:**
   - Select all files in `dist` (left side)
   - Drag to `public_html` (right side)
   - Confirm overwrite if asked
   - Wait for upload

5. **Set permissions** (important!)
   - Right-click on `public_html`
   - Select "File permissions"
   - Set: `755` for folders, `644` for files
   - Check "Recurse into subdirectories"
   - Click OK

6. **Done!** Visit: https://greenofig.com

---

### **Method 3: Using WinSCP** (Alternative GUI)

1. **Download WinSCP:** https://winscp.net/

2. **New Session:**
   - File protocol: `SFTP`
   - Host name: `157.173.209.161`
   - Port: `65002`
   - Username: `u492735793`
   - Password: `Ahmed93@93`
   - Click "Login"

3. **Navigate to public_html** on the right side

4. **Upload:**
   - Drag all files from `dist` folder (local, left side)
   - Drop into `public_html` folder (remote, right side)
   - Confirm synchronize/overwrite

5. **Set permissions:**
   - Select all files in `public_html`
   - Right-click → Properties
   - Set to `0644` for files, `0755` for folders

6. **Done!** Visit: https://greenofig.com

---

## 🧪 After Deployment - Testing

1. **Visit:** https://greenofig.com
2. **Hard refresh:** Press `Ctrl + Shift + R` (important!)
3. **Check console:** Press `F12` → Console tab (should be no errors)
4. **Test survey:** https://greenofig.com/survey
5. **Verify:** All 9 questions appear and plan recommendation works

---

## ❌ If You See a Blank Page

**Don't panic!** This is usually a cache issue.

### Quick Fixes:

**1. Clear Browser Cache:**
```
Ctrl + Shift + Delete
Select: "All time"
Check: Cached images, Cookies
Clear data
Close and restart browser
```

**2. Try Incognito:**
```
Ctrl + Shift + N
Visit https://greenofig.com
```

**3. Check Console:**
```
Press F12
Go to Console tab
Look for errors
```

**If you see CSP errors:**
- Make sure `.htaccess` file was uploaded
- Check that `.htaccess` is in the root of `public_html`
- View hidden files in FileZilla/WinSCP to see it

**4. Verify .htaccess uploaded:**

Using Git Bash:
```bash
ssh -p 65002 u492735793@157.173.209.161 "cat public_html/.htaccess | head -5"
```

You should see:
```
# Content Security Policy - MUST BE AT THE TOP
```

If not, the .htaccess didn't upload. Upload it manually.

---

## 📁 What Files to Upload

From your `dist` folder, upload:

```
dist/
├── .htaccess          ← IMPORTANT! (might be hidden)
├── index.html
├── favicon.png
├── logo.png
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── *.js files
│   ├── *.css files
│   └── *.png files
```

**Total size:** ~4-5 MB
**Files count:** ~50-60 files

---

## 🔐 Security Note

**IMPORTANT:** After deployment, change your SSH password for security:

1. Go to hPanel → Advanced → SSH Access
2. Click "Change Password"
3. Use a new strong password
4. Never share passwords in public places

---

## ✅ Deployment Checklist

**Before:**
- [x] Built project (`npm run build`)
- [x] `dist` folder exists with all files
- [x] `.htaccess` file has CSP headers

**During:**
- [ ] Connected to Hostinger successfully
- [ ] Navigated to `public_html` folder
- [ ] Uploaded all files from `dist`
- [ ] Set permissions (644 for files, 755 for folders)
- [ ] Verified `.htaccess` uploaded

**After:**
- [ ] Visited https://greenofig.com
- [ ] Hard refreshed (Ctrl+Shift+R)
- [ ] No console errors (F12)
- [ ] Survey page works
- [ ] Mobile menu animates smoothly
- [ ] All 9 survey questions appear
- [ ] Plan recommendation redirects correctly

---

## 🎉 Success!

Your site should now be live with:
- ✅ Fixed blank page issue (.htaccess with CSP)
- ✅ 9-question survey with smart recommendations
- ✅ Smooth mobile menu animations
- ✅ All security vulnerabilities patched

**Live URL:** https://greenofig.com/survey

---

## 🆘 Need Help?

If something doesn't work:

1. Check browser console (F12) for error messages
2. Verify `.htaccess` was uploaded (it's hidden by default)
3. Clear browser cache completely
4. Try different browser or incognito mode
5. Double-check file permissions (644/755)

---

**Ready to deploy? Choose one of the 3 methods above!** 🚀

**Recommended:** Start with Method 2 (FileZilla) - it's the easiest to see what's happening.
