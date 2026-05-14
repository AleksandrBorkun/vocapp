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
import { useAuth } from "@/app/hooks/useAuth";
import { useWords } from "@/app/hooks/useWords";
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
const SERIF_FONT = '"Fraunces", Georgia, serif';
const TILE_HEIGHT = 68;
const TILE_GAP = 10;
const CONNECTOR_WIDTH = 40;

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

export default function MatchTranslationPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const { user, loading: authLoading } = useAuth({ requireAuth: true });
  const {
    deck,
    loading: deckLoading,
    error,
    loadDeck,
    updateWordAccuracies,
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
  const [pendingRoundUpdates, setPendingRoundUpdates] = useState<
    Array<{ wordIndex: number; delta: number }>
  >([]);
  const [wrongAttempt, setWrongAttempt] = useState<WrongAttempt | null>(null);
  const [perfectMatches, setPerfectMatches] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [savingRound, setSavingRound] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

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
    setPendingRoundUpdates([]);
    setWrongAttempt(null);
  }

  function startSession(nextWords: Word[]) {
    setRounds(buildMatchRounds(nextWords));
    setCurrentRoundIndex(0);
    setPerfectMatches(0);
    setSessionComplete(false);
    setSavingRound(false);
    setGameError(null);
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
      setPendingRoundUpdates((previous) => [
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

    setPendingRoundUpdates((previous) => [
      ...previous,
      { wordIndex: selectedWord.deckIndex, delta: -WRONG_ANSWER_DELTA },
    ]);
    setRoundMissedDeckIndices((previous) =>
      previous.includes(selectedWord.deckIndex)
        ? previous
        : [...previous, selectedWord.deckIndex],
    );
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

    setSavingRound(true);

    try {
      await updateWordAccuracies(deckId, pendingRoundUpdates);

      if (currentRoundIndex === rounds.length - 1) {
        resetRoundState();
        setSessionComplete(true);
        return;
      }

      setCurrentRoundIndex((previous) => previous + 1);
      resetRoundState();
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
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 5 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Button
            onClick={() => router.push(`/deck/${deckId}`)}
            variant="outlined"
            sx={{ minWidth: 0, width: 44, height: 44, borderRadius: 3 }}
          >
            <ArrowBackRoundedIcon />
          </Button>
          <Typography
            variant="h4"
            sx={{ fontFamily: SERIF_FONT, fontWeight: 300 }}
          >
            {getTranslation("matchTranslation.title")}
          </Typography>
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
              maxWidth: 560,
              p: { xs: 3, sm: 5 },
              borderRadius: 6,
              bgcolor: "background.paper",
              border: 1,
              borderColor: alpha(theme.palette.text.secondary, 0.18),
              textAlign: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontFamily: SERIF_FONT, fontWeight: 300, mb: 2 }}
            >
              {getTranslation("matchTranslation.wellDone")}
            </Typography>
            <Typography variant="h5" color="text.secondary" mb={4}>
              {`${perfectMatches}/${totalWords} ${getTranslation("matchTranslation.correctAnswers")}`}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                onClick={() => startSession(deck.words)}
                variant="contained"
                startIcon={<ReplayRoundedIcon />}
                sx={{ py: 1.5 }}
              >
                {getTranslation("matchTranslation.nextRound")}
              </Button>
              <Button
                onClick={() => router.push("/home")}
                variant="outlined"
                startIcon={<HomeRoundedIcon />}
                sx={{ py: 1.5 }}
              >
                {getTranslation("matchTranslation.goHome")}
              </Button>
            </Stack>
          </Card>
        </Box>
      </Box>
    );
  }

  if (!currentRound) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          <Typography variant="h5" fontWeight={700} mb={1.5}>
            {getTranslation("matchTranslation.title")}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {getTranslation("matchTranslation.emptyDeck")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(`/deck/${deckId}`)}
          >
            {getTranslation("matchTranslation.backToDeck")}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={() => router.push(`/deck/${deckId}`)}
            variant="outlined"
            sx={{
              minWidth: 0,
              width: 44,
              height: 44,
              borderRadius: 3,
              borderColor: alpha(theme.palette.text.secondary, 0.24),
            }}
          >
            <ArrowBackRoundedIcon />
          </Button>

          <Typography
            variant="h4"
            sx={{
              flex: 1,
              fontFamily: SERIF_FONT,
              fontWeight: 300,
              letterSpacing: "-0.03em",
            }}
          >
            {getTranslation("matchTranslation.title")}
          </Typography>

          <Box
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 99,
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              border: 1,
              borderColor: alpha(theme.palette.warning.main, 0.24),
            }}
          >
            <Typography
              sx={{ color: "warning.main", fontSize: 12, fontWeight: 700 }}
            >
              {`${totalWords} ${getTranslation("matchTranslation.words")}`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography
            sx={{
              color: alpha(theme.palette.text.secondary, 0.72),
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
              height: 6,
              borderRadius: 99,
              bgcolor: alpha(theme.palette.text.secondary, 0.16),
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: `${(100 * (currentRoundIndex + 1)) / rounds.length}%`,
                bgcolor: "warning.main",
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            px: 2,
            py: 1.25,
            borderRadius: 99,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            bgcolor: alpha(theme.palette.warning.main, 0.12),
            border: 1,
            borderColor: alpha(theme.palette.warning.main, 0.24),
          }}
        >
          <Typography component="span" sx={{ color: "warning.main" }}>
            ●
          </Typography>
          <Typography
            sx={{ color: "warning.main", fontWeight: 600, fontSize: 14 }}
          >
            {getTranslation("matchTranslation.sessionPill")}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          maxWidth: 760,
          width: "100%",
          mx: "auto",
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
            color="text.secondary"
            sx={{ mb: 2.5 }}
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
              if (!matchedDeckIndices.includes(word.deckIndex)) {
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
                  stroke={theme.palette.success.main}
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  opacity={0.85}
                />
              );
            })}
          </Box>

          <Box
            sx={{
              flex: 1,
              pr: `${CONNECTOR_WIDTH / 2 + 10}px`,
              display: "flex",
              flexDirection: "column",
              gap: `${TILE_GAP}px`,
            }}
          >
            {currentRound.words.map((word) => {
              const isSelected = selectedWordDeckIndex === word.deckIndex;
              const isMatched = matchedDeckIndices.includes(word.deckIndex);
              const isWrong = wrongAttempt?.sourceDeckIndex === word.deckIndex;

              return (
                <Button
                  key={`source-${word.deckIndex}`}
                  onClick={() => handleSelectWord(word.deckIndex)}
                  variant="outlined"
                  disabled={savingRound || isMatched}
                  sx={{
                    minHeight: TILE_HEIGHT,
                    borderRadius: 4,
                    textTransform: "none",
                    borderWidth: 1.5,
                    fontSize: 15,
                    fontWeight: 500,
                    color: isMatched
                      ? "success.main"
                      : isWrong
                        ? "error.main"
                        : "text.primary",
                    bgcolor: isMatched
                      ? alpha(theme.palette.success.main, 0.12)
                      : isWrong
                        ? alpha(theme.palette.error.main, 0.12)
                        : isSelected
                          ? alpha(theme.palette.warning.main, 0.12)
                          : alpha(theme.palette.background.paper, 0.88),
                    borderColor: isMatched
                      ? alpha(theme.palette.success.main, 0.4)
                      : isWrong
                        ? alpha(theme.palette.error.main, 0.45)
                        : isSelected
                          ? theme.palette.warning.main
                          : alpha(theme.palette.text.secondary, 0.18),
                    "&:hover": {
                      borderColor: isMatched
                        ? alpha(theme.palette.success.main, 0.4)
                        : isWrong
                          ? alpha(theme.palette.error.main, 0.45)
                          : theme.palette.warning.main,
                      bgcolor: isMatched
                        ? alpha(theme.palette.success.main, 0.12)
                        : isWrong
                          ? alpha(theme.palette.error.main, 0.12)
                          : alpha(theme.palette.warning.main, 0.08),
                    },
                    "&.Mui-disabled": {
                      color: isMatched
                        ? theme.palette.success.main
                        : theme.palette.text.primary,
                      borderColor: isMatched
                        ? alpha(theme.palette.success.main, 0.4)
                        : alpha(theme.palette.text.secondary, 0.18),
                      bgcolor: isMatched
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.background.paper, 0.88),
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
              pl: `${CONNECTOR_WIDTH / 2 + 10}px`,
              display: "flex",
              flexDirection: "column",
              gap: `${TILE_GAP}px`,
            }}
          >
            {currentRound.translations.map((word) => {
              const isMatched = matchedDeckIndices.includes(word.deckIndex);
              const isWrong =
                wrongAttempt?.translationDeckIndex === word.deckIndex;

              return (
                <Button
                  key={`translation-${word.deckIndex}`}
                  onClick={() => handleSelectTranslation(word.deckIndex)}
                  variant="outlined"
                  disabled={savingRound || isMatched}
                  sx={{
                    minHeight: TILE_HEIGHT,
                    borderRadius: 4,
                    textTransform: "none",
                    borderWidth: 1.5,
                    fontSize: 15,
                    fontWeight: 500,
                    color: isMatched
                      ? "success.main"
                      : isWrong
                        ? "error.main"
                        : "text.primary",
                    bgcolor: isMatched
                      ? alpha(theme.palette.success.main, 0.12)
                      : isWrong
                        ? alpha(theme.palette.error.main, 0.12)
                        : alpha(theme.palette.background.paper, 0.88),
                    borderColor: isMatched
                      ? alpha(theme.palette.success.main, 0.4)
                      : isWrong
                        ? alpha(theme.palette.error.main, 0.45)
                        : alpha(theme.palette.text.secondary, 0.18),
                    "&:hover": {
                      borderColor: isMatched
                        ? alpha(theme.palette.success.main, 0.4)
                        : selectedWordDeckIndex === null
                          ? alpha(theme.palette.text.secondary, 0.18)
                          : theme.palette.warning.main,
                      bgcolor: isMatched
                        ? alpha(theme.palette.success.main, 0.12)
                        : isWrong
                          ? alpha(theme.palette.error.main, 0.12)
                          : selectedWordDeckIndex === null
                            ? alpha(theme.palette.background.paper, 0.88)
                            : alpha(theme.palette.warning.main, 0.08),
                    },
                    "&.Mui-disabled": {
                      color: isMatched
                        ? theme.palette.success.main
                        : theme.palette.text.primary,
                      borderColor: isMatched
                        ? alpha(theme.palette.success.main, 0.4)
                        : alpha(theme.palette.text.secondary, 0.18),
                      bgcolor: isMatched
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.background.paper, 0.88),
                    },
                  }}
                >
                  {word.translation}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            mt: "auto",
            pt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderTop: 1,
            borderColor: alpha(theme.palette.text.secondary, 0.12),
          }}
        >
          <Box>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {getTranslation("matchTranslation.matched")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: SERIF_FONT,
                  fontWeight: 300,
                  fontSize: 28,
                  color: "success.main",
                }}
              >
                {matchedDeckIndices.length}
              </Typography>
              <Typography
                sx={{ color: alpha(theme.palette.text.secondary, 0.72) }}
              >
                {`/ ${currentRound.words.length}`}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={handleNextRound}
            variant="contained"
            disabled={!allMatched || savingRound}
            endIcon={savingRound ? undefined : <NavigateNextRoundedIcon />}
            sx={{ minWidth: 140, py: 1.5 }}
          >
            {savingRound ? (
              <CircularProgress size={18} sx={{ color: "inherit" }} />
            ) : (
              getTranslation("matchTranslation.next")
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
