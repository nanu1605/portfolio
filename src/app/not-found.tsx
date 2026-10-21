import type { Metadata } from "next";
import { microcopy } from "@content/microcopy";
import { Button } from "@/components/ui/button";

const copy = microcopy.notFound;

export const metadata: Metadata = { title: copy.title };

// A VYRO-style dial (§6.3): a 270° sweep around (100, 100) with the gap at
// the bottom. The needle drops to zero with a CSS keyframe (globals.css),
// and sits at zero under reduced motion.
const C = 100;
const R = 80;
const at = (pct: number, r: number) => {
  const a = ((-135 + 2.7 * pct) * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)].map(
    (n) => Math.round(n * 100) / 100,
  );
};
const [ax, ay] = at(0, R);
const [bx, by] = at(100, R);
const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

function Gauge() {
  return (
    <svg
      viewBox="0 0 200 174"
      aria-hidden="true"
      focusable="false"
      className="block h-auto w-60 overflow-visible md:w-80"
    >
      <path
        d={`M${ax} ${ay}A${R} ${R} 0 1 1 ${bx} ${by}`}
        strokeWidth={10}
        className="fill-none stroke-border"
      />
      {ticks.map((t) => {
        const major = t % 20 === 0;
        const [x1, y1] = at(t, major ? 62 : 66);
        const [x2, y2] = at(t, 70);
        return (
          <line
            key={t}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={major ? 1.5 : 1}
            className={major ? "stroke-fg-subtle" : "stroke-border-strong"}
          />
        );
      })}
      <line
        x1={C}
        y1={C - 30}
        x2={C}
        y2={C - 74}
        strokeWidth={3}
        strokeLinecap="round"
        data-needle-drop=""
        className="stroke-vyro"
      />
      <circle cx={C} cy={C} r={5} className="fill-fg" />
      <text
        x={C}
        y={C + 34}
        textAnchor="middle"
        fontSize={22}
        className="fill-fg font-mono"
      >
        0
      </text>
      <text
        x={C}
        y={C + 52}
        textAnchor="middle"
        fontSize={10}
        className="fill-fg-subtle font-mono uppercase"
      >
        RPM
      </text>
    </svg>
  );
}

/** 404 (§8.12, A.13): the needle drops to zero. Centred below the header. */
export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100svh-var(--header-h))] items-center justify-center px-page py-16">
      <div className="flex w-full max-w-text flex-col items-center gap-6 text-center">
        <Gauge />
        <h1 className="text-h1">{copy.title}</h1>
        <p className="text-body-lg text-fg-muted">{copy.body}</p>
        <Button href="/" variant="primary" className="w-full sm:w-auto">
          {copy.button}
        </Button>
        {/* Touch readers have no keyboard shortcut; the header's search
            button stays (cross-device §3). */}
        <p className="hidden text-small text-fg-subtle any-pointer-fine:block">
          {copy.hint}
        </p>
      </div>
    </div>
  );
}
