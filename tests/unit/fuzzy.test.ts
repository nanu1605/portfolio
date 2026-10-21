import { describe, expect, it } from "vitest";
import { rank, score } from "../../src/lib/fuzzy";

const items = [
  { label: "Resume", keywords: ["PDF"] },
  { label: "Reservoir RL", keywords: ["Python", "PPO"] },
  { label: "VYRO", keywords: ["Rust", "Tauri 2"] },
  { label: "Probabilistic forecasting", keywords: ["PyTorch"] },
  { label: "Open GitHub", keywords: [] },
];
const labels = (q: string) => rank(items, q).map((i) => i.label);

describe("palette search (§6.4)", () => {
  it("needs every character, in order", () => {
    expect(score("VYRO", "vyr")).toBeGreaterThan(0);
    expect(score("VYRO", "ryv")).toBe(0);
    expect(labels("xyz")).toEqual([]);
  });

  it("prefers runs and word starts over scattered letters", () => {
    expect(score("Reservoir RL", "rl")).toBeGreaterThan(
      score("Probabilistic forecasting", "rl"),
    );
    expect(labels("res")[0]).toBe("Resume");
    expect(labels("res")).toContain("Reservoir RL");
  });

  it("matches keywords, a little below labels", () => {
    expect(labels("rust")).toEqual(["VYRO"]);
    expect(labels("pdf")[0]).toBe("Resume");
  });

  it("ignores spaces and case, and keeps the order for an empty query", () => {
    expect(labels("open git")[0]).toBe("Open GitHub");
    expect(labels("  ")).toEqual(items.map((i) => i.label));
  });
});
