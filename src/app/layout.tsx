import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Enhancements } from "@/components/site/enhancements";
import { revealScript } from "@/lib/reveal-script";
import { mono, sans } from "@/styles/fonts";
import { colors } from "@/styles/tokens";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tanishq Jain — ML & systems engineer",
    template: "%s — Tanishq Jain",
  },
  description:
    "I build machine-learning systems and software that hold up outside the notebook, and ship them through my company, Jainav Infotech. Based in Indore, India.",
};

const themeColors = { dark: colors.bg.dark, light: colors.bg.light };

export const viewport: Viewport = {
  // Content can reach under notches; gutters add the safe-area insets.
  viewportFit: "cover",
  // Dark is the default; <Enhancements> follows the reader's choice.
  themeColor: themeColors.dark,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      // Next 16 then skips smooth scrolling on route changes; CSS keeps it
      // for in-page anchors when motion is allowed.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Enhancements themeColors={themeColors} />
        </ThemeProvider>
      </body>
    </html>
  );
}
