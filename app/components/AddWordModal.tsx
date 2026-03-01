"use client";

import { useState } from "react";
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
  onSave: (word: string, translation: string, example: string) => Promise<void>;
  sourceLang?: string;
  targetLang?: string;
}

export default function AddWordModal({
  open,
  onClose,
  onSave,
  sourceLang,
  targetLang,
}: AddWordModalProps) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const handleClose = () => {
    setWord("");
    setTranslation("");
    setExample("");
    setTranslationError(null);
    onClose();
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
      await onSave(word, translation, example);
      setWord("");
      setTranslation("");
      setExample("");
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
          Add New Word
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {translationError && (
            <Alert severity="error" onClose={() => setTranslationError(null)}>
              {translationError}
            </Alert>
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
          {isSubmitting ? "Adding..." : "Add Word"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
