# iOS Installation Guide for Greenofig

Since iOS apps can only be built on macOS with Xcode, here are **3 alternative ways** to get Greenofig on your iPhone:

---

## 🌐 Option 1: Install as PWA (Works NOW - No Mac Needed!)

The web app can be installed on iPhone as a Progressive Web App, giving you an app-like experience:

### Steps to Install on iPhone:

1. **Open Safari** on your iPhone
2. **Navigate to:** `https://your-netlify-app.netlify.app` (your Netlify URL)
3. **Tap the Share button** (square with arrow pointing up)
4. **Scroll down** and tap **"Add to Home Screen"**
5. **Name it:** "Greenofig"
6. **Tap "Add"**

✅ The app will now appear on your home screen like a native app!
✅ Works offline with cached data
✅ Full screen experience (no browser UI)
✅ Push notifications supported

### PWA Features:
- ✅ Launches like a native app
- ✅ Works offline
- ✅ All web features available
- ✅ No App Store required
- ✅ Automatic updates
- ❌ No access to native iOS APIs (Camera, HealthKit require native app)

---

## 🍎 Option 2: Build Native iOS App (Requires Mac)

If you have access to a Mac, here's how to build the iOS app:

### Prerequisites:
- macOS computer
- Xcode installed (free from App Store)
- Apple Developer account ($99/year for distribution)

### Build Steps:

```bash
# 1. Clone the repository
git clone https://github.com/Ahmed-S-Salim/greenofig.git
cd greenofig

# 2. Install dependencies
flutter pub get
flutter pub upgrade

# 3. Open iOS project in Xcode
open ios/Runner.xcworkspace

# 4. Configure signing in Xcode:
# - Select Runner in project navigator
# - Go to Signing & Capabilities
# - Select your Apple Developer team
# - Xcode will automatically create provisioning profiles

# 5. Build for iOS
flutter build ios --release

# 6. Build IPA for distribution
flutter build ipa
```

### After Building:

The IPA will be located at:
```
build/ios/ipa/greenofig.ipa
```

---

## 📲 Option 3: TestFlight Distribution (Recommended for Testing)

TestFlight is Apple's official beta testing platform. After building the iOS app:

### Steps:

1. **Create App on App Store Connect:**
   - Go to https://appstoreconnect.apple.com
   - Click "+" → "New App"
   - Fill in app details (name, bundle ID, etc.)

2. **Upload IPA using Xcode or Transporter:**

   **Using Xcode:**
   ```bash
   # Archive the app
   flutter build ipa

   # Open Xcode
   open ios/Runner.xcworkspace

   # Product → Archive
   # Then click "Distribute App" → "App Store Connect"
   ```

   **Using Transporter App:**
   - Download Transporter from Mac App Store
   - Drag your IPA into Transporter
   - Click "Deliver"

3. **Add Testers in TestFlight:**
   - Go to App Store Connect → TestFlight
   - Add internal testers (up to 100)
   - Or create public link for external testers (up to 10,000)

4. **Testers Install:**
   - Testers download TestFlight app from App Store
   - They receive invitation email/link
   - Click link → Install from TestFlight

### Create QR Code for TestFlight:

1. Get your TestFlight public link
2. Go to https://qr.io/ or https://www.qr-code-generator.com/
3. Create QR code with TestFlight link
4. Share QR code - users scan and install!

---

## 🚀 Option 4: Direct IPA Installation (Advanced)

For installing without App Store or TestFlight:

### Requirements:
- IPA file built and signed
- Device UDID registered in Apple Developer portal
- Provisioning profile including device UDID

### Installation Methods:

**Method A: Using 3uTools (Windows/Mac):**
1. Download 3uTools: https://www.3u.com/
2. Connect iPhone via USB
3. Drag IPA file into 3uTools
4. Click install

**Method B: Using Xcode (Mac only):**
```bash
# Connect iPhone via USB
# Open Xcode
# Window → Devices and Simulators
# Drag IPA onto device
```

**Method C: Over-The-Air (OTA) Installation:**

1. Upload IPA to your web server (HTTPS required)

2. Create `manifest.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>https://yourserver.com/greenofig.ipa</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>com.greenofig.app</string>
                <key>bundle-version</key>
                <string>1.0.0</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>Greenofig</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>
```

3. Create installation page:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Install Greenofig</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <h1>Install Greenofig</h1>
    <a href="itms-services://?action=download-manifest&url=https://yourserver.com/manifest.plist">
        <button>Install App</button>
    </a>
</body>
</html>
```

4. Generate QR code pointing to installation page
5. Users scan QR code → tap Install

---

## 🔧 Quick Start for iOS Installation RIGHT NOW

### For Immediate Use (No Build Required):

**1. PWA Installation (5 minutes):**
- Open your Netlify URL in Safari on iPhone
- Add to Home Screen
- ✅ Done! You can use the app now

**2. If You Need Native App:**
- Rent a Mac on https://www.macincloud.com/ ($30-50/month)
- Or use a friend's Mac for a few hours
- Follow Option 2 build steps above
- Build takes ~30 minutes first time

**3. For Distribution to Multiple iPhones:**
- Use TestFlight (Option 3) - Free for 10,000 testers
- Or use Enterprise Distribution if you have Apple Developer Enterprise ($299/year)

---

## 📊 Comparison Table

| Method | Cost | Time | Devices | Native Features |
|--------|------|------|---------|-----------------|
| PWA (Option 1) | Free | 5 min | Unlimited | Limited |
| TestFlight | $99/year | 2-3 hours | 10,000 | Full |
| Direct Install | $99/year | 2 hours | 100 (dev) | Full |
| App Store | $99/year | 1-2 weeks | Unlimited | Full |

---

## 🎯 Recommended Path

### For Personal Use:
1. ✅ Install PWA immediately (Option 1)
2. When you get Mac access, build native app (Option 2)
3. Distribute via TestFlight for testing (Option 3)

### For Public Distribution:
1. Build on Mac (Option 2)
2. Use TestFlight for beta testing (Option 3)
3. Submit to App Store for public release

---

## 📱 QR Code Creation for iOS

After you have the IPA or TestFlight link:

### QR Code Generators (Free):
- https://qr.io/ (Recommended - has analytics)
- https://www.qr-code-generator.com/
- https://www.qrcode-monkey.com/

### What to QR Code:
- **PWA:** Your Netlify URL
- **TestFlight:** Your TestFlight public link
- **Direct Install:** OTA installation page URL

---

## 🆘 Need Help Building iOS?

### Services That Can Build For You:
1. **Codemagic.io** - CI/CD for Flutter, can build iOS on cloud
2. **Bitrise.io** - Similar CI/CD service
3. **MacinCloud.com** - Rent Mac by the hour
4. **MacStadium.com** - Dedicated Mac hosting

### Cost-Effective Option:
Use **Codemagic** or **Bitrise** free tier:
- Sign up free account
- Connect GitHub repo
- Configure build workflow
- They build iOS app for you in cloud
- Download IPA when done

---

## ✅ Current Status

- ✅ GitHub repo updated with all changes
- ✅ Android APK ready to install
- ✅ Web app ready for PWA installation
- ✅ iOS build instructions ready
- ⏳ iOS native app (requires Mac to build)

**You can start using the app on iPhone RIGHT NOW via PWA installation!**

---

## 📞 Support

For iOS installation help:
- Email: support@greenofig.com
- GitHub Issues: https://github.com/Ahmed-S-Salim/greenofig/issues

---

**Pro Tip:** The PWA installation (Option 1) is the fastest way to get started on iPhone. You can build the native iOS app later when you have Mac access, but the PWA works great for now!
