"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * True while the reader asks for reduced motion. Reports `true` on the
 * server and during hydration, so JS motion never starts before the
 * client knows; CSS has already set the final states (§3 Motion).
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    (onChange) => {
      const query = matchMedia(REDUCED);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => matchMedia(REDUCED).matches,
    () => true,
  );
}

/**
 * Whether the element is on screen in a visible tab. Also sets
 * [data-paused] on it, which pauses its CSS animations (globals.css).
 * Re-checks on `pageshow`, for pages restored from the back/forward cache.
 */
export function usePauseWhenHidden(ref: RefObject<Element | null>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      const on = inView && document.visibilityState === "visible";
      el.toggleAttribute("data-paused", !on);
      setActive(on);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(el);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", update);
    };
  }, [ref]);

  return active;
}
