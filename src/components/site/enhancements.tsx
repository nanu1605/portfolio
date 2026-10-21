"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { start as startTouchEffects } from "@/lib/touch-effects";
import type JarvisToast from "./jarvis-toast";

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
  greeting,
  profiles,
  jarvis,
}: {
  themeColors: { dark: string; light: string };
  /** For curious engineers (§6.5, A.13). */
  greeting: string;
  /** Profile links, which count as `social` outbound clicks (§12). */
  profiles: string[];
  /** The "hey jarvis" toast's copy (A.13). */
  jarvis: { text: string; link: string };
}) {
  const { resolvedTheme } = useTheme();
  // How many times "hey jarvis" has been typed; each opens the toast again.
  const [heard, setHeard] = useState(0);
  // The toast, from the after-load module.
  const [Toast, setToast] = useState<typeof JarvisToast | null>(null);

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

  // Ctrl K, "hey jarvis", the greeting, analytics, the swipe-back check and
  // the bento demos wait for the load event (src/lib/after-load.ts).
  useEffect(() => {
    let stop = () => {};
    const start = () =>
      void import("@/lib/after-load").then((m) => {
        setToast(() => m.JarvisToast);
        stop = m.start({
          profiles,
          greeting,
          onJarvis: () => setHeard((n) => n + 1),
        });
      });
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });
    return () => {
      removeEventListener("load", start);
      stop();
    };
  }, [profiles, greeting]);

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

  return heard > 0 && Toast && <Toast times={heard} {...jarvis} />;
}
