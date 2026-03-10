import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import {
  cardStyles,
  responsiveFontSizes,
  spacing,
} from "@/lib/constants/styles";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

/**
 * FeatureCard displays a single feature with icon, title, and description.
 * Used on the landing page to showcase app features.
 */
const FeatureCard: React.FC<FeatureCardProps> = React.memo(
  ({ icon, title, description }) => {
    return (
      <Grid item xs={12} sm={4}>
        <Card
          sx={{
            ...cardStyles.base,
            p: { xs: 3, sm: 4 },
            height: "100%",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: "2rem", sm: "2.5rem" },
                mb: 2,
              }}
            >
              {icon}
            </Typography>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 1,
                fontSize: responsiveFontSizes.h5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "secondary.main",
                fontSize: responsiveFontSizes.body,
              }}
            >
              {description}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  },
);

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;
