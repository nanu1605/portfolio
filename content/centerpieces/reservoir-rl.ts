// §10.5 "Weight mixer". Strings from the spec say where they come from;
// the rest are new and listed in docs/decisions.md for Tanishq to approve.
// Every number comes from Appendix B (@content/charts) or C.1 (metrics).

export const reservoirCopy = {
  // §10.5: the triangle's corners.
  corners: { flood: "Flood", supply: "Supply", eco: "Ecology" },
  // New: the triangle cursor's accessible name, and the hint under it.
  picker: "Objective weights",
  hint: "Drag the cursor or tap the triangle. Arrow keys move it; Shift moves it further.",
  // New: the <select> that offers the same choice (§10.5).
  agent: "Nearest agent",
  // New: words around the Appendix B values.
  seed: "seed",
  weights: "Weights",
  // A.4.5 results table.
  rule: "Rule curve",
  balanced: "Balanced PPO",
  penalties: {
    flood: "Flood penalty",
    supply: "Supply deficit",
    eco: "Ecological deficit",
  },
  // §10.5 / A.4.5 ("100 episodes, lower is better"; values are mean ± sd).
  scale: "Mean ± sd · lower is better",
  // §10.5 toggle; "Nominal" is Appendix B's own key.
  drier: "Drier climate",
  nominal: "Nominal",
  // New: the bars' heading for the selected agent against the rule curve.
  versus: "vs",
  // Phase 4's figure caption and scatter names.
  caption:
    "Eight PPO agents (dots) and the rule curve (star), over 100 shared evaluation episodes; lower is better on every axis.",
  charts: {
    floodSupply: "Flood penalty against supply deficit",
    supplyEco: "Supply deficit against ecological deficit",
  },
  // §10.5, exactly. "Limitations" links to that section.
  footnote: {
    before:
      "Each point is one training run (one seed). Two runs with the same balanced weights landed at different points — see ",
    link: "Limitations",
    after: ".",
  },
} as const;

export type ReservoirCopy = typeof reservoirCopy;
