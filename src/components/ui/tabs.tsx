"use client";

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "@/lib/cx";

type Tab = { id: string; label: string; content: ReactNode };

/**
 * ARIA tabs with automatic activation: arrow keys, Home and End move and
 * select. The indicator slides with transform only (cross-device §4).
 */
export function Tabs({ label, tabs }: { label: string; tabs: Tab[] }) {
  const base = useId();
  const [active, setActive] = useState(0);
  const [bar, setBar] = useState<{ x: number; w: number } | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[active];
      if (el) setBar({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(refs.current[active]!.parentElement!);
    return () => observer.disconnect();
  }, [active]);

  const onKeyDown = (event: KeyboardEvent) => {
    const last = tabs.length - 1;
    const next = {
      ArrowRight: active === last ? 0 : active + 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="relative flex gap-1 overflow-x-auto overscroll-x-contain border-b border-border"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cx(
              "min-h-11 shrink-0 rounded-t-sm px-4 text-small text-fg-muted transition-ui",
              "hover:text-fg aria-selected:text-fg",
              // Before the indicator is measured, mark the active tab itself.
              !bar && "aria-selected:shadow-[inset_0_-2px_0_var(--accent)]",
            )}
          >
            {tab.label}
          </button>
        ))}
        {bar && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-0.5 w-px origin-left bg-accent transition-transform duration-(--duration-base) ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${bar.x}px) scaleX(${bar.w})` }}
          />
        )}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          tabIndex={0}
          hidden={i !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
