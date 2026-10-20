// Generates web variants of the photo, screens, videos and product icons
// (spec §15) into public/media, and their index into
// content/generated/media.json. Outputs are committed, so builds need neither
// sharp nor ffmpeg. Unchanged outputs are skipped; pass --force to redo all.
//
//   pnpm images [--force]

import { spawnSync } from "node:child_process";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import { ScreenManifest } from "../content/schema";
import manifestJson from "../assets/source/screens/manifest.json";

const SRC = "assets/source";
const OUT = "public/media";
const INDEX = "content/generated/media.json";
const force = process.argv.includes("--force");

// 640 and 960 serve phone figures and bento posters (docs/cross-device.md).
const SCREEN_WIDTHS = [640, 960, 1280, 1920, 2560];
const HERO_WIDTHS = [640, 960, 1280, 1600];
const ABOUT_WIDTHS = [800, 1200];
const ICON_WIDTHS = [128, 256];
const AVIF = { quality: 60, effort: 4 };
const WEBP = { quality: 80 };

type Region = { left: number; top: number; width: number; height: number };
type Variant = { width: number; height: number; avif: string; webp: string };
type Image = {
  width: number;
  height: number;
  blur: string;
  variants: Variant[];
};

const url = (file: string) =>
  "/" + path.relative("public", file).split(path.sep).join("/");

async function stale(source: string, output: string) {
  if (force || !existsSync(output)) return true;
  return (await stat(output)).mtimeMs < (await stat(source)).mtimeMs;
}

/** AVIF + WebP at each width that doesn't upscale, plus a tiny blur placeholder. */
async function variants(
  source: string,
  outBase: string,
  widths: number[],
  crop?: (m: { width: number; height: number }) => Region,
): Promise<Image> {
  const meta = await sharp(source).metadata();
  const region = crop?.({ width: meta.width, height: meta.height });
  const base = () => (region ? sharp(source).extract(region) : sharp(source));
  const width = region?.width ?? meta.width;
  const height = region?.height ?? meta.height;
  await mkdir(path.dirname(outBase), { recursive: true });

  const result: Variant[] = [];
  for (const w of widths.filter((w) => w <= width)) {
    const h = Math.round((height * w) / width);
    const avif = `${outBase}-${w}.avif`;
    const webp = `${outBase}-${w}.webp`;
    if (await stale(source, avif))
      await base().resize(w).avif(AVIF).toFile(avif);
    if (await stale(source, webp))
      await base().resize(w).webp(WEBP).toFile(webp);
    result.push({ width: w, height: h, avif: url(avif), webp: url(webp) });
  }
  const tiny = await base().resize(16).webp({ quality: 50 }).toBuffer();
  return {
    width,
    height,
    blur: `data:image/webp;base64,${tiny.toString("base64")}`,
    variants: result,
  };
}

function ffmpeg(): string {
  // pnpm blocks ffmpeg-static's download script on install (pnpm-workspace.yaml),
  // so CI and Vercel skip the binary; fetch it here, the one place it's used.
  if (!ffmpegPath)
    throw new Error("ffmpeg-static has no binary for this platform");
  if (!existsSync(ffmpegPath)) {
    const installer = createRequire(import.meta.url).resolve(
      "ffmpeg-static/install.js",
    );
    const run = spawnSync(process.execPath, [installer], { stdio: "inherit" });
    if (run.status !== 0 || !existsSync(ffmpegPath))
      throw new Error("ffmpeg-static download failed");
  }
  return ffmpegPath;
}

