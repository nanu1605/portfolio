import { MetricMap, type Metric, type MetricInput } from "./schema";

// Every number on the site, with its source (spec Appendix C.1). Components
// reference these by id; copy uses `{metric.id}` where a value can change.
// Every source path was checked on GitHub on 20 Oct 2026.

const gh = (repo: string, branch: string, path = "") =>
  path === ""
    ? `https://github.com/nanu1605/${repo}`
    : `https://github.com/nanu1605/${repo}/${path.endsWith("/") ? "tree" : "blob"}/${branch}/${path.replace(/\/$/, "")}`;

const baby = (path: string) => gh("baby", "master", path);
// The VYRO repo is going private (Tanishq, 20 Oct 2026), so its numbers name
// the file as text instead of linking it.
const vyro = (path: string, measuredOn?: string) => ({
  source: gh("vyro", "main", path),
  linkSource: false,
  measuredOn: [measuredOn, `VYRO ${path}, private repo`]
    .filter(Boolean)
    .join(" · "),
});
const jainav = (path: string) => gh("jainav-infotech", "main", path);
const rl = (path: string) => gh("reservoir-rl", "main", path);
const fc = (path: string) => gh("probabilistic-forecasting", "main", path);
const mlops = (path: string) => gh("mlops-drift-retrain", "master", path);

const pecanSearch =
  "https://github.com/search?q=author%3Ananu1605+is%3Apr+is%3Amerged+repo%3APecanProject%2Fpecan&type=pullrequests";
// The resume is the only source for the Bosch and team-size numbers.
const resume = "/resume";
// Pre-launch pricing, read on the staging site, which is never linked (A.4.4).
const menumeshPricing = {
  source: "https://staging.menumesh.in/pricing",
  linkSource: false,
  measuredOn: "pre-launch pricing, staging site, 20 Oct 2026",
};

