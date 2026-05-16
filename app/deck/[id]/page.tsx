"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import ErrorState from "@/app/components/common/ErrorState";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import DeckDetailScreen from "@/app/components/redesigned/decks/DeckDetailScreen";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import { useAuth } from "@/app/hooks/useAuth";
import {
  RedesignedTabId,
  getRedesignedTabs,
} from "@/app/hooks/useRedesignedHomeDashboard";
import { useWords } from "@/app/hooks/useWords";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import { setActiveDeckIdCookie } from "@/lib/utils/activeDeckCookie";

export default function DeckPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;
  const [searchValue, setSearchValue] = useState("");

  const {
    user,
    loading: authLoading,
    error: authError,
  } = useAuth({
    requireAuth: true,
    requireOnboarding: true,
    redirectTo: "/login",
  });
  const { deck, loading: deckLoading, error: deckError, loadDeck } = useWords();

  useEffect(() => {
    if (user && deckId) {
      loadDeck(deckId);
    }
  }, [deckId, loadDeck, user]);

  useEffect(() => {
    if (deck?.id) {
      setActiveDeckIdCookie(deck.id);
    }
  }, [deck?.id]);

  const handleTabSelect = useCallback(
    (tabId: string) => {
      switch (tabId as RedesignedTabId) {
        case "quests":
          router.push("/home");
          break;
        case "add":
          router.push("/add-word");
          break;
        case "profile":
          router.push("/profile");
          break;
        case "decks":
        default:
          break;
      }
    },
    [router],
  );

  const filteredWords = useMemo(() => {
    if (!deck) {
      return [];
    }

    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return deck.words;
    }

    return deck.words.filter((word) => {
      const source = word.word.toLowerCase();
      const target = word.translation.toLowerCase();

      return (
        source.includes(normalizedSearch) || target.includes(normalizedSearch)
      );
    });
  }, [deck, searchValue]);

  const loading = authLoading || deckLoading;
  const error = authError || deckError;

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return <ErrorState error={error} showBackToLogin={false} />;
  }

  if (!deck) {
    return (
      <RedesignedThemeProvider>
        <Box
          sx={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: redesignedPalette.canvas,
            px: 3,
          }}
        >
          <Typography sx={{ color: redesignedPalette.text.primary }}>
            Deck not found.
          </Typography>
        </Box>
      </RedesignedThemeProvider>
    );
  }

  return (
    <RedesignedThemeProvider>
      <DeckDetailScreen
        deck={deck}
        visibleWords={filteredWords}
        tabs={getRedesignedTabs("decks")}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onTabSelect={handleTabSelect}
      />
    </RedesignedThemeProvider>
  );
}
