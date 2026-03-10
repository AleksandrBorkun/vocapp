"use client";

import { memo } from "react";
import { Word } from "@/lib/types";
import { Box, Button, Typography, IconButton, Switch } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface WordCardProps {
  word: Word;
  index: number;
  showTranslation: boolean;
  onToggleTranslation: (index: number) => void;
  onEdit: (index: number, word: Word) => void;
}

function WordCard({
  word,
  index,
  showTranslation,
  onToggleTranslation,
  onEdit,
}: WordCardProps) {
  return (
    <Button
      fullWidth
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        border: 1,
        borderColor: "secondary.main",
        p: 2.5,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 2,
        textTransform: "none",
        "&:hover": {
          bgcolor: "background.paper",
          borderColor: "primary.main",
        },
      }}
    >
      {/* Word Image */}
      <Box
        sx={{
          width: 80,
          height: 80,
          bgcolor: "#4F6273",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
        {word.picture ? (
          <Box
            component="img"
            src={word.picture}
            alt={word.word}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 1,
            }}
          />
        ) : (
          <Box component="span" sx={{ fontSize: "2rem" }}>
            🖼️
          </Box>
        )}
      </Box>

      {/* Word Content */}
      <Box sx={{ flex: 1, textAlign: "left" }}>
        {/* Word Header with Edit Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {word.word}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index, word);
            }}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                bgcolor: "rgba(184, 202, 217, 0.1)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Translation Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.primary">
            Show Translation
          </Typography>
          <Switch
            checked={showTranslation}
            onChange={() => onToggleTranslation(index)}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#B8CAD9",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#B8CAD9",
              },
            }}
          />
        </Box>

        {/* Translation Display */}
        {showTranslation && (
          <Typography variant="body1" color="primary.main" sx={{ mt: 1 }}>
            {word.translation}
          </Typography>
        )}
      </Box>
    </Button>
  );
}

export default memo(WordCard);
