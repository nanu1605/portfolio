"use client";

import Link from "next/link";
import {
  useEffect,
  useEffectEvent,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { ArrowUpRight } from "lucide-react";
import { rank } from "@/lib/fuzzy";
import { closeWithExit } from "@/lib/overlay";
import { switchTheme } from "@/lib/theme";

// The command palette's behaviour (§6.4), loaded the first time it opens.
// It drives the server-rendered dialog in search.tsx: it reads the input,
// lists the matches into the dialog's list as options for the input's
// aria-activedescendant, and handles the keys, the close button and Esc.
// Focus stays in the input throughout.

export type PaletteItem = {
  group: "pages" | "projects" | "actions";
  label: string;
  /** Searched too: a page's title, a project's stack and filters. */
  keywords: readonly string[];
  /** A route, the PDF or an outside URL; actions have `action` instead. */
  href?: string;
  action?: "copy" | "theme";
  external?: boolean;
  download?: boolean;
};

export type PaletteLabels = {
  search: string;
  close: string;
  placeholder: string;
  copied: string;
  groups: Record<PaletteItem["group"], string>;
  results: { none: string; one: string; other: string };
};

const optionId = (i: number) => `palette-option-${i}`;
const optionClass =
  "flex min-h-12 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-left text-body text-fg-muted aria-selected:bg-surface-2 aria-selected:text-fg";

export default function Palette({
  items,
  email,
  labels,
}: {
  items: PaletteItem[];
  email: string;
  labels: PaletteLabels;
}) {
  // search.tsx's elements; this only mounts in the browser, once opened.
  const [el] = useState(() => ({
    dialog: document.getElementById("palette") as HTMLDialogElement,
    input: document.getElementById("palette-input") as HTMLInputElement,
    close: document.getElementById("palette-close")!,
    list: document.getElementById("palette-list")!,
  }));
  // Whatever was typed while this loaded.
  const [query, setQuery] = useState(() => el.input.value);
  const [active, setActive] = useState(0);
  // "Copied" shows until the query changes.
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const copied = copiedFor === query;
  const { resolvedTheme, setTheme } = useTheme();
  const found = rank(items, query);

  // The dialog's controls.
  useEffect(() => {
    const { dialog, input, close } = el;
    const exit = () => closeWithExit(dialog, () => dialog.close());
    const onInput = () => {
      setQuery(input.value);
      setActive(0);
    };
    const onCancel = (event: Event) => {
      event.preventDefault();
      exit();
    };
    const onClick = (event: Event) => {
      const target = event.target as Element;
      if (target === dialog) exit();
      // Following a result closes the palette straight away.
      else if (target.closest("a")) dialog.close();
    };
    const onClose = () => {
      input.value = "";
      setQuery("");
      setActive(0);
    };
    const listeners = [
      [input, "input", onInput],
      [dialog, "cancel", onCancel],
      [dialog, "click", onClick],
      [dialog, "close", onClose],
      [close, "click", exit],
    ] as const;
    for (const [target, type, fn] of listeners)
      target.addEventListener(type, fn);
    // Catch up on anything typed between the first render and now.
    onInput();
    return () => {
      for (const [target, type, fn] of listeners)
        target.removeEventListener(type, fn);
    };
  }, [el]);

  // Arrows move through the options (wrapping), Enter follows one, Esc closes.
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    // One Esc closes, even with text in the field (which browsers would
    // clear first).
    if (event.key === "Escape") {
      event.preventDefault();
      closeWithExit(el.dialog, () => el.dialog.close());
      return;
    }
    const options = [
      ...el.list.querySelectorAll<HTMLElement>('[role="option"]'),
    ];
    if (!options.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next = (active + step + options.length) % options.length;
      setActive(next);
      options[next]?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      options[active]?.click();
    }
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    el.input.addEventListener("keydown", listener);
    return () => el.input.removeEventListener("keydown", listener);
  }, [el]);

  // The input points at its active option.
  useEffect(() => {
    if (found.length)
      el.input.setAttribute("aria-activedescendant", optionId(active));
    else el.input.removeAttribute("aria-activedescendant");
  }, [el, active, found.length]);

  const run = (item: PaletteItem) => {
    if (item.action === "copy")
      navigator.clipboard.writeText(email).then(
        () => setCopiedFor(query),
        // No clipboard (insecure context, denied permission): say nothing.
        () => {},
      );
    if (item.action === "theme") {
      el.dialog.close();
      switchTheme(resolvedTheme === "dark" ? "light" : "dark", setTheme);
    }
  };

  // Groups follow their best match, so the first option is the best one.
  const groups = [...new Set(found.map((item) => item.group))].map(
    (group) => [group, found.filter((item) => item.group === group)] as const,
  );

  let index = -1;
  const option = (item: PaletteItem): ReactNode => {
    const i = ++index;
    const props = {
      id: optionId(i),
      role: "option",
      "aria-selected": i === active,
      tabIndex: -1,
      onPointerMove: (event: PointerEvent) => {
        if (event.pointerType === "mouse" && i !== active) setActive(i);
      },
      className: optionClass,
    };
    const label = item.action === "copy" && copied ? labels.copied : item.label;
    if (!item.href)
      return (
        <div key={item.label} {...props} onClick={() => run(item)}>
          {label}
        </div>
      );
    if (item.external)
      return (
        <a
          key={item.label}
          {...props}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
          <ArrowUpRight aria-hidden="true" className="size-4 text-fg-subtle" />
        </a>
      );
    if (item.download)
      return (
        <a key={item.label} {...props} href={item.href} download>
          {label}
        </a>
      );
    return (
      <Link key={item.label} {...props} href={item.href}>
        {label}
      </Link>
    );
  };

  const status = copied
    ? labels.copied
    : !query.trim()
      ? ""
      : found.length === 0
        ? labels.results.none
        : found.length === 1
          ? labels.results.one
          : labels.results.other.replace("{n}", String(found.length));

  return createPortal(
    <>
      <p role="status" className="sr-only">
        {status}
      </p>
      <div role="listbox" id="palette-listbox" aria-label={labels.search}>
        {groups.map(([group, list]) => (
          <div key={group} role="presentation" className="pb-2">
            <div
              id={`palette-${group}`}
              aria-hidden="true"
              className="px-3 pt-3 pb-1 font-mono text-mono-label uppercase text-fg-subtle"
            >
              {labels.groups[group]}
            </div>
            <div role="group" aria-labelledby={`palette-${group}`}>
              {list.map(option)}
            </div>
          </div>
        ))}
      </div>
      {found.length === 0 && (
        <p className="px-3 py-6 text-center text-fg-muted">
          {labels.results.none}
        </p>
      )}
    </>,
    el.list,
  );
}
