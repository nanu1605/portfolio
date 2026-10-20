import { metrics, type MetricId } from "@content/metrics";

// Server-side helpers shared by the centerpiece folders.

/** A figure's source link, from a metric's source (Appendix C). */
export const source = (id: MetricId) => ({
  href: metrics[id].source,
  label: "Source",
});

/** Lucide icons inside flows and step lists. */
export const icon = "size-4 text-fg-muted";
