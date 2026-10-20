"use client";

import { useId, useRef, type ReactNode } from "react";
import { closeWithExit } from "@/lib/overlay";
import { Button } from "./button";

/**
 * A modal on native <dialog> (§5.7): focus is trapped and returns to the
 * trigger, Esc and a backdrop click close it, and it fades out before it
 * closes (src/lib/overlay.ts).
 */
export function Dialog({
  trigger,
  title,
  closeLabel,
  children,
}: {
  trigger: string;
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const id = useId();
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => {
    const el = ref.current;
    if (el) closeWithExit(el, () => el.close());
  };

  return (
    <>
      <Button onClick={() => ref.current?.showModal()}>{trigger}</Button>
      <dialog
        ref={ref}
        aria-labelledby={id}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[min(80dvh,40rem)] w-[min(100%_-_2rem,32rem)] rounded-xl border border-border bg-bg-raised p-0 text-fg"
      >
        <div className="flex flex-col gap-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <h2 id={id} className="text-h3">
            {title}
          </h2>
          <div className="text-fg-muted">{children}</div>
          <Button onClick={close} className="self-end">
            {closeLabel}
          </Button>
        </div>
      </dialog>
    </>
  );
}
