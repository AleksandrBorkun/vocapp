"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MarketingLanding from "./components/landing/MarketingLanding";
import { isStandaloneDisplayMode } from "./hooks/useAppInstall";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isStandaloneDisplayMode()) {
      router.replace("/home");
    }
  }, [router]);

  return <MarketingLanding />;
}
