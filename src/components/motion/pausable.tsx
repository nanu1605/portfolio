"use client";

import { useRef, type ReactNode } from "react";
import { usePauseWhenHidden } from "@/lib/motion-hooks";

/** Pauses the CSS animations inside it off-screen and in hidden tabs. */
export function Pausable({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  usePauseWhenHidden(ref);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
