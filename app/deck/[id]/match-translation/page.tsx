"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ErrorState from "@/app/components/common/ErrorState";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import LivesDisplay from "@/app/components/redesigned/primitives/LivesDisplay";
import RedesignedScreenShell from "@/app/components/redesigned/primitives/RedesignedScreenShell";
import RewardBadge from "@/app/components/redesigned/primitives/RewardBadge";
import { useAuth } from "@/app/hooks/useAuth";
import { useWords } from "@/app/hooks/useWords";
import { getRedesignedQuestByRoute } from "@/lib/redesigned/quests";
import { getTranslation } from "@/lib/translations";
import { Word } from "@/lib/types";
import {
  IndexedWord,
  selectStudyWords,
  shuffleArray,
} from "@/lib/utils/studyGame";

const SESSION_SIZE = 20;
const ROUND_SIZE = 5;
const CORRECT_ANSWER_DELTA = 0.05;
const WRONG_ANSWER_DELTA = 0.02;
const TILE_HEIGHT = 68;
const TILE_GAP = 10;
const CONNECTOR_WIDTH = 40;
const MATCH_QUEST = getRedesignedQuestByRoute("match-translation");
const MATCH_REWARD_XP = MATCH_QUEST?.rewardXp ?? 30;
const MATCH_MAX_LIVES = MATCH_QUEST?.maxLives ?? MATCH_QUEST?.lives ?? 3;

type MatchRound = {
  words: IndexedWord[];
  translations: IndexedWord[];
};

type WrongAttempt = {
  sourceDeckIndex: number;
  translationDeckIndex: number;
  message: string;
};

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

function buildMatchRounds(words: Word[]) {
  return chunkArray(selectStudyWords(words, SESSION_SIZE), ROUND_SIZE).map(
    (roundWords) => ({
      words: roundWords,
      translations: shuffleArray(roundWords),
    }),
  );
}

function MatchTranslationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;
  const redesign = theme.vocappRedesign.palette;
  const displayFont = theme.vocappRedesign.fonts.display;
  const radii = theme.vocappRedesign.radii;

  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const {
    deck,
    loading: deckLoading,
    error,
    loadDeck,
    submitStudyResults,
  } = useWords();

  const [rounds, setRounds] = useState<MatchRound[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedWordDeckIndex, setSelectedWordDeckIndex] = useState<
    number | null
  >(null);
  const [matchedDeckIndices, setMatchedDeckIndices] = useState<number[]>([]);
  const [roundMissedDeckIndices, setRoundMissedDeckIndices] = useState<
    number[]
  >([]);
  const [pendingSessionUpdates, setPendingSessionUpdates] = useState<
    Array<{ wordIndex: number; delta: number }>
  >([]);
  const [wrongAttempt, setWrongAttempt] = useState<WrongAttempt | null>(null);
  const [perfectMatches, setPerfectMatches] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [remainingLives, setRemainingLives] = useState(MATCH_MAX_LIVES);

  const loading = authLoading || deckLoading;
  const currentRound = rounds[currentRoundIndex] ?? null;
  const totalWords = useMemo(
    () => rounds.reduce((total, round) => total + round.words.length, 0),
    [rounds],
  );
  const allMatched = currentRound
    ? matchedDeckIndices.length === currentRound.words.length
    : false;
  const boardHeight = currentRound
    ? currentRound.words.length * TILE_HEIGHT +
      Math.max(currentRound.words.length - 1, 0) * TILE_GAP
    : 0;

  function resetRoundState() {
    setSelectedWordDeckIndex(null);
    setMatchedDeckIndices([]);
    setRoundMissedDeckIndices([]);
    setWrongAttempt(null);
  }

  function startSession(nextWords: Word[]) {
    setRounds(buildMatchRounds(nextWords));
    setCurrentRoundIndex(0);
    setPerfectMatches(0);
    setSessionComplete(false);
    setSavingRound(false);
    setGameError(null);
    setPendingSessionUpdates([]);
    setRemainingLives(MATCH_MAX_LIVES);
    resetRoundState();
  }

  useEffect(() => {
    if (user && deckId) {
      loadDeck(deckId);
    }
  }, [deckId, user, loadDeck]);

  useEffect(() => {
    if (deck) {
      startSession(deck.words);
    }
  }, [deck?.id]);

  function handleSelectWord(deckIndex: number) {
    if (
      !currentRound ||
      savingRound ||
      matchedDeckIndices.includes(deckIndex)
    ) {
      return;
    }

    setWrongAttempt(null);
    setSelectedWordDeckIndex((previous) =>
      previous === deckIndex ? null : deckIndex,
    );
  }

  function handleSelectTranslation(deckIndex: number) {
    if (
      !currentRound ||
      savingRound ||
      selectedWordDeckIndex === null ||
      matchedDeckIndices.includes(deckIndex)
    ) {
      return;
    }

    const selectedWord = currentRound.words.find(
      (word) => word.deckIndex === selectedWordDeckIndex,
    );

    if (!selectedWord) {
      return;
    }

    if (selectedWordDeckIndex === deckIndex) {
      setPendingSessionUpdates((previous) => [
        ...previous,
        { wordIndex: selectedWord.deckIndex, delta: CORRECT_ANSWER_DELTA },
      ]);
      setMatchedDeckIndices((previous) => [
        ...previous,
        selectedWord.deckIndex,
      ]);

      if (!roundMissedDeckIndices.includes(selectedWord.deckIndex)) {
        setPerfectMatches((previous) => previous + 1);
      }

      setSelectedWordDeckIndex(null);
      setWrongAttempt(null);
      return;
    }

    setPendingSessionUpdates((previous) => [
      ...previous,
      { wordIndex: selectedWord.deckIndex, delta: -WRONG_ANSWER_DELTA },
    ]);
    setRoundMissedDeckIndices((previous) =>
      previous.includes(selectedWord.deckIndex)
        ? previous
        : [...previous, selectedWord.deckIndex],
    );
    setRemainingLives((previous) => Math.max(0, previous - 1));
    setWrongAttempt({
      sourceDeckIndex: selectedWord.deckIndex,
      translationDeckIndex: deckIndex,
      message: `"${selectedWord.word}" means ${selectedWord.translation}. ${getTranslation("matchTranslation.keepTrying")}`,
    });
    setSelectedWordDeckIndex(null);
  }

  async function handleNextRound() {
    if (!currentRound || !allMatched || savingRound) {
      return;
    }

    if (currentRoundIndex < rounds.length - 1) {
      setCurrentRoundIndex((previous) => previous + 1);
      resetRoundState();
      return;
    }

    if (!user || !deck) {
      setGameError("Failed to save match progress");
      return;
    }

    setSavingRound(true);

    try {
      await submitStudyResults({
        deckId,
        userId: user.uid,
        languageCode: deck.study,
        xpReward: MATCH_REWARD_XP,
        updates: pendingSessionUpdates,
      });
      resetRoundState();
      setSessionComplete(true);
    } catch (updateError) {
      setGameError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to save match progress",
      );
    } finally {
      setSavingRound(false);
    }
  }

  function handleRetryLoad() {
    setGameError(null);
    loadDeck(deckId);
  }

  function getMatchedAccent(deckIndex: number) {
    const matchedOrder = matchedDeckIndices.indexOf(deckIndex);

    if (matchedOrder < 0) {
      return null;
    }

    return matchedOrder % 2 === 0
      ? {
          color: redesign.accent.warm,
          background: redesign.accentBackground.warm,
        }
      : {
          color: redesign.accent.success,
          background: redesign.accentBackground.success,
        };
  }

  if (loading) {
    return <FullPageLoading />;
  }

  if (error || gameError) {
    return (
      <ErrorState
        error={error || gameError || "Unable to load the game"}
        onRetry={handleRetryLoad}
        showBackToLogin={false}
      />
    );
  }

  if (!deck) {
    return (
      <ErrorState
        error="Deck not found"
        onRetry={handleRetryLoad}
        showBackToLogin={false}
      />
    );
  }

  if (sessionComplete) {
    return (
      <RedesignedScreenShell>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 4,
            display: "flex",
            flexDirection: "column",
            minHeight: "100dvh",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
            <Button
              onClick={() => router.push(`/deck/${deckId}`)}
              variant="outlined"
              sx={{
                minWidth: 0,
                width: 44,
                height: 44,
                borderRadius: radii.small,
                borderColor: redesign.border,
                color: redesign.text.primary,
              }}
            >
              <ArrowBackRoundedIcon />
            </Button>
            <Typography
              variant="h4"
              sx={{ fontFamily: displayFont, fontWeight: 300, flex: 1 }}
            >
              {getTranslation("matchTranslation.title")}
            </Typography>
            <RewardBadge xp={MATCH_REWARD_XP} />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Card
              sx={{
                width: "100%",
                borderRadius: radii.large,
                px: 3,
                py: 4,
                backgroundColor: redesign.surface.secondary,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontFamily: displayFont, fontWeight: 300, mb: 1.5 }}
              >
                {getTranslation("matchTranslation.wellDone")}
              </Typography>
              <Typography sx={{ color: redesign.text.secondary, mb: 2.5 }}>
                {`${perfectMatches}/${totalWords} ${getTranslation("matchTranslation.correctAnswers")}`}
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  onClick={() => startSession(deck.words)}
                  variant="contained"
                  startIcon={<ReplayRoundedIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: redesign.accent.warm,
                    color: redesign.text.primary,
                    "&:hover": { bgcolor: redesign.accent.warm },
                  }}
                >
                  {getTranslation("matchTranslation.nextRound")}
                </Button>
                <Button
                  onClick={() => router.push("/home")}
                  variant="outlined"
                  startIcon={<HomeRoundedIcon />}
                  sx={{
                    py: 1.5,
                    borderColor: redesign.border,
                    color: redesign.text.primary,
                  }}
                >
                  {getTranslation("matchTranslation.goHome")}
                </Button>
              </Stack>
            </Card>
          </Box>
        </Box>
      </RedesignedScreenShell>
    );
  }

  if (!currentRound) {
    return (
      <RedesignedScreenShell>
        <Box
          sx={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 3,
          }}
        >
          <Card
            sx={{
              width: "100%",
              borderRadius: radii.large,
              px: 3,
              py: 4,
              backgroundColor: redesign.surface.secondary,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: redesign.text.primary, mb: 1.5 }}
            >
              {getTranslation("matchTranslation.title")}
            </Typography>
            <Typography sx={{ color: redesign.text.secondary, mb: 3 }}>
              {getTranslation("matchTranslation.emptyDeck")}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/deck/${deckId}`)}
              sx={{
                bgcolor: redesign.accent.warm,
                color: redesign.text.primary,
              }}
            >
              {getTranslation("matchTranslation.backToDeck")}
            </Button>
          </Card>
        </Box>
      </RedesignedScreenShell>
    );
  }

  return (
    <RedesignedScreenShell>
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              onClick={() => router.push(`/deck/${deckId}`)}
              variant="outlined"
              sx={{
                minWidth: 0,
                width: 36,
                height: 36,
                borderRadius: 1.25,
                borderColor: redesign.border,
                backgroundColor: redesign.surface.secondary,
                color: redesign.text.primary,
              }}
            >
              <ArrowBackRoundedIcon fontSize="small" />
            </Button>

            <Typography
              variant="h4"
              sx={{
                flex: 1,
                fontFamily: displayFont,
                fontWeight: 300,
                letterSpacing: "-0.02em",
                color: redesign.text.primary,
              }}
            >
              {getTranslation("matchTranslation.title")}
            </Typography>

            <LivesDisplay lives={remainingLives} maxLives={MATCH_MAX_LIVES} />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                color: redesign.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: 11,
                mb: 1,
              }}
            >
              {`${getTranslation("matchTranslation.round")} ${currentRoundIndex + 1} ${getTranslation("matchTranslation.of")} ${rounds.length}`}
            </Typography>
            <Box
              sx={{
                height: 4,
                borderRadius: 999,
                backgroundColor: redesign.surface.tertiary,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${(100 * (currentRoundIndex + 1)) / rounds.length}%`,
                  backgroundColor: redesign.accent.warm,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              px: 2,
              py: 1.25,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: redesign.accentBackground.warm,
              border: `1px solid ${alpha(redesign.accent.warm, 0.25)}`,
            }}
          >
            <Typography component="span" sx={{ color: redesign.accent.warm }}>
              ⭐
            </Typography>
            <Typography
              sx={{
                color: redesign.accent.warm,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              +{MATCH_REWARD_XP} XP on completion
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: 3,
            pb: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tooltip
            open={Boolean(wrongAttempt)}
            title={wrongAttempt?.message ?? ""}
            placement="top"
            arrow
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <Typography
              textAlign="center"
              sx={{ mb: 2.5, color: redesign.text.secondary, fontSize: 14 }}
            >
              {getTranslation("matchTranslation.instruction")}
            </Typography>
          </Tooltip>

          <Box
            sx={{
              position: "relative",
              display: "flex",
              minHeight: boardHeight,
            }}
          >
            <Box
              component="svg"
              viewBox={`0 0 ${CONNECTOR_WIDTH} ${boardHeight}`}
              sx={{
                position: "absolute",
                left: "50%",
                top: 0,
                transform: "translateX(-50%)",
                width: CONNECTOR_WIDTH,
                height: boardHeight,
                pointerEvents: "none",
                overflow: "visible",
                zIndex: 1,
              }}
            >
              {currentRound.words.map((word, leftIndex) => {
                const accent = getMatchedAccent(word.deckIndex);

                if (!accent) {
                  return null;
                }

                const rightIndex = currentRound.translations.findIndex(
                  (translationWord) =>
                    translationWord.deckIndex === word.deckIndex,
                );

                if (rightIndex < 0) {
                  return null;
                }

                return (
                  <line
                    key={`connector-${word.deckIndex}`}
                    x1={0}
                    y1={leftIndex * (TILE_HEIGHT + TILE_GAP) + TILE_HEIGHT / 2}
                    x2={CONNECTOR_WIDTH}
                    y2={rightIndex * (TILE_HEIGHT + TILE_GAP) + TILE_HEIGHT / 2}
                    stroke={accent.color}
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    opacity={0.7}
                  />
                );
              })}
            </Box>

            <Box
              sx={{
                flex: 1,
                pr: `${CONNECTOR_WIDTH / 2 + 8}px`,
                display: "flex",
                flexDirection: "column",
                gap: `${TILE_GAP}px`,
              }}
            >
              {currentRound.words.map((word) => {
                const isSelected = selectedWordDeckIndex === word.deckIndex;
                const isWrong =
                  wrongAttempt?.sourceDeckIndex === word.deckIndex;
                const matchedAccent = getMatchedAccent(word.deckIndex);

                return (
                  <Button
                    key={`source-${word.deckIndex}`}
                    onClick={() => handleSelectWord(word.deckIndex)}
                    variant="outlined"
                    disabled={savingRound || Boolean(matchedAccent)}
                    sx={{
                      minHeight: TILE_HEIGHT,
                      borderRadius: 1.75,
                      textTransform: "none",
                      borderWidth: 1.5,
                      fontSize: 15,
                      fontWeight: 500,
                      color: matchedAccent
                        ? matchedAccent.color
                        : isWrong
                          ? redesign.accent.danger
                          : redesign.text.primary,
                      backgroundColor: matchedAccent
                        ? matchedAccent.background
                        : isWrong
                          ? redesign.accentBackground.danger
                          : isSelected
                            ? redesign.surface.tertiary
                            : redesign.surface.secondary,
                      borderColor: matchedAccent
                        ? alpha(matchedAccent.color, 0.4)
                        : isWrong
                          ? alpha(redesign.accent.danger, 0.45)
                          : isSelected
                            ? redesign.text.secondary
                            : redesign.border,
                      "&:hover": {
                        borderColor: matchedAccent
                          ? alpha(matchedAccent.color, 0.4)
                          : isWrong
                            ? alpha(redesign.accent.danger, 0.45)
                            : redesign.text.secondary,
                        backgroundColor: matchedAccent
                          ? matchedAccent.background
                          : isWrong
                            ? redesign.accentBackground.danger
                            : redesign.surface.tertiary,
                      },
                      "&.Mui-disabled": {
                        color: matchedAccent
                          ? matchedAccent.color
                          : redesign.text.primary,
                        borderColor: matchedAccent
                          ? alpha(matchedAccent.color, 0.4)
                          : redesign.border,
                        backgroundColor: matchedAccent
                          ? matchedAccent.background
                          : redesign.surface.secondary,
                      },
                    }}
                  >
                    {word.word}
                  </Button>
                );
              })}
            </Box>

            <Box
              sx={{
                flex: 1,
                pl: `${CONNECTOR_WIDTH / 2 + 8}px`,
                display: "flex",
                flexDirection: "column",
                gap: `${TILE_GAP}px`,
              }}
            >
              {currentRound.translations.map((word) => {
                const isWrong =
                  wrongAttempt?.translationDeckIndex === word.deckIndex;
                const matchedAccent = getMatchedAccent(word.deckIndex);

                return (
                  <Button
                    key={`translation-${word.deckIndex}`}
                    onClick={() => handleSelectTranslation(word.deckIndex)}
                    variant="outlined"
                    disabled={savingRound || Boolean(matchedAccent)}
                    sx={{
                      minHeight: TILE_HEIGHT,
                      borderRadius: 1.75,
                      textTransform: "none",
                      borderWidth: 1.5,
                      fontSize: 15,
                      fontWeight: 500,
                      color: matchedAccent
                        ? matchedAccent.color
                        : isWrong
                          ? redesign.accent.danger
                          : redesign.text.primary,
                      backgroundColor: matchedAccent
                        ? matchedAccent.background
                        : isWrong
                          ? redesign.accentBackground.danger
                          : redesign.surface.secondary,
                      borderColor: matchedAccent
                        ? alpha(matchedAccent.color, 0.4)
                        : isWrong
                          ? alpha(redesign.accent.danger, 0.45)
                          : redesign.border,
                      "&:hover": {
                        borderColor: matchedAccent
                          ? alpha(matchedAccent.color, 0.4)
                          : selectedWordDeckIndex === null
                            ? redesign.border
                            : redesign.text.secondary,
                        backgroundColor: matchedAccent
                          ? matchedAccent.background
                          : isWrong
                            ? redesign.accentBackground.danger
                            : selectedWordDeckIndex === null
                              ? redesign.surface.secondary
                              : redesign.surface.tertiary,
                      },
                      "&.Mui-disabled": {
                        color: matchedAccent
                          ? matchedAccent.color
                          : redesign.text.primary,
                        borderColor: matchedAccent
                          ? alpha(matchedAccent.color, 0.4)
                          : redesign.border,
                        backgroundColor: matchedAccent
                          ? matchedAccent.background
                          : redesign.surface.secondary,
                      },
                    }}
                  >
                    {word.translation}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: "auto",
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderTop: `1px solid ${redesign.border}`,
            backgroundColor: redesign.surface.primary,
          }}
        >
          <Box>
            <Typography sx={{ color: redesign.text.secondary, fontSize: 13 }}>
              {getTranslation("matchTranslation.matched")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: displayFont,
                  fontWeight: 300,
                  fontSize: 28,
                  color: redesign.accent.success,
                }}
              >
                {matchedDeckIndices.length}
              </Typography>
              <Typography sx={{ color: redesign.text.muted }}>
                {`/ ${currentRound.words.length}`}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={handleNextRound}
            variant="contained"
            disabled={!allMatched || savingRound}
            endIcon={savingRound ? undefined : <NavigateNextRoundedIcon />}
            sx={{
              minWidth: 140,
              py: 1.5,
              bgcolor: redesign.accent.warm,
              color: redesign.text.primary,
              "&:hover": { bgcolor: redesign.accent.warm },
            }}
          >
            {savingRound ? (
              <CircularProgress size={18} sx={{ color: "inherit" }} />
            ) : (
              getTranslation("matchTranslation.next")
            )}
          </Button>
        </Box>
      </Box>
    </RedesignedScreenShell>
  );
}

export default function MatchTranslationPage() {
  return (
    <RedesignedThemeProvider>
      <MatchTranslationScreen />
    </RedesignedThemeProvider>
  );
}
