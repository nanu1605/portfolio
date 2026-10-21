import { z } from "zod";
import jainavJson from "./data/jainav-platform.json";
import mlopsJson from "./data/mlops-drift-loop.json";
import timelineJson from "./data/mlops-timeline.json";
import forecastingJson from "./data/probabilistic-forecasting.json";
import reservoirJson from "./data/reservoir-rl.json";
import vyroJson from "./data/vyro.json";

// Chart data (Appendix B), extracted from the public repos' result files on
// 20 Oct 2026. Strict objects, so a renamed key fails instead of vanishing.

const MeanSd = z.tuple([z.number(), z.number()]);
const Penalties = z.strictObject({
  flood: MeanSd,
  supply: MeanSd,
  eco: MeanSd,
});
const Weights = z.tuple([z.number(), z.number(), z.number()]);

export const reservoir = z
  .strictObject({
    source: z.string(),
    rule_baseline: Penalties.extend({ reward: z.number() }),
    pareto_agents: z
      .array(
        Penalties.extend({
          name: z.string(),
          seed: z.number().int(),
          weights: Weights,
        }),
      )
      .length(8),
    balanced_headline_seed42: z.strictObject({
      nominal: Penalties.extend({ reward: z.number() }),
      drier_climate: Penalties.extend({ reward: z.number() }),
      drier_climate_definition: z.string(),
      weights: Weights,
    }),
    random_policy: Penalties.extend({ reward: z.number() }),
    notes: z.array(z.string()),
    learning_curve_seed42: z
      .strictObject({
        timesteps: z.array(z.number()),
        episode_reward: z.array(z.number()),
        note: z.string(),
      })
      .refine(
        (c) => c.timesteps.length === c.episode_reward.length,
        "series lengths differ",
      ),
  })
  .parse(reservoirJson);

const Nine = z.array(z.number().min(0).max(1)).length(9);
const Cell = z.union([z.number(), z.string()]);

export const forecasting = z
  .strictObject({
    source: z.string(),
    levels: Nine,
    table: z.array(
      z.strictObject({
        Model: z.string(),
        MAE: Cell,
        RMSE: Cell,
        CRPS: Cell,
        "Cov@50": Cell,
        "Cov@80": Cell,
        "Cov@90": Cell,
        ECE: Cell,
      }),
    ),
    calibration_curves: z.record(z.string(), Nine),
    deepar_per_seed: z.record(
      z.string(),
      z.strictObject({
        crps: z.number(),
        rmse: z.number(),
        mae: z.number(),
        ece: z.number(),
        cov90: z.number(),
      }),
    ),
    best_seed_curve_ece: z.number(),
    per_horizon_ece_best_seed: z.record(z.string(), z.number()),
    recalibration_same_run: z.strictObject({
      test_ece: MeanSd,
      val_ece: MeanSd,
      cov90: MeanSd,
      crps: MeanSd,
      width90: MeanSd,
      oracle_test_fit_ece: z.number(),
    }),
    winkler90: z.record(z.string(), z.number()),
    notes: z.array(z.string()),
  })
  .parse(forecastingJson);

export const vyroData = z
  .strictObject({
    reference_pc: z.string(),
    footprint: z.array(
      z.strictObject({
        metric: z.string(),
        target: z.string(),
        v0_1_4: z.string(),
        v0_2_0: z.string(),
      }),
    ),
    installer_mb: z.record(z.string(), z.number()),
    optimisations: z.array(
      z.strictObject({
        change: z.string(),
        before: z.string(),
        after: z.string(),
      }),
    ),
    releases: z.array(
      z.strictObject({
        v: z.string(),
        date: z.iso.date(),
        name: z.string().optional(),
        what: z.string(),
      }),
    ),
    release_tags_total: z.number().int(),
    note: z.string(),
  })
  .parse(vyroJson);

export const jainavPlatform = z
  .strictObject({
    phases: z.array(
      z.strictObject({
        p: z.number().int(),
        name: z.string(),
        status: z.string().optional(),
      }),
    ),
    built: z.string(),
    order_to_licence: z.array(z.string()).length(7),
  })
  .parse(jainavJson);

export const mlopsLoop = z
  .strictObject({
    documented_levels: z.strictObject({
      stale_champion_f1: z.number(),
      after_promotion_f1: z.number(),
    }),
    // Where the per-batch series lives: mlops-timeline.json (§10.7's export).
    per_batch_series: z.string(),
  })
  .parse(mlopsJson);

const mean = (values: number[]) =>
  values.reduce((sum, v) => sum + v, 0) / values.length;
const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * §10.7's export: the repo's per-batch `timeline` (realized F1 on each
 * unseen batch, and the serving model version), with its provenance. Load
 * fails unless the series agrees with the documented levels the headline
 * quotes: the mean F1 up to and including promotion, and after it.
 */
export const mlopsTimeline = z
  .strictObject({
    source: z.url(),
    commit: z.string().regex(/^[0-9a-f]{7,40}$/),
    command: z.string(),
    patch: z.string(),
    data: z.string(),
    exported: z.iso.date(),
    drift_detected_t: z.number(),
    promoted_t: z.number(),
    // A.4.7: 20 batches of 400 rows.
    timeline: z
      .array(
        z.strictObject({
          t: z.number(),
          f1: z.number().min(0).max(1),
          version: z.enum(["1", "2"]),
        }),
      )
      .length(20),
  })
  .superRefine((d, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    const { timeline } = d;
    if (timeline.some((b, i) => i > 0 && b.t <= timeline[i - 1]!.t))
      fail("timeline: t must increase");
    if (d.drift_detected_t > d.promoted_t)
      fail("drift must be detected before (or as) the challenger is promoted");
    // Promotion happens at a batch's controller tick; v2 serves from the next.
    const at = timeline.findIndex((b) => b.t === d.promoted_t);
    if (at < 0) return fail("promoted_t isn't a batch's t");
    if (timeline.some((b, i) => b.version !== (i <= at ? "1" : "2")))
      fail("v1 must serve up to the promotion tick and v2 after it");
    const f1 = timeline.map((b) => b.f1);
    const levels = mlopsLoop.documented_levels;
    const before = round2(mean(f1.slice(0, at + 1)));
    const after = round2(mean(f1.slice(at + 1)));
    if (before !== levels.stale_champion_f1)
      fail(
        `mean F1 up to promotion is ${before}, documented ${levels.stale_champion_f1}`,
      );
    if (after !== levels.after_promotion_f1)
      fail(
        `mean F1 after promotion is ${after}, documented ${levels.after_promotion_f1}`,
      );
  })
  .parse(timelineJson);
