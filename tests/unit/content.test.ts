import { describe, expect, it } from "vitest";
import { metrics } from "@content/metrics";
import { projects } from "@content/projects";
import { Href, Metric, Project } from "@content/schema";
import { resolve } from "@/lib/fill";
import {
  findPlaceholders,
  placeholderProblems,
  runChecks,
} from "../../scripts/lib/content-checks";

describe("metrics", () => {
  it("every metric has a valid source link", () => {
    for (const [id, metric] of Object.entries(metrics)) {
      expect(Href.safeParse(metric.source).success, id).toBe(true);
    }
  });

  it("a metric without a source fails validation", () => {
    expect(Metric.safeParse({ value: "16", label: "merged PRs" }).success).toBe(
      false,
    );
    expect(
      Metric.safeParse({ value: "16", label: "merged PRs", source: "" })
        .success,
    ).toBe(false);
    expect(
      Metric.safeParse({
        value: "16",
        label: "merged PRs",
        source: "http://x.dev",
      }).success,
    ).toBe(false);
  });
});

describe("projects", () => {
  it("only shows a How this was built note on AI-native projects", () => {
    const vdr = projects.find((p) => p.slug === "virtual-dressing-room")!;
    expect(
      Project.safeParse({ ...vdr, howBuilt: "Claude Code wrote it." }).success,
    ).toBe(false);
  });
});

describe("resolve", () => {
  it("fills metric references", () => {
    expect(resolve("v{vyro.version} · {vyro.installer} installer")).toBe(
      "v1.4.1 · 11.6 MB installer",
    );
  });

  it("uses live values when given", () => {
    const live = {
      ...metrics,
      "vyro.version": { ...metrics["vyro.version"], value: "1.7.0" },
    };
    expect(resolve("Shipping VYRO {vyro.version}", live)).toBe(
      "Shipping VYRO 1.7.0",
    );
  });

  it("uses a placeholder's fallback, and hides text without one", () => {
    expect(resolve("{{FOUNDED}} – present")).toBe("2026 – present");
    expect(resolve("{{VDR_IMAGES}}")).toBeNull();
  });

  it("leaves runtime fields alone and throws on unknown metrics", () => {
    expect(resolve("I'll reply to {email}.")).toBe("I'll reply to {email}.");
    expect(() => resolve("{vyro.nope}")).toThrow(/Unknown metric/);
  });
});

describe("placeholder report", () => {
  const allowed = new Set(["FOUNDED"]);

  it("finds placeholders with their line", () => {
    const hits = findPlaceholders(
      'a\nperiod: "{{FOUNDED}} – present"',
      "x.ts",
      allowed,
    );
    expect(hits).toEqual([
      { key: "FOUNDED", file: "x.ts", line: 2, allowed: true },
    ]);
  });

  it("flags placeholders that aren't allow-listed", () => {
    const hits = findPlaceholders("{{FOUNDED}} {{FOUNDD}}", "x.ts", allowed);
    expect(placeholderProblems(hits)).toEqual([
      "x.ts:1: {{FOUNDD}} isn't allow-listed in content/placeholders.ts",
    ]);
  });
});

describe("check:content", () => {
  it("passes on the committed content", { timeout: 60_000 }, async () => {
    const { errors, placeholders } = await runChecks();
    expect(errors).toEqual([]);
    expect(placeholderProblems(placeholders)).toEqual([]);
  });
});
