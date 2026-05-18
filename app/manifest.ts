import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vocado",
    short_name: "Vocado",
    description: "Build vocabulary decks, play daily quests, and learn new words through games.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0d0a",
    theme_color: "#0f0d0a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
