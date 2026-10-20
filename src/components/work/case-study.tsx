import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { microcopy } from "@content/microcopy";
import type { Project } from "@content/schema";
import { site } from "@content/site";
import { TextReveal } from "@/components/motion/motion";
import { Button } from "@/components/ui/button";
import { Glow } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/notes";
import { StatusBadge } from "@/components/ui/status";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { resolve } from "@/lib/fill";
import type { liveMetrics } from "@/lib/github";

// The case-study template (§8.4): hero, TL;DR, the centerpiece slot, the
// MDX body, "How this was built", then previous and next.

type Live = Awaited<ReturnType<typeof liveMetrics>>;
const copy = microcopy.caseStudy;

/** The links that can show now: launch flags on, no pending placeholder. */
export const shownLinks = (p: Project) =>
  p.links.flatMap((link) => {
    const href = resolve(link.href);
    return href && (!link.requires || site.flags[link.requires])
      ? [{ ...link, href }]
      : [];
  });

export function CaseStudyHero({
  project: p,
  live,
  media,
}: {
  project: Project;
  live: Live;
  media?: ReactNode;
}) {
  const meta = [
    [copy.meta.role, p.role],
    [copy.meta.context, p.context],
    [copy.meta.period, p.period],
    [copy.meta.status, p.status && resolve(p.status, live)],
    [copy.meta.platform, p.platform],
  ].filter((row): row is [string, string] => !!row[1]);
  const links = shownLinks(p);
  return (
    <header className="px-page pt-10 pb-12 md:pt-16">
      <div className="mx-auto flex max-w-site flex-col gap-8">
        <div className="flex flex-col items-start gap-5">
          {p.badges.length > 0 && (
            <p className="flex flex-wrap gap-2">
              {p.badges.map((badge) => (
                <StatusBadge key={badge} label={badge} />
              ))}
            </p>
          )}
          <TextReveal
            as="h1"
            id="case-study-title"
            trigger="load"
            text={p.title}
            className="text-h1"
          />
          <p className="max-w-text text-body-lg text-fg-muted">
            {p.heroOneLiner ?? p.oneLiner}
          </p>
        </div>

        {/* Phones: 2 × 2; tablets and up: one row (cross-device §5). */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 md:grid-cols-4">
          {meta.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="font-mono text-mono-label uppercase text-fg-subtle">
                {label}
              </dt>
              <dd className="text-small text-fg">{value}</dd>
            </div>
          ))}
        </dl>

        <ul className="flex flex-wrap gap-2">
          {p.stack.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>

        {links.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            {links.map((link, i) => (
              <Button
                key={link.href}
                href={link.href}
                variant={i === 0 ? "primary" : "secondary"}
              >
                {link.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {media && (
        // Phones: full bleed; wider: framed, in the product's accent glow.
        <div className="relative isolate mx-auto mt-12 max-w-site">
          {p.accent && <Glow accent={p.accent} />}
          {media}
        </div>
      )}
    </header>
  );
}

/** Problem · What I built · Result (§8.4); stacked, rows, then columns. */
export function Tldr({ project: p }: { project: Project }) {
  return (
    <section
      id="tldr"
      aria-labelledby="tldr-title"
      className="flex flex-col gap-6"
    >
      <h2
        id="tldr-title"
        className="font-mono text-mono-label uppercase text-fg-subtle"
      >
        {copy.tldr}
      </h2>
      <ul className="grid gap-4 lg:grid-cols-3">
        {p.tldr.map((item) => (
          // No scroll reveal: on pages without hero media the TL;DR is in
          // the first viewport and can be the LCP element.
          <li
            key={item.label}
            className="grid gap-2 rounded-lg border border-border bg-surface p-5 md:grid-cols-[10rem_1fr] md:gap-6 lg:flex lg:flex-col lg:gap-3"
          >
            <h3 className="text-small font-semibold text-fg">{item.label}</h3>
            <p className="text-small text-fg-muted">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The "How this was built" note (§1.5), when `aiNative`. */
export function HowBuilt({ text }: { text: string }) {
  return (
    <section id="how-this-was-built" aria-label={copy.howBuilt}>
      <Disclosure summary={copy.howBuilt}>
        <p className="max-w-text">{text}</p>
      </Disclosure>
    </section>
  );
}

type Neighbour = { slug: string; title: string };

/** Previous and next project, then back to Work. Phones: stacked. */
export function CaseStudyNav({
  previous,
  next,
}: {
  previous: Neighbour;
  next: Neighbour;
}) {
  const item =
    "group flex min-h-14 flex-col justify-center gap-1 rounded-lg border border-border bg-surface px-5 py-4 transition-ui hover:border-border-strong active:bg-surface-2";
  return (
    <nav
      aria-label={`${copy.previous} / ${copy.next}`}
      className="flex flex-col gap-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/work/${previous.slug}`} rel="prev" className={item}>
          <span className="flex items-center gap-2 font-mono text-mono-label uppercase text-fg-subtle">
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {copy.previous}
          </span>
          <span className="text-h3 text-fg">{previous.title}</span>
        </Link>
        <Link
          href={`/work/${next.slug}`}
          rel="next"
          className={`${item} md:items-end md:text-right`}
        >
          <span className="flex items-center gap-2 font-mono text-mono-label uppercase text-fg-subtle">
            {copy.next}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </span>
          <span className="text-h3 text-fg">{next.title}</span>
        </Link>
      </div>
      <TextLink href="/work" className="self-start">
        {copy.back}
      </TextLink>
    </nav>
  );
}
