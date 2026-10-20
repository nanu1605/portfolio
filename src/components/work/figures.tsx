import type { ReactNode } from "react";
import { forecasting } from "@content/charts";
import type { ProjectSlug } from "@content/schema";
import { f1Rows } from "@/components/centerpieces/mlops-drift-loop";
import { mchSteps } from "@/components/centerpieces/mycounselhub";
import { curves } from "@/components/centerpieces/probabilistic-forecasting";
import { rlPoints } from "@/components/centerpieces/reservoir-rl";
import { vdrStages } from "@/components/centerpieces/virtual-dressing-room";
import { Bars, Reliability, Scatter } from "@/components/viz/charts";
import { MiniFlow } from "@/components/viz/flow";
import { cx } from "@/lib/cx";

// The Work cards' covers (decorative; the card's text says it all). The
// case-study centerpieces live in src/components/centerpieces.

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
