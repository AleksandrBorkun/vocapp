import { Word } from '@/lib/types';

export type IndexedWord = Word & {
    deckIndex: number;
};

export function shuffleArray<T>(items: T[]) {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[index],
        ];
    }

    return shuffled;
}

export function selectStudyWords(words: Word[], totalCount: number) {
    const indexedWords = words
        .map((word, index) => ({ ...word, deckIndex: index }))
        .filter((word) => word.word.trim() && word.translation.trim());

    const newWordsTarget = Math.floor(totalCount * 0.4);
    const learningWordsTarget = Math.floor(totalCount * 0.4);
    const repetitionWordsTarget = Math.max(
        totalCount - newWordsTarget - learningWordsTarget,
        0,
    );

    const selectedWords: IndexedWord[] = [];
    const newWords = shuffleArray(
        indexedWords.filter((word) => word.accuracy < 0.4),
    );
    const learningWords = shuffleArray(
        indexedWords.filter((word) => word.accuracy >= 0.4 && word.accuracy < 0.8),
    );
    const repetitionWords = shuffleArray(
        indexedWords.filter((word) => word.accuracy >= 0.8),
    );

    selectedWords.push(...newWords.slice(0, newWordsTarget));
    selectedWords.push(...learningWords.slice(0, learningWordsTarget));
    selectedWords.push(...repetitionWords.slice(0, repetitionWordsTarget));

    if (selectedWords.length < totalCount) {
        const selectedIndices = new Set(
            selectedWords.map((word) => word.deckIndex),
        );
        const remainingWords = shuffleArray(
            indexedWords.filter((word) => !selectedIndices.has(word.deckIndex)),
        );

        selectedWords.push(
            ...remainingWords.slice(0, totalCount - selectedWords.length),
        );
    }

    return shuffleArray(selectedWords.slice(0, totalCount));
}