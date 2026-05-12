"use client";

import { useEffect, useState } from "react";
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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import FlipRoundedIcon from "@mui/icons-material/FlipRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import ErrorState from "@/app/components/common/ErrorState";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import { useAuth } from "@/app/hooks/useAuth";
import { useWords } from "@/app/hooks/useWords";
import { getTranslation } from "@/lib/translations";
import { Word } from "@/lib/types";

const ROUND_SIZE = 10;
const ANSWER_OPTIONS = 4;
const SERIF_FONT = '"Fraunces", Georgia, serif';

type IndexedWord = Word & {
  deckIndex: number;
};

type GameCard = {
  deckIndex: number;
  word: string;
  translation: string;
  example?: string;
  options: string[];
};

function shuffleArray<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function buildAnswerOptions(correctTranslation: string, words: IndexedWord[]) {
  const distinctTranslations = Array.from(
    new Set(
      words
        .map((word) => word.translation.trim())
        .filter(
          (translation) =>
            translation.length > 0 && translation !== correctTranslation,
        ),
    ),
  );

  return shuffleArray([
    correctTranslation,
    ...shuffleArray(distinctTranslations).slice(0, ANSWER_OPTIONS - 1),
  ]);
}

function buildGameRound(words: Word[]) {
  const indexedWords = words
    .map((word, index) => ({ ...word, deckIndex: index }))
    .filter((word) => word.word.trim() && word.translation.trim());

  const selectedWords: IndexedWord[] = [];
  const newWords = shuffleArray(
    indexedWords.filter((word) => word.accuracy < 0.4),
  );
  const learningWords = shuffleArray(
    indexedWords.filter((word) => word.accuracy >= 0.4 && word.accuracy < 0.8),
  );
  const repetitionWords = shuffleArray(
    indexedWords.filter((word) => word.accuracy >= 0.8),
  );

  selectedWords.push(...newWords.slice(0, 4));
  selectedWords.push(...learningWords.slice(0, 4));
  selectedWords.push(...repetitionWords.slice(0, 2));

  if (selectedWords.length < ROUND_SIZE) {
    const selectedIndices = new Set(
      selectedWords.map((word) => word.deckIndex),
    );
    const remainingWords = shuffleArray(
      indexedWords.filter((word) => !selectedIndices.has(word.deckIndex)),
    );

    selectedWords.push(
      ...remainingWords.slice(0, ROUND_SIZE - selectedWords.length),
    );
  }

  return shuffleArray(selectedWords.slice(0, ROUND_SIZE)).map((word) => ({
    deckIndex: word.deckIndex,
    word: word.word,
    translation: word.translation,
    example: word.example,
    options: buildAnswerOptions(word.translation, indexedWords),
  }));
}

