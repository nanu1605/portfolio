// Touch versions of the pointer effects (cross-device §3): a bloom at the
// touch point on cards, and a tap moves the hero glow there. The bloom
// starts 100 ms after pointerdown, so a scroll that begins on a card
// doesn't flash (the browser sends pointercancel when it takes over to
// pan); the glow moves on pointerup, so a scroll never moves it. A quick
// tap still blooms briefly. Small enough to ship in the main bundle; no
// Motion.

const DELAY_MS = 100;
const HOLD_MS = 150;

/** Moves the hero glow's centre to a point; its transform transition eases it there. */
export function moveGlow(hero: HTMLElement, x: number, y: number) {
  const glow = hero.querySelector<HTMLElement>("[data-hero-glow]");
  if (!glow) return;
  const box = hero.getBoundingClientRect();
  // The glow rests at 65% / 40% of the hero (globals.css).
  glow.style.setProperty("--glow-dx", `${x - box.left - box.width * 0.65}px`);
  glow.style.setProperty("--glow-dy", `${y - box.top - box.height * 0.4}px`);
}

export function start() {
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
    cancel();
    document.removeEventListener("pointerdown", down);
    document.removeEventListener("pointerup", up);
    document.removeEventListener("pointercancel", cancel);
  };
}
