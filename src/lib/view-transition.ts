// Same-page View Transitions (cross-device §4): the theme switch and the
// Work filter. `data-vt` on <html> says which one is running, so globals.css
// names only that transition's elements: the filter's cards, never the
// page's cover morph. Instant under reduced motion and where unsupported.

let latest = 0;

export function viewTransition(kind: "theme" | "filter", update: () => void) {
  const root = document.documentElement;
  if (
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return update();
  const id = ++latest;
  root.dataset.vt = kind;
  document.startViewTransition(update).finished.finally(() => {
    // A newer transition skips this one; its flag stays until it ends.
    if (id === latest) delete root.dataset.vt;
  });
}
