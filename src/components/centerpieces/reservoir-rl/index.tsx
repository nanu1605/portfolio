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
/** An axis maximum at or above `v` whose half is a round tick. */
const nice = (v: number) => {
  const m = 10 ** Math.floor(Math.log10(v)) / 10;
  return (
    [10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 90, 100].find((f) => f * m >= v)! *
    m
  );
};
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
  const rule = reservoir.rule_baseline;
  const all = [...agents, rule, run.nominal, run.drier_climate];
  const measured = metrics["rl.flood"].measuredOn ?? "";
  // The scatters: every agent's mean + sd (the selected one's whiskers) and
  // the rule's mean (a star, no whiskers).
  const axis = (k: (typeof KEYS)[number]) => ({
    label: copy.penalties[k],
    max: nice(Math.max(rule[k][0], ...agents.map((a) => a[k][0] + a[k][1]))),
  });
  const data: ReservoirData = {
    agents,
    rule: penalties(rule),
    headline: {
      nominal: penalties(run.nominal),
      drier: penalties(run.drier_climate),
      definition: run.drier_climate_definition,
      title: `${copy.balanced} · ${measured}`,
      source: source("rl.dry"),
    },
    max: {
      flood: Math.max(...all.map((p) => p.flood[0] + p.flood[1])),
      supply: Math.max(...all.map((p) => p.supply[0] + p.supply[1])),
      eco: Math.max(...all.map((p) => p.eco[0] + p.eco[1])),
    },
    axes: { flood: axis("flood"), supply: axis("supply"), eco: axis("eco") },
    copy,
    limitsHref: "#limitations-and-whats-next",
  };
  const initial = agents.findIndex((a) => a.name === "balanced");
  // The headline run: seed 42 (C.1), with the balanced weights (§10.5 footnote).
  const head = `${copy.balanced}, ${measured.match(/seed \d+/)?.[0] ?? ""}`;
  const headRow = (name: string, p: Penalties) => ({
    name: `${head} (${name.toLowerCase()})`,
    weights: agents[initial]!.weights.join(", "),
    flood: pm(p.flood),
    supply: pm(p.supply),
    eco: pm(p.eco),
  });

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
        caption={copy.table}
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
          headRow(copy.nominal, run.nominal),
          headRow(copy.drier, run.drier_climate),
        ]}
      />
    </div>
  );
}
