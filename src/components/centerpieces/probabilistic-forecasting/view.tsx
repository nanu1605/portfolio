import type { Ref } from "react";
import type { ForecastingCopy } from "@content/centerpieces/probabilistic-forecasting";
import { Tabs } from "@/components/ui/tabs";
import { TextLink } from "@/components/ui/text-link";
import { Bars, LineKey, Reliability, type Line } from "@/components/viz/charts";
import { cx } from "@/lib/cx";

// §10.6 "Calibration explorer": the view of one state, with no hooks of
// its own, so the server poster and the live version render the same box.
// live.tsx owns the seed and grows the horizon bars.

export const CARDS = ["crps", "rmse", "cov90", "ece"] as const;
type Card = (typeof CARDS)[number];
/** A value, with its ± sd when it is a 5-seed mean. */
type Value = { value: string; sd?: string };
type BarRow = { label: string; value: number; text: string };

/** One DeepAR choice: a seed, or the mean of five. */
export type Option = {
  chip: string;
  /** The line's name in the key: "DeepAR, seed 42". */
  name: string;
  /** The direct label's smaller lines: "seed 42". */
  sub: string[];
  /** The cards' heading. */
  title: string;
  values: number[];
  metrics: Record<Card, Value>;
  announce: string;
};

export type ForecastingData = {
  levels: number[];
  baselines: Line[];
  options: Option[];
  /** The best baseline's values, under each card. */
  reference: { name: string; metrics: Record<Card, string> };
  horizon: { title: string; rows: BarRow[]; max: number };
  recal: {
    rows: { label: string; before: string; after: string }[];
    bars: BarRow[];
    max: number;
    note: string;
    source: { href: string; label: string };
  };
  copy: ForecastingCopy;
};

export type ForecastingState = { option: number };

export type ForecastingHandlers = {
  onOption: (i: number) => void;
  /** The horizon bars, which grow when they first come into view. */
  horizon: Ref<HTMLDivElement>;
};

const label = "font-mono text-mono-label uppercase text-fg-subtle";

