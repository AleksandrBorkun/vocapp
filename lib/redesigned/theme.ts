import { createTheme } from "@mui/material/styles";
import {
  redesignedFonts,
  redesignedPalette,
  redesignedQuestAccents,
  redesignedRadii,
} from "./tokens";

declare module "@mui/material/styles" {
  interface Theme {
    vocappRedesign: {
      palette: typeof redesignedPalette;
      questAccents: typeof redesignedQuestAccents;
      fonts: {
        body: string;
        display: string;
      };
      radii: typeof redesignedRadii;
    };
  }

  interface ThemeOptions {
    vocappRedesign?: {
      palette?: typeof redesignedPalette;
      questAccents?: typeof redesignedQuestAccents;
      fonts?: {
        body?: string;
        display?: string;
      };
      radii?: typeof redesignedRadii;
    };
  }
}

export function createRedesignedTheme(displayFontFamily: string) {
  return createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: redesignedPalette.accent.warm,
      },
      secondary: {
        main: redesignedPalette.text.secondary,
      },
      background: {
        default: redesignedPalette.canvas,
        paper: redesignedPalette.surface.primary,
      },
      text: {
        primary: redesignedPalette.text.primary,
        secondary: redesignedPalette.text.secondary,
      },
      success: {
        main: redesignedPalette.accent.success,
      },
      warning: {
        main: redesignedPalette.accent.gold,
      },
      error: {
        main: redesignedPalette.accent.danger,
      },
      divider: redesignedPalette.border,
    },
    shape: {
      borderRadius: redesignedRadii.medium,
    },
    spacing: 8,
    typography: {
      fontFamily: redesignedFonts.body,
      h1: {
        fontFamily: displayFontFamily,
        fontWeight: 300,
        letterSpacing: "-0.03em",
      },
      h2: {
        fontFamily: displayFontFamily,
        fontWeight: 300,
        letterSpacing: "-0.03em",
      },
      h3: {
        fontFamily: displayFontFamily,
        fontWeight: 400,
        letterSpacing: "-0.02em",
      },
      subtitle1: {
        color: redesignedPalette.text.secondary,
      },
      button: {
        fontWeight: 600,
        textTransform: "none",
        letterSpacing: "0.01em",
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: redesignedPalette.surface.primary,
            border: `1px solid ${redesignedPalette.border}`,
            boxShadow: "none",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: redesignedRadii.small,
          },
        },
      },
    },
    vocappRedesign: {
      palette: redesignedPalette,
      questAccents: redesignedQuestAccents,
      fonts: {
        body: redesignedFonts.body,
        display: displayFontFamily,
      },
      radii: redesignedRadii,
    },
  });
}