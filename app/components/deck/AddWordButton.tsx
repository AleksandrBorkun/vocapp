"use client";

import { memo } from "react";
import { Box, Button, Typography } from "@mui/material";

interface AddWordButtonProps {
  onAddWord: () => void;
}

function AddWordButton({ onAddWord }: AddWordButtonProps) {
  return (
    <Button
      onClick={onAddWord}
      fullWidth
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        border: 1,
        borderColor: "secondary.main",
        p: 2.5,
        mb: 2,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 2,
        textTransform: "none",
        fontSize: "1.125rem",
        fontWeight: 500,
        "&:hover": {
          bgcolor: "background.paper",
          borderColor: "primary.main",
        },
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          bgcolor: "#4F6273",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
        }}
      >
        <Box component="span" sx={{ fontSize: "2.5rem" }}>
          ➕
        </Box>
      </Box>
      <Typography variant="h6" fontWeight={600} color="text.primary">
        Add Word
      </Typography>
    </Button>
  );
}

export default memo(AddWordButton);
