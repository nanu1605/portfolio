// Custom events for Vercel Web Analytics (§12).

type Va = (
  kind: "event",
  event: { name: string; data?: Record<string, string> },
) => void;

/**
 * What Vercel Analytics's `track()` sends, without its package on every
 * page (Home's JS budget). `window.va` is the queue layout.tsx sets on
 * Vercel; elsewhere this does nothing.
 */
export function track(name: string, data?: Record<string, string>) {
  (window as Window & { va?: Va }).va?.("event", { name, data });
}
