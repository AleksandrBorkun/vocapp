"use client";

import { useMemo, useState } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, InputBase, Stack, Typography } from "@mui/material";
import SectionLabel from "@/app/components/redesigned/primitives/SectionLabel";
import RedesignedScreenShell from "@/app/components/redesigned/primitives/RedesignedScreenShell";
import BottomTabBar from "@/app/components/redesigned/quests/BottomTabBar";
import { BottomTabItemViewModel } from "@/app/components/redesigned/quests/types";
import { Deck, Word } from "@/lib/types";
import { redesignedFonts, redesignedPalette } from "@/lib/redesigned/tokens";
import {
  getLanguageName,
  normalizeLanguageCode,
} from "@/lib/utils/languageMapper";

const NEW_THRESHOLD = 0.2;
const REVIEW_THRESHOLD = 0.5;
const MASTERED_THRESHOLD = 0.75;
const DEFAULT_VISIBLE_WORDS = 10;

interface PremiumPackViewModel {
  id: string;
  name: string;
  description: string;
  price: string;
  badge?: string;
}

const PREMIUM_PACKS: PremiumPackViewModel[] = [
  {
    id: "top-50",
    name: "Top 50 words",
    description: "The everyday essentials",
    price: "$1.99",
  },
  {
    id: "top-100",
    name: "Top 100 words",
    description: "Conversations covered",
    price: "$3.99",
  },
  {
    id: "top-300",
    name: "Top 300 words",
    description: "Near-fluent coverage",
    price: "$7.99",
    badge: "POPULAR",
  },
  {
    id: "top-1000",
    name: "Top 1000 words",
    description: "Full fluency toolkit",
    price: "$14.99",
  },
];

type WordStatusTone = "mastered" | "review" | "learning" | "new";

