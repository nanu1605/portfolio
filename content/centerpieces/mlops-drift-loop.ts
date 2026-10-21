// §10.7 "Watch it recover". Strings from the spec say where they come
// from; the ones marked "New" still need Tanishq's approval. Every number
// comes from content/data/mlops-timeline.json (@content/charts); `{name}`
// slots are filled in code.

export const mlopsCopy = {
  // New: the figure caption. "Realized F1", "unseen batches" and "the real
  // serving process and controller replay it" are A.4.7's.
  caption:
    "Realized F1 on each unseen batch, as the real serving process and controller replay the synthetic shift.",
  // New: the honesty label (A.4.7: the data is synthetic).
  label: "Synthetic data",
  // New: the slider's accessible name, axes and readout.
  slider: "Realized F1 by unseen batch",
  axes: { x: "Unseen batch", y: "Realized F1" },
  batch: "Batch",
  valuetext: "Batch {n} of {total}: F1 {f1}, {version}",
  hint: "Tap a point or use the arrow keys to read a batch.",
  // The model versions: A.4.7's "stale champion" and "challenger promoted".
  versions: {
    "1": { short: "v1", name: "Stale champion" },
    "2": { short: "v2", name: "Promoted challenger" },
  },
  // §10.7, exactly.
  events: { drift: "Drift detected", promoted: "Challenger promoted" },
  loop: ["Serve", "Monitor", "Detect", "Retrain", "Gate", "Reload"],
  // New: the loop's accessible name and what it is doing (also said
  // politely when it changes). The gate is A.4.7's.
  loopLabel: "The loop",
  status: {
    before: "Serving v1, the stale champion, and monitoring for drift.",
    during:
      "Drift detected: retraining a challenger, which must beat the champion by at least 0.01 F1 and clear a 0.50 floor.",
    after: "Serving v2, the promoted challenger. The loop is back at Serve.",
  },
  // New: "View data".
  table: {
    caption: "Realized F1 per unseen batch · commit {commit}, exported {date}",
    batch: "Batch",
    t: "Median t",
    f1: "F1",
    version: "Model",
    event: "Event",
    tick: "at the controller tick after this batch",
  },
} as const;

export type MlopsCopy = typeof mlopsCopy;
