import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

/** Returns true only when all required env vars are present */
export const isFirebaseConfigured = (): boolean =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
