"use client";

import { useEffect, useRef } from "react";
import { countFrames, easeOut } from "@/lib/count";
import { cx } from "@/lib/cx";
import { useReducedMotionSafe } from "@/lib/motion-hooks";

const DURATION_MS = 900;

/**
 * Counts a metric value up once as it comes into view (§6.2). The final
 * value is in the HTML and reserves the width. It only counts if it enters
 * view after hydration, so a visible number never drops to zero, and not at
 * all under reduced motion. Frames are written to the DOM, not React state.
 */
export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotionSafe();

  useEffect(() => {
    const el = ref.current;
    const frame = countFrames(value);
    if (!el || !frame || reduced) return;

    let raf = 0;
    let first = true;
    const settle = () => {
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false;
          // Already (partly) visible at hydration: keep the final value.
          if (entry.intersectionRatio > 0) return observer.disconnect();
          el.textContent = frame(0);
          return;
        }
        if (entry.intersectionRatio < 0.5) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          el.textContent = frame(easeOut(t));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(el);
    window.addEventListener("beforeprint", settle);
    return () => {
      observer.disconnect();
      window.removeEventListener("beforeprint", settle);
      settle();
    };
  }, [value, reduced]);

  return (
    <span className={cx("inline-grid tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="invisible [grid-area:1/1]">
        {value}
      </span>
      <span aria-hidden="true" ref={ref} className="[grid-area:1/1]">
        {value}
      </span>
    </span>
  );
}
