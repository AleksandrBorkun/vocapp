"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Firebase is not initialized");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase is not initialized");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/home");
    } catch (err: any) {
      console.error("Error initiating Google sign-in:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    // Placeholder for Facebook login - will be implemented later
    setError("Facebook login coming soon");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.100",
      }}
    >
      {/* Header with gray background */}
      <Box sx={{ bgcolor: "grey.200", height: 128 }} />

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          px: 2,
          mt: -8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "grey.900",
              mb: 4,
            }}
          >
            Welcome to VocApp
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="email"
              id="email"
              label="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superhero@miro.com"
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: {
                  bgcolor: "white",
                  "& fieldset": {
                    borderColor: "grey.900",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "grey.900",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              type="password"
              id="password"
              label="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="your password"
              required
              inputProps={{ minLength: 6 }}
              sx={{ mb: 2.5 }}
              InputProps={{
                sx: {
                  bgcolor: "white",
                  "& fieldset": {
                    borderColor: "grey.900",
                    borderWidth: 2,
                  },
                  "&:hover fieldset": {
                    borderColor: "grey.900",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                bgcolor: "#5558D9",
                fontWeight: 600,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "#4447b8",
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                },
              }}
            >
              {loading ? "Please wait..." : "Login"}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link
              href="/forgot-password"
              style={{
                color: "#5558D9",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>
          </Box>

          <Box
            sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                bgcolor: "#5558D9",
                fontWeight: 600,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "#4447b8",
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                },
              }}
            >
              Continue with Google
            </Button>

            <Button
              onClick={handleFacebookSignIn}
              disabled={loading}
              fullWidth
              variant="contained"
              sx={{
                py: 1.5,
                bgcolor: "#5558D9",
                fontWeight: 600,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "#4447b8",
                },
                "&.Mui-disabled": {
                  opacity: 0.5,
                },
              }}
            >
              Continue with FB
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Link
              href="/privacy"
              style={{
                color: "#5558D9",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Privacy
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
