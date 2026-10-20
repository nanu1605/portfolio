import type { ReactNode } from "react";
import {
  BellRing,
  CalendarPlus,
  CreditCard,
  Crop,
  Layers,
  PersonStanding,
  Receipt,
  Shirt,
  Sparkles,
  UserRound,
  Video,
} from "lucide-react";
import {
  forecasting,
  jainavPlatform,
  mlopsLoop,
  reservoir,
} from "@content/charts";
import { metrics, type MetricId } from "@content/metrics";
import { screen } from "@content/screens";
import type { ProjectSlug } from "@content/schema";
import { Figure, Picture } from "@/components/ui/figure";
import { StatusBadge } from "@/components/ui/status";
import { ViewData } from "@/components/ui/view-data";
import {
  Bars,
  LineKey,
  Reliability,
  Scatter,
  type Line,
  type ScatterPoint,
} from "@/components/viz/charts";
import { Flow, MiniFlow } from "@/components/viz/flow";
import { captured } from "./media";
import { cx } from "@/lib/cx";

// The static figures for each case study, redrawn from Appendix B
// (Phase 4), and the Work cards' covers. Phase 5 puts the interactive
// centerpieces (§10) in front of these.

const source = (id: MetricId) => ({
  href: metrics[id].source,
  label: "Source",
});
const icon = "size-4 text-fg-muted";

// ── Reservoir RL ────────────────────────────────────────────────────────

const pm = ([m, sd]: readonly number[]) => `${m} ± ${sd}`;
const RULE = "Rule curve";
const BALANCED = "Balanced (seed 45)";

