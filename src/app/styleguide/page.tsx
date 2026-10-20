import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { experience } from "@content/experience";
import { home } from "@content/home";
import { metrics, type MetricId } from "@content/metrics";
import { microcopy } from "@content/microcopy";
import { projects } from "@content/projects";
import { screen } from "@content/screens";
import { site } from "@content/site";
import { CountUp } from "@/components/motion/count-up";
import {
  Magnetic,
  Reveal,
  SignalLine,
  TextReveal,
} from "@/components/motion/motion";
import { Button } from "@/components/ui/button";
import { BentoTile, Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Figure, Picture } from "@/components/ui/figure";
import { Callout, Disclosure } from "@/components/ui/notes";
import { MetricTable, Readout } from "@/components/ui/readout";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge, StatusPill } from "@/components/ui/status";
import { Tabs } from "@/components/ui/tabs";
import { Chip, Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Timeline } from "@/components/ui/timeline";
import { Tooltip } from "@/components/ui/tooltip";
import { resolve } from "@/lib/fill";

// Every Phase 2 component and motion primitive in one place, with real
// content. Built everywhere so CI can test it; production returns 404
// (docs/cross-device.md §9.15).

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const badges = [
  "Live",
  "Beta",
  "Free",
  "Open source",
  "In launch prep",
  "Archived",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 border-t border-border pt-10">
      <h2 className="font-mono text-mono-label uppercase text-fg-subtle">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  if (process.env.VERCEL_ENV === "production") notFound();

  const baby = projects.find((p) => p.slug === "baby")!;
  const vyro = projects.find((p) => p.slug === "vyro")!;
  const dashboard = screen("vyro/vyro-dashboard.png");

  return (
    <main
      id="main"
      className="mx-auto flex max-w-site flex-col gap-16 px-page py-section"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h1">Styleguide</h1>
        <ThemeToggle />
      </div>

      <Section title="Type">
        <div className="bg-grid flex flex-col gap-4 rounded-lg border border-border p-6">
          <p className="text-display">{home.hero.headline}</p>
          <p className="text-h1">{home.hero.headline}</p>
          <p className="text-h2">{home.sections.company.title}</p>
          <p className="text-h3">{baby.title}</p>
          <p className="max-w-text text-body-lg">{home.hero.subline}</p>
          <p className="max-w-text">{home.sections.company.body}</p>
          <p className="text-small text-fg-muted">{baby.oneLiner}</p>
          <p className="font-mono text-mono-label uppercase text-fg-subtle">
            {home.hero.eyebrow}
          </p>
          <p className="font-mono text-readout tabular-nums">
            {metrics["vyro.cpu"].value}
          </p>
        </div>
      </Section>

      <Section title="Motion">
        <TextReveal
          as="p"
          text={home.hero.headline}
          trigger="load"
          className="text-h1"
        />
        <TextReveal as="p" text={vyro.oneLiner} className="text-h3" />
        <div data-testid="signal-hero">
          <SignalLine animate />
        </div>
        <SignalLine className="opacity-60" />
        <div className="grid gap-4 sm:grid-cols-3">
          {(["oss.merged", "baby.tests", "mlops.f1"] as MetricId[]).map(
            (id) => (
              <Reveal key={id} className="rounded-lg border border-border p-5">
                <p className="font-mono text-readout">
                  <CountUp value={metrics[id].value} />
                </p>
                <p className="text-small text-fg-muted">{metrics[id].label}</p>
              </Reveal>
            ),
          )}
        </div>
      </Section>

      <Section title="Buttons and links">
        <div className="flex flex-wrap items-center gap-3">
          {home.hero.ctas.map((cta, i) => (
            <Button
              key={cta.href}
              href={cta.href}
              variant={i === 0 ? "primary" : i === 1 ? "secondary" : "ghost"}
              magnetic={i === 0}
            >
              {cta.label}
            </Button>
          ))}
        </div>
        <p className="flex flex-wrap gap-6">
          <TextLink href={home.sections.work.link.href}>
            {home.sections.work.link.label}
          </TextLink>
          <TextLink href={home.sections.openSource.link.href}>
            {home.sections.openSource.link.label}
          </TextLink>
          <Magnetic>
            <TextLink href={site.links.github}>GitHub</TextLink>
          </Magnetic>
        </p>
        <CopyButton
          text={site.email}
          label={microcopy.palette.actions.copyEmail}
          done={microcopy.copied}
        />
      </Section>

      <Section title="Tags, chips and status">
        <div className="flex flex-wrap gap-2">
          {vyro.stack.map((item) => (
            <Tag key={item}>{item}</Tag>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* §8.3's filter chips */}
          <Chip pressed>All</Chip>
          <Chip pressed={false}>ML</Chip>
          <Chip pressed={false}>Products</Chip>
          <Chip pressed={false}>Infrastructure</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((label) => (
            <StatusBadge key={label} label={label} />
          ))}
        </div>
        <StatusPill text={resolve(home.hero.statusPill) ?? ""} />
      </Section>

      <Section title="Readouts and tables">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {home.proof.slice(0, 3).map((item) => (
            <Readout
              key={item.metric}
              id={item.metric as MetricId}
              label={item.label}
              count
            />
          ))}
          <Readout id="mm.priceFrom" />
        </div>
        <MetricTable
          caption={`${vyro.title} — measured footprint`}
          ids={["vyro.cpu", "vyro.ram", "vyro.startup", "vyro.installer"]}
        />
        <DataTable
          caption={`${baby.title} — numbers`}
          columns={[
            { key: "what", label: "Metric" },
            { key: "value", label: "Value", numeric: true },
            { key: "setup", label: "Measured on" },
          ]}
          rows={(["baby.tests", "baby.firstToken", "baby.vram"] as const).map(
            (id) => ({
              what: metrics[id].label,
              value: metrics[id].value,
              setup: metrics[id].measuredOn ?? "—",
            }),
          )}
        />
      </Section>

      <Section title="Cards and sections">
        <SectionHeader
          index={home.sections.work.index}
          label={home.sections.work.label}
          intro={home.sections.work.intro}
        />
        <SectionHeader
          index={home.sections.company.index}
          label={home.sections.company.label}
          title={home.sections.company.title}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BentoTile
            href={`/work/${baby.slug}`}
            title={baby.title}
            oneLiner={baby.oneLiner}
            readout={resolve(baby.readout)}
            accent="baby"
            className="sm:col-span-2"
          />
          <BentoTile
            href={`/work/${vyro.slug}`}
            title={vyro.title}
            oneLiner={vyro.oneLiner}
            readout={resolve(vyro.readout)}
            accent="vyro"
            className="sm:col-span-2"
            media={
              <Picture
                image={dashboard.image}
                alt={dashboard.alt}
                sizes="(min-width: 1024px) 640px, (min-width: 640px) 50vw, 100vw"
              />
            }
          />
          {projects.slice(2, 6).map((p) => (
            <Card key={p.slug} href={`/work/${p.slug}`}>
              <h3 className="text-h3">{p.title}</h3>
              <p className="mt-2 text-small text-fg-muted">{p.oneLiner}</p>
            </Card>
          ))}
        </div>
        <Timeline
          items={experience.map((e) => ({
            period: resolve(e.period) ?? "",
            title: e.role,
            meta: e.orgFull,
          }))}
        />
        <Figure
          caption={dashboard.alt}
          source={{ href: vyro.links[0].href, label: vyro.links[0].label }}
        >
          <Picture
            image={dashboard.image}
            alt=""
            sizes="(min-width: 1280px) 1216px, 100vw"
          />
        </Figure>
      </Section>

      <Section title="Overlays">
        <Tabs
          label={vyro.title}
          tabs={vyro.tldr.map((item) => ({
            id: item.label.toLowerCase().replaceAll(" ", "-"),
            label: item.label,
            content: <p className="max-w-text text-fg-muted">{item.text}</p>,
          }))}
        />
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-mono text-readout">
            {metrics["vyro.cpu"].value}
          </span>
          <Tooltip
            trigger={<Info aria-hidden="true" className="size-5" />}
            label={metrics["vyro.cpu"].label}
          >
            {metrics["vyro.cpu"].measuredOn}
          </Tooltip>
          <Dialog
            trigger={baby.tldr[0].label}
            title={baby.title}
            closeLabel="Close"
          >
            {baby.tldr[0].text}
          </Dialog>
        </div>
      </Section>

      <Section title="Notes">
        <Disclosure summary="How this was built">
          <p className="max-w-text">{baby.howBuilt}</p>
        </Disclosure>
        <Callout label={microcopy.simulated.vyro}>
          <p className="max-w-text">{vyro.tldr[1].text}</p>
        </Callout>
      </Section>
    </main>
  );
}
