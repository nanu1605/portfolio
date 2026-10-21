import type { KeyboardEvent, MouseEvent, Ref } from "react";
import type { MlopsCopy } from "@content/centerpieces/mlops-drift-loop";
import { cx } from "@/lib/cx";

// §10.7 "Watch it recover": the view of one scrub step, with no hooks, so
// the server poster (the final step) and the live version render the same
// box. live.tsx turns the scroll position into a step. The line is straight
// segments between the exported points; nothing is smoothed or added.

export type Point = { f1: number; version: "1" | "2" };

export type MlopsData = {
  points: Point[];
  /** The last v1 batch (0-based): drift and promotion share its controller tick. */
  tick: number;
  copy: MlopsCopy;
};

export type MlopsState = {
  /** How far the scrub has got: 0 (nothing drawn) to `steps(data)`. */
  step: number;
  /** A batch picked by key or tap; the line is drawn at least that far. */
  selected?: number;
  /** Whether the polite live region speaks (not for the state at mount). */
  speak?: boolean;
};

export type MlopsHandlers = {
  svg: Ref<SVGSVGElement>;
  onKey: (e: KeyboardEvent<HTMLDivElement>) => void;
  onPick: (e: MouseEvent<HTMLDivElement>) => void;
};

/**
 * At the tick the line holds on the last v1 batch while the loop lights
 * Detect, Retrain, Gate and Reload, one step each.
 */
const DWELL = 4;
export const steps = (d: MlopsData) => d.points.length + DWELL;
/** The first step that shows batch `i`. */
const stepOf = (d: MlopsData, i: number) =>
  i <= d.tick ? i + 1 : i + 1 + DWELL;

/** Batches drawn, and the loop's stage: 0 serving v1, 1–4 Detect…Reload, 5 serving v2. */
export function progress(d: MlopsData, step: number) {
  const reach = d.tick + 1;
  if (step <= reach) return { shown: step, stage: 0 };
  if (step <= reach + DWELL) return { shown: reach, stage: step - reach };
  return { shown: step - DWELL, stage: DWELL + 1 };
}

// The plot in viewBox units; text scales with it (--chart-font).
const W = 360;
const H = 250;
const pad = { l: 46, r: 14, t: 34, b: 38 };
const text = { fontSize: "var(--chart-font, 10px)" };
const sy = (f1: number) => H - pad.b - f1 * (H - pad.t - pad.b);

const scale = (n: number) => (i: number) =>
  pad.l + (i / (n - 1)) * (W - pad.l - pad.r);

/** The batch nearest to a viewBox x. */
export function batchAt(d: MlopsData, x: number) {
  const n = d.points.length;
  const i = Math.round(((x - pad.l) / (W - pad.l - pad.r)) * (n - 1));
  return Math.min(n - 1, Math.max(0, i));
}

type XY = readonly [number, number];
/** Length along a polyline at each of its points. */
const along = (pts: XY[]) =>
  pts.map((_, i) =>
    pts
      .slice(1, i + 1)
      .reduce(
        (sum, p, j) => sum + Math.hypot(p[0] - pts[j]![0], p[1] - pts[j]![1]),
        0,
      ),
  );

const fill = (s: string, values: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k]));

const glide =
  "transition-[transform,opacity] duration-(--duration-base) ease-out motion-reduce:transition-none";
const draw =
  "transition-[stroke-dashoffset] duration-(--duration-base) ease-out motion-reduce:transition-none";
const fade =
  "transition-opacity duration-(--duration-base) ease-out motion-reduce:transition-none";
const label = "font-mono text-mono-label uppercase text-fg-subtle";

/** A polyline drawn `drawn` units along by its dash, so the draw can glide. */
function Drawn({
  pts,
  drawn,
  className,
}: {
  pts: XY[];
  drawn: number;
  className: string;
}) {
  const dash = along(pts).at(-1)! + 1;
  return (
    <polyline
      points={pts.map((p) => p.join(",")).join(" ")}
      strokeLinejoin="round"
      style={{ strokeDasharray: dash, strokeDashoffset: dash - drawn }}
      className={cx("fill-none stroke-2", draw, className)}
    />
  );
}

/** v1 a hollow circle, v2 a filled square: never colour alone. */
function Marker({
  version,
  x,
  y,
}: {
  version: Point["version"];
  x: number;
  y: number;
}) {
  return version === "1" ? (
    <circle
      cx={x}
      cy={y}
      r={3.5}
      className="fill-surface stroke-fg-muted stroke-[1.5]"
    />
  ) : (
    <rect
      x={x - 3.5}
      y={y - 3.5}
      width={7}
      height={7}
      className="fill-accent"
    />
  );
}

