import { ChevronsUpDown } from "lucide-react";
import type {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";
import type { ReservoirCopy } from "@content/centerpieces/reservoir-rl";
import { Chip } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { Scatter, type ScatterPoint } from "@/components/viz/charts";
import { cx } from "@/lib/cx";

// §10.5 "Weight mixer": the view of one state, with no hooks, so the
// server poster and the live version render the same box. live.tsx owns
// the state and the handlers.

export const KEYS = ["flood", "supply", "eco"] as const;
type Key = (typeof KEYS)[number];
type MeanSd = readonly [number, number];
export type Weights = readonly [number, number, number];
export type Penalties = Record<Key, MeanSd>;
export type Agent = Penalties & {
  name: string;
  seed: number;
  weights: Weights;
  /** "flood_focused · seed 42" */
  label: string;
  /** What the polite live region says when this agent is selected. */
  announce: string;
};

export type ReservoirData = {
  agents: Agent[];
  rule: Penalties;
  /** The separate balanced run (seed 42), nominal and in a drier climate. */
  headline: {
    nominal: Penalties;
    drier: Penalties;
    definition: string;
    title: string;
    /** Its own results file, apart from the agents' (the figure's source). */
    source: { href: string; label: string };
  };
  /** Bar scales: the largest mean + sd on each penalty. */
  max: Record<Key, number>;
  axes: Record<Key, { label: string; max: number }>;
  copy: ReservoirCopy;
  limitsHref: string;
};

export type ReservoirState = {
  cursor: Weights;
  selected: number;
  drier: boolean;
  /** "glide" eases the cursor to a chosen agent; "drag" follows the pointer. */
  moving?: "glide" | "drag";
};

export type ReservoirHandlers = {
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLDivElement>) => void;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
  onKey: (e: KeyboardEvent<HTMLDivElement>) => void;
  onSelect: (e: ChangeEvent<HTMLSelectElement>) => void;
  onDrier: () => void;
};

// The triangle in viewBox units: Flood at the top, Supply bottom left,
// Ecology bottom right. A point is the weights' mix of the corners, so
// distance on screen is distance in weight space.
export const TW = 360;
export const TH = 330;
export const SIDE = 300;
const HT = (SIDE * Math.sqrt(3)) / 2;
const TOP = { x: TW / 2, y: 30 };
const BL = { x: (TW - SIDE) / 2, y: TOP.y + HT };
const BR = { x: BL.x + SIDE, y: BL.y };

export const toXY = ([f, s, e]: Weights) => ({
  x: f * TOP.x + s * BL.x + e * BR.x,
  y: f * TOP.y + s * BL.y + e * BR.y,
});

/** A viewBox point to weights, pulled back inside the triangle. */
export function toWeights(x: number, y: number): Weights {
  const f = (BL.y - y) / HT;
  const e = (x - BL.x - f * (TOP.x - BL.x)) / SIDE;
  const raw = [f, 1 - f - e, e].map((v) => Math.max(0, v));
  const sum = raw[0]! + raw[1]! + raw[2]!;
  return [raw[0]! / sum, raw[1]! / sum, raw[2]! / sum];
}

/** The trained agent nearest a mix, by Euclidean distance in weight space. */
export function nearest(agents: Agent[], w: Weights) {
  let best = 0;
  let bestD = Infinity;
  agents.forEach((a, i) => {
    const d = a.weights.reduce((sum, v, k) => sum + (v - w[k]!) ** 2, 0);
    if (d < bestD) [best, bestD] = [i, d];
  });
  return best;
}

const glide =
  "transition-transform duration-(--duration-base) ease-out motion-reduce:transition-none";
const label = "font-mono text-mono-label uppercase text-fg-subtle";
const pm = ([m, sd]: MeanSd) => `${m.toFixed(1)} ± ${sd.toFixed(1)}`;
const pts = (p: { x: number; y: number }) => `${p.x},${p.y}`;

/** Ternary grid lines at a quarter, a half and three quarters of each weight. */
const grid = [0.25, 0.5, 0.75].flatMap((k) => [
  [toXY([k, 1 - k, 0]), toXY([k, 0, 1 - k])],
  [toXY([1 - k, k, 0]), toXY([0, k, 1 - k])],
  [toXY([1 - k, 0, k]), toXY([0, 1 - k, k])],
]);

