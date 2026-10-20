import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

// Themed SVG charts redrawn from Appendix B. Colours come from token
// classes, and every series also differs by shape or dash, so nothing
// relies on colour alone. Each full chart sits next to a "View data" table;
// `mini` drops axes and labels for the Work card covers. They hold no
// state: the centerpieces (§10) pass a selection in, and what it moves
// glides by transform or fades by opacity (CSS transitions, off under
// reduced motion).

const W = 360;
const H = 260;
// Chart text is sized in viewBox units, so it scales with the chart. A
// container can set --chart-font to keep it readable as the chart shrinks.
const text = { fontSize: "var(--chart-font, 10px)" };

const ticks = (max: number) => [0, max / 2, max];
const fmt = (v: number) => String(Math.round(v * 100) / 100);

/** Places an SVG group by CSS transform, so a change of position can glide. */
const at = (x: number, y: number) => ({
  transform: `translate(${x}px, ${y}px)`,
});
const glide =
  "transition-[transform,opacity] duration-(--duration-base) ease-out motion-reduce:transition-none";

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
    <g style={text} className="fill-fg-subtle font-mono">
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
  /** ± one standard deviation, drawn as whiskers while the point is selected. */
  sd?: { x: number; y: number };
};

/**
 * A scatter of points, baseline as a star. Lower-left is better here.
 * `selected` names a point to fill, ring and label; the ring glides from
 * one selection to the next.
 */
