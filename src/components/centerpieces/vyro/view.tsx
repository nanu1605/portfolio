import type { Ref } from "react";
import { MonitorSmartphone, Pause, Play } from "lucide-react";
import type { VyroCopy } from "@content/centerpieces/vyro";
import { cx } from "@/lib/cx";
import { SCALE, type Reading } from "./sim";

// §10.2 "Gauge panel": a pure view of one state, with no hooks. The server
// renders it as the poster and live.tsx renders it with moving values, so
// both fill the same box. Layout follows the container (cross-device §6):
// dials side by side with the temperature and fan row below, and from a
// 40rem container the dials plus a side column.

export type Copy = VyroCopy & {
  simulated: string;
  pause: string;
  play: string;
};

export type BrowserInfo = {
  cores: number;
  /** navigator.deviceMemory: Chromium only, rounded and capped. */
  memory?: number;
  screen: string;
  dpr: number;
};

export type ViewProps = {
  copy: Copy;
  reading: Reading;
  /** Polled CPU temperatures, oldest first. */
  history: number[];
  playing: boolean;
  onToggle?: () => void;
  /** Set while "What your browser can see" is open. */
  browser?: BrowserInfo;
  onBrowser?: () => void;
  ref?: Ref<HTMLDivElement>;
};

const fmt = (v: number) => Math.round(v).toLocaleString("en-US");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const mono = "font-mono text-mono-label text-fg-subtle";
const label = `${mono} uppercase`;

// Dial geometry, in viewBox units: a 270° sweep around (100, 100), with the
// gap at the bottom like VYRO's own gauges. Percentages of the box width
// are therefore steps of 2 units.
const C = 100;
const R = 80;
const ARC = R * 1.5 * Math.PI;
const angle = (pct: number) => -135 + 2.7 * pct;
const at = (pct: number, r: number) => {
  const a = (angle(pct) * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)].map(
    (n) => Math.round(n * 100) / 100,
  ) as [number, number];
};
const [x0, y0] = at(0, R);
const [x1, y1] = at(100, R);
const arc = `M${x0} ${y0}A${R} ${R} 0 1 1 ${x1} ${y1}`;
const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

// The dial face never changes, so it is built once: React skips an
// identical element on every frame of the needle's easing.
const face = (
  <>
    <path d={arc} strokeWidth={10} className="fill-none stroke-border" />
    {ticks.map((t) => {
      const major = t % 20 === 0;
      const [ax, ay] = at(t, major ? 62 : 66);
      const [bx, by] = at(t, 70);
      return (
        <line
          key={t}
          x1={ax}
          y1={ay}
          x2={bx}
          y2={by}
          strokeWidth={major ? 1.5 : 1}
          className={major ? "stroke-fg-subtle" : "stroke-border-strong"}
        />
      );
    })}
    {/* Scale numbers only where they stay legible (dials ≥ 13rem). */}
    <g
      fontSize={10}
      textAnchor="middle"
      dominantBaseline="central"
      className="hidden fill-fg-subtle font-mono @[13rem]:inline"
    >
      {ticks
        .filter((t) => t % 20 === 0)
        .map((t) => {
          const [tx, ty] = at(t, 95);
          return (
            <text key={t} x={tx} y={ty}>
              {t}
            </text>
          );
        })}
    </g>
  </>
);

function Dial({
  name,
  usage,
  clock,
  units,
}: {
  name: string;
  usage: number;
  clock: number;
  units: Copy["units"];
}) {
  const pct = Math.min(100, Math.max(0, usage));
  return (
    <div data-dial="" className="relative @container">
      <svg
        viewBox="0 0 200 174"
        aria-hidden="true"
        className="block h-auto w-full overflow-visible"
      >
        {face}
        <path
          d={arc}
          strokeWidth={10}
          strokeDasharray={`${ARC} ${ARC}`}
          strokeDashoffset={ARC * (1 - pct / 100)}
          className="fill-none stroke-vyro"
        />
        <line
          x1={C}
          y1={C - 54}
          x2={C}
          y2={C - 74}
          strokeWidth={3}
          strokeLinecap="round"
          transform={`rotate(${angle(pct)} ${C} ${C})`}
          data-needle=""
          className="stroke-fg"
        />
      </svg>
      {/* The reading, as text, centred on the dial's centre. */}
      {/* Phones get ~150 px dials (cross-device §6), so smaller type there,
          and smaller still at the 320 px reflow width. */}
      <div className="absolute inset-x-0 top-[57.5%] flex -translate-y-1/2 flex-col items-center gap-0.5 @max-[8.75rem]:gap-0 @[12rem]:gap-1">
        <span className={cx(label, "text-fg-muted")}>{name}</span>
        <span className="font-mono text-h2 tabular-nums text-fg @max-[8.75rem]:text-h3 @[12rem]:text-readout">
          {Math.round(pct)}
          <span className="text-small text-fg-muted">{units.usage}</span>
        </span>
        <span className="font-mono text-mono-label tracking-normal tabular-nums text-fg-muted @[12rem]:text-small">
          {fmt(clock)} {units.clock}
        </span>
      </div>
    </div>
  );
}

