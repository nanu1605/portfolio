import { microcopy } from "@content/microcopy";
import { screen, video } from "@content/screens";
import { Figure, Picture } from "@/components/ui/figure";
import { Video } from "@/components/ui/video";

// Product screens and recordings from assets/source/screens (§15.1), in a
// plain window frame: rounded, a hairline border, never fake device chrome.

/** "20 Oct 2026", or a range ("20 – 21 Oct 2026") when `to` is later. */
export const captured = (iso: string, to = iso) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).formatRange(new Date(iso), new Date(to));

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
  return (
    <Figure caption={caption(v)} bleed>
      <Video
        webm={v.sources.webm}
        mp4={v.sources.mp4}
        width={v.size[0]}
        height={v.size[1]}
        label={v.alt}
        loop={loop}
        labels={{ pause: microcopy.icons.pause, play: microcopy.icons.play }}
      >
        {/* The video's label describes it; the still is decoration. */}
        <Picture image={v.poster} alt="" sizes={SIZES} />
      </Video>
    </Figure>
  );
}
