import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

// The size-adjusted fallbacks are our own @font-face rules in globals.css:
// next/font's only name local(Arial), which Android and most Linux lack, so
// there the text reflowed when the web font arrived (a 0.21 layout shift).

export const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  fallback: ["Jakarta Fallback"],
  variable: "--font-jakarta",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  // Only the display face is preloaded (§13); mono can swap in.
  preload: false,
  adjustFontFallback: false,
  fallback: ["JetBrains Fallback"],
  variable: "--font-jetbrains",
});
