import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface PillBadgeProps {
  icon?: ReactNode;
  label: string;
  color: string;
  backgroundColor: string;
  borderColor?: string;
}

export default function PillBadge({
  icon,
  label,
  color,
  backgroundColor,
  borderColor,
}: PillBadgeProps) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        color,
        backgroundColor,
        border: `1px solid ${borderColor ?? backgroundColor}`,
      }}
    >
      {icon ? <Box sx={{ lineHeight: 1 }}>{icon}</Box> : null}
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{label}</Typography>
    </Box>
  );
}