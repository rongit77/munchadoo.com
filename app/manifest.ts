import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Munchadoo",
    short_name: "Munchadoo",
    description: "Find your next bite and play while you wait.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf7ef",
    theme_color: "#27352a",
    categories: ["food", "games", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
