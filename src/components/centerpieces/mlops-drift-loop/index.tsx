import { mlopsLoop } from "@content/charts";
import { Figure } from "@/components/ui/figure";
import { Bars } from "@/components/viz/charts";
import { Flow } from "@/components/viz/flow";
import { source } from "../shared";

// §10.7 "Watch it recover". The loop and the two documented F1 levels
// until the per-batch series is in the repo (§10.7's export); intermediate
// points are never drawn by hand.

const loopSteps = ["Serve", "Monitor", "Detect", "Retrain", "Gate", "Reload"];
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

export function Centerpiece() {
  return (
    <div className="flex flex-col gap-6">
      <Figure caption="The loop runs with no human in the path; it returns to Serve after each reload.">
        <div className="bg-surface p-4">
          <Flow steps={loopSteps.map((label) => ({ label }))} row />
        </div>
      </Figure>
      <Figure
        caption="Realized F1 on unseen batches: the stale champion on drifted traffic, then the promoted challenger. Only the two documented levels are shown."
        source={source("mlops.f1")}
      >
        <div className="bg-surface p-4">
          <Bars rows={f1Rows} max={1} highlight={1} />
        </div>
      </Figure>
    </div>
  );
}
