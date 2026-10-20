// Touch version of the card spotlight (cross-device §3): a bloom at the
// touch point. It starts 100 ms after pointerdown, so a scroll that begins
// on a card doesn't flash (the browser sends pointercancel when it takes
// over to pan). A quick tap still blooms briefly. Small enough to ship in
// the main bundle; no Motion.

const DELAY_MS = 100;
const HOLD_MS = 150;

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

  const up = () => {
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
