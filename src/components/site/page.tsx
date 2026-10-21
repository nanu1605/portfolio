import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@content/site";
import { cx } from "@/lib/cx";

/**
 * Open Graph for a page (§11). A page's `openGraph` replaces the layout's,
 * so it carries the site-wide fields too; the image comes from the route's
 * opengraph-image.tsx.
 */
export const openGraph = (path: string, title: string, description?: string) =>
  ({
    type: "website",
    siteName: site.name,
    locale: "en_IN",
    url: path,
    title: path === "/" ? title : site.seo.titleTemplate.replace("%s", title),
    description: description ?? site.seo.description,
  }) satisfies Metadata["openGraph"];

/** Title, description, canonical URL and Open Graph of a §7 route (A.1). */
export function pageMetadata(path: string): Metadata {
  const page = site.seo.pages[path];
  if (!page) throw new Error(`No SEO entry for ${path} in content/site.ts`);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: openGraph(path, page.title, page.description),
  };
}

/** A page's heading block over its content, in the site container (§8). */
export function Page({
  title,
  eyebrow,
  intro,
  className,
  children,
}: {
  title: ReactNode;
  eyebrow?: string;
  intro?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="px-page py-section pt-12 md:pt-16">
      <div className={cx("mx-auto flex max-w-site flex-col gap-12", className)}>
        <header className="flex max-w-text flex-col gap-4">
          {eyebrow && (
            <p className="font-mono text-mono-label uppercase text-fg-subtle">
              {eyebrow}
            </p>
          )}
          <h1 className="text-h1">{title}</h1>
          {intro && <p className="text-body-lg text-fg-muted">{intro}</p>}
        </header>
        {children}
      </div>
    </div>
  );
}
