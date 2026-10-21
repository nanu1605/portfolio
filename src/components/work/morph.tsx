"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * The case-study end of the /work cover morph (§6.2, cross-device §4).
 * globals.css names [data-morph] from 768 px with motion allowed; this end
 * drops out while it's off-screen, so going back never flies the cover in
 * from outside the viewport.
 */
export function MorphTarget({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      el.toggleAttribute("data-out", !entry?.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-morph=""
      // The same name as the cover in app/work/page.tsx.
      style={{ "--morph": `cover-${slug}` } as CSSProperties}
    >
      {children}
    </div>
  );
}
