import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/**
 * A standalone link whose underline grows from the left on hover, focus
 * and press (§5.7). On coarse pointers the hit area grows to 44 px tall.
 * Links inside running text keep a static underline
 * instead (src/mdx-components.tsx), so they never rely on colour alone.
 */
export function TextLink({
  href,
  className,
  ...rest
}: ComponentProps<"a"> & { href: string }) {
  const classes = cx(
    "relative inline-block text-accent transition-ui hover:text-accent-strong",
    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-(--duration-base) after:ease-out",
    "hover:after:scale-x-100 focus-visible:after:scale-x-100 active:after:scale-x-100 motion-reduce:after:transition-none",
    // A taller hit area for fingers, without moving the layout.
    "pointer-coarse:before:absolute pointer-coarse:before:-inset-x-2 pointer-coarse:before:-inset-y-3 pointer-coarse:before:content-['']",
    className,
  );
  return href.startsWith("/") ? (
    <Link href={href} className={classes} {...rest} />
  ) : (
    <a href={href} className={classes} {...rest} />
  );
}
