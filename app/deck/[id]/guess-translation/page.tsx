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

const ROUND_SIZE = 10;
const ANSWER_OPTIONS = 4;
const CORRECT_ANSWER_DELTA = 0.05;
const WRONG_ANSWER_DELTA = 0.02;
const GUESS_QUEST = getRedesignedQuestByRoute("guess-translation");
const GUESS_REWARD_XP = GUESS_QUEST?.rewardXp ?? 20;
const GUESS_MAX_LIVES = GUESS_QUEST?.maxLives ?? GUESS_QUEST?.lives ?? 3;

type GameCard = {
  deckIndex: number;
  word: string;
  translation: string;
  example?: string;
  options: string[];
};

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
  const selectedWords = selectStudyWords(words, ROUND_SIZE);

  return selectedWords.map((word) => ({
    deckIndex: word.deckIndex,
    word: word.word,
    translation: word.translation,
    example: word.example,
    options: buildAnswerOptions(word.translation, indexedWords),
  }));
}

function GuessTranslationScreen() {
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
  const [remainingLives, setRemainingLives] = useState(GUESS_MAX_LIVES);
  const [pendingUpdates, setPendingUpdates] = useState<
    Array<{ wordIndex: number; delta: number }>
  >([]);

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
  }

  function startRound(nextWords: Word[]) {
    setRound(buildGameRound(nextWords));
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setRoundComplete(false);
    setGameError(null);
    setRemainingLives(GUESS_MAX_LIVES);
    setPendingUpdates([]);
    setSavingAnswer(false);
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

  function handleSelectOption(option: string) {
    if (!currentCard || answered || savingAnswer) {
      return;
    }

    const isCorrect = option === currentCard.translation;

    setSelectedOption(option);
    setIsCorrectSelection(isCorrect);
    setPendingUpdates((previous) => [
      ...previous,
      {
        wordIndex: currentCard.deckIndex,
        delta: isCorrect ? CORRECT_ANSWER_DELTA : -WRONG_ANSWER_DELTA,
      },
    ]);

    if (isCorrect) {
      setCorrectAnswers((previous) => previous + 1);
      return;
    }

    setRemainingLives((previous) => Math.max(0, previous - 1));
  }

  async function handleNextCard() {
    if (!answered || savingAnswer) {
      return;
    }

    if (currentCardIndex < round.length - 1) {
      setCurrentCardIndex((previous) => previous + 1);
      resetTurnState();
      return;
    }

    if (!user || !deck) {
      setGameError("Failed to save answer progress");
      return;
    }

    setSavingAnswer(true);

    try {
      await submitStudyResults({
        deckId,
        userId: user.uid,
        languageCode: deck.study,
        questId: "guess-translation",
        xpReward: GUESS_REWARD_XP,
        updates: pendingUpdates,
      });
      setRoundComplete(true);
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
              {getTranslation("guessTranslation.title")}
            </Typography>
            <RewardBadge xp={GUESS_REWARD_XP} />
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
                {getTranslation("guessTranslation.wellDone")}
              </Typography>
              <Typography sx={{ color: redesign.text.secondary, mb: 2.5 }}>
                {`${correctAnswers}/${round.length} ${getTranslation("guessTranslation.correctAnswers")}`}
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  onClick={() => startRound(deck.words)}
                  variant="contained"
                  startIcon={<ReplayRoundedIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: redesign.accent.warm,
                    color: redesign.text.primary,
                    "&:hover": { bgcolor: redesign.accent.warm },
                  }}
                >
                  {getTranslation("guessTranslation.nextRound")}
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
                  {getTranslation("guessTranslation.goHome")}
                </Button>
              </Stack>
            </Card>
          </Box>
        </Box>
      </RedesignedScreenShell>
    );
  }

  if (!currentCard) {
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
              {getTranslation("guessTranslation.title")}
            </Typography>
            <Typography sx={{ color: redesign.text.secondary, mb: 3 }}>
              {getTranslation("guessTranslation.emptyDeck")}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/deck/${deckId}`)}
              sx={{
                bgcolor: redesign.accent.warm,
                color: redesign.text.primary,
              }}
            >
              {getTranslation("guessTranslation.backToDeck")}
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
              {getTranslation("guessTranslation.title")}
            </Typography>

            <LivesDisplay lives={remainingLives} maxLives={GUESS_MAX_LIVES} />
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
                    backgroundColor: isDone
                      ? redesign.accent.success
                      : isCurrent
                        ? redesign.accent.warm
                        : redesign.surface.tertiary,
                    transition: "all 150ms ease",
                  }}
                />
              );
            })}
            <Typography
              sx={{ ml: "auto", color: redesign.text.secondary, fontSize: 13 }}
            >
              {`${getTranslation("guessTranslation.card")} ${currentCardIndex + 1} / ${round.length}`}
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
          <Card
            onClick={() => setIsCardFlipped((previous) => !previous)}
            sx={{
              px: 3,
              py: 5,
              mb: 4,
              borderRadius: 3,
              backgroundColor: redesign.surface.secondary,
              borderColor: redesign.border,
              boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4)",
              textAlign: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Typography
              sx={{
                color: redesign.text.muted,
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
                fontFamily: displayFont,
                fontWeight: 300,
                letterSpacing: "-0.04em",
                fontSize: { xs: "3rem", sm: "3.5rem" },
                lineHeight: 1,
                color: redesign.text.primary,
              }}
            >
              {isCardFlipped ? currentCard.translation : currentCard.word}
            </Typography>

            <Typography
              sx={{ color: redesign.text.muted, mt: 1.5, fontSize: 13 }}
            >
              {`${getTranslation("guessTranslation.fromDeck")}: ${deck.name}`}
            </Typography>

            {isCardFlipped && currentCard.example ? (
              <Typography
                sx={{
                  color: redesign.text.secondary,
                  mt: 2,
                  fontStyle: "italic",
                }}
              >
                {`"${currentCard.example}"`}
              </Typography>
            ) : null}

            <Stack
              direction="row"
              spacing={0.75}
              justifyContent="flex-end"
              alignItems="center"
              sx={{ mt: 3, color: redesign.text.muted }}
            >
              <FlipRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: 12 }}>
                {getTranslation("guessTranslation.tapToFlip")}
              </Typography>
            </Stack>
          </Card>

          <Typography
            sx={{
              color: redesign.text.secondary,
              mb: 2,
              textAlign: "center",
              fontSize: 14,
            }}
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
                gridTemplateColumns: "1fr 1fr",
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
                      px: 1.5,
                      borderRadius: radii.medium,
                      borderWidth: 1.5,
                      fontSize: "1rem",
                      textTransform: "none",
                      justifyContent: "center",
                      backgroundColor: isCorrectReveal
                        ? redesign.accentBackground.success
                        : isWrongSelection
                          ? redesign.accentBackground.danger
                          : isSelected
                            ? redesign.accentBackground.warm
                            : redesign.surface.secondary,
                      borderColor: isCorrectReveal
                        ? alpha(redesign.accent.success, 0.5)
                        : isWrongSelection
                          ? alpha(redesign.accent.danger, 0.5)
                          : isSelected
                            ? redesign.accent.warm
                            : redesign.border,
                      color: isCorrectReveal
                        ? redesign.accent.success
                        : isWrongSelection
                          ? redesign.accent.danger
                          : redesign.text.primary,
                      "&:hover": {
                        borderColor: isCorrectReveal
                          ? alpha(redesign.accent.success, 0.5)
                          : redesign.accent.warm,
                        backgroundColor: isCorrectReveal
                          ? redesign.accentBackground.success
                          : alpha(redesign.accent.warm, 0.1),
                      },
                      "&.Mui-disabled": {
                        color: isCorrectReveal
                          ? redesign.accent.success
                          : isWrongSelection
                            ? redesign.accent.danger
                            : redesign.text.primary,
                        borderColor: isCorrectReveal
                          ? alpha(redesign.accent.success, 0.5)
                          : isWrongSelection
                            ? alpha(redesign.accent.danger, 0.5)
                            : redesign.border,
                      },
                    }}
                  >
                    {option}
                  </Button>
                );
              })}
            </Box>
          </Tooltip>
        </Box>

        {answered ? (
          <Box
            sx={{
              mt: "auto",
              px: 3,
              py: 2,
              backgroundColor: isCorrectSelection
                ? redesign.accentBackground.success
                : redesign.accentBackground.danger,
              borderTop: `1px solid ${isCorrectSelection ? alpha(redesign.accent.success, 0.2) : alpha(redesign.accent.danger, 0.2)}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {isCorrectSelection ? (
                <CheckCircleRoundedIcon
                  sx={{ color: redesign.accent.success, fontSize: 28 }}
                />
              ) : (
                <ErrorOutlineRoundedIcon
                  sx={{ color: redesign.accent.danger, fontSize: 28 }}
                />
              )}

              <Box sx={{ flex: 1 }}>
                <Typography
                  fontWeight={700}
                  sx={{
                    color: isCorrectSelection
                      ? redesign.accent.success
                      : redesign.accent.danger,
                  }}
                >
                  {isCorrectSelection
                    ? getTranslation("guessTranslation.correct")
                    : getTranslation("guessTranslation.notQuite")}
                </Typography>
                <Typography
                  sx={{
                    color: redesign.text.secondary,
                    mt: 0.25,
                    fontSize: 13,
                  }}
                >
                  {isCorrectSelection
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
                  bgcolor: redesign.accent.warm,
                  color: redesign.text.primary,
                  "&:hover": { bgcolor: redesign.accent.warm },
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
    </RedesignedScreenShell>
  );
}

export default function GuessTranslationPage() {
  return (
    <RedesignedThemeProvider>
      <GuessTranslationScreen />
    </RedesignedThemeProvider>
  );
}
