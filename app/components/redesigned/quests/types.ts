import { RedesignedQuestTone } from "@/lib/redesigned/tokens";

export interface QuestsHeaderViewModel {
  dateLabel: string;
  languageLabel: string;
  greeting: string;
  streak: number;
  streakIcon?: string;
}

export interface XpProgressViewModel {
  level: number;
  title: string;
  currentXp: number;
  targetXp: number;
  remainingLabel: string;
}

export interface QuestCardViewModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  tone: RedesignedQuestTone;
  rewardXp: number;
  lives: number;
  maxLives?: number;
  ctaLabel?: string;
}

export interface CompletedQuestViewModel {
  id: string;
  name: string;
  rewardXp: number;
  completedAt: string;
}

export interface BottomTabItemViewModel {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}