# 🔥 Firestore Setup Instructions - IMPORTANT!

## Problem Found ❌
Your leaderboard implementation is **CORRECT**, but data cannot be saved to Firestore because your **security rules are blocking all writes**.

Error: `PERMISSION_DENIED: Permission denied on resource project workout-meal-planner`

## How to Fix 🛠️

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com/project/workout-meal-planner/firestore/rules

### Step 2: Update Security Rules
Replace your current rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish
Click the **"Publish"** button to save and activate the new rules.

### Step 4: Test
After publishing the rules, run this test:
```bash
cd WorkoutPlanner
node test-firestore.js
```

You should see:
- ✅ Firebase initialized successfully
- ✅ Test document written
- ✅ Documents found in leaderboard collection

## Understanding the Rules

### Current Rules (Development/Testing)
```javascript
allow read, write: if true;
```
- ⚠️ **Anyone can read and write** - Good for testing
- ⚠️ **NOT secure for production**

### Better Rules for Production (Future)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{userId} {
      // Anyone can read leaderboard data
      allow read: if true;
      
      // Only allow reasonable data
      allow create: if request.resource.data.score >= 0 
                    && request.resource.data.score < 100000
                    && request.resource.data.displayName.size() >= 2
                    && request.resource.data.displayName.size() <= 20;
      
      // Only allow updates to same userId
      allow update: if request.resource.data.userId == userId
                    && request.resource.data.score >= 0
                    && request.resource.data.score < 100000;
    }
  }
}
```

## Why This Happened

When you create a Firestore database, Firebase sets default security rules that **deny all access** to protect your data. You need to explicitly allow access for your app to work.

## Next Steps

1. ✅ Fix the security rules (see Step 2 above)
2. ✅ Test with the script: `node test-firestore.js`
3. ✅ Launch your app and use the leaderboard feature
4. ✅ Check Firebase Console → Firestore → Data to see your leaderboard entries
5. 🔜 Later: Implement better security rules for production

## Verification

After fixing the rules, you should see data in:
- **Firebase Console**: https://console.firebase.google.com/project/workout-meal-planner/firestore/data/~2Fleaderboard
- **Your App**: The leaderboard screen should show entries

## Additional Notes

- The app has built-in offline support, so it will work even without Firebase
- Firebase just allows leaderboard data to sync between users
- Your implementation is **correct** - this was just a configuration issue!
