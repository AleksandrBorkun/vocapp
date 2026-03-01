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
} from "@mui/material";

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (word: string, translation: string, example: string) => Promise<void>;
}

export default function AddWordModal({
  open,
  onClose,
  onSave,
}: AddWordModalProps) {
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [example, setExample] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setWord("");
    setTranslation("");
    setExample("");
    onClose();
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
          <TextField
            fullWidth
            label="Word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
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
