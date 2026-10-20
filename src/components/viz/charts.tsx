import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

// Static, themed SVG charts redrawn from Appendix B (Phase 4). Colours come
// from token classes, and every series also differs by shape or dash, so
// nothing relies on colour alone. Each full chart sits next to a "View
// data" table; `mini` drops axes and labels for the Work card covers.

const W = 360;
const H = 260;
// Chart text is sized in viewBox units, so it scales with the chart.

const ticks = (max: number) => [0, max / 2, max];
const fmt = (v: number) => String(Math.round(v * 100) / 100);

function Axes({
  x,
  y,
  pad,
}: {
  x: { label: string; max: number; sx: (v: number) => number };
  y: { label: string; max: number; sy: (v: number) => number };
  pad: { l: number; r: number; t: number; b: number };
}) {
  return (
    <g fontSize={10} className="fill-fg-subtle font-mono">
      {ticks(x.max).map((t) => (
        <g key={`x${t}`}>
          <line
            x1={x.sx(t)}
            x2={x.sx(t)}
            y1={pad.t}
            y2={H - pad.b}
            className="stroke-border"
          />
          <text x={x.sx(t)} y={H - pad.b + 14} textAnchor="middle">
            {fmt(t)}
          </text>
        </g>
      ))}
      {ticks(y.max).map((t) => (
        <g key={`y${t}`}>
          <line
            x1={pad.l}
            x2={W - pad.r}
            y1={y.sy(t)}
            y2={y.sy(t)}
            className="stroke-border"
          />
          <text x={pad.l - 6} y={y.sy(t) + 3} textAnchor="end">
            {fmt(t)}
          </text>
        </g>
      ))}
      <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle">
        {x.label}
      </text>
      <text
        transform={`translate(12 ${(pad.t + H - pad.b) / 2}) rotate(-90)`}
        textAnchor="middle"
      >
        {y.label}
      </text>
    </g>
  );
}

const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const d = i % 2 ? r * 0.45 : r;
    return `${cx + d * Math.cos(a)},${cy + d * Math.sin(a)}`;
  }).join(" ");

export type ScatterPoint = {
  name: string;
  x: number;
  y: number;
  /** `star`: the baseline; `ring`: the highlighted point. */
  mark?: "star" | "ring";
};

