"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";

const RESET_MS = 2000;

/**
 * "Copy email" → "Copied" (§5.7). Both labels share one grid cell, so the
 * button never changes size; a polite live region announces the copy.
 */
export function CopyButton({
  text,
  label,
  done,
  variant = "secondary",
}: {
  text: string;
  label: string;
  done: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // No clipboard (insecure context, denied permission): say nothing
      // rather than claim it worked.
    }
  };

  return (
    <Button variant={variant} onClick={copy}>
      <span className="grid">
        <span
          className={`flex items-center gap-2 [grid-area:1/1] ${copied ? "invisible" : ""}`}
        >
          <Copy aria-hidden="true" className="size-4" />
          {label}
        </span>
        <span
          className={`flex items-center gap-2 [grid-area:1/1] ${copied ? "" : "invisible"}`}
        >
          <Check aria-hidden="true" className="size-4" />
          {done}
        </span>
      </span>
      <span role="status" className="sr-only">
        {copied ? done : ""}
      </span>
    </Button>
  );
}
