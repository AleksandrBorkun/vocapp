"use client";

import { Box, Typography } from "@mui/material";
import RedesignedScreenShell from "@/app/components/redesigned/primitives/RedesignedScreenShell";
import SectionLabel from "@/app/components/redesigned/primitives/SectionLabel";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import BottomTabBar from "./BottomTabBar";
import CompletedQuestCard from "./CompletedQuestCard";
import QuestCard from "./QuestCard";
import QuestsHeader from "./QuestsHeader";
import XpProgressCard from "./XpProgressCard";
import {
  BottomTabItemViewModel,
  CompletedQuestViewModel,
  QuestCardViewModel,
  QuestsHeaderViewModel,
  XpProgressViewModel,
} from "./types";

interface QuestsHomeScreenProps {
  header: QuestsHeaderViewModel;
  progress: XpProgressViewModel;
  quests: QuestCardViewModel[];
  completed: CompletedQuestViewModel[];
  tabs: BottomTabItemViewModel[];
  onQuestStart?: (questId: string) => void;
  onTabSelect?: (tabId: string) => void;
  emptyQuestMessage?: string | null;
  emptyCompletedMessage?: string | null;
}

export default function QuestsHomeScreen({
  header,
  progress,
  quests,
  completed,
  tabs,
  onQuestStart,
  onTabSelect,
  emptyQuestMessage,
  emptyCompletedMessage,
}: QuestsHomeScreenProps) {
  return (
    <RedesignedScreenShell
      footer={<BottomTabBar items={tabs} onSelect={onTabSelect} />}
    >
      <Box sx={{ pb: 2 }}>
        <QuestsHeader data={header} />
        <XpProgressCard data={progress} />

        <SectionLabel>Today&apos;s quests</SectionLabel>
        {quests.length > 0 ? (
          quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onStart={onQuestStart} />
          ))
        ) : (
          <Box
            sx={{
              mx: 3,
              mb: 1.5,
              px: 2.5,
              py: 2.25,
              borderRadius: 4,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.primary,
            }}
          >
            <Typography sx={{ color: redesignedPalette.text.secondary }}>
              {emptyQuestMessage ?? "No quests are available right now."}
            </Typography>
          </Box>
        )}

        <SectionLabel sx={{ pt: 0.5 }}>Completed today</SectionLabel>
        {completed.length > 0 ? (
          completed.map((item) => (
            <CompletedQuestCard key={item.id} item={item} />
          ))
        ) : (
          <Box
            sx={{
              mx: 3,
              px: 2.5,
              py: 2,
              borderRadius: 4,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.primary,
            }}
          >
            <Typography sx={{ color: redesignedPalette.text.secondary }}>
              {emptyCompletedMessage ?? "No quests completed yet today."}
            </Typography>
          </Box>
        )}
      </Box>
    </RedesignedScreenShell>
  );
}
