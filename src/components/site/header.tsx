import Link from "next/link";
import { microcopy } from "@content/microcopy";
import { projects, workFilters } from "@content/projects";
import { site } from "@content/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeaderShell, MobileMenu, NavLinks } from "./header-client";
import type { PaletteItem } from "./palette";
import { Search } from "./search";

export const themeLabels = {
  initial: microcopy.palette.actions.theme,
  toLight: microcopy.icons.toLight,
  toDark: microcopy.icons.toDark,
};

const palette = microcopy.palette;
const links = [...site.nav, site.resume];
const filterLabel = (id: string) =>
  workFilters.find((f) => f.id === id)?.label ?? id;

/** What the command palette searches (§6.4): every page, case study and action. */
const paletteItems: PaletteItem[] = [
  ...Object.entries(site.seo.pages).map(([href, page]) => ({
    group: "pages" as const,
    label:
      href === "/"
        ? palette.home
        : (links.find((l) => l.href === href)?.label ?? page.title),
    keywords: [page.title],
    href,
  })),
  ...projects
    .filter((p) => p.caseStudy)
    .toSorted((a, b) => a.order - b.order)
    .map((p) => ({
      group: "projects" as const,
      label: p.title,
      keywords: [...p.stack, ...p.filters.map(filterLabel)],
      href: `/work/${p.slug}`,
    })),
  ...(
    [
      [palette.actions.copyEmail, { action: "copy", keywords: [site.email] }],
      [
        palette.actions.resume,
        { href: "/resume.pdf", download: true, keywords: ["PDF"] },
      ],
      [palette.actions.theme, { action: "theme", keywords: [] }],
      [palette.actions.github, { href: site.links.github, external: true }],
      [palette.actions.linkedin, { href: site.links.linkedin, external: true }],
      [palette.actions.medium, { href: site.links.medium, external: true }],
    ] as const
  ).map(([label, rest]) => ({
    group: "actions" as const,
    label,
    keywords: [],
    ...rest,
  })),
];

const paletteLabels = {
  search: microcopy.icons.search,
  close: microcopy.icons.closeSearch,
  placeholder: palette.placeholder,
  copied: microcopy.copied,
  groups: palette.groups,
  results: palette.results,
};

const wordmark = (
  <Link
    href="/"
    className="mr-auto inline-flex min-h-11 items-center text-body font-bold tracking-tight text-fg"
  >
    {site.name}
  </Link>
);

/**
 * Site header (§8.1): wordmark, the five links, the theme toggle and
 * "Resume" from 1024 px; tablets keep the toggle and "Resume" beside the
 * menu button, phones only the menu button (cross-device §5). Search opens
 * the command palette at every width.
 */
export function Header() {
  return (
    <HeaderShell className="glass sticky top-0 z-40 border-b border-border print:hidden">
      <div className="mx-auto flex h-(--header-h) max-w-wide items-center gap-1 px-page">
        {wordmark}
        <NavLinks
          links={site.nav}
          label={microcopy.landmarks.mainNav}
          className="hidden lg:block"
        />
        <Search
          items={paletteItems}
          email={site.email}
          labels={paletteLabels}
        />
        <ThemeToggle labels={themeLabels} className="max-md:hidden" />
        <Button
          variant="ghost"
          href={site.resume.href}
          className="max-md:hidden"
        >
          {site.resume.label}
        </Button>
        <MobileMenu
          links={[...site.nav, site.resume]}
          email={site.email}
          labels={{
            open: microcopy.icons.openMenu,
            close: microcopy.icons.closeMenu,
            menu: microcopy.landmarks.menu,
            nav: microcopy.landmarks.mainNav,
          }}
          wordmark={wordmark}
          themeToggle={<ThemeToggle labels={themeLabels} />}
        />
      </div>
    </HeaderShell>
  );
}
