import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { headerStyles, responsiveFontSizes } from "@/lib/constants/styles";

interface AppHeaderProps {
  showSignOut?: boolean;
}

/**
 * Application header with logo and optional sign out button
 * Provides consistent navigation across authenticated pages
 */
export default function AppHeader({ showSignOut = true }: AppHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Box component="header" sx={headerStyles.base}>
      <Container maxWidth="lg" sx={headerStyles.container}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          color="text.primary"
          sx={{ fontSize: responsiveFontSizes.h3 }}
        >
          VocApp
        </Typography>
        {showSignOut && (
          <Button
            onClick={handleSignOut}
            color="inherit"
            sx={{
              color: "text.primary",
              "&:hover": { color: "primary.main" },
              fontSize: responsiveFontSizes.body,
            }}
          >
            Sign Out
          </Button>
        )}
      </Container>
    </Box>
  );
}
