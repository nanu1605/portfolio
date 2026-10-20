import { describe, expect, it } from "vitest";
import { metrics } from "@content/metrics";
import { countFrames } from "@/lib/count";
import { SIGNAL_VIEWBOX, signalPath } from "@/lib/signal";
import { splitWords } from "@/lib/words";

const words = (text: string, lang?: string) =>
  splitWords(text, lang)
    .filter((t) => !t.space)
    .map((t) => t.text);

describe("splitWords", () => {
  it("keeps Devanagari words whole", () => {
    expect(words("मौसम कैसा है", "hi")).toEqual(["मौसम", "कैसा", "है"]);
    expect(words("EN / हिंदी")).toEqual(["EN", "/", "हिंदी"]);
  });

  it("keeps punctuation with its word", () => {
    expect(words("From model to machine.")).toEqual([
      "From",
      "model",
      "to",
      "machine.",
    ]);
    expect(words("“Hey Jarvis” wakes up Baby")).toEqual([
      "“Hey",
      "Jarvis”",
      "wakes",
      "up",
      "Baby",
    ]);
    expect(words("an MSc in AI/ML")).toEqual(["an", "MSc", "in", "AI/ML"]);
  });

  it("joins back to the original text", () => {
    const text = "I build things that survive contact with reality.";
    expect(
      splitWords(text)
        .map((t) => t.text)
        .join(""),
    ).toBe(text);
  });
});

describe("countFrames", () => {
  it("keeps the value's format on every frame", () => {
    expect(countFrames("16")!(0)).toBe("0");
    expect(countFrames("1,037")!(0.5)).toBe("519");
    expect(countFrames("1.5 years")!(0)).toBe("0.0 years");
    expect(countFrames("0.46%")!(0.5)).toBe("0.23%");
    expect(countFrames("−60%")!(0)).toBe("−0%");
  });

  it("counts only the right side of an arrow", () => {
    const frame = countFrames("0.27 → 0.78")!;
    expect(frame(0)).toBe("0.27 → 0.27");
    expect(frame(1)).toBe("0.27 → 0.78");
  });

  it("leaves values with several numbers alone", () => {
    expect(countFrames("p50 1.2 s · p95 4.0 s")).toBeNull();
    expect(countFrames("614 + 132")).toBeNull();
  });

  it("ends on every metric's exact value", () => {
    for (const metric of Object.values(metrics)) {
      const frame = countFrames(metric.value);
      if (frame) expect(frame(1)).toBe(metric.value);
    }
  });
});

describe("signalPath", () => {
  it("is deterministic and stays inside the view box", () => {
    const path = signalPath();
    expect(signalPath()).toBe(path);
    const points = path
      .slice(1)
      .split("L")
      .map((p) => p.split(" ").map(Number));
    expect(points).toHaveLength(241);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(SIGNAL_VIEWBOX.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(SIGNAL_VIEWBOX.height);
    }
  });
});
