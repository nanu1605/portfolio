import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { site } from "./content/site";

// §14 headers. Turnstile (the contact form) is the only third party; the
// Vercel Analytics scripts (Phase 7) are served from this origin. Inline
// scripts stay allowed for the theme and reveal scripts; development adds
// eval for React's dev tooling.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // "Last updated" in the footer (A.13) is the build date.
  env: { BUILD_DATE: new Date().toISOString() },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  // §4.4: short links and the old site's resume path.
  async redirects() {
    const pairs: [string, string][] = [
      ["/cv", "/resume"],
      ["/vyro", "/work/vyro"],
      ["/baby", "/work/baby"],
      ["/jainav", "/company"],
      ["/github", site.links.github],
      ["/linkedin", site.links.linkedin],
      ["/Tanishq_Jain_Resume.pdf", "/resume.pdf"],
    ];
    return pairs.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
  turbopack: {
    // This checkout, even when it sits inside another one (a worktree).
    root: path.resolve("."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Case studies are MDX imported by their route, not MDX pages, so
// pageExtensions stays at the default. Turbopack takes plugins by name or
// absolute path; scripts/lib/content-checks.ts compiles with the same two.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", path.resolve("src/lib/remark-headings.mjs")],
  },
});

export default withMDX(nextConfig);
