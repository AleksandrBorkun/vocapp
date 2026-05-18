import Link from "next/link";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import {
  redesignedFonts,
  redesignedPalette,
  redesignedRadii,
} from "@/lib/redesigned/tokens";
import { getTranslation } from "@/lib/translations";
import LandingInstallButtons from "./LandingInstallButtons";

const sectionPaddingX = { xs: 3, md: 6 };
const sectionPaddingY = { xs: 10, md: 15 };

const stats = [
  {
    value: "40+",
    label: getTranslation("landing.stats.languages"),
    color: redesignedPalette.accent.warm,
  },
  { value: "3", label: getTranslation("landing.stats.gameModes") },
  {
    value: "INF",
    label: getTranslation("landing.stats.scanWords"),
    color: redesignedPalette.accent.success,
  },
  { value: "1", label: getTranslation("landing.stats.activeLanguage") },
];

const languageDecks = [
  {
    pair: "EN > ES",
    label: getTranslation("landing.languages.deck.enEs"),
    active: true,
  },
  { pair: "EN > DA", label: getTranslation("landing.languages.deck.enDa") },
  { pair: "EN > JA", label: getTranslation("landing.languages.deck.enJa") },
  { pair: "EN > DE", label: getTranslation("landing.languages.deck.enDe") },
  { pair: "EN > AR", label: getTranslation("landing.languages.deck.enAr") },
];

function BrandMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <rect width="28" height="28" rx="7" fill="#0f0d0a" />
      <ellipse cx="14" cy="14" rx="9.5" ry="11" fill="#2a5535" />
      <ellipse cx="14" cy="14" rx="6.5" ry="8.5" fill="#c8d97a" />
      <ellipse cx="14" cy="14.8" rx="3.2" ry="3.8" fill="#c87c3b" />
    </svg>
  );
}

function SectionHeading({
  kicker,
  title,
  emphasis,
  body,
}: {
  kicker: string;
  title: string;
  emphasis: string;
  body: string;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: redesignedPalette.accent.warm,
          fontWeight: 600,
          mb: 2,
        }}
      >
        {kicker}
      </Typography>
      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
          fontSize: { xs: "2.4rem", md: "3.6rem" },
          fontWeight: 300,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: redesignedPalette.text.primary,
          maxWidth: 620,
          mb: 2.5,
        }}
      >
        {title}
        <br />
        <Box
          component="em"
          sx={{ fontStyle: "italic", color: redesignedPalette.text.secondary }}
        >
          {emphasis}
        </Box>
      </Typography>
      <Typography
        sx={{
          maxWidth: 500,
          fontSize: 17,
          lineHeight: 1.65,
          color: redesignedPalette.text.secondary,
        }}
      >
        {body}
      </Typography>
    </Box>
  );
}

function PhoneQuestCard({
  iconLabel,
  title,
  xp,
  tone,
  hearts,
}: {
  iconLabel: string;
  title: string;
  xp: string;
  tone: string;
  hearts: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        border: `1px solid ${redesignedPalette.border}`,
        backgroundColor: redesignedPalette.surface.secondary,
        borderRadius: 1.5,
        px: 1.75,
        py: 1.5,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          fontSize: 12,
          fontWeight: 700,
          color: tone,
          backgroundColor:
            tone === redesignedPalette.accent.success
              ? redesignedPalette.accentBackground.success
              : tone === redesignedPalette.accent.gold
                ? redesignedPalette.accentBackground.gold
                : redesignedPalette.accentBackground.warm,
        }}
      >
        {iconLabel}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: redesignedPalette.text.primary,
            mb: 0.25,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 10, color: redesignedPalette.text.muted }}>
          {xp}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 11, color: redesignedPalette.text.primary }}>
        {hearts}
      </Typography>
    </Box>
  );
}

