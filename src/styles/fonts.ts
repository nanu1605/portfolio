import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

export const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  // Only the display face is preloaded (§13); mono can swap in.
  preload: false,
  variable: "--font-jetbrains",
});
