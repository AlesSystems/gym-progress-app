# Firebase Cloud Backup Setup

This guide will help you enable cloud backup for your workout data using Firebase.

## Why Cloud Backup?

Without cloud backup, your workout data is stored only on your device. When you:
- Update the app (PWA)
- Clear browser cache
- Reinstall the app
- Switch devices

...you will **lose all your workout history, templates, and progress**.

With Firebase cloud backup enabled, your data is automatically synced to the cloud and restored when you open the app again.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Workout Planner")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Enter an app nickname (e.g., "Workout PWA")
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object values

### 3. Enable Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** for now
4. Select your preferred location
5. Click **"Enable"**

> ⚠️ **Important:** Test mode allows all reads/writes. For production, you should configure proper security rules.

### 4. Enable Firebase Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Click on **"Anonymous"**
5. Toggle **"Enable"**
6. Click **"Save"**

### 5. Configure Environment Variables

Create a `.env` file in the `WorkoutPlanner` directory with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the values with those from your Firebase config object.

### 6. Rebuild and Deploy

```bash
cd WorkoutPlanner
npm run web:build
```

Your app will now automatically sync all workout data to Firebase!

## Security Rules (Production)

For production, update your Firestore security rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only authenticated users can read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Leaderboard - all authenticated users can read, but only write their own
    match /leaderboard/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## What Gets Synced?

The following data is automatically synced to Firebase:

- ✅ **Workout History** - All completed workouts with exercises and sets
- ✅ **Workout Templates** - Your custom workout templates
- ✅ **Nutrition Data** - Meal logs and nutrition tracking
- ✅ **Weight Tracking** - Body weight measurements
- ✅ **Settings** - App preferences and configurations
- ✅ **Display Name** - Your leaderboard display name

## How It Works

1. **On App Start**: The app loads local data immediately for fast startup, then syncs with Firebase in the background
2. **On Data Change**: Every time you add/edit/delete a workout or template, it's automatically synced to Firebase
3. **Merge Strategy**: If data exists both locally and in the cloud, the app merges them intelligently, keeping the most recent version of each item

## Verifying Sync

1. Open the app and go to **Settings**
2. Scroll to the **Cloud Backup** section
3. You should see:
   - ✅ Connected - Your data is backed up
   - Last sync timestamp
   - Number of workouts and templates synced
4. You can also click **"🔄 Sync Now"** to manually trigger a sync

## Troubleshooting

### Sync Status shows "⚠️ Connecting..."

- Check that all environment variables are set correctly
- Verify Firebase Authentication is enabled
- Check browser console for error messages

### Data not syncing

1. Check your internet connection
2. Open browser DevTools → Console
3. Look for Firebase errors
4. Verify Firestore security rules allow your operations

### Lost data after reinstall

If you configured Firebase correctly:
1. Open the app
2. Wait a few seconds for sync to complete
3. Your data should be restored automatically

If data is not restored:
- Check that you're using the same Firebase project
- Verify the Anonymous Auth user ID hasn't changed
- Check Firestore console to see if your data exists

## Support

For issues or questions, contact: [Your Support Email/Link]

---

**Made with 💪 by Altan Esmer**
