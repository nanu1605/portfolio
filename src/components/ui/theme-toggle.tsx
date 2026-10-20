"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cx } from "@/lib/cx";

const subscribe = () => () => {};

/**
 * Light/dark switch. Labels come from the server (A.13), so no content
 * module ships to the browser.
 */
export function ThemeToggle({
  labels,
  className,
}: {
  /** `initial` is used until the theme is known on the client. */
  labels: { initial: string; toLight: string; toDark: string };
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known on the client; the server renders a neutral label.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const next = resolvedTheme === "dark" ? "light" : "dark";
  const label = !mounted
    ? labels.initial
    : next === "light"
      ? labels.toLight
      : labels.toDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      className={cx(
        "inline-flex size-11 items-center justify-center rounded-md text-fg-muted transition-ui hover:bg-surface-2 hover:text-fg active:bg-surface-2",
        className,
      )}
    >
      {/* CSS picks the icon from data-theme, so it is right before hydration. */}
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
    </button>
  );
}
