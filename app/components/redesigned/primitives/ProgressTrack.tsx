import { Box } from "@mui/material";

interface ProgressTrackProps {
  value: number;
  fill: string;
  track?: string;
}

export default function ProgressTrack({
  value,
  fill,
  track = "rgba(255, 255, 255, 0.06)",
}: ProgressTrackProps) {
  return (
    <Box
      sx={{
        width: "100%",
        height: 7,
        overflow: "hidden",
        borderRadius: 999,
        backgroundColor: track,
      }}
    >
      <Box
        sx={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${fill}, rgba(255,255,255,0.28))`,
        }}
      />
    </Box>
  );
}