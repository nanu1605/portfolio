import { cx } from "@/lib/cx";

// The dot carries the tone; the text stays fg-muted so every badge passes
// 4.5:1 on any surface.
const tones: Record<string, string> = {
  Live: "bg-accent",
  Beta: "bg-info",
  Free: "bg-accent",
  "Open source": "bg-fg-muted",
  "In launch prep": "bg-warn",
  "Launching soon": "bg-warn",
  "Client work": "bg-fg-muted",
  Archived: "bg-fg-subtle",
};

/** Project status (§5.7): Live, Beta, Free, Open source, In launch prep, Archived. */
export function StatusBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-1 font-mono text-mono-label uppercase text-fg-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx("size-1.5 rounded-full", tones[label] ?? "bg-fg-subtle")}
      />
      {label}
    </span>
  );
}

/** "Now · …" (§5.7). The dot is still: nothing here moves on its own. */
export function StatusPill({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={cx(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-mono-label text-fg-muted",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-accent"
      />
      <span className="min-w-0">{text}</span>
    </p>
  );
}
