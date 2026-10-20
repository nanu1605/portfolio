import { cx } from "@/lib/cx";

/**
 * `01 — Selected work`, then the title and intro (§5.5, §5.7), over a faint
 * patch of the grid texture that fades out at its edges.
 */
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
    <header
      className={cx(
        "relative isolate flex max-w-text flex-col gap-4",
        "before:absolute before:inset-x-0 before:-inset-y-10 before:-z-10 before:bg-grid before:[mask-image:radial-gradient(closest-side,var(--fg),transparent)]",
        className,
      )}
    >
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
