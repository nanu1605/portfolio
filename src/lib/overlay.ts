// Exit for native <dialog> and popover (cross-device §2, Overlays): Safari
// and Firefox can't transition `overlay`, so fade out first, then close.
// Under reduced motion, or if the animation never ends (hidden tab), close
// straight away.

const FALLBACK_MS = 300;

export function closeWithExit(el: HTMLElement, close: () => void) {
  if (el.hasAttribute("data-closing")) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return close();

  el.setAttribute("data-closing", "");
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.removeEventListener("animationend", onEnd);
    el.removeAttribute("data-closing");
    close();
  };
  const onEnd = (event: AnimationEvent) => {
    if (event.target === el) finish();
  };
  el.addEventListener("animationend", onEnd);
  setTimeout(finish, FALLBACK_MS);
}
