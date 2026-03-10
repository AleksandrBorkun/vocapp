import React from "react";
import Link from "next/link";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { responsiveFontSizes, spacing } from "@/lib/constants/styles";
import FeatureCard from "./FeatureCard";

interface HeroSectionProps {
  title: string;
  highlightText: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * HeroSection displays the main landing page content including
 * the hero banner, call-to-action button, and feature cards.
 */
const HeroSection: React.FC<HeroSectionProps> = React.memo(
  ({ title, highlightText, description, ctaText, ctaLink }) => {
    return (
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: spacing.section,
          py: { xs: 6, sm: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: "bold",
              color: "text.primary",
              mb: 3,
              fontSize: responsiveFontSizes.hero,
            }}
          >
            {title}
            <Typography
              component="span"
              sx={{
                display: "block",
                color: "primary.main",
                mt: 1,
              }}
            >
              {highlightText}
            </Typography>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "secondary.main",
              mb: { xs: 4, sm: 6 },
              maxWidth: "42rem",
              mx: "auto",
              fontSize: responsiveFontSizes.h5,
            }}
          >
            {description}
          </Typography>

          <Link href={ctaLink} style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: { xs: 4, sm: 6 },
                py: { xs: 1.5, sm: 2 },
                bgcolor: "primary.main",
                color: "text.primary",
                fontSize: responsiveFontSizes.h5,
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "secondary.main",
                },
              }}
            >
              {ctaText}
            </Button>
          </Link>
        </Container>

        {/* Features */}
        <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 12 }, width: "100%" }}>
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            <FeatureCard
              icon="📚"
              title="Create Card Sets"
              description="Build your own flashcard collections for any subject or language"
            />
            <FeatureCard
              icon="🧠"
              title="Study Anytime"
              description="Practice on any device with our mobile-friendly interface"
            />
            <FeatureCard
              icon="📈"
              title="Track Progress"
              description="Monitor your learning journey and master new words efficiently"
            />
          </Grid>
        </Container>
      </Box>
    );
  },
);

HeroSection.displayName = "HeroSection";

export default HeroSection;
