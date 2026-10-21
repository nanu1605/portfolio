import type { ReactNode } from "react";
import { openSource, pullRequests } from "@content/open-source";
import { DotTimeline } from "@/components/open-source/dot-timeline";
import { Page, pageMetadata } from "@/components/site/page";
import { Figure } from "@/components/ui/figure";
import { Inline } from "@/components/ui/inline";
import { TextLink } from "@/components/ui/text-link";
import { ViewData } from "@/components/ui/view-data";

export const metadata = pageMetadata("/open-source");

const { pecan, litmus, labels } = openSource;
const prUrl = (repo: string, n: number) =>
  `https://github.com/${repo}/pull/${n}`;

/** Copy with its `code` spans, and each merged PR's number linked to it. */
function Rich({ text, repo }: { text: string; repo: string }) {
  const merged = new Set(
    pullRequests.prs.filter((p) => p.repo === repo).map((p) => p.number),
  );
  return text.split(/(#\d+)/).map((part, i): ReactNode => {
    const n = Number(part.slice(1));
    return part.startsWith("#") && merged.has(n) ? (
      <a
        key={i}
        href={prUrl(repo, n)}
        className="text-accent underline decoration-1 underline-offset-[0.2em] transition-ui hover:text-accent-strong"
      >
        {part}
      </a>
    ) : (
      <Inline key={i} text={part} />
    );
  });
}

// "18 Jul 2022". en-GB would write September "Sept".
const month = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const day = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${month.format(d)} ${d.getUTCFullYear()}`;
};
const byMerge = [...pullRequests.prs].sort((a, b) =>
  a.merged.localeCompare(b.merged),
);

/** Open source (§8.7, A.6): PEcAn by theme, LitmusChaos, the dot timeline. */
export default function OpenSource() {
  const pecanRepo = "PecanProject/pecan";
  const litmusRepo = "litmuschaos/litmus";
  return (
    <Page title={openSource.title} intro={openSource.intro}>
      <section
        aria-labelledby="pecan"
        className="flex max-w-text flex-col gap-5"
      >
        <h2 id="pecan" className="text-h2">
          {pecan.title}
        </h2>
        {pecan.about.map((p) => (
          <p key={p} className="text-fg-muted">
            <Inline text={p} />
          </p>
        ))}
        <p className="font-mono text-mono-label text-fg-subtle">
          {pecan.stats}
        </p>
        <h3 className="pt-4 text-h3">{labels.prs}</h3>
        <ul className="flex flex-col gap-5">
          {pecan.groups.map((group) => (
            <li key={group.title} className="flex flex-col gap-2">
              <p className="font-semibold text-fg">{group.title}</p>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-fg-muted marker:text-fg-subtle">
                {group.items.map((item) => (
                  <li key={item}>
                    <Rich text={item} repo={pecanRepo} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
          {pecan.links.map((link) => (
            <li key={link.href}>
              <TextLink href={link.href}>{link.label}</TextLink>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="litmus"
        className="flex max-w-text flex-col gap-5"
      >
        <h2 id="litmus" className="text-h2">
          {litmus.title}
        </h2>
        <p className="text-fg-muted">
          <Rich text={litmus.body} repo={litmusRepo} />
        </p>
      </section>

      <section aria-labelledby="timeline" className="flex flex-col gap-6">
        <h2 id="timeline" className="text-h2">
          {labels.timeline}
        </h2>
        <Figure caption={labels.caption}>
          <div className="px-5 pt-8 pb-6 sm:px-8">
            <DotTimeline />
          </div>
        </Figure>
        <ViewData
          caption={`${labels.timeline} · ${pullRequests.source}`}
          columns={[
            { key: "pr", label: labels.columns.pr },
            { key: "project", label: labels.columns.project },
            { key: "title", label: labels.columns.title },
            { key: "opened", label: labels.columns.opened, numeric: true },
            { key: "merged", label: labels.columns.merged, numeric: true },
          ]}
          rows={byMerge.map((pr) => ({
            pr: (
              <a
                href={prUrl(pr.repo, pr.number)}
                className="font-mono text-accent underline decoration-1 underline-offset-[0.2em] hover:text-accent-strong"
              >
                #{pr.number}
              </a>
            ),
            project:
              pr.repo === pecanRepo
                ? labels.legend.pecan
                : labels.legend.litmus,
            title: pr.title,
            opened: day(pr.opened),
            merged: day(pr.merged),
          }))}
        />
      </section>
    </Page>
  );
}
