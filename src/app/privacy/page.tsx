import { microcopy } from "@content/microcopy";
import { site } from "@content/site";
import { Page, pageMetadata } from "@/components/site/page";

export const metadata = pageMetadata("/privacy");

/** The privacy note (§8.12, A.13), with the address as a mail link. */
export default function Privacy() {
  const [before, after] = microcopy.privacy.split(site.email);
  return (
    <Page title={site.seo.pages["/privacy"]!.title}>
      <p className="max-w-text text-body-lg text-fg-muted">
        {before}
        <a
          href={`mailto:${site.email}`}
          className="text-accent underline decoration-1 underline-offset-[0.2em] transition-ui [overflow-wrap:anywhere] hover:text-accent-strong"
        >
          {site.email}
        </a>
        {after}
      </p>
    </Page>
  );
}
