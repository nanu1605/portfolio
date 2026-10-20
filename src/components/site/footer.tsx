import Link from "next/link";
import { home } from "@content/home";
import { microcopy } from "@content/microcopy";
import { site } from "@content/site";
import { CopyButton } from "@/components/ui/copy-button";

// BUILD_DATE is fixed by next.config.ts at build time, so a page that
// revalidates (Home, for the live release values) keeps the build's date.
const built = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
}).format(new Date(process.env.BUILD_DATE ?? Date.now()));

const pages = [
  ...site.nav,
  { label: site.seo.pages["/uses"].title, href: "/uses" },
  site.resume,
  { label: site.seo.pages["/contact"].title, href: "/contact" },
];

const social = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "Medium", href: site.links.medium },
];

const row =
  "inline-flex min-h-11 items-center text-small text-fg-muted transition-ui hover:text-fg";

/**
 * Footer (§8.1, A.13): bio, nav, social links, "Copy email", the note and
 * the last-updated date. One column on phones with a two-column nav,
 * two columns on tablets, the 12-column grid on desktop (cross-device §5).
 */
export function Footer() {
  const [legal] = microcopy.footer.legal
    .replace("{buildDate}", built)
    .split("Privacy");
  const copyEmail = home.sections.contact.buttons[0]!.label;

  return (
    <footer className="defer-render border-t border-border px-page pt-16 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-site gap-10 md:grid-cols-2 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-4 lg:col-span-5">
          <p className="text-small text-fg">{microcopy.footer.bio}</p>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex min-h-11 items-center font-mono text-mono-label text-fg-muted [overflow-wrap:anywhere] hover:text-fg"
          >
            {site.email}
          </a>
          <CopyButton
            text={site.email}
            label={copyEmail}
            done={microcopy.copied}
          />
        </div>
        <nav
          aria-label={microcopy.landmarks.footerNav}
          className="lg:col-span-4"
        >
          <ul className="grid grid-cols-2 gap-x-6">
            {pages.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={row}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-col lg:col-span-3">
          {social.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="me" className={row}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto mt-12 flex max-w-site flex-col gap-2 border-t border-border pt-6 text-small text-fg-subtle">
        <p>{microcopy.footer.note}</p>
        <p>
          {legal}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-fg"
          >
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}
