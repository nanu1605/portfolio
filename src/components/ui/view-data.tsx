import { ChevronDown } from "lucide-react";
import { microcopy } from "@content/microcopy";
import { DataTable, type Column } from "./data-table";
import type { ReactNode } from "react";

/**
 * "View data" / "Hide data" (A.13): the table behind a chart, closed by
 * default. A native <details>, so it works without JS.
 */
export function ViewData({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: Column[];
  rows: Record<string, ReactNode>[];
}) {
  const { show, hide } = microcopy.viewData;
  return (
    <details className="group">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md font-mono text-mono-label uppercase text-fg-muted transition-ui hover:text-fg [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">{show}</span>
        <span className="hidden group-open:inline">{hide}</span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform duration-(--duration-base) ease-out group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <DataTable
        caption={caption}
        columns={columns}
        rows={rows}
        className="mt-2"
      />
    </details>
  );
}
