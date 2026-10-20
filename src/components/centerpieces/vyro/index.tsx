import { vyroCopy } from "@content/centerpieces/vyro";
import { vyroData } from "@content/charts";
import type { MetricId } from "@content/metrics";
import { microcopy } from "@content/microcopy";
import { TextLink } from "@/components/ui/text-link";
import { ViewData } from "@/components/ui/view-data";
import { liveMetrics } from "@/lib/github";
import { VyroIsland } from "./island";
import { start } from "./sim";
import { View, type Copy } from "./view";

// §10.2 "Gauge panel": simulated gauges (a lazy island over a poster of the
// same view), then the real footprint from metrics.ts and its table.

const footprint: MetricId[] = [
  "vyro.cpu",
  "vyro.ram",
  "vyro.startup",
  "vyro.installer",
];
// Appendix B's version columns: "v0_1_4" reads "v0.1.4".
const versions = ["v0_1_4", "v0_2_0"] as const;

export async function Centerpiece() {
  // The installer size is a live release value (§4.3), as in the hero.
  const live = await liveMetrics();
  const copy: Copy = {
    ...vyroCopy,
    simulated: microcopy.simulated.vyro,
    pause: microcopy.icons.pause,
    play: microcopy.icons.play,
  };
  const initial = start();
  const label = "font-mono text-mono-label uppercase text-fg-subtle";

  return (
    <div className="flex flex-col gap-4">
      <VyroIsland
        name="vyro"
        poster={<View copy={copy} {...initial} playing={false} />}
        copy={copy}
        start={initial}
      />

      <section
        aria-labelledby="vyro-footprint"
        className="@container flex flex-col gap-5 rounded-lg border border-border bg-surface p-4 depth @[40rem]:p-6"
      >
        <h2 id="vyro-footprint" className={label}>
          {copy.footprint}
        </h2>
        {/* Subgrid rows line the values up when a label wraps. */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 @[40rem]:grid-cols-4">
          {footprint.map((id) => {
            const m = live[id];
            return (
              <div
                key={id}
                className="row-span-3 grid grid-rows-subgrid nth-[-n+2]:pb-5 @[40rem]:nth-[-n+2]:pb-0"
              >
                <dt className="text-small text-fg-muted first-letter:uppercase">
                  {m.label}
                </dt>
                <dd className="font-mono text-h3 text-balance text-fg">
                  {m.value}
                </dd>
                <dd className="font-mono text-mono-label text-fg-subtle">
                  {m.linkSource ? (
                    <>
                      {m.measuredOn && `${m.measuredOn} · `}
                      <TextLink href={m.source}>
                        Source<span className="sr-only">: {m.label}</span>
                      </TextLink>
                    </>
                  ) : (
                    m.measuredOn
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
        <p className="border-t border-border pt-4 text-small text-fg-muted">
          {copy.referencePc}: {vyroData.reference_pc}
        </p>
      </section>

      <ViewData
        caption={copy.table.caption}
        columns={[
          { key: "metric", label: copy.table.measure },
          { key: "target", label: copy.table.target },
          ...versions.map((v) => ({
            key: v,
            label: v.replaceAll("_", "."),
            numeric: true,
          })),
        ]}
        rows={vyroData.footprint}
      />
    </div>
  );
}