function Chart({
  data,
  shown,
  stage,
  selected,
  svg,
}: {
  data: MlopsData;
  shown: number;
  stage: number;
  selected?: number;
  svg?: Ref<SVGSVGElement>;
}) {
  const { points, tick, copy } = data;
  const sx = scale(points.length);
  const xy = points.map((p, i): XY => [sx(i), sy(p.f1)]);
  // v1 up to the tick, then v2 from the last v1 point on.
  const v1 = xy.slice(0, tick + 1);
  const v2 = xy.slice(tick);
  const drawn1 = shown > 0 ? along(v1)[Math.min(shown, tick + 1) - 1]! : 0;
  const drawn2 = shown > tick + 1 ? along(v2)[shown - 1 - tick]! : 0;
  const tx = (sx(tick) + sx(tick + 1)) / 2;
  const xTicks = points
    .map((_, i) => i)
    .filter((i) => i === 0 || (i + 1) % 5 === 0);
  const pick = selected === undefined ? undefined : xy[selected];

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      className="mlops-plot block h-auto w-full"
    >
      <g style={text} className="fill-fg-subtle font-mono">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={sy(f)}
              y2={sy(f)}
              className="stroke-border"
            />
            <text x={pad.l - 6} y={sy(f) + 3.5} textAnchor="end">
              {f}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={sx(i)} y={H - pad.b + 15} textAnchor="middle">
            {i + 1}
          </text>
        ))}
        <text x={(pad.l + W - pad.r) / 2} y={H - 4} textAnchor="middle">
          {copy.axes.x}
        </text>
        <text
          transform={`translate(13 ${(pad.t + H - pad.b) / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          {copy.axes.y}
        </text>
      </g>

      {/* The controller tick after the last v1 batch: both events, stacked. */}
      <line
        x1={tx}
        x2={tx}
        y1={4}
        y2={H - pad.b}
        strokeDasharray="3 3"
        className="stroke-border-strong"
      />
      <g style={text} className="font-mono">
        <text
          x={tx + 5}
          y={14}
          className={cx("fill-warn", fade, stage < 1 && "opacity-0")}
        >
          {copy.events.drift}
        </text>
        <text
          x={tx + 5}
          y={28}
          className={cx("fill-accent", fade, stage < 3 && "opacity-0")}
        >
          {copy.events.promoted}
        </text>
      </g>

      <Drawn pts={v1} drawn={drawn1} className="stroke-fg-muted" />
      <Drawn pts={v2} drawn={drawn2} className="stroke-accent" />
      {points.map((p, i) => (
        <g
          key={i}
          data-point={i + 1}
          className={cx(fade, i >= shown && "opacity-0")}
        >
          <Marker version={p.version} x={xy[i]![0]} y={xy[i]![1]} />
        </g>
      ))}
      {pick && (
        <circle
          r={8}
          style={{ transform: `translate(${pick[0]}px, ${pick[1]}px)` }}
          className={cx("fill-none stroke-fg stroke-2", glide)}
        />
      )}
    </svg>
  );
}

/** Each loop node: lit while it runs, ticked once it has run this cycle. */
function nodeState(i: number, stage: number) {
  if (i < 2) return "on"; // Serve and Monitor run throughout
  if (stage > DWELL) return "done";
  return i - 1 <= stage ? "on" : "off";
}

function Loop({
  copy,
  stage,
  speak,
}: {
  copy: MlopsCopy;
  stage: number;
  speak?: boolean;
}) {
  const current = stage === 0 || stage > DWELL ? 0 : stage + 1;
  const statuses = [copy.status.before, copy.status.during, copy.status.after];
  const status = stage === 0 ? 0 : stage > DWELL ? 2 : 1;
  return (
    <div className="flex flex-col gap-3">
      <p id="mlops-loop" className={label}>
        {copy.loopLabel}
      </p>
      <ol aria-labelledby="mlops-loop" className="mlops-nodes grid gap-2">
        {copy.loop.map((name, i) => {
          const state = nodeState(i, stage);
          return (
            <li
              key={name}
              data-node={name}
              data-state={state}
              aria-current={i === current ? "step" : undefined}
              className={cx(
                "flex min-h-11 items-center gap-1.5 rounded-md border px-2 text-small @md:gap-2 @md:px-3",
                state === "on"
                  ? "border-accent text-fg"
                  : state === "done"
                    ? "border-border text-fg-muted"
                    : "border-border text-fg-subtle",
              )}
            >
              <span
                aria-hidden="true"
                className="relative size-2.5 shrink-0 rounded-full border border-border-strong"
              >
                <span
                  className={cx(
                    "absolute -inset-px rounded-full bg-accent",
                    fade,
                    state !== "on" && "opacity-0",
                  )}
                />
              </span>
              {name}
              {state === "done" && (
                <svg
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                  className="ml-auto size-3 shrink-0"
                >
                  <path
                    d="M2.5 6.5 5 9l4.5-6"
                    className="fill-none stroke-accent stroke-[1.5]"
                  />
                </svg>
              )}
              {i === 0 && (
                <span className="ml-auto hidden font-mono text-mono-label text-fg-subtle @md:inline">
                  {stage > DWELL
                    ? copy.versions["2"].short
                    : copy.versions["1"].short}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {/* All three in one cell, so the box keeps the longest's height. */}
      <div aria-hidden="true" className="grid text-small text-fg-muted">
        {statuses.map((s, i) => (
          <p
            key={i}
            className={cx("[grid-area:1/1]", fade, i !== status && "opacity-0")}
          >
            {s}
          </p>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {speak ? statuses[status] : ""}
      </p>
    </div>
  );
}

export function MlopsView({
  data,
  state,
  on,
}: {
  data: MlopsData;
  state: MlopsState;
  /** Absent on the poster. */
  on?: MlopsHandlers;
}) {
  const { points, copy } = data;
  const { selected } = state;
  const step = Math.max(
    state.step,
    selected === undefined ? 0 : stepOf(data, selected),
  );
  const { shown, stage } = progress(data, step);
  const cur = selected ?? (shown > 0 ? shown - 1 : undefined);
  const p = cur === undefined ? undefined : points[cur];
  const v = p && copy.versions[p.version];
  const valuetext = (i: number) => {
    const b = points[i]!;
    const ver = copy.versions[b.version];
    return fill(copy.valuetext, {
      n: i + 1,
      total: points.length,
      f1: b.f1.toFixed(2),
      version: `${ver.short}, ${ver.name.toLowerCase()}`,
    });
  };

  return (
    <div className="@container bg-surface">
      {/* The loop's place (above, below or beside the chart) is in mlops.css. */}
      <div className="mlops-split gap-6 p-4 @lg:p-6">
        <div className="@container flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p
              data-readout={cur === undefined ? "" : cur + 1}
              className="flex flex-wrap gap-x-4 font-mono text-small text-fg tabular-nums"
            >
              <span>
                <span className="text-fg-subtle">{copy.batch}</span>{" "}
                {cur === undefined ? "--" : String(cur + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="text-fg-subtle">{copy.table.f1}</span>{" "}
                {p ? p.f1.toFixed(2) : "--"}
              </span>
              <span>
                {v ? v.short : "--"}
                {v && <span className="hidden @md:inline"> · {v.name}</span>}
              </span>
            </p>
            <p className="text-small text-fg-subtle">{copy.hint}</p>
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label={copy.slider}
            aria-valuemin={1}
            aria-valuemax={points.length}
            aria-valuenow={(cur ?? 0) + 1}
            aria-valuetext={valuetext(cur ?? 0)}
            onKeyDown={on?.onKey}
            onClick={on?.onPick}
            // Chart text in viewBox units, sized by the column's width so
            // it reads at about 10–15 px.
            className="cursor-pointer touch-manipulation rounded-md [--chart-font:12.5px] @xs:[--chart-font:10.5px] @md:[--chart-font:9px] @2xl:[--chart-font:8px]"
          >
            <Chart
              data={data}
              shown={shown}
              stage={stage}
              selected={selected}
              svg={on?.svg}
            />
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-mono-label text-fg-muted">
            {(["1", "2"] as const).map((version) => (
              <li key={version} className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 8"
                  aria-hidden="true"
                  className="w-6 shrink-0"
                >
                  <line
                    x1="0"
                    y1="4"
                    x2="24"
                    y2="4"
                    className={cx(
                      "stroke-2",
                      version === "1" ? "stroke-fg-muted" : "stroke-accent",
                    )}
                  />
                  <Marker version={version} x={12} y={4} />
                </svg>
                {copy.versions[version].short} · {copy.versions[version].name}
              </li>
            ))}
          </ul>
        </div>
        <div className="mlops-loop">
          <Loop copy={copy} stage={stage} speak={state.speak} />
        </div>
      </div>
    </div>
  );
}
