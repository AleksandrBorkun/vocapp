export interface LanguageQuestProgress {
    totalXp: number;
    streak: number;
    lastCompletedOn?: string | null;
    updatedAt?: string | null;
}

export type QuestProgressByLanguage = Record<string, LanguageQuestProgress>;

export interface User {
    vocabIDs: string[];
    nativeLanguage: string; // language code e.g. "en", "es", "fr"
    name: string;
    tier: "free" | "paid";
    questProgress?: QuestProgressByLanguage;
}

export interface Deck {
    id: string;
    name: string;
    description: string;
    study: string; // Language code to study e.g. "DK", "ES"
    language: string; // Native language code e.g. "EN", "ES"
    words: Word[];
    createdAt: Date;
}

export interface Word {
    word: string; // Word to study
    translation: string;
    example?: string; // Sentence where word is used
    picture?: string; // Image URL from Pixabay
    accuracy: number; // Number from 0 to 1, shows how often you guess correctly
}
