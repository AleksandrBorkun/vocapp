import { Box, Container } from "@mui/material";
import { ReactNode } from "react";
import AppHeader from "./AppHeader";

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showSignOut?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  containerSx?: object;
}

/**
 * Standard page layout wrapper with header and content container
 * Provides consistent structure across application pages
 */
export default function PageLayout({
  children,
  showHeader = true,
  showSignOut = true,
  maxWidth = "lg",
  containerSx = {},
}: PageLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {showHeader && <AppHeader showSignOut={showSignOut} />}
      <Container
        component="main"
        maxWidth={maxWidth}
        sx={{ p: { xs: 2, sm: 3 }, ...containerSx }}
      >
        {children}
      </Container>
    </Box>
  );
}
