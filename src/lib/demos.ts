// Plays the Home bento micro-demos (§10.10, cross-device §3). The tiles sit
// below the fold, so this waits for the load event (after-load.ts).

const PLAY = "data-demo-play";

/**
 * [data-demo-play] on a [data-demo] tile plays its demo once (globals.css).
 * Unless the primary pointer is fine and hovers, a tile gets it once half
 * in view and keeps it, so the demo holds. A mouse, a pen or focus entering
 * a tile sets it too, and the end of the pass clears it: leaving mid-pass
 * doesn't cut the pass short, and the next entry replays it.
 */
export function startDemos() {
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.intersectionRatio < 0.49 || fine.matches) continue;
        e.target.setAttribute(PLAY, "");
        io.unobserve(e.target);
      }
    },
    { threshold: 0.5 },
  );
  // Tiles arrive with client-side navigation too.
  const scan = () =>
    document
      .querySelectorAll(`[data-demo]:not([${PLAY}])`)
      .forEach((el) => io.observe(el));
  const added = new MutationObserver(scan);

  const enter = (event: Event) => {
    if ((event as PointerEvent).pointerType === "touch") return;
    if (!(event.target instanceof Element)) return;
    const el = event.target.closest("[data-demo]");
    // Where the pointer or focus came from: inside means no new entry.
    const from = (event as MouseEvent | FocusEvent).relatedTarget;
    if (
      !el ||
      el.hasAttribute(PLAY) ||
      (from instanceof Node && el.contains(from))
    )
      return;
    el.setAttribute(PLAY, "");
    const pass = el
      .getAnimations({ subtree: true })
      .filter(
        (a) => a instanceof CSSAnimation && a.animationName.startsWith("demo-"),
      )
      .map((a) => a.finished);
    void Promise.allSettled(pass).then(() => el.removeAttribute(PLAY));
  };

  scan();
  added.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("pointerover", enter, { passive: true });
  document.addEventListener("focusin", enter);
  return () => {
    io.disconnect();
    added.disconnect();
    document.removeEventListener("pointerover", enter);
    document.removeEventListener("focusin", enter);
  };
}
