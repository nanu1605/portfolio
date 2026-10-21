"use client";

import { useEffect, useRef, useState } from "react";
import { TextLink } from "@/components/ui/text-link";

/**
 * The "hey jarvis" toast (src/lib/after-load.ts hears it): bottom right
 * from 768 px, bottom centre below. A light-dismiss popover, so Esc or a
 * click elsewhere closes it. Its text is added once it's open, so screen
 * readers announce it.
 */
export default function JarvisToast({
  times,
  text,
  link,
}: {
  times: number;
  text: string;
  link: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ref.current?.matches(":popover-open")) ref.current?.showPopover();
  }, [times]);

  return (
    <div
      ref={ref}
      popover="auto"
      role="status"
      data-toast=""
      onToggle={(event) => setOpen(event.newState === "open")}
      className="inset-auto bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 m-0 w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded-lg border border-border bg-bg-raised p-4 text-fg depth md:right-6 md:left-auto md:translate-x-0"
    >
      {open && (
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="relative mt-1 grid size-9 shrink-0 place-items-center"
          >
            <span className="absolute -inset-2 rounded-full bg-[radial-gradient(closest-side,var(--baby),transparent)] opacity-40" />
            <span className="size-7 rounded-full bg-baby ring-4 ring-baby/25" />
          </span>
          <p className="text-small text-fg-muted">
            {text}{" "}
            <TextLink
              href="/work/baby"
              onClick={() => ref.current?.hidePopover()}
            >
              {link}
            </TextLink>
          </p>
        </div>
      )}
    </div>
  );
}
