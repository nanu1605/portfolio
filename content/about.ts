import { z } from "zod";

// The About page (A.8). The timeline, education and certifications come from
// their own files.

export const about = z
  .object({
    title: z.string(),
    story: z.array(z.string()).min(1),
    howIBuild: z.object({
      title: z.string(),
      body: z.array(z.string()).min(1),
    }),
    languages: z.array(z.object({ name: z.string(), level: z.string() })),
    /** Headings for the A.5 and A.14 sections (A.8 "Also on this page"). */
    sections: z.object({
      experience: z.string(),
      education: z.string(),
      certifications: z.string(),
      languages: z.string(),
    }),
  })
  .parse({
    title: "About",
    story: [
      "I'm Tanishq Jain, an ML and systems engineer from Indore, India.",
      "I studied Computer Science and Engineering at Bangalore Institute of Technology. In my final year I led a three-person team building a virtual dressing room. It was my first time wiring several deep-learning models into something a person could actually use. The same year, Google Summer of Code took me into PEcAn, an ecological-forecasting project, where 15 merged pull requests taught me what it takes to make research software installable by anyone.",
      "At Bosch Global Software Technologies I spent a year and a half on the other end of the pipeline: CI/CD, Docker, Kubernetes autoscaling and a custom Jenkins plugin. I learned that software is only as good as the way it's built, tested and shipped.",
      "Then I went independent. As a freelancer I built MyCounselHub, a live counselling platform. And I kept asking a question that has shaped my work since: what happens to an ML system after the demo? My projects since have chased it — a forecaster that turned out to be overconfident, a retraining loop for when data drifts, and reinforcement-learning agents weighing floods against water supply.",
      "I founded Jainav Infotech to ship software people can use: VYRO, a hardware monitor for Windows; Baby, a privacy-first voice assistant; and MenuMesh, QR ordering for restaurants.",
      "Next, I'm applying for a Master's in AI and ML in Europe, to go deeper into the parts I find hardest: learning under uncertainty and distribution shift, and decisions with competing objectives.",
    ],
    howIBuild: {
      title: "How I build",
      body: [
        "I work AI-native. For my recent projects, I write a detailed spec, make the architecture and product decisions, review every phase, and test on real hardware. Claude Code writes much of the implementation.",
        "I think that's what modern engineering looks like. The decisions, the trade-offs and the mistakes are still mine.",
      ],
    },
    languages: [
      { name: "English", level: "proficient" },
      { name: "Hindi", level: "native" },
    ],
    sections: {
      experience: "Experience",
      education: "Education",
      certifications: "Certifications",
      languages: "Languages",
    },
  });
