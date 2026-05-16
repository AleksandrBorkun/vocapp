"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorState from "@/app/components/common/ErrorState";
import FullPageLoading from "@/app/components/common/FullPageLoading";
import RedesignedThemeProvider from "@/app/components/redesigned/RedesignedThemeProvider";
import ProfileScreen from "@/app/components/redesigned/profile/ProfileScreen";
import {
  RedesignedTabId,
  getRedesignedTabs,
  toProgressViewModel,
} from "@/app/hooks/useRedesignedHomeDashboard";
import { useAuth } from "@/app/hooks/useAuth";
import { useDecks } from "@/app/hooks/useDecks";
import { getUserDocument } from "@/lib/firebase";
import { LanguageQuestProgress, User } from "@/lib/types";
import { redesignedPalette } from "@/lib/redesigned/tokens";
import {
  clearActiveDeckIdCookie,
  getActiveDeckIdCookie,
  setActiveDeckIdCookie,
} from "@/lib/utils/activeDeckCookie";
import {
  getLanguageName,
  normalizeLanguageCode,
} from "@/lib/utils/languageMapper";

const DEFAULT_PROGRESS: LanguageQuestProgress = {
  totalXp: 0,
  streak: 0,
  lastCompletedOn: null,
  updatedAt: null,
};

const LANGUAGE_FLAGS: Record<string, string> = {
  ar: "🇸🇦",
  cs: "🇨🇿",
  da: "🇩🇰",
  de: "🇩🇪",
  el: "🇬🇷",
  en: "🇬🇧",
  es: "🇪🇸",
  fi: "🇫🇮",
  fr: "🇫🇷",
  he: "🇮🇱",
  hi: "🇮🇳",
  hu: "🇭🇺",
  id: "🇮🇩",
  it: "🇮🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  ms: "🇲🇾",
  nl: "🇳🇱",
  no: "🇳🇴",
  pl: "🇵🇱",
  pt: "🇵🇹",
  ro: "🇷🇴",
  ru: "🇷🇺",
  sv: "🇸🇪",
  th: "🇹🇭",
  tr: "🇹🇷",
  uk: "🇺🇦",
  vi: "🇻🇳",
  zh: "🇨🇳",
};

function resolveDeckId(
  decks: { id: string }[],
  preferredDeckId: string | null,
) {
  if (decks.length === 0) {
    return null;
  }

  return decks.find((deck) => deck.id === preferredDeckId)?.id ?? decks[0].id;
}

function formatSinceLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function getLanguageFlag(code: string) {
  return LANGUAGE_FLAGS[normalizeLanguageCode(code)] ?? "🌐";
}

function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return new Intl.NumberFormat("en", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return `${value}`;
}

