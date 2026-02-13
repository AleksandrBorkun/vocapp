import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { doc, Firestore, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { User } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Validate Firebase configuration
function validateFirebaseConfig() {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration:', missingFields);
    throw new Error(`Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`);
  }
}

// Only initialize Firebase on the client side
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined') {
  try {
    validateFirebaseConfig();
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}

export { app, auth, db };

/**
 * Creates a user document in Firestore after first login
 */
export async function createUserDocument(
  userId: string,
  nativeLanguage: string,
  name: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', userId);
  const userData: User = {
    vocabIDs: [],
    nativeLanguage,
    name,
    tier: 'free'
  };

  await setDoc(userRef, userData);
}

/**
 * Gets a user document from Firestore
 * Returns null if user document doesn't exist
 */
export async function getUserDocument(userId: string): Promise<User | null> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  return null;
}
