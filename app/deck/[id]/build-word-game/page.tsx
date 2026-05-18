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
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
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
import { getLanguageName } from "@/lib/utils/languageMapper";
import {
  IndexedWord,
  selectStudyWords,
  shuffleArray,
} from "@/lib/utils/studyGame";

const ROUND_SIZE = 10;
const CORRECT_ANSWER_DELTA = 0.05;
const WRONG_ANSWER_DELTA = 0.02;
const FALLBACK_DECOY_LETTERS = Array.from("abcdefghijklmnopqrstuvwxyz");
const BUILD_QUEST = getRedesignedQuestByRoute("build-word-game");
const BUILD_REWARD_XP = BUILD_QUEST?.rewardXp ?? 25;
const BUILD_MAX_LIVES = BUILD_QUEST?.maxLives ?? BUILD_QUEST?.lives ?? 3;

type AnswerUnit = {
  value: string;
  isPlayable: boolean;
};

type TrayTile = {
  id: string;
  value: string;
  isDecoy: boolean;
};

type GameCard = {
  deckIndex: number;
  prompt: string;
  answer: string;
  answerUnits: AnswerUnit[];
  playableAnswer: string[];
  correctTileIds: string[];
  trayTiles: TrayTile[];
};

function segmentText(value: string) {
  return Array.from(value.normalize("NFC"));
}

function isPlayableCharacter(value: string) {
  return /[\p{L}\p{N}]/u.test(value);
}

function normalizeForComparison(value: string) {
  return value.normalize("NFC").trim().toLocaleLowerCase();
}

function buildAnswerUnits(answer: string) {
  return segmentText(answer).map((value) => ({
    value,
    isPlayable: isPlayableCharacter(value),
  }));
}

function buildLetterTray(answer: string, words: IndexedWord[]) {
  const answerUnits = buildAnswerUnits(answer.trim());
  const playableAnswer = answerUnits
    .filter((unit) => unit.isPlayable)
    .map((unit) => unit.value);
  const correctTiles = playableAnswer.map((value, index) => ({
    id: `correct-${index}`,
    value,
    isDecoy: false,
  }));

  const excludedLetters = new Set(
    playableAnswer.map((value) => normalizeForComparison(value)),
  );
  const candidateLetters = shuffleArray(
    words
      .flatMap((word) => segmentText(word.word.trim()))
      .filter(
        (value) =>
          isPlayableCharacter(value) &&
          !excludedLetters.has(normalizeForComparison(value)),
      ),
  );

  const desiredDecoyCount = Math.min(
    4,
    Math.max(2, Math.ceil(playableAnswer.length / 3)),
  );
  const decoyValues: string[] = [];

  for (const value of candidateLetters) {
    if (decoyValues.length >= desiredDecoyCount) {
      break;
    }

    if (
      decoyValues.some(
        (existing) =>
          normalizeForComparison(existing) === normalizeForComparison(value),
      )
    ) {
      continue;
    }

    decoyValues.push(value);
  }

  for (const value of FALLBACK_DECOY_LETTERS) {
    if (decoyValues.length >= desiredDecoyCount) {
      break;
    }

    if (excludedLetters.has(normalizeForComparison(value))) {
      continue;
    }

    if (
      decoyValues.some(
        (existing) =>
          normalizeForComparison(existing) === normalizeForComparison(value),
      )
    ) {
      continue;
    }

    decoyValues.push(value);
  }

  const decoyTiles = decoyValues.map((value, index) => ({
    id: `decoy-${index}`,
    value,
    isDecoy: true,
  }));

  return {
    answerUnits,
    playableAnswer,
    correctTileIds: correctTiles.map((tile) => tile.id),
    trayTiles: shuffleArray([...correctTiles, ...decoyTiles]),
  };
}

