import type { ReactNode } from "react";
import { certifications } from "@content/certifications";
import { company } from "@content/company";
import { education } from "@content/education";
import { experience } from "@content/experience";
import { home } from "@content/home";
import { metrics, type MetricId } from "@content/metrics";
import { microcopy } from "@content/microcopy";
import { openSource } from "@content/open-source";
import { principles } from "@content/principles";
import { projects } from "@content/projects";
import { screen } from "@content/screens";
import { site } from "@content/site";
import { skills } from "@content/skills";
import { CountUp } from "@/components/motion/count-up";
import { Reveal, SignalLine } from "@/components/motion/motion";
import { Button } from "@/components/ui/button";
import { BentoTile, Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Picture } from "@/components/ui/figure";
import { LinkedReadout, Source } from "@/components/ui/readout";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status";
import { TextLink } from "@/components/ui/text-link";
import { Timeline } from "@/components/ui/timeline";
import { cx } from "@/lib/cx";
import { resolve } from "@/lib/fill";
import type { liveMetrics } from "@/lib/github";
import { hasDemo, MicroDemo } from "./micro-demos";
import { Stack } from "./stack";

type Live = Awaited<ReturnType<typeof liveMetrics>>;
const { sections } = home;

/** A Home section: the §5.5 label, then its content in the site container. */
function Section({
  id,
  index,
  label,
  title,
  intro,
  wide = false,
  className,
  children,
}: {
  id: string;
  index: string;
  label: string;
  title?: string;
  intro?: string;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cx("defer-render px-page py-section", className)}
    >
      <div
        className={cx(
          "mx-auto flex flex-col gap-12",
          wide ? "max-w-wide" : "max-w-site",
        )}
      >
        <SectionHeader
          id={`${id}-title`}
          index={index}
          label={label}
          title={title}
          intro={intro}
        />
        {children}
      </div>
    </section>
  );
}

/**
 * Five readouts (A.2), each with its source. Phones: stacked rows, value
 * left; tablets: 3 + 2; one row from xl (cross-device §5). The gap shows
 * the border colour, so hairlines follow whichever grid is in use.
 */