export function Scatter({
  points,
  x,
  y,
  label,
  selected,
  mini = false,
  className,
}: {
  points: ScatterPoint[];
  x: { label: string; max: number };
  y: { label: string; max: number };
  /** The chart's accessible name; its numbers are in the "View data" table. */
  label: string;
  selected?: string;
  mini?: boolean;
  className?: string;
}) {
  const pad = mini
    ? { l: 24, r: 24, t: 24, b: 24 }
    : { l: 44, r: 16, t: 12, b: 40 };
  const sx = (v: number) => pad.l + (v / x.max) * (W - pad.l - pad.r);
  const sy = (v: number) => H - pad.b - (v / y.max) * (H - pad.t - pad.b);
  const pick = points.find((p) => p.name === selected);
  // Labels near the right edge sit on the point's left.
  const left = (px: number) => px > W * 0.75;
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
              <polygon
                points={star(px, py, 8)}
                // Beside a selection in the accent, the baseline steps back.
                className={selected === undefined ? "fill-accent" : "fill-fg"}
              />
            ) : (
              <circle
                cx={px}
                cy={py}
                r={p.mark === "ring" ? 6 : 4.5}
                className={
                  p.mark === "ring"
                    ? "fill-none stroke-accent stroke-2"
                    : p === pick
                      ? "fill-accent"
                      : "fill-fg-muted"
                }
              />
            )}
            {!mini && p.mark && (
              <text
                x={left(px) ? px - 10 : px + 10}
                y={py - 8}
                textAnchor={left(px) ? "end" : "start"}
                style={text}
                className="fill-fg font-mono"
              >
                {p.name}
              </text>
            )}
          </g>
        );
      })}
      {pick && (
        <g style={at(sx(pick.x), sy(pick.y))} className={glide}>
          {pick.sd && (
            <g className="stroke-accent">
              <line
                x1={sx(Math.max(0, pick.x - pick.sd.x)) - sx(pick.x)}
                x2={sx(pick.x + pick.sd.x) - sx(pick.x)}
              />
              <line
                y1={sy(Math.max(0, pick.y - pick.sd.y)) - sy(pick.y)}
                y2={sy(pick.y + pick.sd.y) - sy(pick.y)}
              />
            </g>
          )}
          <circle r={9} className="fill-none stroke-accent stroke-2" />
          {!mini && (
            <text
              x={left(sx(pick.x)) ? -13 : 13}
              y={-11}
              textAnchor={left(sx(pick.x)) ? "end" : "start"}
              style={text}
              className="fill-fg font-mono"
            >
              {pick.name}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

export type Line = {
  name: string;
  values: number[];
  dash?: string;
  /** Defaults to the accent for the last line and muted for the rest. */
  tone?: "accent" | "muted";
  /** Faded out, so switching between lines cross-fades. */
  off?: boolean;
};

const stroke = (l: Line, i: number, n: number) =>
  (l.tone ?? (i === n - 1 ? "accent" : "muted")) === "accent"
    ? "stroke-accent"
    : "stroke-fg-muted";

/** A direct label at a line's end: its name, smaller lines under it, its last value. */
export type EndLabel = { text: string; sub?: string[]; value: number };

const LINE = 12.5;

/**
 * End-label positions: each at its line's end, pushed down until it clears
 * the label above it.
 */
function spread(ends: EndLabel[], sy: (v: number) => number, top: number) {
  const placed = ends
    .map((end) => ({ end, y: sy(end.value) }))
    .sort((a, b) => a.y - b.y);
  placed.forEach((p, i) => {
    const prev = placed[i - 1];
    p.y = prev
      ? Math.max(p.y, prev.y + (1 + (prev.end.sub?.length ?? 0)) * LINE)
      : Math.max(p.y, top);
  });
  return placed;
}

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
  markers,
  ends,
  endsClassName,
  mini = false,
  className,
}: {
  levels: number[];
  lines: Line[];
  label: string;
  axes: { x: string; y: string };
  /** The shaded region's label: "Overconfident". */
  below: string;
  /** Observed values for a dot at each level; the dots glide when they change. */
  markers?: number[];
  /**
   * Direct labels past the plot's right edge, spread so they never overlap.
   * They overflow the SVG's box, so the caller leaves room beside it.
   */
  ends?: EndLabel[];
  endsClassName?: string;
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
  const placed = spread(ends ?? [], sy, sy(1));
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      role={mini ? undefined : "img"}
      aria-label={mini ? undefined : label}
      aria-hidden={mini || undefined}
      className={cx("h-auto w-full", ends && "overflow-visible", className)}
    >
      <polygon
        points={`${sx(0)},${sy(0)} ${sx(1)},${sy(0)} ${sx(1)},${sy(1)}`}
        className="fill-warn/10"
      />
      {!mini && (
        <g style={text} className="fill-fg-subtle font-mono">
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
          aria-hidden={l.off || undefined}
          className={cx(
            "fill-none stroke-2",
            stroke(l, i, lines.length),
            l.off !== undefined && glide,
            l.off && "opacity-0",
          )}
          strokeLinejoin="round"
        />
      ))}
      {markers?.map((v, i) => (
        <circle
          key={i}
          r={3.5}
          style={at(sx(levels[i]!), sy(v))}
          className={cx("fill-accent stroke-surface stroke-2", glide)}
        />
      ))}
      {placed.length > 0 && (
        <g style={text} className={cx("font-mono", endsClassName)}>
          {placed.map(({ end, y }) => (
            <g key={end.text}>
              <line
                x1={sx(levels.at(-1)!) + 5}
                y1={sy(end.value)}
                x2={sx(1) + 3}
                y2={y}
                className="stroke-border-strong"
              />
              <g style={at(sx(1) + 7, y)} className={glide}>
                <text y={3.5} className="fill-fg">
                  {end.text}
                </text>
                {end.sub?.map((line, i) => (
                  <text
                    key={i}
                    y={3.5 + (i + 1) * LINE}
                    className="fill-fg-subtle"
                  >
                    {line}
                  </text>
                ))}
              </g>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** The key for dashed lines: a swatch of each dash pattern and its name. */
export function LineKey({
  lines,
  className,
}: {
  lines: Line[];
  className?: string;
}) {
  return (
    <ul
      className={cx(
        "flex flex-wrap gap-x-5 gap-y-2 font-mono text-mono-label text-fg-muted",
        className,
      )}
    >
      {lines.map((l, i) => (
        <li key={l.name} className="flex items-center gap-2">
          <svg viewBox="0 0 24 4" aria-hidden="true" className="w-6 shrink-0">
            <line
              x1="0"
              y1="2"
              x2="24"
              y2="2"
              strokeDasharray={l.dash}
              className={cx("stroke-2", stroke(l, i, lines.length))}
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
 * the shape. The last bar can be highlighted. Each bar is marked
 * [data-bar] and grows from the left, so a caller can animate it by scaleX.
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
              data-bar=""
              className={cx(
                "h-3 origin-left rounded-sm",
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
