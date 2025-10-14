# Greenofig Installation Guide

## 📱 Installation Options

### Option 1: Android APK Installation (Current)

The Android APK files are located in `build/app/outputs/flutter-apk/`:

1. **app-arm64-v8a-release.apk** (38.6MB) - Recommended for most modern Android devices
2. **app-armeabi-v7a-release.apk** (36.4MB) - For older Android devices
3. **app-x86_64-release.apk** (39.7MB) - For Android emulators/tablets

#### Installation Steps:

1. Transfer the APK file to your Android device
2. Enable "Install from Unknown Sources" in Settings → Security
3. Open the APK file and follow the installation prompts
4. Launch Greenofig app

#### Creating QR Code for Easy Installation:

1. Upload the APK to a file hosting service (Google Drive, Dropbox, Firebase)
2. Get the direct download link
3. Use a QR code generator like https://qr.io/ or https://www.qr-code-generator.com/
4. Generate QR code pointing to the download link
5. Users can scan the QR code to download and install

### Option 2: iOS Installation (Requires macOS)

**Note:** iOS builds can only be created on macOS systems with Xcode installed.

#### Steps to build for iOS (on macOS):

```bash
# Install dependencies
flutter pub get

# Build iOS app
flutter build ios --release

# Or for physical device testing
flutter build ipa

# Create IPA for distribution
cd build/ios/iphoneos
mkdir Payload
cp -r Runner.app Payload/
zip -r greenofig.ipa Payload
```

#### iOS Distribution Options:

1. **TestFlight** (Recommended)
   - Upload IPA to App Store Connect
   - Add testers via email
   - They receive download link automatically

2. **Direct Installation via QR Code**
   - Upload IPA to a hosting service
   - Use itms-services:// protocol for installation
   - Generate QR code with installation URL

3. **Enterprise Distribution**
   - Requires Apple Developer Enterprise account
   - Sign with enterprise certificate
   - Distribute via MDM or direct download

#### Creating iOS Installation QR Code:

1. Upload greenofig.ipa to your server
2. Create a manifest.plist file:

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

3. Create installation URL:
   ```
   itms-services://?action=download-manifest&url=https://yourserver.com/manifest.plist
   ```

4. Generate QR code with this URL
5. Users scan QR code on their iPhone to install

### Option 3: Web App (Already Deployed)

The web version is already available at your Netlify deployment:

```
https://your-netlify-app.netlify.app
```

## 🔐 User Roles and Access

### Admin Account
- **Email:** admin@greenofig.com
- **Features:** Full access to all features + admin panel
  - User management
  - System settings
  - Analytics dashboard
  - All premium & AI features

### Premium User Account
- **Requires:** Active subscription (Premium, Pro, or Elite plan)
- **Features:**
  - AI meal planning
  - AI food scanner
  - Custom workout programs
  - Advanced analytics
  - Wearable integration
  - Export reports
  - AI health coach
  - Ad-free experience

### Nutritionist Account
- **Features:**
  - Client management
  - Meal plan creation
  - Professional reports
  - Consultation scheduling
  - AI meal planning tools
  - Advanced analytics

### Basic User Account
- **Features:**
  - Basic meal logging
  - Basic workout tracking
  - Progress viewing
  - Community access
  - Ad-supported experience

## 🚀 First Time Setup

1. **Install the app** using one of the methods above
2. **Launch Greenofig**
3. **Sign Up / Sign In**
   - Use demo credentials for testing
   - Or create a new account
4. **Complete onboarding**
   - Set your health goals
   - Connect wearable devices (optional)
   - Choose subscription plan
5. **Start your wellness journey!**

## 📊 Testing All Features

### For Developers/Testers:

1. **Test as Admin:**
   - Login with admin@greenofig.com
   - Access Admin Panel from dashboard
   - Verify all features are accessible

2. **Test as Premium User:**
   - Create account or use test credentials
   - Purchase/activate subscription
   - Test AI features (food scanner, health coach)
   - Try workout programs

3. **Test as Basic User:**
   - Create account without subscription
   - Verify limited feature access
   - Test upgrade prompts

4. **Test as Nutritionist:**
   - Request nutritionist role assignment
   - Test client management features
   - Create meal plans

## 🔧 Troubleshooting

### Android Installation Issues:

- **"App not installed":** Enable "Install from Unknown Sources"
- **"Parse error":** Download the correct APK for your device architecture
- **App crashes:** Check Android version (minimum Android 6.0)

### iOS Installation Issues:

- **"Unable to install":** Device may not be registered in provisioning profile
- **Certificate errors:** App needs to be signed with valid certificate
- **Network errors:** Ensure HTTPS is used for IPA and manifest files

### Web App Issues:

- **White screen:** Clear browser cache and reload
- **Features not working:** Check internet connection
- **Login issues:** Verify Supabase configuration

## 📞 Support

For issues or questions:
1. Check the deployment guide (DEPLOYMENT_GUIDE.md)
2. Review error logs in the app
3. Contact support at support@greenofig.com

## 🎯 Next Steps

1. ✅ Android APK built successfully
2. ⏳ iOS build (requires macOS with Xcode)
3. ✅ Web app deployed on Netlify
4. ⏳ Create QR codes for distribution
5. ⏳ Test all user roles and features
6. ⏳ Collect feedback and iterate

## 📝 Notes

- **Android APKs are located at:** `build/app/outputs/flutter-apk/`
- **Recommended APK:** Use `app-arm64-v8a-release.apk` for most devices
- **iOS builds require:** macOS with Xcode installed
- **Web app:** Already deployed and accessible via browser
- **Role-based access:** Fully implemented and functional
- **AI features:** Integrated and ready for use with proper credentials
