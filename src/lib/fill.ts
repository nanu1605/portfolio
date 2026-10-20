import { metrics } from "@content/metrics";
import { placeholders } from "@content/placeholders";
import { METRIC_REF, PLACEHOLDER } from "@content/schema";

type Values = Partial<Record<string, { value: string }>>;

/**
 * Fills `{metric.id}` references and placeholder fallbacks in a copy string.
 * Returns null while the text still waits on a placeholder that has no
 * fallback, so the caller hides it (spec §0.4: keep it, don't invent it).
 * Pass live metrics from `lib/github.ts` as `values` where they apply.
 */
export function resolve(text: string, values: Values = metrics): string | null {
  let pending = false;
  const out = text
    .replace(PLACEHOLDER, (match, key: string) => {
      const fallback = placeholders[key]?.fallback;
      if (fallback === undefined) pending = true;
      return fallback ?? match;
    })
    .replace(METRIC_REF, (_, id: string) => {
      const metric = values[id];
      if (!metric) throw new Error(`Unknown metric "${id}" in "${text}"`);
      return metric.value;
    });
  return pending ? null : out;
}
