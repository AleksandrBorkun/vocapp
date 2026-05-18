"use client";

import { useRef } from "react";
import { Box, ButtonBase, Divider, Stack, Typography } from "@mui/material";
import BottomTabBar from "@/app/components/redesigned/quests/BottomTabBar";
import PillBadge from "@/app/components/redesigned/primitives/PillBadge";
import ProgressTrack from "@/app/components/redesigned/primitives/ProgressTrack";
import RedesignedScreenShell from "@/app/components/redesigned/primitives/RedesignedScreenShell";
import SectionLabel from "@/app/components/redesigned/primitives/SectionLabel";
import { BottomTabItemViewModel } from "@/app/components/redesigned/quests/types";
import {
  redesignedFonts,
  redesignedPalette,
  redesignedRadii,
} from "@/lib/redesigned/tokens";

interface ProfileSummaryViewModel {
  avatarLabel: string;
  name: string;
  nativeLabel: string;
  levelLabel: string;
  xpLabel: string;
  xpProgress: number;
}

interface LanguageCardViewModel {
  code: string;
  flag: string;
  name: string;
  meta: string;
  progressLabel: string;
  mastery: number;
  active: boolean;
  previewDisabled?: boolean;
}

interface StatViewModel {
  label: string;
  value: string;
  color: string;
}

interface SettingViewModel {
  icon: string;
  label: string;
  value: string;
}

interface ProfileScreenProps {
  profile: ProfileSummaryViewModel;
  languages: LanguageCardViewModel[];
  stats: StatViewModel[];
  settings: SettingViewModel[];
  tabs: BottomTabItemViewModel[];
  emptyLanguagesMessage?: string | null;
  toastMessage?: string | null;
  onTabSelect?: (tabId: string) => void;
  onPreviewLanguage?: (languageCode: string) => void;
  onStudyLanguage?: (languageCode: string) => void;
  onSwitchLanguage?: (languageCode: string) => void;
  onAddLanguage?: () => void;
}

function ActionButton({
  label,
  onClick,
  active,
  disabled = false,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        flex: 1,
        borderRadius: 2.5,
        px: 1.5,
        py: 1.125,
        border: `1px solid ${
          active ? "rgba(200, 124, 59, 0.32)" : redesignedPalette.border
        }`,
        backgroundColor: active
          ? redesignedPalette.accentBackground.warm
          : redesignedPalette.surface.tertiary,
        color: active
          ? redesignedPalette.accent.warm
          : redesignedPalette.text.primary,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{label}</Typography>
    </ButtonBase>
  );
}

