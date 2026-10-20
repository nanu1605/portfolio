import { z } from "zod";
import { ProjectSlug } from "./schema";

// Resume-only copy (A.14). Experience, open source, education, skills and
// certifications come from the shared content files.

export const resume = z
  .object({
    summary: z.string(),
    projectsNote: z.string(),
    projects: z
      .array(
        z.object({
          slug: ProjectSlug,
          title: z.string(),
          period: z.string(),
          bullets: z.array(z.string()).min(1).max(3),
        }),
      )
      .min(1),
    /** Section order for the web page and the PDF (§8.10). */
    sections: z.array(
      z.enum([
        "summary",
        "experience",
        "projects",
        "openSource",
        "education",
        "skills",
        "certifications",
      ]),
    ),
  })
  .parse({
    summary:
      "ML and systems engineer. A year and a half of DevOps at Bosch Global Software Technologies, a freelance full-stack platform in production, and my own products — VYRO and Baby — shipped through Jainav Infotech. Recent independent work in reinforcement learning, MLOps and probabilistic forecasting. Applying for a Master's in AI and ML (2027).",
    projectsNote:
      "Recent projects are built AI-native: I write the specs, make the architecture decisions and test the results; Claude Code writes much of the implementation.",
    projects: [
      {
        slug: "baby",
        title: "Baby — voice assistant for Windows",
        period: "Jun 2026 – present",
        bullets: [
          "A voice pipeline (openWakeWord → Silero VAD → faster-whisper → agent → Kokoro TTS) and a 22-tool agent behind a deterministic allow/confirm/deny safety gate with an audit log.",
          "A router across four LLM backends (OpenRouter, NVIDIA NIM, Gemini, and a local Qwen 3.5 9B on Ollama); privacy-pinned and Hindi (Devanagari) turns stay on the local model.",
          "A public v6.0.1 installer, 1,037 automated tests, and a cloud first token at p50 1.2 s.",
        ],
      },
      {
        slug: "vyro",
        title: "VYRO — low-footprint Windows hardware monitor",
        period: "Sep – Oct 2026",
        bullets: [
          "A Rust sensor engine running as a Windows service (PawnIO driver modules, NVML/NVAPI/ADL), with a Tauri 2 + Svelte 5 app: animated gauges, 7-day history, alerts, game frame rates and fan control.",
          "0.46% CPU and ~125 MB of RAM with the window open (v0.2.0); an 11.6 MB installer; 11 releases in about three weeks, with auto-update.",
        ],
      },
      {
        slug: "reservoir-rl",
        title: "Multi-objective RL for reservoir control",
        period: "Jun 2026",
        bullets: [
          "A custom Gymnasium environment (flood, supply, ecological flow); 8 PPO agents (Stable-Baselines3) trace a Pareto frontier against a rule-curve baseline.",
          "The balanced agent cut the flood penalty from 82.4 to 1.7 and the supply deficit from 194.7 to 183.4 (100 episodes); the rule curve stays Pareto-optimal on ecology.",
        ],
      },
      {
        slug: "probabilistic-forecasting",
        title: "Probabilistic forecasting with calibrated uncertainty",
        period: "May 2026",
        bullets: [
          "Reproduced DeepAR (GluonTS) on Beijing PM2.5 over 5 seeds, against seasonal-naive, ARIMA and ETS, with proper scoring rules.",
          "The most accurate model (CRPS 43.6 vs ARIMA 47.4) was also the most overconfident: its nominal 90% intervals covered 74%, and isotonic recalibration failed under the test period's shift.",
        ],
      },
      {
        slug: "mlops-drift-loop",
        title: "Closed-loop MLOps with drift-triggered retraining",
        period: "Apr 2026",
        bullets: [
          "Evidently drift detection → retraining → an MLflow champion/challenger gate → a hot reload of the FastAPI service; Prometheus/Grafana monitoring; Docker and Kubernetes manifests.",
          "Realized F1 recovered from 0.27 to 0.78 on unseen batches after a synthetic shift, with no human in the loop.",
        ],
      },
      {
        slug: "jainav-platform",
        title: "Jainav Infotech platform",
        period: "Oct 2026",
        bullets: [
          "A Next.js 16 + Payload CMS 3 company site and store: Razorpay checkout, GST invoices, Ed25519-signed licence tokens, English and Hindi, and about 355 automated tests.",
        ],
      },
    ],
    sections: [
      "summary",
      "experience",
      "projects",
      "openSource",
      "education",
      "skills",
      "certifications",
    ],
  });
