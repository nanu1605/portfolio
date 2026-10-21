import type { MetadataRoute } from "next";
import { projects } from "@content/projects";
import { site } from "@content/site";

// /sitemap.xml (§11): every §7 page and case study. No lastModified: a
// build date on every page would claim changes that didn't happen.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...Object.keys(site.seo.pages),
    ...projects.filter((p) => p.caseStudy).map((p) => `/work/${p.slug}`),
  ];
  return paths.map((path) => ({ url: new URL(path, site.url).href }));
}