function HeroPhoneMockup() {
  return (
    <Box sx={{ mt: { xs: 7, md: 10 }, position: "relative", zIndex: 1 }}>
      <Box
        sx={{
          width: 260,
          mx: "auto",
          borderRadius: "38px",
          border: "7px solid #1c1c22",
          backgroundColor: "#0a0a0c",
          overflow: "hidden",
          position: "relative",
          boxShadow:
            "0 48px 120px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.05), 0 0 80px rgba(200,124,59,0.12)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 84,
            height: 25,
            backgroundColor: "#000",
            borderRadius: "14px",
            zIndex: 2,
          }}
        />
        <Box
          sx={{
            height: 540,
            backgroundColor: redesignedPalette.canvas,
            px: 2.5,
            pt: 6.5,
            pb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
              fontSize: 17,
              fontWeight: 300,
            }}
          >
            Tuesday, 13 May
          </Typography>
          <Typography
            sx={{
              mt: -0.75,
              fontSize: 11,
              color: redesignedPalette.text.muted,
            }}
          >
            Spanish / Level 8
          </Typography>

          <Box
            sx={{
              borderRadius: 1.5,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.secondary,
              px: 1.75,
              py: 1.5,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  color: redesignedPalette.text.muted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Daily XP
              </Typography>
              <Typography
                sx={{
                  fontSize: 11,
                  color: redesignedPalette.accent.warm,
                  fontWeight: 600,
                }}
              >
                840 / 1200
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 4,
                borderRadius: 99,
                backgroundColor: redesignedPalette.surface.tertiary,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: "68%",
                  height: "100%",
                  backgroundColor: redesignedPalette.accent.warm,
                }}
              />
            </Box>
          </Box>

          <Typography
            sx={{
              fontSize: 10,
              color: redesignedPalette.text.muted,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Today&apos;s quests
          </Typography>

          <PhoneQuestCard
            iconLabel="M5"
            title="Match 5 pairs"
            xp="+80 XP"
            tone={redesignedPalette.accent.warm}
            hearts="OOO"
          />
          <PhoneQuestCard
            iconLabel="BW"
            title="Build a word"
            xp="+60 XP"
            tone={redesignedPalette.accent.success}
            hearts="OO."
          />
          <PhoneQuestCard
            iconLabel="GT"
            title="Guess translation"
            xp="+100 XP"
            tone={redesignedPalette.accent.gold}
            hearts="OOO"
          />

          <Stack
            direction="row"
            justifyContent="space-around"
            sx={{
              mt: "auto",
              pt: 1,
              borderTop: `1px solid ${redesignedPalette.border}`,
            }}
          >
            <Typography sx={{ fontSize: 18, opacity: 0.4 }}>HM</Typography>
            <Typography
              sx={{ fontSize: 18, color: redesignedPalette.accent.warm }}
            >
              QS
            </Typography>
            <Typography sx={{ fontSize: 18, opacity: 0.4 }}>DK</Typography>
            <Typography sx={{ fontSize: 18, opacity: 0.4 }}>PF</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function FeatureSection({
  id,
  reverse,
  heading,
  details,
  visual,
}: {
  id: string;
  reverse?: boolean;
  heading: React.ReactNode;
  details?: string;
  visual: React.ReactNode;
}) {
  return (
    <Box sx={{ borderTop: `1px solid ${redesignedPalette.border}` }} id={id}>
      <Container
        maxWidth="lg"
        sx={{ px: sectionPaddingX, py: sectionPaddingY }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap: { xs: 6, md: 10 },
            alignItems: "center",
          }}
        >
          <Box sx={{ order: { xs: 1, md: reverse ? 2 : 1 } }}>
            {heading}
            {details ? (
              <Typography
                sx={{
                  mt: 4,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: redesignedPalette.text.muted,
                  maxWidth: 500,
                }}
              >
                {details}
              </Typography>
            ) : null}
          </Box>
          <Box sx={{ order: { xs: 2, md: reverse ? 1 : 2 } }}>{visual}</Box>
        </Box>
      </Container>
    </Box>
  );
}

function ScanVisual() {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: `${redesignedRadii.large}px`,
        border: `1px solid ${redesignedPalette.border}`,
        backgroundColor: "#161310",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          position: "relative",
          minHeight: 280,
          borderRadius: 1.5,
          backgroundColor: "#1c1b17",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          px: 3,
        }}
      >
        {[
          {
            top: 12,
            left: 12,
            borderWidth: "2px 0 0 2px",
            borderRadius: "3px 0 0 0",
          },
          {
            top: 12,
            right: 12,
            borderWidth: "2px 2px 0 0",
            borderRadius: "0 3px 0 0",
          },
          {
            bottom: 12,
            left: 12,
            borderWidth: "0 0 2px 2px",
            borderRadius: "0 0 0 3px",
          },
          {
            bottom: 12,
            right: 12,
            borderWidth: "0 2px 2px 0",
            borderRadius: "0 0 3px 0",
          },
        ].map((corner, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              width: 22,
              height: 22,
              borderStyle: "solid",
              borderColor: redesignedPalette.accent.warm,
              ...corner,
            }}
          />
        ))}
        <Typography
          sx={{
            width: "85%",
            fontSize: 12,
            lineHeight: 1.8,
            color: "#7a7060",
            fontFamily: "Georgia, serif",
          }}
        >
          El menu del dia incluye{" "}
          <Box
            component="span"
            sx={{
              px: 0.5,
              py: 0.125,
              color: redesignedPalette.accent.warm,
              backgroundColor: "rgba(200,124,59,0.22)",
              borderBottom: `1.5px solid ${redesignedPalette.accent.warm}`,
              borderRadius: "3px",
            }}
          >
            sopa
          </Box>{" "}
          de{" "}
          <Box
            component="span"
            sx={{
              px: 0.5,
              py: 0.125,
              color: redesignedPalette.accent.warm,
              backgroundColor: "rgba(200,124,59,0.22)",
              borderBottom: `1.5px solid ${redesignedPalette.accent.warm}`,
              borderRadius: "3px",
            }}
          >
            lentejas
          </Box>{" "}
          con pan,{" "}
          <Box
            component="span"
            sx={{
              px: 0.5,
              py: 0.125,
              color: redesignedPalette.accent.warm,
              backgroundColor: "rgba(200,124,59,0.22)",
              borderBottom: `1.5px solid ${redesignedPalette.accent.warm}`,
              borderRadius: "3px",
            }}
          >
            pollo
          </Box>{" "}
          asado con patatas y ensalada, y de postre{" "}
          <Box
            component="span"
            sx={{
              px: 0.5,
              py: 0.125,
              color: redesignedPalette.accent.warm,
              backgroundColor: "rgba(200,124,59,0.22)",
              borderBottom: `1.5px solid ${redesignedPalette.accent.warm}`,
              borderRadius: "3px",
            }}
          >
            flan
          </Box>{" "}
          casero.
        </Typography>
        <Typography
          sx={{
            position: "absolute",
            right: 10,
            bottom: 10,
            fontSize: 10,
            color: redesignedPalette.text.muted,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          4 words selected
        </Typography>
      </Box>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
        {[
          "sopa / soup",
          "lentejas / lentils",
          "pollo / chicken",
          "flan / custard",
        ].map((chip) => (
          <Box
            key={chip}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 99,
              border: `1px solid ${redesignedPalette.accent.warm}`,
              backgroundColor: redesignedPalette.accentBackground.warm,
              color: redesignedPalette.accent.warm,
              fontSize: 12,
            }}
          >
            + {chip}
          </Box>
        ))}
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 99,
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: redesignedPalette.surface.secondary,
            color: redesignedPalette.text.secondary,
            fontSize: 12,
          }}
        >
          patatas
        </Box>
      </Stack>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderRadius: 1.5,
          border: `1px solid ${redesignedPalette.border}`,
          backgroundColor: redesignedPalette.surface.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: redesignedPalette.text.primary,
            }}
          >
            Add to Spanish deck
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: redesignedPalette.text.muted }}
          >
            4 new words
          </Typography>
        </Box>
        <Button
          type="button"
          variant="contained"
          sx={{
            minWidth: 0,
            px: 1.75,
            py: 0.75,
            borderRadius: 1,
            backgroundColor: redesignedPalette.accent.warm,
            color: "#fff",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#a36228",
              boxShadow: "none",
            },
          }}
        >
          Add all
        </Button>
      </Box>
    </Box>
  );
}

