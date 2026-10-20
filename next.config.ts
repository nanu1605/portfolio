import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "Last updated" in the footer (A.13) is the build date.
  env: { BUILD_DATE: new Date().toISOString() },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Case studies are MDX imported by their route, not MDX pages, so
// pageExtensions stays at the default. Turbopack takes plugins by name.
const withMDX = createMDX({
  options: { remarkPlugins: ["remark-gfm"] },
});

export default withMDX(nextConfig);
