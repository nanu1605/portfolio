import type { CSSProperties, ReactNode } from "react";
import { forecasting, mlopsLoop } from "@content/charts";
import type { ProjectSlug } from "@content/schema";
import { rlPoints } from "@/components/centerpieces/reservoir-rl";

// §10.10 Home bento micro-demos. Light SVG and CSS, server-rendered and
// decorative: the tile's text and readout carry the meaning, and the only
// numbers shown are real ones (the two documented MLOps levels).
//
// The markup is each demo's final frame. Parts marked .demo-a name their
// keyframes in --k; globals.css ("Bento micro-demos") plays them once from
// the start when a pointer or focus enters the tile, or once the tile is
// half in view on touch (src/lib/touch-effects.ts), then holds.

type Vars = Record<`--${string}`, string | number>;

/** An animated part: its keyframes, delay and duration (ms), and extra vars. */
const play = (k: string, t: number, d: number, vars: Vars = {}) =>
  ({ "--k": k, "--t": `${t}ms`, "--d": `${d}ms`, ...vars }) as CSSProperties;
const inOut: Vars = { "--e": "var(--ease-in-out)" };

const W = 320;
const H = 112;
const label = "fill-fg-subtle font-mono";

/** The compact media strip of a small tile: one drawing, centred. */
function Strip({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-28 justify-center bg-surface bg-grid lg:h-32"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        className="h-full w-full max-w-96 overflow-visible"
      >
        {children}
      </svg>
    </div>
  );
}

