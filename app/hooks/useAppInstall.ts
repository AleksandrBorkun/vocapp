"use client";

import { useEffect, useState } from "react";

type InstallPlatform = "ios" | "android" | "other";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function detectPlatform(): InstallPlatform {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIpadOs = userAgent.includes("macintosh") && navigator.maxTouchPoints > 1;
  const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || isIpadOs;
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);

  if (isIosDevice && isSafari) {
    return "ios";
  }

  if (/android/.test(userAgent)) {
    return "android";
  }

  return "other";
}

function isStandaloneDisplayMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

export function useAppInstall() {
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setIsInstalled(isStandaloneDisplayMode());

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice.catch(() => null);

    if (choice?.outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);

    return choice?.outcome === "accepted";
  }

  return {
    platform,
    isInstalled,
    canPromptInstall: deferredPrompt !== null,
    promptInstall,
  };
}