export function ReservoirView({
  data,
  state,
  on,
}: {
  data: ReservoirData;
  state: ReservoirState;
  /** Absent on the poster. */
  on?: ReservoirHandlers;
}) {
  const { agents, copy, headline } = data;
  const agent = agents[state.selected]!;
  const cursor = toXY(state.cursor);
  const target = toXY(agent.weights);
  const [f, s, e] = state.cursor.map((v) => v.toFixed(2));
  const series = state.drier
    ? [
        { label: copy.nominal, p: headline.nominal, tone: "bg-accent" },
        { label: copy.drier, p: headline.drier, tone: "bg-warn" },
      ]
    : [
        { label: agent.name, p: agent as Penalties, tone: "bg-accent" },
        { label: copy.rule, p: data.rule, tone: "bg-fg-subtle" },
      ];
  const points = (x: Key, y: Key): ScatterPoint[] => [
    ...agents.map((a) => ({
      name: a.name,
      x: a[x][0],
      y: a[y][0],
      sd: { x: a[x][1], y: a[y][1] },
    })),
    { name: copy.rule, x: data.rule[x][0], y: data.rule[y][0], mark: "star" },
  ];

  return (
    <div className="@container bg-surface">
      <div className="grid gap-8 p-4 [--chart-font:12px] @lg:p-6 @2xl:grid-cols-2 @2xl:[--chart-font:11px] @4xl:grid-cols-[5fr_6fr] @4xl:gap-x-10 @4xl:[--chart-font:9.5px]">
        <div className="flex flex-col gap-4 @4xl:sticky @4xl:top-[calc(var(--header-h)+1.5rem)] @4xl:row-span-2 @4xl:self-start">
          <label className="flex flex-col gap-2">
            <span className={label}>{copy.agent}</span>
            <span className="relative">
              <select
                {...(on
                  ? { value: state.selected, onChange: on.onSelect }
                  : { defaultValue: state.selected })}
                className="min-h-11 w-full cursor-pointer appearance-none rounded-md border border-border-strong bg-bg py-2 pr-10 pl-3 text-body text-fg transition-ui hover:bg-surface-2"
              >
                {agents.map((a, i) => (
                  <option key={a.name} value={i}>
                    {a.label}
                  </option>
                ))}
              </select>
              <ChevronsUpDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
              />
            </span>
          </label>
          <dl className="grid grid-cols-3 gap-px overflow-clip rounded-md border border-border bg-border">
            {KEYS.map((k, i) => (
              <div
                key={k}
                className="flex flex-col gap-0.5 bg-surface px-3 py-2"
              >
                <dt className={label}>{copy.corners[k]}</dt>
                <dd className="font-mono text-small text-fg tabular-nums">
                  {agent.weights[i]!.toFixed(2)}
                </dd>
              </div>
            ))}
          </dl>
          <div
            onPointerDown={on?.onPointerDown}
            onPointerMove={on?.onPointerMove}
            onPointerUp={on?.onPointerUp}
            onPointerCancel={on?.onPointerUp}
            onClick={on?.onClick}
            data-triangle=""
            className="relative cursor-crosshair touch-pan-y touch-pinch-zoom overflow-clip select-none"
          >
            <svg
              viewBox={`0 0 ${TW} ${TH}`}
              aria-hidden="true"
              className="block h-auto w-full"
            >
              <polygon
                points={[TOP, BL, BR].map(pts).join(" ")}
                className="fill-bg stroke-border-strong"
                strokeLinejoin="round"
              />
              {grid.map(([a, b], i) => (
                <line
                  key={i}
                  x1={a!.x}
                  y1={a!.y}
                  x2={b!.x}
                  y2={b!.y}
                  className="stroke-border"
                />
              ))}
              <g
                style={{ fontSize: "var(--chart-font)" }}
                className="fill-fg-muted font-mono tracking-wider uppercase"
              >
                <text x={TOP.x} y={TOP.y - 12} textAnchor="middle">
                  {copy.corners.flood}
                </text>
                <text x={BL.x} y={BL.y + 22} textAnchor="start">
                  {copy.corners.supply}
                </text>
                <text x={BR.x} y={BR.y + 22} textAnchor="end">
                  {copy.corners.eco}
                </text>
              </g>
              <line
                x1={cursor.x}
                y1={cursor.y}
                x2={target.x}
                y2={target.y}
                strokeDasharray="2 3"
                className="stroke-accent"
              />
              {agents.map((a, i) => {
                const p = toXY(a.weights);
                return (
                  <circle
                    key={a.name}
                    cx={p.x}
                    cy={p.y}
                    r={4.5}
                    className={cx(
                      "stroke-bg stroke-2",
                      i === state.selected ? "fill-accent" : "fill-fg-muted",
                    )}
                  />
                );
              })}
              <circle
                r={10}
                style={{ transform: `translate(${target.x}px, ${target.y}px)` }}
                className={cx("fill-none stroke-accent stroke-2", glide)}
              />
            </svg>
            {/* A layer the size of the box, moved by a percentage of its
                own size: the cursor glides by transform alone. */}
            <div
              className={cx(
                "pointer-events-none absolute inset-0",
                state.moving === "glide" && glide,
              )}
              style={{
                transform: `translate(${(cursor.x / TW) * 100}%, ${(cursor.y / TH) * 100}%)`,
              }}
            >
              <div
                data-handle=""
                role="slider"
                tabIndex={0}
                aria-label={copy.picker}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(state.cursor[0] * 100)}
                aria-valuetext={`${copy.corners.flood} ${f}, ${copy.corners.supply} ${s}, ${copy.corners.eco} ${e}. ${copy.agent}: ${agent.label}`}
                onKeyDown={on?.onKey}
                className="group pointer-events-auto absolute top-0 left-0 grid size-11 -translate-1/2 cursor-grab touch-none place-items-center rounded-full active:cursor-grabbing"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "grid size-5 place-items-center rounded-full border-2 border-accent bg-surface transition-transform duration-(--duration-fast) ease-out group-active:scale-125 motion-reduce:transition-none",
                    state.moving === "drag" && "scale-125",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-accent" />
                </span>
              </div>
            </div>
          </div>
          <p className="text-small text-fg-subtle">{copy.hint}</p>
          <p aria-live="polite" className="sr-only">
            {agent.announce}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Nothing above the toggle changes, so it stays under the finger. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-mono-label text-fg-subtle uppercase">
              {copy.scale}
            </p>
            <Chip pressed={state.drier} onClick={on?.onDrier}>
              {copy.drier}
            </Chip>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-small font-semibold text-fg">
              {state.drier
                ? headline.title
                : `${agent.name} ${copy.versus} ${copy.rule}`}
            </p>
            {state.drier && (
              <p className="font-mono text-mono-label text-fg-subtle">
                {`${copy.drier}: ${headline.definition} `}
                <TextLink href={headline.source.href}>
                  {headline.source.label}
                </TextLink>
              </p>
            )}
          </div>
          {KEYS.map((k) => (
            <div key={k} className="flex flex-col gap-2">
              <p className="text-small text-fg-muted">{copy.penalties[k]}</p>
              {series.map((row, i) => {
                const [m, sd] = row.p[k];
                const lo = Math.max(0, m - sd) / data.max[k];
                const hi = (m + sd) / data.max[k];
                return (
                  // By position, so a bar glides when its series changes.
                  <div key={i}>
                    <p className="flex items-baseline justify-between gap-3 font-mono text-mono-label">
                      <span className="min-w-0 truncate text-fg-muted">
                        {row.label}
                      </span>
                      <span className="shrink-0 text-fg tabular-nums">
                        {pm(row.p[k])}
                      </span>
                    </p>
                    <div
                      aria-hidden="true"
                      className="relative mt-1.5 h-2 bg-surface-2"
                    >
                      <span
                        className={cx(
                          "absolute inset-0 origin-left",
                          row.tone,
                          glide,
                        )}
                        style={{ transform: `scaleX(${m / data.max[k]})` }}
                      />
                      <span
                        className={cx(
                          "absolute inset-x-0 top-1/2 h-px origin-left bg-fg",
                          glide,
                        )}
                        style={{
                          transform: `translateX(${lo * 100}%) scaleX(${hi - lo})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="grid gap-6 @2xl:col-span-2 @2xl:grid-cols-2 @4xl:col-span-1 @4xl:grid-cols-1">
          <Scatter
            points={points("flood", "supply")}
            x={data.axes.flood}
            y={data.axes.supply}
            label={copy.charts.floodSupply}
            selected={agent.name}
          />
          <Scatter
            points={points("supply", "eco")}
            x={data.axes.supply}
            y={data.axes.eco}
            label={copy.charts.supplyEco}
            selected={agent.name}
          />
          <p className="text-small text-fg-muted @2xl:col-span-2 @4xl:col-span-1">
            {copy.footnote.before}
            <a
              href={data.limitsHref}
              className="text-accent underline decoration-1 underline-offset-[0.2em] transition-ui hover:text-accent-strong"
            >
              {copy.footnote.link}
            </a>
            {copy.footnote.after}
          </p>
        </div>
      </div>
    </div>
  );
}
