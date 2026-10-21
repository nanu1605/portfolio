"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion-hooks";
import { cx } from "@/lib/cx";

/**
 * A 1 px accent line that draws down (scaleY) as it passes the middle of
 * the viewport: the About timeline (§6.3, cross-device §4). A CSS view
 * timeline drives it where supported (globals.css); elsewhere (stable
 * Firefox) this sets the same transform on scroll. Reduced motion and
 * print show it drawn.
 */
export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const line = ref.current;
    if (!line || reduced || CSS.supports("animation-timeline: view()")) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // The list it spans: the line's own box is scaled by this transform.
      const r = line.parentElement!.getBoundingClientRect();
      const p = r.height > 0 ? (innerHeight / 2 - r.top) / r.height : 1;
      line.style.transform = `scaleY(${Math.min(1, Math.max(0, p))})`;
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
      line.style.transform = "";
    };
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-draw-line=""
      className={cx("bg-accent", className)}
    />
  );
}
