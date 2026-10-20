import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";

/** A closed-by-default note, e.g. "How this was built" (§5.7, §1.5). */
export function Disclosure({
  summary,
  children,
  className,
}: {
  summary: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cx(
        "group rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 font-mono text-mono-label uppercase text-fg-muted transition-ui hover:text-fg [&::-webkit-details-marker]:hidden">
        {summary}
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-(--duration-base) ease-out group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="px-5 pb-5 text-fg-muted">{children}</div>
    </details>
  );
}

/** An aside that stands out from the text, with an optional mono label. */
export function Callout({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cx(
        "flex flex-col gap-2 rounded-r-md border-l-2 border-accent bg-surface px-5 py-4",
        className,
      )}
    >
      {label && (
        <p className="font-mono text-mono-label uppercase text-fg-subtle">
          {label}
        </p>
      )}
      <div className="text-fg-muted">{children}</div>
    </aside>
  );
}
