"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserDocument } from "@/lib/firebase";
import { LANGUAGES } from "@/lib/constants/languages";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import { useAuth } from "@/app/hooks/useAuth";
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
} from "@mui/material";

export default function OnboardingPage() {
  const router = useRouter();

  // Use custom hook for auth
  const { user, loading } = useAuth({
    requireAuth: true,
    requireOnboarding: false, // We're on the onboarding page
  });

  const [nativeLanguage, setNativeLanguage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    return <FullPageLoading />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
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
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              color: "text.primary",
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
              color: "text.secondary",
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
              <InputLabel
                id="native-language-label"
                sx={{ color: "text.secondary" }}
              >
                Native Language
              </InputLabel>
              <Select
                labelId="native-language-label"
                id="native-language"
                value={nativeLanguage}
                label="Native Language"
                onChange={(e) => setNativeLanguage(e.target.value)}
                sx={{
                  color: "text.primary",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "secondary.main",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "text.primary",
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
                bgcolor: "primary.main",
                color: "text.primary",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "secondary.main",
                },
                "&:disabled": {
                  bgcolor: "secondary.main",
                  color: "text.secondary",
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
