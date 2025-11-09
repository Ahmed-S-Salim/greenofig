# 🚀 Deploy to Hostinger - Complete Guide

## ✅ Prerequisites

Before deploying, make sure you have:

1. ✓ SSH access to your Hostinger account
2. ✓ Your SSH credentials (username, host, password/key)
3. ✓ Git Bash or WSL installed on Windows (for the deploy script)

---

## 📋 Step 1: Get Your SSH Credentials

### Find Your SSH Details in Hostinger:

1. Log into **hPanel** (Hostinger control panel)
2. Go to **Advanced** → **SSH Access**
3. Note down:
   - **SSH Username**: (e.g., `u123456789`)
   - **SSH Host**: (e.g., `srv123.main-hosting.eu`)
   - **SSH Port**: Usually `22`
   - **Password**: Your hosting password or create SSH key

---

## 🔧 Step 2: Configure the Deployment Script

Edit `deploy.sh` and update these lines:

```bash
SSH_USER="your-ssh-username"           # Replace with your username
SSH_HOST="your-server.hostinger.com"   # Replace with your server
SSH_PORT="22"                          # Usually 22
REMOTE_PATH="~/public_html"            # Usually public_html
```

### Example:
```bash
SSH_USER="u123456789"
SSH_HOST="srv123.main-hosting.eu"
SSH_PORT="22"
REMOTE_PATH="~/public_html"
```

---

## 🚀 Step 3: Deploy

### Option A: Automated Deployment (Recommended)

**Using Git Bash on Windows:**

1. Open **Git Bash** in your project folder
2. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. Enter your SSH password when prompted
4. Wait for deployment to complete

**Using WSL on Windows:**

1. Open **WSL** terminal
2. Navigate to project:
   ```bash
   cd "/mnt/c/Users/ADMIN/OneDrive/Desktop/GreeonFig Rocet code/greenofigwebsite"
   ```
3. Run:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option B: Manual Deployment (If script doesn't work)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Upload via FTP/SFTP:**
   - Use **FileZilla** or **WinSCP**
   - Connect to your Hostinger server
   - Upload all files from `dist/` folder to `public_html/`
   - **Important**: Delete old files first, then upload new ones

3. **Set permissions via SSH:**
   ```bash
   ssh u123456789@srv123.main-hosting.eu
   cd public_html
   find . -type f -exec chmod 644 {} \;
   find . -type d -exec chmod 755 {} \;
   ```

---

## 🧪 Step 4: Test Your Deployment

1. **Visit your site**: https://greenofig.com
2. **Hard refresh**: Press `Ctrl + Shift + R`
3. **Test the survey**: https://greenofig.com/survey
4. **Check console**: Press `F12` → Console tab (should have no errors)

---

## ❌ Troubleshooting Blank Page

If you see a **blank page** after deployment:

### 1. Check Browser Console (Most Important!)

Press `F12` → Go to **Console** tab. Look for errors:

**If you see CSP errors:**
```
Refused to execute inline script because it violates Content Security Policy
```

**Solution:**
- SSH into your server
- Check if `.htaccess` was uploaded correctly:
  ```bash
  ssh u123456789@srv123.main-hosting.eu
  cd public_html
  cat .htaccess
  ```
- The first line should say: `# Content Security Policy - MUST BE AT THE TOP`
- If `.htaccess` is missing or wrong, upload it manually

### 2. Clear Cache Completely

**Method 1: Hard Refresh**
- Press `Ctrl + Shift + R` (Windows)
- Press `Cmd + Shift + R` (Mac)

**Method 2: Clear All Cache**
1. Press `Ctrl + Shift + Delete`
2. Select:
   - ✓ Cached images and files
   - ✓ Cookies and site data
3. Time range: **All time**
4. Click **Clear data**
5. **Close and restart browser**

**Method 3: Incognito Mode**
- Press `Ctrl + Shift + N`
- Visit https://greenofig.com
- If it works here, it's a cache issue

### 3. Check File Permissions

SSH into server and fix permissions:
```bash
ssh u123456789@srv123.main-hosting.eu
cd public_html
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### 4. Verify Files Uploaded

Check if all files are present:
```bash
ssh u123456789@srv123.main-hosting.eu
cd public_html
ls -la
ls -la assets/
```

You should see:
- `index.html`
- `.htaccess`
- `assets/` folder with many .js and .css files
- `logo.png`

### 5. Check .htaccess is Working

Create a test file: `test.txt` in `public_html` with content: `Hello`

Visit: https://greenofig.com/test.txt

- ✓ If you see "Hello" = Server is working
- ✗ If 404 or error = Server issue, contact Hostinger

---

## 🔐 CSP Issues (Content Security Policy)

If you still get CSP errors after uploading `.htaccess`:

### Hostinger might be blocking CSP headers

**Contact Hostinger Support:**

```
Hi,

I'm deploying a React application on greenofig.com.

The Content Security Policy headers are blocking JavaScript execution,
even though I've added proper CSP headers in my .htaccess file.

Can you please allow 'unsafe-eval' in the CSP for my domain,
or disable server-level CSP so my .htaccess can control it?

The CSP I need:
script-src 'self' 'unsafe-inline' 'unsafe-eval'

Thank you!
```

**How to contact:**
1. Go to hPanel
2. Click **Support** or **Live Chat**
3. Send the message above
4. They usually fix it within 10-30 minutes

---

## 📊 Deployment Checklist

Before deploying, verify:

- [ ] `npm run build` runs without errors
- [ ] `dist/` folder contains `index.html`
- [ ] `dist/.htaccess` exists and has CSP headers
- [ ] SSH credentials are correct in `deploy.sh`
- [ ] You have SSH access to Hostinger

After deploying, verify:

- [ ] Site loads at https://greenofig.com
- [ ] No console errors (F12)
- [ ] Survey page works: https://greenofig.com/survey
- [ ] All 9 survey questions appear
- [ ] Redirects to pricing with plan recommendation
- [ ] Mobile menu slides smoothly

---

## 🔄 Future Deployments

After the first deployment, future updates are easy:

1. Make your code changes
2. Run: `./deploy.sh`
3. Hard refresh the site

The script automatically:
- ✓ Builds your project
- ✓ Creates a backup on the server
- ✓ Uploads new files
- ✓ Sets proper permissions

---

## 💾 Rollback (If Something Goes Wrong)

If the new deployment breaks, you can restore from backup:

```bash
ssh u123456789@srv123.main-hosting.eu
cd ~
ls backups/  # List all backups
cd public_html
rm -rf *  # Clear current files
tar -xzf ../backups/backup-YYYYMMDD-HHMMSS.tar.gz  # Restore backup
```

---

## 🎯 Quick Deploy Command

Once configured, deploying is one command:

```bash
./deploy.sh
```

That's it! 🎉

---

## 🆘 Need Help?

If deployment fails:

1. **Check the error message** in terminal
2. **Verify SSH credentials** are correct
3. **Test SSH connection** manually:
   ```bash
   ssh -p 22 u123456789@srv123.main-hosting.eu
   ```
4. **Contact Hostinger support** if server issues
5. **Check browser console** (F12) if blank page

---

**Your site will be live at: https://greenofig.com** 🚀
