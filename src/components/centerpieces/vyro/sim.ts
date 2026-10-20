// Simulated readings for the gauge panel (§10.2). Plausible for a desktop
// CPU and GPU, never measured: the panel says so next to the gauges. Pure
// functions, shared by the server poster and the live panel.

export type Reading = {
  /** Usage, %. */
  cpu: number;
  /** MHz. */
  cpuClock: number;
  gpu: number;
  gpuClock: number;
  /** CPU temperature, °C. */
  temp: number;
  /** CPU fan, RPM. */
  fan: number;
};

/** The sparkline's window: one poll a second, like VYRO, for 60 s. */
export const SAMPLES = 60;
/** Fixed ranges for the sparkline and the fan bar, so they never rescale. */
export const SCALE = { temp: [35, 85], fan: [0, 2400] } as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * One poll. Load is a mean-reverting random walk; the clocks follow load,
 * the temperature lags it and the fan follows the temperature. The bounds
 * keep every shown number at a fixed digit count (10–94 %, four-digit
 * clocks and fan speeds), so tabular figures never change width and the
 * readings never shift the layout.
 */
export function poll(r: Reading, rand: () => number = Math.random): Reading {
  const jitter = (n: number) => (rand() * 2 - 1) * n;
  const cpu = clamp(r.cpu + jitter(10) + (28 - r.cpu) * 0.15, 10, 82);
  const gpu = clamp(r.gpu + jitter(14) + (36 - r.gpu) * 0.15, 10, 94);
  const temp = clamp(
    r.temp + (38 + cpu * 0.5 - r.temp) * 0.3 + jitter(0.6),
    34,
    84,
  );
  return {
    cpu,
    cpuClock: clamp(4300 + cpu * 13 + jitter(160), 3600, 5450),
    gpu,
    gpuClock: clamp(1000 + gpu * 20 + jitter(60), 1000, 2900),
    temp,
    fan: clamp(400 + temp * 22 + jitter(20), 1000, 2200),
  };
}

/** mulberry32: a tiny seeded PRNG, so the poster and the live panel start identical. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The poster's sample state: a minute of seeded polls from a calm start. */
export function start(seed = 7) {
  const rand = seeded(seed);
  let reading: Reading = {
    cpu: 24,
    cpuClock: 4600,
    gpu: 30,
    gpuClock: 1300,
    temp: 50,
    fan: 1500,
  };
  const history: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    reading = poll(reading, rand);
    history.push(reading.temp);
  }
  return { reading, history };
}

export type Start = ReturnType<typeof start>;
