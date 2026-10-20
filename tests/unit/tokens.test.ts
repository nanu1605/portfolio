import { describe, expect, it } from "vitest";
import { colors, contrastChecks } from "@/styles/tokens";
import { findColorLiterals } from "../../scripts/lib/color-literals";
import { contrastFailures } from "../../scripts/lib/tokens-css";

describe("contrast", () => {
  it("passes for the spec tokens", () => {
    expect(contrastFailures(colors, contrastChecks)).toEqual([]);
  });

  it("fails a low-contrast pair", () => {
    const palette = {
      fg: { dark: "#777777", light: "#777777" },
      bg: { dark: "#888888", light: "#888888" },
    };
    const failures = contrastFailures(palette, [
      { fg: "fg", bg: "bg", min: 4.5, themes: ["dark"] },
    ]);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/^dark: fg on bg is 1\.\d\d:1/);
  });
});

describe("colour literals", () => {
  it.each([
    ['<div style={{ color: "#fff" }} />', "hex colour"],
    ['<div className="bg-[#123456]" />', "hex colour"],
    ["box-shadow: 0 0 4px rgb(0 0 0 / 20%);", "colour function"],
    ['<p className="text-zinc-400" />', "Tailwind palette class"],
    ['<p className="hover:bg-black/50" />', "Tailwind palette class"],
  ])("flags %s", (source, rule) => {
    expect(findColorLiterals(source).map((f) => f.rule)).toEqual([rule]);
  });

  it.each([
    '<a href="#work">See my work</a>',
    "PR #4186, merged October 2023",
    '<p className="bg-accent-soft text-fg-muted border-border-strong" />',
    "&#039;",
  ])("allows %s", (source) => {
    expect(findColorLiterals(source)).toEqual([]);
  });
});
