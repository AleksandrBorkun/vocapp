"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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

interface CardSet {
  id: string;
  name: string;
  description: string;
  cards: Card[];
  userId: string;
  createdAt: Date;
}

interface Card {
  front: string;
  back: string;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [currentSet, setCurrentSet] = useState<CardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  // New card set form
  const [newSetName, setNewSetName] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [newCards, setNewCards] = useState<Card[]>([{ front: "", back: "" }]);

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
        console.log("About to load card sets...");

        // Add timeout for loadCardSets
        const loadTimeout = setTimeout(() => {
          console.error(
            "Loading card sets timed out - likely a Firestore permissions issue",
          );
          setError(
            "Unable to load data. Please check Firestore security rules.",
          );
          setLoading(false);
        }, 5000);

        try {
          await loadCardSets(currentUser.uid);
          clearTimeout(loadTimeout);
          console.log("Card sets loaded, setting loading to false");
        } catch (err) {
          clearTimeout(loadTimeout);
          console.error("Error in loadCardSets:", err);
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

  const loadCardSets = async (userId: string) => {
    console.log("Loading card sets for user:", userId);
    console.log("DB object:", db);

    if (!db) {
      console.error("Firestore DB is not initialized");
      return;
    }

    try {
      const q = query(
        collection(db, "cardSets"),
        where("userId", "==", userId),
      );
      console.log("Executing Firestore query...");
      const querySnapshot = await getDocs(q);
      console.log("Query completed. Documents found:", querySnapshot.size);
      const sets: CardSet[] = [];
      querySnapshot.forEach((doc) => {
        sets.push({ id: doc.id, ...doc.data() } as CardSet);
      });
      setCardSets(sets);
      console.log("Card sets loaded successfully:", sets.length);
    } catch (error) {
      console.error("Error loading card sets:", error);
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

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    try {
      const validCards = newCards.filter(
        (card) => card.front.trim() && card.back.trim(),
      );

      await addDoc(collection(db, "cardSets"), {
        name: newSetName,
        description: newSetDescription,
        cards: validCards,
        userId: user.uid,
        createdAt: new Date(),
      });

      setShowCreateModal(false);
      setNewSetName("");
      setNewSetDescription("");
      setNewCards([{ front: "", back: "" }]);
      await loadCardSets(user.uid);
    } catch (error) {
      console.error("Error creating card set:", error);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    if (!confirm("Are you sure you want to delete this card set?") || !db)
      return;

    try {
      await deleteDoc(doc(db, "cardSets", setId));
      if (user) await loadCardSets(user.uid);
    } catch (error) {
      console.error("Error deleting card set:", error);
    }
  };

  const startStudying = (set: CardSet) => {
    setCurrentSet(set);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowStudyModal(true);
  };

  const nextCard = () => {
    if (currentSet && currentCardIndex < currentSet.cards.length - 1) {
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

  const addCardInput = () => {
    setNewCards([...newCards, { front: "", back: "" }]);
  };

  const updateCard = (
    index: number,
    field: "front" | "back",
    value: string,
  ) => {
    const updated = [...newCards];
    updated[index][field] = value;
    setNewCards(updated);
  };

  const removeCard = (index: number) => {
    if (newCards.length > 1) {
      setNewCards(newCards.filter((_, i) => i !== index));
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
            My Card Sets
          </Typography>
          <Typography color="secondary.main">
            Welcome back, {user?.email}
          </Typography>
        </Box>

        {/* Card Sets Grid */}
        {cardSets.length === 0 ? (
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
                Create Your First Set
              </Typography>
              <Typography variant="body2" color="grey.600">
                You don't have any card sets yet. Start building your flashcard
                collection now!
              </Typography>
            </Button>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Create New Set Card */}
            <Grid item xs={12} sm={6} lg={4}>
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
                  Create New Set
                </Typography>
                <Typography variant="body2" color="grey.600">
                  Build a new flashcard collection
                </Typography>
              </Button>
            </Grid>

            {cardSets.map((set) => (
              <Grid item xs={12} sm={6} lg={4} key={set.id}>
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
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="text.primary"
                      mb={1}
                      sx={{ fontSize: { xs: "1.125rem", sm: "1.25rem" } }}
                    >
                      {set.name}
                    </Typography>
                    <Typography variant="body2" color="secondary.main" mb={2}>
                      {set.description}
                    </Typography>
                    <Typography variant="body2" color="text.primary" mb={2}>
                      {set.cards.length} cards
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        onClick={() => startStudying(set)}
                        variant="contained"
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        Study
                      </Button>
                      <Button
                        onClick={() => handleDeleteSet(set.id)}
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
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create Modal */}
      <Dialog
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewSetName("");
          setNewSetDescription("");
          setNewCards([{ front: "", back: "" }]);
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
            Create New Card Set
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: "70vh" }}>
          <Box
            component="form"
            id="createSetForm"
            onSubmit={handleCreateSet}
            sx={{ mt: 2 }}
          >
            <TextField
              fullWidth
              label="Set Name"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newSetDescription}
              onChange={(e) => setNewSetDescription(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Typography
              variant="body2"
              fontWeight={500}
              color="text.primary"
              mb={2}
            >
              Cards
            </Typography>
            {newCards.map((card, index) => (
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
                    Card {index + 1}
                  </Typography>
                  {newCards.length > 1 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeCard(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                <TextField
                  fullWidth
                  placeholder="Front (e.g., Word)"
                  value={card.front}
                  onChange={(e) => updateCard(index, "front", e.target.value)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  placeholder="Back (e.g., Definition)"
                  value={card.back}
                  onChange={(e) => updateCard(index, "back", e.target.value)}
                  size="small"
                />
              </Card>
            ))}
            <Button
              fullWidth
              variant="outlined"
              onClick={addCardInput}
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
              + Add Another Card
            </Button>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: 1, borderColor: "secondary.main" }}
        >
          <Button
            onClick={() => {
              setShowCreateModal(false);
              setNewSetName("");
              setNewSetDescription("");
              setNewCards([{ front: "", back: "" }]);
            }}
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="createSetForm"
            variant="contained"
            sx={{ flex: 1 }}
          >
            Create Set
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
        {currentSet && (
          <>
            <DialogTitle>
              <Typography
                variant="h5"
                fontWeight="bold"
                color="text.primary"
                mb={1}
              >
                {currentSet.name}
              </Typography>
              <Typography variant="body2" color="secondary.main">
                Card {currentCardIndex + 1} of {currentSet.cards.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((currentCardIndex + 1) / currentSet.cards.length) * 100}
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
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  color="text.primary"
                  textAlign="center"
                  sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                >
                  {isFlipped
                    ? currentSet.cards[currentCardIndex].back
                    : currentSet.cards[currentCardIndex].front}
                </Typography>
              </Card>

              <Typography
                variant="body2"
                color="secondary.main"
                textAlign="center"
                mb={3}
              >
                {isFlipped ? "Click to see front" : "Click to see back"}
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
                  {currentCardIndex === currentSet.cards.length - 1
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
