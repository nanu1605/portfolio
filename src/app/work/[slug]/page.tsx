import type { MDXContent } from "mdx/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { microcopy } from "@content/microcopy";
import { projects } from "@content/projects";
import type { ProjectSlug } from "@content/schema";
import {
  CaseStudyHero,
  CaseStudyNav,
  HowBuilt,
  Tldr,
} from "@/components/work/case-study";
import { centerpieces } from "@/components/centerpieces";
import { Screen, ScreenVideo } from "@/components/work/media";
import { ReadingProgress } from "@/components/work/reading-progress";
import { Toc } from "@/components/work/toc";
import { liveMetrics } from "@/lib/github";

// One case study (§8.4), statically generated for each slug in §7.

const studies = projects
  .filter((p) => p.caseStudy)
  .sort((a, b) => a.order - b.order);

type Body = {
  default: MDXContent;
  headings: { id: string; text: string }[];
};

// Static imports, so each body is bundled with its page.
const bodies: Record<ProjectSlug, () => Promise<Body>> = {
  baby: () => import("@content/case-studies/baby.mdx"),
  vyro: () => import("@content/case-studies/vyro.mdx"),
  "reservoir-rl": () => import("@content/case-studies/reservoir-rl.mdx"),
  "probabilistic-forecasting": () =>
    import("@content/case-studies/probabilistic-forecasting.mdx"),
  "mlops-drift-loop": () =>
    import("@content/case-studies/mlops-drift-loop.mdx"),
  "jainav-platform": () => import("@content/case-studies/jainav-platform.mdx"),
  menumesh: () => import("@content/case-studies/menumesh.mdx"),
  "virtual-dressing-room": () =>
    import("@content/case-studies/virtual-dressing-room.mdx"),
  mycounselhub: () => import("@content/case-studies/mycounselhub.mdx"),
};

export const dynamicParams = false;

export function generateStaticParams() {
  return studies.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => studies.find((p) => p.slug === slug);

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const p = find((await params).slug);
  if (!p) return {};
  // A.1: `{title}` and `{oneLiner}`.
  return {
    title: p.title,
    description: p.oneLiner,
    alternates: { canonical: `/work/${p.slug}` },
  };
}

export default async function CaseStudy({ params }: PageProps<"/work/[slug]">) {
  const p = find((await params).slug);
  if (!p) notFound();
  const [live, { default: Body, headings }] = await Promise.all([
    liveMetrics(),
    bodies[p.slug](),
  ]);

  const i = studies.indexOf(p);
  const previous = studies.at(i - 1)!;
  const next = studies[(i + 1) % studies.length]!;
  const copy = microcopy.caseStudy;
  const howBuilt = p.aiNative ? p.howBuilt : undefined;
  const toc = [
    { id: "tldr", text: copy.tldr },
    ...headings,
    ...(howBuilt ? [{ id: "how-this-was-built", text: copy.howBuilt }] : []),
  ];
  const media = p.heroMedia?.endsWith(".mp4") ? (
    <ScreenVideo file={p.heroMedia} />
  ) : p.heroMedia ? (
    <Screen file={p.heroMedia} priority />
  ) : undefined;
  const centerpiece = centerpieces[p.slug];

  return (
    <article aria-labelledby="case-study-title">
      <ReadingProgress />
      <CaseStudyHero project={p} live={live} media={media} />
      <div className="px-page pb-section">
        <div className="mx-auto max-w-site lg:grid lg:grid-cols-12 lg:gap-8">
          {/* No TOC below 1024 px: the progress bar shows position. */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-[calc(var(--header-h)+2rem)]">
              <Toc items={toc} label={copy.toc} />
            </div>
          </aside>
          <div className="flex min-w-0 flex-col gap-16 lg:col-span-9">
            <Tldr project={p} />
            {centerpiece}
            <div>
              <Body />
            </div>
            {howBuilt && <HowBuilt text={howBuilt} />}
            <CaseStudyNav previous={previous} next={next} />
          </div>
        </div>
      </div>
    </article>
  );
}
