"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Deck, Word } from "@/lib/types";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import ErrorState from "@/app/components/common/ErrorState";
import AppHeader from "@/app/components/layout/AppHeader";
import { useAuth } from "@/app/hooks/useAuth";
import { useDecks } from "@/app/hooks/useDecks";
import { Box, Container, Typography, Button } from "@mui/material";
import DecksCarousel from "@/app/components/home/DecksCarousel";
import { OverlayPicture } from "@/app/components/deck/OverlayPicture";

// Lazy load modals for code splitting
const AddWordModal = dynamic(() => import("@/app/components/AddWordModal"), {
  loading: () => <FullPageLoading />,
});
const CreateDeckModal = dynamic(
  () => import("@/app/components/home/CreateDeckModal"),
  {
    loading: () => <FullPageLoading />,
  },
);
const StudyModal = dynamic(() => import("@/app/components/home/StudyModal"), {
  loading: () => <FullPageLoading />,
});

export default function HomePage() {
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
    createDeck,
    deleteDeck,
    addWordToDeck,
  } = useDecks(user);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [showAddWordsModal, setShowAddWordsModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [selectedWords, setSelectedWords] = useState<string | null>(null);

  const loading = authLoading || decksLoading;
  const error = authError || decksError;

  const handleCreateDeck = useCallback(
    async (
      name: string,
      description: string,
      studyLanguage: string,
      nativeLanguage: string,
      words: Word[],
    ) => {
      if (!user) return;

      try {
        await createDeck({
          name,
          description,
          study: studyLanguage.toUpperCase(),
          language: nativeLanguage.toUpperCase(),
          words,
        });
        setShowCreateModal(false);
      } catch (error) {
        console.error("Error creating deck:", error);
      }
    },
    [user, createDeck],
  );

  const handleDeleteDeck = useCallback(
    async (deckId: string) => {
      if (!confirm("Are you sure you want to delete this deck?") || !user)
        return;

      try {
        await deleteDeck(user.uid, deckId);
      } catch (error) {
        console.error("Error deleting deck:", error);
      }
    },
    [user, deleteDeck],
  );

  const handleAddWord = useCallback(
    async (word: string, translation: string, example: string) => {
      if (!user || !selectedDeck) return;

      try {
        const newWord: Word = {
          word,
          translation,
          example,
          accuracy: 0,
        };

        await addWordToDeck(selectedDeck.id, newWord);
        setShowAddWordsModal(false);
        setSelectedDeck(null);
      } catch (error) {
        console.error("Error adding word:", error);
        throw error;
      }
    },
    [user, selectedDeck, addWordToDeck],
  );

  const openAddWordsModal = useCallback(
    (deckId: string) => {
      const deck = decks.find((d: Deck) => d.id === deckId);
      if (deck) {
        setSelectedDeck(deck);
        setShowAddWordsModal(true);
      }
    },
    [decks],
  );

  const startStudying = useCallback((deck: Deck) => {
    setCurrentDeck(deck);
    setShowStudyModal(true);
  }, []);

  const handleScanPicture = useCallback((deck: Deck, file: File) => {
    setSelectedDeck(deck);
    setImageFile(file);
  }, []);

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppHeader />

      {/* Main Content */}
      <Container component="main" maxWidth="lg" sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            color="text.primary"
            mb={1}
            sx={{ fontSize: { xs: "1.5rem", sm: "1.875rem" } }}
          >
            My Vocabulary Decks
          </Typography>
          <Typography color="secondary.main">
            Welcome back, {user?.email}
          </Typography>
        </Box>

        {/* Vocabulary Decks */}
        {decks.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6, px: 3 }}>
            <Button
              onClick={() => setShowCreateModal(true)}
              sx={{
                bgcolor: "background.paper",
                p: { xs: 4, sm: 5 },
                borderRadius: 2,
                boxShadow: 3,
                "&:hover": { boxShadow: 6 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                height: "80vh",
                width: "calc(100% - 3rem)",
                maxWidth: "xl",
                border: 2,
                borderStyle: "dashed",
                borderColor: "grey.300",
                "&:hover .add-icon": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <Box
                className="add-icon"
                sx={{
                  fontSize: "3rem",
                  mb: 2,
                  transition: "transform 0.2s",
                }}
              >
                ➕
              </Box>
              <Typography
                variant="h5"
                fontWeight={600}
                color="grey.800"
                mb={1.5}
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                Create Your First Deck
              </Typography>
              <Typography variant="body2" color="grey.600">
                You don't have any vocabulary decks yet. Start building your
                language learning collection now!
              </Typography>
            </Button>
          </Box>
        ) : (
          <DecksCarousel
            decks={decks}
            onStudyDeck={startStudying}
            onAddWords={openAddWordsModal}
            onDeleteDeck={handleDeleteDeck}
            onCreateDeck={() => setShowCreateModal(true)}
            onScanPicture={handleScanPicture}
          />
        )}
      </Container>

      {/* Create Deck Modal */}
      <CreateDeckModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
      />

      {/* Add Word Modal */}
      <AddWordModal
        open={showAddWordsModal}
        onClose={() => {
          setShowAddWordsModal(false);
          setSelectedDeck(null);
          setSelectedWords(null);
          setImageFile(undefined);
        }}
        onSave={handleAddWord}
        sourceLang={selectedDeck?.study}
        targetLang={selectedDeck?.language}
        selectedWords={selectedWords ?? undefined}
      />

      {/* OCR Overlay */}
      <OverlayPicture
        file={imageFile}
        onClose={setImageFile}
        handleAddWord={() => setShowAddWordsModal(true)}
        setEditingWord={setSelectedWords}
      />

      {/* Study Modal */}
      <StudyModal
        open={showStudyModal}
        onClose={() => setShowStudyModal(false)}
        deck={currentDeck}
      />
    </Box>
  );
}
