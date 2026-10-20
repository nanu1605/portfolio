import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { site } from "./content/site";

const nextConfig: NextConfig = {
  // "Last updated" in the footer (A.13) is the build date.
  env: { BUILD_DATE: new Date().toISOString() },
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
