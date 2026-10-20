import type { ReactNode } from "react";
import type { Image } from "@content/screens";
import { cx } from "@/lib/cx";
import { TextLink } from "./text-link";

/**
 * AVIF with a WebP fallback from the variants scripts/images.ts made, and
 * the blur placeholder behind it. `sizes` must describe the real layout
 * width (cross-device §7).
 */
export function Picture({
  image,
  alt,
  sizes,
  priority = false,
  className,
}: {
  image: Image;
  alt: string;
  sizes: string;
  /** Above the fold: load eagerly with high priority. */
  priority?: boolean;
  className?: string;
}) {
  const set = (format: "avif" | "webp") =>
    image.variants.map((v) => `${v[format]} ${v.width}w`).join(", ");
  const fallback = image.variants.at(-1)!;
  return (
    <picture>
      {/* Our own variants, so next/image's optimiser has nothing to add. */}
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <img
        src={fallback.webp}
        srcSet={set("webp")}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={{ backgroundImage: `url(${image.blur})` }}
        className={cx("h-auto w-full bg-cover", className)}
      />
    </picture>
  );
}

/** Image or SVG + caption + source link (§5.7), with an optional honesty label. */
export function Figure({
  caption,
  source,
  label,
  className,
  children,
}: {
  caption: string;
  source?: { href: string; label: string };
  /** "Illustrative screens.", "Simulated values…" (§3): next to the content. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={cx("flex flex-col gap-3", className)}>
      <div className="overflow-clip rounded-lg border border-border">
        {children}
      </div>
      <figcaption className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-small text-fg-muted">
        <span>{caption}</span>
        {label && (
          <span
            data-honesty=""
            className="font-mono text-mono-label uppercase text-fg-subtle"
          >
            {label}
          </span>
        )}
        {source && (
          <TextLink href={source.href} className="text-small">
            {source.label}
          </TextLink>
        )}
      </figcaption>
    </figure>
  );
}
