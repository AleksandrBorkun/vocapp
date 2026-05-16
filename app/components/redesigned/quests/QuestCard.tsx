"use client";

import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import LivesDisplay from "@/app/components/redesigned/primitives/LivesDisplay";
import RewardBadge from "@/app/components/redesigned/primitives/RewardBadge";
import { redesignedPalette, redesignedQuestAccents } from "@/lib/redesigned/tokens";
import { QuestCardViewModel } from "./types";

interface QuestCardProps {
  quest: QuestCardViewModel;
  onStart?: (questId: string) => void;
}

export default function QuestCard({ quest, onStart }: QuestCardProps) {
  const accent = redesignedQuestAccents[quest.tone];

  return (
    <Card
      sx={{
        mx: 3,
        mb: 1.5,
        overflow: "hidden",
        borderRadius: 2.5,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: 3,
          backgroundColor: accent.color,
        }}
      />
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.25 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              fontSize: 20,
              backgroundColor: accent.background,
            }}
          >
            {quest.icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", mb: 0.375 }}>
              {quest.name}
            </Typography>
            <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: "text.secondary" }}>
              {quest.description}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.75 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <RewardBadge xp={quest.rewardXp} />
            <LivesDisplay lives={quest.lives} maxLives={quest.maxLives} />
          </Stack>

          <Button
            onClick={() => onStart?.(quest.id)}
            sx={{
              minWidth: 96,
              px: 2,
              py: 1,
              color: redesignedPalette.text.primary,
              backgroundColor: redesignedPalette.surface.tertiary,
              border: `1px solid ${redesignedPalette.border}`,
              "&:hover": {
                backgroundColor: redesignedPalette.surface.secondary,
              },
            }}
          >
            {quest.ctaLabel ?? "Start →"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}