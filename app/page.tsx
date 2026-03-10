import Link from "next/link";
import { Box, Container, Typography, Button } from "@mui/material";
import {
  headerStyles,
  responsiveFontSizes,
  spacing,
} from "@/lib/constants/styles";
import HeroSection from "./components/landing/HeroSection";

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box component="header" sx={{ p: spacing.section }}>
        <Container maxWidth="lg" sx={headerStyles.container}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              fontSize: responsiveFontSizes.h3,
            }}
          >
            VocApp
          </Typography>
          <Link href="/login" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1,
                bgcolor: "primary.main",
                color: "text.primary",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "secondary.main",
                },
              }}
            >
              Login
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Hero Section with Features */}
      <HeroSection
        title="Learn New Words"
        highlightText="The Smart Way"
        description="Create custom flashcard sets and master new vocabulary at your own pace. Perfect for students, language learners, and anyone expanding their knowledge."
        ctaText="Get Started"
        ctaLink="/login"
      />

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          p: 3,
          textAlign: "center",
          color: "secondary.main",
          borderTop: 1,
          borderColor: "secondary.main",
        }}
      >
        <Typography variant="body2" sx={{ fontSize: responsiveFontSizes.body }}>
          © 2026 VocApp. Learn smarter, not harder.
        </Typography>
      </Box>
    </Box>
  );
}
