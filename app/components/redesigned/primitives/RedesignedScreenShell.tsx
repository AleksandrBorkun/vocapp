import { Box } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";
import { redesignedPalette } from "@/lib/redesigned/tokens";

interface RedesignedScreenShellProps extends PropsWithChildren {
  footer?: ReactNode;
}

export default function RedesignedScreenShell({
  children,
  footer,
}: RedesignedScreenShellProps) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        background:
          "radial-gradient(circle at top, rgba(200, 124, 59, 0.12), transparent 32%), radial-gradient(circle at bottom, rgba(82, 184, 106, 0.08), transparent 28%), #0f0d0a",
        px: { xs: 0, sm: 2 },
        py: { xs: 0, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100dvh",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: redesignedPalette.canvas,
          borderLeft: { sm: `1px solid ${redesignedPalette.border}` },
          borderRight: { sm: `1px solid ${redesignedPalette.border}` },
          boxShadow: { sm: "0 24px 80px rgba(0, 0, 0, 0.35)" },
        }}
      >
        <Box sx={{ flex: 1 }}>{children}</Box>
        {footer}
      </Box>
    </Box>
  );
}