export default function ProfileScreen({
  profile,
  languages,
  stats,
  settings,
  tabs,
  emptyLanguagesMessage,
  toastMessage,
  onTabSelect,
  onPreviewLanguage,
  onStudyLanguage,
  onSwitchLanguage,
  onAddLanguage,
}: ProfileScreenProps) {
  const settingsRef = useRef<HTMLDivElement | null>(null);

  return (
    <RedesignedScreenShell
      footer={<BottomTabBar items={tabs} onSelect={onTabSelect} />}
    >
      <Box sx={{ position: "relative", pb: 2.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 3, pt: 1.5, pb: 2 }}
        >
          <Typography
            sx={{
              fontFamily: redesignedFonts.displayFallback,
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: redesignedPalette.text.primary,
            }}
          >
            Profile
          </Typography>

          <ButtonBase
            onClick={() =>
              settingsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.secondary,
              color: redesignedPalette.text.primary,
            }}
          >
            <Typography sx={{ fontSize: 15, lineHeight: 1 }}>⚙️</Typography>
          </ButtonBase>
        </Stack>

        <Box
          sx={{
            mx: 3,
            mb: 2.5,
            borderRadius: redesignedRadii.large / 8,
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: redesignedPalette.surface.secondary,
            px: 2.5,
            py: 2.5,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 24,
                fontWeight: 400,
                fontFamily: redesignedFonts.displayFallback,
                background:
                  "linear-gradient(135deg, rgba(200,124,59,1), rgba(200,124,59,0.45))",
              }}
            >
              {profile.avatarLabel}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: redesignedPalette.text.primary,
                }}
              >
                {profile.name}
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 13,
                  color: redesignedPalette.text.secondary,
                }}
              >
                Native: {profile.nativeLabel}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 12,
                  color: redesignedPalette.text.muted,
                }}
              >
                {profile.levelLabel}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1.25 }}
              >
                <Box sx={{ flex: 1 }}>
                  <ProgressTrack
                    value={profile.xpProgress}
                    fill={redesignedPalette.accent.success}
                    track={redesignedPalette.surface.tertiary}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    whiteSpace: "nowrap",
                    color: redesignedPalette.text.muted,
                  }}
                >
                  {profile.xpLabel}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <SectionLabel>My languages</SectionLabel>

        {languages.length > 0 ? (
          languages.map((language) => (
            <Box
              key={language.code}
              sx={{
                mx: 3,
                mb: 1.25,
                borderRadius: redesignedRadii.large / 8,
                border: `1px solid ${
                  language.active
                    ? "rgba(200, 124, 59, 0.4)"
                    : redesignedPalette.border
                }`,
                backgroundColor: language.active
                  ? "rgba(200, 124, 59, 0.06)"
                  : redesignedPalette.surface.secondary,
                px: 2.25,
                py: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontSize: 32, lineHeight: 1 }}>
                  {language.flag}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: redesignedPalette.text.primary,
                    }}
                  >
                    {language.name}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: 12,
                      color: redesignedPalette.text.secondary,
                    }}
                  >
                    {language.meta}
                  </Typography>
                </Box>

                {language.active ? (
                  <PillBadge
                    label="Active"
                    color={redesignedPalette.accent.warm}
                    backgroundColor={redesignedPalette.accentBackground.warm}
                    borderColor="rgba(200, 124, 59, 0.3)"
                  />
                ) : null}
              </Stack>

              <Box sx={{ mb: 1.5 }}>
                <ProgressTrack
                  value={language.mastery}
                  fill={
                    language.active
                      ? redesignedPalette.accent.success
                      : redesignedPalette.accent.gold
                  }
                  track={redesignedPalette.surface.tertiary}
                />
                <Typography
                  sx={{
                    mt: 0.75,
                    fontSize: 11,
                    color: redesignedPalette.text.muted,
                  }}
                >
                  {language.progressLabel}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <ActionButton
                  label="Preview deck"
                  disabled={language.previewDisabled}
                  onClick={() => onPreviewLanguage?.(language.code)}
                />
                {language.active ? (
                  <ActionButton
                    label="Study now →"
                    active
                    onClick={() => onStudyLanguage?.(language.code)}
                  />
                ) : (
                  <ActionButton
                    label={`Switch to ${language.name}`}
                    onClick={() => onSwitchLanguage?.(language.code)}
                  />
                )}
              </Stack>
            </Box>
          ))
        ) : (
          <Box
            sx={{
              mx: 3,
              mb: 1.5,
              px: 2.5,
              py: 2.25,
              borderRadius: 2.5,
              border: `1px solid ${redesignedPalette.border}`,
              backgroundColor: redesignedPalette.surface.primary,
            }}
          >
            <Typography sx={{ color: redesignedPalette.text.secondary }}>
              {emptyLanguagesMessage ??
                "Create a deck to start learning a language."}
            </Typography>
          </Box>
        )}

        <ButtonBase
          onClick={onAddLanguage}
          sx={{
            mx: 3,
            mb: 2.5,
            width: "calc(100% - 48px)",
            borderRadius: 2,
            border: `1.5px dashed ${redesignedPalette.border}`,
            color: redesignedPalette.text.muted,
            px: 2,
            py: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 18, lineHeight: 1 }}>＋</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
              Start learning a new language
            </Typography>
          </Stack>
        </ButtonBase>

        <SectionLabel>All-time stats</SectionLabel>
        <Stack
          direction="row"
          divider={
            <Divider
              flexItem
              orientation="vertical"
              sx={{ borderColor: redesignedPalette.border }}
            />
          }
          sx={{
            mx: 3,
            mb: 2.5,
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: redesignedPalette.surface.secondary,
          }}
        >
          {stats.map((item) => (
            <Box
              key={item.label}
              sx={{ flex: 1, px: 1.25, py: 1.75, textAlign: "center" }}
            >
              <Typography
                sx={{
                  color: item.color,
                  fontFamily: redesignedFonts.displayFallback,
                  fontSize: 22,
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {item.value}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: redesignedPalette.text.muted,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box ref={settingsRef}>
          <SectionLabel>Settings</SectionLabel>
        </Box>
        <Box
          sx={{
            mx: 3,
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: redesignedPalette.surface.secondary,
          }}
        >
          {settings.map((item, index) => (
            <Stack
              key={item.label}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                px: 2,
                py: 1.75,
                borderBottom:
                  index === settings.length - 1
                    ? "none"
                    : `1px solid ${redesignedPalette.border}`,
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: redesignedPalette.surface.tertiary,
                }}
              >
                <Typography sx={{ fontSize: 14, lineHeight: 1 }}>
                  {item.icon}
                </Typography>
              </Box>
              <Typography
                sx={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 500,
                  color: redesignedPalette.text.primary,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: redesignedPalette.text.secondary }}
              >
                {item.value}
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: redesignedPalette.text.muted }}
              >
                ›
              </Typography>
            </Stack>
          ))}
        </Box>

        <Box sx={{ height: 16 }} />

        <Box
          sx={{
            position: "fixed",
            left: "50%",
            bottom: 108,
            transform: toastMessage
              ? "translateX(-50%) translateY(0)"
              : "translateX(-50%) translateY(20px)",
            opacity: toastMessage ? 1 : 0,
            transition: "all 0.3s ease",
            pointerEvents: "none",
            zIndex: 20,
            borderRadius: 1.5,
            border: "1px solid rgba(200, 124, 59, 0.4)",
            backgroundColor: redesignedPalette.surface.primary,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            px: 2.5,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              whiteSpace: "nowrap",
              fontSize: 14,
              fontWeight: 500,
              color: redesignedPalette.text.primary,
            }}
          >
            {toastMessage ?? ""}
          </Typography>
        </Box>
      </Box>
    </RedesignedScreenShell>
  );
}
