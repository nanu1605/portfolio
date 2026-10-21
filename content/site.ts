import { z } from "zod";
import { Href } from "./schema";

// Identity, links, nav and SEO defaults (A.1), plus the launch flags (§4.2).

const Page = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
});

export const site = z
  .object({
    name: z.string(),
    role: z.string(),
    location: z.string(),
    timezone: z.string(),
    email: z.email(),
    links: z.object({
      github: Href,
      linkedin: Href,
      medium: Href,
      x: Href,
    }),
    nav: z.array(z.object({ label: z.string(), href: Href })),
    /** The header's ghost button and the menu's last link (§8.1). */
    resume: z.object({ label: z.string(), href: Href }),
    seo: z.object({
      titleTemplate: z.string().includes("%s"),
      description: z.string(),
      pages: z.record(z.string(), Page),
    }),
    flags: z.object({
      /** Adds the public MenuMesh demo link (A.4.4). */
      menumeshLive: z.boolean(),
      /** Turns on links to jainavinfotech.in (A.7). */
      jainavLive: z.boolean(),
    }),
  })
  .parse({
    name: "Tanishq Jain",
    role: "ML & systems engineer",
    location: "Indore, India",
    timezone: "IST, UTC+5:30",
    email: "tanishqjain010@gmail.com",
    links: {
      github: "https://github.com/nanu1605",
      linkedin: "https://www.linkedin.com/in/tanishqjain010/",
      medium: "https://medium.com/@tanishqjain010",
      x: "https://x.com/tanishq11567281",
    },
    nav: [
      { label: "Work", href: "/work" },
      { label: "Company", href: "/company" },
      { label: "About", href: "/about" },
      { label: "Open source", href: "/open-source" },
      { label: "Now", href: "/now" },
    ],
    resume: { label: "Resume", href: "/resume" },
    seo: {
      titleTemplate: "%s — Tanishq Jain",
      description:
        "I build machine-learning systems and software that hold up outside the notebook, and ship them through my company, Jainav Infotech. Based in Indore, India.",
      // Case studies use `{title}` and `{oneLiner}` from projects.ts.
      pages: {
        "/": { title: "Tanishq Jain — ML & systems engineer" },
        "/work": {
          title: "Work",
          description:
            "Case studies in ML systems, desktop software and product engineering: Baby, VYRO, reservoir RL, probabilistic forecasting, an MLOps loop and more.",
        },
        "/company": {
          title: "Jainav Infotech",
          description:
            "The software company I founded in Indore: MenuMesh, VYRO and Baby, plus custom software for businesses.",
        },
        "/about": {
          title: "About",
          description:
            "How I got from Bosch's pipelines to building ML systems and my own products.",
        },
        "/open-source": {
          title: "Open source",
          description:
            "Google Summer of Code 2022 with PEcAn and a merged contribution to LitmusChaos.",
        },
        "/now": {
          title: "Now",
          description: "What I'm working on this month.",
        },
        "/uses": {
          title: "Uses",
          description: "The hardware and tools I build and test on.",
        },
        "/resume": {
          title: "Resume",
          description: "My resume, generated from the same data as this site.",
        },
        "/contact": {
          title: "Contact",
          description: "Email me or send a message.",
        },
        // Phase 6: the privacy note's own first sentence (A.13).
        "/privacy": {
          title: "Privacy",
          description: "This site sets no cookies and runs no ad trackers.",
        },
      },
    },
    flags: { menumeshLive: false, jainavLive: false },
  });
