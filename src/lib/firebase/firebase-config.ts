// firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

let app: ReturnType<typeof initializeApp> | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (typeof window !== 'undefined' && 'navigator' in window) {
  // init may fail if env missing
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    db = getFirestore(app);
  } catch {
  }
}

/** Call from client (e.g. inside useEffect) to ensure Firestore is available after hydration */
function getFirestoreInstance(): ReturnType<typeof getFirestore> | null {
  if (typeof window === 'undefined' || !('navigator' in window)) return null;
  try {
    if (!app) {
      const hasConfig = !!(
        firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.appId
      );
      if (!hasConfig) return null;
      app = initializeApp(firebaseConfig);
      messaging = getMessaging(app);
      db = getFirestore(app);
    }
    return db;
  } catch {
    return null;
  }
}

export { messaging, getToken, onMessage, db, getFirestoreInstance };

