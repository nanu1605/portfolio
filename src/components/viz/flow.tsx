import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type Step = { label: string; detail?: string; icon?: ReactNode };

/**
 * A numbered sequence of steps: a pipeline, a loop or a flow (§10.3,
 * §10.7–10.9, static until Phase 5). Phones stack it on a rail; `row`
 * flows lay out in one row once their container has room.
 */
export function Flow({
  steps,
  row = false,
  className,
}: {
  steps: Step[];
  row?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("@container", className)}>
      <ol
        className={cx(
          "grid gap-4",
          row && "@3xl:auto-cols-fr @3xl:grid-flow-col @3xl:gap-3",
        )}
      >
        {steps.map((step, i) => (
          <li
            key={step.label}
            className={cx(
              "flex gap-4 border-l border-border-strong pl-4",
              row &&
                "@3xl:flex-col @3xl:gap-3 @3xl:border-t @3xl:border-l-0 @3xl:pt-4 @3xl:pl-0",
            )}
          >
            <span
              aria-hidden="true"
              className="flex shrink-0 items-start gap-2 font-mono text-mono-label text-accent"
            >
              {String(i + 1).padStart(2, "0")}
              {step.icon}
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-small font-semibold text-fg">
                {step.label}
              </span>
              {step.detail && (
                <span className="text-small text-fg-muted">{step.detail}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Dots on a line with short labels or icons: a Work card cover (decorative). */
export function MiniFlow({ steps }: { steps: ReactNode[] }) {
  return (
    <ol
      aria-hidden="true"
      className="relative grid w-full auto-cols-fr grid-flow-col gap-2 before:absolute before:inset-x-[calc(50%/var(--n))] before:top-1.5 before:h-px before:bg-border-strong"
      style={{ "--n": steps.length } as CSSProperties}
    >
      {steps.map((label, i) => (
        <li
          key={i}
          className="relative flex flex-col items-center gap-3 text-center"
        >
          <span
            className={cx(
              "size-3 rounded-full border-2",
              i === 0
                ? "border-accent bg-accent"
                : "border-border-strong bg-surface",
            )}
          />
          <span className="font-mono text-mono-label text-fg-subtle">
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
