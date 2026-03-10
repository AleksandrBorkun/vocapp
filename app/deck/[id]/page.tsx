"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import { Word } from "@/lib/types";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import { useAuth } from "@/app/hooks/useAuth";
import { useWords } from "@/app/hooks/useWords";
import { Box, Container, Typography, IconButton } from "@mui/material";
import DeckHeaderBar from "@/app/components/deck/DeckHeaderBar";
import AddWordButton from "@/app/components/deck/AddWordButton";
import WordCard from "@/app/components/deck/WordCard";

// Lazy load modal for code splitting
const AddWordModal = dynamic(() => import("@/app/components/AddWordModal"), {
  loading: () => <FullPageLoading />,
});

export default function DeckPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  // Use custom hooks
  const { user, loading: authLoading } = useAuth({
    requireAuth: true,
  });
  const {
    deck,
    loading: deckLoading,
    loadDeck,
    updateWord: updateWordInDeck,
    addWord,
  } = useWords();

  const [showTranslations, setShowTranslations] = useState<{
    [key: number]: boolean;
  }>({});
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const loading = authLoading || deckLoading;

  // Load deck when component mounts or deckId changes
  useEffect(() => {
    if (user && deckId) {
      loadDeck(deckId);
    }
  }, [deckId, user, loadDeck]);

  const toggleTranslation = useCallback((index: number) => {
    setShowTranslations((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const handleAddWord = useCallback(() => {
    setShowAddWordModal(true);
  }, []);

  const handleEditWord = useCallback((index: number, word: Word) => {
    setEditingWordIndex(index);
    setEditingWord(word);
    setShowAddWordModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingWordIndex(null);
    setEditingWord(null);
    setShowAddWordModal(false);
  }, []);

  const handleSaveWord = useCallback(
    async (
      word: string,
      translation: string,
      example: string,
      picture?: string,
      index?: number,
    ) => {
      if (!deck) return;

      try {
        if (index !== undefined && index !== null) {
          // Edit existing word
          await updateWordInDeck(deckId, index, {
            word,
            translation,
            example,
            picture,
          });
        } else {
          // Add new word
          await addWord(deckId, {
            word,
            translation,
            example,
            picture,
            accuracy: 0,
          });
        }
      } catch (error) {
        console.error("Error saving word:", error);
      }
    },
    [deck, deckId, updateWordInDeck, addWord],
  );

  if (loading) {
    return <FullPageLoading />;
  }

  if (!deck) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Typography color="text.primary">Deck not found</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 4,
      }}
    >
      {/* Header */}
      <DeckHeaderBar onNavigateHome={() => router.push("/home")} />

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        {/* Title Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            sx={{ fontSize: "1.75rem" }}
          >
            {deck.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              sx={{
                bgcolor: "#B8CAD9",
                width: 48,
                height: 48,
                "&:hover": { bgcolor: "#58748C" },
              }}
            >
              <Box component="span" sx={{ fontSize: "1.5rem" }}>
                👤
              </Box>
            </IconButton>
            <IconButton
              sx={{
                bgcolor: "#B8CAD9",
                width: 48,
                height: 48,
                "&:hover": { bgcolor: "#58748C" },
              }}
            >
              <Box component="span" sx={{ fontSize: "1.5rem" }}>
                🔄
              </Box>
            </IconButton>
          </Box>
        </Box>

        {/* Add Word Button */}
        <AddWordButton onAddWord={handleAddWord} />

        {/* Words List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {deck.words.map((word, index) => (
            <WordCard
              key={index}
              word={word}
              index={index}
              showTranslation={showTranslations[index] || false}
              onToggleTranslation={toggleTranslation}
              onEdit={handleEditWord}
            />
          ))}
        </Box>

        {deck.words.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="secondary.main" variant="body1">
              No words yet. Add your first word to start learning!
            </Typography>
          </Box>
        )}
      </Container>

      {/* Add Word Modal */}
      <AddWordModal
        open={showAddWordModal}
        onClose={handleCloseModal}
        onSave={handleSaveWord}
        sourceLang={deck?.study}
        targetLang={deck?.language}
        editMode={editingWordIndex !== null}
        initialWord={editingWord || undefined}
        wordIndex={editingWordIndex ?? undefined}
      />
    </Box>
  );
}
