import { metrics, type MetricId } from "@content/metrics";
import { CountUp } from "@/components/motion/count-up";
import { cx } from "@/lib/cx";
import { DataTable } from "./data-table";
import { TextLink } from "./text-link";

/**
 * Where a metric was measured. A source that must not be linked (the
 * MenuMesh staging site) is named as text.
 */
export function Source({
  id,
  className,
}: {
  id: MetricId;
  className?: string;
}) {
  const metric = metrics[id];
  if (!metric.linkSource)
    return (
      <span className={cx("text-fg-subtle", className)}>
        {metric.measuredOn}
      </span>
    );
  return (
    <TextLink href={metric.source} className={className}>
      Source<span className="sr-only">: {metric.label}</span>
    </TextLink>
  );
}

/** Mono number + label + source link (§5.7). The number is never typed in. */
export function Readout({
  id,
  label,
  count = false,
  className,
}: {
  id: MetricId;
  /** Overrides the metric's own label (the proof strip uses A.2's). */
  label?: string;
  count?: boolean;
  className?: string;
}) {
  const metric = metrics[id];
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <p className="font-mono text-readout text-fg">
        {count ? <CountUp value={metric.value} /> : metric.value}
      </p>
      <p className="text-small text-fg-muted">{label ?? metric.label}</p>
      <p className="font-mono text-mono-label text-fg-subtle">
        {metric.measuredOn && metric.linkSource && (
          <span>{metric.measuredOn} · </span>
        )}
        <Source id={id} />
      </p>
    </div>
  );
}

/** A set of metrics as a table: value, what it is, setup and source. */
export function MetricTable({
  caption,
  ids,
}: {
  caption: string;
  ids: MetricId[];
}) {
  return (
    <DataTable
      caption={caption}
      columns={[
        { key: "label", label: "Metric" },
        { key: "value", label: "Value", numeric: true },
        { key: "measuredOn", label: "Measured on" },
        { key: "source", label: "Source" },
      ]}
      rows={ids.map((id) => ({
        label: metrics[id].label,
        value: metrics[id].value,
        measuredOn: metrics[id].linkSource
          ? (metrics[id].measuredOn ?? "—")
          : "—",
        source: <Source id={id} />,
      }))}
    />
  );
}
