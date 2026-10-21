import { track } from "./track";
import { viewTransition } from "./view-transition";

/**
 * Switches the theme in a cross-fade (cross-device §4) and counts it (§12).
 * The new snapshot needs the theme straight away, and next-themes only
 * applies it in an effect, so the attribute is set here first.
 */
export function switchTheme(
  next: "light" | "dark",
  setTheme: (theme: string) => void,
) {
  track("theme_toggle");
  viewTransition("theme", () => {
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    setTheme(next);
  });
}
