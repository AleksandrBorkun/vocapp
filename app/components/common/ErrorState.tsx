import { memo } from "react";
import { useRouter } from "next/navigation";
import { Box, Card, Typography, Button } from "@mui/material";
import { containerStyles, cardStyles } from "@/lib/constants/styles";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  showBackToLogin?: boolean;
}

/**
 * Full-page error display with retry and navigation options
 * Provides consistent error messaging across the application
 */
function ErrorState({
  error,
  onRetry,
  showBackToLogin = true,
}: ErrorStateProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <Box
      sx={{
        ...containerStyles.fullPage,
        p: 2,
      }}
    >
      <Card
        sx={{
          ...cardStyles.base,
          p: 4,
          borderColor: "error.main",
          maxWidth: "md",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="error" mb={2}>
          Error
        </Typography>
        <Typography color="text.primary" mb={3}>
          {error}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button onClick={handleRetry} variant="contained" sx={{ flex: 1 }}>
            Retry
          </Button>
          {showBackToLogin && (
            <Button
              onClick={() => router.push("/login")}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              Back to Login
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default memo(ErrorState);
