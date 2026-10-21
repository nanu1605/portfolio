import type { MetadataRoute } from "next";
import { site } from "@content/site";
import { colors } from "@/styles/tokens";

// /manifest.webmanifest (§7), with the monogram icons from app/icon.tsx.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.seo.pages["/"]!.title,
    short_name: site.name,
    description: site.seo.description,
    start_url: "/",
    display: "browser",
    background_color: colors.bg.dark,
    theme_color: colors.bg.dark,
    icons: [192, 512].map((size) => ({
      src: `/icon/${size}`,
      sizes: `${size}x${size}`,
      type: "image/png",
    })),
  };
}
