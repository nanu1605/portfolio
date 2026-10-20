"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; the server renders a neutral label.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Switch to ${next} theme` : "Toggle theme"}
      className="rounded-md border border-border-strong px-3 py-1.5 font-mono text-mono-label uppercase text-fg-muted transition-colors duration-(--duration-fast) ease-out hover:bg-surface-2 hover:text-fg"
    >
      Theme
    </button>
  );
}
