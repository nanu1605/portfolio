import { z } from "zod";
import type { MetricId } from "./metrics";
import { ArchiveItem, Project, type ProjectInput } from "./schema";

// Every project: cards, filters, the bento grid and case-study meta (A.3, A.4).
// Case-study bodies live in `case-studies/<slug>.mdx`.

const raw = [
  {
    slug: "baby",
    title: "Baby",
    oneLiner:
      "A voice assistant for Windows that answers fast from the cloud — and keeps private turns on your PC.",
    tldr: [
      {
        label: "Problem",
        text: "Cloud assistants can't act on your PC, and fully local ones are slow on an 8 GB GPU. I wanted a hands-free assistant that's fast, private where it matters, and safe when it touches the system.",
      },
      {
        label: "What I built",
        text: 'A voice pipeline, a 22-tool agent behind a deterministic safety gate, and a router that picks between four model "brains" — pinning anything private to a local 9B model.',
      },
      {
        label: "Result",
        text: "A public v6.0.1 installer, 1,037 automated tests, and a first token from the cloud in 1.2 s (p50).",
      },
    ],
    role: "Solo — spec, architecture, testing",
    period: "Jun 2026 – present",
    status: "v{baby.version} · Free · Open source (MIT)",
    platform: "Windows 11",
    badges: ["Free", "Open source"],
    filters: ["ml", "products"],
    stack: [
      "Python",
      "FastAPI",
      "faster-whisper",
      "Silero VAD",
      "openWakeWord",
      "Kokoro TTS",
      "Ollama (Qwen 3.5 9B)",
      "OpenRouter",
      "NVIDIA NIM",
      "Gemini",
      "SQLite + sqlite-vec",
      "React",
      "Three.js",
      "Tauri 2",
    ],
    links: [
      { label: "Source", href: "https://github.com/nanu1605/baby" },
      { label: "Download", href: "https://github.com/nanu1605/baby/releases" },
    ],
    metrics: [
      "baby.version",
      "baby.tests",
      "baby.tools",
      "baby.brains",
      "baby.firstToken",
      "baby.stt",
      "baby.sttSmall",
      "baby.vram",
      "baby.gameMode",
      "baby.installer",
      "baby.shell",
      "baby.safetyCases",
      "baby.decisions",
      "baby.models",
      "baby.soak",
      "baby.bargein",
    ],
    readout: "{baby.tools} tools · {baby.tests} tests",
    featured: true,
    order: 1,
    accent: "baby",
    aiNative: true,
    caseStudy: true,
    howBuilt:
      "I wrote the plan and made the calls — 155 of them are logged in the repo's decision record. I ran the model benchmarks and every field test on my own PC, and reviewed each phase. Claude Code wrote much of the implementation.",
    cover: { kind: "demo", screen: "baby/baby-brain-idle.png" },
  },
  {
    slug: "vyro",
    title: "VYRO",
    oneLiner:
      "Know your machine. A Windows hardware monitor that reads sensors directly and stays light on your PC.",
    tldr: [
      {
        label: "Problem",
        text: "Hardware monitors tend to be heavy, cluttered, or built on someone else's monitoring library. I wanted one that's light, good-looking, and talks to the hardware itself.",
      },
      {
        label: "What I built",
        text: "A Rust sensor engine that runs as a Windows service, plus a Tauri + Svelte app with animated gauges, seven days of history, alerts, game frame rates, fan control and an encrypted phone view.",
      },
      {
        label: "Result",
        text: "Eleven public releases in about three weeks. At v0.2.0 it measured 0.46% CPU and about 125 MB of RAM with the window open; the v1.4.1 installer is 11.6 MB.",
      },
    ],
    role: "Product owner and architect; field testing on real hardware",
    period: "Sep – Oct 2026 (v1.4.1 on 20 Oct 2026)",
    // A.4.2 says open source and links the repo; the repo is going private.
    status: "Beta · Free download · a Jainav Infotech product",
    platform: "Windows 10 (21H2+) and 11, x64",
    badges: ["Beta", "Free"],
    filters: ["products", "infra"],
    stack: [
      "Rust",
      "Tauri 2",
      "Svelte 5",
      "TypeScript",
      "SQLite",
      "Three.js",
      "Cloudflare Workers",
    ],
    links: [
      {
        label: "Download",
        href: "https://github.com/nanu1605/vyro-releases/releases",
      },
      {
        label: "Product page",
        href: "https://jainavinfotech.in/products/vyro",
        requires: "jainavLive",
      },
    ],
    metrics: [
      "vyro.version",
      "vyro.inapp",
      "vyro.cpu",
      "vyro.ram",
      "vyro.startup",
      "vyro.installer",
      "vyro.poll",
      "vyro.releases",
      "vyro.views",
      "vyro.themes",
      "vyro.tests",
      "vyro.axe",
      "vyro.tsTypes",
    ],
    readout: "v{vyro.version} · {vyro.installer} installer",
    featured: true,
    order: 2,
    accent: "vyro",
    aiNative: true,
    caseStudy: true,
    howBuilt:
      "I wrote the product plan and the V2 plan, made the architecture and product decisions, and checked every release on real hardware. That included reference readings against HWMonitor (power matched the 88 W limit under Cinebench) and anti-cheat checks with real games. Claude Code wrote most of the implementation.",
    cover: { kind: "demo", screen: "vyro/vyro-dashboard.png" },
  },
  {
    slug: "reservoir-rl",
    title: "Reservoir RL",
    oneLiner:
      "Teaching PPO agents to run a reservoir for a year — trading flood risk against water supply and river health.",
    tldr: [
      {
        label: "Problem",
        text: "A reservoir operator can't maximise everything. Holding water protects supply but risks floods; releasing it prevents floods but can starve the river and the people downstream.",
      },
      {
        label: "What I built",
        text: "A custom Gymnasium environment for a 365-day year, eight PPO agents trained under different objective weightings, and an honest comparison with a conventional rule-curve policy.",
      },
      {
        label: "Result",
        text: "The balanced agent cut the flood penalty from 82.4 to 1.7 and the supply deficit from 194.7 to 183.4. The rule curve still wins on ecology.",
      },
    ],
    role: "Solo research project",
    period: "Jun 2026",
    badges: [],
    filters: ["ml"],
    stack: [
      "Python 3.12",
      "Gymnasium",
      "Stable-Baselines3 (PPO)",
      "NumPy",
      "Matplotlib",
      "pytest",
    ],
    links: [
      { label: "Source", href: "https://github.com/nanu1605/reservoir-rl" },
    ],
    metrics: [
      "rl.flood",
      "rl.supply",
      "rl.eco",
      "rl.agents",
      "rl.steps",
      "rl.dry",
      "rl.tests",
    ],
    readout: "Flood penalty {rl.flood}",
    featured: true,
    order: 3,
    aiNative: true,
    caseStudy: true,
    howBuilt:
      "I designed the environment, the experiments and the evaluation, ran them, and wrote up the findings; Claude Code helped write the code.",
    cover: { kind: "demo" },
  },
  {
    slug: "probabilistic-forecasting",
    title: "Probabilistic forecasting",
    oneLiner:
      "DeepAR was the most accurate model I tested — and the most overconfident.",
    tldr: [
      {
        label: "Problem",
        text: 'A forecast\'s intervals matter as much as its point estimate. If "90%" intervals catch the truth only 74% of the time, every decision built on them is miscalibrated.',
      },
      {
        label: "What I built",
        text: "A reproduction of DeepAR on four years of hourly Beijing PM2.5 data, benchmarked against seasonal-naive, ARIMA and ETS with proper scoring rules, plus a calibration diagnosis and an attempted fix.",
      },
      {
        label: "Result",
        text: "DeepAR led on accuracy (CRPS 43.6 vs ARIMA's 47.4). But its 90% intervals covered only 74% of outcomes, and post-hoc recalibration didn't fix that under the test period's shift.",
      },
    ],
    role: "Solo",
    period: "May 2026",
    badges: [],
    filters: ["ml"],
    stack: [
      "Python 3.12",
      "GluonTS (PyTorch)",
      "statsmodels",
      "pmdarima",
      "properscoring",
      "scikit-learn",
      "MLflow",
      "DVC",
      "pytest",
    ],
    links: [
      {
        label: "Source",
        href: "https://github.com/nanu1605/probabilistic-forecasting",
      },
      {
        label: "Report",
        href: "https://github.com/nanu1605/probabilistic-forecasting/blob/main/report/report.md",
      },
    ],
    metrics: [
      "fc.crps",
      "fc.rmse",
      "fc.cov90",
      "fc.ece",
      "fc.horizon",
      "fc.recal",
      "fc.oracle",
      "fc.data",
      "fc.tests",
    ],
    readout: "90% intervals covered {fc.cov90}",
    featured: true,
    order: 4,
    aiNative: true,
    caseStudy: true,
    howBuilt:
      "I designed the experiments and the evaluation, ran them, and wrote up the findings; Claude Code helped write the code.",
    cover: { kind: "demo" },
  },
  {
    slug: "mlops-drift-loop",
    title: "MLOps drift loop",
    oneLiner:
      "A model that notices the world changed, retrains itself, and only ships the new version if it wins.",
    tldr: [
      {
        label: "Problem",
        text: "Code doesn't rot; models do. When traffic drifts, a classifier quietly gets worse until someone notices.",
      },
      {
        label: "What I built",
        text: "A closed loop for a network-intrusion classifier: label-free drift detection, automatic retraining, a champion/challenger gate, and a hot reload of the serving API — with no human in the path.",
      },
      {
        label: "Result",
        text: "After a synthetic shift that included a new attack type, realized F1 recovered automatically from 0.27 to 0.78, measured on unseen traffic.",
      },
    ],
    role: "Solo",
    period: "Apr 2026",
    badges: [],
    filters: ["ml", "infra"],
    stack: [
      "Python 3.12",
      "scikit-learn",
      "MLflow",
      "Evidently",
      "FastAPI",
      "Prometheus",
      "Grafana",
      "DVC",
      "pandera",
      "Docker Compose",
      "Kubernetes",
      "GitHub Actions",
    ],
    links: [
      {
        label: "Source",
        href: "https://github.com/nanu1605/mlops-drift-retrain",
      },
    ],
    metrics: ["mlops.f1", "mlops.base", "mlops.lr", "mlops.tests"],
    readout: "F1 {mlops.f1}",
    featured: true,
    order: 5,
    aiNative: true,
    caseStudy: true,
    howBuilt:
      "I wrote the execution spec and owned the evaluation design and its honesty checks; Claude Code wrote much of the implementation.",
    cover: { kind: "demo" },
  },
  {
    slug: "jainav-platform",
    title: "Jainav Infotech platform",
    oneLiner:
      "My company's website and store: Razorpay checkout, GST invoices and Ed25519-signed licence keys, in English and Hindi.",
    heroOneLiner:
      "My company's website and store — product mini-sites, Razorpay checkout, GST invoices and a licensing API, in English and Hindi.",
    tldr: [
      {
        label: "Problem",
        text: "A product company needs more than a brochure. It has to sell software, issue licence keys and invoices that satisfy Indian GST, and work for Hindi-speaking restaurant owners on their phones.",
      },
      {
        label: "What I built",
        text: "A Next.js + Payload CMS platform, specified in a ~1,000-line spec and built in ten reviewed phases (0–9): content, design system, forms, checkout, invoicing, licensing and store operations.",
      },
      {
        label: "Result",
        text: "About 355 automated tests, Lighthouse accessibility and SEO scores of 100 in local runs, and about 175 KB of initial JavaScript.",
      },
    ],
    role: "Founder, product owner and spec author",
    period: "October 2026 (built 15–18 Oct)",
    status:
      "In launch prep. The code is complete through store operations; the site isn't live yet.",
    badges: ["In launch prep"],
    filters: ["products", "infra"],
    stack: [
      "Next.js 16",
      "React 19",
      "Payload CMS 3",
      "PostgreSQL 17",
      "Tailwind CSS 4",
      "next-intl",
      "Motion",
      "Razorpay",
      "Resend",
      "Cloudflare (R2, Turnstile, Tunnel)",
      "Sentry",
      "Umami",
      "Docker",
      "Caddy",
      "GitHub Actions",
    ],
    links: [
      { label: "Source", href: "https://github.com/nanu1605/jainav-infotech" },
      {
        label: "Live",
        href: "https://jainavinfotech.in",
        requires: "jainavLive",
      },
    ],
    metrics: [
      "jainav.tests",
      "jainav.js",
      "jainav.lighthouse",
      "jainav.size",
      "jainav.spec",
      "jainav.image",
    ],
    readout: "{jainav.tests} tests · EN / हिंदी",
    featured: true,
    order: 6,
    aiNative: true,
    caseStudy: true,
    howBuilt:
      "I wrote the spec, reviewed every phase report, and made the product, legal and design calls. Claude Code built it phase by phase.",
    cover: { kind: "demo" },
  },
  {
    slug: "menumesh",
    title: "MenuMesh",
    oneLiner:
      "QR table ordering for restaurants: guests order from their phone, the kitchen sees it live, and the bill is ready in one tap.",
    tldr: [
      {
        label: "Problem",
        text: "Busy restaurants lose time to paper orders, missed dishes and slow bills — and many ordering apps take a commission on every order.",
      },
      {
        label: "What I built",
        text: "A multi-restaurant SaaS with screens for guests, waiters, the kitchen and the counter, plus a super-admin panel to run client restaurants.",
      },
      {
        label: "Business model",
        text: "Restaurants pay a monthly plan from ₹399 + GST. Guests pay the restaurant directly, and MenuMesh takes no commission.",
      },
    ],
    role: "Founder and product designer",
    status:
      "Pre-launch. It runs on staging today and launches at menumesh.in, which is a holding page for now.",
    platform: "Web (guest phones, staff tablets, kitchen screens, the counter)",
    badges: ["Launching soon"],
    filters: ["products"],
    stack: ["Next.js", "Supabase (PostgreSQL)"],
    links: [
      { label: "menumesh.in", href: "https://menumesh.in" },
      {
        label: "Try the demo",
        href: "https://menumesh.in/demo",
        requires: "menumeshLive",
      },
    ],
    metrics: ["mm.priceFrom", "mm.trial", "mm.plans"],
    readout: "Plans from {mm.priceFrom}",
    featured: false,
    order: 7,
    accent: "menumesh",
    aiNative: true,
    caseStudy: true,
    // A.4.4 gives no text; drafted from §1 and the A.4.4 role (decisions.md).
    howBuilt:
      "I designed the product — the guest, waiter, kitchen and counter flows — and made the architecture and product decisions. Claude Code wrote much of the implementation.",
    cover: { kind: "schematic" },
  },
  {
    slug: "virtual-dressing-room",
    title: "Virtual Dressing Room",
    oneLiner:
      "Try on a garment from a single photo or your webcam — a team project I led in my final year.",
    tldr: [
      {
        label: "Problem",
        text: "Online shoppers can't see how clothes will look on them.",
      },
      {
        label: "What we built",
        text: "A desktop app that warps a garment onto a person's photo with a CP-VTON pipeline — pose estimation, human parsing, geometric matching and a try-on renderer. It runs pretrained models on the CPU through OpenCV's DNN module.",
      },
      {
        label: "My role",
        text: "I led a three-person team, one short of the usual four. I split the work to balance the heavier load, and integrated the pipeline.",
      },
    ],
    role: "Team lead, team of 3",
    context: "Final-year project, Bangalore Institute of Technology",
    period: "Jun 2022 – Mar 2023",
    badges: [],
    filters: ["ml"],
    stack: [
      "Python",
      "OpenCV (DNN module)",
      "Tkinter",
      "CP-VTON (pretrained)",
      "OpenPose (pretrained)",
      "LIP-JPPNet (pretrained)",
    ],
    links: [
      {
        label: "Source",
        href: "https://github.com/nanu1605/Virtual-Dressing-Room",
      },
    ],
    metrics: ["vdr.team"],
    readout: "Team of {vdr.team} · Lead",
    featured: false,
    order: 8,
    aiNative: false,
    caseStudy: true,
    cover: { kind: "schematic" },
  },
  {
    slug: "mycounselhub",
    title: "MyCounselHub",
    oneLiner:
      "An online counselling platform, from booking to payment to a Google Meet link with no manual steps.",
    tldr: [
      {
        label: "Problem",
        text: "A counselling practice needed bookings, payments and video sessions across three services — mental health, dietetics and Ayurveda — without paying for premium automation add-ons.",
      },
      {
        label: "What I built",
        text: "A WordPress + Amelia platform with custom scripts. When a payment succeeds, they create the Google Meet link, add calendar events for the client and the counsellor, issue an invoice, and send a reminder 30 minutes before the session.",
      },
      {
        label: "Result",
        text: "A live platform with onboarded counsellors and active session bookings.",
      },
    ],
    role: "Sole freelance engineer",
    period: "Jun 2025 – Apr 2026",
    status: "Client work · live",
    badges: ["Client work"],
    filters: ["client"],
    stack: [
      "WordPress",
      "Amelia",
      "PHP",
      "Razorpay",
      "Google Calendar and Meet APIs",
      "MySQL",
    ],
    // Linked only with the client's permission (A.4.9).
    links: [{ label: "Live", href: "{{MYCOUNSELHUB_URL}}" }],
    metrics: ["mch.services"],
    readout: "{mch.services} service lines",
    featured: false,
    order: 9,
    aiNative: false,
    caseStudy: true,
    cover: { kind: "schematic" },
  },
] satisfies (ProjectInput & { metrics: MetricId[] })[];

export const projects = z.array(Project).parse(raw);

export const archive = z.array(ArchiveItem).parse([
  {
    title: "F1 Insights",
    line: "A Formula 1 stats site: champions, circuits, drivers and standings back to 1950. Its data source, the Ergast API, has since been retired.",
    stack: ["React"],
    year: 2025,
    repo: "https://github.com/nanu1605/f1-website",
  },
  {
    title: "Attendance System",
    line: "An Android app for colleges: admins add students and faculty; faculty run sessions and mark attendance.",
    stack: ["Java", "SQLite"],
    year: 2022,
    repo: "https://github.com/nanu1605/Attendence-System",
  },
  {
    title: "Rain Forecast",
    line: "Rainfall forecasting from historical data with auto-ARIMA.",
    stack: ["R"],
    year: 2023,
    repo: "https://github.com/nanu1605/Rain-forecast-using-AUTO-ARIMA-model",
  },
  {
    title: "Flutter Calculator",
    line: "A basic calculator in Flutter for mobile, web and desktop.",
    stack: ["Flutter"],
    year: 2023,
    repo: "https://github.com/nanu1605/flutter_calculator",
  },
]);

export const workIntro =
  "Case studies first, then the archive. Every number links to where it was measured.";
