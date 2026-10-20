// The signal line (§5.5): noisy on the left, resolving into a clean wave on
// the right. Seeded, so the server and every render produce the same path.

export const SIGNAL_VIEWBOX = { width: 1200, height: 120 };

function random(seed: number) {
  // mulberry32
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function signalPath(seed = 7, points = 240) {
  const { width, height } = SIGNAL_VIEWBOX;
  const next = random(seed);
  const amp = height * 0.3;
  const waves = Array.from({ length: 3 }, () => ({
    freq: 14 + next() * 26,
    phase: next() * Math.PI * 2,
  }));

  const coords: string[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const noise =
      (waves.reduce(
        (sum, w) => sum + Math.sin(t * w.freq * Math.PI * 2 + w.phase),
        0,
      ) /
        3 +
        (next() - 0.5) * 0.9) *
      (1 - smoothstep(0.15, 0.65, t));
    const clean = Math.sin(t * Math.PI * 2 * 3.5) * smoothstep(0.3, 0.8, t);
    const y = height / 2 + (noise * 1.1 + clean * 0.8) * amp;
    coords.push(`${(t * width).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${coords.join("L")}`;
}
