import { z } from "zod";

// Content schemas (spec §4.2). Every content file parses through these when
// it loads, so invalid content fails the build; scripts/check-content.ts adds
// the cross-file checks.

export const projectSlugs = [
  "baby",
  "vyro",
  "reservoir-rl",
  "probabilistic-forecasting",
  "mlops-drift-loop",
  "jainav-platform",
  "menumesh",
  "virtual-dressing-room",
  "mycounselhub",
] as const;
export const ProjectSlug = z.enum(projectSlugs);
export type ProjectSlug = z.infer<typeof ProjectSlug>;

// Timeline entries the stack can highlight besides projects (A.11).
export const experienceIds = [
  "jainav",
  "mycounselhub",
  "bosch",
  "gsoc",
] as const;
export const ExperienceId = z.enum(experienceIds);

/** `{{LIKE_THIS}}`: a value only Tanishq can provide (spec §0). */
export const PLACEHOLDER = /\{\{([A-Z0-9_]+)\}\}/g;
/** `{vyro.version}`: a metric reference, filled from `content/metrics.ts`. */
export const METRIC_REF = /\{([a-z]+\.[A-Za-z0-9]+)\}/g;

const Text = z.string().trim().min(1);
const Pending = z
  .string()
  .regex(/^\{\{[A-Z0-9_]+\}\}$/, "must be a {{PLACEHOLDER}}");
const SitePath = z.string().regex(/^\/[^\s]*$/, "must start with /");
const HttpsUrl = z.url({ protocol: /^https$/ });

/** An https URL, a site path or a mailto: link. */
export const Href = z.union([
  HttpsUrl,
  SitePath,
  z.string().regex(/^mailto:\S+@\S+$/, "must be mailto:"),
]);
export const HrefOrPending = z.union([Href, Pending]);

export const Flag = z.enum(["jainavLive", "menumeshLive"]);

export const Link = z.object({
  label: Text,
  href: HrefOrPending,
  /** Shown only while this launch flag in `site.ts` is true. */
  requires: Flag.optional(),
});
export type Link = z.infer<typeof Link>;

export const Metric = z.object({
  value: Text,
  label: Text,
  source: Href,
  /** Where the source is a page that must not be linked (the MenuMesh staging site, A.4.4). */
  linkSource: z.boolean().default(true),
  measuredOn: Text.optional(),
  note: Text.optional(),
});
export type Metric = z.infer<typeof Metric>;
export type MetricInput = z.input<typeof Metric>;
export const MetricMap = z.record(
  z.string().regex(/^[a-z]+\.[A-Za-z0-9]+$/, "metric ids look like group.name"),
  Metric,
);

export const Filter = z.enum(["ml", "products", "infra", "client", "archive"]);

export const Project = z
  .object({
    slug: ProjectSlug,
    title: Text,
    /** Cards, the bento grid and the case-study description (A.3). */
    oneLiner: Text,
    /** The case-study hero line, where A.4 words it differently from A.3. */
    heroOneLiner: Text.optional(),
    tldr: z.array(z.object({ label: Text, text: Text })).length(3),
    role: Text,
    period: Text.optional(),
    status: Text.optional(),
    platform: Text.optional(),
    context: Text.optional(),
    badges: z.array(Text),
    filters: z.array(Filter).min(1),
    stack: z.array(Text).min(1),
    links: z.array(Link),
    /** Metric ids this project's numbers come from. */
    metrics: z.array(Text),
    /** Bento and card readout; `{metric.id}` references are filled in. */
    readout: Text,
    featured: z.boolean(),
    order: z.number().int().positive(),
    accent: z.enum(["menumesh", "vyro", "baby"]).optional(),
    aiNative: z.boolean(),
    caseStudy: z.boolean(),
    /** The "How this was built" note (A.4); shown when `aiNative`. */
    howBuilt: Text.optional(),
    cover: z.object({
      kind: z.enum(["demo", "image", "schematic"]),
      /** A screen from `assets/source/screens/manifest.json`. */
      screen: Text.optional(),
    }),
  })
  .refine((p) => !p.howBuilt || p.aiNative, {
    message: "howBuilt is only shown when aiNative is true",
    path: ["howBuilt"],
  });
export type Project = z.infer<typeof Project>;
export type ProjectInput = z.input<typeof Project>;

export const ArchiveItem = z.object({
  title: Text,
  line: Text,
  stack: z.array(Text).min(1),
  year: z.number().int().min(2015).max(2100),
  repo: HttpsUrl,
});

export const Experience = z.object({
  id: ExperienceId,
  role: Text,
  /** Short name for the Home timeline (A.2). */
  org: Text,
  /** As written in A.5, with the place. */
  orgFull: Text,
  period: Text,
  bullets: z.array(Text).min(1),
  link: Href.optional(),
});

export const Skill = z.object({
  name: Text,
  projects: z.array(z.union([ProjectSlug, ExperienceId])),
});
export const SkillGroup = z.object({
  group: Text,
  skills: z.array(Skill).min(1),
});

export const Principle = z.object({
  title: Text,
  body: Text,
  link: Link,
});

export const Certification = z.object({
  title: z.union([Text, Pending]),
  issuer: Text,
  date: Text,
  url: HttpsUrl,
});

export const Screen = z.object({
  file: Text,
  project: Text,
  view: Text,
  capturedOn: z.iso.date(),
  build: Text,
  size: z.tuple([z.number().int().positive(), z.number().int().positive()]),
  alt: Text,
  use: Text,
});
export const Video = Screen.extend({
  poster: Text,
  durationSec: z.number().positive(),
  fps: z.number().positive(),
  audio: z.literal(false),
});
export const ScreenManifest = z.object({
  note: Text,
  screens: z.array(Screen),
  videos: z.array(Video),
});
export type ScreenManifest = z.infer<typeof ScreenManifest>;

export const PlaceholderInfo = z.object({
  /** What the site shows meanwhile. Without one, anything containing the placeholder is hidden. */
  fallback: Text.optional(),
  neededBy: Text,
  note: Text,
});
