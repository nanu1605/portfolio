import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { mono, sans } from "@/styles/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tanishq Jain — ML & systems engineer",
    template: "%s — Tanishq Jain",
  },
  description:
    "I build machine-learning systems and software that hold up outside the notebook, and ship them through my company, Jainav Infotech. Based in Indore, India.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
