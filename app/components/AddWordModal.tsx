"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    word: string,
    translation: string,
    example: string,
    picture?: string,
    index?: number,
  ) => Promise<void>;
  sourceLang?: string;
  targetLang?: string;
  editMode?: boolean;
  initialWord?: {
    word: string;
    translation: string;
    example?: string;
    picture?: string;
  };
  wordIndex?: number;
}

export default function AddWordModal({
  open,
  onClose,
  onSave,
  sourceLang,
  targetLang,
  editMode = false,
  initialWord,
  wordIndex,
}: AddWordModalProps) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [picture, setPicture] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);

  useEffect(() => {
    if (open && editMode && initialWord) {
      setWord(initialWord.word);
      setTranslation(initialWord.translation);
      setExample(initialWord.example || "");
      setPicture(initialWord.picture || null);
    } else if (open && !editMode) {
      setWord("");
      setTranslation("");
      setExample("");
      setPicture(null);
    }
  }, [open, editMode, initialWord]);

  const handleClose = () => {
    setWord("");
    setTranslation("");
    setExample("");
    setPicture(null);
    setTranslationError(null);
    setImageWarning(null);
    onClose();
  };

  const fetchImage = async (searchWord: string, language: string) => {
    if (!searchWord.trim() || !language) return;

    setLoadingImage(true);
    setImageWarning(null);

    try {
      const response = await fetch("/api/pixabay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: searchWord.trim(),
          lang: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImageWarning(
          data.error ||
            "Failed to fetch image. You can still save without a picture.",
        );
        setPicture(null);
        return;
      }

      if (data.imageUrl) {
        setPicture(data.imageUrl);
        setImageWarning(null);
      } else {
        setImageWarning(
          "No image found for this word. You can still save without a picture.",
        );
        setPicture(null);
      }
    } catch (error) {
      console.error("Image fetch error:", error);
      setImageWarning(
        "Failed to fetch image. You can still save without a picture.",
      );
      setPicture(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleTranslate = async () => {
    if (!word.trim()) return;

    if (!targetLang) {
      setTranslationError(
        "Translation not available: language information missing",
      );
      return;
    }

    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: word.trim(),
          sourceLang: sourceLang,
          targetLang: targetLang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTranslationError(data.error || "Translation failed");
        return;
      }

      if (data.translatedText) {
        setTranslation(data.translatedText);
        // Automatically fetch image after successful translation
        if (sourceLang) {
          await fetchImage(word.trim(), sourceLang);
        }
      } else {
        setTranslationError("No translation returned");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationError("Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async () => {
    if (!word || !translation) return;

    setIsSubmitting(true);
    try {
      await onSave(
        word,
        translation,
        example,
        picture || undefined,
        editMode ? wordIndex : undefined,
      );
      setWord("");
      setTranslation("");
      setExample("");
      setPicture(null);
      setImageWarning(null);
      onClose();
    } catch (error) {
      console.error("Error saving word:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: 2,
          border: 1,
          borderColor: "secondary.main",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          {editMode ? "Edit Word" : "Add New Word"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {translationError && (
            <Alert severity="error" onClose={() => setTranslationError(null)}>
              {translationError}
            </Alert>
          )}
          {imageWarning && <Alert severity="warning">{imageWarning}</Alert>}
          {loadingImage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Fetching image...
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTranslate}
                    disabled={!word.trim() || isTranslating || !targetLang}
                    edge="end"
                    title="Translate"
                  >
                    {isTranslating ? (
                      <CircularProgress size={24} />
                    ) : (
                      <TranslateIcon />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Translation"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Example (optional)"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            multiline
            rows={3}
          />
          {picture && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                p: 2,
                border: 1,
                borderColor: "secondary.main",
                borderRadius: 1,
                bgcolor: "background.default",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Image Preview
              </Typography>
              <Box
                component="img"
                src={picture}
                alt={word}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "secondary.main",
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ flex: 1 }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!word || !translation || isSubmitting}
          sx={{ flex: 1 }}
        >
          {isSubmitting
            ? editMode
              ? "Updating..."
              : "Adding..."
            : editMode
              ? "Update"
              : "Add Word"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
