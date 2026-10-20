import { forecasting } from "@content/charts";
import { Figure } from "@/components/ui/figure";
import { ViewData } from "@/components/ui/view-data";
import { Bars, LineKey, Reliability, type Line } from "@/components/viz/charts";
import { source } from "../shared";

// §10.6 "Calibration explorer". Phase 4's static reliability diagram,
// until Phase 5 makes it the interactive centerpiece.

export const curves = forecasting.calibration_curves;
const seeds = Object.keys(curves).filter((k) => k.startsWith("deepar_seed_"));
// The point-wise mean of the five seeds, labelled "computed" (§10.6).
export const deeparMean = forecasting.levels.map(
  (_, i) =>
    Math.round(
      (seeds.reduce((sum, s) => sum + curves[s]![i]!, 0) / seeds.length) * 1000,
    ) / 1000,
);
const fcLines: Line[] = [
  { name: "Seasonal naive", values: curves.seasonal_naive!, dash: "6 4" },
  { name: "ARIMA", values: curves.arima!, dash: "2 3" },
  { name: "ETS", values: curves.ets!, dash: "10 3 2 3" },
  { name: "DeepAR, mean of 5 seeds (computed)", values: deeparMean },
];

export function Centerpiece() {
  return (
    <div className="flex flex-col gap-3">
      <Figure
        caption="Observed against nominal coverage of the forecast intervals on the test set, at nine levels. Lines below the diagonal are overconfident: their intervals are too narrow."
        source={source("fc.horizon")}
      >
        <div className="flex flex-col gap-4 bg-surface p-4 md:flex-row md:items-center">
          <Reliability
            levels={forecasting.levels}
            lines={fcLines}
            label="Reliability diagram: DeepAR sits furthest below the diagonal"
            axes={{ x: "Nominal coverage", y: "Observed coverage" }}
            below="Overconfident"
            className="max-w-md"
          />
          <LineKey lines={fcLines} />
        </div>
      </Figure>
      <ViewData
        caption="Observed interval coverage at each nominal level"
        columns={[
          { key: "level", label: "Nominal" },
          ...fcLines.map((l) => ({
            key: l.name,
            label: l.name,
            numeric: true,
          })),
        ]}
        rows={forecasting.levels.map((level, i) => ({
          level,
          ...Object.fromEntries(fcLines.map((l) => [l.name, l.values[i]])),
        }))}
      />
    </div>
  );
}

/** ECE by forecast horizon, best seed ("Where it breaks"). */
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
