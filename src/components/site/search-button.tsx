"use client";

import { lazy, Suspense, useState, type ReactNode } from "react";
import { track } from "@/lib/track";
import { iconButton } from "./icon-button";
import type { PaletteItem, PaletteLabels } from "./palette";

const load = () => import("./palette");
const Palette = lazy(load);

/**
 * Opens the command palette (search.tsx) and focuses its input in the same
 * tap. Ctrl K / ⌘K clicks this button (src/lib/after-load.ts). The palette
 * itself loads the first time, or earlier, on hover or focus.
 */
export function SearchButton({
  items,
  email,
  labels,
  children,
}: {
  items: PaletteItem[];
  email: string;
  labels: PaletteLabels;
  children: ReactNode;
}) {
  const [opened, setOpened] = useState(false);

  const open = () => {
    const dialog = document.getElementById("palette") as HTMLDialogElement;
    if (dialog.open) return;
    dialog.showModal();
    document.getElementById("palette-input")?.focus();
    setOpened(true);
    track("palette_open");
  };

  return (
    <>
      <button
        type="button"
        id="palette-button"
        onClick={open}
        onPointerEnter={load}
        onFocus={load}
        aria-label={labels.search}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        className={iconButton}
      >
        {children}
      </button>
      {opened && (
        <Suspense fallback={null}>
          <Palette items={items} email={email} labels={labels} />
        </Suspense>
      )}
    </>
  );
}
