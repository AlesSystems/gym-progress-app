# iOS Deployment Guide - Workout Planner App for iPhone 13

## Overview
This guide walks you through deploying the Workout Planner React Native app to your iPhone 13.

---

## Prerequisites

### 1. Hardware & Software Requirements
- **Mac Computer** (required for iOS development)
- **iPhone 13** with iOS 15.0 or later
- **USB-C to Lightning cable** (or USB-A to Lightning)
- **macOS** Big Sur (11.0) or later
- **Xcode 13.0 or later** (free from Mac App Store)
- **Node.js 20+** (already required by this project)
- **CocoaPods** (iOS dependency manager)

### 2. Apple Developer Account
You have two options:

#### Option A: Free Account (Recommended for Testing)
- Use your personal Apple ID
- Limitations:
  - App expires after 7 days (need to reinstall)
  - Limited to 3 devices
  - No App Store distribution
  - Some advanced features unavailable

#### Option B: Paid Developer Program ($99/year)
- Full capabilities
- App Store distribution
- TestFlight beta testing
- 1-year code signing
- Sign up at: https://developer.apple.com/programs/

---

## Setup Steps

### Step 1: Install Xcode
1. Open **Mac App Store**
2. Search for **Xcode**
3. Click **Get** and wait for download/installation (8+ GB)
4. Open Xcode and accept the license agreement
5. Install additional components when prompted

### Step 2: Install CocoaPods
Open Terminal on your Mac and run:
```bash
sudo gem install cocoapods
```

### Step 3: Set Up Your Mac Development Environment
On your Mac, navigate to the project:
```bash
cd /path/to/gym-progress-app/WorkoutPlanner
```

Install Node dependencies:
```bash
npm install
```

Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

### Step 4: Configure Code Signing in Xcode

1. **Open the project in Xcode:**
   ```bash
   cd WorkoutPlanner/ios
   open WorkoutPlanner.xcworkspace
   ```
   ⚠️ **Important:** Open `.xcworkspace`, NOT `.xcodeproj`

2. **Select the project** in the left sidebar (blue icon labeled "WorkoutPlanner")

3. **Select the "WorkoutPlanner" target** under TARGETS

4. **Go to "Signing & Capabilities" tab**

5. **Configure signing:**
   - Check ✅ **"Automatically manage signing"**
   - Select your **Team** from dropdown (your Apple ID)
   - If no team appears, click "Add Account..." and sign in with your Apple ID
   - Xcode will automatically create a provisioning profile

6. **Change Bundle Identifier** (required for free accounts):
   - Find "Bundle Identifier" field (e.g., `org.reactjs.native.example.WorkoutPlanner`)
   - Change to something unique: `com.yourname.workoutplanner`
   - Example: `com.johndoe.workoutplanner`

7. **Repeat for "WorkoutPlannerTests" target** (if present)

### Step 5: Connect Your iPhone 13

1. **Connect iPhone to Mac** using USB cable

2. **Unlock your iPhone**

3. **Trust your Mac:**
   - If prompted on iPhone, tap "Trust This Computer"
   - Enter your iPhone passcode

4. **Enable Developer Mode** (iOS 16+):
   - Go to iPhone Settings → Privacy & Security → Developer Mode
   - Toggle ON
   - Restart iPhone when prompted

5. **Select your iPhone in Xcode:**
   - Click the device dropdown (top-left toolbar, next to Run button)
   - Select your iPhone 13 from the list

### Step 6: Build and Deploy

#### Method A: Using Xcode (Recommended for First Deploy)

1. Click the **Play button** (▶️) in Xcode, or press `Cmd + R`
2. Xcode will:
   - Build the app
   - Install on your iPhone
   - Launch automatically
3. **First-time trust:**
   - If app crashes with "Untrusted Developer" error:
   - Go to iPhone Settings → General → VPN & Device Management
   - Tap your Apple ID
   - Tap "Trust [Your Apple ID]"
   - Return to home screen and launch app again

#### Method B: Using React Native CLI

From Terminal:
```bash
cd /path/to/gym-progress-app/WorkoutPlanner
npx react-native run-ios --device "Your iPhone Name"
```

Or use the npm script:
```bash
npm run ios -- --device "Your iPhone Name"
```

---

## Troubleshooting Common Issues

### Error: "No provisioning profiles found"
**Solution:**
- Ensure you're signed into Xcode with your Apple ID
- Enable "Automatically manage signing"
- Change Bundle Identifier to something unique

### Error: "Failed to install pod dependencies"
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Error: "Failed to build iOS project"
**Solution:**
```bash
cd ios
xcodebuild clean
cd ..
npx react-native start --reset-cache
```

### App expires after 7 days (Free Account)
**Solution:**
- Reconnect iPhone to Mac
- Rebuild and redeploy using same steps
- Consider upgrading to paid Apple Developer Program

### Build fails with "Command PhaseScriptExecution failed"
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Metro bundler won't start
**Solution:**
```bash
npm run start:reset
```
Then rebuild in Xcode.

### iPhone not appearing in Xcode
**Solution:**
- Unplug and replug USB cable
- Unlock iPhone
- Restart Xcode
- Check cable is data-capable (not charge-only)

---

## Post-Deployment

### Running the App
- App will remain on your iPhone home screen
- Launch like any other app
- No Mac/computer connection needed for normal use

### Metro Bundler (Development)
For development with hot reload:
1. Start Metro bundler: `npm start` (in WorkoutPlanner directory)
2. Ensure iPhone on same WiFi as Mac
3. App will auto-reload when you save code changes

### Production Build (No Dev Server)
To create standalone build:
1. In Xcode, edit scheme: Product → Scheme → Edit Scheme
2. Set Build Configuration to "Release"
3. Build and run
4. App runs without Metro bundler connection

### App Re-signing (Free Account)
- Apps signed with free accounts expire in 7 days
- Reconnect iPhone and rebuild to extend
- Or upgrade to paid Apple Developer account

---

## Next Steps

### For Testing & Development
- Use the deployed app on your iPhone
- Make code changes on your Mac
- Use Metro bundler for live reload during development
- Test app performance on real device

### For Distribution
- **Paid account required** for:
  - TestFlight (beta testing with others)
  - App Store submission
  - Enterprise distribution

### Backup & Version Control
- Commit changes to Git regularly
- Keep backups of working builds
- Document any iOS-specific configurations

---

## Additional Resources

- **React Native iOS Guide:** https://reactnative.dev/docs/running-on-device
- **Apple Developer Documentation:** https://developer.apple.com/documentation/
- **Xcode Help:** https://developer.apple.com/xcode/
- **CocoaPods:** https://cocoapods.org/

---

## Support Checklist

Before reaching out for help, verify:
- [ ] Mac has Xcode 13+ installed
- [ ] Node.js 20+ installed
- [ ] CocoaPods installed
- [ ] `npm install` completed successfully
- [ ] `pod install` completed successfully (in ios/ directory)
- [ ] iPhone is unlocked and connected
- [ ] iPhone trusts the Mac
- [ ] Developer Mode enabled (iOS 16+)
- [ ] Bundle Identifier is unique
- [ ] Automatic signing is enabled
- [ ] Apple ID is signed into Xcode

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-15  
**App Version:** 0.0.1  
**Target Device:** iPhone 13 (iOS 15+)
