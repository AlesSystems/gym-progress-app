import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS
// ─────────────────────────────────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com and create a new project
// 2. Add a Web app to the project
// 3. Copy the firebaseConfig values shown and paste them below
// 4. In the Firebase console, go to Firestore Database → Create Database
//    (choose "Start in test mode" for now, you can add security rules later)
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Only initialise once (Vite HMR can call this file multiple times)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

/** Returns true only when all required env vars are present */
export const isFirebaseConfigured = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

/** Initialize Firebase Auth and sign in anonymously */
export const initializeAuth = async (): Promise<User | null> => {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Not configured - skipping auth');
    return null;
  }

  try {
    // Wait for existing auth state
    const currentUser = await new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (currentUser) {
      console.log('[Firebase] Already authenticated:', currentUser.uid);
      return currentUser;
    }

    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    console.log('[Firebase] Signed in anonymously:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('[Firebase] Auth error:', error);
    return null;
  }
};

/** Get current authenticated user */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
