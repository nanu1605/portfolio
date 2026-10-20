import { jainavPlatform } from "@content/charts";
import { metrics } from "@content/metrics";
import { Figure } from "@/components/ui/figure";
import { StatusBadge } from "@/components/ui/status";
import { Flow } from "@/components/viz/flow";

// §10.3 "From order to licence" and the build timeline. Phase 4's static
// flow, until Phase 5 makes it the stepper.

export function Centerpiece() {
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
