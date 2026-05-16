"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
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

export default function RedesignedHomePage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    error: authError,
  } = useAuth({
    requireAuth: true,
    requireOnboarding: true,
    redirectTo: "/login",
  });
  const { decks, loading: decksLoading, error: decksError } = useDecks(user);
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
          router.push("/redesigned/home");
          break;
        case "decks":
          if (dashboard.activeDeck) {
            router.push(`/redesigned/decks/${dashboard.activeDeck.id}`);
          } else {
            router.push("/home");
          }
          break;
        case "add":
          router.push("/home");
          break;
        case "profile":
          router.push("/redesigned/profile");
          break;
        default:
          break;
      }
    },
    [dashboard.activeDeck, router],
  );

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return <ErrorState error={error} showBackToLogin={false} />;
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
