"use client";

import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Chip } from "@/components/ui/tag";

type Filter = { id: string; label: string };

// The allow-list is the validation for ?filter= (no Zod in the browser).
const read = (ids: string[]) => {
  const value = new URLSearchParams(location.search).get("filter");
  return value && ids.includes(value) ? value : "all";
};

/**
 * The Work filter chips and the list they filter (§8.3, cross-device §4).
 * The cards are server-rendered children; a chip only changes one
 * attribute, which globals.css turns into what shows, inside a View
 * Transition so the remaining cards glide (instant under reduced motion
 * and where unsupported). `?filter=` follows through `replaceState`. On
 * load, src/lib/work-filter-script.ts (the first child) has already
 * applied the URL's filter; React starts from the same value.
 */
export function WorkIndex({
  filters,
  counts,
  labels,
  children,
}: {
  filters: Filter[];
  /** How many items each filter shows, for the status line. */
  counts: Record<string, number>;
  labels: { filter: string; shown: string };
  children: ReactNode;
}) {
  const ids = filters.map((f) => f.id);
  // Also right on client navigation to /work?filter=…, where the inline
  // script doesn't run.
  const [filter, setFilter] = useState(() =>
    typeof window === "undefined" ? "all" : read(ids),
  );
  const [status, setStatus] = useState("");
  const total = counts.all ?? 0;

  const choose = (id: string) => {
    if (id === filter) return;
    const url = new URL(location.href);
    if (id === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", id);
    history.replaceState(history.state, "", url);
    const apply = () =>
      flushSync(() => {
        setFilter(id);
        setStatus(
          labels.shown
            .replace("{n}", String(counts[id] ?? 0))
            .replace("{total}", String(total)),
        );
      });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) apply();
    else document.startViewTransition(apply);
  };

  return (
    <div
      id="work-index"
      data-filter={filter}
      // The inline script may already have set the filter from the URL.
      suppressHydrationWarning
      className="flex flex-col gap-10"
    >
      <div
        role="group"
        aria-label={labels.filter}
        className="flex flex-wrap gap-2"
      >
        {filters.map((f) => (
          <Chip
            key={f.id}
            data-chip={f.id}
            pressed={f.id === filter}
            onClick={() => choose(f.id)}
            suppressHydrationWarning
          >
            {f.label}
          </Chip>
        ))}
      </div>
      <p role="status" className="sr-only">
        {status}
      </p>
      {children}
    </div>
  );
}
