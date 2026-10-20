import { reservoir } from "@content/charts";
import { Figure } from "@/components/ui/figure";
import { ViewData } from "@/components/ui/view-data";
import { Scatter, type ScatterPoint } from "@/components/viz/charts";
import { source } from "../shared";

// §10.5 "Weight mixer". Phase 4's static Pareto scatters, until Phase 5
// makes them the interactive centerpiece.

const pm = ([m, sd]: readonly number[]) => `${m} ± ${sd}`;
const RULE = "Rule curve";
const BALANCED = "Balanced (seed 45)";

/** The eight agents plus the rule curve on two of the three penalties. */
export function rlPoints(x: "flood" | "supply", y: "supply" | "eco") {
  const agents: ScatterPoint[] = reservoir.pareto_agents.map((a) => ({
    name: a.name === "balanced" ? BALANCED : a.name,
    x: a[x][0],
    y: a[y][0],
    mark: a.name === "balanced" ? "ring" : undefined,
  }));
  const rule = reservoir.rule_baseline;
  return [
    ...agents,
    { name: RULE, x: rule[x][0], y: rule[y][0], mark: "star" as const },
  ];
}

export function Centerpiece() {
  const panels = [
    {
      label: "Flood penalty against supply deficit",
      x: { label: "Flood penalty", max: 90 },
      y: { label: "Supply deficit", max: 280 },
      points: rlPoints("flood", "supply"),
    },
    {
      label: "Supply deficit against ecological deficit",
      x: { label: "Supply deficit", max: 280 },
      y: { label: "Ecological deficit", max: 25 },
      points: rlPoints("supply", "eco"),
    },
  ];
  const rule = reservoir.rule_baseline;
  return (
    <div className="flex flex-col gap-3">
      <Figure
        caption="Eight PPO agents (dots) and the rule curve (star), over 100 shared evaluation episodes; lower is better on every axis. Each point is one training run (one seed). Two runs with the same balanced weights landed at different points — see Limitations."
        source={source("rl.agents")}
      >
        <div className="grid gap-4 bg-surface p-4 sm:grid-cols-2">
          {panels.map((p) => (
            <Scatter key={p.label} {...p} />
          ))}
        </div>
      </Figure>
      <ViewData
        caption="Pareto agents and the rule curve: mean ± sd over 100 episodes"
        columns={[
          { key: "name", label: "Policy" },
          { key: "weights", label: "Weights (flood, supply, eco)" },
          { key: "flood", label: "Flood", numeric: true },
          { key: "supply", label: "Supply", numeric: true },
          { key: "eco", label: "Ecology", numeric: true },
        ]}
        rows={[
          ...reservoir.pareto_agents.map((a) => ({
            name: `${a.name} (seed ${a.seed})`,
            weights: a.weights.join(", "),
            flood: pm(a.flood),
            supply: pm(a.supply),
            eco: pm(a.eco),
          })),
          {
            name: RULE,
            weights: "—",
            flood: pm(rule.flood),
            supply: pm(rule.supply),
            eco: pm(rule.eco),
          },
        ]}
      />
    </div>
  );
}
