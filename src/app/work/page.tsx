import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { microcopy } from "@content/microcopy";
import { archive, projects, workFilters, workIntro } from "@content/projects";
import { screen } from "@content/screens";
import { site } from "@content/site";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BentoTile } from "@/components/ui/card";
import { Picture } from "@/components/ui/figure";
import { LinkedReadout } from "@/components/ui/readout";
import { StatusBadge } from "@/components/ui/status";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { covers } from "@/components/work/figures";
import { WorkIndex } from "@/components/work/work-index";
import { liveMetrics } from "@/lib/github";
import { workFilterScript } from "@/lib/work-filter-script";

const page = site.seo.pages["/work"]!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: "/work" },
};

const sorted = projects
  .filter((p) => p.caseStudy)
  .sort((a, b) => a.order - b.order);

// Cards per filter, for the screen-reader status line.
const counts = Object.fromEntries(
  workFilters.map(({ id }) => [
    id,
    id === "all"
      ? sorted.length + archive.length
      : id === "archive"
        ? archive.length
        : sorted.filter((p) => p.filters.includes(id)).length,
  ]),
);

const STACK_SHOWN = 4;
const archiveYears = [...archive].sort((a, b) => b.year - a.year);

// Each card is its own View Transition group while the filter changes, so
// it glides (globals.css names [data-vt-name] only then).
const transition = (name: string) => ({
  "data-vt-name": "",
  style: { "--vt-name": name } as CSSProperties,
});

/** All work (§8.3): the case studies, then the archive as a compact list. */
export default async function Work() {
  const live = await liveMetrics();
  return (
    <div className="px-page py-section pt-12 md:pt-16">
      <Breadcrumbs path="/work" />
      <div className="mx-auto flex max-w-site flex-col gap-10">
        <header className="flex flex-col gap-4">
          <h1 className="text-h1">{page.title}</h1>
          <p className="max-w-text text-body-lg text-fg-muted">{workIntro}</p>
        </header>

        <WorkIndex
          filters={workFilters.map(({ id, label }) => ({ id, label }))}
          counts={counts}
          labels={{
            filter: microcopy.work.filter,
            shown: microcopy.work.shown,
          }}
        >
          <script
            dangerouslySetInnerHTML={{
              __html: workFilterScript(workFilters.map((f) => f.id)),
            }}
          />
          <ul
            data-work-grid=""
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sorted.map((p, i) => {
              const cover = p.cover.screen && screen(p.cover.screen);
              const more = p.stack.length - STACK_SHOWN;
              return (
                <li
                  key={p.slug}
                  data-filters={p.filters.join(" ")}
                  {...transition(`work-${p.slug}`)}
                >
                  {/* No scroll reveal: the first row is above the fold, and
                      the filter's glide is this page's motion (§6.3). */}
                  <BentoTile
                    href={`/work/${p.slug}`}
                    title={p.title}
                    oneLiner={p.oneLiner}
                    accent={p.accent}
                    tilt={false}
                    heading="h2"
                    className="h-full"
                    badges={
                      p.badges.length > 0 && (
                        <p className="flex flex-wrap gap-2 pb-1">
                          {p.badges.map((badge) => (
                            <StatusBadge key={badge} label={badge} />
                          ))}
                        </p>
                      )
                    }
                    media={
                      cover ? (
                        // Morphs into the case-study hero (morph.tsx).
                        <div
                          data-morph={p.heroMedia ? "" : undefined}
                          style={
                            { "--morph": `cover-${p.slug}` } as CSSProperties
                          }
                        >
                          <Picture
                            image={cover.image}
                            alt=""
                            // The first cover is the LCP on phones.
                            priority={i === 0}
                            sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                            className="aspect-[16/10] object-cover object-top-left"
                          />
                        </div>
                      ) : (
                        covers[p.slug]
                      )
                    }
                    readout={
                      <LinkedReadout template={p.readout} values={live} />
                    }
                  >
                    {p.period && (
                      <p className="font-mono text-mono-label text-fg-subtle">
                        {p.period}
                      </p>
                    )}
                    <ul className="flex flex-wrap gap-1.5 pt-1">
                      {p.stack.slice(0, STACK_SHOWN).map((item) => (
                        <li key={item}>
                          <Tag>{item}</Tag>
                        </li>
                      ))}
                      {more > 0 && (
                        <li>
                          <Tag>+{more}</Tag>
                        </li>
                      )}
                    </ul>
                  </BentoTile>
                </li>
              );
            })}
          </ul>

          <section
            data-archive=""
            aria-labelledby="archive-title"
            {...transition("work-archive")}
            className="flex flex-col gap-4"
          >
            <h2 id="archive-title" className="text-h3">
              {microcopy.work.archive}
            </h2>
            {/* Phones: stacked; desktop: a five-column list (cross-device §5). */}
            <ul className="flex flex-col border-t border-border">
              {archiveYears.map((item) => (
                <li
                  key={item.repo}
                  className="grid gap-x-6 gap-y-1 border-b border-border py-4 lg:grid-cols-[12rem_1fr_9rem_4rem_6rem] lg:items-baseline"
                >
                  <h3 className="font-semibold text-fg">{item.title}</h3>
                  <p className="text-small text-fg-muted">{item.line}</p>
                  <p className="font-mono text-mono-label text-fg-subtle">
                    {item.stack.join(", ")}
                  </p>
                  <p className="font-mono text-mono-label text-fg-subtle">
                    {item.year}
                  </p>
                  <p>
                    <TextLink href={item.repo} className="text-small">
                      Source<span className="sr-only">: {item.title}</span>
                    </TextLink>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </WorkIndex>
      </div>
    </div>
  );
}
