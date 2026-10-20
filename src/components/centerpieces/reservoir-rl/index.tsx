import { reservoirCopy as copy } from "@content/centerpieces/reservoir-rl";
import { reservoir } from "@content/charts";
import { metrics } from "@content/metrics";
import { Figure } from "@/components/ui/figure";
import { ViewData } from "@/components/ui/view-data";
import type { ScatterPoint } from "@/components/viz/charts";
import { source } from "../shared";
import { ReservoirIsland } from "./island";
import {
  KEYS,
  ReservoirView,
  type Penalties,
  type ReservoirData,
} from "./view";

// §10.5 "Weight mixer": the poster (the balanced agent selected) and the
// "View data" table on the server; the live picker loads near the viewport.

const pm = ([m, sd]: readonly number[]) => `${m} ± ${sd}`;
const RULE = copy.rule;
const BALANCED = "Balanced (seed 45)";
const penalties = (p: Penalties): Penalties => ({
  flood: p.flood,
  supply: p.supply,
  eco: p.eco,
});

/** The eight agents plus the rule curve on two penalties (the Work card cover). */
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
  const { flood, supply, eco } = copy.corners;
  const agents = reservoir.pareto_agents.map((a) => {
    const [f, s, e] = a.weights;
    return {
      ...penalties(a),
      name: a.name,
      seed: a.seed,
      weights: a.weights,
      label: `${a.name} · ${copy.seed} ${a.seed}`,
      announce: `${a.name}, ${copy.seed} ${a.seed}. ${copy.weights}: ${flood} ${f}, ${supply} ${s}, ${eco} ${e}.`,
    };
  });
  const run = reservoir.balanced_headline_seed42;
  const all = [
    ...agents,
    reservoir.rule_baseline,
    run.nominal,
    run.drier_climate,
  ];
  const data: ReservoirData = {
    agents,
    rule: penalties(reservoir.rule_baseline),
    headline: {
      nominal: penalties(run.nominal),
      drier: penalties(run.drier_climate),
      definition: run.drier_climate_definition,
      title: `${copy.balanced} · ${metrics["rl.flood"].measuredOn ?? ""}`,
    },
    max: {
      flood: Math.max(...all.map((p) => p.flood[0] + p.flood[1])),
      supply: Math.max(...all.map((p) => p.supply[0] + p.supply[1])),
      eco: Math.max(...all.map((p) => p.eco[0] + p.eco[1])),
    },
    axes: {
      flood: { label: copy.penalties.flood, max: 90 },
      supply: { label: copy.penalties.supply, max: 280 },
      eco: { label: copy.penalties.eco, max: 25 },
    },
    copy,
    limitsHref: "#limitations-and-whats-next",
  };
  const initial = agents.findIndex((a) => a.name === "balanced");
  const rule = reservoir.rule_baseline;

  return (
    <div className="flex flex-col gap-3">
      <Figure caption={copy.caption} source={source("rl.agents")}>
        <ReservoirIsland
          name="reservoir-rl"
          poster={
            <ReservoirView
              data={data}
              state={{
                cursor: agents[initial]!.weights,
                selected: initial,
                drier: false,
              }}
            />
          }
          data={data}
          initial={initial}
        />
      </Figure>
      <ViewData
        caption="Pareto agents and the rule curve: mean ± sd over 100 episodes"
        columns={[
          { key: "name", label: "Policy" },
          { key: "weights", label: "Weights (flood, supply, eco)" },
          ...KEYS.map((k) => ({
            key: k,
            label: copy.corners[k],
            numeric: true,
          })),
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