function encode(args: string[]) {
  const run = spawnSync(
    ffmpeg(),
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    {
      stdio: "inherit",
    },
  );
  if (run.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

async function main() {
  const manifest = ScreenManifest.parse(manifestJson);
  const photo = `${SRC}/tanishq-jain.jpg`;

  console.log("photo");
  const hero = await variants(photo, `${OUT}/photo/hero`, HERO_WIDTHS);
  // 4:5, trimming the sides evenly; the portrait is centred.
  const about = await variants(
    photo,
    `${OUT}/photo/about`,
    ABOUT_WIDTHS,
    ({ width, height }) => {
      const w = Math.min(width, Math.round((height * 4) / 5));
      const h = Math.round((w * 5) / 4);
      return { left: Math.round((width - w) / 2), top: 0, width: w, height: h };
    },
  );
  // Square from the top, keeping the head and shoulders.
  const share = `${OUT}/photo/share-600.jpg`;
  if (await stale(photo, share)) {
    const { width = 0 } = await sharp(photo).metadata();
    await sharp(photo)
      .extract({ left: 0, top: 0, width, height: width })
      .resize(600)
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(share);
  }

  const screens: Record<string, Image> = {};
  const posters = manifest.videos.map((v) => v.poster);
  for (const file of [...manifest.screens.map((s) => s.file), ...posters]) {
    console.log(file);
    screens[file] = await variants(
      `${SRC}/screens/${file}`,
      `${OUT}/screens/${file.replace(/\.png$/, "")}`,
      SCREEN_WIDTHS,
    );
  }

  const videos: Record<string, { mp4: string; webm: string; poster: string }> =
    {};
  for (const video of manifest.videos) {
    console.log(video.file);
    const source = `${SRC}/screens/${video.file}`;
    const mp4 = `${OUT}/screens/${video.file}`;
    const webm = mp4.replace(/\.mp4$/, ".webm");
    await mkdir(path.dirname(mp4), { recursive: true });
    // Muted copy with the index up front so playback starts before the download ends.
    if (await stale(source, mp4))
      encode([
        "-i",
        source,
        "-an",
        "-c:v",
        "copy",
        "-movflags",
        "+faststart",
        mp4,
      ]);
    // CRF 42 keeps SSIM above 0.99 against the MP4 while coming out smaller
    // than it for all three clips (checked 20 Oct 2026).
    if (await stale(source, webm)) {
      encode([
        "-i",
        source,
        "-an",
        "-c:v",
        "libvpx-vp9",
        "-crf",
        "42",
        "-b:v",
        "0",
        "-row-mt",
        "1",
        "-deadline",
        "good",
        "-cpu-used",
        "2",
        webm,
      ]);
    }
    videos[video.file] = {
      mp4: url(mp4),
      webm: url(webm),
      poster: video.poster,
    };
  }

  console.log("icons");
  await mkdir(`${OUT}/icons`, { recursive: true });
  await copyFile(`${SRC}/icons/vyro.svg`, `${OUT}/icons/vyro.svg`);
  const icons = {
    vyro: { svg: url(`${OUT}/icons/vyro.svg`) },
    baby: await variants(
      `${SRC}/icons/baby.png`,
      `${OUT}/icons/baby`,
      ICON_WIDTHS,
    ),
  };

  // Film grain (§5.5): a static noise tile, rasterised here so the page runs
  // no feTurbulence filter (cross-device §7). Grey noise at ~3% opacity reads
  // on both themes. Seeded, so re-runs write the same file.
  const grain = `${OUT}/grain.png`;
  if (force || !existsSync(grain)) {
    console.log("grain");
    const size = 64;
    const pixels = Buffer.alloc(size * size * 4);
    let seed = 1;
    for (let i = 0; i < pixels.length; i += 4) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      pixels.fill((seed >>> 16) & 255, i, i + 3);
      pixels[i + 3] = 8;
    }
    await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(grain);
  }

  const index = {
    photo: { hero, about, share: { width: 600, height: 600, jpg: url(share) } },
    screens,
    videos,
    icons,
  };
  await mkdir(path.dirname(INDEX), { recursive: true });
  await writeFile(INDEX, JSON.stringify(index, null, 2) + "\n");
  console.log(`wrote ${INDEX}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
