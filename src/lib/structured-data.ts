import { education } from "@content/education";
import { media } from "@content/screens";
import { site } from "@content/site";

// JSON-LD (§11). The site-wide graph goes in the root layout; case-study.tsx
// adds the software entries and breadcrumbs.tsx the BreadcrumbList. Nothing
// here imports a component: the layout ships every client component it
// imports, rendered or not.

export const ref = (name: string) => ({ "@id": `${site.url}/#${name}` });
export const absolute = (path: string) => new URL(path, site.url).href;

export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      ...ref("person"),
      name: site.name,
      url: site.url,
      image: absolute(media.photo.share.jpg),
      jobTitle: "ML & Systems Engineer",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Indore",
        addressRegion: "Madhya Pradesh",
        addressCountry: "IN",
      },
      alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
      sameAs: Object.values(site.links),
      knowsAbout: [
        "Machine learning",
        "MLOps",
        "Reinforcement learning",
        "Time-series forecasting",
        "DevOps",
        "Rust",
        "TypeScript",
      ],
    },
    {
      "@type": "Organization",
      ...ref("company"),
      name: "Jainav Infotech Private Limited",
      founder: ref("person"),
      // Its own site, once it's live (A.7).
      ...(site.flags.jainavLive && { url: "https://jainavinfotech.in" }),
    },
    {
      "@type": "WebSite",
      ...ref("website"),
      name: site.name,
      url: site.url,
      author: ref("person"),
    },
  ],
};
