import { readFile, writeFile } from "node:fs/promises";
import type { Locator, Page } from "@playwright/test";
import sharp from "sharp";
import { ScreenManifest } from "../../content/schema";

// Shared by the capture scripts (spec §15.2): page settings, a logged
// screenshot that never stops the run, and the manifest update.

export const MANIFEST = "assets/source/screens/manifest.json";
export const today = new Date().toISOString().slice(0, 10);

export const desktop = {
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark" as const,
};
export const phone = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  colorScheme: "dark" as const,
};

export type Shot = { file: string; view: string; alt: string; use: string };

/**
 * Waits for the network and the fonts, hides scrollbars, and keeps the
 * site's sticky header at the top of the page, so it can't land inside a
 * tall element shot.
 */
export async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({
    content:
      "html{scrollbar-width:none}::-webkit-scrollbar{display:none}*,*::before,*::after{caret-color:transparent!important}body>header,body>div>header{position:relative!important}",
  });
}

/** A step that logs its failure and lets the run continue. */
export async function step(name: string, run: () => Promise<void>) {
  try {
    await run();
    console.log(`✓ ${name}`);
    return true;
  } catch (error) {
    console.warn(`✗ ${name}: ${(error as Error).message.split("\n")[0]}`);
    return false;
  }
}

/** An element screenshot into assets/source/screens/<file>. */
export async function shoot(target: Locator, shot: Shot, shots: Shot[]) {
  await target.scrollIntoViewIfNeeded();
  await target.screenshot({
    path: `assets/source/screens/${shot.file}`,
    animations: "disabled",
  });
  shots.push(shot);
}

/**
 * Replaces one project's entries in the manifest with what this run
 * captured, reading each PNG's size. A partial run replaces only the files
 * it captured and keeps the project's other entries.
 */
export async function updateManifest(
  project: string,
  build: string,
  shots: Shot[],
  videos: (Shot & { poster: string; durationSec: number; fps: number })[] = [],
  partial = false,
) {
  // Validated, but kept as read, so untouched entries keep their key order.
  const manifest: ScreenManifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  ScreenManifest.parse(manifest);
  const size = async (file: string): Promise<[number, number]> => {
    const meta = await sharp(`assets/source/screens/${file}`).metadata();
    return [meta.width!, meta.height!];
  };
  const entry = async (s: Shot, file = s.file) => ({
    ...s,
    project,
    capturedOn: today,
    build,
    size: await size(file),
  });
  const fresh = new Set([...shots, ...videos].map((s) => s.file));
  const keep = (s: { project: string; file: string }) =>
    s.project !== project || (partial && !fresh.has(s.file));
  manifest.screens = [
    ...manifest.screens.filter(keep),
    ...(await Promise.all(shots.map((s) => entry(s)))),
  ];
  manifest.videos = [
    ...manifest.videos.filter(keep),
    ...(await Promise.all(
      videos.map(async (v) => ({
        ...(await entry(v, v.poster)),
        poster: v.poster,
        durationSec: v.durationSec,
        fps: v.fps,
        audio: false as const,
      })),
    )),
  ];
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}
