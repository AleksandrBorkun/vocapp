"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PhotoLibraryRoundedIcon from "@mui/icons-material/PhotoLibraryRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import ErrorState from "@/app/components/common/ErrorState";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import RedesignedScreenShell from "@/app/components/redesigned/primitives/RedesignedScreenShell";
import BottomTabBar from "@/app/components/redesigned/quests/BottomTabBar";
import {
  RedesignedTabId,
  getRedesignedTabs,
} from "@/app/hooks/useRedesignedHomeDashboard";
import { useAuth } from "@/app/hooks/useAuth";
import { useDecks } from "@/app/hooks/useDecks";
import { Deck, Word } from "@/lib/types";
import { redesignedFonts, redesignedPalette } from "@/lib/redesigned/tokens";
import {
  extractWordsFromImage,
  OcrPageSize,
  OcrWordBox,
} from "@/lib/utils/ocr";
import {
  getActiveDeckIdCookie,
  setActiveDeckIdCookie,
} from "@/lib/utils/activeDeckCookie";
import {
  getLanguageName,
  normalizeLanguageCode,
} from "@/lib/utils/languageMapper";

type AddMode = "manual" | "scan";

type BannerState = {
  severity: "success" | "warning" | "error";
  message: string;
} | null;

interface DetectedScanWord extends OcrWordBox {
  id: string;
  translation: string;
  selected: boolean;
}

const MAX_PRESELECTED_SCAN_WORDS = 2;

const panelSx = {
  mt: 2.5,
  mx: 3,
  borderRadius: 4,
  border: `1px solid ${redesignedPalette.border}`,
  backgroundColor: redesignedPalette.surface.secondary,
};

const inputSx = {
  borderRadius: 3.5,
  border: `1.5px solid ${redesignedPalette.border}`,
  backgroundColor: redesignedPalette.surface.secondary,
  px: 2,
  py: 1.75,
  color: redesignedPalette.text.primary,
  fontSize: 16,
  transition: "border-color 0.15s ease, background-color 0.15s ease",
  "&:focus-within": {
    borderColor: redesignedPalette.accent.warm,
    backgroundColor: redesignedPalette.accentBackground.warm,
  },
};

function buildScanButtonLabel(selectedCount: number) {
  if (selectedCount === 0) {
    return "Select words above";
  }

  return `Add ${selectedCount} word${selectedCount === 1 ? "" : "s"} to deck`;
}

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      sourceLang,
      targetLang,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to translate word");
  }

  if (typeof data.translatedText !== "string" || !data.translatedText.trim()) {
    throw new Error("Translation service returned an empty result");
  }

  return data.translatedText.trim();
}

async function translateTexts(
  texts: string[],
  sourceLang: string,
  targetLang: string,
) {
  if (texts.length === 0) {
    return [] as string[];
  }

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      sourceLang,
      targetLang,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to translate detected words");
  }

  if (!Array.isArray(data.translations)) {
    throw new Error("Translation service returned an unexpected response");
  }

  return data.translations.map((item: { translatedText?: string }) =>
    typeof item.translatedText === "string" ? item.translatedText.trim() : "",
  );
}

function createScanWords(wordBoxes: OcrWordBox[], translations: string[]) {
  return wordBoxes.map((wordBox, index) => ({
    ...wordBox,
    id: `${wordBox.text.toLocaleLowerCase()}-${index}`,
    translation: translations[index] || "",
    selected: index < Math.min(MAX_PRESELECTED_SCAN_WORDS, wordBoxes.length),
  }));
}

