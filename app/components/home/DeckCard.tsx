"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Deck } from "@/lib/types";

/**
 * Props for the DeckCard component
 */
interface DeckCardProps {
  /** Deck to display */
  deck: Deck;
  /** Function called when study button is clicked */
  onStudy: (deck: Deck) => void;
  /** Function called when add words button is clicked */
  onAddWords: (deckId: string) => void;
  /** Function called when delete button is clicked */
  onDelete: (deckId: string) => void;
}

/**
 * Card component displaying a single vocabulary deck
 * Shows deck info, word count, and action buttons
 *
 * @component
 * @example
 * <DeckCard
 *   deck={myDeck}
 *   onStudy={handleStudy}
 *   onAddWords={handleAddWords}
 *   onDelete={handleDelete}
 * />
 */

function DeckCard({ deck, onStudy, onAddWords, onDelete }: DeckCardProps) {
  const router = useRouter();

  return (
    <Card
      sx={{
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        border: 1,
        borderColor: "secondary.main",
        "&:hover": {
          borderColor: "primary.main",
        },
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          p: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          color="text.primary"
          mb={3}
          onClick={() => router.push(`/deck/${deck.id}`)}
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem" },
            textAlign: "center",
            cursor: "pointer",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          {deck.name}
        </Typography>
        <Typography variant="body2" color="secondary.main" mb={1}>
          {deck.description}
        </Typography>
        <Typography variant="body2" color="text.primary" mb={0.5}>
          {deck.study} → {deck.language}
        </Typography>
        <Typography variant="body2" color="text.primary" mb={2}>
          {deck.words.length} words
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
          <Button
            onClick={() => onStudy(deck)}
            variant="contained"
            size="small"
            sx={{ flex: 1 }}
            data-testid="study-button"
          >
            Study
          </Button>
          <Button
            onClick={() => onAddWords(deck.id)}
            variant="outlined"
            size="small"
            sx={{ flex: 1 }}
            data-testid="add-words-button"
          >
            Add Words
          </Button>
          <Button
            onClick={() => onDelete(deck.id)}
            variant="outlined"
            size="small"
            data-testid="delete-deck-button"
            color="error"
            sx={{
              bgcolor: "error.dark",
              color: "error.light",
              borderColor: "error.dark",
              "&:hover": {
                bgcolor: "error.main",
                borderColor: "error.main",
              },
            }}
          >
            Delete
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default memo(DeckCard);
