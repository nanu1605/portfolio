import manifestJson from "../assets/source/screens/manifest.json";
import mediaJson from "./generated/media.json";
import { z } from "zod";
import { ScreenManifest } from "./schema";

// The delivered screens and videos (§15.1) and their generated web variants
// (scripts/images.ts). A file that isn't in both can't be referenced.

export const screenManifest = ScreenManifest.parse(manifestJson);

const Variant = z.strictObject({
  width: z.number().int(),
  height: z.number().int(),
  avif: z.string().startsWith("/media/"),
  webp: z.string().startsWith("/media/"),
});
const Image = z.strictObject({
  width: z.number().int(),
  height: z.number().int(),
  blur: z.string().startsWith("data:image/webp;base64,"),
  variants: z.array(Variant).min(1),
});
export type Image = z.infer<typeof Image>;

export const media = z
  .strictObject({
    photo: z.strictObject({
      hero: Image,
      about: Image,
      share: z.strictObject({
        width: z.number(),
        height: z.number(),
        jpg: z.string(),
      }),
    }),
    screens: z.record(z.string(), Image),
    videos: z.record(
      z.string(),
      z.strictObject({ mp4: z.string(), webm: z.string(), poster: z.string() }),
    ),
    icons: z.strictObject({
      vyro: z.strictObject({ svg: z.string() }),
      baby: Image,
    }),
  })
  .parse(mediaJson);

/** A screen's manifest entry (alt text, build, date) with its web variants. */
export function screen(file: string) {
  const meta = screenManifest.screens.find((s) => s.file === file);
  const image = media.screens[file];
  if (!meta || !image)
    throw new Error(
      `Unknown screen "${file}". Add it to the manifest and run pnpm images.`,
    );
  return { ...meta, image };
}

/** A video's manifest entry with its MP4, WebM and poster variants. */
export function video(file: string) {
  const meta = screenManifest.videos.find((v) => v.file === file);
  const sources = media.videos[file];
  const poster = meta && media.screens[meta.poster];
  if (!meta || !sources || !poster)
    throw new Error(
      `Unknown video "${file}". Add it to the manifest and run pnpm images.`,
    );
  return { ...meta, sources, poster };
}
