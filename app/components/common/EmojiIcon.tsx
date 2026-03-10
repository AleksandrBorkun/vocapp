import { memo } from "react";
import { Box, SxProps, Theme } from "@mui/material";

interface EmojiIconProps {
  emoji: string;
  size?: string | number;
  sx?: SxProps<Theme>;
}

/**
 * Wrapper component for consistent emoji display
 * Provides standardized sizing and styling
 */
function EmojiIcon({ emoji, size = "1.5rem", sx }: EmojiIconProps) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: size,
        display: "inline-block",
        ...sx,
      }}
    >
      {emoji}
    </Box>
  );
}

export default memo(EmojiIcon);
