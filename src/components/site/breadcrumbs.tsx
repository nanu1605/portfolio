import { microcopy } from "@content/microcopy";
import { projects } from "@content/projects";
import { site } from "@content/site";
import { JsonLd } from "./json-ld";

const name = (path: string) =>
  path === "/"
    ? microcopy.palette.home
    : (site.seo.pages[path]?.title ??
      projects.find((p) => `/work/${p.slug}` === path)?.title);

/** BreadcrumbList for an inner page (§11): Home, then each level of `path`. */
export function Breadcrumbs({ path }: { path: string }) {
  const parts = path.split("/").slice(1);
  const trail = [
    "/",
    ...parts.map((_, i) => `/${parts.slice(0, i + 1).join("/")}`),
  ];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: name(p),
          item: new URL(p, site.url).href,
        })),
      }}
    />
  );
}
