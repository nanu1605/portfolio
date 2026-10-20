import { z } from "zod";
import { SkillGroup } from "./schema";

// The stack, grouped (A.11). `projects` drives the linked highlighting; `bosch`
// and `gsoc` highlight timeline entries instead of projects.

export const skills = z.array(SkillGroup).parse([
  {
    group: "ML & data",
    skills: [
      { name: "PyTorch", projects: ["probabilistic-forecasting"] },
      { name: "GluonTS / DeepAR", projects: ["probabilistic-forecasting"] },
      { name: "Stable-Baselines3 (PPO)", projects: ["reservoir-rl"] },
      { name: "Gymnasium", projects: ["reservoir-rl"] },
      {
        name: "scikit-learn",
        projects: ["mlops-drift-loop", "probabilistic-forecasting"],
      },
      {
        name: "statsmodels / pmdarima",
        projects: ["probabilistic-forecasting"],
      },
      {
        name: "pandas",
        projects: [
          "reservoir-rl",
          "probabilistic-forecasting",
          "mlops-drift-loop",
        ],
      },
      {
        name: "MLflow",
        projects: ["mlops-drift-loop", "probabilistic-forecasting"],
      },
      { name: "Evidently", projects: ["mlops-drift-loop"] },
      {
        name: "DVC",
        projects: ["mlops-drift-loop", "probabilistic-forecasting"],
      },
    ],
  },
  {
    group: "AI applications",
    skills: [
      {
        name: "LLM routing (OpenRouter, NVIDIA NIM, Gemini, Ollama)",
        projects: ["baby"],
      },
      { name: "RAG with sqlite-vec", projects: ["baby"] },
      {
        name: "Speech (faster-whisper, Silero VAD, openWakeWord, Kokoro)",
        projects: ["baby"],
      },
      { name: "Browser automation (Playwright)", projects: ["baby"] },
      { name: "OpenCV DNN", projects: ["virtual-dressing-room"] },
    ],
  },
  {
    group: "Systems & desktop",
    skills: [
      { name: "Rust", projects: ["vyro"] },
      { name: "Tauri 2", projects: ["vyro", "baby"] },
      {
        name: "Windows hardware APIs (NVML, NVAPI, ADL, PawnIO)",
        projects: ["vyro"],
      },
      { name: "Svelte 5", projects: ["vyro"] },
      { name: "SQLite", projects: ["vyro", "baby"] },
      { name: "Three.js", projects: ["vyro", "baby"] },
    ],
  },
  {
    group: "Web & product",
    skills: [
      { name: "TypeScript", projects: ["jainav-platform", "vyro", "menumesh"] },
      { name: "Next.js", projects: ["jainav-platform", "menumesh"] },
      { name: "React", projects: ["jainav-platform", "baby"] },
      { name: "Payload CMS", projects: ["jainav-platform"] },
      { name: "PostgreSQL", projects: ["jainav-platform"] },
      { name: "Supabase", projects: ["menumesh"] },
      { name: "Tailwind CSS", projects: ["jainav-platform"] },
      { name: "FastAPI", projects: ["mlops-drift-loop", "baby"] },
      { name: "WordPress & PHP", projects: ["mycounselhub"] },
      { name: "Razorpay", projects: ["jainav-platform", "mycounselhub"] },
    ],
  },
  {
    group: "DevOps & cloud",
    skills: [
      {
        name: "Docker",
        projects: ["bosch", "mlops-drift-loop", "jainav-platform"],
      },
      { name: "Kubernetes", projects: ["bosch", "mlops-drift-loop"] },
      { name: "Jenkins", projects: ["bosch"] },
      {
        name: "GitHub Actions",
        projects: ["vyro", "baby", "jainav-platform", "mlops-drift-loop"],
      },
      { name: "Terraform", projects: [] },
      { name: "Prometheus & Grafana", projects: ["mlops-drift-loop"] },
      {
        name: "Cloudflare (Workers, R2, Turnstile)",
        projects: ["vyro", "jainav-platform"],
      },
      { name: "AWS", projects: [] },
      { name: "Azure", projects: [] },
      { name: "Oracle Cloud", projects: ["mlops-drift-loop"] },
    ],
  },
  {
    group: "Languages",
    skills: [
      { name: "Python", projects: [] },
      { name: "TypeScript / JavaScript", projects: [] },
      { name: "Rust", projects: [] },
      { name: "R", projects: ["gsoc"] },
      { name: "Go", projects: [] },
      { name: "Java", projects: [] },
      { name: "SQL", projects: [] },
      { name: "Bash", projects: [] },
    ],
  },
]);