export default function RedesignedProfilePage() {
  const router = useRouter();
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    setActiveDeckId(getActiveDeckIdCookie());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUserProfile() {
      if (!user) {
        setUserDoc(null);
        setProfileError(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError(null);
        const nextUserDoc = await getUserDocument(user.uid);

        if (!cancelled) {
          setUserDoc(nextUserDoc);
        }
      } catch (error) {
        if (!cancelled) {
          setProfileError(
            error instanceof Error ? error.message : "Failed to load profile",
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadUserProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (decksLoading) {
      return;
    }

    const resolvedDeckId = resolveDeckId(decks, activeDeckId);

    if (!resolvedDeckId) {
      if (activeDeckId !== null) {
        clearActiveDeckIdCookie();
        setActiveDeckId(null);
      }

      return;
    }

    if (resolvedDeckId !== activeDeckId) {
      setActiveDeckIdCookie(resolvedDeckId);
      setActiveDeckId(resolvedDeckId);
    }
  }, [activeDeckId, decks, decksLoading]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  const activeDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId) ?? decks[0] ?? null,
    [activeDeckId, decks],
  );

  const languageGroups = useMemo(() => {
    const grouped = new Map<
      string,
      {
        code: string;
        decks: typeof decks;
        wordCount: number;
        accuracyTotal: number;
        accuracyCount: number;
        earliestCreatedAt: Date | null;
      }
    >();

    decks.forEach((deck) => {
      const code = normalizeLanguageCode(deck.study);
      const current = grouped.get(code) ?? {
        code,
        decks: [],
        wordCount: 0,
        accuracyTotal: 0,
        accuracyCount: 0,
        earliestCreatedAt: null,
      };

      current.decks.push(deck);
      current.wordCount += deck.words.length;
      current.earliestCreatedAt =
        current.earliestCreatedAt === null ||
        deck.createdAt < current.earliestCreatedAt
          ? deck.createdAt
          : current.earliestCreatedAt;

      deck.words.forEach((word) => {
        current.accuracyTotal += word.accuracy;
        current.accuracyCount += 1;
      });

      grouped.set(code, current);
    });

    const activeLanguageCode = activeDeck
      ? normalizeLanguageCode(activeDeck.study)
      : null;

    return Array.from(grouped.values())
      .map((group) => {
        const representativeDeck =
          group.decks.find((deck) => deck.id === activeDeck?.id) ??
          [...group.decks].sort(
            (left, right) =>
              right.createdAt.getTime() - left.createdAt.getTime(),
          )[0] ??
          null;
        const mastery =
          group.accuracyCount > 0
            ? Math.round((group.accuracyTotal / group.accuracyCount) * 100)
            : 0;
        const deckCountLabel = `${group.decks.length} deck${
          group.decks.length === 1 ? "" : "s"
        }`;

        return {
          code: group.code,
          name: getLanguageName(group.code),
          flag: getLanguageFlag(group.code),
          active: group.code === activeLanguageCode,
          previewDeckId: representativeDeck?.id ?? null,
          studyDeckId: representativeDeck?.id ?? null,
          meta: `${group.wordCount} words · since ${formatSinceLabel(
            group.earliestCreatedAt ?? new Date(),
          )}`,
          progressLabel:
            group.wordCount > 0
              ? `${mastery}% mastered · ${deckCountLabel}`
              : `Add words to start · ${deckCountLabel}`,
          mastery,
        };
      })
      .sort((left, right) => {
        if (left.active !== right.active) {
          return left.active ? -1 : 1;
        }

        return right.mastery - left.mastery;
      });
  }, [activeDeck, decks]);

  const activeLanguageProgress = useMemo(() => {
    if (!activeDeck) {
      return DEFAULT_PROGRESS;
    }

    return (
      userDoc?.questProgress?.[normalizeLanguageCode(activeDeck.study)] ??
      DEFAULT_PROGRESS
    );
  }, [activeDeck, userDoc?.questProgress]);

  const progress = useMemo(
    () => toProgressViewModel(activeLanguageProgress),
    [activeLanguageProgress],
  );

  const totalXp = useMemo(
    () =>
      Object.values(userDoc?.questProgress ?? {}).reduce(
        (sum, item) => sum + Math.max(item.totalXp, 0),
        0,
      ),
    [userDoc?.questProgress],
  );

  const bestStreak = useMemo(
    () =>
      Object.values(userDoc?.questProgress ?? {}).reduce(
        (best, item) => Math.max(best, item.streak),
        0,
      ),
    [userDoc?.questProgress],
  );

  const totalWords = useMemo(
    () => decks.reduce((sum, deck) => sum + deck.words.length, 0),
    [decks],
  );

  const profileName =
    userDoc?.name?.trim() ||
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    "Learner";
  const avatarLabel = profileName.charAt(0).toUpperCase() || "L";
  const nativeLanguageCode = normalizeLanguageCode(
    userDoc?.nativeLanguage ?? "en",
  );
  const nativeLanguageLabel = `${getLanguageFlag(nativeLanguageCode)} ${getLanguageName(
    nativeLanguageCode,
  )}`;
  const activeLanguageName = activeDeck
    ? `${getLanguageFlag(activeDeck.study)} ${getLanguageName(activeDeck.study)}`
    : "No active language";

  const handleTabSelect = useCallback(
    (tabId: string) => {
      switch (tabId as RedesignedTabId) {
        case "quests":
          router.push("/redesigned/home");
          break;
        case "decks":
          if (activeDeck) {
            router.push(`/redesigned/decks/${activeDeck.id}`);
          } else {
            router.push("/home");
          }
          break;
        case "add":
          router.push("/home");
          break;
        case "profile":
        default:
          break;
      }
    },
    [activeDeck, router],
  );

  const handlePreviewLanguage = useCallback(
    (languageCode: string) => {
      const match = languageGroups.find(
        (language) => language.code === languageCode,
      );

      if (!match?.previewDeckId) {
        return;
      }

      setActiveDeckIdCookie(match.previewDeckId);
      setActiveDeckId(match.previewDeckId);
      router.push(`/redesigned/decks/${match.previewDeckId}`);
    },
    [languageGroups, router],
  );

  const handleStudyLanguage = useCallback(
    (languageCode: string) => {
      const match = languageGroups.find(
        (language) => language.code === languageCode,
      );

      if (!match?.studyDeckId) {
        return;
      }

      setActiveDeckIdCookie(match.studyDeckId);
      setActiveDeckId(match.studyDeckId);
      router.push("/redesigned/home");
    },
    [languageGroups, router],
  );

  const handleSwitchLanguage = useCallback(
    (languageCode: string) => {
      const match = languageGroups.find(
        (language) => language.code === languageCode,
      );

      if (!match?.studyDeckId) {
        return;
      }

      setActiveDeckIdCookie(match.studyDeckId);
      setActiveDeckId(match.studyDeckId);
      setToastMessage(`Switched to ${match.flag} ${match.name} deck`);
    },
    [languageGroups],
  );

  const handleAddLanguage = useCallback(() => {
    router.push("/home");
  }, [router]);

  const loading = authLoading || decksLoading || profileLoading;
  const error = authError || decksError || profileError;

  if (loading) {
    return <FullPageLoading />;
  }

  if (error) {
    return <ErrorState error={error} showBackToLogin={false} />;
  }

  return (
    <RedesignedThemeProvider>
      <ProfileScreen
        profile={{
          avatarLabel,
          name: profileName,
          nativeLabel: nativeLanguageLabel,
          levelLabel: `Level ${progress.level} · ${progress.title} · 🔥 ${activeLanguageProgress.streak}-day streak`,
          xpLabel: `${progress.currentXp} / ${progress.targetXp} XP this level`,
          xpProgress: (progress.currentXp / progress.targetXp) * 100,
        }}
        languages={languageGroups.map((language) => ({
          code: language.code,
          flag: language.flag,
          name: language.name,
          meta: language.meta,
          progressLabel: language.progressLabel,
          mastery: language.mastery,
          active: language.active,
          previewDisabled: !language.previewDeckId,
        }))}
        stats={[
          {
            label: "Total XP",
            value: formatCompactNumber(totalXp),
            color: redesignedPalette.accent.success,
          },
          {
            label: "Saved words",
            value: formatCompactNumber(totalWords),
            color: redesignedPalette.text.primary,
          },
          {
            label: "Best streak",
            value: formatCompactNumber(bestStreak),
            color: redesignedPalette.accent.gold,
          },
        ]}
        settings={[
          {
            icon: "🌍",
            label: "Native language",
            value: getLanguageName(nativeLanguageCode),
          },
          {
            icon: "🎯",
            label: "Active language",
            value: activeLanguageName,
          },
          {
            icon: "💳",
            label: "Plan",
            value: userDoc?.tier === "paid" ? "Paid" : "Free",
          },
          {
            icon: "🗂️",
            label: "Deck library",
            value: `${decks.length} deck${decks.length === 1 ? "" : "s"}`,
          },
        ]}
        tabs={getRedesignedTabs("profile")}
        emptyLanguagesMessage="Create your first deck to start tracking progress here."
        toastMessage={toastMessage}
        onTabSelect={handleTabSelect}
        onPreviewLanguage={handlePreviewLanguage}
        onStudyLanguage={handleStudyLanguage}
        onSwitchLanguage={handleSwitchLanguage}
        onAddLanguage={handleAddLanguage}
      />
    </RedesignedThemeProvider>
  );
}
