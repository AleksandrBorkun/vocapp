import { Box, Typography } from "@mui/material";
import PillBadge from "@/app/components/redesigned/primitives/PillBadge";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import { QuestsHeaderViewModel } from "./types";

interface QuestsHeaderProps {
  data: QuestsHeaderViewModel;
}

export default function QuestsHeader({ data }: QuestsHeaderProps) {
  return (
    <Box
      sx={{
        px: 3,
        pt: 3,
        pb: 2,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>
          {data.dateLabel} · {data.languageLabel}
        </Typography>
        <Typography
          variant="h3"
          sx={{ fontSize: 30, lineHeight: 1.1, color: "text.primary" }}
        >
          {data.greeting}
        </Typography>
      </Box>

      <PillBadge
        icon={<span>{data.streakIcon ?? "🔥"}</span>}
        label={String(data.streak)}
        color={redesignedPalette.accent.gold}
        backgroundColor={redesignedPalette.accentBackground.gold}
        borderColor="rgba(224, 168, 60, 0.25)"
      />
    </Box>
  );
}