function Spark({ values }: { values: number[] }) {
  const [lo, hi] = SCALE.temp;
  const last = values.length - 1;
  const points = values
    .map((v, i) => {
      const x = (i / last) * 100;
      const y = (1 - clamp01((v - lo) / (hi - lo))) * 40;
      return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="block h-12 w-full"
    >
      <polygon points={`0,40 ${points} 100,40`} className="fill-vyro/10" />
      <polyline
        points={points}
        strokeWidth={1.5}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="fill-none stroke-vyro"
      />
    </svg>
  );
}

const tile = "flex min-w-0 flex-col gap-2 rounded-md border border-border p-3";
const value = "font-mono text-h3 tabular-nums text-fg";

export function View({
  copy,
  reading,
  history,
  playing,
  onToggle,
  browser,
  onBrowser,
  ref,
}: ViewProps) {
  const { units } = copy;
  const [, fanMax] = SCALE.fan;
  const toggle = playing ? copy.pause : copy.play;
  return (
    <div
      ref={ref}
      className="@container overflow-clip rounded-lg border border-border bg-surface depth"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border py-1.5 pr-1.5 pl-4">
        <p data-honesty="" className={label}>
          {copy.simulated}
        </p>
        <button
          type="button"
          aria-label={toggle}
          title={toggle}
          disabled={!onToggle}
          onClick={onToggle}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-fg-muted transition-ui hover:bg-surface-2 hover:text-fg active:bg-surface-2"
        >
          {playing ? (
            <Pause aria-hidden="true" className="size-4" />
          ) : (
            <Play aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>

      <div className="grid gap-3 p-3 @[40rem]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] @[40rem]:gap-6 @[40rem]:p-6">
        <div className="grid grid-cols-2 gap-2 @[40rem]:gap-4">
          <Dial
            name={copy.cpu}
            usage={reading.cpu}
            clock={reading.cpuClock}
            units={units}
          />
          <Dial
            name={copy.gpu}
            usage={reading.gpu}
            clock={reading.gpuClock}
            units={units}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 @[40rem]:grid-cols-1 @[40rem]:content-center @[40rem]:gap-3">
          <div className={tile}>
            <span className={label}>{copy.temp}</span>
            <span className={value}>
              {fmt(reading.temp)}
              <span className="text-small text-fg-muted"> {units.temp}</span>
            </span>
            <Spark values={history} />
            <span className={mono}>{copy.window}</span>
          </div>
          <div className={tile}>
            <span className={label}>{copy.fan}</span>
            <span className={cx(value, "whitespace-nowrap")}>
              {fmt(reading.fan)}
              <span className="text-small text-fg-muted"> {units.fan}</span>
            </span>
            <span className="mt-auto block h-1 overflow-clip rounded-full bg-border">
              <span
                className="block h-full origin-left bg-vyro"
                style={{
                  transform: `scaleX(${clamp01(reading.fan / fanMax)})`,
                }}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-3 @[40rem]:px-6 @[40rem]:py-4">
        <div className="flex flex-col gap-2 @[30rem]:flex-row @[30rem]:items-center @[30rem]:gap-4">
          <button
            type="button"
            aria-expanded={!!browser}
            aria-controls="vyro-browser"
            disabled={!onBrowser}
            onClick={onBrowser}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md border border-border-strong px-4 text-small font-semibold text-fg transition-ui hover:bg-surface-2 active:bg-surface-2"
          >
            <MonitorSmartphone aria-hidden="true" className="size-4" />
            {copy.browser.button}
          </button>
          <p className="text-small text-fg-muted">{copy.browser.note}</p>
        </div>
        <div id="vyro-browser" aria-live="polite">
          {browser && (
            <div className="flex flex-col gap-3 pt-1">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 @[40rem]:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <dt className={label}>{copy.browser.cores}</dt>
                  <dd className="font-mono text-small text-fg">
                    {browser.cores}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={label}>{copy.browser.memory}</dt>
                  <dd className="font-mono text-small text-fg">
                    {browser.memory === undefined ? (
                      <span className="font-sans text-fg-muted">
                        {copy.browser.memoryMissing}
                      </span>
                    ) : (
                      <>
                        {browser.memory} {units.memory}
                        <span className="block font-sans text-fg-subtle">
                          {copy.browser.memoryCapped}
                        </span>
                      </>
                    )}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={label}>{copy.browser.screen}</dt>
                  <dd className="font-mono text-small text-fg">
                    {browser.screen}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className={label}>{copy.browser.dpr}</dt>
                  <dd className="font-mono text-small text-fg">
                    {browser.dpr}
                  </dd>
                </div>
              </dl>
              <p className="text-small text-fg-muted">{copy.browser.also}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
