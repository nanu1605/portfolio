import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metrics } from "@content/metrics";
import { projects } from "@content/projects";

// "Every number traces to Appendix C" (Phase 4): metric values match the
// C.1 table, and every number in a case study's copy appears in that case
// study's final copy in A.4, which was written from C. So nothing typed
// into the content can drift from the spec unnoticed.

const spec = readFileSync("PORTFOLIO_SPEC.md", "utf8");

/** Numbers as written: 1,037 · 0.46 · 6.0.1 · 192 (from 192×256). */
const numbers = (text: string) => new Set(text.match(/\d+(?:[.,]\d+)*/g) ?? []);

/** One A.4 section: from its heading to the next case study or A.5. */
function a4(title: string) {
  const start = spec.search(new RegExp(`^### A\\.4\\.\\d+ ${title}$`, "m"));
  expect(start, `A.4 section for ${title}`).toBeGreaterThan(-1);
  const rest = spec.slice(start + 1);
  return rest.slice(0, rest.search(/^(### A\.4\.\d|## A\.5)/m));
}

describe("every number traces to the spec", () => {
  it("metric values match Appendix C.1", () => {
    const rows = new Map(
      [...spec.matchAll(/^\| `([a-z]+\.[A-Za-z0-9]+)` \| ([^|]+) \|/gm)].map(
        (m) => [m[1]!, m[2]!.trim()],
      ),
    );
    for (const [id, metric] of Object.entries(metrics))
      expect(metric.value, id).toBe(rows.get(id));
  });

  // Centerpiece copy (content/centerpieces/*.ts): every number written in
  // its strings appears in the spec's §10 subsection, the A.4 case study or
  // the project's Appendix B data. Numeric literals (crop boxes) aren't copy.
  const subsection: Record<string, string> = {
    baby: "10.1 Baby",
    vyro: "10.2 VYRO",
    "jainav-platform": "10.3 Jainav platform",
    menumesh: "10.4 MenuMesh",
    "reservoir-rl": "10.5 Reservoir RL",
    "probabilistic-forecasting": "10.6 Probabilistic forecasting",
    "mlops-drift-loop": "10.7 MLOps loop",
  };
  // Projects whose Appendix B data has more than one file.
  const moreData: Record<string, string[]> = {
    "mlops-drift-loop": ["content/data/mlops-timeline.json"],
  };
  for (const [slug, heading] of Object.entries(subsection)) {
    it(`${slug}: the centerpiece copy uses only the spec's numbers`, () => {
      const start = spec.indexOf(`### ${heading}`);
      expect(start, heading).toBeGreaterThan(-1);
      const rest = spec.slice(start + 4);
      const p = projects.find((p) => p.slug === slug)!;
      const data = [`content/data/${slug}.json`, ...(moreData[slug] ?? [])];
      const allowed = numbers(
        [
          rest.slice(0, rest.search(/^#{2,3} /m)),
          a4(p.title),
          ...data.map((f) => (existsSync(f) ? readFileSync(f, "utf8") : "")),
        ].join("\n"),
      );
      const source = readFileSync(`content/centerpieces/${slug}.ts`, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split("\n")
        .filter((line) => !line.trim().startsWith("//"))
        .join("\n");
      const strings = source.match(/"(?:[^"\\]|\\.)*"|`[^`]*`/g) ?? [];
      const found = [...numbers(strings.join("\n"))];
      expect(found.filter((n) => !allowed.has(n))).toEqual([]);
    });
  }

  for (const p of projects.filter((p) => p.caseStudy)) {
    it(`${p.slug}: the body and TL;DR use only A.4's numbers`, () => {
      const allowed = numbers(a4(p.title));
      const body = readFileSync(`content/case-studies/${p.slug}.mdx`, "utf8")
        // Figure tags name files, not facts.
        .replace(/^<[A-Z][^>]*\/>\r?$/gm, "");
      const copy = [body, ...p.tldr.map((t) => t.text)].join("\n");
      const found = [...numbers(copy)];
      expect(found.length).toBeGreaterThan(0);
      expect(found.filter((n) => !allowed.has(n))).toEqual([]);
    });
  }
});
