import { z } from "zod";
import jainavJson from "./data/jainav-platform.json";
import mlopsJson from "./data/mlops-drift-loop.json";
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
    // A note until the per-batch series is exported (§10.7); never hand-drawn.
    per_batch_series: z.string(),
  })
  .parse(mlopsJson);
