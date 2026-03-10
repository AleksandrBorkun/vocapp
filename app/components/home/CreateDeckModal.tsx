"use client";

import { useState, forwardRef } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Word } from "@/lib/types";

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/**
 * Props for the CreateDeckModal component
 */
interface CreateDeckModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Function called when modal is closed */
  onClose: () => void;
  /** Function to create a new deck with initial words */
  onSubmit: (
    name: string,
    description: string,
    studyLanguage: string,
    nativeLanguage: string,
    words: Word[],
  ) => Promise<void>;
}

/**
 * Modal for creating a new vocabulary deck
 * Allows users to set deck details and add initial words
 *
 * @component
 * @example
 * <CreateDeckModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={handleCreateDeck}
 * />
 */

export default function CreateDeckModal({
  open,
  onClose,
  onSubmit,
}: CreateDeckModalProps) {
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [studyLanguage, setStudyLanguage] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [newWords, setNewWords] = useState<Word[]>([
    { word: "", translation: "", example: "", accuracy: 0 },
  ]);

  const resetForm = () => {
    setNewDeckName("");
    setNewDeckDescription("");
    setStudyLanguage("");
    setNativeLanguage("");
    setNewWords([{ word: "", translation: "", example: "", accuracy: 0 }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validWords = newWords.filter(
      (word) => word.word.trim() && word.translation.trim(),
    );

    await onSubmit(
      newDeckName,
      newDeckDescription,
      studyLanguage,
      nativeLanguage,
      validWords,
    );

    resetForm();
  };

  const addWordInput = () => {
    setNewWords([
      ...newWords,
      { word: "", translation: "", example: "", accuracy: 0 },
    ]);
  };

  const updateWord = (
    index: number,
    field: "word" | "translation" | "example",
    value: string,
  ) => {
    const updated = [...newWords];
    updated[index][field] = value;
    setNewWords(updated);
  };

  const removeWord = (index: number) => {
    if (newWords.length > 1) {
      setNewWords(newWords.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={SlideTransition}
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
          Create New Vocabulary Deck
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ maxHeight: "70vh" }}>
        <Box
          component="form"
          id="createDeckForm"
          onSubmit={handleSubmit}
          sx={{ mt: 2 }}
        >
          <TextField
            fullWidth
            label="Deck Name"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={newDeckDescription}
            onChange={(e) => setNewDeckDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Study Language (e.g., DK)"
              value={studyLanguage}
              onChange={(e) => setStudyLanguage(e.target.value)}
              required
              placeholder="DK"
              helperText="Language you want to learn"
            />
            <TextField
              fullWidth
              label="Native Language (e.g., EN)"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              required
              placeholder="EN"
              helperText="Your native language"
            />
          </Box>

          <Typography
            variant="body2"
            fontWeight={500}
            color="text.primary"
            mb={2}
          >
            Words
          </Typography>
          {newWords.map((word, index) => (
            <Card
              key={index}
              sx={{
                mb: 2,
                p: 2,
                bgcolor: "background.default",
                border: 1,
                borderColor: "secondary.main",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2" color="text.primary">
                  Word {index + 1}
                </Typography>
                {newWords.length > 1 && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => removeWord(index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              <TextField
                fullWidth
                placeholder="Word to study"
                value={word.word}
                onChange={(e) => updateWord(index, "word", e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                placeholder="Translation"
                value={word.translation}
                onChange={(e) =>
                  updateWord(index, "translation", e.target.value)
                }
                size="small"
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                placeholder="Example sentence (optional)"
                value={word.example || ""}
                onChange={(e) => updateWord(index, "example", e.target.value)}
                size="small"
                multiline
                rows={2}
              />
            </Card>
          ))}
          <Button
            fullWidth
            variant="outlined"
            onClick={addWordInput}
            sx={{
              py: 1,
              border: 2,
              borderStyle: "dashed",
              borderColor: "secondary.main",
              color: "secondary.main",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                borderStyle: "dashed",
                border: 2,
              },
            }}
          >
            + Add Another Word
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: "secondary.main" }}>
        <Button onClick={handleClose} variant="outlined" sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="createDeckForm"
          variant="contained"
          sx={{ flex: 1 }}
        >
          Create Deck
        </Button>
      </DialogActions>
    </Dialog>
  );
}
