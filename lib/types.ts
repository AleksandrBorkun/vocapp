export interface User {
    vocabIDs: string[];
    nativeLanguage: string; // language code e.g. "en", "es", "fr"
    name: string;
    tier: "free" | "paid";
}

export interface CardSet {
    id: string;
    name: string;
    description: string;
    cards: Card[];
    userId: string;
    createdAt: Date;
}

export interface Card {
    front: string;
    back: string;
}
