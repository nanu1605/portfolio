import type { MetadataRoute } from "next";
import { site } from "@content/site";

// /robots.txt (§11): everything but the API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", site.url).href,
  };
}
