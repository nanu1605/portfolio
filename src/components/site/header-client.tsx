"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { closeWithExit } from "@/lib/overlay";
import { iconButton } from "./icon-button";

// The header's interactive parts. Content arrives as props from the server
// component in header.tsx, so no content module (or Zod) ships to the browser.

type NavLink = { label: string; href: string };

const RETURN_PX = 8;

const isCurrent = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * Hides the header on scroll down past its height and brings it back after
 * 8 px up (cross-device §4). It stays near the top, while focus is inside
 * it, while the menu is open and under reduced motion. Overscroll is
 * clamped, so a rubber-band bounce doesn't toggle it.
 */
export function HeaderShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    let last = 0;
    let turn = 0;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = Math.max(root.scrollHeight - innerHeight, 0);
      const y = Math.min(Math.max(scrollY, 0), max);
      let hide = el.hasAttribute("data-hidden");
      if (
        reduced.matches ||
        y <= el.offsetHeight ||
        // Keyboard focus only: a tap or click leaves focus on the menu
        // button, and that shouldn't pin the header for good.
        el.querySelector(":focus-visible") ||
        el.querySelector("dialog[open]")
      ) {
        hide = false;
        turn = y;
      } else if (y > last) {
        hide = true;
        turn = y;
      } else if (turn - y >= RETURN_PX) {
        hide = false;
      }
      last = y;
      el.toggleAttribute("data-hidden", hide);
    };
    const schedule = () => {
      // Under reduced motion the header never hides: no work per scroll.
      if (!frame && !reduced.matches) frame = requestAnimationFrame(update);
    };

    update();
    addEventListener("scroll", schedule, { passive: true });
    el.addEventListener("focusin", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      el.removeEventListener("focusin", update);
    };
  }, []);

  return (
    <header ref={ref} data-header="" className={className}>
      {children}
    </header>
  );
}

/** The five links from 1024 px, with `aria-current` on the open section. */
export function NavLinks({
  links,
  label,
  className,
}: {
  links: NavLink[];
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-small text-fg-muted underline-offset-[6px] transition-ui hover:bg-surface-2 hover:text-fg aria-[current=page]:text-fg aria-[current=page]:underline aria-[current=page]:decoration-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The two bars; inside the dialog, CSS turns them into an X. */
function Bars() {
  return (
    <span aria-hidden="true" className="relative block size-6">
      <span className="menu-bar" />
      <span className="menu-bar" />
    </span>
  );
}

/**
 * Full-screen menu below 1024 px (cross-device §4): a modal <dialog>, so
 * focus is trapped and returns to the menu button. Links sit in the lower
 * half for thumb reach and rise in with the stagger; phone landscape puts
 * them in two columns and lets the dialog scroll. The close button sits
 * where the menu button was.
 */
export function MobileMenu({
  links,
  email,
  labels,
  wordmark,
  themeToggle,
}: {
  links: NavLink[];
  email: string;
  labels: { open: string; close: string; menu: string; nav: string };
  wordmark: ReactNode;
  themeToggle: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  const close = () => {
    const el = ref.current;
    if (el?.open) closeWithExit(el, () => el.close());
  };

  // Widening past the breakpoint hides the button, so close the menu too.
  useEffect(() => {
    const wide = matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (wide.matches) ref.current?.close();
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label={labels.open}
        aria-haspopup="dialog"
        className={cx(iconButton, "lg:hidden")}
      >
        <Bars />
      </button>
      <dialog
        ref={ref}
        aria-label={labels.menu}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        // Following a link closes the menu straight away.
        onClick={(event) => {
          if ((event.target as Element).closest("a")) ref.current?.close();
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-bg p-0 text-fg backdrop:bg-bg"
      >
        <div className="flex min-h-full flex-col px-page pb-[max(2rem,env(safe-area-inset-bottom))]">
          <div className="flex h-(--header-h) shrink-0 items-center gap-1">
            {wordmark}
            {themeToggle}
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className={iconButton}
            >
              <Bars />
            </button>
          </div>
          <nav aria-label={labels.nav} className="mt-auto pt-10">
            <ul className="flex flex-col gap-1 phone-landscape:grid phone-landscape:grid-cols-2 phone-landscape:gap-x-8">
              {links.map((link, i) => (
                <li
                  key={link.href}
                  className="menu-item"
                  style={{ "--i": i } as CSSProperties}
                >
                  <Link
                    href={link.href}
                    aria-current={
                      isCurrent(pathname, link.href) ? "page" : undefined
                    }
                    className="flex min-h-14 items-center text-h2 text-fg-muted underline-offset-8 transition-ui hover:text-fg aria-[current=page]:text-fg aria-[current=page]:underline aria-[current=page]:decoration-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p
            className="menu-item mt-10 font-mono text-mono-label text-fg-subtle"
            style={{ "--i": links.length } as CSSProperties}
          >
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center [overflow-wrap:anywhere] hover:text-fg"
            >
              {email}
            </a>
          </p>
        </div>
      </dialog>
    </>
  );
}
