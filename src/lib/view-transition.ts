// Same-page View Transitions (cross-device §4): the theme switch and the
// Work filter. `data-vt` on <html> says which one is running, so globals.css
// names only that transition's elements: the filter's cards, never the
// page's cover morph. Instant under reduced motion and where unsupported.

export function viewTransition(kind: "theme" | "filter", update: () => void) {
  const root = document.documentElement;
  if (
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return update();
  root.dataset.vt = kind;
  document
    .startViewTransition(update)
    .finished.finally(() => delete root.dataset.vt);
}