const raw = {
  "oss.merged": {
    value: "16",
    label: "merged PRs to PEcAn and LitmusChaos",
    source:
      "https://github.com/search?q=author%3Ananu1605+is%3Apr+is%3Amerged+repo%3APecanProject%2Fpecan+repo%3Alitmuschaos%2Flitmus&type=pullrequests",
  },
  "oss.pecan": {
    value: "15",
    label: "merged PRs to PecanProject/pecan, opened Jul–Sep 2022",
    source: pecanSearch,
  },
  "oss.litmus": {
    value: "#4186",
    label: "merged 27 Oct 2023",
    source: "https://github.com/litmuschaos/litmus/pull/4186",
  },

  "bosch.years": {
    value: "1.5 years",
    label: "Jul 2023 – Jan 2025",
    source: resume,
  },
  "bosch.deploy": {
    value: "−60%",
    label: "deployment time, after CI/CD pipelines",
    source: resume,
  },
  "bosch.availability": {
    value: "+20%",
    label: "availability",
    source: resume,
  },
  "bosch.scalability": {
    value: "+30%",
    label: "scalability (Docker + Kubernetes autoscaling)",
    source: resume,
  },
  "bosch.manual": {
    value: "−60%",
    label: "manual intervention",
    source: resume,
  },
  "bosch.build": {
    value: "−40%",
    label: "build time (Jenkins plugin + automation)",
    source: resume,
  },
  "bosch.hours": {
    value: "~20 h/week",
    label: "operational effort saved (stated for each of the two initiatives)",
    source: resume,
  },

  "baby.version": {
    value: "6.0.1",
    label: "latest release",
    source: "https://github.com/nanu1605/baby/releases",
    note: "Live value from GitHub releases at build time (§4.3); this is the fallback.",
  },
  "baby.tests": {
    value: "1,037",
    label: "automated tests (pytest)",
    source: baby("DECISIONS.md"),
    measuredOn: "v6.0.1",
    note: "DECISIONS.md #155",
  },
  "baby.tools": { value: "22", label: "tools", source: baby("tools/") },
  "baby.brains": {
    value: "4",
    label: "model backends",
    source: baby("README.md"),
  },
  "baby.firstToken": {
    value: "p50 1.2 s · p95 4.0 s",
    label: "cloud first token, GPT-4o-mini via OpenRouter",
    source: baby("bench_results/openrouter/REPORT.md"),
  },
  "baby.stt": {
    value: "~5.5 s",
    label: "speech-to-text per utterance",
    source: baby("DECISIONS.md"),
    measuredOn: "large-v3-turbo, CPU, int8",
    note: "DECISIONS.md #42 and the CHANGELOG",
  },
  "baby.sttSmall": {
    value: "1.4 s",
    label: "speech-to-text with the small model",
    source: baby("CHANGELOG.md"),
    note: "CHANGELOG, Phase 3",
  },
  "baby.vram": {
    value: "7.99 of 8 GB",
    label: "local 9B VRAM in use",
    source: baby("DECISIONS.md"),
    note: "DECISIONS.md #42 and #48",
  },
  "baby.gameMode": {
    value: "~5.5 GB",
    label: "VRAM freed by game mode",
    source: baby("CHANGELOG.md"),
    note: "CHANGELOG, N3",
  },
  "baby.installer": {
    value: "19 MB",
    label: "installer size",
    source: "https://github.com/nanu1605/baby/releases/tag/v6.0.1",
    measuredOn: "v6.0.1 (19,046,592 bytes)",
  },
  "baby.shell": {
    value: "1.7 MB vs ~85 MB; 280 vs 469 ms",
    label: "Tauri vs Electron: installer size; cold start",
    source: baby("DECISIONS.md"),
    note: "DECISIONS.md #121",
  },
  "baby.safetyCases": {
    value: "65",
    label: "safety-gate test cases (20 allow, 22 confirm, 23 deny)",
    source: baby("tests/test_safety.py"),
  },
  "baby.decisions": {
    value: "155",
    label: "logged decisions",
    source: baby("DECISIONS.md"),
  },
  "baby.models": {
    value: "12",
    label: "models benchmarked (7 NVIDIA NIM + 5 OpenRouter)",
    source: baby("bench_results/"),
  },
  "baby.soak": {
    value: "0 of 45",
    label:
      "routed attempts served by NVIDIA NIM (then the primary) on soak day 1, due to congestion",
    source: baby("DECISIONS.md"),
    note: "DECISIONS.md #83",
  },
  "baby.bargein": {
    value: "~100 ms",
    label: "time for playback to stop on barge-in",
    source: baby("CHANGELOG.md"),
  },

  "vyro.version": {
    value: "1.4.1",
    label: "latest release",
    source: "https://github.com/nanu1605/vyro-releases/releases",
    note: "Live value from GitHub releases at build time (§4.3); this is the fallback.",
  },
  "vyro.inapp": {
    value: "0.7–1.7% · 246–270 MB",
    label: "in-app status bar (3-D view: 5.5% · 341 MB)",
    source:
      "https://github.com/nanu1605/portfolio/tree/main/assets/source/screens/vyro",
    measuredOn:
      "1.7 development build, 4K display, screenshots captured 20 Oct 2026",
  },
  "vyro.cpu": {
    value: "0.46%",
    label: "CPU with the window open",
    ...vyro("README.md", "v0.2.0"),
  },
  "vyro.ram": {
    value: "~125 MB",
    label: "RAM with the window open",
    ...vyro("README.md", "v0.2.0; 120 MB at v0.1.4"),
  },
  "vyro.startup": {
    value: "0.76–1.02 s",
    label: "startup to first data",
    ...vyro("README.md", "v0.1.4–0.2.0"),
  },
  "vyro.installer": {
    value: "11.6 MB",
    label: "installer",
    source: "https://github.com/nanu1605/vyro-releases/releases/tag/v1.4.1",
    measuredOn: "v1.4.1",
    note: "Live value from the release's .msi asset at build time (§4.3); this is the fallback.",
  },
  "vyro.poll": {
    value: "~9 ms",
    label: "cost of one poll",
    ...vyro("ROADMAP.md"),
  },
  "vyro.releases": {
    value: "11",
    label: "public releases, 0.1.2 → 1.4.1",
    source: "https://github.com/nanu1605/vyro-releases/tags",
  },
  "vyro.views": { value: "18", label: "views", ...vyro("src/nav.ts") },
  "vyro.themes": {
    value: "6",
    label: "themes, all WCAG AA",
    ...vyro("README.md"),
  },
  "vyro.tests": {
    value: "614 + 132",
    label: "Rust core + frontend tests",
    ...vyro("ROADMAP.md", "V2 milestone"),
  },
  "vyro.axe": {
    value: "664",
    label: "automated accessibility checks in CI",
    ...vyro("ROADMAP.md", "v1.4"),
  },
  "vyro.tsTypes": {
    value: "201",
    label: "TypeScript type files generated from Rust",
    ...vyro("README.md"),
  },

  "jainav.tests": {
    value: "~355",
    label: "142 unit, 158 integration, 49 end-to-end, 6 smoke",
    source: jainav("tests/"),
  },
  "jainav.js": {
    value: "~175 KB",
    label: "initial JS, gzipped (measured 175–178 KB)",
    source: jainav("docs/decisions.md"),
  },
  "jainav.lighthouse": {
    value: "89–95 / 100 / 96 / 100",
    label: "Lighthouse perf / a11y / best practices / SEO (local)",
    source: jainav("docs/decisions.md"),
  },
  "jainav.size": {
    value: "~34k lines · 28 endpoints · 32 routes",
    label: "codebase size",
    source: gh("jainav-infotech", "main"),
    note: "Counted in the repo.",
  },
  "jainav.spec": {
    value: "~1,000 lines",
    label: "the build spec (976 lines)",
    source: jainav("JAINAV_WEBSITE_SPEC.md"),
  },
  "jainav.image": {
    value: "~360 MB",
    label: "Docker image",
    source: jainav("docs/decisions.md"),
  },

  "rl.flood": {
    value: "82.4 → 1.7",
    label: "flood penalty, rule curve → balanced PPO",
    source: rl("README.md"),
    measuredOn: "seed 42, 100 evaluation episodes",
    note: "Also results/shift_results.json.",
  },
  "rl.supply": {
    value: "194.7 → 183.4",
    label: "supply deficit, rule curve → balanced PPO",
    source: rl("README.md"),
    measuredOn: "seed 42, 100 evaluation episodes",
    note: "Also results/shift_results.json.",
  },
  "rl.eco": {
    value: "0.0 vs 22.2",
    label: "ecological deficit, rule curve vs balanced PPO",
    source: rl("README.md"),
    measuredOn: "seed 42, 100 evaluation episodes",
    note: "Also results/shift_results.json.",
  },
  "rl.agents": {
    value: "8",
    label: "PPO agents (objective weightings)",
    source: rl("results/pareto_results.json"),
  },
  "rl.steps": {
    value: "150k",
    label: "training steps per agent",
    source: rl("configs/config.yaml"),
  },
  "rl.dry": {
    value: "supply 183.4 → 349.4; eco 22.2 → 40.5",
    label: "the drier-climate stress test",
    source: rl("results/shift_results.json"),
  },
  "rl.tests": { value: "37", label: "tests", source: rl("tests/") },

  "fc.crps": {
    value: "43.6 vs 47.4",
    label: "CRPS, DeepAR (5-seed mean) vs ARIMA",
    source: fc("metrics/full_results_table.json"),
  },
  "fc.rmse": {
    value: "99.5 vs 103.5",
    label: "RMSE, DeepAR vs ARIMA",
    source: fc("metrics/full_results_table.json"),
  },
  "fc.cov90": {
    value: "74%",
    label: "coverage of nominal 90% intervals (DeepAR, 5-seed mean)",
    source: fc("metrics/deepar_results.json"),
  },
  "fc.ece": {
    value: "0.125",
    label: "ECE, DeepAR 5-seed mean (± 0.027)",
    source: fc("metrics/deepar_results.json"),
  },
  "fc.horizon": {
    value: "0.032 → 0.167",
    label: "ECE at 1 h vs 24 h (best seed)",
    source: fc("metrics/calibration_results.json"),
  },
  "fc.recal": {
    value: "0.090 → 0.098",
    label: "test ECE before → after recalibration (same run)",
    source: fc("metrics/recalibration_results.json"),
  },
  "fc.oracle": {
    value: "0.020",
    label: "ECE with a diagnostic fit on the test period",
    source: fc("metrics/recalibration_results.json"),
  },
  "fc.data": {
    value: "35,064 rows · 59 windows · 5 seeds",
    label: "the setup",
    source: fc("README.md"),
  },
  "fc.tests": { value: "50", label: "tests", source: fc("tests/") },

  "mlops.f1": {
    value: "0.27 → 0.78",
    label:
      "realized F1, stale champion → after automatic promotion (unseen batches)",
    source: mlops("experiments/drift_experiment.md"),
  },
  "mlops.base": {
    value: "0.576",
    label: "random-forest F1 in distribution",
    source: mlops("metrics/train_metrics.json"),
  },
  "mlops.lr": {
    value: "0.688",
    label: "logistic-regression F1 at baseline (reference only)",
    source: mlops("CHANGELOG.md"),
  },
  "mlops.tests": { value: "54", label: "tests", source: mlops("tests/") },

  "vdr.team": {
    value: "3",
    label: "team size; Tanishq was lead",
    source: resume,
  },
  "mch.services": {
    value: "3",
    label: "service lines (mental health, dietetics, Ayurveda)",
    source: resume,
  },

  "mm.priceFrom": {
    value: "₹399/month",
    label: "MenuMesh plans from (Starter, before 18% GST)",
    ...menumeshPricing,
  },
  "mm.trial": {
    value: "14 days",
    label: "free trial on the Growth plan",
    ...menumeshPricing,
  },
  "mm.plans": {
    value: "₹399 · ₹899 · ₹1,799",
    label: "Starter · Growth · Pro, a month, before GST",
    ...menumeshPricing,
  },
} satisfies Record<string, MetricInput>;

export type MetricId = keyof typeof raw;
export const metricIds = Object.keys(raw) as MetricId[];
// Same keys as `raw`, so the narrower key type holds.
export const metrics = MetricMap.parse(raw) as Record<MetricId, Metric>;
