import Link from "next/link";
import { microcopy } from "@content/microcopy";
import { site } from "@content/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { HeaderShell, MobileMenu, NavLinks } from "./header-client";

export const themeLabels = {
  initial: microcopy.palette.actions.theme,
  toLight: microcopy.icons.toLight,
  toDark: microcopy.icons.toDark,
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
 * menu button, phones only the menu button (cross-device §5). The search
 * button arrives with the command palette in Phase 7.
 */
export function Header() {
  return (
    <HeaderShell className="glass sticky top-0 z-40 border-b border-border">
      <div className="mx-auto flex h-(--header-h) max-w-wide items-center gap-1 px-page">
        {wordmark}
        <NavLinks
          links={site.nav}
          label={microcopy.landmarks.mainNav}
          className="hidden lg:block"
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
