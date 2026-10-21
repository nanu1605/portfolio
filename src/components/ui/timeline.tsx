import type { ReactNode } from "react";
import { DrawLine } from "@/components/motion/draw-line";
import { cx } from "@/lib/cx";

export type TimelineItem = {
  /** Lets the stack highlight this entry (`bosch`, `gsoc`, A.11). */
  id?: string;
  period: string;
  title: string;
  meta?: string;
  body?: ReactNode;
};

/**
 * A vertical timeline (§5.7). Phones: the line on the left and dates on
 * their own line. From md: dates in a ~140 px mono column (cross-device §5).
 */
export function Timeline({
  items,
  draw = false,
  className,
}: {
  items: TimelineItem[];
  /** The accent line draws with scroll (About's signature moment, §6.3). */
  draw?: boolean;
  className?: string;
}) {
  const line =
    "absolute top-2 bottom-2 left-[3px] w-px md:left-[calc(140px_+_1.5rem_+_3px)]";
  return (
    <ol className={cx("relative flex flex-col gap-10", className)}>
      <span aria-hidden="true" className={cx(line, "bg-border")} />
      {draw && <DrawLine className={line} />}
      {items.map((item) => (
        <li
          key={`${item.period} ${item.title}`}
          data-entry={item.id}
          className="group/entry relative grid gap-1 pl-8 md:grid-cols-[140px_1fr] md:gap-6 md:pl-0"
        >
          <span
            aria-hidden="true"
            className="absolute top-2 left-0 size-[7px] rounded-full border border-accent bg-bg transition-ui group-data-highlight/entry:scale-150 group-data-highlight/entry:bg-accent md:left-[calc(140px_+_1.5rem)]"
          />
          <p className="font-mono text-mono-label text-fg-subtle md:pt-1">
            {item.period}
          </p>
          <div className="flex flex-col gap-2 md:pl-8">
            <h3 className="text-h3">{item.title}</h3>
            {item.meta && (
              <p className="text-small text-fg-muted">{item.meta}</p>
            )}
            {item.body && <div className="text-fg-muted">{item.body}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
