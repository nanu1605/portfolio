import { afterEach, describe, expect, it, vi } from "vitest";
import { installerSize, liveMetrics } from "@/lib/github";

const release = (tag: string, assets: { name: string; size: number }[] = []) =>
  Response.json({
    tag_name: tag,
    html_url: `https://github.com/x/releases/tag/${tag}`,
    assets,
  });

describe("liveMetrics", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reads the installer size like the release page", () => {
    expect(installerSize(12_210_176)).toBe("11.6 MB");
  });

  it("uses the latest releases", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("vyro-releases")
          ? release("v1.7.0", [
              { name: "Vyro_1.7.0_x64_en-US.msi", size: 13_000_000 },
            ])
          : release("v6.1.0"),
      ),
    );
    const m = await liveMetrics();
    expect(m["vyro.version"].value).toBe("1.7.0");
    expect(m["vyro.installer"]).toMatchObject({
      value: "12.4 MB",
      measuredOn: "v1.7.0",
    });
    expect(m["baby.version"].value).toBe("6.1.0");
  });

  it("falls back to content/metrics.ts when GitHub fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("vyro-releases")
          ? new Response("rate limited", { status: 403 })
          : release("not-a-version"),
      ),
    );
    const m = await liveMetrics();
    expect(m["vyro.version"].value).toBe("1.4.1");
    expect(m["vyro.installer"].value).toBe("11.6 MB");
    expect(m["baby.version"].value).toBe("6.0.1");
  });
});
