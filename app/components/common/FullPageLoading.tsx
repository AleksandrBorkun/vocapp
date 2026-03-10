import { Box, CircularProgress } from "@mui/material";
import { containerStyles } from "@/lib/constants/styles";

interface FullPageLoadingProps {
  size?: number;
}

/**
 * Full-page centered loading spinner
 * Used for initial page loads and authentication checks
 */
export default function FullPageLoading({ size = 60 }: FullPageLoadingProps) {
  return (
    <Box sx={containerStyles.fullPage}>
      <CircularProgress size={size} />
    </Box>
  );
}
