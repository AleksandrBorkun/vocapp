import { auth, getUserDocument } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface UseAuthOptions {
    requireAuth?: boolean;
    requireOnboarding?: boolean;
    redirectTo?: string;
}

export interface UseAuthReturn {
    user: FirebaseUser | null;
    loading: boolean;
    error: string | null;
}

/**
 * Hook for managing user authentication state
 * @param options - Configuration for auth behavior
 * @param options.requireAuth - Redirect to login if not authenticated (default: false)
 * @param options.requireOnboarding - Redirect to onboarding if not completed (default: false)
 * @param options.redirectTo - URL to redirect to if auth fails (default: "/login")
 * @returns Object containing user, loading state, and error
 * @example
 * const { user, loading, error } = useAuth({ requireAuth: true, requireOnboarding: true });
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
    const { requireAuth = false, requireOnboarding = false, redirectTo = '/login' } = options;
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!auth) {
            setError('Firebase auth not initialized');
            setLoading(false);
            if (requireAuth) {
                router.push(redirectTo);
            }
            return;
        }

        let timeoutId: NodeJS.Timeout;

        // Set a timeout to detect if auth state takes too long
        const authTimeout = setTimeout(() => {
            console.warn('Auth state change timeout - Firebase may not be responding');
            setLoading(false);
            if (requireAuth) {
                setError('Authentication timeout');
                router.push(redirectTo);
            }
        }, 10000); // 10 second timeout

        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {
                clearTimeout(authTimeout);

                try {
                    if (currentUser) {
                        setUser(currentUser);

                        // Check onboarding status if required
                        if (requireOnboarding) {
                            const userDoc = await getUserDocument(currentUser.uid);
                            if (!userDoc || !userDoc.nativeLanguage) {
                                router.push('/onboarding');
                                setLoading(false);
                                return;
                            }
                        }
                    } else {
                        setUser(null);
                        if (requireAuth) {
                            router.push(redirectTo);
                        }
                    }
                } catch (err) {
                    console.error('Error in auth state change:', err);
                    setError(err instanceof Error ? err.message : 'Authentication error');
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                clearTimeout(authTimeout);
                console.error('Auth state change error:', err);
                setError(err.message || 'Authentication error');
                setLoading(false);
                if (requireAuth) {
                    router.push(redirectTo);
                }
            }
        );

        return () => {
            clearTimeout(authTimeout);
            unsubscribe();
        };
    }, [requireAuth, requireOnboarding, redirectTo, router]);

    return { user, loading, error };
}
