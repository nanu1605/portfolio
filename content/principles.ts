import { z } from "zod";
import { Principle } from "./schema";

// "05 — How I work" on Home (A.2), each with its evidence link.

export const principles = z.array(Principle).parse([
  {
    title: "Measure honestly.",
    body: "I report the number that survives scrutiny: unseen data, several seeds, and the limitation next to the result. My forecasting write-up leads with the model's overconfidence, not its accuracy.",
    link: {
      label: "Forecasting case study",
      href: "/work/probabilistic-forecasting",
    },
  },
  {
    title: "Respect the machine.",
    body: "Budgets come first. VYRO targets under 1.5% CPU and 120 MB of RAM; Baby runs speech recognition on the CPU so its local model fits an 8 GB GPU.",
    link: { label: "VYRO case study", href: "/work/vyro" },
  },
  {
    title: "Safe by default.",
    body: "Software that can act on your system should ask first. Baby's safety gate allows, confirms or denies every action and logs it; VYRO only controls fans on a board it has verified.",
    link: { label: "Baby case study", href: "/work/baby" },
  },
  {
    title: "Ship it.",
    body: "From Bosch's pipelines to my own releases: VYRO went through eleven public releases in about three weeks, published with checksums and installed copies updating themselves.",
    link: { label: "VYRO case study", href: "/work/vyro" },
  },
  {
    title: "Spec first, then build with agents.",
    body: "I write detailed specs, make the architecture and product calls, review every phase and test on real hardware. Claude Code writes much of the implementation. The decisions — and the mistakes — are mine.",
    link: { label: "About", href: "/about" },
  },
]);
