import type { CSSProperties, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { SIGNAL_VIEWBOX, signalPath } from "@/lib/signal";
import { splitWords } from "@/lib/words";
import { Pausable } from "./pausable";

// Server-rendered motion primitives. Each one is markup plus CSS in
// globals.css; the shared inline reveal script and the pointer and touch
// modules drive them, so none of these ship component JS.

type RevealProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

/** Fades in and rises 16 px once, when it enters view (§6.2). */
export function Reveal({ as: Tag = "div", className, children }: RevealProps) {
  return (
    <Tag data-reveal="fade" className={className}>
      {children}
    </Tag>
  );
}

type TextRevealProps = {
  text: string;
  as?: ElementType;
  /** "view": when it scrolls into view. "load": from first paint (the hero). */
  trigger?: "view" | "load";
  lang?: string;
  id?: string;
  className?: string;
};

const MAX_STAGGER = 12;

/** Word-by-word mask reveal (§6.2). Screen readers get the sentence once. */
export function TextReveal({
  text,
  as: Tag = "span",
  trigger = "view",
  lang,
  id,
  className,
}: TextRevealProps) {
  let i = 0;
  return (
    <Tag
      id={id}
      data-reveal={trigger === "load" ? "words-load" : "words"}
      lang={lang}
      className={className}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {splitWords(text, lang).map((token, index) =>
          token.space ? (
            " "
          ) : (
            <span key={index} className="word-mask">
              <span
                className="word"
                style={{ "--i": Math.min(i++, MAX_STAGGER) } as CSSProperties}
              >
                {token.text}
              </span>
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}

/**
 * Pulls its content up to 6 px toward a fine pointer (§6.2). The hit area
 * stays put; only the inner span moves. Touch gets the button's press.
 */
export function Magnetic({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span data-magnetic="" className={cx("inline-flex", className)}>
      <span data-magnetic-inner="">{children}</span>
    </span>
  );
}

/** The gradient layer a [data-spotlight] surface moves (cross-device §3). */
export function SpotlightLayer() {
  return <span data-spot-layer="" aria-hidden="true" />;
}

const signal = signalPath();

/**
 * The emerald signal line (§5.5). Static by default; `animate` draws it and
 * drifts once (the hero only), pausing off-screen and in hidden tabs.
 */
export function SignalLine({
  animate = false,
  className,
}: {
  animate?: boolean;
  className?: string;
}) {
  const svg = (
    <svg
      viewBox={`0 0 ${SIGNAL_VIEWBOX.width} ${SIGNAL_VIEWBOX.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className="block h-full w-full overflow-visible text-accent"
    >
      <path
        d={signal}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={animate ? "signal-draw" : undefined}
      />
    </svg>
  );
  if (!animate) return <div className={cx("h-16", className)}>{svg}</div>;
  return (
    <Pausable className={cx("h-16 overflow-clip", className)}>
      <div className="signal-drift -ml-[2%] h-full w-[104%]">{svg}</div>
    </Pausable>
  );
}
