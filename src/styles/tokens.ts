// Design tokens: the only place colours and other design values are defined.
// `pnpm tokens:build` turns this file into src/styles/tokens.css (spec §5, §6.1).

export type Theme = "dark" | "light";

export const colors = {
  bg: { dark: "#0A0A0B", light: "#FAFAF9" },
  "bg-raised": { dark: "#111113", light: "#FFFFFF" },
  surface: { dark: "#161618", light: "#F4F4F5" },
  "surface-2": { dark: "#1C1C1F", light: "#EBEBED" },
  border: { dark: "#26262A", light: "#E4E4E7" },
  "border-strong": { dark: "#63636B", light: "#8A8A93" },
  fg: { dark: "#EDEDEF", light: "#0B0B0C" },
  "fg-muted": { dark: "#A1A1AA", light: "#52525B" },
  "fg-subtle": { dark: "#8A8A93", light: "#6B6B74" },
  accent: { dark: "#34D399", light: "#047857" },
  "accent-strong": { dark: "#6EE7B7", light: "#065F46" },
  // #34D399 at 12% and #047857 at 10%
  "accent-soft": { dark: "#34D3991F", light: "#0478571A" },
  "on-accent": { dark: "#04130C", light: "#FFFFFF" },
  warn: { dark: "#F5B942", light: "#B45309" },
  hot: { dark: "#FF5D5D", light: "#B91C1C" },
  info: { dark: "#60A5FA", light: "#1D4ED8" },
  // Product accents: fills and glows only, never text on light.
  menumesh: { dark: "#FF6606", light: "#FF6606" },
  vyro: { dark: "#4CC9F0", light: "#4CC9F0" },
  baby: { dark: "#6EA8FE", light: "#6EA8FE" },
  // Texture and overlays (decorative; not text). fg at 4% for the hairline
  // grid (§5.5); bg-raised at 80% for blurred bars; the dialog backdrop.
  "grid-line": { dark: "#EDEDEF0A", light: "#0B0B0C0A" },
  glass: { dark: "#111113CC", light: "#FFFFFFCC" },
  scrim: { dark: "#0A0A0BCC", light: "#0B0B0C66" },
} as const satisfies Record<string, Record<Theme, string>>;

export type ColorToken = keyof typeof colors;

export type ContrastCheck = {
  fg: ColorToken;
  bg: ColorToken;
  min: number;
  themes?: Theme[];
};

const surfaces = ["bg", "bg-raised", "surface"] as const;
const textTokens = [
  "fg",
  "fg-muted",
  "fg-subtle",
  "accent",
  "accent-strong",
  "warn",
  "hot",
  "info",
] as const;

// Body text needs 4.5:1; UI parts (controls, focus ring, chart fills) need 3:1.
export const contrastChecks: ContrastCheck[] = [
  ...textTokens.flatMap((fg) => surfaces.map((bg) => ({ fg, bg, min: 4.5 }))),
  { fg: "fg", bg: "surface-2", min: 4.5 },
  { fg: "fg-muted", bg: "surface-2", min: 4.5 },
  { fg: "on-accent", bg: "accent", min: 4.5 },
  ...surfaces.map((bg) => ({ fg: "border-strong" as const, bg, min: 3 })),
  ...(["menumesh", "vyro", "baby"] as const).map((fg) => ({
    fg,
    bg: "bg" as const,
    min: 3,
    themes: ["dark" as const],
  })),
];

export const fonts = {
  sans: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
  mono: "var(--font-jetbrains), ui-monospace, monospace",
};

// size, weight, tracking, line height (spec §5.3)
export const type = {
  display: ["clamp(3rem, 2rem + 6vw, 7.5rem)", 700, "-0.04em", 0.95],
  h1: ["clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)", 700, "-0.03em", 1],
  h2: ["clamp(1.75rem, 1.2rem + 2vw, 2.75rem)", 650, "-0.02em", 1.1],
  h3: ["clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)", 600, "-0.01em", 1.25],
  "body-lg": ["1.1875rem", 400, "0", 1.6],
  body: ["1.0625rem", 400, "0", 1.65],
  small: ["0.875rem", 450, "0", 1.5],
  "mono-label": ["0.75rem", 500, "0.08em", 1.4],
  readout: ["clamp(2rem, 1.5rem + 2vw, 3.25rem)", 500, "-0.02em", 1],
} as const satisfies Record<string, readonly [string, number, string, number]>;

export const radius = { sm: "6px", md: "10px", lg: "16px", xl: "24px" };

export const layout = {
  // max-w-site, max-w-wide, max-w-text (prose width)
  container: { site: "1280px", wide: "1440px", text: "68ch" },
  section: "clamp(5rem, 4rem + 6vw, 10rem)",
  // gutter by breakpoint: base, md (768px), lg (1024px)
  gutter: ["16px", "24px", "32px"],
};

export const motion = {
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    "in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  },
  // milliseconds
  duration: { fast: 150, base: 250, slow: 600, reveal: 700 },
  stagger: 75,
};
