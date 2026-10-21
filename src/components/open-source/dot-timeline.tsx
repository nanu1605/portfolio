import type { CSSProperties } from "react";
import { openSource, pullRequests } from "@content/open-source";
import "./dots.css";

// The dot timeline (§6.3, cross-device §4): every merged PR on the day it
// merged, popping in by date. The axis breaks wherever merges are more
// than 90 days apart (between the last PEcAn merge and #4186), so a year
// of nothing doesn't squeeze the summer of PRs. Server-rendered; the
// shared reveal script and dots.css do the rest, so it ships no JS.

const DAY = 86_400_000;
const BREAK_AFTER = 90 * DAY;
/** The break's share of the axis. */
const GAP = 0.08;
/** Merges this close stack across the axis, so their dots never overlap. */
const NEAR = 3 * DAY;

const utc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const month = (t: number, add = 0) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + add, 1);
};

const prs = [...pullRequests.prs].sort((a, b) =>
  a.merged.localeCompare(b.merged),
);

// Runs of merges, each spanning whole months.
const runs: { from: number; to: number }[] = [];
let last = -Infinity;
for (const pr of prs) {
  const t = utc(pr.merged);
  if (t - last > BREAK_AFTER) runs.push({ from: month(t), to: month(t, 1) });
  runs.at(-1)!.to = month(t, 1);
  last = t;
}

// Each run gets axis length in proportion to its days.
const days = runs.reduce((sum, r) => sum + r.to - r.from, 0);
const share = 1 - GAP * (runs.length - 1);
let offset = 0;
const segments = runs.map((r) => {
  const len = ((r.to - r.from) / days) * share;
  const seg = { ...r, start: offset, len };
  offset += len + GAP;
  return seg;
});
const at = (t: number) => {
  const s = segments.find((seg) => t >= seg.from && t < seg.to)!;
  return s.start + ((t - s.from) / (s.to - s.from)) * s.len;
};

// en-US: en-GB writes September "Sept".
const short = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const long = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const ticks = segments.flatMap((s) => {
  const out = [];
  for (let t = s.from; t < s.to; t = month(t, 1))
    out.push({ t, label: (t === s.from ? long : short).format(t) });
  return out;
});

let prev = -Infinity;
let stack = 0;
const dots = prs.map((pr, i) => {
  const t = utc(pr.merged);
  stack = t - prev <= NEAR ? stack + 1 : 0;
  prev = t;
  return { ...pr, i, at: at(t), k: stack };
});

const vars = (v: Record<string, number>) =>
  Object.fromEntries(
    Object.entries(v).map(([k, n]) => [`--${k}`, Math.round(n * 1e4) / 1e4]),
  ) as CSSProperties;

const isPecan = (repo: string) => repo === "PecanProject/pecan";

/** Decorative: the "View data" table under it carries the same data. */
export function DotTimeline() {
  const { legend } = openSource.labels;
  return (
    <div className="flex flex-col gap-6">
      <div aria-hidden="true" data-reveal="dots" className="os-axis">
        {segments.map((s) => (
          <span
            key={s.from}
            className="os-seg"
            style={vars({ from: s.start, len: s.len })}
          />
        ))}
        {segments.slice(1).map((s) => (
          <span
            key={s.from}
            className="os-break"
            style={vars({ at: s.start - GAP / 2 })}
          />
        ))}
        {ticks.map((tick) => (
          <span
            key={tick.t}
            className="os-tick"
            style={vars({ at: at(tick.t) })}
          >
            {tick.label}
          </span>
        ))}
        {dots.map((d) => (
          <span
            key={`${d.repo}#${d.number}`}
            data-dot=""
            className={isPecan(d.repo) ? "os-dot" : "os-dot os-dot-ring"}
            style={vars({ at: d.at, k: d.k, i: d.i })}
          />
        ))}
      </div>
      <p className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-mono-label text-fg-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="os-key os-dot" />
          {legend.pecan}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="os-key os-dot os-dot-ring" />
          {legend.litmus}
        </span>
      </p>
    </div>
  );
}
