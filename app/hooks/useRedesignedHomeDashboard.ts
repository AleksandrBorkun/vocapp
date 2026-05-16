"use client";

import {
    BottomTabItemViewModel,
    CompletedQuestViewModel,
    QuestCardViewModel,
    QuestsHeaderViewModel,
    XpProgressViewModel,
} from "@/app/components/redesigned/quests/types";
import { getUserDocument } from "@/lib/firebase";
import { Deck, LanguageQuestProgress, User } from "@/lib/types";
import {
    clearActiveDeckIdCookie,
    getActiveDeckIdCookie,
    setActiveDeckIdCookie,
} from "@/lib/utils/activeDeckCookie";
import {
    getLanguageName,
    normalizeLanguageCode,
} from "@/lib/utils/languageMapper";
import { User as FirebaseUser } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";

const XP_PER_LEVEL = 150;
const DEFAULT_PROGRESS: LanguageQuestProgress = {
    totalXp: 0,
    streak: 0,
    lastCompletedOn: null,
    updatedAt: null,
};

const QUESTS: QuestCardViewModel[] = [
    {
        id: "match-5",
        name: "Match 5",
        description: "Connect English words to their translations",
        icon: "🔗",
        tone: "match",
        rewardXp: 30,
        lives: 3,
    },
    {
        id: "build-word",
        name: "Build a Word",
        description: "Arrange the letters to spell the study word",
        icon: "🔤",
        tone: "build",
        rewardXp: 25,
        lives: 3,
    },
    {
        id: "guess-translation",
        name: "Guess Translation",
        description: "Choose the correct meaning for each study word",
        icon: "🃏",
        tone: "guess",
        rewardXp: 20,
        lives: 3,
    },
];

const TABS: Omit<BottomTabItemViewModel, "active">[] = [
    { id: "quests", label: "Quests", icon: "⚡" },
    { id: "decks", label: "Decks", icon: "🃏" },
    { id: "add", label: "Add", icon: "➕" },
    { id: "profile", label: "Profile", icon: "👤" },
];

export type RedesignedTabId = "quests" | "decks" | "add" | "profile";

export function getRedesignedTabs(
    activeTab: RedesignedTabId,
): BottomTabItemViewModel[] {
    return TABS.map((tab) => ({
        ...tab,
        active: tab.id === activeTab,
    }));
}

export interface RedesignedHomeDashboardState {
    loading: boolean;
    error: string | null;
    activeDeck: Deck | null;
    header: QuestsHeaderViewModel;
    progress: XpProgressViewModel;
    quests: QuestCardViewModel[];
    completed: CompletedQuestViewModel[];
    tabs: BottomTabItemViewModel[];
    emptyQuestMessage: string | null;
    emptyCompletedMessage: string | null;
}

function formatDateLabel(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
    }).format(date);
}

function formatGreeting(name: string, now: Date) {
    const hour = now.getHours();
    const salutation =
        hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const safeName = name.trim() || "there";

    return `${salutation}, ${safeName} 👋`;
}

function getLevelTitle(level: number) {
    if (level <= 2) {
        return "Beginner";
    }

    if (level <= 5) {
        return "Explorer";
    }

    if (level <= 8) {
        return "Intermediate";
    }

    if (level <= 12) {
        return "Advanced";
    }

    return "Expert";
}

function toProgressViewModel(progress: LanguageQuestProgress): XpProgressViewModel {
    const totalXp = Math.max(progress.totalXp, 0);
    const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
    const currentXp = totalXp % XP_PER_LEVEL;
    const remainingXp = XP_PER_LEVEL - currentXp;

    return {
        level,
        title: getLevelTitle(level),
        currentXp,
        targetXp: XP_PER_LEVEL,
        remainingLabel: `${remainingXp} XP to Level ${level + 1} - keep going!`,
    };
}

function resolveActiveDeck(decks: Deck[], preferredDeckId: string | null) {
    if (decks.length === 0) {
        return null;
    }

    return decks.find((deck) => deck.id === preferredDeckId) ?? decks[0];
}

function getLanguageProgress(userDoc: User | null, activeDeck: Deck | null) {
    if (!userDoc?.questProgress || !activeDeck?.study) {
        return DEFAULT_PROGRESS;
    }

    const languageCode = normalizeLanguageCode(activeDeck.study);

    return userDoc.questProgress[languageCode] ?? DEFAULT_PROGRESS;
}

export function useRedesignedHomeDashboard(
    user: FirebaseUser | null,
    decks: Deck[],
    decksReady: boolean,
): RedesignedHomeDashboardState {
    const [userDoc, setUserDoc] = useState<User | null>(null);
    const [preferredDeckId, setPreferredDeckId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setPreferredDeckId(getActiveDeckIdCookie());
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadUserDocument() {
            if (!user) {
                setUserDoc(null);
                setError(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const nextUserDoc = await getUserDocument(user.uid);

                if (cancelled) {
                    return;
                }

                setUserDoc(nextUserDoc);
            } catch (loadError) {
                if (cancelled) {
                    return;
                }

                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Failed to load home dashboard",
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadUserDocument();

        return () => {
            cancelled = true;
        };
    }, [user]);

    const activeDeck = useMemo(
        () => resolveActiveDeck(decks, preferredDeckId),
        [decks, preferredDeckId],
    );

    useEffect(() => {
        if (!decksReady) {
            return;
        }

        if (!activeDeck) {
            clearActiveDeckIdCookie();

            if (preferredDeckId !== null) {
                setPreferredDeckId(null);
            }

            return;
        }

        if (preferredDeckId !== activeDeck.id) {
            setActiveDeckIdCookie(activeDeck.id);
            setPreferredDeckId(activeDeck.id);
        }
    }, [activeDeck, decksReady, preferredDeckId]);

    const now = new Date();
    const profileName = userDoc?.name ?? user?.displayName ?? user?.email ?? "";
    const languageLabel = activeDeck
        ? getLanguageName(activeDeck.study)
        : "No active deck";
    const languageProgress = getLanguageProgress(userDoc, activeDeck);
    const quests = activeDeck ? QUESTS : [];

    return {
        loading,
        error,
        activeDeck,
        header: {
            dateLabel: formatDateLabel(now),
            languageLabel,
            greeting: formatGreeting(profileName, now),
            streak: languageProgress.streak,
        },
        progress: toProgressViewModel(languageProgress),
        quests,
        completed: [],
        tabs: getRedesignedTabs("quests"),
        emptyQuestMessage: activeDeck
            ? null
            : "Create or open a deck to start today's quests.",
        emptyCompletedMessage: "No quests completed yet today.",
    };
}