export function ForecastingView({
  data,
  state,
  on,
}: {
  data: ForecastingData;
  state: ForecastingState;
  /** Absent on the poster. */
  on?: ForecastingHandlers;
}) {
  const { copy, options, reference } = data;
  const pick = options[state.option]!;
  const lines: Line[] = [
    ...data.baselines,
    ...options.map((o, i) => ({
      name: o.name,
      values: o.values,
      tone: "accent" as const,
      off: i !== state.option,
    })),
  ];
  const keyLines: Line[] = [
    ...data.baselines,
    { name: pick.name, values: pick.values, tone: "accent" },
  ];

  const explorer = (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className={cx(label, "mb-3")}>{copy.seeds}</legend>
        <div className="grid grid-cols-3 gap-1.5 @xs:gap-2 @2xl:flex @2xl:flex-wrap">
          {options.map((o, i) => (
            <label
              key={o.name}
              className={cx(
                // Below 320 px of box, a smaller face keeps "Mean of 5" clear of the edge.
                "relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-border-strong px-2 font-mono text-mono-label tracking-normal whitespace-nowrap text-fg-muted transition-ui pointer-fine:min-h-9 @xs:px-4 @xs:text-small",
                "hover:bg-surface-2 hover:text-fg active:bg-surface-2",
                "has-checked:border-accent has-checked:bg-accent has-checked:text-on-accent",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
              )}
            >
              <input
                type="radio"
                name="deepar-seed"
                value={i}
                // Uncontrolled: the chip changes at once and the chart
                // follows in a transition. It covers the chip, transparent:
                // WebKit scrolls to a focused radio that is clipped away.
                defaultChecked={i === state.option}
                onChange={on && (() => on.onOption(i))}
                className="absolute inset-0 m-0 cursor-pointer opacity-0"
              />
              {o.chip}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid items-start gap-8 @2xl:grid-cols-2 @4xl:grid-cols-[minmax(0,4fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-4">
          {/* Room on the right for the direct labels (desktop only). */}
          <div className="@4xl:pr-28">
            <Reliability
              levels={data.levels}
              lines={lines}
              markers={pick.values}
              ends={[
                ...data.baselines.map((l) => ({
                  text: l.name,
                  value: l.values.at(-1)!,
                })),
                {
                  text: copy.models.deepar,
                  sub: pick.sub,
                  value: pick.values.at(-1)!,
                },
              ]}
              endsClassName="hidden @4xl:inline"
              label={copy.diagram}
              axes={copy.axes}
              below={copy.below}
            />
          </div>
          <LineKey
            lines={keyLines}
            className="flex-col items-start @4xl:hidden"
          />
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-small font-semibold text-fg">{pick.title}</p>
            <dl className="grid grid-cols-2 gap-px overflow-clip rounded-md border border-border bg-border">
              {CARDS.map((c) => (
                <div key={c} className="flex flex-col gap-1 bg-surface p-3">
                  <dt className={label}>{copy.cards[c]}</dt>
                  <dd className="font-mono text-fg tabular-nums">
                    <span className="text-h3 font-medium">
                      {pick.metrics[c].value}
                    </span>
                    {pick.metrics[c].sd && (
                      <>
                        {" "}
                        <span className="text-small whitespace-nowrap text-fg-muted">
                          {pick.metrics[c].sd}
                        </span>
                      </>
                    )}
                  </dd>
                  <dd className="font-mono text-mono-label text-fg-subtle">
                    {reference.name} {reference.metrics[c]}
                  </dd>
                </div>
              ))}
            </dl>
            <p aria-live="polite" className="sr-only">
              {pick.announce}
            </p>
          </div>
          <div ref={on?.horizon} className="flex flex-col gap-3">
            <p className={label}>{data.horizon.title}</p>
            <Bars
              rows={data.horizon.rows}
              max={data.horizon.max}
              highlight={data.horizon.rows.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const recal = (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-small font-semibold text-fg">{copy.recal.title}</p>
        <p className={label}>{copy.recal.sub}</p>
      </div>
      <div className="grid items-start gap-8 @2xl:grid-cols-2">
        <table className="w-full border-collapse text-small">
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className={cx(label, "py-2 text-left font-medium")}
              >
                {copy.recal.metric}
              </th>
              <th
                scope="col"
                className={cx(label, "py-2 text-right font-medium")}
              >
                {copy.recal.before}
              </th>
              <th
                scope="col"
                className={cx(label, "py-2 text-right font-medium")}
              >
                {copy.recal.after}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.recal.rows.map((r) => (
              <tr
                key={r.label}
                className="border-b border-border last:border-b-0"
              >
                <th
                  scope="row"
                  className="py-2.5 pr-3 text-left font-normal text-fg-muted"
                >
                  {r.label}
                </th>
                <td className="py-2.5 pl-3 text-right font-mono text-fg-muted tabular-nums">
                  {r.before}
                </td>
                <td className="py-2.5 pl-3 text-right font-mono text-fg tabular-nums">
                  {r.after}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-col gap-4">
          <p className={label}>{copy.recal.rows.test_ece}</p>
          <Bars
            rows={data.recal.bars}
            max={data.recal.max}
            highlight={data.recal.bars.length - 1}
          />
          <p className="border-l-2 border-accent pl-3 text-small text-fg-muted">
            {data.recal.note}
          </p>
          <TextLink
            href={data.recal.source.href}
            className="self-start text-small"
          >
            {data.recal.source.label}
          </TextLink>
        </div>
      </div>
    </div>
  );

  return (
    <div className="@container bg-surface">
      <div className="flex flex-col gap-6 p-4 [--chart-font:12px] @lg:p-6 @2xl:[--chart-font:11px] @4xl:[--chart-font:9.5px]">
        <Tabs
          label={copy.tabs.label}
          tabs={[
            {
              id: "calibration",
              label: copy.tabs.calibration,
              content: explorer,
            },
            {
              id: "recalibration",
              label: copy.tabs.recalibration,
              content: recal,
            },
          ]}
        />
        <p className="border-t border-border pt-4 text-small text-fg-muted">
          {copy.definition}
        </p>
      </div>
    </div>
  );
}
