"use client";

import { Fraunces } from "next/font/google";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { PropsWithChildren, useMemo } from "react";
import { createRedesignedTheme } from "@/lib/redesigned/theme";
import { redesignedFonts, redesignedPalette } from "@/lib/redesigned/tokens";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export default function RedesignedThemeProvider({
  children,
}: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createRedesignedTheme(
        `${fraunces.style.fontFamily}, ${redesignedFonts.displayFallback}`,
      ),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline
        enableColorScheme
        sx={{
          minHeight: "100%",
          backgroundColor: redesignedPalette.canvas,
          color: redesignedPalette.text.primary,
          fontFamily: redesignedFonts.body,
        }}
      >
        {children}
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}