/** A scatter of points, baseline as a star. Lower-left is better here. */
export function Scatter({
  points,
  x,
  y,
  label,
  mini = false,
  className,
}: {
  points: ScatterPoint[];
  x: { label: string; max: number };
  y: { label: string; max: number };
  /** The chart's accessible name; its numbers are in the "View data" table. */
  label: string;
  mini?: boolean;
  className?: string;
}) {
  const pad = mini
    ? { l: 24, r: 24, t: 24, b: 24 }
    : { l: 44, r: 16, t: 12, b: 40 };
  const sx = (v: number) => pad.l + (v / x.max) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - (v / y.max) * (H - pad.t - pad.b);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role={mini ? undefined : "img"}
      aria-label={mini ? undefined : label}
      aria-hidden={mini || undefined}
      className={cx("h-auto w-full", className)}
    >
      {!mini && <Axes x={{ ...x, sx }} y={{ ...y, sy }} pad={pad} />}
      {points.map((p) => {
        const px = sx(p.x);
        const py = sy(p.y);
        return (
          <g key={p.name}>
            {p.mark === "star" ? (
              <polygon points={star(px, py, 8)} className="fill-accent" />
            ) : (
              <circle
                cx={px}
                cy={py}
                r={p.mark === "ring" ? 6 : 4.5}
                className={
                  p.mark === "ring"
                    ? "fill-none stroke-accent stroke-2"
                    : "fill-fg-muted"
                }
              />
            )}
            {!mini && p.mark && (
              <text
                // Labels near the right edge sit on the point's left.
                x={px > W * 0.6 ? px - 10 : px + 10}
                y={py - 8}
                textAnchor={px > W * 0.6 ? "end" : "start"}
                fontSize={10}
                className="fill-fg font-mono"
              >
                {p.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export type Line = { name: string; values: number[]; dash?: string };

/**
 * Nominal vs observed coverage against the diagonal (§10.6). The region
 * below the diagonal is shaded and labelled.
 */
export function Reliability({
  levels,
  lines,
  label,
  axes,
  below,
  mini = false,
  className,
}: {
  levels: number[];
  lines: Line[];
  label: string;
  axes: { x: string; y: string };
  /** The shaded region's label: "Overconfident". */
  below: string;
  mini?: boolean;
  className?: string;
}) {
  const S = 300;
  const pad = mini
    ? { l: 20, r: 20, t: 20, b: 20 }
    : { l: 44, r: 12, t: 12, b: 40 };
  const sx = (v: number) => pad.l + v * (S - pad.l - pad.r);
  const sy = (v: number) => S - pad.b - v * (S - pad.t - pad.b);
  const path = (values: number[]) =>
    values.map((v, i) => `${sx(levels[i]!)},${sy(v)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      role={mini ? undefined : "img"}
      aria-label={mini ? undefined : label}
      aria-hidden={mini || undefined}
      className={cx("h-auto w-full", className)}
    >
      <polygon
        points={`${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)}`}
        className="fill-warn/10"
      />
      {!mini && (
        <g fontSize={10} className="fill-fg-subtle font-mono">
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line
                x1={sx(t)}
                x2={sx(t)}
                y1={sy(0)}
                y2={sy(1)}
                className="stroke-border"
              />
              <line
                x1={sx(0)}
                x2={sx(1)}
                y1={sy(t)}
                y2={sy(t)}
                className="stroke-border"
              />
              <text x={sx(t)} y={sy(0) + 14} textAnchor="middle">
                {t}
              </text>
              <text x={sx(0) - 6} y={sy(t) + 3} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          <text x={(sx(0) + sx(1)) / 2} y={S - 6} textAnchor="middle">
            {axes.x}
          </text>
          <text
            transform={`translate(12 ${(sy(0) + sy(1)) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {axes.y}
          </text>
          <text
            x={sx(0.95)}
            y={sy(0.12)}
            textAnchor="end"
            className="fill-warn"
          >
            {below}
          </text>
        </g>
      )}
      <line
        x1={sx(0)}
        y1={sy(0)}
        x2={sx(1)}
        y2={sy(1)}
        strokeDasharray="2 4"
        className="stroke-fg-subtle"
      />
      {lines.map((l, i) => (
        <polyline
          key={l.name}
          points={path(l.values)}
          strokeDasharray={l.dash}
          className={cx(
            "fill-none stroke-2",
            i === lines.length - 1 ? "stroke-accent" : "stroke-fg-muted",
          )}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** The key for dashed lines: a swatch of each dash pattern and its name. */
export function LineKey({ lines }: { lines: Line[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-mono-label text-fg-muted">
      {lines.map((l, i) => (
        <li key={l.name} className="flex items-center gap-2">
          <svg viewBox="0 0 24 4" aria-hidden="true" className="w-6">
            <line
              x1="0"
              y1="2"
              x2="24"
              y2="2"
              strokeDasharray={l.dash}
              className={cx(
                "stroke-2",
                i === lines.length - 1 ? "stroke-accent" : "stroke-fg-muted",
              )}
            />
          </svg>
          {l.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Horizontal bars with their values printed, so the numbers read without
 * the shape. The last bar can be highlighted.
 */
export function Bars({
  rows,
  max,
  highlight,
  className,
}: {
  rows: { label: ReactNode; value: number; text: string }[];
  max: number;
  highlight?: number;
  className?: string;
}) {
  return (
    <dl className={cx("flex flex-col gap-3", className)}>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-[minmax(0,8rem)_1fr] items-center gap-3"
        >
          <dt className="text-small text-fg-muted">{r.label}</dt>
          <dd className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={cx(
                "h-3 rounded-sm",
                i === highlight ? "bg-accent" : "bg-fg-subtle",
              )}
              style={{ width: `${(r.value / max) * 100}%` }}
            />
            <span className="font-mono text-mono-label tabular-nums text-fg">
              {r.text}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