function GamesVisual() {
  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            p: 3,
            borderRadius: `${redesignedRadii.large}px`,
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: "#161310",
          }}
        >
          <Typography
            sx={{
              mb: 1.25,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: redesignedPalette.accent.warm,
              fontWeight: 600,
            }}
          >
            Match pairs
          </Typography>
          <Typography
            sx={{
              mb: 2,
              fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
              fontSize: 20,
              fontWeight: 300,
            }}
          >
            Match 5
          </Typography>
          <Typography sx={{ mb: 1.5, fontSize: 13 }}>OO.</Typography>
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75 }}
          >
            {[
              ["butterfly", true, false],
              ["mariposa", true, false],
              ["sunset", false, true],
              ["atardecer", false, false],
              ["window", false, false],
              ["atardecer", false, true],
            ].map(([label, matched, selected], index) => (
              <Box
                key={`${label}-${index}`}
                sx={{
                  borderRadius: 1,
                  border: `1px solid ${matched ? redesignedPalette.accent.success : selected ? redesignedPalette.accent.warm : redesignedPalette.border}`,
                  backgroundColor: matched
                    ? redesignedPalette.accentBackground.success
                    : selected
                      ? redesignedPalette.accentBackground.warm
                      : redesignedPalette.surface.secondary,
                  color: matched
                    ? redesignedPalette.accent.success
                    : selected
                      ? redesignedPalette.accent.warm
                      : redesignedPalette.text.secondary,
                  px: 1.25,
                  py: 1,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            p: 3,
            borderRadius: `${redesignedRadii.large}px`,
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: "#161310",
          }}
        >
          <Typography
            sx={{
              mb: 1.25,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: redesignedPalette.accent.success,
              fontWeight: 600,
            }}
          >
            Build a word
          </Typography>
          <Typography
            sx={{
              mb: 2,
              fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
              fontSize: 20,
              fontWeight: 300,
            }}
          >
            mariposa
          </Typography>
          <Typography sx={{ mb: 1.5, fontSize: 13 }}>OOO</Typography>
          <Stack
            direction="row"
            spacing={0.625}
            sx={{
              mb: 1.25,
              pb: 0.75,
              borderBottom: `2px solid ${redesignedPalette.border}`,
            }}
          >
            {["m", "a", "r", "i", "", "", "", ""].map((letter, index) => (
              <Box
                key={index}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 0.75,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: redesignedPalette.text.primary,
                  backgroundColor: letter
                    ? redesignedPalette.surface.tertiary
                    : "transparent",
                  border: letter
                    ? "none"
                    : `1px dashed ${redesignedPalette.border}`,
                }}
              >
                {letter}
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={0.625} flexWrap="wrap" useFlexGap>
            {[
              ["m", true],
              ["a", true],
              ["r", true],
              ["i", true],
              ["p", false],
              ["o", false],
              ["s", false],
              ["a", false],
            ].map(([letter, used], index) => (
              <Box
                key={`${letter}-${index}`}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 0.75,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: redesignedPalette.text.primary,
                  border: `1px solid ${redesignedPalette.border}`,
                  backgroundColor: redesignedPalette.surface.secondary,
                  opacity: used ? 0.2 : 1,
                }}
              >
                {letter}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      <Box
        sx={{
          p: 3,
          borderRadius: `${redesignedRadii.large}px`,
          border: `1px solid ${redesignedPalette.border}`,
          backgroundColor: "#161310",
        }}
      >
        <Typography
          sx={{
            mb: 1.25,
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: redesignedPalette.accent.gold,
            fontWeight: 600,
          }}
        >
          Guess translation
        </Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.75 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
              fontSize: 20,
              fontWeight: 300,
            }}
          >
            atardecer
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: redesignedPalette.text.muted }}
          >
            3 / 8
          </Typography>
        </Stack>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 0.875,
          }}
        >
          {[
            [
              "sunset",
              redesignedPalette.accent.success,
              redesignedPalette.accentBackground.success,
            ],
            [
              "sunrise",
              redesignedPalette.border,
              redesignedPalette.surface.secondary,
            ],
            [
              "evening",
              redesignedPalette.accent.danger,
              redesignedPalette.accentBackground.danger,
            ],
            [
              "twilight",
              redesignedPalette.border,
              redesignedPalette.surface.secondary,
            ],
          ].map(([label, borderColor, backgroundColor]) => (
            <Box
              key={String(label)}
              sx={{
                borderRadius: 1.25,
                border: `1px solid ${String(borderColor)}`,
                backgroundColor: String(backgroundColor),
                px: 1.5,
                py: 1.25,
                fontSize: 13,
                color:
                  label === "sunset"
                    ? redesignedPalette.accent.success
                    : label === "evening"
                      ? redesignedPalette.accent.danger
                      : redesignedPalette.text.secondary,
                fontWeight: label === "sunset" ? 600 : 500,
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

function SharingVisual() {
  return (
    <Stack
      spacing={2}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: `${redesignedRadii.large}px`,
        border: `1px solid ${redesignedPalette.border}`,
        backgroundColor: "#161310",
      }}
    >
      <Box
        sx={{
          borderRadius: 1.75,
          border: `1px solid ${redesignedPalette.border}`,
          backgroundColor: redesignedPalette.surface.secondary,
          px: 2.5,
          py: 2.25,
        }}
      >
        <Typography sx={{ mb: 1.25, fontSize: 28 }}>ES</Typography>
        <Typography
          sx={{
            mb: 0.5,
            fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
            fontSize: 22,
            fontWeight: 300,
          }}
        >
          Spanish
        </Typography>
        <Typography sx={{ fontSize: 13, color: redesignedPalette.text.muted }}>
          47 words / 62% mastered
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            height: 3,
            borderRadius: 99,
            backgroundColor: redesignedPalette.surface.tertiary,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: "62%",
              height: "100%",
              backgroundColor: redesignedPalette.accent.warm,
            }}
          />
        </Box>
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Stack direction="row" sx={{ pr: 1 }}>
            {[
              ["A", "#2a4a1e", redesignedPalette.accent.success],
              ["M", "#1e2a4a", "#5b86c8"],
              ["L", "#3a1e2a", "#c85b8a"],
            ].map(([label, backgroundColor, color], index) => (
              <Box
                key={String(label)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: String(color),
                  backgroundColor: String(backgroundColor),
                  border: `2px solid #161310`,
                  ml: index === 0 ? 0 : -1,
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>
          <Typography
            sx={{ fontSize: 13, color: redesignedPalette.text.secondary }}
          >
            Alex, Maria and Lena are learning this deck
          </Typography>
        </Stack>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          type="button"
          variant="contained"
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 1.5,
            backgroundColor: redesignedPalette.accent.warm,
            color: "#fff",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#a36228",
              boxShadow: "none",
            },
          }}
        >
          Share deck
        </Button>
        <Button
          type="button"
          variant="outlined"
          sx={{
            flex: 1,
            py: 1.5,
            borderRadius: 1.5,
            borderColor: redesignedPalette.border,
            color: redesignedPalette.text.secondary,
            backgroundColor: redesignedPalette.surface.secondary,
            "&:hover": {
              borderColor: redesignedPalette.text.muted,
              backgroundColor: redesignedPalette.surface.tertiary,
            },
          }}
        >
          Copy link
        </Button>
      </Stack>
      <Box
        sx={{
          borderRadius: 1.25,
          backgroundColor: redesignedPalette.surface.tertiary,
          px: 1.75,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            color: redesignedPalette.text.secondary,
            fontFamily: "ui-monospace, monospace",
          }}
        >
          vocado.app/d/es-alex-47
        </Typography>
        <Button
          type="button"
          variant="outlined"
          sx={{
            minWidth: 0,
            px: 1.25,
            py: 0.375,
            borderRadius: 0.75,
            borderColor: redesignedPalette.border,
            color: redesignedPalette.text.secondary,
            fontSize: 11,
          }}
        >
          Copy
        </Button>
      </Box>
    </Stack>
  );
}

function LanguagesVisual() {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: `${redesignedRadii.large}px`,
        border: `1px solid ${redesignedPalette.border}`,
        backgroundColor: "#161310",
      }}
    >
      <Typography
        sx={{
          mb: 1.5,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: redesignedPalette.text.muted,
          fontWeight: 600,
        }}
      >
        {getTranslation("landing.languages.yourDecks")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 1.25,
          mb: 2,
        }}
      >
        {languageDecks.map((deck) => (
          <Box
            key={deck.pair}
            sx={{
              p: 1.75,
              borderRadius: 1.5,
              border: `1px solid ${deck.active ? redesignedPalette.accent.warm : redesignedPalette.border}`,
              backgroundColor: deck.active
                ? redesignedPalette.accentBackground.warm
                : redesignedPalette.surface.secondary,
              transition:
                "border-color 0.15s ease, background-color 0.15s ease",
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                color: deck.active
                  ? redesignedPalette.accent.warm
                  : redesignedPalette.text.primary,
                mb: 0.5,
              }}
            >
              {deck.pair}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: deck.active
                  ? redesignedPalette.accent.warm
                  : redesignedPalette.text.secondary,
              }}
            >
              {deck.label}
            </Typography>
          </Box>
        ))}
        <Box
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            border: `1.5px dashed ${redesignedPalette.border}`,
            color: redesignedPalette.text.muted,
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            minHeight: 82,
          }}
        >
          {getTranslation("landing.languages.new")}
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: 12,
          color: redesignedPalette.text.muted,
          textAlign: "center",
        }}
      >
        {getTranslation("landing.languages.note")}
      </Typography>
    </Box>
  );
}

