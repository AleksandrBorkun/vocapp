"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAppInstall } from "@/app/hooks/useAppInstall";
import { redesignedFonts, redesignedPalette } from "@/lib/redesigned/tokens";
import { getTranslation } from "@/lib/translations";

type LandingInstallButtonsProps = {
  justify?: "flex-start" | "center";
};

const sharedButtonSx = {
  minWidth: { xs: "100%", sm: 210 },
  borderRadius: "14px",
  px: 2.5,
  py: 1.5,
  justifyContent: "flex-start",
  gap: 1.25,
  fontFamily: redesignedFonts.body,
  textTransform: "none",
  boxShadow: "none",
} as const;

function AppleStoreGlyph() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M15.4 11.5c0-3.1 2.5-4.6 2.6-4.7-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.6 1.1-4.6 1.1-.9 0-2.4-1.1-3.9-1C3 4.6 1 5.9 0 7.9c-2 3.5-.5 8.7 1.4 11.6 1 1.4 2.1 3 3.6 2.9 1.4-.1 2-1 3.7-1s2.2.9 3.7.9c1.5 0 2.5-1.4 3.5-2.8 1.1-1.6 1.5-3.2 1.5-3.3-.1-.2-2-.8-2-3.7zm-1.9-6.8c.8-1 1.3-2.4 1.2-3.7-1.1.1-2.5.8-3.3 1.8-.7.8-1.4 2.2-1.2 3.5 1.3.1 2.5-.6 3.3-1.6z" />
    </svg>
  );
}

function GooglePlayGlyph() {
  return (
    <svg
      width="20"
      height="22"
      viewBox="0 0 20 22"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 .5 11 11 0 22.5V.5Zm2 3.3v14.4L9.2 11 2 3.8Zm9.8 5.4 2.4-2.4 3.4 2-3.4 2-2.4-1.6Zm-1.4 1.4L2.7 19h.1l10.1-5.8-2.5-2.6Zm1.4 1.4 2.4 2.4 3.4-2-3.4-2-2.4 1.6Z" />
    </svg>
  );
}

export default function LandingInstallButtons({
  justify = "center",
}: LandingInstallButtonsProps) {
  const router = useRouter();
  const { platform, isInstalled, canPromptInstall, promptInstall } =
    useAppInstall();
  const [activeGuide, setActiveGuide] = useState<"ios" | "android" | null>(
    null,
  );

  const openApp = () => {
    router.push("/login");
  };

  const handleAppleClick = () => {
    if (isInstalled) {
      openApp();
      return;
    }

    setActiveGuide("ios");
  };

  const handleAndroidClick = async () => {
    if (isInstalled) {
      openApp();
      return;
    }

    if (canPromptInstall) {
      const accepted = await promptInstall();

      if (!accepted && platform === "android") {
        setActiveGuide("android");
      }

      return;
    }

    if (platform === "android") {
      setActiveGuide("android");
      return;
    }

    openApp();
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent={justify}
        width="100%"
        alignItems="stretch"
      >
        <Button
          type="button"
          variant="contained"
          onClick={handleAppleClick}
          sx={{
            ...sharedButtonSx,
            backgroundColor: redesignedPalette.text.primary,
            color: redesignedPalette.canvas,
            "&:hover": {
              backgroundColor: "#dfdac8",
              boxShadow: "none",
            },
          }}
        >
          <AppleStoreGlyph />
          <span>
            <Typography
              component="span"
              sx={{
                display: "block",
                fontSize: 10,
                fontWeight: 400,
                opacity: 0.62,
              }}
            >
              {getTranslation("landing.install.apple.prefix")}
            </Typography>
            <Typography
              component="span"
              sx={{ display: "block", fontSize: 15, fontWeight: 700 }}
            >
              {getTranslation("landing.install.apple.title")}
            </Typography>
          </span>
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => {
            void handleAndroidClick();
          }}
          sx={{
            ...sharedButtonSx,
            color: redesignedPalette.text.primary,
            borderColor: redesignedPalette.border,
            borderWidth: "1.5px",
            "&:hover": {
              borderColor: redesignedPalette.text.muted,
              backgroundColor: redesignedPalette.surface.primary,
              borderWidth: "1.5px",
            },
          }}
        >
          <GooglePlayGlyph />
          <span>
            <Typography
              component="span"
              sx={{
                display: "block",
                fontSize: 10,
                fontWeight: 400,
                opacity: 0.62,
              }}
            >
              {getTranslation("landing.install.play.prefix")}
            </Typography>
            <Typography
              component="span"
              sx={{ display: "block", fontSize: 15, fontWeight: 700 }}
            >
              {getTranslation("landing.install.play.title")}
            </Typography>
          </span>
        </Button>
      </Stack>
      <Typography
        sx={{
          mt: 1.5,
          textAlign: justify === "center" ? "center" : "left",
          fontSize: 12,
          color: redesignedPalette.text.muted,
        }}
      >
        {isInstalled
          ? getTranslation("landing.install.status.installed")
          : canPromptInstall
            ? getTranslation("landing.install.status.prompt")
            : platform === "ios"
              ? getTranslation("landing.install.status.ios")
              : getTranslation("landing.install.status.default")}
      </Typography>
      <Dialog
        open={activeGuide !== null}
        onClose={() => setActiveGuide(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${redesignedPalette.border}`,
            backgroundColor: redesignedPalette.surface.primary,
            backgroundImage: "none",
            color: redesignedPalette.text.primary,
            width: "min(560px, calc(100vw - 32px))",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: redesignedFonts.displayFallback,
            fontWeight: 300,
            fontSize: 30,
            pb: 1,
          }}
        >
          {activeGuide === "ios"
            ? getTranslation("landing.install.ios.title")
            : getTranslation("landing.install.android.title")}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important", pb: 3 }}>
          <Stack spacing={1.5}>
            <Typography
              sx={{ color: redesignedPalette.text.secondary, lineHeight: 1.7 }}
            >
              {activeGuide === "ios"
                ? getTranslation("landing.install.ios.description")
                : canPromptInstall
                  ? getTranslation("landing.install.android.descriptionPrompt")
                  : getTranslation(
                      "landing.install.android.descriptionFallback",
                    )}
            </Typography>
            <Stack spacing={1}>
              {(activeGuide === "ios"
                ? [
                    getTranslation("landing.install.ios.step1"),
                    getTranslation("landing.install.ios.step2"),
                    getTranslation("landing.install.ios.step3"),
                  ]
                : [
                    getTranslation("landing.install.android.step1"),
                    getTranslation("landing.install.android.step2"),
                    getTranslation("landing.install.android.step3"),
                  ]
              ).map((step, index) => (
                <Box
                  key={step}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "flex-start",
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: redesignedPalette.surface.secondary,
                    border: `1px solid ${redesignedPalette.border}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      color: redesignedPalette.accent.warm,
                      backgroundColor: redesignedPalette.accentBackground.warm,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      color: redesignedPalette.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {step}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              justifyContent="flex-end"
            >
              <Button
                type="button"
                variant="outlined"
                onClick={() => setActiveGuide(null)}
                sx={{
                  borderColor: redesignedPalette.border,
                  color: redesignedPalette.text.secondary,
                }}
              >
                {getTranslation("landing.install.actions.close")}
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={() => {
                  setActiveGuide(null);
                  openApp();
                }}
                sx={{
                  backgroundColor: redesignedPalette.accent.warm,
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#a36228",
                    boxShadow: "none",
                  },
                }}
              >
                {getTranslation("landing.install.actions.open")}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
