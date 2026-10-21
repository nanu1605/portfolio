import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@content/site";
import { signalPath, SIGNAL_VIEWBOX } from "@/lib/signal";
import { colors, type ColorToken } from "@/styles/tokens";

// Share images (§11) and app icons, drawn by next/og at build time in the
// site's fonts (the resume's TTFs) and dark tokens.

export const shareSize = { width: 1200, height: 630 };

const font = (name: string) =>
  readFile(path.join(process.cwd(), "assets/fonts", `${name}.ttf`));

const dark = (token: ColorToken) => colors[token].dark;

/** The TJ monogram: the favicon, and the corner of every share image. */
export function Monogram({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: size * 0.25,
        background: dark("surface"),
        border: `${Math.max(1, Math.round(size / 32))}px solid ${dark("border-strong")}`,
        color: dark("accent"),
        fontFamily: "Plus Jakarta Sans",
        fontSize: size * 0.46,
        fontWeight: 700,
        letterSpacing: "-0.04em",
      }}
    >
      TJ
    </div>
  );
}

/** A square icon of the monogram, for the favicon and the manifest. */
export async function iconImage(size: number) {
  return new ImageResponse(<Monogram size={size} />, {
    width: size,
    height: size,
    fonts: [
      {
        name: "Plus Jakarta Sans",
        data: await font("PlusJakartaSans-Bold"),
        weight: 700,
      },
    ],
  });
}

/**
 * The monogram and the domain, the page title, the name and role, then the
 * signal line, in the product's accent on its case studies.
 */
export async function shareImage({
  title,
  line,
  accent = "accent",
}: {
  title: string;
  line: string;
  accent?: "accent" | "baby" | "vyro" | "menumesh";
}) {
  const [bold, semibold, mono] = await Promise.all([
    font("PlusJakartaSans-Bold"),
    font("PlusJakartaSans-SemiBold"),
    font("JetBrainsMono-Medium"),
  ]);
  const { width, height } = SIGNAL_VIEWBOX;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px 56px",
        background: dark("bg"),
        color: dark("fg"),
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Monogram size={72} />
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontSize: 26,
            color: dark("fg-subtle"),
          }}
        >
          {new URL(site.url).host}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, color: dark("fg-muted") }}>
          {line}
        </div>
      </div>
      <svg
        width={1056}
        height={(1056 / width) * height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <path
          d={signalPath()}
          fill="none"
          stroke={dark(accent)}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    {
      ...shareSize,
      fonts: [
        { name: "Plus Jakarta Sans", data: bold, weight: 700 },
        { name: "Plus Jakarta Sans", data: semibold, weight: 600 },
        { name: "JetBrains Mono", data: mono, weight: 500 },
      ],
    },
  );
}

const byline = `${site.name} · ${site.role}`;

/** A §7 route's title, for its share image and the image's alt text. */
const pageTitle = (route: string) => {
  const page = site.seo.pages[route];
  if (!page) throw new Error(`No SEO entry for ${route} in content/site.ts`);
  return route === "/" ? site.name : page.title;
};

export const pageAlt = (route: string) =>
  route === "/"
    ? site.seo.pages["/"]!.title
    : `${pageTitle(route)} — ${site.name}`;

export const pageImage = (route: string) =>
  shareImage({
    title: pageTitle(route),
    line: route === "/" ? `${site.role} · ${site.location}` : byline,
  });

export const caseStudyImage = (
  title: string,
  accent?: "baby" | "vyro" | "menumesh",
) => shareImage({ title, line: byline, accent });