interface DeckDetailScreenProps {
  deck: Deck;
  visibleWords: Word[];
  tabs: BottomTabItemViewModel[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onTabSelect?: (tabId: string) => void;
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getLanguageFlag(code: string) {
  switch (normalizeLanguageCode(code)) {
    case "es":
      return "🇪🇸";
    case "en":
      return "🇬🇧";
    case "fr":
      return "🇫🇷";
    case "de":
      return "🇩🇪";
    case "it":
      return "🇮🇹";
    case "pt":
      return "🇵🇹";
    case "da":
      return "🇩🇰";
    default:
      return "🌍";
  }
}

function getWordStatus(word: Word) {
  if (word.accuracy >= MASTERED_THRESHOLD) {
    return {
      label: "Mastered",
      tone: "mastered" as const,
      color: redesignedPalette.accent.success,
    };
  }

  if (word.accuracy >= REVIEW_THRESHOLD) {
    return {
      label: "Review",
      tone: "review" as const,
      color: redesignedPalette.accent.gold,
    };
  }

  if (word.accuracy >= NEW_THRESHOLD) {
    return {
      label: "Learning",
      tone: "learning" as const,
      color: redesignedPalette.accent.gold,
    };
  }

  return {
    label: "New",
    tone: "new" as const,
    color: redesignedPalette.text.muted,
  };
}

function getMasteryMetrics(words: Word[]) {
  const total = words.length;
  const mastered = words.filter(
    (word) => word.accuracy >= MASTERED_THRESHOLD,
  ).length;
  const dueReview = words.filter(
    (word) =>
      word.accuracy >= NEW_THRESHOLD && word.accuracy < MASTERED_THRESHOLD,
  ).length;
  const masteryPct = total === 0 ? 0 : Math.round((mastered / total) * 100);

  return { total, mastered, dueReview, masteryPct };
}

function getToneStyles(tone: WordStatusTone) {
  switch (tone) {
    case "mastered":
      return {
        dot: redesignedPalette.accent.success,
        label: redesignedPalette.accent.success,
      };
    case "review":
    case "learning":
      return {
        dot: redesignedPalette.accent.gold,
        label: redesignedPalette.accent.gold,
      };
    default:
      return {
        dot: redesignedPalette.text.muted,
        label: redesignedPalette.text.muted,
      };
  }
}

function getWordRowBorderRadius(
  index: number,
  total: number,
  hasToggle: boolean,
) {
  if (total === 1) {
    return hasToggle ? "14px 14px 2px 2px" : 3.5;
  }

  if (index === 0) {
    return "14px 14px 2px 2px";
  }

  if (index === total - 1) {
    return hasToggle ? "2px" : "2px 2px 14px 14px";
  }

  return 0;
}

export default function DeckDetailScreen({
  deck,
  visibleWords,
  tabs,
  searchValue,
  onSearchChange,
  onTabSelect,
}: DeckDetailScreenProps) {
  const [isVocabularyExpanded, setIsVocabularyExpanded] = useState(false);
  const languageLabel = getLanguageName(deck.study);
  const nativeLanguageLabel = getLanguageName(deck.language);
  const deckFlag = getLanguageFlag(deck.study);
  const metrics = getMasteryMetrics(deck.words);
  const masteryWidth = `${metrics.masteryPct}%`;
  const hasActiveSearch = searchValue.trim().length > 0;
  const canToggleVocabulary =
    !hasActiveSearch && visibleWords.length > DEFAULT_VISIBLE_WORDS;
  const displayedWords = useMemo(() => {
    if (hasActiveSearch || isVocabularyExpanded) {
      return visibleWords;
    }

    return visibleWords.slice(0, DEFAULT_VISIBLE_WORDS);
  }, [hasActiveSearch, isVocabularyExpanded, visibleWords]);
  const hiddenWordsCount = Math.max(
    visibleWords.length - DEFAULT_VISIBLE_WORDS,
    0,
  );
  const toggleLabel = isVocabularyExpanded
    ? "Show fewer words"
    : `Show ${hiddenWordsCount} more word${hiddenWordsCount === 1 ? "" : "s"}`;

  return (
    <RedesignedScreenShell
      footer={<BottomTabBar items={tabs} onSelect={onTabSelect} />}
    >
      <Box sx={{ pb: 2 }}>
        <Stack spacing={2} sx={{ px: 3, pt: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 36, lineHeight: 1 }}>
              {deckFlag}
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                fontFamily: redesignedFonts.displayFallback,
                fontSize: 34,
                fontWeight: 300,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: redesignedPalette.text.primary,
              }}
            >
              {languageLabel}
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                fontSize: 13,
                color: redesignedPalette.text.secondary,
              }}
            >
              {deck.name} · from {nativeLanguageLabel} · learning since{" "}
              {formatMonthYear(deck.createdAt)}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              overflow: "hidden",
              borderRadius: 4,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.secondary,
            }}
          >
            {[
              {
                label: "Words",
                value: metrics.total,
                color: redesignedPalette.text.primary,
              },
              {
                label: "Mastered",
                value: metrics.mastered,
                color: redesignedPalette.accent.success,
              },
              {
                label: "Due review",
                value: metrics.dueReview,
                color: redesignedPalette.accent.gold,
              },
            ].map((item, index) => (
              <Box
                key={item.label}
                sx={{
                  py: 1.5,
                  px: 1,
                  textAlign: "center",
                  borderRight:
                    index === 2
                      ? "none"
                      : `1px solid ${redesignedPalette.border}`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: redesignedFonts.displayFallback,
                    fontSize: 22,
                    fontWeight: 300,
                    lineHeight: 1,
                    color: item.color,
                  }}
                >
                  {item.value}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.375,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: redesignedPalette.text.muted,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              borderRadius: 3.5,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.secondary,
              px: 2,
              py: 1.75,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography
                sx={{ fontSize: 13, color: redesignedPalette.text.secondary }}
              >
                Overall mastery
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: redesignedPalette.accent.success,
                }}
              >
                {metrics.masteryPct}%
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 5,
                overflow: "hidden",
                borderRadius: 999,
                backgroundColor: redesignedPalette.surface.tertiary,
              }}
            >
              <Box
                sx={{
                  width: masteryWidth,
                  height: "100%",
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${redesignedPalette.accent.success}, rgba(82, 184, 106, 0.6))`,
                }}
              />
            </Box>
            <Typography
              sx={{
                mt: 0.75,
                fontSize: 11,
                color: redesignedPalette.text.muted,
              }}
            >
              {metrics.dueReview > 0
                ? `${metrics.dueReview} words due for review today`
                : "No words due for review today"}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            px: 3,
            pt: 2,
            pb: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <SectionLabel sx={{ px: 0, pb: 0 }}>Vocabulary</SectionLabel>
          <Typography
            sx={{ fontSize: 12, color: redesignedPalette.text.secondary }}
          >
            {deck.words.length} words
          </Typography>
        </Box>
        <Box sx={{ px: 3, pb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: 3,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.secondary,
              px: 1.75,
              py: 1.125,
            }}
          >
            <SearchRoundedIcon
              sx={{ fontSize: 16, color: redesignedPalette.text.muted }}
            />
            <InputBase
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search words..."
              fullWidth
              sx={{
                fontSize: 14,
                color: redesignedPalette.text.secondary,
                "& input::placeholder": {
                  color: redesignedPalette.text.secondary,
                  opacity: 1,
                },
              }}
            />
          </Box>
        </Box>

        <Stack spacing={0.125} sx={{ px: 3 }}>
          {deck.words.length === 0 ? (
            <Box
              sx={{
                borderRadius: 3.5,
                border: `1px solid ${redesignedPalette.border}`,
                backgroundColor: redesignedPalette.surface.primary,
                px: 2,
                py: 2.25,
              }}
            >
              <Typography sx={{ color: redesignedPalette.text.secondary }}>
                This deck does not have any words yet.
              </Typography>
            </Box>
          ) : null}

          {deck.words.length > 0 && visibleWords.length === 0 ? (
            <Box
              sx={{
                borderRadius: 3.5,
                border: `1px solid ${redesignedPalette.border}`,
                backgroundColor: redesignedPalette.surface.primary,
                px: 2,
                py: 2.25,
              }}
            >
              <Typography sx={{ color: redesignedPalette.text.secondary }}>
                No words match this search.
              </Typography>
            </Box>
          ) : null}

          {displayedWords.length > 0 &&
            displayedWords.map((word, index) => {
              const status = getWordStatus(word);
              const toneStyles = getToneStyles(status.tone);

              return (
                <Box
                  key={`${word.word}-${word.translation}-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "auto minmax(0, 1fr) auto minmax(0, 1fr) auto",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: getWordRowBorderRadius(
                      index,
                      displayedWords.length,
                      canToggleVocabulary,
                    ),
                    border: `1px solid ${redesignedPalette.border}`,
                    backgroundColor: redesignedPalette.surface.primary,
                    px: 2,
                    py: 1.625,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: toneStyles.dot,
                    }}
                  />
                  <Typography
                    sx={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 15,
                      fontWeight: 500,
                      color: redesignedPalette.text.primary,
                    }}
                  >
                    {word.word}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 11, color: redesignedPalette.text.muted }}
                  >
                    →
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 15,
                      textAlign: "right",
                      color: redesignedPalette.text.secondary,
                    }}
                  >
                    {word.translation}
                  </Typography>
                  <Typography
                    sx={{
                      minWidth: 54,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                      textAlign: "right",
                      color: toneStyles.label,
                    }}
                  >
                    {status.label}
                  </Typography>
                </Box>
              );
            })}

          {canToggleVocabulary ? (
            <Box
              component="button"
              type="button"
              onClick={() => setIsVocabularyExpanded((current) => !current)}
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                borderRadius: "2px 2px 14px 14px",
                border: `1px solid ${redesignedPalette.border}`,
                backgroundColor: redesignedPalette.surface.secondary,
                px: 2,
                py: 1.375,
                color: redesignedPalette.text.secondary,
                cursor: "pointer",
                transition: "background-color 160ms ease, color 160ms ease",
                "&:hover": {
                  backgroundColor: redesignedPalette.surface.tertiary,
                  color: redesignedPalette.text.primary,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                {toggleLabel}
              </Typography>
              <ExpandMoreRoundedIcon
                sx={{
                  fontSize: 18,
                  transform: isVocabularyExpanded
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 160ms ease",
                }}
              />
            </Box>
          ) : null}
        </Stack>

        <SectionLabel sx={{ pt: 3 }}>Premium word packs</SectionLabel>
        <Stack spacing={1.25} sx={{ px: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              borderRadius: 4,
              border: `1px solid rgba(224, 168, 60, 0.2)`,
              background:
                "linear-gradient(135deg, rgba(224, 168, 60, 0.12), rgba(200, 124, 59, 0.08))",
              px: 2,
              py: 1.75,
            }}
          >
            <Typography sx={{ fontSize: 24, lineHeight: 1 }}>⚡</Typography>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: redesignedPalette.accent.gold,
                }}
              >
                Jumpstart your {languageLabel}
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 12,
                  color: redesignedPalette.text.secondary,
                }}
              >
                Add the most-used words instantly, curated by frequency.
              </Typography>
            </Box>
          </Box>

          {PREMIUM_PACKS.map((pack, index) => (
            <Box
              key={pack.id}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderRadius: 3.5,
                border: `1px solid ${redesignedPalette.border}`,
                backgroundColor: redesignedPalette.surface.primary,
                px: 2,
                py: 1.625,
              }}
            >
              <Typography sx={{ opacity: 0.5 }}>🔒</Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: redesignedPalette.text.primary,
                  }}
                >
                  {pack.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: 12,
                    color: redesignedPalette.text.secondary,
                  }}
                >
                  {pack.description}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: redesignedFonts.displayFallback,
                  fontSize: 18,
                  fontWeight: 300,
                  color: redesignedPalette.accent.gold,
                }}
              >
                {pack.price}
              </Typography>
              {pack.badge ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: 16,
                    borderRadius: 999,
                    backgroundColor: redesignedPalette.accent.warm,
                    px: 1,
                    py: 0.375,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: "#fff",
                    }}
                  >
                    {pack.badge}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          ))}
        </Stack>
      </Box>
    </RedesignedScreenShell>
  );
}