const star = (x: number, y: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const d = i % 2 ? r * 0.45 : r;
    return `${(x + d * Math.cos(a)).toFixed(1)},${(y + d * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

/** Reservoir RL: the eight agents and the rule curve pop in; "balanced" pulses. */
function Reservoir() {
  // Supply against ecological deficit on the Work cover's zero-based axes
  // (src/components/work/figures.tsx), so the runs sit where they do there.
  const points = rlPoints("supply", "eco");
  const sx = (v: number) => 32 + (v / 280) * 256;
  const sy = (v: number) => 100 - (v / 25) * 84;
  // Plain dots first, then the rule's star and the balanced ring.
  const ordered = [
    ...points.filter((p) => !p.mark),
    ...points.filter((p) => p.mark),
  ];
  return (
    <Strip>
      <path d="M32 12V100H296" className="stroke-border-strong" />
      {ordered.map((p, i) => {
        const x = sx(p.x);
        const y = sy(p.y);
        const pop = play("demo-pop", 120 + i * 70, 360);
        if (p.mark === "star")
          return (
            <polygon
              key={p.name}
              points={star(x, y, 8)}
              className="demo-a fill-accent"
              style={pop}
            />
          );
        if (p.mark === "ring")
          return (
            <g key={p.name}>
              <circle
                cx={x}
                cy={y}
                r={6}
                className="demo-a stroke-accent opacity-0"
                style={play("demo-pulse", 900, 900, { "--n": 2 })}
              />
              <circle
                cx={x}
                cy={y}
                r={6}
                strokeWidth={2}
                className="demo-a fill-accent-soft stroke-accent"
                style={pop}
              />
            </g>
          );
        return (
          <circle
            key={p.name}
            cx={x}
            cy={y}
            r={4}
            className="demo-a fill-fg-muted"
            style={pop}
          />
        );
      })}
    </Strip>
  );
}

// The shaded region's label (§10.6).
const overconfident = "Overconfident";

/** Forecasting: the best seed's calibration curve draws below the diagonal. */
function Forecasting() {
  const { levels } = forecasting;
  const best = forecasting.calibration_curves.deepar_seed_1337!;
  const sx = (v: number) => 72 + v * 176;
  const sy = (v: number) => 100 - v * 88;
  const curve = best.map((v, i) => `${sx(levels[i]!)},${sy(v)}`).join(" ");
  const last = best.length - 1;
  return (
    <Strip>
      <g className="demo-a" style={play("demo-fade", 0, 500)}>
        <polygon
          points={`${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)}`}
          className="fill-warn/10"
        />
        <text
          x={sx(0.97)}
          y={sy(0.06)}
          fontSize={10}
          textAnchor="end"
          className="fill-warn font-mono"
        >
          {overconfident}
        </text>
      </g>
      <path
        d={`M${sx(0)} ${sy(1)}V${sy(0)}H${sx(1)}`}
        className="stroke-border-strong"
      />
      <line
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(1)}
        y2={sy(1)}
        strokeDasharray="2 4"
        className="stroke-fg-subtle"
      />
      <polyline
        points={curve}
        pathLength={1}
        strokeDasharray="1"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="demo-a stroke-accent"
        style={play("demo-draw", 150, 1400, inOut)}
      />
      <circle
        cx={sx(levels[last]!)}
        cy={sy(best[last]!)}
        r={3.5}
        className="demo-a fill-accent"
        style={play("demo-pop", 1500, 300)}
      />
    </Strip>
  );
}

/** MLOps loop: a schematic step between the two documented F1 levels only. */
function MlopsStep() {
  const { stale_champion_f1: before, after_promotion_f1: after } =
    mlopsLoop.documented_levels;
  const sy = (v: number) => 100 - v * 84;
  const [x0, step, x1] = [48, 156, 272];
  return (
    <Strip>
      <path d={`M32 100H${W - 32}`} className="stroke-border-strong" />
      <path
        d={`M${step} 100V12`}
        strokeDasharray="2 4"
        className="stroke-border-strong"
      />
      <path
        d={`M${x0} ${sy(before)}H${step}`}
        pathLength={1}
        strokeDasharray="1"
        strokeWidth={2}
        strokeLinecap="round"
        className="demo-a stroke-fg-muted"
        style={play("demo-draw", 150, 600)}
      />
      <path
        d={`M${step} ${sy(before)}V${sy(after)}H${x1}`}
        pathLength={1}
        strokeDasharray="1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="demo-a stroke-accent"
        style={play("demo-draw", 800, 800, inOut)}
      />
      <text
        x={x0}
        y={sy(before) - 8}
        fontSize={10}
        className={`demo-a ${label}`}
        style={play("demo-rise", 250, 400)}
      >
        {before}
      </text>
      <text
        x={x1}
        y={sy(after) - 8}
        fontSize={10}
        textAnchor="end"
        className="demo-a fill-fg font-mono"
        style={play("demo-rise", 1400, 400)}
      >
        {after}
      </text>
    </Strip>
  );
}

// §10.10's four steps (the case study's stepper has all seven).
const jainavSteps = ["Order", "Payment", "Invoice", "Licence"];

/** Jainav platform: stepper dots cycling Order → Payment → Invoice → Licence. */
function Stepper() {
  const gap = 72;
  const x = (i: number) => 52 + i * gap;
  const end = jainavSteps.length - 1;
  const D = 2100;
  const rail = `M${x(0)} 48H${x(end)}`;
  return (
    <Strip>
      <path d={rail} className="stroke-border-strong" />
      <path
        d={rail}
        strokeWidth={2}
        className="demo-a stroke-accent"
        style={{ ...play("demo-rail", 150, D, inOut), transformOrigin: "left" }}
      />
      {jainavSteps.map((step, i) => (
        <g key={step}>
          <circle
            cx={x(i)}
            cy={48}
            r={5}
            className="fill-surface stroke-border-strong"
          />
          <circle
            cx={x(i)}
            cy={48}
            r={5}
            className="demo-a fill-accent"
            style={play("demo-pop", 150 + (i * D) / end, 250)}
          />
          <text
            x={x(i)}
            y={80}
            fontSize={10}
            textAnchor="middle"
            className={i === end ? "fill-fg font-mono" : label}
          >
            {step}
          </text>
        </g>
      ))}
      <circle
        cx={x(end)}
        cy={48}
        r={10}
        strokeWidth={1.5}
        className="demo-a stroke-accent"
        style={play("demo-step", 150, D, { ...inOut, "--gap": `${gap}px` })}
      />
    </Strip>
  );
}

/** A floating panel over a large tile's screenshot, dark like the screenshots. */
function Chip({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      data-theme="dark"
      className="absolute bottom-3 left-3 flex h-16 items-center gap-3 rounded-md border border-border bg-bg-raised px-4 depth @md:bottom-4 @md:left-4"
    >
      {children}
    </div>
  );
}

// A resting waveform (relative bar heights).
const wave = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.45, 0.8, 0.4];

/** Baby: a voice orb breathing, with waveform bars. */
function VoiceOrb() {
  return (
    <Chip>
      <span className="relative grid size-9 place-items-center">
        <span
          data-glow=""
          className="demo-a absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,var(--baby),transparent)] opacity-40"
          style={play("demo-halo", 100, 2400, inOut)}
        />
        <span
          className="demo-a size-7 rounded-full bg-baby ring-4 ring-baby/25"
          style={play("demo-breathe", 100, 2400, inOut)}
        />
      </span>
      <span className="flex h-8 items-center gap-0.75">
        {wave.map((h, i) => (
          <span
            key={i}
            className="demo-a w-0.75 rounded-full bg-baby"
            style={{
              height: `${h * 60}%`,
              ...play("demo-wave", 150 + i * 60, 1600, inOut),
            }}
          />
        ))}
      </span>
    </Chip>
  );
}

const C = 32;
const R = 24;
const at = (deg: number, radius: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(C + radius * Math.cos(a)).toFixed(2)} ${(C + radius * Math.sin(a)).toFixed(2)}`;
};
const dial = `M${at(135, R)}A${R} ${R} 0 1 1 ${at(45, R)}`;

