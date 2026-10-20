// Touch versions of the pointer effects (cross-device §3): a bloom at the
// touch point on cards, and a tap moves the hero glow there. The bloom
// starts 100 ms after pointerdown, so a scroll that begins on a card
// doesn't flash (the browser sends pointercancel when it takes over to
// pan); the glow moves on pointerup, so a scroll never moves it. A quick
// tap still blooms briefly. Small enough to ship in the main bundle; no
// Motion.
//
// It also plays the Home bento micro-demos (§10.10, cross-device §3; see
// startDemos).

const DELAY_MS = 100;
const HOLD_MS = 150;

/** Moves the hero glow's centre to a point; its transform transition eases it there. */
export function moveGlow(hero: HTMLElement, x: number, y: number) {
  const glow = hero.querySelector<HTMLElement>("[data-hero-glow]");
  if (!glow) return;
  const box = hero.getBoundingClientRect();
  // Offsets from where it rests (its layout position, before transforms).
  glow.style.setProperty("--glow-dx", `${x - box.left - glow.offsetLeft}px`);
  glow.style.setProperty("--glow-dy", `${y - box.top - glow.offsetTop}px`);
}

const PLAY = "data-demo-play";

/**
 * [data-demo-play] on a [data-demo] tile plays its demo once (globals.css).
 * Unless the primary pointer is fine and hovers, a tile gets it once half
 * in view and keeps it, so the demo holds. A mouse, a pen or focus entering
 * a tile sets it too, and the end of the pass clears it: leaving mid-pass
 * doesn't cut the pass short, and the next entry replays it.
 */
function startDemos() {
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

export function start() {
  const stopDemos = startDemos();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let card: HTMLElement | null = null;
  let timer = 0;

  const bloom = (el: HTMLElement) => {
    el.style.setProperty("--spot-s", "1");
    el.setAttribute("data-spot", "bloom");
  };
  const clear = () => {
    clearTimeout(timer);
    timer = 0;
  };

  const down = (event: PointerEvent) => {
    if (event.pointerType !== "touch" || reduced.matches) return;
    if (!(event.target instanceof Element)) return;
    const el = event.target.closest<HTMLElement>("[data-spotlight]");
    if (!el) return;

    clear();
    card?.removeAttribute("data-spot");
    card = el;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
    el.style.setProperty("--spot-s", "0.4");
    timer = window.setTimeout(() => {
      timer = 0;
      bloom(el);
    }, DELAY_MS);
  };

  const up = (event: PointerEvent) => {
    // A scroll ends in pointercancel instead, so this is a tap or a press.
    if (
      event.pointerType === "touch" &&
      !reduced.matches &&
      event.target instanceof Element
    ) {
      const hero = event.target.closest<HTMLElement>("[data-hero]");
      if (hero) moveGlow(hero, event.clientX, event.clientY);
    }
    const el = card;
    if (!el) return;
    card = null;
    if (timer) {
      clear();
      bloom(el);
    }
    setTimeout(() => el.removeAttribute("data-spot"), HOLD_MS);
  };

  const cancel = () => {
    clear();
    card?.removeAttribute("data-spot");
    card = null;
  };

  document.addEventListener("pointerdown", down, { passive: true });
  document.addEventListener("pointerup", up, { passive: true });
  document.addEventListener("pointercancel", cancel, { passive: true });

  return () => {
    stopDemos();
    cancel();
    document.removeEventListener("pointerdown", down);
    document.removeEventListener("pointerup", up);
    document.removeEventListener("pointercancel", cancel);
  };
}
