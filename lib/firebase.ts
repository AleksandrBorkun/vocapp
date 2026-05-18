import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import {
  doc,
  Firestore,
  getDoc,
  getFirestore,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { QuestProgressByLanguage, User, Word } from './types';
import { normalizeLanguageCode } from './utils/languageMapper';

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
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}

export { app, auth, db };

function normalizeQuestProgress(
  questProgress: User['questProgress'],
): QuestProgressByLanguage {
  if (!questProgress) {
    return {};
  }

  return Object.entries(questProgress).reduce<QuestProgressByLanguage>(
    (normalized, [languageCode, progress]) => {
      normalized[languageCode] = {
        totalXp: typeof progress?.totalXp === 'number' ? progress.totalXp : 0,
        streak: typeof progress?.streak === 'number' ? progress.streak : 0,
        lastCompletedOn: progress?.lastCompletedOn ?? null,
        updatedAt: progress?.updatedAt ?? null,
      };

      return normalized;
    },
    {},
  );
}

function normalizeUserDocument(data: Partial<User>): User {
  return {
    vocabIDs: Array.isArray(data.vocabIDs)
      ? data.vocabIDs.filter((deckId): deckId is string => typeof deckId === 'string')
      : [],
    nativeLanguage:
      typeof data.nativeLanguage === 'string' ? data.nativeLanguage : '',
    name: typeof data.name === 'string' ? data.name : '',
    tier: data.tier === 'paid' ? 'paid' : 'free',
    questProgress: normalizeQuestProgress(data.questProgress),
  };
}

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
    tier: 'free',
    questProgress: {},
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
    const data = userSnap.data() as Partial<User>;
    const normalizedUser = normalizeUserDocument(data);

    if (data.questProgress === undefined) {
      await setDoc(
        userRef,
        {
          questProgress: normalizedUser.questProgress,
        },
        { merge: true },
      );
    }

    return normalizedUser;
  }

  return null;
}

export async function getUserQuestProgress(
  userId: string,
): Promise<QuestProgressByLanguage> {
  const userDoc = await getUserDocument(userId);

  return userDoc?.questProgress ?? {};
}

interface SubmitQuestResultsParams {
  userId: string;
  deckId: string;
  updatedWords: Word[];
  languageCode: string;
  xpReward: number;
}

export async function submitQuestResults({
  userId,
  deckId,
  updatedWords,
  languageCode,
  xpReward,
}: SubmitQuestResultsParams): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const normalizedLanguageCode = normalizeLanguageCode(languageCode);
  const deckRef = doc(db, 'decks', deckId);
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const existingUser = userSnap.exists()
    ? normalizeUserDocument(userSnap.data() as Partial<User>)
    : null;
  const existingProgress =
    existingUser?.questProgress?.[normalizedLanguageCode] ?? {
      totalXp: 0,
      streak: 0,
      lastCompletedOn: null,
      updatedAt: null,
    };
  const timestamp = new Date().toISOString();

  const batch = writeBatch(db);
  batch.update(deckRef, {
    words: updatedWords,
  });
  batch.set(
    userRef,
    {
      questProgress: {
        [normalizedLanguageCode]: {
          ...existingProgress,
          totalXp: existingProgress.totalXp + Math.max(0, xpReward),
          lastCompletedOn: timestamp,
          updatedAt: timestamp,
        },
      },
    },
    { merge: true },
  );

  await batch.commit();
}
