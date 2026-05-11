"use client";

import { memo } from "react";
import { Box, IconButton } from "@mui/material";
import theme from "@/lib/theme";

import HomeIcon from "@mui/icons-material/Home";
import AvatarIcon from "@mui/icons-material/AccountCircle";

interface DeckHeaderBarProps {
  onNavigateHome: () => void;
}

function DeckHeaderBar({ onNavigateHome }: DeckHeaderBarProps) {
  return (
    <Box
      sx={{
        bgcolor: theme.palette.primary.light,
        borderBottom: 1,
        borderColor: "primary.light",
        p: 2,
        paddingY: 0,
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
            <HomeIcon fontSize="large" color={"primary"} />
          </Box>
        </IconButton>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton sx={{ color: "text.primary" }}>
            <Box component="span" sx={{ fontSize: "1.5rem" }}>
              <AvatarIcon fontSize="large" color={"primary"} />
            </Box>
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default memo(DeckHeaderBar);
