export const redesignedPalette = {
  canvas: "#0f0d0a",
  surface: {
    primary: "#1a1713",
    secondary: "#232018",
    tertiary: "#2c2920",
  },
  text: {
    primary: "#ede8d4",
    secondary: "#9a8f79",
    muted: "#5a5448",
  },
  border: "#2d2921",
  accent: {
    warm: "#c87c3b",
    success: "#52b86a",
    gold: "#e0a83c",
    danger: "#d44e3c",
  },
  accentBackground: {
    warm: "rgba(200, 124, 59, 0.14)",
    success: "rgba(82, 184, 106, 0.13)",
    gold: "rgba(224, 168, 60, 0.14)",
    danger: "rgba(212, 78, 60, 0.13)",
  },
} as const;

export const redesignedFonts = {
  body:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
  displayFallback: 'Fraunces, Georgia, serif',
} as const;

export const redesignedRadii = {
  pill: 999,
  large: 20,
  medium: 16,
  small: 12,
} as const;

export const redesignedSpacing = {
  pageX: 3,
  sectionGap: 2.5,
  cardPadding: 2.25,
} as const;

export const redesignedQuestAccents = {
  match: {
    color: redesignedPalette.accent.warm,
    background: redesignedPalette.accentBackground.warm,
  },
  build: {
    color: redesignedPalette.accent.success,
    background: redesignedPalette.accentBackground.success,
  },
  guess: {
    color: redesignedPalette.accent.gold,
    background: redesignedPalette.accentBackground.gold,
  },
} as const;

export type RedesignedQuestTone = keyof typeof redesignedQuestAccents;