function rlPoints(x: "flood" | "supply", y: "supply" | "eco") {
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

function RlFrontier() {
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

// ── Probabilistic forecasting ───────────────────────────────────────────

const curves = forecasting.calibration_curves;
const seeds = Object.keys(curves).filter((k) => k.startsWith("deepar_seed_"));
// The point-wise mean of the five seeds, labelled "computed" (§10.6).
const deeparMean = forecasting.levels.map(
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

function Calibration() {
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

// ── MLOps drift loop ────────────────────────────────────────────────────

const loopSteps = ["Serve", "Monitor", "Detect", "Retrain", "Gate", "Reload"];
const f1 = mlopsLoop.documented_levels;
const f1Rows = [
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

function DriftLoop() {
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

// ── Jainav Infotech platform ────────────────────────────────────────────

function OrderToLicence() {
  return (
    <div className="flex flex-col gap-6">
      <Figure
        caption="From order to licence: what a VYRO licence purchase goes through."
        source={{ href: metrics["jainav.size"].source, label: "Source" }}
      >
        <div className="bg-surface p-4">
          <Flow
            steps={jainavPlatform.order_to_licence.map((label) => ({ label }))}
          />
        </div>
      </Figure>
      <Figure caption="Built 15–18 October 2026 from a ~1,000-line spec.">
        {/* Eleven phases: the last cell spans the gap at two and three columns. */}
        <ol className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3 sm:[&>li:last-child]:col-span-2 lg:[&>li:last-child]:col-span-2">
          {jainavPlatform.phases.map((phase) => (
            <li
              key={phase.p}
              className="flex items-baseline gap-3 bg-surface p-4"
            >
              <span className="font-mono text-mono-label text-accent">
                {String(phase.p).padStart(2, "0")}
              </span>
              <span className="flex flex-wrap items-center gap-2 text-small text-fg">
                {phase.name}
                {phase.status && <StatusBadge label="next" />}
              </span>
            </li>
          ))}
        </ol>
      </Figure>
    </div>
  );
}

// ── Virtual Dressing Room and MyCounselHub ──────────────────────────────

const vdrStages = [
  {
    label: "crop to 192×256",
    icon: <Crop aria-hidden="true" className={icon} />,
  },
  {
    label: "18 pose keypoints",
    icon: <PersonStanding aria-hidden="true" className={icon} />,
  },
  {
    label: "20-class body parsing",
    icon: <Layers aria-hidden="true" className={icon} />,
  },
  {
    label: "clothing-agnostic person",
    icon: <UserRound aria-hidden="true" className={icon} />,
  },
  {
    label: "garment warp (GMM)",
    icon: <Shirt aria-hidden="true" className={icon} />,
  },
  {
    label: "try-on render (TOM)",
    icon: <Sparkles aria-hidden="true" className={icon} />,
  },
];

const mchSteps = [
  {
    label: "Payment succeeds",
    icon: <CreditCard aria-hidden="true" className={icon} />,
  },
  {
    label: "Google Meet link created",
    icon: <Video aria-hidden="true" className={icon} />,
  },
  {
    label: "Calendar events for client and counsellor",
    icon: <CalendarPlus aria-hidden="true" className={icon} />,
  },
  { label: "Invoice", icon: <Receipt aria-hidden="true" className={icon} /> },
  {
    label: "Reminder 30 minutes before the session",
    icon: <BellRing aria-hidden="true" className={icon} />,
  },
];

// "Table to bill" (§10.4) as stills from the staging demo, one per step,
// until Phase 5 makes it the scroll-linked phone story.
const tableToBill = [
  ["Scan", "menumesh/menumesh-demo-start-guest.png"],
  ["Order", "menumesh/menumesh-demo-ordered-guest.png"],
  ["Cook and serve", "menumesh/menumesh-demo-ready-kitchen.png"],
  ["Bill and pay", "menumesh/menumesh-demo-billed-counter.png"],
] as const;

function TableToBill() {
  const first = screen(tableToBill[0][1]);
  return (
    <Figure
      caption={`The browser demo, one step per screen · ${first.build} · ${captured(first.capturedOn)}`}
    >
      <ol className="grid items-start gap-6 bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_2fr]">
        {tableToBill.map(([label, file], i) => {
          const s = screen(file);
          return (
            <li key={file} className="flex flex-col gap-3">
              <span className="font-mono text-mono-label text-fg-subtle">
                <span className="text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {label}
              </span>
              <Picture
                image={s.image}
                alt={s.alt}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                className="rounded-md border border-border"
              />
            </li>
          );
        })}
      </ol>
    </Figure>
  );
}

/** The static figure in the centerpiece slot, until Phase 5 replaces it. */
export const centerpieces: Partial<Record<ProjectSlug, ReactNode>> = {
  "reservoir-rl": <RlFrontier />,
  "probabilistic-forecasting": <Calibration />,
  "mlops-drift-loop": <DriftLoop />,
  "jainav-platform": <OrderToLicence />,
  menumesh: <TableToBill />,
  "virtual-dressing-room": (
    <Figure caption="The six stages, as schematic icons; the research dataset's images can't be shown.">
      <div className="bg-surface p-4">
        <Flow steps={vdrStages} row />
      </div>
    </Figure>
  ),
  mycounselhub: (
    <Figure caption="What happens after a payment succeeds, with no manual steps.">
      <div className="bg-surface p-4">
        <Flow steps={mchSteps} row />
      </div>
    </Figure>
  ),
};

// ── Work card covers (decorative; the card's text says it all) ──────────

function CoverFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "flex aspect-[16/10] items-center justify-center bg-surface bg-grid px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

const iconRow = (steps: { icon: ReactNode }[]) => (
  <MiniFlow steps={steps.map((s) => s.icon)} />
);

export const covers: Partial<Record<ProjectSlug, ReactNode>> = {
  "reservoir-rl": (
    <CoverFrame>
      <Scatter
        points={rlPoints("supply", "eco")}
        x={{ label: "", max: 280 }}
        y={{ label: "", max: 25 }}
        label=""
        mini
      />
    </CoverFrame>
  ),
  "probabilistic-forecasting": (
    <CoverFrame>
      <Reliability
        levels={forecasting.levels}
        lines={[{ name: "DeepAR", values: curves.deepar_seed_1337! }]}
        label=""
        axes={{ x: "", y: "" }}
        below=""
        mini
        className="h-full max-h-40 w-auto"
      />
    </CoverFrame>
  ),
  "mlops-drift-loop": (
    <CoverFrame>
      <Bars rows={f1Rows} max={1} highlight={1} className="w-full" />
    </CoverFrame>
  ),
  "jainav-platform": (
    <CoverFrame>
      <MiniFlow steps={["Order", "Payment", "Invoice", "Licence"]} />
    </CoverFrame>
  ),
  "virtual-dressing-room": <CoverFrame>{iconRow(vdrStages)}</CoverFrame>,
  mycounselhub: <CoverFrame>{iconRow(mchSteps)}</CoverFrame>,
};
