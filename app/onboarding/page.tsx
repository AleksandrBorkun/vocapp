"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, createUserDocument } from "@/lib/firebase";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "uk", name: "Ukrainian" },
  { code: "ro", name: "Romanian" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "he", name: "Hebrew" },
];

export default function OnboardingPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nativeLanguage) {
      setError("Please select your native language");
      return;
    }

    if (!user) {
      setError("No user found. Please log in again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const name = user.displayName || user.email?.split("@")[0] || "User";
      await createUserDocument(user.uid, nativeLanguage, name);
      router.push("/home");
    } catch (err) {
      console.error("Error creating user document:", err);
      setError("Failed to complete onboarding. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#00030D",
        }}
      >
        <CircularProgress sx={{ color: "#B8CAD9" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#00030D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            bgcolor: "#0C1526",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              color: "#B8CAD9",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Welcome!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "#58748C",
              textAlign: "center",
            }}
          >
            Let's get started by setting up your profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="native-language-label" sx={{ color: "#58748C" }}>
                Native Language
              </InputLabel>
              <Select
                labelId="native-language-label"
                id="native-language"
                value={nativeLanguage}
                label="Native Language"
                onChange={(e) => setNativeLanguage(e.target.value)}
                sx={{
                  color: "#B8CAD9",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4F6273",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#58748C",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#B8CAD9",
                  },
                }}
              >
                {LANGUAGES.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={submitting}
              sx={{
                py: 1.5,
                bgcolor: "#58748C",
                color: "#B8CAD9",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#4F6273",
                },
                "&:disabled": {
                  bgcolor: "#4F6273",
                  color: "#58748C",
                },
              }}
            >
              {submitting ? "Creating Profile..." : "Continue"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
