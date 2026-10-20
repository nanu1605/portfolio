import { cx } from "@/lib/cx";

/** `01 — Selected work`, then the title and intro (§5.5, §5.7). */
export function SectionHeader({
  index,
  label,
  title,
  intro,
  id,
  className,
}: {
  index: string;
  label: string;
  title?: string;
  intro?: string;
  /** The heading's id, for in-page links. */
  id?: string;
  className?: string;
}) {
  const eyebrow = `${index} — ${label}`;
  return (
    <header className={cx("flex max-w-text flex-col gap-4", className)}>
      {title ? (
        <>
          <p className="font-mono text-mono-label uppercase text-fg-subtle">
            {eyebrow}
          </p>
          <h2 id={id} className="text-h2">
            {title}
          </h2>
        </>
      ) : (
        <h2
          id={id}
          className="font-mono text-mono-label uppercase text-fg-subtle"
        >
          {eyebrow}
        </h2>
      )}
      {intro && <p className="text-body-lg text-fg-muted">{intro}</p>}
    </header>
  );
}
