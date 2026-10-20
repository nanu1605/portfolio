"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { microcopy } from "@content/microcopy";

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
  const label = !mounted
    ? microcopy.palette.actions.theme
    : next === "light"
      ? microcopy.icons.toLight
      : microcopy.icons.toDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-md text-fg-muted transition-ui hover:bg-surface-2 hover:text-fg active:bg-surface-2"
    >
      {/* CSS picks the icon from data-theme, so it is right before hydration. */}
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
    </button>
  );
}
