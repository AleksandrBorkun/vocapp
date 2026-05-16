"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import RedesignedScreenShell from "@/app/components/redesigned/primitives/RedesignedScreenShell";
import { useAuth } from "@/app/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { redesignedPalette, redesignedRadii } from "@/lib/redesigned/tokens";

function GoogleIcon() {
  return (
    <Box
      component="svg"
      viewBox="0 0 18 18"
      aria-hidden="true"
      sx={{ width: 18, height: 18, display: "block" }}
    >
      <path
        d="M17.64 9.205c0-.638-.057-1.251-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.908c1.702-1.567 2.685-3.874 2.685-6.614Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.181l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.583-5.037-3.711H.957v2.332A8.998 8.998 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.963 10.709A5.41 5.41 0 0 1 3.681 9c0-.593.101-1.169.282-1.709V4.959H.957A8.996 8.996 0 0 0 0 9c0 1.452.347 2.827.957 4.041l3.006-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.507.454 3.44 1.345l2.58-2.58C13.463.891 11.426 0 9 0A8.998 8.998 0 0 0 .957 4.959L3.963 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </Box>
  );
}

function CoverArtwork() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 72% 16%, rgba(42, 30, 15, 0.9), transparent 36%), radial-gradient(circle at 18% 74%, rgba(200, 124, 59, 0.08), transparent 34%)",
        }}
      />
      <Box
        component="svg"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <g opacity="0.06">
          <ellipse
            cx="320"
            cy="120"
            rx="90"
            ry="160"
            fill="#c87c3b"
            transform="rotate(35 320 120)"
          />
          <ellipse
            cx="300"
            cy="200"
            rx="60"
            ry="110"
            fill="#52b86a"
            transform="rotate(20 300 200)"
          />
          <ellipse
            cx="60"
            cy="300"
            rx="70"
            ry="130"
            fill="#c87c3b"
            transform="rotate(-25 60 300)"
          />
          <ellipse
            cx="350"
            cy="380"
            rx="50"
            ry="90"
            fill="#52b86a"
            transform="rotate(50 350 380)"
          />
          <ellipse
            cx="150"
            cy="180"
            rx="40"
            ry="80"
            fill="#e0a83c"
            transform="rotate(10 150 180)"
          />
        </g>
        <g opacity="0.03" stroke="#ede8d4" strokeWidth="0.5">
          <line x1="0" y1="200" x2="390" y2="200" />
          <line x1="0" y1="400" x2="390" y2="400" />
          <line x1="0" y1="600" x2="390" y2="600" />
          <line x1="130" y1="0" x2="130" y2="844" />
          <line x1="260" y1="0" x2="260" y2="844" />
        </g>
        <circle
          cx="340"
          cy="90"
          r="180"
          fill="none"
          stroke="#c87c3b"
          strokeWidth="0.75"
          opacity="0.12"
        />
        <circle
          cx="340"
          cy="90"
          r="140"
          fill="none"
          stroke="#c87c3b"
          strokeWidth="0.75"
          opacity="0.08"
        />
        <text
          x="195"
          y="420"
          fill="#ede8d4"
          fontFamily="Fraunces, Georgia, serif"
          fontSize="360"
          fontWeight="300"
          opacity="0.025"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          V
        </text>
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/home");
    }
  }, [authLoading, router, user]);

  const activeError = authError ?? error;
  const buttonLabel = useMemo(() => {
    if (authLoading) {
      return "Checking session...";
    }

    if (submitting) {
      return "Connecting...";
    }

    return "Continue with Google";
  }, [authLoading, submitting]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Firebase is not initialized");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/home");
    } catch (signInError: unknown) {
      const errorMessage =
        signInError instanceof Error
          ? signInError.message
          : "An error occurred. Please try again.";
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <RedesignedThemeProvider>
      <RedesignedScreenShell>
        <Box
          sx={{
            minHeight: "100dvh",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <CoverArtwork />

          <Box
            sx={{
              height: 59,
              px: 3.5,
              pt: 1.5,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 126,
                height: 37,
                mx: "auto",
                borderRadius: 999,
                bgcolor: "#000",
              }}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "flex-end",
              px: 4,
              pb: 6,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.25,
                  py: 0.75,
                  mb: 3.5,
                  border: `1px solid ${redesignedPalette.border}`,
                  borderRadius: redesignedRadii.pill,
                  bgcolor: redesignedPalette.surface.secondary,
                  color: redesignedPalette.text.secondary,
                  fontSize: 13,
                  letterSpacing: "0.01em",
                }}
              >
                <span>🇬🇧</span>
                <span>English</span>
                <span style={{ color: redesignedPalette.text.muted }}>→</span>
                <span>🇪🇸</span>
                <span>Spanish</span>
              </Box>

              <Typography
                component="h1"
                sx={{
                  mb: 2,
                  color: redesignedPalette.text.primary,
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: { xs: 66, sm: 72 },
                  fontWeight: 300,
                  letterSpacing: "-0.03em",
                  lineHeight: 0.95,
                }}
              >
                Vocado
              </Typography>

              <Typography
                sx={{
                  mb: 5,
                  maxWidth: 280,
                  color: redesignedPalette.text.secondary,
                  fontSize: 17,
                  lineHeight: 1.5,
                }}
              >
                Master Languages through{" "}
                <Box
                  component="span"
                  sx={{
                    fontFamily: "Fraunces, Georgia, serif",
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: redesignedPalette.accent.warm,
                  }}
                >
                  play
                </Box>
                . Build your deck, run your quests.
              </Typography>

              {activeError ? (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(212, 78, 60, 0.12)",
                    color: redesignedPalette.text.primary,
                    border: `1px solid ${redesignedPalette.accent.danger}`,
                    "& .MuiAlert-icon": {
                      color: redesignedPalette.accent.danger,
                    },
                  }}
                >
                  {activeError}
                </Alert>
              ) : null}

              <Button
                fullWidth
                variant="contained"
                onClick={handleGoogleSignIn}
                disabled={authLoading || submitting || Boolean(user)}
                startIcon={
                  submitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <GoogleIcon />
                  )
                }
                sx={{
                  minHeight: 58,
                  borderRadius: 1.75,
                  bgcolor: redesignedPalette.accent.warm,
                  color: redesignedPalette.text.primary,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#b86f33",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    bgcolor: redesignedPalette.surface.tertiary,
                    color: redesignedPalette.text.secondary,
                  },
                }}
              >
                {buttonLabel}
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 134,
                height: 5,
                borderRadius: 999,
                bgcolor: "rgba(237, 232, 212, 0.22)",
              }}
            />
          </Box>
        </Box>
      </RedesignedScreenShell>
    </RedesignedThemeProvider>
  );
}
