/**
 * Firebase helper utilities for VocApp
 * Provides error handling, retry logic, and batch operations for Firestore
 */

import { FirebaseError } from 'firebase/app';

/**
 * Error codes and their user-friendly messages
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'permission-denied': 'You do not have permission to access this resource',
    'not-found': 'The requested resource was not found',
    'unavailable': 'Service temporarily unavailable. Please try again',
    'deadline-exceeded': 'Request timeout. Please try again',
    'resource-exhausted': 'Quota exceeded. Please try again later',
};

/**
 * Parses a Firebase error and returns a user-friendly message
 * @param error - Error object from Firebase
 * @returns User-friendly error message
 * @example
 * try {
 *   await signInWithEmailAndPassword(auth, email, password);
 * } catch (error) {
 *   const message = parseFirebaseError(error);
 *   setError(message);
 * }
 */
export function parseFirebaseError(error: unknown): string {
    if (!error) return 'An unknown error occurred';

    // Handle Firebase-specific errors
    if (error instanceof FirebaseError) {
        const message = FIREBASE_ERROR_MESSAGES[error.code];
        if (message) return message;

        // Return the error message if no custom message exists
        return error.message || 'An error occurred with Firebase';
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return error.message;
    }

    // Handle string errors
    if (typeof error === 'string') {
        return error;
    }

    // Fallback for unknown error types
    return 'An unexpected error occurred';
}

/**
 * Retries a Firebase operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns Promise resolving to operation result
 * @example
 * const data = await retryOperation(
 *   () => getDocs(collection(db, 'decks')),
 *   3,
 *   1000
 * );
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (error instanceof FirebaseError) {
                const nonRetryableCodes = [
                    'permission-denied',
                    'unauthenticated',
                    'invalid-argument',
                    'not-found',
                ];

                if (nonRetryableCodes.includes(error.code)) {
                    throw error;
                }
            }

            // If we've exhausted retries, throw the error
            if (attempt === maxRetries) {
                break;
            }

            // Wait before retrying (exponential backoff)
            const delay = initialDelay * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // If we get here, all retries failed
    throw lastError;
}

/**
 * Splits an array into batches for Firestore operations
 * Firestore has a limit of 500 documents per batch operation
 * @param items - Array of items to batch
 * @param batchSize - Size of each batch (default: 500)
 * @returns Array of batches
 * @example
 * const deckIds = [...]; // 1200 IDs
 * const batches = batchArray(deckIds, 500);
 * // Returns 3 arrays: [500 items], [500 items], [200 items]
 * 
 * for (const batch of batches) {
 *   await processBatch(batch);
 * }
 */
export function batchArray<T>(items: T[], batchSize: number = 500): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
    }

    return batches;
}

/**
 * Checks if an error is a network-related error
 * @param error - Error to check
 * @returns true if the error is network-related
 * @example
 * catch (error) {
 *   if (isNetworkError(error)) {
 *     setError('Please check your internet connection');
 *   }
 * }
 */
export function isNetworkError(error: unknown): boolean {
    if (error instanceof FirebaseError) {
        return error.code === 'unavailable' || error.code === 'auth/network-request-failed';
    }

    if (error instanceof Error) {
        return error.message.toLowerCase().includes('network');
    }

    return false;
}

/**
 * Checks if an error is a permission error
 * @param error - Error to check
 * @returns true if the error is permission-related
 * @example
 * catch (error) {
 *   if (isPermissionError(error)) {
 *     router.push('/login');
 *   }
 * }
 */
export function isPermissionError(error: unknown): boolean {
    if (error instanceof FirebaseError) {
        return error.code === 'permission-denied' || error.code === 'unauthenticated';
    }

    return false;
}

/**
 * Validates that Firebase is initialized
 * @param db - Firestore instance
 * @param auth - Auth instance
 * @throws Error if Firebase is not initialized
 * @example
 * validateFirebaseInit(db, auth);
 * // Proceeds if initialized, throws error if not
 */
export function validateFirebaseInit(db: unknown, auth?: unknown): void {
    if (!db) {
        throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
    }

    if (auth !== undefined && !auth) {
        throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
    }
}

/**
 * Creates a safe delay for rate limiting
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 * @example
 * await delay(1000); // Wait 1 second
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
