import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import ffmpegPath from "ffmpeg-static";

// ffmpeg for the media scripts (scripts/images.ts, scripts/capture).

function binary(): string {
  // pnpm blocks ffmpeg-static's download script on install (pnpm-workspace.yaml),
  // so CI and Vercel skip the binary; fetch it here, where it's used.
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

/** Runs ffmpeg quietly, overwriting outputs; throws if it fails. */
export function encode(args: string[]) {
  const run = spawnSync(
    binary(),
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (run.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}
