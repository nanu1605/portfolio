import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { METRIC_REF, PLACEHOLDER, projectSlugs } from "../../content/schema";

// The cross-file content checks behind `pnpm check:content` (spec §19,
// Phase 1). Each content module validates its own shape when it loads; this
// adds references, MDX, media and the {{PLACEHOLDER}} report.

export type PlaceholderHit = {
  key: string;
  file: string;
  line: number;
  allowed: boolean;
};

/** Every `{{KEY}}` in a file, with where it is and whether it's allow-listed. */
export function findPlaceholders(
  text: string,
  file: string,
  allowed: ReadonlySet<string>,
) {
  return text.split(/\r?\n/).flatMap((line, i) =>
    [...line.matchAll(PLACEHOLDER)].map((m): PlaceholderHit => ({
      key: m[1],
      file,
      line: i + 1,
      allowed: allowed.has(m[1]),
    })),
  );
}

/** Unknown placeholders warn in development and fail in production. */
export function placeholderProblems(hits: PlaceholderHit[]) {
  return hits
    .filter((h) => !h.allowed)
    .map(
      (h) =>
        `${h.file}:${h.line}: {{${h.key}}} isn't allow-listed in content/placeholders.ts`,
    );
}

/** Every string inside a value, with its path. */
export function* strings(value: unknown, at = ""): Generator<[string, string]> {
  if (typeof value === "string") yield [at, value];
  else if (Array.isArray(value))
    for (const [i, v] of value.entries()) yield* strings(v, `${at}[${i}]`);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value))
      yield* strings(v, at ? `${at}.${k}` : k);
}

// Scripts and tests run from the repo root.
const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
// The schema and the registry talk about placeholders rather than use them.
const NOT_CONTENT = new Set(["schema.ts", "placeholders.ts"]);

async function contentFiles(dir = CONTENT): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return contentFiles(full);
      return /\.(ts|mdx|json)$/.test(e.name) && !NOT_CONTENT.has(e.name)
        ? [full]
        : [];
    }),
  );
  return files.flat();
}

const describe = (error: unknown) =>
  error instanceof z.ZodError ? z.prettifyError(error) : String(error);

async function compileMdx(source: string) {
  // The compiler @next/mdx's loader uses, so the check matches the build.
  const require = createRequire(import.meta.url);
  const mdx = createRequire(require.resolve("@mdx-js/loader")).resolve(
    "@mdx-js/mdx",
  );
  const { compile } = (await import(pathToFileURL(mdx).href)) as {
    compile: (
      source: string,
      options: { remarkPlugins: unknown[] },
    ) => Promise<unknown>;
  };
  const { default: remarkGfm } = await import("remark-gfm");
  await compile(source, { remarkPlugins: [remarkGfm] });
}

