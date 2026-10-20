"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { start as startTouchEffects } from "@/lib/touch-effects";

// Page-wide behaviour that needs the browser (docs/cross-device.md §2).
// Width decides layout; input decides effects, re-checked live.
const POINTER_FX =
  "(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)";
// Lenis follows the primary pointer, so phones and tablets keep native momentum.
const SMOOTH_SCROLL =
  "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)";

/** Runs `enable` while `query` matches; its return value tears it down. */
function whileMatches(query: string, enable: () => Promise<() => void>) {
  const media = matchMedia(query);
  let stop: (() => void) | null = null;
  let run = 0;
  const update = () => {
    const id = ++run;
    stop?.();
    stop = null;
    if (!media.matches) return;
    void enable().then((teardown) => {
      if (id === run) stop = teardown;
      else teardown();
    });
  };
  update();
  media.addEventListener("change", update);
  return () => {
    run++;
    media.removeEventListener("change", update);
    stop?.();
  };
}

export function Enhancements({
  themeColors,
}: {
  themeColors: { dark: string; light: string };
}) {
  const { resolvedTheme } = useTheme();

  // Android and iOS tint their toolbars from theme-color.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && resolvedTheme)
      meta.setAttribute(
        "content",
        themeColors[resolvedTheme === "light" ? "light" : "dark"],
      );
  }, [resolvedTheme, themeColors]);

  useEffect(() => startTouchEffects(), []);

  useEffect(
    () =>
      whileMatches(POINTER_FX, () =>
        import("@/lib/pointer-effects").then((m) => m.start()),
      ),
    [],
  );

  useEffect(
    () =>
      whileMatches(SMOOTH_SCROLL, async () => {
        const { default: Lenis } = await import("lenis");
        // Anchors honour scroll-padding-top, which clears the header.
        const lenis = new Lenis({
          autoRaf: true,
          syncTouch: false,
          anchors: true,
        });
        return () => lenis.destroy();
      }),
    [],
  );

  return null;
}
