import { mlopsCopy as copy } from "@content/centerpieces/mlops-drift-loop";
import { mlopsLoop, mlopsTimeline } from "@content/charts";
import { Figure } from "@/components/ui/figure";
import { ViewData } from "@/components/ui/view-data";
import { captured } from "@/components/work/media";
import { source } from "../shared";
import { MlopsIsland } from "./island";
import { MlopsView, steps, type MlopsData } from "./view";
import "./mlops.css";

// §10.7 "Watch it recover": realized F1 per unseen batch from the repo's
// export (content/data/mlops-timeline.json), drawn by scrolling, beside
// the loop. The poster is the final step; the "View data" table has every
// batch and the provenance.

// The Work card cover keeps the two documented levels (as the bento does).
const f1 = mlopsLoop.documented_levels;
export const f1Rows = [
  {
    label: "Stale champion",
    value: f1.stale_champion_f1,
    text: String(f1.stale_champion_f1),
  },
  {
    label: "After promotion",
    value: f1.after_promotion_f1,
    text: String(f1.after_promotion_f1),
  },
];

const { timeline } = mlopsTimeline;
// The chart labels both events on one tick: the last v1 batch's.
if (mlopsTimeline.drift_detected_t !== mlopsTimeline.promoted_t)
  throw new Error(
    "mlops-timeline.json: drift and promotion on different ticks",
  );
const tick = timeline.findIndex((b) => b.t === mlopsTimeline.promoted_t);
const data: MlopsData = {
  points: timeline.map((b) => ({ f1: b.f1, version: b.version })),
  tick,
  copy,
};

const t = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export function Centerpiece() {
  const { table, versions, events } = copy;
  return (
    <div className="flex flex-col gap-3">
      <div className="mlops-track">
        <div className="mlops-pin">
          <Figure
            caption={copy.caption}
            label={copy.label}
            source={source("mlops.f1")}
          >
            <MlopsIsland
              name="mlops-drift-loop"
              poster={<MlopsView data={data} state={{ step: steps(data) }} />}
              data={data}
            />
          </Figure>
        </div>
      </div>
      <ViewData
        caption={table.caption
          .replace("{commit}", mlopsTimeline.commit)
          .replace("{date}", captured(mlopsTimeline.exported))}
        columns={[
          { key: "batch", label: table.batch },
          { key: "t", label: table.t, numeric: true },
          { key: "f1", label: table.f1, numeric: true },
          { key: "version", label: table.version },
          { key: "event", label: table.event },
        ]}
        rows={timeline.map((b, i) => ({
          batch: i + 1,
          t: t.format(b.t),
          f1: b.f1.toFixed(3),
          version: `${versions[b.version].short} · ${versions[b.version].name}`,
          event:
            i === tick
              ? `${events.drift}; ${events.promoted.toLowerCase()}, ${table.tick}`
              : "",
        }))}
      />
    </div>
  );
}
