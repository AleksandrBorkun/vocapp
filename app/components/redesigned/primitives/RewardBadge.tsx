import { Box, Typography } from "@mui/material";
import { redesignedPalette } from "@/lib/redesigned/tokens";

interface RewardBadgeProps {
  xp: number;
}

export default function RewardBadge({ xp }: RewardBadgeProps) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      <Typography
        component="span"
        sx={{ color: redesignedPalette.accent.success, fontSize: 13 }}
      >
        ⭐
      </Typography>
      <Typography
        component="span"
        sx={{
          color: redesignedPalette.accent.success,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        +{xp} XP
      </Typography>
    </Box>
  );
}