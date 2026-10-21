import { z } from "zod";
import prData from "./data/open-source.json";
import { Href } from "./schema";

// Open source (A.6), the Home cards (A.2) and the dot timeline (from GitHub).

const Pr = z.object({
  repo: z.enum(["PecanProject/pecan", "litmuschaos/litmus"]),
  number: z.number().int(),
  title: z.string(),
  opened: z.iso.date(),
  merged: z.iso.date(),
});

/** The 16 merged PRs, oldest merge first. Dates from the GitHub API, 20 Oct 2026. */
export const pullRequests = z
  .object({ source: z.string(), prs: z.array(Pr) })
  .parse(prData);

const Group = z.object({
  title: z.string(),
  items: z.array(z.string()),
  prs: z.array(z.number()),
});

export const openSource = z
  .object({
    title: z.string(),
    intro: z.string(),
    pecan: z.object({
      title: z.string(),
      about: z.array(z.string()),
      stats: z.string(),
      groups: z.array(Group),
      links: z.array(z.object({ label: z.string(), href: Href })),
    }),
    litmus: z.object({ title: z.string(), body: z.string(), link: Href }),
    homeCards: z
      .array(z.object({ title: z.string(), body: z.string() }))
      .length(2),
    labels: z.object({
      prs: z.string(),
      timeline: z.string(),
      caption: z.string(),
      legend: z.object({ pecan: z.string(), litmus: z.string() }),
      columns: z.object({
        project: z.string(),
        pr: z.string(),
        title: z.string(),
        opened: z.string(),
        merged: z.string(),
      }),
    }),
  })
  .parse({
    title: "Open source",
    intro:
      "Open source is where I learned to work in someone else's codebase: code review, CI, and other people's standards.",
    pecan: {
      title: "PEcAn — Google Summer of Code 2022",
      about: [
        "PEcAn (the Predictive Ecosystem Analyzer) is an ecological-forecasting toolbox made of many R packages.",
        'My GSoC project, "PEcAn in CRAN", worked toward publishing those packages on CRAN, R\'s package repository, so anyone could install them with `install.packages()`.',
      ],
      stats: "15 merged PRs · opened Jul – Sep 2022",
      groups: [
        {
          title: "Replaced an orphaned dependency.",
          items: [
            "Swapped `udunits2` for `units` across PEcAn (#2989, #3001, #3002, #3007).",
            "Updated the R CMD check reference logs to match (#2984, #3000).",
          ],
          prs: [2989, 3001, 3002, 3007, 2984, 3000],
        },
        {
          title: "Cleared R CMD check notes and warnings:",
          items: [
            "global variables, documentation and vignettes in PEcAn.DB, PEcAn.MA and PEcAn.emulator (#2960, #2965, #2966, #2971, #2973, #2982, #2983).",
          ],
          prs: [2960, 2965, 2966, 2971, 2973, 2982, 2983],
        },
        {
          title: "Broke circular dependencies.",
          items: [
            "Moved `convert.input` from utils to DB (#3026).",
            "Moved `minimize.GP` from emulator to assim.batch (#3027).",
          ],
          prs: [3026, 3027],
        },
      ],
      links: [
        {
          label: "Final report on Medium",
          href: "https://medium.com/@tanishqjain010/gsoc-2022-pecan-in-cran-final-report-4ef45b55df75",
        },
        {
          label: "All PRs",
          href: "https://github.com/search?q=author%3Ananu1605+is%3Apr+is%3Amerged+repo%3APecanProject%2Fpecan&type=pullrequests",
        },
        {
          label: "GSoC certificate",
          href: "https://drive.google.com/file/d/1X84R03S177Vw8xmS7dxXZu54srL030oG/view?usp=sharing",
        },
      ],
    },
    litmus: {
      title: "LitmusChaos — CNCF chaos-engineering project",
      body: "I moved ChaosCenter's hard-coded UI text into its translation file and replaced it with `getString()` calls. PR #4186, merged October 2023, fixes issue #4147.",
      link: "https://github.com/litmuschaos/litmus/pull/4186",
    },
    homeCards: [
      {
        title: "PEcAn · Google Summer of Code 2022",
        body: "15 merged PRs helping get an ecological-forecasting toolbox ready for CRAN.",
      },
      {
        title: "LitmusChaos",
        body: "A merged PR moving ChaosCenter's hard-coded UI text into its translation file.",
      },
    ],
    // "What the PRs did" is A.6's; the rest are Phase 6 UI strings
    // (docs/decisions.md).
    labels: {
      prs: "What the PRs did",
      timeline: "Merged pull requests",
      caption: "Each dot is one merged pull request, on the day it merged.",
      legend: { pecan: "PEcAn", litmus: "LitmusChaos" },
      columns: {
        project: "Project",
        pr: "PR",
        title: "Title",
        opened: "Opened",
        merged: "Merged",
      },
    },
  });
