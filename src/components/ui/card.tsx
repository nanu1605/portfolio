import Link from "next/link";
import type { ReactNode } from "react";
import { SpotlightLayer } from "@/components/motion/motion";
import { cx } from "@/lib/cx";

type Accent = "menumesh" | "vyro" | "baby";

// A soft radial glow in the product's accent: a static gradient, no blur
// filter (cross-device §2).
const glows: Record<Accent, string> = {
  menumesh: "[--glow:var(--menumesh)]",
  vyro: "[--glow:var(--vyro)]",
  baby: "[--glow:var(--baby)]",
};

type CardProps = {
  href?: string;
  className?: string;
  children: ReactNode;
};

// Large surfaces press 100 ms late, so a scroll that starts on them doesn't
// flash (cross-device §2); reduced motion swaps the spotlight for a fill.
const surface =
  "relative isolate block overflow-clip rounded-lg border border-border bg-surface depth transition-ui hover:border-border-strong motion-reduce:hover:bg-surface-2 active:bg-surface-2 active:opacity-100 active:delay-100";

/** A surface with the cursor spotlight, or a touch bloom (§5.7, §6.2). */
export function Card({ href, className, children }: CardProps) {
  const classes = cx(surface, "p-6", className);
  const inner = (
    <>
      <SpotlightLayer />
      {children}
    </>
  );
  return href ? (
    <Link href={href} data-spotlight="" className={classes}>
      {inner}
    </Link>
  ) : (
    <div data-spotlight="" className={classes}>
      {inner}
    </div>
  );
}

/**
 * A Home bento tile (§8.2): a Card that lays out from its own width
 * (`@container`), with an optional product-accent glow. The tilt and the
 * micro-demos arrive in Phases 3 and 5.
 */
export function BentoTile({
  href,
  title,
  oneLiner,
  readout,
  accent,
  media,
  className,
}: {
  href: string;
  title: string;
  oneLiner: string;
  readout?: string | null;
  accent?: Accent;
  media?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-spotlight=""
      className={cx(surface, "@container flex flex-col", className)}
    >
      <SpotlightLayer />
      {accent && (
        <span
          data-glow=""
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute -top-1/2 left-1/2 -z-10 aspect-square w-full -translate-x-1/2 bg-[radial-gradient(closest-side,var(--glow),transparent)] opacity-20",
            glows[accent],
          )}
        />
      )}
      {media && (
        <div className="overflow-clip border-b border-border">{media}</div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5 @md:p-6">
        <h3 className="text-h3">{title}</h3>
        <p className="text-small text-fg-muted">{oneLiner}</p>
        {readout && (
          <p className="mt-auto pt-3 font-mono text-mono-label text-fg-subtle">
            {readout}
          </p>
        )}
      </div>
    </Link>
  );
}
