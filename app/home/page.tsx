"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth, db, getUserDocument } from "@/lib/firebase";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Slide,
  LinearProgress,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";

const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface Deck {
  id: string;
  name: string;
  description: string;
  study: string; // Language code to study e.g. "DK", "ES"
  language: string; // Native language code e.g. "EN", "ES"
  words: Word[];
  createdAt: Date;
}

interface Word {
  word: string; // Word to study
  translation: string;
  example?: string; // Sentence where word is used
  picture?: string; // Base64 encoded image
  accuracy: number; // Number from 0 to 1, shows how often you guess correctly
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  // New deck form
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [studyLanguage, setStudyLanguage] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [newWords, setNewWords] = useState<Word[]>([
    { word: "", translation: "", example: "", accuracy: 0 },
  ]);

  // Add words to existing deck
  const [showAddWordsModal, setShowAddWordsModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [wordsToAdd, setWordsToAdd] = useState<Word[]>([
    { word: "", translation: "", example: "", accuracy: 0 },
  ]);

  useEffect(() => {
    console.log("Home page mounted, auth object:", auth);

    if (!auth) {
      console.error("Auth is not initialized");
      setError(
        "Firebase authentication not initialized. Please check your configuration.",
      );
      setLoading(false);
      return;
    }

    // Set a timeout to detect if onAuthStateChanged never fires
    const timeoutId = setTimeout(() => {
      console.error("Auth state check timed out after 10 seconds");
      setError(
        "Authentication timeout. Please refresh the page or check your connection.",
      );
      setLoading(false);
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed. User:", currentUser?.email || "No user");
      clearTimeout(timeoutId);

      if (currentUser) {
        setUser(currentUser);
        console.log("About to check user document...");

        try {
          // Check if user document exists (onboarding completed)
          const userDoc = await getUserDocument(currentUser.uid);

          if (!userDoc) {
            // User document doesn't exist - redirect to onboarding
            console.log("No user document found, redirecting to onboarding");
            router.push("/onboarding");
            setLoading(false);
            return;
          }

          console.log("User document found, loading decks...");

          // Add timeout for loadDecks
          const loadTimeout = setTimeout(() => {
            console.error(
              "Loading decks timed out - likely a Firestore permissions issue",
            );
            setError(
              "Unable to load data. Please check Firestore security rules.",
            );
            setLoading(false);
          }, 5000);

          await loadDecks(currentUser.uid, userDoc.vocabIDs);
          clearTimeout(loadTimeout);
          console.log("Decks loaded, setting loading to false");
        } catch (err) {
          console.error("Error in user document check or loadCardSets:", err);
          setError("Failed to load user data. Please try again.");
        }
      } else {
        console.log("No user, redirecting to login");
        router.push("/login");
      }
      console.log("Setting loading to false");
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [router]);

  const loadDecks = async (userId: string, vocabIDs: string[]) => {
    console.log("Loading decks for user:", userId, "with vocabIDs:", vocabIDs);
    console.log("DB object:", db);

    if (!db) {
      console.error("Firestore DB is not initialized");
      return;
    }

    try {
      if (vocabIDs.length === 0) {
        console.log("No vocabIDs found, setting empty decks array");
        setDecks([]);
        return;
      }

      // Fetch all decks by their IDs
      const loadedDecks: Deck[] = [];
      for (const deckId of vocabIDs) {
        const deckRef = doc(db, "decks", deckId);
        const deckSnap = await getDoc(deckRef);
        if (deckSnap.exists()) {
          loadedDecks.push({ id: deckSnap.id, ...deckSnap.data() } as Deck);
        }
      }

      setDecks(loadedDecks);
      console.log("Decks loaded successfully:", loadedDecks.length);
    } catch (error) {
      console.error("Error loading decks:", error);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    try {
      const validWords = newWords.filter(
        (word) => word.word.trim() && word.translation.trim(),
      );

      // Create the deck without userId
      const deckRef = await addDoc(collection(db, "decks"), {
        name: newDeckName,
        description: newDeckDescription,
        study: studyLanguage.toUpperCase(),
        language: nativeLanguage.toUpperCase(),
        words: validWords,
        createdAt: new Date(),
      });

      // Add deck ID to user's vocabIDs array
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        vocabIDs: arrayUnion(deckRef.id),
      });

      setShowCreateModal(false);
      setNewDeckName("");
      setNewDeckDescription("");
      setStudyLanguage("");
      setNativeLanguage("");
      setNewWords([{ word: "", translation: "", example: "", accuracy: 0 }]);

      // Reload user document to get updated vocabIDs
      const userDoc = await getUserDocument(user.uid);
      if (userDoc) {
        await loadDecks(user.uid, userDoc.vocabIDs);
      }
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck?") || !db || !user)
      return;

    try {
      // Delete the deck document
      await deleteDoc(doc(db, "decks", deckId));

      // Remove deck ID from user's vocabIDs array
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        vocabIDs: arrayRemove(deckId),
      });

      // Reload user document to get updated vocabIDs
      const userDoc = await getUserDocument(user.uid);
      if (userDoc) {
        await loadDecks(user.uid, userDoc.vocabIDs);
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
    }
  };

  const handleAddWords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !selectedDeckId) return;

    try {
      const validWords = wordsToAdd.filter(
        (word) => word.word.trim() && word.translation.trim(),
      );

      // Get current deck document
      const deckRef = doc(db, "decks", selectedDeckId);
      const deckSnap = await getDoc(deckRef);

      if (deckSnap.exists()) {
        const currentWords = deckSnap.data().words || [];

        // Update deck with merged words
        await updateDoc(deckRef, {
          words: [...currentWords, ...validWords],
        });
      }

      // Reset and close modal
      setShowAddWordsModal(false);
      setSelectedDeckId(null);
      setWordsToAdd([{ word: "", translation: "", example: "", accuracy: 0 }]);

      // Reload decks
      const userDoc = await getUserDocument(user.uid);
      if (userDoc) {
        await loadDecks(user.uid, userDoc.vocabIDs);
      }
    } catch (error) {
      console.error("Error adding words:", error);
    }
  };

  const openAddWordsModal = (deckId: string) => {
    setSelectedDeckId(deckId);
    setShowAddWordsModal(true);
  };

  const startStudying = (deck: Deck) => {
    setCurrentDeck(deck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowStudyModal(true);
  };

  const nextCard = () => {
    if (currentDeck && currentCardIndex < currentDeck.words.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setShowStudyModal(false);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
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

  const addWordToAddInput = () => {
    setWordsToAdd([
      ...wordsToAdd,
      { word: "", translation: "", example: "", accuracy: 0 },
    ]);
  };

  const updateWordToAdd = (
    index: number,
    field: "word" | "translation" | "example",
    value: string,
  ) => {
    const updated = [...wordsToAdd];
    updated[index][field] = value;
    setWordsToAdd(updated);
  };

  const removeWordToAdd = (index: number) => {
    if (wordsToAdd.length > 1) {
      setWordsToAdd(wordsToAdd.filter((_, i) => i !== index));
    }
  };

  console.log(
    "Render - loading:",
    loading,
    "error:",
    error,
    "user:",
    user?.email,
  );

  if (loading) {
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
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Card
          sx={{
            bgcolor: "background.paper",
            p: 4,
            borderRadius: 2,
            border: 1,
            borderColor: "error.main",
            maxWidth: "md",
          }}
        >
          <Typography variant="h5" fontWeight="bold" color="error" mb={2}>
            Error
          </Typography>
          <Typography color="text.primary" mb={3}>
            {error}
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              onClick={() => window.location.reload()}
              variant="contained"
              sx={{ flex: 1 }}
            >
              Retry
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outlined"
              sx={{ flex: 1 }}
            >
              Back to Login
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "secondary.main",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="text.primary"
            sx={{ fontSize: { xs: "1.5rem", sm: "1.875rem" } }}
          >
            VocApp
          </Typography>
          <Button
            onClick={handleSignOut}
            color="inherit"
            sx={{
              color: "text.primary",
              "&:hover": { color: "primary.main" },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            Sign Out
          </Button>
        </Container>
      </Box>

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

        {/* Vocabulary Decks Grid */}
        {decks.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6, px: 3 }}>
            <Button
              onClick={() => setShowCreateModal(true)}
              sx={{
                bgcolor: "white",
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
          <Box
            sx={{
              maxWidth: "600px",
              mx: "auto",
              pb: 8,
              "& .swiper": {
                pb: 6,
              },
              "& .swiper-pagination": {
                bottom: "0 !important",
              },
              "& .swiper-pagination-bullet": {
                width: "10px",
                height: "10px",
                backgroundColor: "#4F6273",
                opacity: 1,
              },
              "& .swiper-pagination-bullet-active": {
                backgroundColor: "#58748C",
              },
            }}
          >
            <Swiper
              modules={[Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              pagination={{ clickable: true }}
              centeredSlides={true}
            >
              {decks.map((deck) => (
                <SwiperSlide key={deck.id}>
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
                        sx={{
                          fontSize: { xs: "1.75rem", sm: "2rem" },
                          textAlign: "center",
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
                          onClick={() => startStudying(deck)}
                          variant="contained"
                          size="small"
                          sx={{ flex: 1 }}
                        >
                          Study
                        </Button>
                        <Button
                          onClick={() => openAddWordsModal(deck.id)}
                          variant="outlined"
                          size="small"
                          sx={{ flex: 1 }}
                        >
                          Add Words
                        </Button>
                        <Button
                          onClick={() => handleDeleteDeck(deck.id)}
                          variant="outlined"
                          size="small"
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
                </SwiperSlide>
              ))}

              {/* Create New Set Card */}
              <SwiperSlide>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  sx={{
                    bgcolor: "white",
                    p: { xs: 3, sm: 4 },
                    borderRadius: 2,
                    boxShadow: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    height: "80vh",
                    width: "100%",
                    border: 2,
                    borderStyle: "dashed",
                    borderColor: "grey.300",
                    "&:hover": {
                      boxShadow: 6,
                      borderColor: "primary.main",
                    },
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
                    variant="h6"
                    fontWeight={600}
                    color="grey.800"
                    mb={1}
                    sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
                  >
                    Create New Deck
                  </Typography>
                  <Typography variant="body2" color="grey.600">
                    Build a new vocabulary deck
                  </Typography>
                </Button>
              </SwiperSlide>
            </Swiper>
          </Box>
        )}
      </Container>

      {/* Create Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewDeckName("");
          setNewDeckDescription("");
          setStudyLanguage("");
          setNativeLanguage("");
          setNewWords([
            { word: "", translation: "", example: "", accuracy: 0 },
          ]);
        }}
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
            onSubmit={handleCreateDeck}
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
        <DialogActions
          sx={{ p: 3, borderTop: 1, borderColor: "secondary.main" }}
        >
          <Button
            onClick={() => {
              setShowCreateModal(false);
              setNewDeckName("");
              setNewDeckDescription("");
              setStudyLanguage("");
              setNativeLanguage("");
              setNewWords([
                { word: "", translation: "", example: "", accuracy: 0 },
              ]);
            }}
            variant="outlined"
            sx={{ flex: 1 }}
          >
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

      {/* Add Words Modal */}
      <Dialog
        open={showAddWordsModal}
        onClose={() => {
          setShowAddWordsModal(false);
          setSelectedDeckId(null);
          setWordsToAdd([
            { word: "", translation: "", example: "", accuracy: 0 },
          ]);
        }}
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
            Add Words to Deck
          </Typography>
          {selectedDeckId && (
            <Typography variant="body2" color="secondary.main" mt={1}>
              {decks.find((d) => d.id === selectedDeckId)?.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: "70vh" }}>
          <Box
            component="form"
            id="addWordsForm"
            onSubmit={handleAddWords}
            sx={{ mt: 2 }}
          >
            <Typography
              variant="body2"
              fontWeight={500}
              color="text.primary"
              mb={2}
            >
              New Words
            </Typography>
            {wordsToAdd.map((word, index) => (
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
                  {wordsToAdd.length > 1 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeWordToAdd(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                <TextField
                  fullWidth
                  placeholder="Word to study"
                  value={word.word}
                  onChange={(e) =>
                    updateWordToAdd(index, "word", e.target.value)
                  }
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  placeholder="Translation"
                  value={word.translation}
                  onChange={(e) =>
                    updateWordToAdd(index, "translation", e.target.value)
                  }
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  placeholder="Example sentence (optional)"
                  value={word.example || ""}
                  onChange={(e) =>
                    updateWordToAdd(index, "example", e.target.value)
                  }
                  size="small"
                  multiline
                  rows={2}
                />
              </Card>
            ))}
            <Button
              fullWidth
              variant="outlined"
              onClick={addWordToAddInput}
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
        <DialogActions
          sx={{ p: 3, borderTop: 1, borderColor: "secondary.main" }}
        >
          <Button
            onClick={() => {
              setShowAddWordsModal(false);
              setSelectedDeckId(null);
              setWordsToAdd([
                { word: "", translation: "", example: "", accuracy: 0 },
              ]);
            }}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="addWordsForm"
            variant="contained"
            sx={{ flex: 1 }}
          >
            Add Words
          </Button>
        </DialogActions>
      </Dialog>

      {/* Study Modal */}
      <Dialog
        open={showStudyModal}
        onClose={() => setShowStudyModal(false)}
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
        {currentDeck && (
          <>
            <DialogTitle>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                mb={1}
              >
                {currentDeck.name}
              </Typography>
              <Typography variant="body2" color="secondary.main">
                Word {currentCardIndex + 1} of {currentDeck.words.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={
                  ((currentCardIndex + 1) / currentDeck.words.length) * 100
                }
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
                    ? currentDeck.words[currentCardIndex].translation
                    : currentDeck.words[currentCardIndex].word}
                </Typography>
                {isFlipped && currentDeck.words[currentCardIndex].example && (
                  <Typography
                    variant="body2"
                    color="secondary.main"
                    textAlign="center"
                    sx={{ fontStyle: "italic", mt: 2 }}
                  >
                    "{currentDeck.words[currentCardIndex].example}"
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
                  {currentCardIndex === currentDeck.words.length - 1
                    ? "Finish"
                    : "Next"}
                </Button>
              </Box>

              <Button
                onClick={() => setShowStudyModal(false)}
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
    </Box>
  );
}
