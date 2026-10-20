"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useReducedMotionSafe } from "@/lib/motion-hooks";
import { ForecastingView, type ForecastingData } from "./view";

// The explorer's state (§10.6, cross-device §6): the seed picker swaps the
// DeepAR line in a transition (the CSS cross-fades it and glides the
// markers), and the horizon bars grow once when they first scroll into
// view. Under reduced motion they are simply full.

export default function ForecastingLive({
  data,
  initial,
}: {
  data: ForecastingData;
  initial: number;
}) {
  const [option, setOption] = useState(initial);
  const reduced = useReducedMotionSafe();
  const horizon = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = horizon.current;
    if (!el || reduced) return;
    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Already on screen when the live version mounts: they stay full,
        // rather than emptying in front of the reader.
        if (first && entry?.isIntersecting) return observer.disconnect();
        first = false;
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const css = getComputedStyle(document.documentElement);
        const ms = (name: string) => parseFloat(css.getPropertyValue(name));
        el.querySelectorAll("[data-bar]").forEach((bar, i) =>
          bar.animate(
            [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
            {
              duration: ms("--duration-reveal"),
              delay: i * ms("--stagger"),
              easing: css.getPropertyValue("--ease-out").trim() || "ease-out",
              fill: "backwards",
            },
          ),
        );
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <ForecastingView
      data={data}
      state={{ option }}
      on={{
        horizon,
        onOption: (i) => startTransition(() => setOption(i)),
      }}
    />
  );
}
