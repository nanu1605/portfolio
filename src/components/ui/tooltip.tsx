"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";

const GAP = 8;

/**
 * A tooltip on a native popover (§5.7, cross-device §3). A mouse shows it
 * on hover, the keyboard on focus; a tap pins it, and a tap elsewhere or
 * Esc dismisses it (popover light dismiss).
 */
export function Tooltip({
  trigger,
  label,
  children,
  className,
}: {
  /** The trigger's visible content (text or an icon). */
  trigger: ReactNode;
  /** The trigger's accessible name when it shows only an icon. */
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tip.current;
    const anchor = button.current;
    if (!el || !anchor) return;
    // Place it above the trigger, or below when there's no room, inside the viewport.
    const place = (event: Event) => {
      if ((event as ToggleEvent).newState !== "open") return;
      const a = anchor.getBoundingClientRect();
      const t = el.getBoundingClientRect();
      const left = Math.min(
        Math.max(GAP, a.left + a.width / 2 - t.width / 2),
        window.innerWidth - t.width - GAP,
      );
      const above = a.top - t.height - GAP;
      el.style.left = `${left}px`;
      el.style.top = `${above >= GAP ? above : a.bottom + GAP}px`;
    };
    el.addEventListener("toggle", place);
    return () => el.removeEventListener("toggle", place);
  }, []);

  const show = () => tip.current?.showPopover();
  const hide = () => tip.current?.hidePopover();

  return (
    <>
      <button
        ref={button}
        type="button"
        popoverTarget={id}
        popoverTargetAction="show"
        aria-label={label}
        aria-describedby={id}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={show}
        onBlur={hide}
        className={cx(
          "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-fg-muted transition-ui hover:text-fg",
          className,
        )}
      >
        {trigger}
      </button>
      <div
        ref={tip}
        id={id}
        popover="auto"
        role="tooltip"
        className="fixed m-0 max-w-72 rounded-md border border-border-strong bg-bg-raised px-3 py-2 text-small text-fg [inset:auto]"
      >
        {children}
      </div>
    </>
  );
}
