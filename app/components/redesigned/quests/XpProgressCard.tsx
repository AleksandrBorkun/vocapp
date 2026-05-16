import { Card, CardContent, Stack, Typography } from "@mui/material";
import ProgressTrack from "@/app/components/redesigned/primitives/ProgressTrack";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import { XpProgressViewModel } from "./types";

interface XpProgressCardProps {
  data: XpProgressViewModel;
}

export default function XpProgressCard({ data }: XpProgressCardProps) {
  const progress = (data.currentXp / data.targetXp) * 100;

  return (
    <Card sx={{ mx: 3, mb: 2.5, borderRadius: 2.5 }}>
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.75 }}>
          <Typography
            variant="h3"
            sx={{ fontSize: 26, color: "text.primary", lineHeight: 1 }}
          >
            Level {data.level}{" "}
            <Typography
              component="span"
              sx={{ fontSize: 12, fontWeight: 400, color: "text.secondary" }}
            >
              {data.title}
            </Typography>
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            <Typography
              component="span"
              sx={{ color: redesignedPalette.accent.success, fontWeight: 700 }}
            >
              {data.currentXp}
            </Typography>{" "}
            / {data.targetXp} XP
          </Typography>
        </Stack>

        <ProgressTrack value={progress} fill={redesignedPalette.accent.success} />

        <Typography sx={{ mt: 1, fontSize: 12, color: redesignedPalette.text.muted }}>
          {data.remainingLabel}
        </Typography>
      </CardContent>
    </Card>
  );
}