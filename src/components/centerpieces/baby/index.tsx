import { babyDemo } from "@content/centerpieces/baby";
import { microcopy } from "@content/microcopy";
import { ViewData } from "@/components/ui/view-data";
import { BabyIsland } from "./island";
import { View } from "./view";

// §10.1 "Follow a turn". The poster is the first scenario's final state;
// the live version replays a scenario once on entering view and per chip.
// The four scripted scenarios are also a table, for screen readers and
// anyone who'd rather read them (it isn't a chart, but "View data" fits).

export function Centerpiece() {
  const label = microcopy.simulated.baby;
  const c = babyDemo.columns;
  return (
    <div className="flex flex-col gap-3">
      <BabyIsland
        name="baby"
        poster={<View demo={babyDemo} label={label} active={0} />}
        demo={babyDemo}
        label={label}
      />
      <ViewData
        caption={babyDemo.name}
        columns={[
          { key: "scenario", label: c.scenario },
          { key: "utterance", label: c.utterance },
          { key: "route", label: c.route },
          { key: "gate", label: c.gate },
          { key: "reply", label: c.reply },
        ]}
        rows={babyDemo.scenarios.map((s) => ({
          scenario: s.name,
          utterance: <span lang={s.lang}>{s.lines[0].text}</span>,
          route: s.row.route,
          gate: s.row.gate,
          reply: <span lang={s.lang}>{s.row.reply}</span>,
        }))}
      />
    </div>
  );
}
