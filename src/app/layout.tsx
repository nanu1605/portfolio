import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { microcopy } from "@content/microcopy";
import { site } from "@content/site";
import { Enhancements } from "@/components/site/enhancements";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { revealScript } from "@/lib/reveal-script";
import { mono, sans } from "@/styles/fonts";
import { colors } from "@/styles/tokens";
import "@/styles/globals.css";

export const metadata: Metadata = {
  // Canonical URLs resolve against the production domain (§11).
  metadataBase: new URL(site.url),
  title: {
    default: "Tanishq Jain — ML & systems engineer",
    template: "%s — Tanishq Jain",
  },
  description:
    "I build machine-learning systems and software that hold up outside the notebook, and ship them through my company, Jainav Infotech. Based in Indore, India.",
};

const themeColors = { dark: colors.bg.dark, light: colors.bg.light };
const profiles = Object.values(site.links);
// Vercel's plain-HTML setup for Web Analytics and Speed Insights (§12): its
// React components would add their code to every page. The queues let
// events (lib/track.ts) wait for the scripts, which load after the page
// does; Speed Insights still reads the earlier Web Vitals from the buffer.
const vercelScripts = [
  "window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};",
  "window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};",
  'addEventListener("load",function(){["/_vercel/insights/script.js","/_vercel/speed-insights/script.js"].forEach(function(src){var s=document.createElement("script");s.src=src;document.head.appendChild(s)})});',
].join("");

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
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-accent px-4 py-3 text-small font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
          >
            {microcopy.landmarks.skip}
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <Enhancements
            themeColors={themeColors}
            greeting={microcopy.consoleGreeting}
            profiles={profiles}
            jarvis={microcopy.jarvisToast}
          />
          {/* Cookie-free page views and field Web Vitals (§12). Vercel
              serves the scripts, so off Vercel (a laptop, CI) they'd 404. */}
          {process.env.VERCEL && (
            <script dangerouslySetInnerHTML={{ __html: vercelScripts }} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
