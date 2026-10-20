import { microcopy } from "@content/microcopy";
import { screen, video } from "@content/screens";
import { Figure, Picture } from "@/components/ui/figure";
import { Video } from "@/components/ui/video";

// Product screens and recordings from assets/source/screens (§15.1), in a
// plain window frame: rounded, a hairline border, never fake device chrome.

export const captured = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));

const caption = (s: { view: string; build: string; capturedOn: string }) =>
  `${s.view} · ${s.build} · ${captured(s.capturedOn)}`;

// Phones: full-bleed; tablets: the container; desktop: nine of twelve
// columns of the site container (cross-device §5).
const SIZES =
  "(min-width: 1280px) 900px, (min-width: 1024px) 70vw, (min-width: 768px) calc(100vw - 4rem), 100vw";

/** A screenshot with its view, build and capture date. */
export function Screen({
  file,
  priority = false,
  sizes = SIZES,
}: {
  file: string;
  priority?: boolean;
  sizes?: string;
}) {
  const s = screen(file);
  return (
    <Figure caption={caption(s)} bleed>
      <Picture image={s.image} alt={s.alt} sizes={sizes} priority={priority} />
    </Figure>
  );
}

/** A muted recording with its poster, view, build and capture date. */
export function ScreenVideo({
  file,
  loop = true,
}: {
  file: string;
  loop?: boolean;
}) {
  const v = video(file);
  // A poster near the frame's width on most screens; the video replaces it.
  const poster =
    v.poster.variants.find((p) => p.width >= 1280) ?? v.poster.variants.at(-1)!;
  return (
    <Figure caption={caption(v)} bleed>
      <Video
        webm={v.sources.webm}
        mp4={v.sources.mp4}
        poster={poster.webp}
        width={v.size[0]}
        height={v.size[1]}
        label={v.alt}
        loop={loop}
        labels={{ pause: microcopy.icons.pause, play: microcopy.icons.play }}
      />
    </Figure>
  );
}
