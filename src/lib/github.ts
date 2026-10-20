import "server-only";
import { z } from "zod";
import { metrics, type MetricId } from "@content/metrics";
import type { Metric } from "@content/schema";

// Latest VYRO and Baby releases at build time (spec §4.3). Each value falls
// back to content/metrics.ts on its own if a request or parse fails.

const Release = z.object({
  tag_name: z.string().regex(/^v?\d+\.\d+\.\d+$/),
  html_url: z.url(),
  assets: z.array(
    z.object({ name: z.string(), size: z.number().int().positive() }),
  ),
});

async function latest(repo: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
    {
      headers,
      next: { revalidate: 86400 },
    },
  );
  if (!res.ok) throw new Error(`${repo}: HTTP ${res.status}`);
  return Release.parse(await res.json());
}

/** Binary megabytes, one decimal: the v1.4.1 MSI's 12,210,176 bytes read 11.6 MB, as in C.1. */
export const installerSize = (bytes: number) =>
  `${(bytes / 1024 ** 2).toFixed(1)} MB`;

/** All metrics, with the live release values merged in where the fetch worked. */
export async function liveMetrics(): Promise<Record<MetricId, Metric>> {
  const [vyro, baby] = await Promise.allSettled([
    latest("nanu1605/vyro-releases"),
    latest("nanu1605/baby"),
  ]);
  const out = { ...metrics };

  if (vyro.status === "fulfilled") {
    const version = vyro.value.tag_name.replace(/^v/, "");
    out["vyro.version"] = {
      ...out["vyro.version"],
      value: version,
      source: vyro.value.html_url,
    };
    const msi = vyro.value.assets.find((a) => a.name.endsWith(".msi"));
    if (msi) {
      out["vyro.installer"] = {
        ...out["vyro.installer"],
        value: installerSize(msi.size),
        measuredOn: `v${version}`,
        source: vyro.value.html_url,
      };
    }
  } else {
    console.warn(
      `VYRO release lookup failed, using ${metrics["vyro.version"].value}:`,
      vyro.reason,
    );
  }

  if (baby.status === "fulfilled") {
    const version = baby.value.tag_name.replace(/^v/, "");
    out["baby.version"] = {
      ...out["baby.version"],
      value: version,
      source: baby.value.html_url,
    };
  } else {
    console.warn(
      `Baby release lookup failed, using ${metrics["baby.version"].value}:`,
      baby.reason,
    );
  }

  return out;
}
