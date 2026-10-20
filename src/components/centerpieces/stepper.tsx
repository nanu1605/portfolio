import type { CSSProperties, KeyboardEvent, ReactNode, Ref } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

// The shared stepper (§10.3, §10.4; cross-device §6): a rail of steps over
// a native scroll-snap track, with Previous and Next below. No hooks, so a
// server poster and the live version render the same markup; the live one
// passes `onGo` and a track ref, and follows the track with `followTrack`.
//
// Phones get seven dots sharing the rail (each at least 24 px wide with a
// 44 px-tall hit area and no gaps); from a 36rem container the rail shows
// numbers and short names. Buttons and keys scroll only the track.

export type Step = { name: string; content: ReactNode };

// The rail's fills: the site accent, or a product's (a fill only, never
// text: the current step's number turns fg instead).
const tones = {
  accent: {
    fill: "bg-accent",
    soft: "bg-accent-soft",
    number: "group-aria-selected:text-accent",
  },
  menumesh: {
    fill: "bg-menumesh",
    soft: "bg-menumesh/20",
    number: "group-aria-selected:text-fg",
  },
};

const pad = (n: number) => String(n).padStart(2, "0");

export function Stepper({
  id,
  label,
  steps,
  current,
  labels,
  trackRef,
  onGo,
  tone = "accent",
}: {
  /** Prefix for the tab and panel ids. */
  id: string;
  /** The rail's and the track's accessible name. */
  label: string;
  steps: Step[];
  current: number;
  labels: { previous: string; next: string };
  trackRef?: Ref<HTMLDivElement>;
  /** Live version only: go to a step. */
  onGo?: (step: number) => void;
  tone?: keyof typeof tones;
}) {
  const last = steps.length - 1;
  const t = tones[tone];
  const keys =
    onGo &&
    ((event: KeyboardEvent<HTMLElement>) => {
      const tabs = event.currentTarget.getAttribute("role") === "tablist";
      const to = {
        ArrowRight: current + 1,
        ArrowLeft: current - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (to === undefined) return;
      // No keyboard scrolling of the track either way.
      event.preventDefault();
      // Keys on a control inside a step (the language toggle) stay there:
      // changing step would make its panel inert and drop the focus.
      if (!tabs && event.target !== event.currentTarget) return;
      const step = Math.max(0, Math.min(last, to));
      onGo(step);
      if (tabs)
        event.currentTarget
          .querySelectorAll<HTMLElement>('[role="tab"]')
          [step]?.focus({ preventScroll: true });
    });

  return (
    <div className="@container flex flex-col gap-4">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={keys}
        className="relative flex"
        style={{ "--n": steps.length } as CSSProperties}
      >
        {/* The line from the first dot to the last, and how far along it we are. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[calc(50%/var(--n))] top-5.5 h-px bg-border-strong"
        />
        <span
          aria-hidden="true"
          className={cx(
            "pointer-events-none absolute inset-x-[calc(50%/var(--n))] top-5.5 h-px origin-left transition-transform duration-(--duration-slow) ease-out motion-reduce:transition-none",
            t.fill,
          )}
          style={{ transform: `scaleX(${current / last})` }}
        />
        {steps.map((step, i) => (
          <button
            key={step.name}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-step-${i}`}
            aria-selected={i === current}
            tabIndex={i === current ? 0 : -1}
            onClick={onGo && (() => onGo(i))}
            className="group relative flex min-h-11 min-w-6 flex-1 flex-col items-center gap-2 rounded-sm pt-4 pb-1"
          >
            <span
              aria-hidden="true"
              className="relative size-3 rounded-full border border-border-strong bg-bg"
            >
              <span
                className={cx(
                  "absolute -inset-1.5 rounded-full transition-[opacity,transform] duration-(--duration-base) ease-out motion-reduce:transition-none",
                  t.soft,
                  i === current ? "opacity-100" : "scale-50 opacity-0",
                )}
              />
              <span
                className={cx(
                  "absolute -inset-px rounded-full transition-[opacity,transform] duration-(--duration-base) ease-out motion-reduce:transition-none",
                  t.fill,
                  i <= current ? "opacity-100" : "scale-50 opacity-0",
                )}
              />
            </span>
            <span className="sr-only @xl:not-sr-only @xl:flex @xl:flex-col @xl:items-center @xl:gap-0.5 @xl:px-1 @xl:text-center">
              <span
                className={cx(
                  "font-mono text-mono-label text-fg-subtle",
                  t.number,
                )}
              >
                {pad(i + 1)}
              </span>{" "}
              <span className="text-small text-fg-muted transition-ui group-hover:text-fg group-aria-selected:text-fg">
                {step.name}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={keys}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-md [scrollbar-width:none] focus-visible:outline-offset-[-2px] [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((step, i) => (
          <div
            key={step.name}
            role="tabpanel"
            id={`${id}-step-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            // The poster leaves every step readable; live, only the current one.
            inert={onGo ? i !== current : undefined}
            className="w-full shrink-0 snap-start snap-always"
          >
            {step.content}
          </div>
        ))}
      </div>

      {/* Below an 18rem container (320 px screens) the buttons keep only
          their icons; the label stays as their name. */}
      <div className="flex items-center justify-between gap-3">
        <Button
          aria-disabled={current === 0}
          onClick={onGo && (() => current > 0 && onGo(current - 1))}
          className="pl-3.5 aria-disabled:cursor-default aria-disabled:opacity-40 @max-2xs:w-12 @max-2xs:px-0"
        >
          <ChevronLeft aria-hidden="true" className="size-4 shrink-0" />
          <span className="@max-2xs:sr-only">{labels.previous}</span>
        </Button>
        <p
          aria-live="polite"
          className="font-mono text-mono-label whitespace-nowrap text-fg-subtle tabular-nums"
        >
          <span className="text-fg">{pad(current + 1)}</span> /{" "}
          {pad(steps.length)}
          <span className="sr-only"> {steps[current]?.name}</span>
        </p>
        <Button
          aria-disabled={current === last}
          onClick={onGo && (() => current < last && onGo(current + 1))}
          className="pr-3.5 aria-disabled:cursor-default aria-disabled:opacity-40 @max-2xs:w-12 @max-2xs:px-0"
        >
          <span className="@max-2xs:sr-only">{labels.next}</span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Follows a stepper's track: reports the step a swipe or scroll settles
 * on, and scrolls the track (never the page) to a step. Returns `go` and
 * a cleanup.
 */
export function followTrack(
  track: HTMLElement,
  onStep: (step: number) => void,
) {
  let shown = 0;
  // While a button's smooth scroll passes other steps, keep its target.
  let target: number | null = null;
  const onScroll = () => {
    if (!track.clientWidth) return;
    const step = Math.round(track.scrollLeft / track.clientWidth);
    if (target !== null) {
      if (step !== target) return;
      target = null;
    }
    if (step !== shown) onStep((shown = step));
  };
  const release = () => (target = null);
  track.addEventListener("scroll", onScroll, { passive: true });
  track.addEventListener("pointerdown", release);
  track.addEventListener("wheel", release, { passive: true });
  return {
    go(step: number, smooth: boolean) {
      target = shown = step;
      track.scrollTo({
        left: step * track.clientWidth,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    stop() {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("pointerdown", release);
      track.removeEventListener("wheel", release);
    },
  };
}