export async function runChecks() {
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);

  // Each module parses its content through Zod as it loads.
  const loaded = await Promise.all(
    [
      ["metrics", () => import("../../content/metrics")],
      ["projects", () => import("../../content/projects")],
      ["site", () => import("../../content/site")],
      ["home", () => import("../../content/home")],
      ["experience", () => import("../../content/experience")],
      ["open-source", () => import("../../content/open-source")],
      ["education", () => import("../../content/education")],
      ["certifications", () => import("../../content/certifications")],
      ["skills", () => import("../../content/skills")],
      ["principles", () => import("../../content/principles")],
      ["company", () => import("../../content/company")],
      ["now", () => import("../../content/now")],
      ["uses", () => import("../../content/uses")],
      ["resume", () => import("../../content/resume")],
      ["about", () => import("../../content/about")],
      ["contact", () => import("../../content/contact")],
      ["microcopy", () => import("../../content/microcopy")],
      ["placeholders", () => import("../../content/placeholders")],
      ["charts", () => import("../../content/charts")],
      ["screens", () => import("../../content/screens")],
    ].map(async ([name, load]) => {
      try {
        return [
          name,
          await (load as () => Promise<Record<string, unknown>>)(),
        ] as const;
      } catch (error) {
        fail(`content/${name}.ts:\n${describe(error)}`);
        return [name, undefined] as const;
      }
    }),
  );
  const modules = Object.fromEntries(loaded);
  if (errors.length > 0)
    return { errors, placeholders: [] as PlaceholderHit[], stats: "" };

  const { metrics } = await import("../../content/metrics");
  const { projects } = await import("../../content/projects");
  const { home } = await import("../../content/home");
  const { pullRequests, openSource } =
    await import("../../content/open-source");
  const { placeholders } = await import("../../content/placeholders");
  const { reservoir, vyroData, mlopsLoop } =
    await import("../../content/charts");
  const { screenManifest, media } = await import("../../content/screens");
  const ids = new Set(Object.keys(metrics));

  // `{metric.id}` references anywhere in the content resolve.
  for (const [name, module] of Object.entries(modules)) {
    if (name === "metrics") continue;
    for (const [at, text] of strings(module)) {
      for (const [, id] of text.matchAll(METRIC_REF)) {
        if (!ids.has(id))
          fail(`content/${name}.ts ${at}: unknown metric {${id}}`);
      }
      if (/staging\.menumesh\.in/.test(text))
        fail(
          `content/${name}.ts ${at}: never link the MenuMesh staging site (A.4.4)`,
        );
    }
  }

  // Projects: one entry per slug, unique order, real metrics and screens.
  const slugs = projects.map((p) => p.slug);
  for (const slug of projectSlugs) {
    const count = slugs.filter((s) => s === slug).length;
    if (count !== 1) fail(`projects.ts: "${slug}" appears ${count} times`);
  }
  const orders = projects.map((p) => p.order);
  if (new Set(orders).size !== orders.length)
    fail("projects.ts: two projects share an order");
  for (const p of projects) {
    for (const id of p.metrics)
      if (!ids.has(id)) fail(`projects.ts ${p.slug}: unknown metric "${id}"`);
    if (p.cover.screen && !media.screens[p.cover.screen])
      fail(
        `projects.ts ${p.slug}: cover screen "${p.cover.screen}" isn't in the manifest's generated media`,
      );
  }
  for (const item of home.proof)
    if (!ids.has(item.metric))
      fail(`home.ts proof: unknown metric "${item.metric}"`);

  // Case-study MDX: one compiling file per case study, nothing extra.
  const mdxDir = path.join(CONTENT, "case-studies");
  const mdxFiles = (await readdir(mdxDir)).filter((f) => f.endsWith(".mdx"));
  const wanted = new Set(
    projects.filter((p) => p.caseStudy).map((p) => `${p.slug}.mdx`),
  );
  for (const file of wanted)
    if (!mdxFiles.includes(file))
      fail(`content/case-studies/${file} is missing`);
  for (const file of mdxFiles) {
    if (!wanted.has(file))
      fail(`content/case-studies/${file} has no case-study project`);
    try {
      await compileMdx(await readFile(path.join(mdxDir, file), "utf8"));
    } catch (error) {
      fail(`content/case-studies/${file}: ${String(error)}`);
    }
  }

  // Open source: 16 PRs, and the PEcAn groups cover each of the 15 once.
  const pecan = pullRequests.prs
    .filter((p) => p.repo === "PecanProject/pecan")
    .map((p) => p.number);
  const grouped = openSource.pecan.groups.flatMap((g) => g.prs);
  if (String(pullRequests.prs.length) !== metrics["oss.merged"].value)
    fail(
      `open-source.json has ${pullRequests.prs.length} PRs; oss.merged says ${metrics["oss.merged"].value}`,
    );
  if (
    grouped.length !== pecan.length ||
    pecan.some((n) => !grouped.includes(n))
  )
    fail(
      "open-source.ts: the PEcAn groups don't list each merged PR exactly once",
    );

  // Chart data and the metrics quoted from it agree.
  const agree = (id: keyof typeof metrics, value: string) => {
    if (metrics[id].value !== value)
      fail(
        `metrics ${id} is "${metrics[id].value}" but the chart data gives "${value}"`,
      );
  };
  const seed42 = reservoir.balanced_headline_seed42.nominal;
  agree("rl.flood", `${reservoir.rule_baseline.flood[0]} → ${seed42.flood[0]}`);
  agree(
    "rl.supply",
    `${reservoir.rule_baseline.supply[0]} → ${seed42.supply[0]}`,
  );
  agree("rl.agents", String(reservoir.pareto_agents.length));
  agree("vyro.releases", String(vyroData.release_tags_total));
  const levels = mlopsLoop.documented_levels;
  agree(
    "mlops.f1",
    `${levels.stale_champion_f1} → ${levels.after_promotion_f1}`,
  );

  // Media: every screen, poster and video has generated files on disk.
  const files = [
    ...screenManifest.screens.map((s) => s.file),
    ...screenManifest.videos.map((v) => v.poster),
  ];
  for (const file of files) {
    if (!existsSync(path.join(ROOT, "assets/source/screens", file)))
      fail(`manifest.json: ${file} doesn't exist`);
    if (!media.screens[file])
      fail(`media.json: no variants for ${file}; run pnpm images`);
  }
  for (const v of screenManifest.videos)
    if (!media.videos[v.file])
      fail(`media.json: no sources for ${v.file}; run pnpm images`);
  for (const [, value] of strings(media)) {
    if (
      value.startsWith("/media/") &&
      !existsSync(path.join(ROOT, "public", value))
    )
      fail(
        `media.json points at public${value}, which doesn't exist; run pnpm images`,
      );
  }

  // The placeholder report.
  const allowed = new Set(Object.keys(placeholders));
  const hits: PlaceholderHit[] = [];
  for (const file of await contentFiles()) {
    hits.push(
      ...findPlaceholders(
        await readFile(file, "utf8"),
        path.relative(ROOT, file).split(path.sep).join("/"),
        allowed,
      ),
    );
  }

  const stats = `${projects.length} projects, ${ids.size} metrics, ${mdxFiles.length} case studies, ${files.length} screens, ${screenManifest.videos.length} videos`;
  return { errors, placeholders: hits, stats };
}
