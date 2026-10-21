import { z } from "zod";

// The Uses page (A.10). A line that still holds a placeholder is hidden.

export const uses = z
  .object({
    intro: z.string(),
    labels: z.object({
      desktop: z.string(),
      whyItMatters: z.string(),
      development: z.string(),
    }),
    desktop: z.array(z.string()).min(1),
    whyItMatters: z.array(z.string()),
    development: z.array(z.string()).min(1),
  })
  .parse({
    labels: {
      desktop: "Desktop",
      whyItMatters: "Why it matters",
      development: "Development",
    },
    intro:
      "The machine I build and test on. It's also why some of my design decisions look the way they do.",
    desktop: [
      "AMD Ryzen 7 9700X",
      "MSI B650M GAMING PLUS WIFI",
      "2 × 16 GB DDR5-5600",
      "NVIDIA RTX 5060 Ti (8 GB)",
      "Windows 11",
    ],
    whyItMatters: [
      "The 8 GB GPU is why Baby's speech recognition runs on the CPU.",
      "This board is the first one VYRO's fan control was verified on.",
    ],
    development: [
      "WSL2 (Ubuntu)",
      "Claude Code",
      "Git and GitHub Actions",
      "`uv` for Python, `pnpm` for JavaScript",
      "Visual Studio Code",
    ],
  });
