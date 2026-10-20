import { useId, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export type Column = { key: string; label: string; numeric?: boolean };

/**
 * A real <table> (the "View data" alternative to a chart, §5.7). It scrolls
 * sideways inside a labelled, focusable region with a sticky first column,
 * so the page itself never does (cross-device §5).
 */
export function DataTable({
  caption,
  columns,
  rows,
  className,
}: {
  caption: string;
  columns: Column[];
  rows: Record<string, ReactNode>[];
  className?: string;
}) {
  const id = useId();
  return (
    <div
      role="region"
      aria-labelledby={id}
      tabIndex={0}
      className={cx(
        "scroll-fade overflow-x-auto overscroll-x-contain rounded-md border border-border",
        className,
      )}
    >
      <table className="w-full border-collapse text-left text-small">
        <caption
          id={id}
          className="px-4 py-3 text-left font-mono text-mono-label uppercase text-fg-subtle"
        >
          {caption}
        </caption>
        <thead>
          <tr className="border-y border-border">
            {columns.map((col, i) => (
              <th
                key={col.key}
                scope="col"
                className={cx(
                  "whitespace-nowrap px-4 py-2 font-mono text-mono-label font-medium uppercase text-fg-subtle",
                  col.numeric && "text-right",
                  i === 0 && "sticky left-0 bg-bg",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-border last:border-b-0">
              {columns.map((col, i) =>
                i === 0 ? (
                  <th
                    key={col.key}
                    scope="row"
                    className="sticky left-0 bg-bg px-4 py-2 font-normal text-fg pointer-coarse:py-3"
                  >
                    {row[col.key]}
                  </th>
                ) : (
                  <td
                    key={col.key}
                    className={cx(
                      "px-4 py-2 text-fg-muted pointer-coarse:py-3",
                      col.numeric &&
                        "whitespace-nowrap text-right font-mono tabular-nums",
                    )}
                  >
                    {row[col.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
