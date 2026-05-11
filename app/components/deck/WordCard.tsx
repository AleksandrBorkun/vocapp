"use client";

import { memo } from "react";
import { Word } from "@/lib/types";
import { Box, Button, Typography, IconButton, Switch } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { H4, H6, Span } from "../common/Headers";

interface WordCardProps {
  word: Word;
  index: number;
  showTranslation: boolean;
  onEdit: (index: number, word: Word) => void;
  onToggleTranslation?: (index: number) => void;
}

function WordCard({
  word,
  index,
  showTranslation,
  onEdit,
  onToggleTranslation,
}: WordCardProps) {
  return (
    <Button
      fullWidth
      onClick={(e) => {
        e.stopPropagation();
        onEdit(index, word);
      }}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderRadius: "10px",
        borderColor: "background.default",
        p: 2.5,
        display: "flex",
        alignItems: "center",
        gap: 2,
        textTransform: "none",
        "&:hover": {
          bgcolor: "background.paper",
          borderColor: "primary.main",
        },
      }}
    >
      {/* Word Content */}
      <Box sx={{ flex: 1, textAlign: "left", alignSelf: "flex-start" }}>
        {/* Word Header with Edit Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",

            // justifyContent: "space-between",
            // alignItems: "center",
            // mb: 0.5,
          }}
        >
          <H4
            variant="h4"
            text={word.word}
            textTransform={"capitalize"}
            fontWeight={600}
          />

          {/* </Typography> */}
          {/* <IconButton
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
          </IconButton> */}
        </Box>

        {/* Translation Toggle */}
        {/* <Box
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
        </Box> */}

        {/* Translation Display */}
        {showTranslation && (
          <H6
            sx={{ mt: 1 }}
            text={word.translation}
            textTransform={"capitalize"}
          />
        )}
      </Box>
      {/* Word Image */}
      <Box
        sx={{
          width: 110,
          height: 110,
          bgcolor: "primary.light",
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
    </Button>
  );
}

export default memo(WordCard);
