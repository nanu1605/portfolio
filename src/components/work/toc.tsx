"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; text: string };

/**
 * The sticky "On this page" list from 1024 px (§8.4, cross-device §5). The
 * section whose heading last passed the top third of the screen is marked
 * `aria-current="location"`, and the accent marker slides to it.
 */
export function Toc({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const list = useRef<HTMLOListElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const headings = items.flatMap((item) => {
      const el = document.getElementById(item.id);
      return el ? [el] : [];
    });
    const update = () => {
      const line = innerHeight / 3;
      const passed = headings.filter(
        (h) => h.getBoundingClientRect().top <= line,
      );
      setActive((passed.at(-1) ?? headings[0])?.id);
    };
    // Any heading crossing the line re-checks them all (a dozen at most).
    const io = new IntersectionObserver(update, {
      rootMargin: "0px 0px -66% 0px",
    });
    headings.forEach((h) => io.observe(h));
    update();
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    const link = list.current?.querySelector<HTMLElement>(
      `a[href="#${active}"]`,
    );
    if (link) setOffset(link.offsetTop);
  }, [active]);

  return (
    <nav aria-label={label}>
      <p className="font-mono text-mono-label uppercase text-fg-subtle">
        {label}
      </p>
      <ol
        ref={list}
        className="relative mt-4 flex flex-col border-l border-border"
      >
        <span
          aria-hidden="true"
          className="absolute -left-px top-0 h-9 w-0.5 bg-accent transition-transform duration-(--duration-base) ease-out motion-reduce:transition-none"
          style={{ transform: `translateY(${offset}px)` }}
        />
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={item.id === active ? "location" : undefined}
              className="flex min-h-9 items-center py-1.5 pl-4 text-small text-fg-muted transition-ui hover:text-fg aria-[current=location]:text-fg"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
