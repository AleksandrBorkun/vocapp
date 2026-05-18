import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

const faviconSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230f0d0a'/%3E%3Cellipse cx='16' cy='16' rx='11' ry='13' fill='%232a5535'/%3E%3Cellipse cx='16' cy='16' rx='8' ry='10' fill='%23c8d97a'/%3E%3Cellipse cx='16' cy='17' rx='4' ry='4.5' fill='%23c87c3b'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "Vocado - Learn any language through play",
  description: "Build vocabulary decks, play daily quests, and study new words with a flashcard-powered web app.",
  applicationName: "Vocado",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: faviconSvg, type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vocado",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f0d0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