export default function GuessTranslationPage() {
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
    updateWordAccuracy,
  } = useWords();

  const [round, setRound] = useState<GameCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrectSelection, setIsCorrectSelection] = useState<boolean | null>(
    null,
  );
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  const loading = authLoading || deckLoading;
  const currentCard = round[currentCardIndex] ?? null;
  const answered = selectedOption !== null;
  const tooltipMessage = currentCard
    ? `"${currentCard.word}" means ${currentCard.translation}. ${getTranslation("guessTranslation.keepGoing")}`
    : "";

  function resetTurnState() {
    setSelectedOption(null);
    setIsCorrectSelection(null);
    setIsCardFlipped(false);
    setSavingAnswer(false);
  }

  function startRound(nextWords: Word[]) {
    setRound(buildGameRound(nextWords));
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setRoundComplete(false);
    setGameError(null);
    resetTurnState();
  }

  useEffect(() => {
    if (user && deckId) {
      loadDeck(deckId);
    }
  }, [deckId, user, loadDeck]);

  useEffect(() => {
    if (deck) {
      startRound(deck.words);
    }
  }, [deck?.id]);

  async function handleSelectOption(option: string) {
    if (!currentCard || answered || savingAnswer) {
      return;
    }

    const isCorrect = option === currentCard.translation;

    setSelectedOption(option);
    setIsCorrectSelection(isCorrect);

    if (isCorrect) {
      setCorrectAnswers((previous) => previous + 1);
    }

    setSavingAnswer(true);

    try {
      await updateWordAccuracy(deckId, currentCard.deckIndex, isCorrect);
    } catch (updateError) {
      setGameError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to save answer progress",
      );
    } finally {
      setSavingAnswer(false);
    }
  }

  function handleNextCard() {
    if (!answered || savingAnswer) {
      return;
    }

    if (currentCardIndex === round.length - 1) {
      setRoundComplete(true);
      return;
    }

    setCurrentCardIndex((previous) => previous + 1);
    resetTurnState();
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

  if (roundComplete) {
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
            sx={{
              minWidth: 0,
              width: 44,
              height: 44,
              borderRadius: 3,
            }}
          >
            <ArrowBackRoundedIcon />
          </Button>
          <Typography
            variant="h4"
            sx={{ fontFamily: SERIF_FONT, fontWeight: 300 }}
          >
            {getTranslation("guessTranslation.title")}
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
              {getTranslation("guessTranslation.wellDone")}
            </Typography>
            <Typography variant="h5" color="text.secondary" mb={4}>
              {`${correctAnswers}/${round.length} ${getTranslation("guessTranslation.correctAnswers")}`}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                onClick={() => startRound(deck.words)}
                variant="contained"
                startIcon={<ReplayRoundedIcon />}
                sx={{ py: 1.5 }}
              >
                {getTranslation("guessTranslation.nextRound")}
              </Button>
              <Button
                onClick={() => router.push("/home")}
                variant="outlined"
                startIcon={<HomeRoundedIcon />}
                sx={{ py: 1.5 }}
              >
                {getTranslation("guessTranslation.goHome")}
              </Button>
            </Stack>
          </Card>
        </Box>
      </Box>
    );
  }

  if (!currentCard) {
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
            {getTranslation("guessTranslation.title")}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {getTranslation("guessTranslation.emptyDeck")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(`/deck/${deckId}`)}
          >
            {getTranslation("guessTranslation.backToDeck")}
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
            {getTranslation("guessTranslation.title")}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, fontSize: "1.1rem" }}>
            <Box component="span">❤</Box>
            <Box component="span" sx={{ opacity: 0.25 }}>
              ❤
            </Box>
            <Box component="span" sx={{ opacity: 0.25 }}>
              ❤
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 3 }}>
          {round.map((_, index) => {
            const isDone = index < currentCardIndex;
            const isCurrent = index === currentCardIndex;

            return (
              <Box
                key={`progress-${index}`}
                sx={{
                  height: 8,
                  width: isCurrent ? 20 : 8,
                  borderRadius: 999,
                  bgcolor: isDone
                    ? "success.main"
                    : isCurrent
                      ? "warning.main"
                      : alpha(theme.palette.text.secondary, 0.22),
                  transition: "all 150ms ease",
                }}
              />
            );
          })}
          <Typography
            sx={{ ml: "auto", color: "text.secondary", fontSize: 13 }}
          >
            {`${getTranslation("guessTranslation.card")} ${currentCardIndex + 1} / ${round.length}`}
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
          maxWidth: 720,
          width: "100%",
          mx: "auto",
        }}
      >
        <Card
          onClick={() => setIsCardFlipped((previous) => !previous)}
          sx={{
            p: { xs: 3, sm: 5 },
            mt: 1,
            mb: 4,
            borderRadius: 6,
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            border: 1,
            borderColor: alpha(theme.palette.text.secondary, 0.16),
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.28)",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <Typography
            sx={{
              color: alpha(theme.palette.text.secondary, 0.64),
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: 11,
              mb: 1.5,
            }}
          >
            {isCardFlipped
              ? getTranslation("guessTranslation.translationLabel")
              : `${deck.study} → ${deck.language}`}
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontFamily: SERIF_FONT,
              fontWeight: 300,
              letterSpacing: "-0.04em",
              fontSize: { xs: "3rem", sm: "4rem" },
              lineHeight: 1,
            }}
          >
            {isCardFlipped ? currentCard.translation : currentCard.word}
          </Typography>

          <Typography sx={{ color: "text.secondary", mt: 1.5 }}>
            {`${getTranslation("guessTranslation.fromDeck")}: ${deck.name}`}
          </Typography>

          {isCardFlipped && currentCard.example ? (
            <Typography
              sx={{ color: "text.secondary", mt: 2, fontStyle: "italic" }}
            >
              {`"${currentCard.example}"`}
            </Typography>
          ) : null}

          <Stack
            direction="row"
            spacing={0.75}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mt: 3, color: alpha(theme.palette.text.secondary, 0.72) }}
          >
            <FlipRoundedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: 12 }}>
              {getTranslation("guessTranslation.tapToFlip")}
            </Typography>
          </Stack>
        </Card>

        <Typography
          sx={{ color: "text.secondary", mb: 2, textAlign: "center" }}
        >
          {`${getTranslation("guessTranslation.whatDoes")} "${currentCard.word}" ${getTranslation("guessTranslation.mean")}`}
        </Typography>

        <Tooltip
          arrow
          disableFocusListener
          disableHoverListener
          disableTouchListener
          open={answered && isCorrectSelection === false}
          placement="top"
          title={tooltipMessage}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.25,
            }}
          >
            {currentCard.options.map((option) => {
              const isSelected = option === selectedOption;
              const isCorrectOption = option === currentCard.translation;
              const isWrongSelection =
                isSelected && isCorrectSelection === false;
              const isCorrectReveal = answered && isCorrectOption;

              return (
                <Button
                  key={`${currentCard.deckIndex}-${option}`}
                  onClick={() => handleSelectOption(option)}
                  variant="outlined"
                  disabled={answered}
                  sx={{
                    py: 2.25,
                    px: 2,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    fontSize: "1rem",
                    textTransform: "none",
                    justifyContent: "center",
                    bgcolor: isCorrectReveal
                      ? alpha(theme.palette.success.main, 0.12)
                      : isWrongSelection
                        ? alpha(theme.palette.error.main, 0.12)
                        : isSelected
                          ? alpha(theme.palette.warning.main, 0.12)
                          : alpha(theme.palette.background.paper, 0.88),
                    borderColor: isCorrectReveal
                      ? alpha(theme.palette.success.main, 0.5)
                      : isWrongSelection
                        ? alpha(theme.palette.error.main, 0.5)
                        : isSelected
                          ? theme.palette.warning.main
                          : alpha(theme.palette.text.secondary, 0.2),
                    color: isCorrectReveal
                      ? "success.main"
                      : isWrongSelection
                        ? "error.main"
                        : "text.primary",
                    "&:hover": {
                      borderColor: isCorrectReveal
                        ? alpha(theme.palette.success.main, 0.5)
                        : theme.palette.warning.main,
                      bgcolor: isCorrectReveal
                        ? alpha(theme.palette.success.main, 0.12)
                        : alpha(theme.palette.warning.main, 0.1),
                    },
                    "&.Mui-disabled": {
                      color: isCorrectReveal
                        ? theme.palette.success.main
                        : isWrongSelection
                          ? theme.palette.error.main
                          : theme.palette.text.primary,
                      borderColor: isCorrectReveal
                        ? alpha(theme.palette.success.main, 0.5)
                        : isWrongSelection
                          ? alpha(theme.palette.error.main, 0.5)
                          : alpha(theme.palette.text.secondary, 0.2),
                    },
                  }}
                >
                  {option}
                </Button>
              );
            })}
          </Box>
        </Tooltip>

        {answered ? (
          <Box
            sx={{
              mt: "auto",
              pt: 2,
              pb: { xs: 2, sm: 1 },
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor:
                  isCorrectSelection === true
                    ? alpha(theme.palette.success.main, 0.12)
                    : alpha(theme.palette.error.main, 0.12),
                border: 1,
                borderColor:
                  isCorrectSelection === true
                    ? alpha(theme.palette.success.main, 0.24)
                    : alpha(theme.palette.error.main, 0.24),
              }}
            >
              {isCorrectSelection === true ? (
                <CheckCircleRoundedIcon color="success" />
              ) : (
                <ErrorOutlineRoundedIcon color="error" />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography
                  fontWeight={700}
                  color={
                    isCorrectSelection === true ? "success.main" : "error.main"
                  }
                >
                  {isCorrectSelection === true
                    ? getTranslation("guessTranslation.correct")
                    : getTranslation("guessTranslation.notQuite")}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.25 }}>
                  {isCorrectSelection === true
                    ? getTranslation("guessTranslation.correctFeedback")
                    : `"${currentCard.word}" means ${currentCard.translation}. ${getTranslation("guessTranslation.keepGoing")}`}
                </Typography>
              </Box>

              <Button
                onClick={handleNextCard}
                variant="contained"
                disabled={savingAnswer}
                sx={{
                  minWidth: 120,
                  py: 1.25,
                  bgcolor:
                    isCorrectSelection === true
                      ? "success.main"
                      : "warning.main",
                  color:
                    isCorrectSelection === true
                      ? theme.palette.success.contrastText
                      : theme.palette.getContrastText(
                          theme.palette.warning.main,
                        ),
                  "&:hover": {
                    bgcolor:
                      isCorrectSelection === true
                        ? "success.dark"
                        : "warning.dark",
                  },
                }}
              >
                {savingAnswer ? (
                  <CircularProgress size={18} sx={{ color: "inherit" }} />
                ) : (
                  getTranslation("guessTranslation.next")
                )}
              </Button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
