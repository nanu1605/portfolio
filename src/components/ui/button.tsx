import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "relative isolate inline-flex min-h-12 select-none items-center justify-center gap-2 rounded-md px-5 text-small font-semibold transition-ui";

const variants: Record<Variant, string> = {
  // Touch: press scale 0.97 plus an accent-soft halo; reduced motion keeps
  // the colour change only (cross-device §3).
  primary:
    "bg-accent text-on-accent hover:bg-accent-strong active:bg-accent-strong active:opacity-100 motion-safe:active:scale-[0.97] after:absolute after:-inset-1 after:-z-10 after:rounded-[inherit] after:bg-accent-soft after:opacity-0 after:transition-opacity after:duration-(--duration-fast) active:after:opacity-100",
  secondary:
    "border border-border-strong text-fg hover:bg-surface-2 active:bg-surface-2",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg active:bg-surface-2",
};

type Common = {
  variant?: Variant;
  /** Pull toward a fine pointer, up to 6 px (primary CTAs, §6.2). */
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = Common &
  Omit<ComponentProps<"button">, keyof Common> & { href?: undefined };
type LinkProps = Common &
  Omit<ComponentProps<"a">, keyof Common> & { href: string };

export function Button(props: ButtonProps | LinkProps) {
  const {
    variant = "secondary",
    magnetic = false,
    className,
    children,
    ...rest
  } = props;
  const classes = cx(base, variants[variant], className);
  const content = magnetic ? (
    <span data-magnetic-inner="">{children}</span>
  ) : (
    children
  );
  const fx = magnetic ? { "data-magnetic": "" } : {};

  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as Omit<LinkProps, keyof Common>;
    // Site paths go through next/link; mailto and other sites are plain links.
    return href.startsWith("/") ? (
      <Link href={href} className={classes} {...fx} {...anchor}>
        {content}
      </Link>
    ) : (
      <a href={href} className={classes} {...fx} {...anchor}>
        {content}
      </a>
    );
  }
  const button = rest as Omit<ButtonProps, keyof Common>;
  return (
    <button type="button" className={classes} {...fx} {...button}>
      {content}
    </button>
  );
}
