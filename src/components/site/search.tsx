import { Search as SearchIcon, X } from "lucide-react";
import { iconButton } from "./icon-button";
import type { PaletteItem, PaletteLabels } from "./palette";
import { SearchButton } from "./search-button";

/**
 * The command palette (§6.4, cross-device §4). The dialog is plain server
 * HTML, so it costs Home no JS: search-button.tsx opens it (the header
 * button, Ctrl K / ⌘K) and focuses the input inside the tap, so iOS opens
 * the keyboard on the first tap; palette.tsx, loaded then, does the rest.
 * Phones get the whole screen; from 768 px it's a panel near the top.
 */
export function Search({
  items,
  email,
  labels,
}: {
  items: PaletteItem[];
  email: string;
  labels: PaletteLabels;
}) {
  return (
    <>
      <SearchButton items={items} email={email} labels={labels}>
        <SearchIcon aria-hidden="true" className="size-5" />
      </SearchButton>
      <dialog
        id="palette"
        aria-label={labels.search}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-fg open:flex open:flex-col md:inset-x-0 md:top-[12svh] md:bottom-auto md:mx-auto md:h-auto md:max-h-[60svh] md:w-[min(100%-2rem,36rem)] md:rounded-xl md:border md:border-border md:bg-bg-raised"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border pt-[env(safe-area-inset-top)] pr-[max(0.5rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
          <SearchIcon
            aria-hidden="true"
            className="size-5 shrink-0 text-fg-subtle"
          />
          <input
            id="palette-input"
            type="search"
            role="combobox"
            aria-label={labels.search}
            aria-expanded="true"
            aria-controls="palette-listbox"
            aria-autocomplete="list"
            placeholder={labels.placeholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="go"
            // The ring sits inside, so the panel's edge never clips it.
            className="my-1 h-12 min-w-0 flex-1 rounded-md bg-transparent px-2 text-body text-fg placeholder:text-fg-subtle focus-visible:outline-offset-[-2px] [&::-webkit-search-cancel-button]:appearance-none"
          />
          <button
            type="button"
            id="palette-close"
            aria-label={labels.close}
            className={iconButton}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div
          id="palette-list"
          // Lenis would otherwise scroll the page under the panel.
          data-lenis-prevent=""
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        />
      </dialog>
    </>
  );
}
