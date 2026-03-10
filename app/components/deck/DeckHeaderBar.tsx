"use client";

import { memo } from "react";
import { Box, IconButton } from "@mui/material";

interface DeckHeaderBarProps {
  onNavigateHome: () => void;
}

function DeckHeaderBar({ onNavigateHome }: DeckHeaderBarProps) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "secondary.main",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "600px",
          mx: "auto",
        }}
      >
        <IconButton onClick={onNavigateHome} sx={{ color: "text.primary" }}>
          <Box component="span" sx={{ fontSize: "1.5rem" }}>
            🏠
          </Box>
        </IconButton>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton sx={{ color: "text.primary" }}>
            <Box component="span" sx={{ fontSize: "1.5rem" }}>
              🔍
            </Box>
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(DeckHeaderBar);