export default function RedesignedAddWordPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<AddMode>("manual");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [deckMenuAnchor, setDeckMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [banner, setBanner] = useState<BannerState>(null);
  const [nativeWord, setNativeWord] = useState("");
  const [learningWord, setLearningWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [suggestedLearningWord, setSuggestedLearningWord] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [scanImageFile, setScanImageFile] = useState<File | null>(null);
  const [scanImageSrc, setScanImageSrc] = useState("");
  const [scanPageSize, setScanPageSize] = useState<OcrPageSize | null>(null);
  const [scanWords, setScanWords] = useState<DetectedScanWord[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanTranslationLoading, setScanTranslationLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const {
    user,
    loading: authLoading,
    error: authError,
  } = useAuth({
    requireAuth: true,
    requireOnboarding: true,
    redirectTo: "/login",
  });
  const {
    decks,
    loading: decksLoading,
    error: decksError,
    addWordToDeck,
  } = useDecks(user);

  useEffect(() => {
    setActiveDeckId(getActiveDeckIdCookie());
  }, []);

  useEffect(() => {
    if (!banner) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBanner(null);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [banner]);

  useEffect(() => {
    if (decksLoading) {
      return;
    }

    const cookieDeckId = getActiveDeckIdCookie();
    const nextDeckId =
      decks.find((deck) => deck.id === activeDeckId)?.id ??
      decks.find((deck) => deck.id === cookieDeckId)?.id ??
      decks[0]?.id ??
      null;

    if (nextDeckId && nextDeckId !== activeDeckId) {
      setActiveDeckId(nextDeckId);
      setActiveDeckIdCookie(nextDeckId);
    }

    if (!nextDeckId && activeDeckId !== null) {
      setActiveDeckId(null);
    }
  }, [activeDeckId, decks, decksLoading]);

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) ?? decks[0] ?? null,
    [activeDeckId, decks],
  );

  const nativeLanguageLabel = useMemo(
    () => getLanguageName(activeDeck?.language || "en"),
    [activeDeck?.language],
  );
  const learningLanguageLabel = useMemo(
    () => getLanguageName(activeDeck?.study || "en"),
    [activeDeck?.study],
  );
  const selectedScanCount = useMemo(
    () => scanWords.filter((word) => word.selected).length,
    [scanWords],
  );
  const selectedScanMissingTranslations = useMemo(
    () =>
      scanWords.filter((word) => word.selected && !word.translation.trim())
        .length,
    [scanWords],
  );
  const canSaveManual =
    !!activeDeck &&
    !!nativeWord.trim() &&
    !!learningWord.trim() &&
    !saveLoading;
  const canSaveScan =
    !!activeDeck &&
    selectedScanCount > 0 &&
    selectedScanMissingTranslations === 0 &&
    !scanTranslationLoading &&
    !saveLoading;

  const resetManualForm = useCallback(() => {
    setNativeWord("");
    setLearningWord("");
    setPronunciation("");
    setContextNote("");
    setSuggestedLearningWord("");
    setSuggestionError(null);
  }, []);

  const resetScanState = useCallback(() => {
    setScanImageFile(null);
    setScanImageSrc("");
    setScanPageSize(null);
    setScanWords([]);
    setScanError(null);
    setScanTranslationLoading(false);
  }, []);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    if (activeDeck) {
      router.push(`/redesigned/decks/${activeDeck.id}`);
      return;
    }

    router.push("/redesigned/home");
  }, [activeDeck, router]);

  const openDeckMenu = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setDeckMenuAnchor(event.currentTarget);
    },
    [],
  );

  const closeDeckMenu = useCallback(() => {
    setDeckMenuAnchor(null);
  }, []);

  const selectDeck = useCallback((deck: Deck) => {
    setActiveDeckId(deck.id);
    setActiveDeckIdCookie(deck.id);
    setDeckMenuAnchor(null);
  }, []);

  const triggerNativeImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleScanFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      setMode("scan");
      setScanError(null);
      setScanImageFile(file);
      event.target.value = "";
    },
    [],
  );

  const handleTabSelect = useCallback(
    (tabId: string) => {
      switch (tabId as RedesignedTabId) {
        case "quests":
          router.push("/redesigned/home");
          break;
        case "decks":
          if (activeDeck) {
            router.push(`/redesigned/decks/${activeDeck.id}`);
          } else {
            router.push("/home");
          }
          break;
        case "profile":
          router.push("/redesigned/profile");
          break;
        case "add":
        default:
          break;
      }
    },
    [activeDeck, router],
  );

  useEffect(() => {
    if (!activeDeck || !nativeWord.trim()) {
      setSuggestedLearningWord("");
      setSuggestionError(null);
      setSuggestionLoading(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setSuggestionLoading(true);
        setSuggestionError(null);
        const nextSuggestion = await translateText(
          nativeWord.trim(),
          normalizeLanguageCode(activeDeck.language),
          normalizeLanguageCode(activeDeck.study),
        );

        if (!cancelled) {
          setSuggestedLearningWord(nextSuggestion);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestionError(
            error instanceof Error
              ? error.message
              : "Could not suggest a translation",
          );
        }
      } finally {
        if (!cancelled) {
          setSuggestionLoading(false);
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeDeck, nativeWord]);

  useEffect(() => {
    if (!scanImageFile || !activeDeck) {
      return;
    }

    const currentImageFile = scanImageFile;
    const currentDeck = activeDeck;
    let cancelled = false;

    async function processImage() {
      try {
        setScanLoading(true);
        setScanError(null);
        setScanTranslationLoading(false);

        const extraction = await extractWordsFromImage(
          currentImageFile,
          normalizeLanguageCode(currentDeck.study),
        );

        if (cancelled) {
          return;
        }

        setScanImageSrc(extraction.imageSrc);
        setScanPageSize(extraction.pageSize);

        if (extraction.wordBoxes.length === 0) {
          setScanWords([]);
          setScanError("No readable words were detected in that image.");
          return;
        }

        setScanWords(createScanWords(extraction.wordBoxes, []));
        setScanTranslationLoading(true);

        try {
          const translations = await translateTexts(
            extraction.wordBoxes.map((wordBox) => wordBox.text),
            normalizeLanguageCode(currentDeck.study),
            normalizeLanguageCode(currentDeck.language),
          );

          if (!cancelled) {
            setScanWords(createScanWords(extraction.wordBoxes, translations));
          }
        } catch (error) {
          if (!cancelled) {
            setScanWords(createScanWords(extraction.wordBoxes, []));
            setBanner({
              severity: "warning",
              message:
                error instanceof Error
                  ? error.message
                  : "Detected words loaded, but translations are unavailable.",
            });
          }
        } finally {
          if (!cancelled) {
            setScanTranslationLoading(false);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setScanWords([]);
          setScanImageSrc("");
          setScanPageSize(null);
          setScanError(
            error instanceof Error
              ? error.message
              : "Failed to scan the selected image",
          );
        }
      } finally {
        if (!cancelled) {
          setScanLoading(false);
        }
      }
    }

    processImage();

    return () => {
      cancelled = true;
    };
  }, [activeDeck, scanImageFile]);

  const handleManualSave = useCallback(
    async (keepEditing: boolean) => {
      if (!activeDeck || !nativeWord.trim() || !learningWord.trim()) {
        return;
      }

      setSaveLoading(true);

      try {
        const trimmedContextNote = contextNote.trim();
        const newWord: Word = {
          word: learningWord.trim(),
          translation: nativeWord.trim(),
          example: trimmedContextNote || undefined,
          pronunciation: pronunciation.trim() || undefined,
          contextNote: trimmedContextNote || undefined,
          accuracy: 0,
        };

        await addWordToDeck(activeDeck.id, newWord);
        setBanner({
          severity: "success",
          message: keepEditing
            ? `Saved to ${activeDeck.name}. Add the next word.`
            : `Added to ${activeDeck.name}.`,
        });

        if (keepEditing) {
          resetManualForm();
        } else {
          router.push(`/redesigned/decks/${activeDeck.id}`);
        }
      } catch (error) {
        setBanner({
          severity: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to add word to deck",
        });
      } finally {
        setSaveLoading(false);
      }
    },
    [
      activeDeck,
      addWordToDeck,
      contextNote,
      learningWord,
      nativeWord,
      pronunciation,
      resetManualForm,
      router,
    ],
  );

  const toggleScanWord = useCallback((wordId: string) => {
    setScanWords((currentWords) =>
      currentWords.map((word) =>
        word.id === wordId ? { ...word, selected: !word.selected } : word,
      ),
    );
  }, []);

  const handleScanSave = useCallback(async () => {
    if (!activeDeck) {
      return;
    }

    const selectedWords = scanWords.filter((word) => word.selected);
    if (selectedWords.length === 0) {
      return;
    }

    if (selectedWords.some((word) => !word.translation.trim())) {
      setBanner({
        severity: "error",
        message:
          "Each selected scan word needs a translation before it can be saved.",
      });
      return;
    }

    setSaveLoading(true);

    try {
      for (const word of selectedWords) {
        await addWordToDeck(activeDeck.id, {
          word: word.text,
          translation: word.translation,
          accuracy: 0,
        });
      }

      setBanner({
        severity: "success",
        message: `Added ${selectedWords.length} word${selectedWords.length === 1 ? "" : "s"} to ${activeDeck.name}.`,
      });
      router.push(`/redesigned/decks/${activeDeck.id}`);
    } catch (error) {
      setBanner({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to save detected words",
      });
    } finally {
      setSaveLoading(false);
    }
  }, [activeDeck, addWordToDeck, router, scanWords]);

  const loading = authLoading || decksLoading;
  const error = authError || decksError;

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return <ErrorState error={error} showBackToLogin={false} />;
  }

  if (decks.length === 0) {
    return (
      <RedesignedThemeProvider>
        <RedesignedScreenShell
          footer={
            <BottomTabBar
              items={getRedesignedTabs("add")}
              onSelect={handleTabSelect}
            />
          }
        >
          <Box sx={{ px: 3, py: 4 }}>
            <Typography
              sx={{
                fontFamily: redesignedFonts.displayFallback,
                fontSize: 30,
                fontWeight: 300,
                color: redesignedPalette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Add word
            </Typography>
            <Box
              sx={{
                ...panelSx,
                mx: 0,
                mt: 3,
                p: 3,
              }}
            >
              <Typography
                sx={{ color: redesignedPalette.text.primary, fontSize: 18 }}
              >
                You need a deck before you can add words.
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  color: redesignedPalette.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                Create your first deck from the existing home flow, then come
                back here to add words in the redesigned experience.
              </Typography>
              <Button
                onClick={() => router.push("/home")}
                sx={{
                  mt: 2.5,
                  borderRadius: 3,
                  px: 2.5,
                  py: 1.25,
                  backgroundColor: redesignedPalette.accent.warm,
                  color: "#fff",
                }}
              >
                Go to deck setup
              </Button>
            </Box>
          </Box>
        </RedesignedScreenShell>
      </RedesignedThemeProvider>
    );
  }

  return (
    <RedesignedThemeProvider>
      <RedesignedScreenShell
        footer={
          <BottomTabBar
            items={getRedesignedTabs("add")}
            onSelect={handleTabSelect}
          />
        }
      >
        <Box sx={{ pb: 3 }}>
          <Box
            sx={{
              px: 3,
              pt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <IconButton
              onClick={handleBack}
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                backgroundColor: redesignedPalette.surface.secondary,
                border: `1px solid ${redesignedPalette.border}`,
                color: redesignedPalette.text.primary,
              }}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
            <Typography
              sx={{
                flex: 1,
                fontFamily: redesignedFonts.displayFallback,
                fontSize: 30,
                fontWeight: 300,
                color: redesignedPalette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Add word
            </Typography>
            {mode === "scan" && scanImageSrc ? (
              <Button
                onClick={triggerNativeImagePicker}
                startIcon={<RefreshRoundedIcon />}
                sx={{
                  borderRadius: 2.5,
                  border: `1px solid ${redesignedPalette.border}`,
                  color: redesignedPalette.text.secondary,
                  minWidth: 0,
                  px: 1.5,
                }}
              >
                Retake
              </Button>
            ) : null}
          </Box>

          <Box sx={{ px: 3, mt: 2 }}>
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                p: 0.5,
                borderRadius: 3,
                backgroundColor: redesignedPalette.surface.secondary,
              }}
            >
              <ButtonBase
                onClick={() => setMode("manual")}
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  px: 2,
                  py: 1.25,
                  backgroundColor:
                    mode === "manual"
                      ? redesignedPalette.surface.tertiary
                      : "transparent",
                  color:
                    mode === "manual"
                      ? redesignedPalette.text.primary
                      : redesignedPalette.text.secondary,
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Manual
                </Typography>
              </ButtonBase>
              <ButtonBase
                onClick={() => setMode("scan")}
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  px: 2,
                  py: 1.25,
                  backgroundColor:
                    mode === "scan"
                      ? redesignedPalette.surface.tertiary
                      : "transparent",
                  color:
                    mode === "scan"
                      ? redesignedPalette.text.primary
                      : redesignedPalette.text.secondary,
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  Scan photo
                </Typography>
              </ButtonBase>
            </Stack>
          </Box>

          {banner ? (
            <Alert
              severity={banner.severity}
              sx={{
                mt: 2,
                mx: 3,
                borderRadius: 3,
              }}
            >
              {banner.message}
            </Alert>
          ) : null}

          <ButtonBase
            onClick={openDeckMenu}
            sx={{
              ...panelSx,
              width: "calc(100% - 48px)",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
            }}
          >
            <Box>
              <Typography
                sx={{ color: redesignedPalette.text.secondary, fontSize: 12 }}
              >
                Adding to deck
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  color: redesignedPalette.text.primary,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {activeDeck?.name ?? "Select a deck"}
              </Typography>
            </Box>
            <ExpandMoreRoundedIcon
              sx={{ color: redesignedPalette.text.secondary }}
            />
          </ButtonBase>

          <Menu
            anchorEl={deckMenuAnchor}
            open={Boolean(deckMenuAnchor)}
            onClose={closeDeckMenu}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 3,
                border: `1px solid ${redesignedPalette.border}`,
                backgroundColor: redesignedPalette.surface.primary,
                color: redesignedPalette.text.primary,
              },
            }}
          >
            {decks.map((deck) => (
              <MenuItem
                key={deck.id}
                selected={deck.id === activeDeck?.id}
                onClick={() => selectDeck(deck)}
                sx={{
                  minWidth: 220,
                  color: redesignedPalette.text.primary,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {deck.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: redesignedPalette.text.secondary,
                    }}
                  >
                    {getLanguageName(deck.language)} to{" "}
                    {getLanguageName(deck.study)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleScanFileChange}
          />

          {mode === "manual" ? (
            <>
              <Box sx={{ px: 3, pt: 2.5 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: redesignedPalette.text.secondary,
                        }}
                      >
                        {nativeLanguageLabel} word
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 999,
                          backgroundColor:
                            redesignedPalette.accentBackground.warm,
                          color: redesignedPalette.accent.warm,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Native
                      </Box>
                    </Box>
                    <InputBase
                      value={nativeWord}
                      onChange={(event) => setNativeWord(event.target.value)}
                      placeholder={`e.g. hello in ${nativeLanguageLabel}`}
                      sx={inputSx}
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: redesignedPalette.text.secondary,
                        }}
                      >
                        {learningLanguageLabel} translation
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 999,
                          backgroundColor:
                            redesignedPalette.accentBackground.warm,
                          color: redesignedPalette.accent.warm,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Learning
                      </Box>
                    </Box>
                    <InputBase
                      value={learningWord}
                      onChange={(event) => setLearningWord(event.target.value)}
                      placeholder={`e.g. hello translated to ${learningLanguageLabel}`}
                      sx={inputSx}
                      fullWidth
                    />
                    {suggestionLoading ? (
                      <Box
                        sx={{
                          mt: 1,
                          px: 1.75,
                          py: 1.25,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          borderRadius: 3,
                          border: `1px solid rgba(200, 124, 59, 0.25)`,
                          backgroundColor: redesignedPalette.surface.secondary,
                        }}
                      >
                        <CircularProgress
                          size={14}
                          sx={{ color: redesignedPalette.accent.warm }}
                        />
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: redesignedPalette.text.secondary,
                          }}
                        >
                          Looking up a translation suggestion...
                        </Typography>
                      </Box>
                    ) : null}
                    {!suggestionLoading &&
                    suggestedLearningWord &&
                    suggestedLearningWord.trim().toLocaleLowerCase() !==
                      learningWord.trim().toLocaleLowerCase() ? (
                      <Box
                        sx={{
                          mt: 1,
                          px: 1.75,
                          py: 1.25,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          borderRadius: 3,
                          border: `1px solid rgba(200, 124, 59, 0.25)`,
                          backgroundColor: redesignedPalette.surface.secondary,
                        }}
                      >
                        <AutoAwesomeRoundedIcon
                          sx={{
                            fontSize: 16,
                            color: redesignedPalette.accent.warm,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: redesignedPalette.text.secondary,
                          }}
                        >
                          Suggested:
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: redesignedPalette.accent.warm,
                          }}
                        >
                          {suggestedLearningWord}
                        </Typography>
                        <Button
                          onClick={() => setLearningWord(suggestedLearningWord)}
                          sx={{
                            ml: "auto",
                            minWidth: 0,
                            px: 0,
                            color: redesignedPalette.accent.warm,
                            fontWeight: 700,
                          }}
                        >
                          Use this
                        </Button>
                      </Box>
                    ) : null}
                    {suggestionError ? (
                      <Typography
                        sx={{
                          mt: 0.75,
                          ml: 0.5,
                          fontSize: 12,
                          color: redesignedPalette.text.muted,
                        }}
                      >
                        {suggestionError}
                      </Typography>
                    ) : null}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        mb: 1,
                        fontSize: 13,
                        color: redesignedPalette.text.secondary,
                      }}
                    >
                      Pronunciation guide
                    </Typography>
                    <InputBase
                      value={pronunciation}
                      onChange={(event) => setPronunciation(event.target.value)}
                      placeholder={`Personal pronunciation note for ${learningLanguageLabel}`}
                      sx={{ ...inputSx, py: 1.5, fontSize: 15 }}
                      fullWidth
                    />
                    <Typography
                      sx={{
                        mt: 0.75,
                        ml: 0.5,
                        fontSize: 12,
                        color: redesignedPalette.text.muted,
                      }}
                    >
                      Optional. Saved with the card for future quest prompts.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        mb: 1,
                        fontSize: 13,
                        color: redesignedPalette.text.secondary,
                      }}
                    >
                      Context note
                    </Typography>
                    <InputBase
                      value={contextNote}
                      onChange={(event) => setContextNote(event.target.value)}
                      placeholder="Optional note or usage context"
                      sx={{ ...inputSx, py: 1.5, fontSize: 15 }}
                      fullWidth
                    />
                  </Box>
                </Box>
              </Box>

              <Box sx={{ px: 3, pt: 2.5 }}>
                <Button
                  fullWidth
                  disabled={!canSaveManual}
                  onClick={() => void handleManualSave(false)}
                  sx={{
                    borderRadius: 4,
                    py: 2,
                    backgroundColor: redesignedPalette.accent.warm,
                    color: "#fff",
                    fontSize: 17,
                    fontWeight: 700,
                    opacity: canSaveManual ? 1 : 0.45,
                  }}
                >
                  {saveLoading ? "Saving..." : "Add to deck"}
                </Button>
                <Button
                  fullWidth
                  disabled={!canSaveManual}
                  onClick={() => void handleManualSave(true)}
                  sx={{
                    mt: 0.75,
                    color: redesignedPalette.text.secondary,
                    opacity: canSaveManual ? 1 : 0.45,
                  }}
                >
                  Save & add another
                </Button>
              </Box>
            </>
          ) : (
            <>
              {!scanImageSrc ? (
                <Box
                  sx={{
                    ...panelSx,
                    p: 3,
                    minHeight: 260,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: redesignedPalette.accentBackground.warm,
                      color: redesignedPalette.accent.warm,
                    }}
                  >
                    <PhotoLibraryRoundedIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography
                    sx={{
                      mt: 2,
                      color: redesignedPalette.text.primary,
                      fontSize: 22,
                      fontWeight: 600,
                    }}
                  >
                    Pick an image to scan
                  </Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      maxWidth: 280,
                      color: redesignedPalette.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    Use the native image picker to choose a photo with{" "}
                    {learningLanguageLabel} text. OCR will detect words and let
                    you add them in bulk.
                  </Typography>
                  <Button
                    onClick={triggerNativeImagePicker}
                    startIcon={<PhotoLibraryRoundedIcon />}
                    sx={{
                      mt: 2.5,
                      borderRadius: 4,
                      px: 2.5,
                      py: 1.5,
                      backgroundColor: redesignedPalette.accent.warm,
                      color: "#fff",
                    }}
                  >
                    Choose photo
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ ...panelSx, overflow: "hidden", lineHeight: 0 }}>
                    <Box sx={{ position: "relative" }}>
                      <img
                        src={scanImageSrc}
                        alt="Selected scan source"
                        style={{ width: "100%", display: "block" }}
                      />
                      {scanPageSize ? (
                        <svg
                          viewBox={`0 0 ${scanPageSize.width} ${scanPageSize.height}`}
                          preserveAspectRatio="xMidYMid meet"
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          {scanWords.map((word) => (
                            <rect
                              key={word.id}
                              x={word.x1}
                              y={word.y1}
                              width={word.x2 - word.x1}
                              height={word.y2 - word.y1}
                              onClick={() => toggleScanWord(word.id)}
                              fill={
                                word.selected
                                  ? "rgba(82, 184, 106, 0.22)"
                                  : "rgba(200, 124, 59, 0.15)"
                              }
                              stroke={
                                word.selected
                                  ? "rgba(82, 184, 106, 0.8)"
                                  : "rgba(200, 124, 59, 0.8)"
                              }
                              strokeWidth="2"
                              rx="8"
                              style={{ cursor: "pointer" }}
                            />
                          ))}
                        </svg>
                      ) : null}
                      {scanLoading ? (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(15, 13, 10, 0.72)",
                            gap: 1,
                          }}
                        >
                          <CircularProgress
                            sx={{ color: redesignedPalette.accent.warm }}
                          />
                          <Typography
                            sx={{ color: redesignedPalette.text.primary }}
                          >
                            Reading words from the image...
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>

                  <Box sx={{ px: 3, pt: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: redesignedPalette.text.muted,
                      }}
                    >
                      Detected words - tap to select
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                      sx={{ mt: 1.5 }}
                    >
                      {scanWords.map((word) => (
                        <ButtonBase
                          key={word.id}
                          onClick={() => toggleScanWord(word.id)}
                          sx={{
                            px: 1.75,
                            py: 1.1,
                            borderRadius: 999,
                            border: `1.5px solid ${
                              word.selected
                                ? "rgba(82, 184, 106, 0.45)"
                                : redesignedPalette.border
                            }`,
                            backgroundColor: word.selected
                              ? redesignedPalette.accentBackground.success
                              : redesignedPalette.surface.secondary,
                            alignItems: "center",
                            textAlign: "left",
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: word.selected
                                  ? redesignedPalette.accent.success
                                  : redesignedPalette.text.primary,
                              }}
                            >
                              {word.text}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: word.selected
                                  ? "rgba(82, 184, 106, 0.78)"
                                  : redesignedPalette.text.muted,
                              }}
                            >
                              {word.translation ||
                                (scanTranslationLoading
                                  ? "Translating..."
                                  : "No translation")}
                            </Typography>
                          </Box>
                        </ButtonBase>
                      ))}
                    </Stack>
                    {scanError ? (
                      <Typography
                        sx={{ mt: 1.5, color: redesignedPalette.accent.danger }}
                      >
                        {scanError}
                      </Typography>
                    ) : null}
                  </Box>

                  <Box sx={{ px: 3, pt: 2.5 }}>
                    <Button
                      fullWidth
                      onClick={() => void handleScanSave()}
                      disabled={!canSaveScan}
                      sx={{
                        borderRadius: 4,
                        py: 2,
                        backgroundColor: redesignedPalette.accent.success,
                        color: "#fff",
                        fontSize: 17,
                        fontWeight: 700,
                        opacity: canSaveScan ? 1 : 0.45,
                      }}
                    >
                      {saveLoading
                        ? "Saving..."
                        : scanTranslationLoading
                          ? "Preparing translations..."
                          : buildScanButtonLabel(selectedScanCount)}
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </RedesignedScreenShell>
    </RedesignedThemeProvider>
  );
}
