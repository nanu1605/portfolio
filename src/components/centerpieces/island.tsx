"use client";

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

// A centerpiece's interactive version loads once it comes within 200 px of
// the viewport (§10). Until then, and while its chunk downloads, the
// server-rendered poster holds the same box, so the swap shifts nothing.
// The poster and the live version render the same view component.

/** Binds one centerpiece's lazy chunk; call it at module level in a "use client" file. */
export function island<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  const Live = lazy(load);

  return function Island({
    poster,
    name,
    ...props
  }: P & { poster: ReactNode; name: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(false);

    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          setNear(true);
          observer.disconnect();
        },
        { rootMargin: "200px 0px" },
      );
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref} data-centerpiece={name} data-near={near ? "" : undefined}>
        {near ? (
          <Suspense fallback={poster}>
            <Live {...(props as P)} />
          </Suspense>
        ) : (
          poster
        )}
      </div>
    );
  };
}
