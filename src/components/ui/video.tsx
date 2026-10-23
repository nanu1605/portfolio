"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cx } from "@/lib/cx";

// The one video playing on the page (§15.1: never more than one at a time).
let current: HTMLVideoElement | null = null;

function start(v: HTMLVideoElement) {
  // The source is attached on first play, so a video never holds up the
  // page's load event or fetches before it's needed. WebM first, MP4 after.
  if (!v.getAttribute("src"))
    v.src = v.canPlayType('video/webm; codecs="vp9"')
      ? v.dataset.webm!
      : v.dataset.mp4!;
  if (current && current !== v) current.pause();
  current = v;
  // Refused (Low Power Mode): the poster and the play button stay.
  v.play().catch(() => {});
}

/**
 * A muted screen recording (§15.1, cross-device §4): it plays once it's half
 * in view and pauses off-screen and in hidden tabs, one video at a time,
 * with a Pause/Play button. Under reduced motion, or when the browser
 * refuses autoplay (iOS Low Power Mode), the poster stays with the play
 * button. A non-looping video stops on its last frame.
 *
 * The poster is a lazy <Picture> under the video (`children`), not the
 * `poster` attribute: browsers fetch that eagerly and at one size, and it
 * delayed the first paint on phones. The video is transparent until its
 * first frame, so the still shows through.
 */
export function Video({
  webm,
  mp4,
  children,
  width,
  height,
  label,
  loop = true,
  labels,
  className,
}: {
  webm: string;
  mp4: string;
  /** The poster still, in flow: it sizes the box. */
  children: ReactNode;
  width: number;
  height: number;
  /** What the recording shows (manifest alt text). */
  label: string;
  loop?: boolean;
  labels: { pause: string; play: string };
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Pressing Pause sticks: scrolling back doesn't restart it.
  const held = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const resume = () => {
      if (
        inView &&
        !document.hidden &&
        !held.current &&
        !reduced.matches &&
        !v.ended
      )
        start(v);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = !!entry && entry.intersectionRatio >= 0.5;
        if (inView) resume();
        else v.pause();
      },
      { threshold: [0, 0.5] },
    );
    const onVisibility = () => (document.hidden ? v.pause() : resume());
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    io.observe(v);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    document.addEventListener("visibilitychange", onVisibility);
    addEventListener("pageshow", resume);
    return () => {
      io.disconnect();
      v.pause();
      if (current === v) current = null;
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pageshow", resume);
    };
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      held.current = false;
      if (v.ended) v.currentTime = 0;
      start(v);
    } else {
      held.current = true;
      v.pause();
    }
  };

  return (
    <div className={cx("relative", className)}>
      {children}
      <video
        ref={ref}
        muted
        playsInline
        loop={loop}
        preload="none"
        width={width}
        height={height}
        aria-label={label}
        data-video={playing ? "playing" : "paused"}
        data-webm={webm}
        data-mp4={mp4}
        className="absolute inset-0 block size-full"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? labels.pause : labels.play}
        className="absolute right-3 bottom-3 inline-flex size-11 items-center justify-center rounded-full border border-border-strong bg-bg-raised/90 text-fg transition-ui hover:bg-surface-2"
      >
        {playing ? (
          <Pause aria-hidden="true" className="size-4" />
        ) : (
          <Play aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
}
