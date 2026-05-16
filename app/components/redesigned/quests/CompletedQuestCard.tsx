import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import { CompletedQuestViewModel } from "./types";

interface CompletedQuestCardProps {
  item: CompletedQuestViewModel;
}

export default function CompletedQuestCard({ item }: CompletedQuestCardProps) {
  return (
    <Card sx={{ mx: 3, mb: 1.5, borderRadius: 2 }}>
      <CardContent sx={{ p: 1.75, opacity: 0.7, "&:last-child": { pb: 1.75 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: 1.25,
              display: "grid",
              placeItems: "center",
              fontSize: 16,
              color: redesignedPalette.accent.success,
              backgroundColor: redesignedPalette.accentBackground.success,
            }}
          >
            ✓
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
              {item.name}
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                fontWeight: 700,
                color: redesignedPalette.accent.success,
              }}
            >
              +{item.rewardXp} XP earned
            </Typography>
          </Box>

          <Typography sx={{ fontSize: 12, color: redesignedPalette.text.muted }}>
            {item.completedAt}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}