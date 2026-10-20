// Fine-pointer effects (§6.2, §6.3): the card spotlight follows the
// pointer, bento tiles tilt up to 4°, magnetic CTAs pull up to 6 px and the
// hero glow follows with a lag (its transform transition). Loaded on demand by <Enhancements> only
// while `(any-hover: hover) and (any-pointer: fine)` matches with motion
// allowed, so phones never download it. One delegated listener for the
// page; each event is also checked, so a finger on a hybrid device never
// triggers it (cross-device §2).

import { moveGlow } from "./touch-effects";

const PULL = 6;
const TILT = 4;

export function start() {
  const root = document.documentElement;
  let spot: HTMLElement | null = null;
  let magnet: HTMLElement | null = null;
  let tilt: HTMLElement | null = null;
  let last: PointerEvent | null = null;
  let frame = 0;

  const inner = (el: HTMLElement) =>
    el.querySelector<HTMLElement>("[data-magnetic-inner]");

  const setSpot = (el: HTMLElement | null) => {
    if (el === spot) return;
    spot?.removeAttribute("data-spot");
    spot = el;
  };
  const setMagnet = (el: HTMLElement | null) => {
    if (el === magnet) return;
    if (magnet) {
      const target = inner(magnet);
      target?.style.removeProperty("--mag-x");
      target?.style.removeProperty("--mag-y");
    }
    magnet = el;
  };

  const setTilt = (el: HTMLElement | null) => {
    if (el === tilt) return;
    // Back to flat; the tile's transform transition eases it.
    tilt?.setAttribute("data-tilt", "");
    tilt = el;
  };

  const apply = () => {
    frame = 0;
    const event = last;
    if (!event || !(event.target instanceof Element)) return;

    setSpot(event.target.closest<HTMLElement>("[data-spotlight]"));
    if (spot) {
      const box = spot.getBoundingClientRect();
      spot.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
      spot.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
      spot.style.setProperty("--spot-s", "1");
      spot.setAttribute("data-spot", "on");
    }

    setTilt(event.target.closest<HTMLElement>("[data-tilt]"));
    if (tilt) {
      const box = tilt.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      tilt.style.setProperty("--tilt-x", `${(-y * 2 * TILT).toFixed(2)}deg`);
      tilt.style.setProperty("--tilt-y", `${(x * 2 * TILT).toFixed(2)}deg`);
      tilt.setAttribute("data-tilt", "on");
    }

    const hero = event.target.closest<HTMLElement>("[data-hero]");
    if (hero) moveGlow(hero, event.clientX, event.clientY);

    setMagnet(event.target.closest<HTMLElement>("[data-magnetic]"));
    const target = magnet && inner(magnet);
    if (magnet && target) {
      const box = magnet.getBoundingClientRect();
      const pull = (offset: number, size: number) =>
        `${(((offset / size) * 2 - 1) * PULL).toFixed(2)}px`;
      target.style.setProperty(
        "--mag-x",
        pull(event.clientX - box.left, box.width),
      );
      target.style.setProperty(
        "--mag-y",
        pull(event.clientY - box.top, box.height),
      );
    }
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    last = event;
    if (!frame) frame = requestAnimationFrame(apply);
  };
  const reset = () => {
    last = null;
    setSpot(null);
    setTilt(null);
    setMagnet(null);
  };

  document.addEventListener("pointermove", move, { passive: true });
  root.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
  root.setAttribute("data-pointer-fx", "");

  return () => {
    document.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", reset);
    window.removeEventListener("blur", reset);
    cancelAnimationFrame(frame);
    reset();
    root.removeAttribute("data-pointer-fx");
  };
}
