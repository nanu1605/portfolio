import { startTracking } from "./analytics";
import { startDemos } from "./demos";
import { closeWithExit } from "./overlay";

// The toast it opens comes along, rather than loading on its own.
export { default as JarvisToast } from "@/components/site/jarvis-toast";

// Page-wide behaviour that can wait for the load event, so it isn't part of
// Home's first-load JS (§13): the shortcut, "hey jarvis", the greeting,
// analytics, the swipe-back check and the bento demos. Enhancements loads it.

const PHRASE = "hey jarvis";

export function start({
  profiles,
  greeting,
  onJarvis,
}: {
  profiles: string[];
  greeting: string;
  /** Typing "hey jarvis" outside a form field (§6.5). */
  onJarvis: () => void;
}) {
  // For curious engineers (§6.5, A.13).
  console.log(greeting);

  let typed = "";
  const onKey = (event: KeyboardEvent) => {
    // Ctrl K / ⌘K opens the command palette from anywhere, or closes it.
    if (
      event.key.toLowerCase() === "k" &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault();
      const dialog = document.getElementById("palette") as HTMLDialogElement;
      if (dialog.open) closeWithExit(dialog, () => dialog.close());
      else document.getElementById("palette-button")?.click();
      return;
    }
    // "hey jarvis", keyboard only (cross-device §3), outside form fields.
    const target = event.target as HTMLElement;
    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      target.isContentEditable ||
      target.closest("input, textarea, select")
    )
      return;
    typed = (typed + event.key.toLowerCase()).slice(-PHRASE.length);
    if (typed !== PHRASE) return;
    typed = "";
    onJarvis();
  };

  // iOS swipe-back has already animated the page, so skip our transition
  // (cross-device §4). ponytail: cleared on a timer, since React's
  // transition gives no handle; a slow back navigation could still fade.
  const root = document.documentElement;
  const onPop = (event: PopStateEvent) => {
    if (!event.hasUAVisualTransition) return;
    root.dataset.vt = "skip";
    setTimeout(() => {
      if (root.dataset.vt === "skip") delete root.dataset.vt;
    }, 1000);
  };

  const stopTracking = startTracking(profiles);
  const stopDemos = startDemos();
  addEventListener("keydown", onKey);
  addEventListener("popstate", onPop);
  return () => {
    stopTracking();
    stopDemos();
    removeEventListener("keydown", onKey);
    removeEventListener("popstate", onPop);
  };
}
