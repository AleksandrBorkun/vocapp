import { db } from '@/lib/firebase';
import { Deck, Word } from '@/lib/types';
import { User as FirebaseUser } from 'firebase/auth';
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export interface CreateDeckInput {
    name: string;
    description: string;
    study: string;
    language: string;
    words: Word[];
}

export interface UseDecksReturn {
    decks: Deck[];
    loading: boolean;
    error: string | null;
    loadDecks: () => Promise<void>;
    createDeck: (deck: CreateDeckInput) => Promise<void>;
    deleteDeck: (userId: string, deckId: string) => Promise<void>;
    addWordToDeck: (deckId: string, word: Word) => Promise<void>;
    addWordsToDeck: (deckId: string, words: Word[]) => Promise<number>;
    reloadUserDecks: () => Promise<void>;
}

function normalizeStoredValue(value: string) {
    return value.trim().toLowerCase();
}

function normalizeWordForStorage(word: Word): Word {
    return {
        ...word,
        word: normalizeStoredValue(word.word),
        translation: normalizeStoredValue(word.translation),
    };
}

function getNormalizedWordKey(word: Pick<Word, 'word'>) {
    return normalizeStoredValue(word.word);
}

/**
 * Hook for managing user's vocabulary decks
 * @param user - Firebase user object (can be null)
 * @returns Object containing decks array, loading state, error, and CRUD functions
 * @example
 * const { decks, loading, createDeck, deleteDeck } = useDecks(user);
 */
