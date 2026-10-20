// §10.2 VYRO "Gauge panel": the centerpiece's own strings. The browser
// lines and "Footprint" come from §10.2, "Measure" and "Target" from A.4.2's
// results table; the short gauge and readout labels are new and listed in
// docs/decisions.md for Tanishq. The honesty label and the Pause/Play names
// live in microcopy.ts. No numbers here: the gauges are simulated
// (src/components/centerpieces/vyro/sim.ts) and the footprint is read from
// metrics.ts.

export const vyroCopy = {
  cpu: "CPU",
  gpu: "GPU",
  units: { usage: "%", clock: "MHz", temp: "°C", fan: "RPM", memory: "GB" },
  temp: "CPU temperature",
  fan: "CPU fan",
  window: "Last 60 s",
  browser: {
    button: "What your browser can see",
    note: "Computed in your browser; nothing is sent.",
    also: "VYRO also sees temperatures, fan speeds, voltages and clocks.",
    cores: "Logical processors",
    memory: "Device memory",
    memoryCapped: "Chromium; the browser caps it",
    memoryMissing: "Not shared by this browser",
    screen: "Screen",
    dpr: "Device pixel ratio",
  },
  footprint: "Footprint",
  referencePc: "Reference PC",
  table: {
    caption: "VYRO footprint by version, on the reference PC",
    measure: "Measure",
    target: "Target",
  },
} as const;

export type VyroCopy = typeof vyroCopy;
