"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import ErrorState from "@/app/components/common/ErrorState";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import QuestsHomeScreen from "@/app/components/redesigned/quests/QuestsHomeScreen";
import { useAuth } from "@/app/hooks/useAuth";
import { useDecks } from "@/app/hooks/useDecks";
import {
  RedesignedTabId,
  useRedesignedHomeDashboard,
} from "@/app/hooks/useRedesignedHomeDashboard";

function getQuestRoute(deckId: string, questId: string) {
  switch (questId) {
    case "guess-translation":
      return `/deck/${deckId}/guess-translation`;
    case "match-5":
      return `/deck/${deckId}/match-translation`;
    case "build-word":
      return `/deck/${deckId}/build-word-game`;
    default:
      return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [studyLanguage, setStudyLanguage] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [createDeckError, setCreateDeckError] = useState<string | null>(null);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
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
  } = useDecks(user);
  const dashboard = useRedesignedHomeDashboard(user, decks, !decksLoading);

  const loading = authLoading || decksLoading || dashboard.loading;
  const error = authError || decksError || dashboard.error;

  const handleQuestStart = useCallback(
    (questId: string) => {
      if (!dashboard.activeDeck) {
        return;
      }

      const route = getQuestRoute(dashboard.activeDeck.id, questId);

      if (route) {
        router.push(route);
      }
    },
    [dashboard.activeDeck, router],
  );

  const handleTabSelect = useCallback(
    (tabId: string) => {
      switch (tabId as RedesignedTabId) {
        case "quests":
          router.push("/home");
          break;
        case "decks":
          if (dashboard.activeDeck) {
            router.push(`/deck/${dashboard.activeDeck.id}`);
          }
          break;
        case "add":
          router.push("/add-word");
          break;
        case "profile":
          router.push("/profile");
          break;
        default:
          break;
      }
    },
    [dashboard.activeDeck, router],
  );

  const handleCloseCreateDeck = useCallback(() => {
    if (isCreatingDeck) {
      return;
    }

    setIsCreateDeckOpen(false);
    setCreateDeckError(null);
  }, [isCreatingDeck]);

  const handleCreateDeck = useCallback(async () => {
    if (
      !newDeckName.trim() ||
      !studyLanguage.trim() ||
      !nativeLanguage.trim()
    ) {
      setCreateDeckError(
        "Deck name, study language, and native language are required.",
      );
      return;
    }

    try {
      setIsCreatingDeck(true);
      setCreateDeckError(null);
      await createDeck({
        name: newDeckName.trim(),
        description: newDeckDescription.trim(),
        study: studyLanguage.trim().toUpperCase(),
        language: nativeLanguage.trim().toUpperCase(),
        words: [],
      });
      setIsCreateDeckOpen(false);
      setNewDeckName("");
      setNewDeckDescription("");
      setStudyLanguage("");
      setNativeLanguage("");
    } catch (error) {
      setCreateDeckError(
        error instanceof Error ? error.message : "Failed to create deck.",
      );
    } finally {
      setIsCreatingDeck(false);
    }
  }, [
    createDeck,
    nativeLanguage,
    newDeckDescription,
    newDeckName,
    studyLanguage,
  ]);

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return <ErrorState error={error} showBackToLogin={false} />;
  }

  if (decks.length === 0) {
    return (
      <RedesignedThemeProvider>
        <Box
          sx={{
            minHeight: "100dvh",
            px: 3,
            py: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "text.secondary",
              }}
            >
              Start learning
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: { xs: 36, sm: 48 },
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              Create your first deck
            </Typography>
            <Typography sx={{ mt: 2, maxWidth: 480, color: "text.secondary" }}>
              Your quests need an active deck. Create one here, then the new
              home route will switch into the redesigned study flow.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              maxWidth: 520,
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
              Ready to add your first language pair?
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              Use short language codes like `EN`, `ES`, or `DE`.
            </Typography>
            <Button
              onClick={() => setIsCreateDeckOpen(true)}
              sx={{ mt: 3 }}
              variant="contained"
            >
              Create deck
            </Button>
          </Box>

          <Dialog
            open={isCreateDeckOpen}
            onClose={handleCloseCreateDeck}
            fullWidth
          >
            <DialogTitle>Create deck</DialogTitle>
            <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
              <TextField
                autoFocus
                label="Deck name"
                value={newDeckName}
                onChange={(event) => setNewDeckName(event.target.value)}
                required
              />
              <TextField
                label="Description"
                value={newDeckDescription}
                onChange={(event) => setNewDeckDescription(event.target.value)}
              />
              <TextField
                label="Study language"
                placeholder="ES"
                value={studyLanguage}
                onChange={(event) => setStudyLanguage(event.target.value)}
                required
              />
              <TextField
                label="Native language"
                placeholder="EN"
                value={nativeLanguage}
                onChange={(event) => setNativeLanguage(event.target.value)}
                required
              />
              {createDeckError ? (
                <Typography color="error">{createDeckError}</Typography>
              ) : null}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCreateDeck} disabled={isCreatingDeck}>
                Cancel
              </Button>
              <Button
                onClick={() => void handleCreateDeck()}
                disabled={isCreatingDeck}
              >
                {isCreatingDeck ? "Creating..." : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </RedesignedThemeProvider>
    );
  }

  return (
    <RedesignedThemeProvider>
      <QuestsHomeScreen
        header={dashboard.header}
        progress={dashboard.progress}
        quests={dashboard.quests}
        completed={dashboard.completed}
        tabs={dashboard.tabs}
        onQuestStart={handleQuestStart}
        onTabSelect={handleTabSelect}
        emptyQuestMessage={dashboard.emptyQuestMessage}
        emptyCompletedMessage={dashboard.emptyCompletedMessage}
      />
    </RedesignedThemeProvider>
  );
}
