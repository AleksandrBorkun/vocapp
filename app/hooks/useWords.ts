import { db, submitQuestResults } from '@/lib/firebase';
import { Deck, Word } from '@/lib/types';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';

const MIN_ACCURACY = 0;
const MAX_ACCURACY = 1;
const CORRECT_ANSWER_DELTA = 0.05;
const WRONG_ANSWER_DELTA = 0.02;

export interface WordAccuracyUpdate {
    wordIndex: number;
    delta: number;
}

export interface SubmitStudyResultsParams {
    deckId: string;
    userId: string;
    languageCode: string;
    xpReward: number;
    updates: WordAccuracyUpdate[];
}

function clampAccuracy(value: number) {
    return Math.min(MAX_ACCURACY, Math.max(MIN_ACCURACY, value));
}

function applyAccuracyUpdates(words: Word[], updates: WordAccuracyUpdate[]) {
    if (updates.length === 0) {
        return words;
    }

    const mergedDeltas = new Map<number, number>();

    updates.forEach(({ wordIndex, delta }) => {
        const word = words[wordIndex];

        if (!word) {
            throw new Error('Word not found');
        }

        mergedDeltas.set(wordIndex, (mergedDeltas.get(wordIndex) ?? 0) + delta);
    });

    return words.map((word, index) => {
        const delta = mergedDeltas.get(index);

        if (delta === undefined) {
            return word;
        }

        return {
            ...word,
            accuracy: clampAccuracy(word.accuracy + delta),
        };
    });
}

export interface UseWordsReturn {
    deck: Deck | null;
    loading: boolean;
    error: string | null;
    loadDeck: (deckId: string) => Promise<void>;
    updateWord: (deckId: string, wordIndex: number, updatedWord: Partial<Word>) => Promise<void>;
    addWord: (deckId: string, word: Word) => Promise<void>;
    deleteWord: (deckId: string, wordIndex: number) => Promise<void>;
    updateWordAccuracy: (deckId: string, wordIndex: number, isCorrect: boolean) => Promise<void>;
    updateWordAccuracies: (deckId: string, updates: WordAccuracyUpdate[]) => Promise<void>;
    submitStudyResults: (params: SubmitStudyResultsParams) => Promise<void>;
}

/**
 * Hook for managing words within a specific deck
 * @returns Object containing deck, loading state, error, and word management functions
 * @example
 * const { deck, loading, loadDeck, addWord, updateWord } = useWords();
 * 
 * useEffect(() => { loadDeck(deckId); }, [deckId]);
 */
export function useWords(): UseWordsReturn {
    const [deck, setDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const updateWordsSnapshot = useCallback(
        async (deckId: string, updatedWords: Word[]) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            const deckRef = doc(db, 'decks', deckId);
            await updateDoc(deckRef, {
                words: updatedWords,
            });

            setDeck({
                ...deck,
                words: updatedWords,
            });
        },
        [deck]
    );

    /**
     * Load a specific deck by ID
     */
    const loadDeck = useCallback(async (deckId: string) => {
        if (!db) {
            setError('Firestore not initialized');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const deckRef = doc(db, 'decks', deckId);
            const deckSnap = await getDoc(deckRef);

            if (deckSnap.exists()) {
                const data = deckSnap.data();
                setDeck({
                    id: deckSnap.id,
                    name: data.name,
                    description: data.description,
                    study: data.study,
                    language: data.language,
                    words: data.words || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                });
            } else {
                setError('Deck not found');
                setDeck(null);
            }
        } catch (err) {
            console.error('Error loading deck:', err);
            setError(err instanceof Error ? err.message : 'Failed to load deck');
            setDeck(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Update a specific word in the deck
     */
    const updateWord = useCallback(
        async (deckId: string, wordIndex: number, updatedWord: Partial<Word>) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            try {
                setError(null);

                const updatedWords = [...deck.words];
                updatedWords[wordIndex] = {
                    ...updatedWords[wordIndex],
                    ...updatedWord,
                };

                await updateWordsSnapshot(deckId, updatedWords);
            } catch (err) {
                console.error('Error updating word:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to update word';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [deck, updateWordsSnapshot]
    );

    /**
     * Add a new word to the deck
     */
    const addWord = useCallback(
        async (deckId: string, word: Word) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            try {
                setError(null);

                const updatedWords = [...deck.words, word];

                const deckRef = doc(db, 'decks', deckId);
                await updateDoc(deckRef, {
                    words: updatedWords,
                });

                // Update local state
                setDeck({
                    ...deck,
                    words: updatedWords,
                });
            } catch (err) {
                console.error('Error adding word:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to add word';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [deck]
    );

    /**
     * Delete a word from the deck
     */
    const deleteWord = useCallback(
        async (deckId: string, wordIndex: number) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            try {
                setError(null);

                const updatedWords = deck.words.filter((_, index) => index !== wordIndex);

                const deckRef = doc(db, 'decks', deckId);
                await updateDoc(deckRef, {
                    words: updatedWords,
                });

                // Update local state
                setDeck({
                    ...deck,
                    words: updatedWords,
                });
            } catch (err) {
                console.error('Error deleting word:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to delete word';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [deck]
    );

    /**
     * Update word accuracy based on guess-translation performance.
     */
    const updateWordAccuracy = useCallback(
        async (deckId: string, wordIndex: number, isCorrect: boolean) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            try {
                setError(null);

                const word = deck.words[wordIndex];

                if (!word) {
                    throw new Error('Word not found');
                }

                const accuracyDelta = isCorrect
                    ? CORRECT_ANSWER_DELTA
                    : -WRONG_ANSWER_DELTA;
                const updatedWords = applyAccuracyUpdates(deck.words, [
                    { wordIndex, delta: accuracyDelta },
                ]);

                await updateWordsSnapshot(deckId, updatedWords);
            } catch (err) {
                console.error('Error updating word accuracy:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to update accuracy';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [deck, updateWordsSnapshot]
    );

    const updateWordAccuracies = useCallback(
        async (deckId: string, updates: WordAccuracyUpdate[]) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            if (updates.length === 0) {
                return;
            }

            try {
                setError(null);
                const updatedWords = applyAccuracyUpdates(deck.words, updates);

                await updateWordsSnapshot(deckId, updatedWords);
            } catch (err) {
                console.error('Error updating word accuracies:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to update accuracies';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [deck, updateWordsSnapshot]
    );

    const submitStudyResults = useCallback(
        async ({ deckId, userId, languageCode, xpReward, updates }: SubmitStudyResultsParams) => {
            if (!db || !deck) {
                throw new Error('Firestore not initialized or deck not loaded');
            }

            try {
                setError(null);

                const updatedWords = applyAccuracyUpdates(deck.words, updates);

                await submitQuestResults({
                    userId,
                    deckId,
                    updatedWords,
                    languageCode,
                    xpReward,
                });

                setDeck({
                    ...deck,
                    words: updatedWords,
                });
            } catch (err) {
                console.error('Error submitting study results:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to submit study results';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [deck]
    );

    return {
        deck,
        loading,
        error,
        loadDeck,
        updateWord,
        addWord,
        deleteWord,
        updateWordAccuracy,
        updateWordAccuracies,
        submitStudyResults,
    };
}
