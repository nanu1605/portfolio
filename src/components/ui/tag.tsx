import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** A static label: stack items, filters shown as text. */
export function Tag({ className, ...rest }: ComponentProps<"span">) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-sm border border-border px-2 py-1 font-mono text-mono-label text-fg-muted",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * A toggle chip (filters, stack pinning). Selected = filled +
 * `aria-pressed`. 44 px tall on coarse pointers, 36 px on fine ones.
 */
export function Chip({
  pressed,
  className,
  ...rest
}: Omit<ComponentProps<"button">, "aria-pressed"> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cx(
        "inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 text-small text-fg-muted transition-ui pointer-fine:min-h-9",
        "hover:bg-surface-2 hover:text-fg active:bg-surface-2",
        // Linked highlighting (the stack, §8.2).
        "data-highlight:border-accent data-highlight:text-fg",
        "aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent",
        className,
      )}
      {...rest}
    />
  );
}