export function useDecks(user: FirebaseUser | null): UseDecksReturn {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load all decks for the current user
     */
    const loadDecks = useCallback(async () => {
        if (!user || !db) {
            console.log('[useDecks] No user or db, skipping load');
            setDecks([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[useDecks] Loading decks for userId:', user.uid);

            // Get user document to access vocabIDs array
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.log('[useDecks] User document not found');
                setDecks([]);
                setLoading(false);
                return;
            }

            const userData = userSnap.data();
            const vocabIDs = userData.vocabIDs || [];

            console.log('[useDecks] User has', vocabIDs.length, 'vocab IDs:', vocabIDs);

            if (vocabIDs.length === 0) {
                setDecks([]);
                setLoading(false);
                return;
            }

            // Fetch each deck by ID
            const loadedDecks: Deck[] = [];
            for (const deckId of vocabIDs) {
                const deckRef = doc(db, 'decks', deckId);
                const deckSnap = await getDoc(deckRef);

                if (deckSnap.exists()) {
                    const data = deckSnap.data();
                    console.log('[useDecks] Processing deck:', deckId, data);
                    loadedDecks.push({
                        id: deckSnap.id,
                        name: data.name,
                        description: data.description,
                        study: data.study,
                        language: data.language,
                        words: data.words || [],
                        createdAt: data.createdAt?.toDate() || new Date(),
                    });
                } else {
                    console.warn('[useDecks] Deck not found:', deckId);
                }
            }

            // Sort in memory by createdAt (newest first)
            loadedDecks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            console.log('[useDecks] Setting', loadedDecks.length, 'decks to state');
            setDecks(loadedDecks);
        } catch (err) {
            console.error('[useDecks] Error loading decks:', err);
            setError(err instanceof Error ? err.message : 'Failed to load decks');
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Create a new deck
     */
    const createDeck = useCallback(
        async (deckInput: CreateDeckInput) => {
            if (!user || !db) {
                throw new Error('User not authenticated or Firebase not initialized');
            }

            try {
                setError(null);

                // Add the deck to Firestore
                const deckData = {
                    ...deckInput,
                    userId: user.uid,
                    createdAt: new Date(),
                };

                const docRef = await addDoc(collection(db, 'decks'), deckData);

                // Update user's vocabIDs
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    vocabIDs: arrayUnion(docRef.id),
                });

                // Reload decks to reflect the new deck
                await loadDecks();
            } catch (err) {
                console.error('Error creating deck:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to create deck';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [user, loadDecks]
    );

    /**
     * Delete a deck
     */
    const deleteDeck = useCallback(
        async (userId: string, deckId: string) => {
            if (!db) {
                throw new Error('Firebase not initialized');
            }

            try {
                setError(null);

                // Delete the deck document
                await deleteDoc(doc(db, 'decks', deckId));

                // Remove from user's vocabIDs
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    vocabIDs: arrayRemove(deckId),
                });

                // Update local state
                setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
            } catch (err) {
                console.error('Error deleting deck:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to delete deck';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        []
    );

    /**
     * Add a word to an existing deck
     */
    const addWordToDeck = useCallback(
        async (deckId: string, word: Word) => {
            if (!db) {
                throw new Error('Firebase not initialized');
            }

            const normalizedWord = normalizeWordForStorage(word);

            if (!deckId.trim()) {
                throw new Error('Deck ID is required');
            }

            if (
                !normalizedWord.word ||
                !normalizedWord.translation ||
                typeof word.accuracy !== 'number'
            ) {
                throw new Error('Word, translation, and accuracy are required');
            }

            try {
                setError(null);

                const deckRef = doc(db, 'decks', deckId);

                // Get current deck data
                const deck = decks.find((d) => d.id === deckId);
                if (!deck) {
                    throw new Error('Deck not found');
                }

                const duplicateExists = deck.words.some(
                    (existingWord) =>
                        getNormalizedWordKey(existingWord) === normalizedWord.word
                );

                if (duplicateExists) {
                    throw new Error('This word already exists in the selected deck');
                }

                // Add the word to the words array
                const updatedWords = [...deck.words, normalizedWord];
                await updateDoc(deckRef, {
                    words: updatedWords,
                });

                // Update local state
                setDecks((prevDecks) =>
                    prevDecks.map((d) =>
                        d.id === deckId ? { ...d, words: updatedWords } : d
                    )
                );
            } catch (err) {
                console.error('Error adding word to deck:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to add word';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [decks]
    );

    const addWordsToDeck = useCallback(
        async (deckId: string, words: Word[]) => {
            if (!db) {
                throw new Error('Firebase not initialized');
            }

            if (!deckId.trim()) {
                throw new Error('Deck ID is required');
            }

            if (words.length === 0) {
                return 0;
            }

            const normalizedWords = words
                .map((word) => normalizeWordForStorage(word))
                .filter(
                    (word) =>
                        word.word &&
                        word.translation &&
                        typeof word.accuracy === 'number'
                );

            if (normalizedWords.length !== words.length) {
                throw new Error('Word, translation, and accuracy are required');
            }

            try {
                setError(null);

                const deckRef = doc(db, 'decks', deckId);
                const deck = decks.find((d) => d.id === deckId);
                if (!deck) {
                    throw new Error('Deck not found');
                }

                const existingWordKeys = new Set(
                    deck.words.map((existingWord) => getNormalizedWordKey(existingWord))
                );
                const batchWordKeys = new Set<string>();
                const wordsToAdd: Word[] = [];

                for (const normalizedWord of normalizedWords) {
                    if (
                        existingWordKeys.has(normalizedWord.word) ||
                        batchWordKeys.has(normalizedWord.word)
                    ) {
                        continue;
                    }

                    batchWordKeys.add(normalizedWord.word);
                    wordsToAdd.push(normalizedWord);
                }

                if (wordsToAdd.length === 0) {
                    return 0;
                }

                const updatedWords = [...deck.words, ...wordsToAdd];
                await updateDoc(deckRef, {
                    words: updatedWords,
                });

                setDecks((prevDecks) =>
                    prevDecks.map((d) =>
                        d.id === deckId ? { ...d, words: updatedWords } : d
                    )
                );

                return wordsToAdd.length;
            } catch (err) {
                console.error('Error adding words to deck:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to add words';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [decks]
    );

    /**
     * Reload all user decks (alias for loadDecks for backward compatibility)
     */
    const reloadUserDecks = useCallback(async () => {
        await loadDecks();
    }, [loadDecks]);

    // Load decks when user changes
    useEffect(() => {
        loadDecks();
    }, [loadDecks]);

    return {
        decks,
        loading,
        error,
        loadDecks,
        createDeck,
        deleteDeck,
        addWordToDeck,
        addWordsToDeck,
        reloadUserDecks,
    };
}