/**
 * A 270° dial whose needle sweeps up and settles at `rest` (a fraction of
 * the dial). Decorative: it has no scale and shows no value.
 */
function Dial({ rest, delay }: { rest: number; delay: number }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="size-12">
      <path
        d={dial}
        strokeWidth={4}
        strokeLinecap="round"
        className="stroke-border"
      />
      {Array.from({ length: 11 }, (_, i) => (
        <path
          key={i}
          d={`M${at(135 + i * 27, R - 7)}L${at(135 + i * 27, R - 10)}`}
          className="stroke-fg-subtle"
        />
      ))}
      <path
        d={dial}
        pathLength={100}
        strokeDasharray="100 100"
        strokeWidth={4}
        strokeLinecap="round"
        className="demo-a stroke-vyro"
        style={{
          strokeDashoffset: 100 - rest * 100,
          ...play("demo-arc", delay, 1800, inOut),
        }}
      />
      <path
        d={`M${C} ${C}V${C - R + 5}`}
        strokeWidth={2}
        strokeLinecap="round"
        className="demo-a stroke-fg"
        style={{
          transform: `rotate(${rest * 270 - 135}deg)`,
          transformBox: "view-box",
          transformOrigin: `${C}px ${C}px`,
          ...play("demo-sweep", delay, 1800, inOut),
        }}
      />
      <circle cx={C} cy={C} r={3} className="fill-fg" />
    </svg>
  );
}

/** VYRO: a pair of gauges, as on its dashboard; the needles sweep and settle. */
function Gauges() {
  return (
    <Chip>
      <Dial rest={0.42} delay={100} />
      <Dial rest={0.3} delay={250} />
    </Chip>
  );
}

const strips: Partial<Record<ProjectSlug, () => ReactNode>> = {
  "reservoir-rl": Reservoir,
  "probabilistic-forecasting": Forecasting,
  "mlops-drift-loop": MlopsStep,
  "jainav-platform": Stepper,
};

const chips: Partial<Record<ProjectSlug, () => ReactNode>> = {
  baby: VoiceOrb,
  vyro: Gauges,
};

/**
 * A bento tile's media: a large tile's screenshot (`poster`) with its demo
 * floating over it, or a small tile's compact strip. Null when the project
 * has no demo and no poster.
 */
export function MicroDemo({
  slug,
  poster,
}: {
  slug: ProjectSlug;
  poster?: ReactNode;
}) {
  const Over = chips[slug];
  if (Over && poster)
    return (
      <div className="relative">
        {poster}
        <Over />
      </div>
    );
  const Small = strips[slug];
  return Small ? <Small /> : (poster ?? null);
}

/** Whether a project's tile has a micro-demo to play. */
export const hasDemo = (slug: ProjectSlug) => slug in strips || slug in chips;