export function ProofStrip() {
  return (
    <div className="px-page">
      <ul className="mx-auto grid max-w-wide gap-px overflow-clip border-y border-border bg-border md:grid-cols-6 xl:grid-cols-5">
        {home.proof.map(({ metric, label }, i) => {
          const id = metric as MetricId;
          return (
            <li
              key={id}
              className={cx(
                "grid grid-cols-[minmax(0,auto)_1fr] items-baseline gap-x-5 gap-y-1 bg-bg py-5 md:flex md:flex-col md:gap-2 md:p-6 xl:col-span-1",
                i < 3 ? "md:col-span-2" : "md:col-span-3",
              )}
            >
              <p className="row-span-2 font-mono text-h3 font-medium tabular-nums text-fg md:text-readout">
                <CountUp value={metrics[id].value} />
              </p>
              <p className="text-small text-fg-muted">{label}</p>
              <p className="font-mono text-mono-label text-fg-subtle">
                <Source id={id} />
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const featured = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order)
  .slice(0, 6);

/**
 * 01 — Selected work: Baby and VYRO large, four compact tiles (§8.2), each
 * with its micro-demo (§10.10).
 */
export function SelectedWork({ live }: { live: Live }) {
  const s = sections.work;
  return (
    <Section id="work" wide {...s}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p, i) => {
          const large = i < 2;
          const cover = large && p.cover.screen && screen(p.cover.screen);
          const poster = cover && (
            <Picture
              image={cover.image}
              alt=""
              sizes="(min-width: 1440px) 680px, (min-width: 1024px) calc(50vw - 3rem), (min-width: 640px) calc(100vw - 4rem), 100vw"
              className="aspect-[4/3] object-cover object-top-left sm:aspect-video lg:aspect-[16/10]"
            />
          );
          const demo = hasDemo(p.slug);
          return (
            <li
              key={p.slug}
              className={
                large
                  ? "sm:col-span-2 lg:row-span-2"
                  : "lg:col-span-2 xl:col-span-1"
              }
            >
              <Reveal className="h-full">
                <BentoTile
                  href={`/work/${p.slug}`}
                  title={p.title}
                  oneLiner={p.oneLiner}
                  readout={
                    p.readout && (
                      <LinkedReadout template={p.readout} values={live} />
                    )
                  }
                  accent={p.accent}
                  demo={demo}
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
                    demo ? <MicroDemo slug={p.slug} poster={poster} /> : poster
                  }
                />
              </Reveal>
            </li>
          );
        })}
      </ul>
      <TextLink href={s.link.href} className="self-start">
        {s.link.label}
      </TextLink>
    </Section>
  );
}

/** 02 — Company: a full-width band with the three products (§8.2, A.7). */
export function CompanyBand() {
  const s = sections.company;
  const ctas = s.ctas.filter(
    (cta) => !cta.requires || site.flags[cta.requires],
  );
  return (
    <Section
      id="company"
      {...s}
      intro={s.body}
      className="border-y border-border bg-bg-raised"
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {company.products.map((product) => {
          const study = product.links.find((l) => l.href.startsWith("/work/"));
          return (
            <li key={product.name}>
              <Reveal className="h-full">
                <Card
                  href={study?.href}
                  accent={product.accent}
                  className="flex h-full flex-col gap-3"
                >
                  <p className="flex flex-wrap gap-2">
                    {product.badges.map((badge) => (
                      <StatusBadge key={badge} label={badge} />
                    ))}
                  </p>
                  <h3 className="text-h3">{product.name}</h3>
                  <p className="text-small text-fg-muted">{product.tagline}</p>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
      <p className="max-w-text text-fg-muted">{s.services}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {ctas.map((cta, i) => (
          <Button
            key={cta.href}
            href={cta.href}
            variant={i === 0 ? "secondary" : "ghost"}
          >
            {cta.label}
          </Button>
        ))}
      </div>
    </Section>
  );
}

/** 03 — Experience: five entries, the degree last (A.2). */
export function ExperienceSection() {
  const s = sections.experience;
  const items = [
    ...experience.map((e) => ({
      id: e.id,
      period: resolve(e.period) ?? e.period,
      title: e.role,
      meta: e.org,
    })),
    {
      period: education.years,
      title: education.degree,
      meta: education.school,
    },
  ];
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="defer-render px-page py-section"
    >
      <div className="mx-auto grid max-w-site gap-12 lg:grid-cols-12">
        <SectionHeader id="experience-title" {...s} className="lg:col-span-4" />
        <Timeline items={items} className="lg:col-span-8" />
      </div>
    </section>
  );
}

/** 04 — Open source: PEcAn and LitmusChaos (A.2, A.6). */
export function OpenSourceSection() {
  const s = sections.openSource;
  return (
    <Section id="open-source" {...s}>
      <ul className="grid gap-4 md:grid-cols-2">
        {openSource.homeCards.map((card) => (
          <li key={card.title}>
            <Reveal className="h-full">
              <Card className="flex h-full flex-col gap-3">
                <h3 className="text-h3">{card.title}</h3>
                <p className="text-fg-muted">{card.body}</p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
      <TextLink href={s.link.href} className="self-start">
        {s.link.label}
      </TextLink>
    </Section>
  );
}

/** 05 — How I work: 3 + 2 on desktop, never five columns (cross-device §5). */
export function Principles() {
  return (
    <Section id="how-i-work" {...sections.principles}>
      <ol className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-6">
        {principles.map((p, i) => (
          <li
            key={p.title}
            className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}
          >
            <Reveal className="flex flex-col gap-3">
              <p
                aria-hidden="true"
                className="font-mono text-mono-label text-accent"
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-h3">{p.title}</h3>
              <p className="text-fg-muted">{p.body}</p>
              <p>
                <TextLink href={p.link.href}>{p.link.label}</TextLink>
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/** 06 — Stack: skills in groups, linked to the projects that used them. */
export function StackSection() {
  return (
    <Section id="stack" {...sections.stack}>
      <Stack
        groups={skills}
        projects={projects.map(({ slug, title }) => ({ slug, title }))}
        entries={experience.map(({ id, org }) => ({ id, org }))}
      />
    </Section>
  );
}

/**
 * 07 — Education: the degree, then the certifications. Phones: a list;
 * tablets: two columns; desktop: one row (cross-device §5).
 */
export function EducationSection() {
  const shown = certifications.flatMap((c) => {
    const title = resolve(c.title);
    return title ? [{ ...c, title }] : [];
  });
  return (
    <Section id="education" {...sections.education}>
      <Card className="flex flex-col gap-2">
        <h3 className="text-h3">{education.degree}</h3>
        <p className="text-fg-muted">{education.schoolFull}</p>
        {/* The CGPA is on About and the resume only (§21). */}
        <p className="font-mono text-mono-label text-fg-subtle">
          {education.period}
        </p>
      </Card>
      <ul className="grid gap-x-6 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] lg:gap-4">
        {shown.map((c) => (
          <li key={c.url} className="border-b border-border lg:border-b-0">
            <a
              href={c.url}
              className="flex min-h-11 flex-col justify-center gap-1 py-3 transition-ui hover:text-accent lg:h-full lg:rounded-md lg:border lg:border-border lg:p-4"
            >
              <span className="text-small font-semibold">{c.title}</span>
              <span className="font-mono text-mono-label text-fg-subtle">
                {c.issuer} · {c.date}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** 08 — Contact: the closing CTA. Phones: a 2 × 2 grid of buttons. */
export function ContactSection() {
  const s = sections.contact;
  return (
    <>
      <SignalLine className="mx-auto max-w-site px-page" />
      <Section id="contact" {...s} intro={s.body}>
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap">
          {s.buttons.map((button) =>
            button.href ? (
              <Button key={button.label} href={button.href}>
                {button.label}
              </Button>
            ) : (
              <CopyButton
                key={button.label}
                text={site.email}
                label={button.label}
                done={microcopy.copied}
                variant="primary"
                magnetic
              />
            ),
          )}
        </div>
      </Section>
    </>
  );
}
