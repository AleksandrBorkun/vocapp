import { RedesignedQuestTone } from "@/lib/redesigned/tokens";

export interface RedesignedQuestDefinition {
    id: string;
    routeSegment: string;
    name: string;
    description: string;
    icon: string;
    tone: RedesignedQuestTone;
    rewardXp: number;
    lives: number;
    maxLives?: number;
}

export const redesignedQuestDefinitions: RedesignedQuestDefinition[] = [
    {
        id: "match-5",
        routeSegment: "match-translation",
        name: "Match 5",
        description: "Connect English words to their translations",
        icon: "🔗",
        tone: "match",
        rewardXp: 30,
        lives: 3,
    },
    {
        id: "build-word",
        routeSegment: "build-word-game",
        name: "Build a Word",
        description: "Arrange the letters to spell the study word",
        icon: "🔤",
        tone: "build",
        rewardXp: 25,
        lives: 3,
    },
    {
        id: "guess-translation",
        routeSegment: "guess-translation",
        name: "Guess Translation",
        description: "Choose the correct meaning for each study word",
        icon: "🃏",
        tone: "guess",
        rewardXp: 20,
        lives: 3,
    },
];

export function getRedesignedQuestById(questId: string) {
    return redesignedQuestDefinitions.find((quest) => quest.id === questId) ?? null;
}

export function getRedesignedQuestByRoute(routeSegment: string) {
    return (
        redesignedQuestDefinitions.find(
            (quest) => quest.routeSegment === routeSegment,
        ) ?? null
    );
}