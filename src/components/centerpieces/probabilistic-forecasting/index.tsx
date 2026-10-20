import { forecastingCopy as copy } from "@content/centerpieces/probabilistic-forecasting";
import { forecasting } from "@content/charts";
import { Figure } from "@/components/ui/figure";
import { ViewData } from "@/components/ui/view-data";
import { Bars, type Line } from "@/components/viz/charts";
import { source } from "../shared";
import { ForecastingIsland } from "./island";
import {
  CARDS,
  ForecastingView,
  type ForecastingData,
  type Option,
} from "./view";

// §10.6 "Calibration explorer": the poster (the 5-seed mean selected) and
// the "View data" table on the server; the live explorer loads near the
// viewport.

export const curves = forecasting.calibration_curves;
const perSeed = forecasting.deepar_per_seed;
const seeds = Object.keys(perSeed);
// The point-wise mean of the five seeds, labelled "computed" (§10.6).
export const deeparMean = forecasting.levels.map(
  (_, i) =>
    Math.round(
      (seeds.reduce((sum, s) => sum + curves[`deepar_seed_${s}`]![i]!, 0) /
        seeds.length) *
        1000,
    ) / 1000,
);

const pct = (v: number) => `${+(v * 100).toFixed(1)}%`;
const row = (model: string) =>
  forecasting.table.find((r) => r.Model === model)!;
/** "43.62±1.75" from the results table, as a value and its ± sd. */
const meanSd = (cell: string | number, scale = 1, unit = "") => {
  const [m, sd] = String(cell)
    .split("±")
    .map((v) => +(Number(v) * scale).toFixed(3));
  return { value: `${m}${unit}`, sd: `± ${sd}` };
};
/** A bar scale: the largest value, rounded up to one decimal. */
const ceil = (values: number[]) => Math.ceil(Math.max(...values) * 10) / 10;

const baselines: Line[] = [
  {
    name: copy.models.seasonal_naive,
    values: curves.seasonal_naive!,
    dash: "6 4",
  },
  { name: copy.models.arima, values: curves.arima!, dash: "2 3" },
  { name: copy.models.ets, values: curves.ets!, dash: "10 3 2 3" },
];

function options(): Option[] {
  const { deepar } = copy.models;
  const announce = (name: string, m: Option["metrics"]) =>
    `${name}: ${CARDS.map((c) => `${copy.cards[c]} ${m[c].value}${m[c].sd ? ` ${m[c].sd}` : ""}`).join(", ")}.`;
  const bySeed = seeds.map((s): Option => {
    const p = perSeed[s]!;
    const metrics = {
      crps: { value: String(p.crps) },
      rmse: { value: String(p.rmse) },
      cov90: { value: pct(p.cov90) },
      ece: { value: String(p.ece) },
    };
    const name = `${deepar}, ${copy.seed} ${s}`;
    return {
      chip: s,
      name,
      sub: [`${copy.seed} ${s}`],
      title: `${deepar} · ${copy.seed} ${s}`,
      values: curves[`deepar_seed_${s}`]!,
      metrics,
      announce: announce(name, metrics),
    };
  });
  // Never the one-seed recalibrated row: the 5-seed mean is the raw row.
  const raw = row("DeepAR (raw)");
  const metrics = {
    crps: meanSd(raw.CRPS),
    rmse: meanSd(raw.RMSE),
    cov90: meanSd(raw["Cov@90"], 100, "%"),
    ece: meanSd(raw.ECE),
  };
  const mean = copy.mean.toLowerCase();
  return [
    ...bySeed,
    {
      chip: copy.mean,
      name: `${deepar}, ${mean} (${copy.computed})`,
      sub: [mean, copy.computed],
      title: `${deepar} · ${copy.meanTitle}`,
      values: deeparMean,
      metrics,
      announce: announce(`${deepar}, ${mean}`, metrics),
    },
  ];
}

function explorerData(): ForecastingData {
  const arima = row("ARIMA");
  const best = seeds.reduce((a, b) =>
    perSeed[b]!.crps < perSeed[a]!.crps ? b : a,
  );
  const horizon = Object.entries(forecasting.per_horizon_ece_best_seed).map(
    ([h, ece]) => ({
      label: `${h} ${copy.ahead}`,
      value: ece,
      text: ece.toFixed(3),
    }),
  );
  const r = forecasting.recalibration_same_run;
  const three = (v: number) => v.toFixed(3);
  const one = (v: number) => v.toFixed(1);
  const pair = (
    key: keyof typeof copy.recal.rows,
    [before, after]: readonly number[],
    format: (v: number) => string,
  ) => ({
    label: copy.recal.rows[key],
    before: format(before!),
    after: format(after!),
  });
  const bars = [
    {
      label: copy.recal.before,
      value: r.test_ece[0],
      text: three(r.test_ece[0]),
    },
    {
      label: copy.recal.after,
      value: r.test_ece[1],
      text: three(r.test_ece[1]),
    },
    {
      label: copy.recal.oracle,
      value: r.oracle_test_fit_ece,
      text: three(r.oracle_test_fit_ece),
    },
  ];
  return {
    levels: forecasting.levels,
    baselines,
    options: options(),
    reference: {
      name: copy.models.arima,
      metrics: {
        crps: String(arima.CRPS),
        rmse: String(arima.RMSE),
        cov90: pct(Number(arima["Cov@90"])),
        ece: String(arima.ECE),
      },
    },
    horizon: {
      title: `${copy.horizon} (${best})`,
      rows: horizon,
      max: ceil(horizon.map((h) => h.value)),
    },
    recal: {
      rows: [
        pair("test_ece", r.test_ece, three),
        pair("val_ece", r.val_ece, three),
        pair("cov90", r.cov90, pct),
        pair("crps", r.crps, three),
        pair("width90", r.width90, one),
      ],
      bars,
      max: ceil(bars.map((b) => b.value)),
      note: copy.recal.oracleNote.replace(
        "{value}",
        three(r.oracle_test_fit_ece),
      ),
    },
    copy,
  };
}

export function Centerpiece() {
  const data = explorerData();
  const initial = data.options.length - 1;
  const table = [...baselines, ...data.options];
  return (
    <div className="flex flex-col gap-3">
      <Figure caption={copy.caption} source={source("fc.horizon")}>
        <ForecastingIsland
          name="probabilistic-forecasting"
          poster={<ForecastingView data={data} state={{ option: initial }} />}
          data={data}
          initial={initial}
        />
      </Figure>
      <ViewData
        caption="Observed interval coverage at each nominal level"
        columns={[
          { key: "level", label: "Nominal" },
          ...table.map((l) => ({ key: l.name, label: l.name, numeric: true })),
        ]}
        rows={forecasting.levels.map((level, i) => ({
          level,
          ...Object.fromEntries(table.map((l) => [l.name, l.values[i]])),
        }))}
      />
    </div>
  );
}

/** ECE by forecast horizon, best seed. The explorer shows these bars now. */
export function HorizonFigure() {
  const rows = Object.entries(forecasting.per_horizon_ece_best_seed).map(
    ([h, ece]) => ({ label: `${h} h ahead`, value: ece, text: String(ece) }),
  );
  return (
    <Figure
      caption="Calibration error (ECE) by forecast horizon, for the best seed (1337)."
      source={source("fc.horizon")}
    >
      <div className="bg-surface p-4">
        <Bars rows={rows} max={0.2} highlight={rows.length - 1} />
      </div>
    </Figure>
  );
}
