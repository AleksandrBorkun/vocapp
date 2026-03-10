"use client";

import { useState, forwardRef } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  LinearProgress,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Deck } from "@/lib/types";

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface StudyModalProps {
  open: boolean;
  onClose: () => void;
  deck: Deck | null;
}

export default function StudyModal({ open, onClose, deck }: StudyModalProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClose = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    onClose();
  };

  const nextCard = () => {
    if (deck && currentCardIndex < deck.words.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      handleClose();
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={SlideTransition}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: { xs: 0, sm: 2 },
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          border: 1,
          borderColor: "secondary.main",
          m: 0,
          position: { xs: "fixed", sm: "relative" },
          top: { xs: 0, sm: "auto" },
        },
      }}
    >
      {deck && (
        <>
          <DialogTitle>
            <Typography
              variant="h5"
              fontWeight="bold"
              color="text.primary"
              mb={1}
            >
              {deck.name}
            </Typography>
            <Typography variant="body2" color="secondary.main">
              Word {currentCardIndex + 1} of {deck.words.length}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((currentCardIndex + 1) / deck.words.length) * 100}
              sx={{ mt: 1 }}
            />
          </DialogTitle>
          <DialogContent>
            <Card
              onClick={() => setIsFlipped(!isFlipped)}
              sx={{
                bgcolor: "background.default",
                p: { xs: 4, sm: 6 },
                borderRadius: 2,
                border: 2,
                borderColor: "secondary.main",
                "&:hover": {
                  borderColor: "primary.main",
                },
                cursor: "pointer",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Typography
                variant="h5"
                color="text.primary"
                textAlign="center"
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" }, mb: 2 }}
              >
                {isFlipped
                  ? deck.words[currentCardIndex].translation
                  : deck.words[currentCardIndex].word}
              </Typography>
              {isFlipped && deck.words[currentCardIndex].example && (
                <Typography
                  variant="body2"
                  color="secondary.main"
                  textAlign="center"
                  sx={{ fontStyle: "italic", mt: 2 }}
                >
                  "{deck.words[currentCardIndex].example}"
                </Typography>
              )}
            </Card>

            <Typography
              variant="body2"
              color="secondary.main"
              textAlign="center"
              mb={3}
            >
              {isFlipped ? "Click to see word" : "Click to see translation"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
              <Button
                onClick={previousCard}
                disabled={currentCardIndex === 0}
                variant="outlined"
                sx={{ flex: 1, py: 1.5 }}
              >
                Previous
              </Button>
              <Button
                onClick={nextCard}
                variant="contained"
                sx={{ flex: 1, py: 1.5 }}
              >
                {currentCardIndex === deck.words.length - 1 ? "Finish" : "Next"}
              </Button>
            </Box>

            <Button
              onClick={handleClose}
              fullWidth
              sx={{
                color: "secondary.main",
                "&:hover": { color: "text.primary" },
              }}
            >
              Close
            </Button>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
