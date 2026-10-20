"use client";

import { useEffect, useRef } from "react";

/**
 * The 2 px reading-progress bar (§6.2, cross-device §4), at every width and
 * pinned to the top edge, so it stays when the header hides. A CSS scroll
 * timeline drives it where supported (globals.css); elsewhere (stable
 * Firefox) this sets the same transform on scroll. Transform only, and it
 * keeps tracking under reduced motion, like a scrollbar.
 */
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar || CSS.supports("animation-timeline: scroll()")) return;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = root.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" data-progress="" />;
}
