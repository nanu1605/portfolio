// Count-up frames for a metric value (§6.2, cross-device §4). Every frame
// keeps the value's own format: prefix, suffix, decimals and grouping.
// "A → B" counts only B, starting from A ("0.27 → 0.78"). Values with any
// other mix of numbers ("p50 1.2 s · p95 4.0 s") don't count.

const NUMBER = /\d[\d,]*(?:\.\d+)?/g;

export function countFrames(value: string): ((t: number) => string) | null {
  const numbers = [...value.matchAll(NUMBER)];
  const arrow = numbers.length === 2 && value.includes("→");
  if (numbers.length !== 1 && !arrow) return null;

  const parse = (text: string) => Number(text.replaceAll(",", ""));
  const target = numbers.at(-1)!;
  const to = parse(target[0]);
  const from = arrow ? parse(numbers[0][0]) : 0;
  const decimals = target[0].split(".")[1]?.length ?? 0;
  const format = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: target[0].includes(","),
  });
  const head = value.slice(0, target.index);
  const tail = value.slice(target.index + target[0].length);

  return (t) =>
    t >= 1 ? value : head + format.format(from + (to - from) * t) + tail;
}

/** The site's ease-out curve, cubic-bezier(0.16, 1, 0.3, 1), approximated. */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
