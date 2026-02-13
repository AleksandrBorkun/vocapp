export interface User {
    vocabIDs: string[];
    nativeLanguage: string; // language code e.g. "en", "es", "fr"
    name: string;
    tier: "free" | "paid";
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
    picture?: string; // Base64 encoded image
    accuracy: number; // Number from 0 to 1, shows how often you guess correctly
}
