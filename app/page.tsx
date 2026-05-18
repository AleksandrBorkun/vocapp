import Link from "next/link";
import { Box, Container, Typography, Button } from "@mui/material";
import {
  headerStyles,
  responsiveFontSizes,
  spacing,
} from "@/lib/constants/styles";
import { getTranslation } from "@/lib/translations";
import HeroSection from "./components/landing/HeroSection";

export default function Home() {
  const features = [
    {
      icon: "📚",
      title: getTranslation("landing.features.createSets.title"),
      description: getTranslation("landing.features.createSets.description"),
    },
    {
      icon: "🧠",
      title: getTranslation("landing.features.studyAnytime.title"),
      description: getTranslation("landing.features.studyAnytime.description"),
    },
    {
      icon: "📈",
      title: getTranslation("landing.features.trackProgress.title"),
      description: getTranslation("landing.features.trackProgress.description"),
    },
  ];

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
            {getTranslation("landing.appName")}
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
              {getTranslation("landing.header.login")}
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Hero Section with Features */}
      <HeroSection
        title={getTranslation("landing.hero.title")}
        highlightText={getTranslation("landing.hero.highlight")}
        description={getTranslation("landing.hero.description")}
        ctaText={getTranslation("landing.hero.cta")}
        ctaLink="/login"
        features={features}
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
          {getTranslation("landing.footer.tagline")}
        </Typography>
      </Box>
    </Box>
  );
}
