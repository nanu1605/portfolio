import {
  jainavCopy,
  orderToLicence,
} from "@content/centerpieces/jainav-platform";
import { jainavPlatform } from "@content/charts";
import { microcopy } from "@content/microcopy";
import { Figure } from "@/components/ui/figure";
import { StatusBadge } from "@/components/ui/status";
import { ViewData } from "@/components/ui/view-data";
import { cx } from "@/lib/cx";
import { source } from "../shared";
import { JainavIsland } from "./island";
import { View, type JainavData } from "./view";

// §10.3 "From order to licence" (a seven-step stepper) and the build
// timeline. The poster is the stepper at step 1 with every step readable.

const data: JainavData = {
  steps: orderToLicence,
  token: jainavCopy.token,
  label: jainavCopy.title,
  labels: {
    previous: microcopy.icons.previous,
    next: microcopy.icons.next,
  },
};

export function Centerpiece() {
  const phases = jainavPlatform.phases;
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <Figure caption={jainavCopy.caption} source={source("jainav.size")}>
          <div className="bg-surface p-4 md:p-6">
            <JainavIsland
              name="jainav-platform"
              poster={<View {...data} current={0} />}
              {...data}
            />
          </div>
        </Figure>
        <ViewData
          caption={jainavCopy.title}
          columns={[
            { key: "step", label: jainavCopy.columns.step },
            { key: "text", label: jainavCopy.columns.text },
          ]}
          rows={orderToLicence.map((s, i) => ({
            step: `${String(i + 1).padStart(2, "0")} ${s.name}`,
            text: s.text,
          }))}
        />
      </div>

      <Figure caption={jainavCopy.timeline}>
        {/* Phones: a vertical line through the phases. Wider: a grid whose
            last cell spans the gap at two and three columns. */}
        <ol className="grid bg-surface py-2 sm:gap-px sm:bg-border sm:py-0 sm:grid-cols-2 lg:grid-cols-3 sm:[&>li:last-child]:col-span-2 lg:[&>li:last-child]:col-span-2">
          {phases.map((phase, i) => {
            const next = !!phase.status;
            return (
              <li
                key={phase.p}
                className="relative flex items-baseline gap-3 bg-surface py-2.5 pr-4 pl-11 sm:p-4"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute left-[1.3rem] w-px bg-border-strong sm:hidden",
                    i === 0 ? "top-5" : "top-0",
                    i === phases.length - 1 ? "h-5" : "bottom-0",
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cx(
                    "absolute top-5 left-4 size-2.5 -translate-y-1/2 rounded-full border sm:hidden",
                    next
                      ? "border-border-strong bg-surface"
                      : "border-accent bg-accent",
                  )}
                />
                <span className="font-mono text-mono-label text-accent">
                  {String(phase.p).padStart(2, "0")}
                </span>
                <span className="flex flex-wrap items-center gap-2 text-small text-fg">
                  {phase.name}
                  {next && <StatusBadge label={jainavCopy.next} />}
                </span>
              </li>
            );
          })}
        </ol>
      </Figure>
    </div>
  );
}