export default function MarketingLanding() {
  return (
    <RedesignedThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: redesignedPalette.canvas,
          color: redesignedPalette.text.primary,
        }}
      >
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 64,
            borderBottom: `1px solid ${redesignedPalette.border}`,
            backgroundColor: "rgba(15, 13, 10, 0.88)",
            backdropFilter: "blur(20px) saturate(180%)",
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              height: "100%",
              px: sectionPaddingX,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <BrandMark />
              <Typography
                sx={{
                  fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
                  fontSize: 24,
                  fontWeight: 300,
                  letterSpacing: "-0.025em",
                }}
              >
                {getTranslation("landing.appName")}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={4}
              sx={{
                display: { xs: "none", md: "flex" },
                color: redesignedPalette.text.secondary,
                fontSize: 14,
              }}
            >
              <Box
                component="a"
                href="#scan"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: redesignedPalette.text.primary },
                }}
              >
                {getTranslation("landing.nav.scan")}
              </Box>
              <Box
                component="a"
                href="#games"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: redesignedPalette.text.primary },
                }}
              >
                {getTranslation("landing.nav.games")}
              </Box>
              <Box
                component="a"
                href="#sharing"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: redesignedPalette.text.primary },
                }}
              >
                {getTranslation("landing.nav.sharing")}
              </Box>
              <Box
                component="a"
                href="#languages"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                  "&:hover": { color: redesignedPalette.text.primary },
                }}
              >
                {getTranslation("landing.nav.languages")}
              </Box>
            </Stack>
            <Link href="/login" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  px: 2.75,
                  py: 1,
                  borderRadius: 99,
                  backgroundColor: redesignedPalette.accent.warm,
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#a36228",
                    boxShadow: "none",
                  },
                }}
              >
                {getTranslation("landing.nav.download")}
              </Button>
            </Link>
          </Container>
        </Box>

        <Box
          component="main"
          sx={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "radial-gradient(circle at 30% 40%, rgba(30, 21, 10, 0.8) 0%, rgba(15, 13, 10, 0) 50%), radial-gradient(circle at 75% 60%, rgba(10, 26, 14, 0.7) 0%, rgba(15, 13, 10, 0) 40%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -200,
              top: 120,
              width: 700,
              height: 700,
              borderRadius: "50%",
              border: `1px solid rgba(200, 124, 59, 0.08)`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -100,
              top: 220,
              width: 500,
              height: 500,
              borderRadius: "50%",
              border: `1px solid rgba(200, 124, 59, 0.06)`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: -80,
              top: 260,
              width: 520,
              height: 520,
              borderRadius: "50%",
              border: `1px solid rgba(82, 184, 106, 0.07)`,
            }}
          />
          <Container
            maxWidth="lg"
            sx={{
              px: sectionPaddingX,
              pt: { xs: 14, md: 16 },
              pb: { xs: 10, md: 12 },
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 99,
                border: `1px solid ${redesignedPalette.border}`,
                backgroundColor: redesignedPalette.surface.secondary,
                color: redesignedPalette.text.secondary,
                fontSize: 13,
                letterSpacing: "0.03em",
                mb: 5,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: redesignedPalette.accent.success,
                  animation: "landingPulse 2.4s ease-in-out infinite",
                  "@keyframes landingPulse": {
                    "0%, 100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.5, transform: "scale(0.7)" },
                  },
                }}
              />
              Available on iOS and Android
            </Box>
            <Typography
              component="h1"
              sx={{
                maxWidth: 840,
                mx: "auto",
                mb: 3.5,
                fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
                fontSize: { xs: "3.4rem", md: "6rem" },
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              {getTranslation("landing.hero.titleLineOne")}
              <br />
              <Box
                component="em"
                sx={{
                  fontStyle: "italic",
                  color: redesignedPalette.accent.warm,
                }}
              >
                {getTranslation("landing.hero.titleLineTwo")}
              </Box>
            </Typography>
            <Typography
              sx={{
                maxWidth: 560,
                mx: "auto",
                mb: 6,
                fontSize: { xs: 17, md: 20 },
                lineHeight: 1.6,
                color: redesignedPalette.text.secondary,
              }}
            >
              {getTranslation("landing.hero.descriptionNew")}
            </Typography>
            <Box sx={{ maxWidth: 460, mx: "auto" }}>
              <LandingInstallButtons justify="center" />
            </Box>
            <Typography
              sx={{ mt: 3, fontSize: 13, color: redesignedPalette.text.muted }}
            >
              {getTranslation("landing.hero.downloadNote")}
            </Typography>
            <HeroPhoneMockup />
          </Container>
        </Box>

        <Box
          sx={{
            borderTop: `1px solid ${redesignedPalette.border}`,
            borderBottom: `1px solid ${redesignedPalette.border}`,
            px: sectionPaddingX,
            py: { xs: 6, md: 7.5 },
          }}
        >
          <Container maxWidth="lg" sx={{ px: 0 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              {stats.map((stat) => (
                <Box key={stat.label} sx={{ textAlign: "center" }}>
                  <Typography
                    sx={{
                      fontFamily:
                        "var(--font-fraunces, Fraunces, Georgia, serif)",
                      fontSize: { xs: "2.6rem", md: "3.25rem" },
                      fontWeight: 200,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      color: stat.color || redesignedPalette.text.primary,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 14, color: redesignedPalette.text.muted }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        <FeatureSection
          id="scan"
          heading={
            <SectionHeading
              kicker={getTranslation("landing.sections.scan.kicker")}
              title={getTranslation("landing.sections.scan.title")}
              emphasis={getTranslation("landing.sections.scan.emphasis")}
              body={getTranslation("landing.sections.scan.body")}
            />
          }
          details={getTranslation("landing.sections.scan.details")}
          visual={<ScanVisual />}
        />

        <FeatureSection
          id="games"
          reverse
          heading={
            <SectionHeading
              kicker={getTranslation("landing.sections.games.kicker")}
              title={getTranslation("landing.sections.games.title")}
              emphasis={getTranslation("landing.sections.games.emphasis")}
              body={getTranslation("landing.sections.games.body")}
            />
          }
          details={getTranslation("landing.sections.games.details")}
          visual={<GamesVisual />}
        />

        <FeatureSection
          id="sharing"
          heading={
            <SectionHeading
              kicker={getTranslation("landing.sections.sharing.kicker")}
              title={getTranslation("landing.sections.sharing.title")}
              emphasis={getTranslation("landing.sections.sharing.emphasis")}
              body={getTranslation("landing.sections.sharing.body")}
            />
          }
          details={getTranslation("landing.sections.sharing.details")}
          visual={<SharingVisual />}
        />

        <FeatureSection
          id="languages"
          reverse
          heading={
            <SectionHeading
              kicker={getTranslation("landing.sections.languages.kicker")}
              title={getTranslation("landing.sections.languages.title")}
              emphasis={getTranslation("landing.sections.languages.emphasis")}
              body={getTranslation("landing.sections.languages.body")}
            />
          }
          details={getTranslation("landing.sections.languages.details")}
          visual={<LanguagesVisual />}
        />

        <Container
          maxWidth="lg"
          sx={{ px: sectionPaddingX, pb: { xs: 10, md: 15 } }}
        >
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "28px",
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.secondary,
              px: { xs: 3, md: 8 },
              py: { xs: 6, md: 9 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.35,
                pointerEvents: "none",
                backgroundImage:
                  "radial-gradient(circle at 88% 20%, rgba(200,124,59,0.15) 0%, rgba(200,124,59,0) 35%), radial-gradient(circle at 10% 90%, rgba(82,184,106,0.18) 0%, rgba(82,184,106,0) 32%)",
              }}
            />
            <Typography
              component="h2"
              sx={{
                position: "relative",
                zIndex: 1,
                mb: 2.5,
                fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
                fontSize: { xs: "2.5rem", md: "3.75rem" },
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              {getTranslation("landing.cta.title")}
            </Typography>
            <Typography
              sx={{
                position: "relative",
                zIndex: 1,
                maxWidth: 500,
                mx: "auto",
                mb: 5,
                fontSize: 17,
                lineHeight: 1.6,
                color: redesignedPalette.text.secondary,
              }}
            >
              {getTranslation("landing.cta.description")}
            </Typography>
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                maxWidth: 460,
                mx: "auto",
              }}
            >
              <LandingInstallButtons justify="center" />
            </Box>
          </Box>
        </Container>

        <Box
          component="footer"
          sx={{
            borderTop: `1px solid ${redesignedPalette.border}`,
            px: sectionPaddingX,
            py: 5,
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              px: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
                fontSize: 20,
                fontWeight: 300,
                color: redesignedPalette.text.secondary,
              }}
            >
              {getTranslation("landing.appName")}
            </Typography>
            <Stack
              direction="row"
              spacing={3.5}
              sx={{
                flexWrap: "wrap",
                color: redesignedPalette.text.muted,
                fontSize: 13,
              }}
            >
              <Box
                component="a"
                href="#"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                {getTranslation("landing.footer.privacy")}
              </Box>
              <Box
                component="a"
                href="#"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                {getTranslation("landing.footer.terms")}
              </Box>
              <Box
                component="a"
                href="#"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                {getTranslation("landing.footer.support")}
              </Box>
              <Box
                component="a"
                href="#"
                sx={{ color: "inherit", textDecoration: "none" }}
              >
                {getTranslation("landing.footer.pressKit")}
              </Box>
            </Stack>
            <Typography
              sx={{ fontSize: 12, color: redesignedPalette.text.muted }}
            >
              {getTranslation("landing.footer.copyright")}
            </Typography>
          </Container>
        </Box>
      </Box>
    </RedesignedThemeProvider>
  );
}
