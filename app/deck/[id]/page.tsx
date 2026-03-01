"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddWordModal from "@/app/components/AddWordModal";

interface Word {
  word: string;
  translation: string;
  example?: string;
  picture?: string;
  accuracy: number;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  study: string;
  language: string;
  words: Word[];
  createdAt: Date;
}

export default function DeckPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [showTranslations, setShowTranslations] = useState<{
    [key: number]: boolean;
  }>({});
  const [showAddWordModal, setShowAddWordModal] = useState(false);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadDeck(deckId);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deckId, router]);

  const loadDeck = async (id: string) => {
    if (!db) return;

    try {
      const deckRef = doc(db, "decks", id);
      const deckSnap = await getDoc(deckRef);

      if (deckSnap.exists()) {
        const data = deckSnap.data();
        setDeck({
          id: deckSnap.id,
          name: data.name,
          description: data.description,
          study: data.study,
          language: data.language,
          words: data.words || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading deck:", error);
    }
  };

  const toggleTranslation = (index: number) => {
    setShowTranslations((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddWord = () => {
    setShowAddWordModal(true);
  };

  const handleSaveWord = async (
    word: string,
    translation: string,
    example: string,
    picture?: string,
  ) => {
    if (!deck || !db) return;

    const deckRef = doc(db, "decks", deckId);
    const updatedWords = [
      ...deck.words,
      {
        word,
        translation,
        example,
        picture,
        accuracy: 0,
      },
    ];

    await updateDoc(deckRef, {
      words: updatedWords,
    });

    // Update local state
    setDeck({
      ...deck,
      words: updatedWords,
    });
  };

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
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "secondary.main",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "600px",
            mx: "auto",
          }}
        >
          <IconButton
            onClick={() => router.push("/home")}
            sx={{ color: "text.primary" }}
          >
            <Box component="span" sx={{ fontSize: "1.5rem" }}>
              🏠
            </Box>
          </IconButton>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton sx={{ color: "text.primary" }}>
              <Box component="span" sx={{ fontSize: "1.5rem" }}>
                🔍
              </Box>
            </IconButton>
          </Box>
        </Box>
      </Box>

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
        <Button
          onClick={handleAddWord}
          fullWidth
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            border: 1,
            borderColor: "secondary.main",
            p: 2.5,
            mb: 2,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 2,
            textTransform: "none",
            fontSize: "1.125rem",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "background.paper",
              borderColor: "primary.main",
            },
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#4F6273",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1,
            }}
          >
            <Box component="span" sx={{ fontSize: "2.5rem" }}>
              ➕
            </Box>
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Add Word
          </Typography>
        </Button>

        {/* Words List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {deck.words.map((word, index) => (
            <Button
              key={index}
              fullWidth
              sx={{
                bgcolor: "background.paper",
                color: "text.primary",
                border: 1,
                borderColor: "secondary.main",
                p: 2.5,
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 2,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "background.paper",
                  borderColor: "primary.main",
                },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "#4F6273",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              >
                {word.picture ? (
                  <Box
                    component="img"
                    src={word.picture}
                    alt={word.word}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <Box component="span" sx={{ fontSize: "2rem" }}>
                    🖼️
                  </Box>
                )}
              </Box>
              <Box sx={{ flex: 1, textAlign: "left" }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="text.primary"
                  mb={0.5}
                >
                  {word.word}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="text.primary">
                    Show Translation
                  </Typography>
                  <Switch
                    checked={showTranslations[index] || false}
                    onChange={() => toggleTranslation(index)}
                    size="small"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#B8CAD9",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "#B8CAD9",
                        },
                    }}
                  />
                </Box>
                {showTranslations[index] && (
                  <Typography
                    variant="body1"
                    color="primary.main"
                    sx={{ mt: 1 }}
                  >
                    {word.translation}
                  </Typography>
                )}
              </Box>
            </Button>
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
        onClose={() => setShowAddWordModal(false)}
        onSave={handleSaveWord}
        sourceLang={deck?.study}
        targetLang={deck?.language}
      />
    </Box>
  );
}
