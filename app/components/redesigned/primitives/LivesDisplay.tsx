import { Box, Typography } from "@mui/material";

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
}

export default function LivesDisplay({
  lives,
  maxLives = 3,
}: LivesDisplayProps) {
  return (
    <Box sx={{ display: "inline-flex", gap: 0.375 }}>
      {Array.from({ length: maxLives }).map((_, index) => {
        const active = index < lives;

        return (
          <Typography
            key={`${index}-${active}`}
            component="span"
            sx={{
              fontSize: 14,
              opacity: active ? 1 : 0.2,
              filter: active ? "none" : "grayscale(1)",
            }}
          >
            ❤️
          </Typography>
        );
      })}
    </Box>
  );
}