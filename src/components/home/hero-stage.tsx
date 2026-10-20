"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePauseWhenHidden } from "@/lib/motion-hooks";

const DRIFTS = new Set(["signal-drift", "glow-drift"]);

// Seeking, not play(): play() would take the animation out of CSS's
// control, and [data-paused] could no longer pause it.
function replayDrifts(el: HTMLElement) {
  for (const animation of el.getAnimations({ subtree: true }))
    if (
      animation instanceof CSSAnimation &&
      DRIFTS.has(animation.animationName) &&
      animation.playState === "finished"
    )
      animation.currentTime = 0;
}

/**
 * The hero's section (§6.3). Its CSS animations pause off-screen and in
 * hidden tabs. The signal-line and glow drifts end within 5 s of first paint
 * (WCAG 2.2.2); a pointer move, a tap or the hero coming back into view
 * plays them once more (cross-device §2).
 */
export function HeroStage({
  labelledBy,
  className,
  children,
}: {
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const done = useRef(false);
  const active = usePauseWhenHidden(ref);

  const restart = () => {
    if (!ref.current || !done.current) return;
    done.current = false;
    replayDrifts(ref.current);
  };

  useEffect(() => {
    if (!active || !ref.current || !done.current) return;
    done.current = false;
    replayDrifts(ref.current);
  }, [active]);

  return (
    <section
      ref={ref}
      data-hero=""
      data-theme="dark"
      aria-labelledby={labelledBy}
      onAnimationEnd={(event) => {
        if (DRIFTS.has(event.animationName)) done.current = true;
      }}
      // A mouse or pen moving, or a tap (a click), not a scrolling finger.
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") restart();
      }}
      onClick={restart}
      className={className}
    >
      {children}
    </section>
  );
}
