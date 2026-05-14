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
import { useAuth } from "@/app/hooks/useAuth";
import { useWords } from "@/app/hooks/useWords";
import { getTranslation } from "@/lib/translations";
import { Word } from "@/lib/types";
import { getLanguageName } from "@/lib/utils/languageMapper";
import {
  IndexedWord,
  selectStudyWords,
  shuffleArray,
} from "@/lib/utils/studyGame";

const ROUND_SIZE = 10;
const HEART_COUNT = 3;
const SERIF_FONT = '"Fraunces", Georgia, serif';
const ACCENT_COLOR = "#c87c3b";
const SUCCESS_COLOR = "#52b86a";
const ERROR_COLOR = "#d44e3c";
const FALLBACK_DECOY_LETTERS = Array.from("abcdefghijklmnopqrstuvwxyz");

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

export default function BuildWordGamePage() {
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
  const [placements, setPlacements] = useState<Array<string | null>>([]);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

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

  async function handleCheckAnswer() {
    if (!currentCard || checkedAnswer || savingAnswer) {
      return;
    }

    const attempt = buildAttempt(currentCard, placements);
    const nextIsCorrect =
      normalizeForComparison(attempt) ===
      normalizeForComparison(currentCard.answer);

    setCheckedAnswer(true);
    setIsCorrectAnswer(nextIsCorrect);

    if (nextIsCorrect) {
      setCorrectAnswers((previous) => previous + 1);
    }

    setSavingAnswer(true);

    try {
      await updateWordAccuracy(deckId, currentCard.deckIndex, nextIsCorrect);
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

  function handleNextCard() {
    if (!currentCard || !checkedAnswer || savingAnswer) {
      return;
    }

    if (currentCardIndex === round.length - 1) {
      setRoundComplete(true);
      return;
    }

    const nextIndex = currentCardIndex + 1;
    setCurrentCardIndex(nextIndex);
    setTurnState(round[nextIndex] ?? null);
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
            sx={{ minWidth: 0, width: 44, height: 44, borderRadius: 3 }}
          >
            <ArrowBackRoundedIcon />
          </Button>
          <Typography
            variant="h4"
            sx={{ fontFamily: SERIF_FONT, fontWeight: 300 }}
          >
            {getTranslation("buildWord.title")}
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
              {getTranslation("buildWord.wellDone")}
            </Typography>
            <Typography variant="h5" color="text.secondary" mb={4}>
              {`${correctAnswers}/${round.length} ${getTranslation("buildWord.correctAnswers")}`}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                onClick={() => startRound(deck.words)}
                variant="contained"
                startIcon={<ReplayRoundedIcon />}
                sx={{ py: 1.5 }}
              >
                {getTranslation("buildWord.nextRound")}
              </Button>
              <Button
                onClick={() => router.push("/home")}
                variant="outlined"
                startIcon={<HomeRoundedIcon />}
                sx={{ py: 1.5 }}
              >
                {getTranslation("buildWord.goHome")}
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
            {getTranslation("buildWord.title")}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {getTranslation("buildWord.emptyDeck")}
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push(`/deck/${deckId}`)}
          >
            {getTranslation("buildWord.backToDeck")}
          </Button>
        </Card>
      </Box>
    );
  }

  const studyLanguage = getLanguageName(deck.study);
  const currentAttempt = buildAttempt(currentCard, placements);

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
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
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
            {getTranslation("buildWord.title")}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, fontSize: "1.1rem" }}>
            {Array.from({ length: HEART_COUNT }).map((_, index) => (
              <Box key={`heart-${index}`} component="span">
                ❤
              </Box>
            ))}
          </Box>
        </Box>

        <Typography
          sx={{
            color: alpha(theme.palette.text.secondary, 0.72),
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            mb: 1,
          }}
        >
          {`${currentCardIndex + 1} / ${round.length}`}
        </Typography>

        <Card
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: 5,
            bgcolor: alpha(theme.palette.background.paper, 0.92),
            border: 1,
            borderColor: alpha(theme.palette.text.secondary, 0.14),
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: alpha(theme.palette.text.secondary, 0.54),
              mb: 1,
            }}
          >
            {`${getTranslation("buildWord.translateTo")} ${studyLanguage}`}
          </Typography>
          <Typography
            sx={{
              fontFamily: SERIF_FONT,
              fontSize: { xs: "2.5rem", sm: "3rem" },
              fontWeight: 300,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              mb: 1,
            }}
          >
            {currentCard.prompt}
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {getTranslation("buildWord.instruction")}
          </Typography>
        </Card>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 },
          maxWidth: 760,
          width: "100%",
          mx: "auto",
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            color: "text.secondary",
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
              p: 2,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.common.black, 0.18),
              border: 1.5,
              borderStyle: "dashed",
              borderColor:
                checkedAnswer && isCorrectAnswer !== null
                  ? isCorrectAnswer
                    ? alpha(SUCCESS_COLOR, 0.5)
                    : alpha(ERROR_COLOR, 0.5)
                  : alpha(theme.palette.text.secondary, 0.18),
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
                          fontFamily: SERIF_FONT,
                          fontSize: 24,
                          color:
                            checkedAnswer && isCorrectAnswer !== null
                              ? isCorrectAnswer
                                ? SUCCESS_COLOR
                                : ERROR_COLOR
                              : "text.secondary",
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
                        borderRadius: 2.5,
                        borderBottom: 3,
                        borderColor:
                          checkedAnswer && isCorrectAnswer !== null
                            ? isCorrectAnswer
                              ? SUCCESS_COLOR
                              : ERROR_COLOR
                            : tile
                              ? ACCENT_COLOR
                              : alpha(theme.palette.text.secondary, 0.22),
                        bgcolor:
                          checkedAnswer && isCorrectAnswer !== null
                            ? isCorrectAnswer
                              ? alpha(SUCCESS_COLOR, 0.12)
                              : alpha(ERROR_COLOR, 0.12)
                            : tile
                              ? alpha(ACCENT_COLOR, 0.12)
                              : "transparent",
                        color:
                          checkedAnswer && isCorrectAnswer !== null
                            ? isCorrectAnswer
                              ? SUCCESS_COLOR
                              : ERROR_COLOR
                            : tile
                              ? "text.primary"
                              : "text.secondary",
                        fontFamily: SERIF_FONT,
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
              color: isCorrectAnswer ? SUCCESS_COLOR : ERROR_COLOR,
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
            color: "text.secondary",
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
                  borderRadius: 3,
                  border: 1.5,
                  borderColor: alpha(theme.palette.text.secondary, 0.12),
                  borderBottom: 4,
                  borderBottomColor: alpha(theme.palette.common.black, 0.28),
                  bgcolor: alpha(theme.palette.background.paper, 0.92),
                  color: "text.primary",
                  fontFamily: SERIF_FONT,
                  fontSize: 26,
                  opacity: isUsed ? 0.2 : 1,
                }}
              >
                {tile.value.toLocaleUpperCase()}
              </Button>
            );
          })}
        </Box>

        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: 1,
            borderColor: alpha(theme.palette.text.secondary, 0.12),
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
              borderRadius: 3,
              color: hintUsed ? "text.secondary" : "text.primary",
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
              borderRadius: 3,
              bgcolor: checkedAnswer ? ACCENT_COLOR : SUCCESS_COLOR,
              "&:hover": {
                bgcolor: checkedAnswer ? ACCENT_COLOR : SUCCESS_COLOR,
              },
            }}
          >
            {checkedAnswer
              ? getTranslation("buildWord.next")
              : getTranslation("buildWord.check")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