function buildGameRound(words: Word[]) {
  const indexedWords = words
    .map((word, index) => ({ ...word, deckIndex: index }))
    .filter((word) => word.word.trim() && word.translation.trim());
  const selectedWords = selectStudyWords(words, ROUND_SIZE);

  return selectedWords.map((word) => {
    const { answerUnits, playableAnswer, correctTileIds, trayTiles } =
      buildLetterTray(word.word, indexedWords);

    return {
      deckIndex: word.deckIndex,
      prompt: word.translation.trim(),
      answer: word.word.trim(),
      answerUnits,
      playableAnswer,
      correctTileIds,
      trayTiles,
    };
  });
}

function buildAttempt(card: GameCard, placements: Array<string | null>) {
  let playableIndex = 0;

  return card.answerUnits
    .map((unit) => {
      if (!unit.isPlayable) {
        return unit.value;
      }

      const tileId = placements[playableIndex];
      playableIndex += 1;

      if (!tileId) {
        return "";
      }

      return card.trayTiles.find((tile) => tile.id === tileId)?.value ?? "";
    })
    .join("");
}

function BuildWordGameScreen() {
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
  const [placements, setPlacements] = useState<Array<string | null>>([]);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [remainingLives, setRemainingLives] = useState(BUILD_MAX_LIVES);
  const [pendingUpdates, setPendingUpdates] = useState<
    Array<{ wordIndex: number; delta: number }>
  >([]);

  const loading = authLoading || deckLoading;
  const currentCard = round[currentCardIndex] ?? null;
  const usedTileIds = useMemo(
    () =>
      new Set(placements.filter((tileId): tileId is string => tileId !== null)),
    [placements],
  );
  const canUseHint =
    Boolean(currentCard) &&
    !hintUsed &&
    !checkedAnswer &&
    !savingAnswer &&
    placements.includes(null);
  const tooltipMessage = currentCard
    ? `"${currentCard.prompt}" translates to ${currentCard.answer}. ${getTranslation("buildWord.keepGoing")}`
    : "";

  function setTurnState(card: GameCard | null) {
    setPlacements(card ? Array(card.playableAnswer.length).fill(null) : []);
    setCheckedAnswer(false);
    setIsCorrectAnswer(null);
    setHintUsed(false);
    setSavingAnswer(false);
  }

  function startRound(nextWords: Word[]) {
    const nextRound = buildGameRound(nextWords);

    setRound(nextRound);
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setRoundComplete(false);
    setGameError(null);
    setRemainingLives(BUILD_MAX_LIVES);
    setPendingUpdates([]);
    setTurnState(nextRound[0] ?? null);
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

  function handlePlaceTile(tileId: string) {
    if (
      !currentCard ||
      checkedAnswer ||
      savingAnswer ||
      usedTileIds.has(tileId)
    ) {
      return;
    }

    setPlacements((previous) => {
      const next = [...previous];
      const nextEmptyIndex = next.findIndex((value) => value === null);

      if (nextEmptyIndex === -1) {
        return previous;
      }

      next[nextEmptyIndex] = tileId;
      return next;
    });
  }

  function handleRemovePlacement(index: number) {
    if (
      !currentCard ||
      checkedAnswer ||
      savingAnswer ||
      placements[index] === null
    ) {
      return;
    }

    setPlacements((previous) => {
      const next = [...previous];
      next.splice(index, 1);
      next.push(null);
      return next;
    });
  }

  function handleHint() {
    if (!currentCard || !canUseHint) {
      return;
    }

    const targetIndex = placements.findIndex((tileId) => tileId === null);

    if (targetIndex === -1) {
      return;
    }

    setPlacements((previous) => {
      const next = [...previous];
      next[targetIndex] = currentCard.correctTileIds[targetIndex];
      return next;
    });
    setHintUsed(true);
  }

  function handleCheckAnswer() {
    if (!currentCard || checkedAnswer || savingAnswer) {
      return;
    }

    const attempt = buildAttempt(currentCard, placements);
    const nextIsCorrect =
      normalizeForComparison(attempt) ===
      normalizeForComparison(currentCard.answer);

    setCheckedAnswer(true);
    setIsCorrectAnswer(nextIsCorrect);
    setPendingUpdates((previous) => [
      ...previous,
      {
        wordIndex: currentCard.deckIndex,
        delta: nextIsCorrect ? CORRECT_ANSWER_DELTA : -WRONG_ANSWER_DELTA,
      },
    ]);

    if (nextIsCorrect) {
      setCorrectAnswers((previous) => previous + 1);
      return;
    }

    setRemainingLives((previous) => Math.max(0, previous - 1));
  }

  async function handleNextCard() {
    if (!currentCard || !checkedAnswer || savingAnswer) {
      return;
    }

    if (currentCardIndex < round.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setTurnState(round[nextIndex] ?? null);
      return;
    }

    if (!user || !deck) {
      setGameError("Unable to save build-word progress");
      return;
    }

    setSavingAnswer(true);

    try {
      await submitStudyResults({
        deckId,
        userId: user.uid,
        languageCode: deck.study,
        xpReward: BUILD_REWARD_XP,
        updates: pendingUpdates,
      });
      setRoundComplete(true);
    } catch (updateError) {
      setGameError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to save build-word progress",
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
              {getTranslation("buildWord.title")}
            </Typography>
            <RewardBadge xp={BUILD_REWARD_XP} />
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
                backgroundColor: redesign.surface.secondary,
                borderColor: redesign.border,
                px: 3,
                py: 4,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontFamily: displayFont, fontWeight: 300, mb: 1.5 }}
              >
                {getTranslation("buildWord.wellDone")}
              </Typography>
              <Typography sx={{ color: redesign.text.secondary, mb: 2.5 }}>
                {`${correctAnswers}/${round.length} ${getTranslation("buildWord.correctAnswers")}`}
              </Typography>
              <Box
                sx={{
                  mb: 3.5,
                  mx: "auto",
                  maxWidth: 220,
                  borderRadius: 999,
                  px: 1.75,
                  py: 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: redesign.accentBackground.success,
                  border: `1px solid ${alpha(redesign.accent.success, 0.28)}`,
                }}
              >
                <Typography
                  sx={{ color: redesign.accent.success, fontSize: 14 }}
                >
                  ⭐
                </Typography>
                <Typography
                  sx={{
                    color: redesign.accent.success,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  +{BUILD_REWARD_XP} XP earned
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                <Button
                  onClick={() => startRound(deck.words)}
                  variant="contained"
                  startIcon={<ReplayRoundedIcon />}
                  sx={{
                    py: 1.5,
                    bgcolor: redesign.accent.success,
                    color: redesign.text.primary,
                    "&:hover": { bgcolor: redesign.accent.success },
                  }}
                >
                  {getTranslation("buildWord.nextRound")}
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
                  {getTranslation("buildWord.goHome")}
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
              textAlign: "center",
              backgroundColor: redesign.surface.secondary,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: redesign.text.primary, mb: 1.5 }}
            >
              {getTranslation("buildWord.title")}
            </Typography>
            <Typography sx={{ color: redesign.text.secondary, mb: 3 }}>
              {getTranslation("buildWord.emptyDeck")}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(`/deck/${deckId}`)}
              sx={{
                bgcolor: redesign.accent.success,
                color: redesign.text.primary,
              }}
            >
              {getTranslation("buildWord.backToDeck")}
            </Button>
          </Card>
        </Box>
      </RedesignedScreenShell>
    );
  }

  const studyLanguage = getLanguageName(deck.study);
  const currentAttempt = buildAttempt(currentCard, placements);

  return (
    <RedesignedScreenShell>
      <Box
        sx={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 3 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}
          >
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
              {getTranslation("buildWord.title")}
            </Typography>

            <LivesDisplay lives={remainingLives} maxLives={BUILD_MAX_LIVES} />
          </Box>

          <Card
            sx={{
              mb: 3,
              px: 2.5,
              py: 2.5,
              borderRadius: radii.large,
              backgroundColor: redesign.surface.secondary,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: redesign.text.muted,
                mb: 1,
              }}
            >
              {`${getTranslation("buildWord.translateTo")} ${studyLanguage}`}
            </Typography>
            <Typography
              sx={{
                fontFamily: displayFont,
                fontSize: { xs: "2.25rem", sm: "2.75rem" },
                fontWeight: 300,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                color: redesign.text.primary,
                mb: 0.75,
              }}
            >
              {currentCard.prompt}
            </Typography>
            <Typography sx={{ color: redesign.text.secondary, fontSize: 14 }}>
              {getTranslation("buildWord.instruction")}
            </Typography>
          </Card>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: 12,
              color: redesign.text.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 1,
            }}
          >
            {`${currentCardIndex + 1} / ${round.length}`}
          </Typography>
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
          <Typography
            sx={{
              textAlign: "center",
              color: redesign.text.secondary,
              fontSize: 12,
              mb: 1.25,
            }}
          >
            {getTranslation("buildWord.answerLabel")}
          </Typography>

          <Tooltip
            arrow
            disableFocusListener
            disableHoverListener
            disableTouchListener
            open={checkedAnswer && isCorrectAnswer === false}
            placement="top"
            title={tooltipMessage}
          >
            <Box
              sx={{
                minHeight: 84,
                mb: 2,
                px: 2,
                py: 1.5,
                borderRadius: radii.medium,
                backgroundColor: redesign.surface.primary,
                border: `1.5px dashed ${
                  checkedAnswer && isCorrectAnswer !== null
                    ? isCorrectAnswer
                      ? alpha(redesign.accent.success, 0.5)
                      : alpha(redesign.accent.danger, 0.5)
                    : redesign.border
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 0.75,
                }}
              >
                {(() => {
                  let playableIndex = 0;

                  return currentCard.answerUnits.map((unit, unitIndex) => {
                    if (!unit.isPlayable) {
                      return (
                        <Box
                          key={`fixed-${unitIndex}`}
                          sx={{
                            minWidth: 22,
                            height: 52,
                            px: 0.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: displayFont,
                            fontSize: 24,
                            color:
                              checkedAnswer && isCorrectAnswer !== null
                                ? isCorrectAnswer
                                  ? redesign.accent.success
                                  : redesign.accent.danger
                                : redesign.text.secondary,
                          }}
                        >
                          {unit.value}
                        </Box>
                      );
                    }

                    const placementIndex = playableIndex;
                    const tileId = placements[placementIndex];
                    const tile = currentCard.trayTiles.find(
                      (candidate) => candidate.id === tileId,
                    );
                    const displayValue = tile?.value ?? "_";
                    playableIndex += 1;

                    return (
                      <Button
                        key={`slot-${unitIndex}`}
                        onClick={() => handleRemovePlacement(placementIndex)}
                        variant="text"
                        sx={{
                          minWidth: 44,
                          width: 44,
                          height: 52,
                          p: 0,
                          borderRadius: 1.25,
                          borderBottom: `3px solid ${
                            checkedAnswer && isCorrectAnswer !== null
                              ? isCorrectAnswer
                                ? redesign.accent.success
                                : redesign.accent.danger
                              : tile
                                ? redesign.accent.warm
                                : redesign.border
                          }`,
                          backgroundColor:
                            checkedAnswer && isCorrectAnswer !== null
                              ? isCorrectAnswer
                                ? redesign.accentBackground.success
                                : redesign.accentBackground.danger
                              : tile
                                ? redesign.surface.tertiary
                                : "transparent",
                          color:
                            checkedAnswer && isCorrectAnswer !== null
                              ? isCorrectAnswer
                                ? redesign.accent.success
                                : redesign.accent.danger
                              : tile
                                ? redesign.text.primary
                                : redesign.text.secondary,
                          fontFamily: displayFont,
                          fontSize: 24,
                          pointerEvents: checkedAnswer ? "none" : "auto",
                        }}
                      >
                        {displayValue.toLocaleUpperCase()}
                      </Button>
                    );
                  });
                })()}
              </Box>
            </Box>
          </Tooltip>

          {checkedAnswer && isCorrectAnswer !== null ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{
                color: isCorrectAnswer
                  ? redesign.accent.success
                  : redesign.accent.danger,
                mb: 2.5,
              }}
            >
              {isCorrectAnswer ? (
                <CheckCircleRoundedIcon fontSize="small" />
              ) : (
                <ErrorOutlineRoundedIcon fontSize="small" />
              )}
              <Typography sx={{ fontWeight: 600 }}>
                {isCorrectAnswer
                  ? `${currentAttempt} ✓`
                  : getTranslation("buildWord.tryAgain")}
              </Typography>
            </Stack>
          ) : null}

          <Typography
            sx={{
              textAlign: "center",
              color: redesign.text.secondary,
              fontSize: 12,
              mb: 1.25,
            }}
          >
            {getTranslation("buildWord.trayLabel")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1,
              mb: 3,
            }}
          >
            {currentCard.trayTiles.map((tile) => {
              const isUsed = usedTileIds.has(tile.id);

              return (
                <Button
                  key={tile.id}
                  onClick={() => handlePlaceTile(tile.id)}
                  variant="text"
                  disabled={isUsed || checkedAnswer || savingAnswer}
                  sx={{
                    minWidth: 50,
                    width: 50,
                    height: 58,
                    borderRadius: 1.5,
                    border: `1.5px solid ${redesign.border}`,
                    borderBottom: `4px solid ${redesign.surface.tertiary}`,
                    backgroundColor: redesign.surface.secondary,
                    color: redesign.text.primary,
                    fontFamily: displayFont,
                    fontSize: 26,
                    opacity: isUsed ? 0.2 : 1,
                  }}
                >
                  {tile.value.toLocaleUpperCase()}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Box
          sx={{
            mt: "auto",
            px: 3,
            py: 2,
            borderTop: `1px solid ${redesign.border}`,
            backgroundColor: redesign.surface.primary,
            display: "flex",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleHint}
            variant="outlined"
            disabled={!canUseHint}
            startIcon={<LightbulbRoundedIcon />}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: radii.small,
              borderColor: redesign.border,
              color: hintUsed ? redesign.text.secondary : redesign.text.primary,
            }}
          >
            {hintUsed
              ? getTranslation("buildWord.hintUsed")
              : getTranslation("buildWord.hint")}
          </Button>
          <Button
            onClick={checkedAnswer ? handleNextCard : handleCheckAnswer}
            variant="contained"
            disabled={savingAnswer}
            endIcon={
              savingAnswer ? (
                <CircularProgress size={18} color="inherit" />
              ) : checkedAnswer ? (
                <NavigateNextRoundedIcon />
              ) : null
            }
            sx={{
              flex: 2,
              py: 1.5,
              borderRadius: radii.small,
              backgroundColor: checkedAnswer
                ? redesign.accent.warm
                : redesign.accent.success,
              color: redesign.text.primary,
              "&:hover": {
                backgroundColor: checkedAnswer
                  ? redesign.accent.warm
                  : redesign.accent.success,
              },
            }}
          >
            {checkedAnswer
              ? getTranslation("buildWord.next")
              : getTranslation("buildWord.check")}
          </Button>
        </Box>
      </Box>
    </RedesignedScreenShell>
  );
}

export default function BuildWordGamePage() {
  return (
    <RedesignedThemeProvider>
      <BuildWordGameScreen />
    </RedesignedThemeProvider>
  );
}
