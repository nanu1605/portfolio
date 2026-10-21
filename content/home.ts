import { z } from "zod";
import type { MetricId } from "./metrics";
import { Href, Link } from "./schema";

// Home copy (A.2). Projects, experience, open source, principles, skills and
// education come from their own files.

const Section = z.object({
  index: z.string().regex(/^\d\d$/),
  label: z.string(),
  title: z.string().optional(),
  intro: z.string().optional(),
});

const proof: { metric: MetricId; label: string }[] = [
  { metric: "oss.merged", label: "merged PRs to PEcAn and LitmusChaos" },
  {
    metric: "vyro.cpu",
    label: "VYRO's average CPU with its window open (v0.2.0)",
  },
  { metric: "baby.tests", label: "automated tests behind Baby v6" },
  {
    metric: "mlops.f1",
    label: "F1 recovered by my drift-triggered retraining loop",
  },
  { metric: "bosch.years", label: "DevOps engineering at Bosch" },
];

export const home = z
  .object({
    hero: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subline: z.string(),
      statusPill: z.string(),
      ctas: z.array(Link).length(3),
      photoAlt: z.string(),
      altHeadlines: z.array(z.string()),
    }),
    proof: z
      .array(z.object({ metric: z.string(), label: z.string() }))
      .length(5),
    sections: z.object({
      work: Section.extend({ link: Link }),
      company: Section.extend({
        body: z.string(),
        services: z.string(),
        ctas: z.array(Link),
      }),
      experience: Section,
      openSource: Section.extend({ link: Link }),
      principles: Section,
      stack: Section,
      education: Section,
      contact: Section.extend({
        body: z.string(),
        buttons: z.array(
          z.object({ label: z.string(), href: Href.optional() }),
        ),
      }),
    }),
  })
  .parse({
    hero: {
      eyebrow:
        "ML & systems engineer · Founder, Jainav Infotech · Indore, India",
      headline: "From model to machine.",
      subline:
        "I'm Tanishq Jain. I build machine-learning systems and software that hold up outside the notebook — and ship them through my company, Jainav Infotech.",
      // Follows the Now list (content/now.ts).
      statusPill:
        "Now · Shipping VYRO {vyro.version} · Getting MenuMesh ready for launch",
      ctas: [
        { label: "See my work", href: "/#work" },
        { label: "Get in touch", href: "/contact" },
        { label: "Resume", href: "/resume" },
      ],
      photoAlt:
        "Tanishq Jain, smiling, in a grey henley against a black background.",
      altHeadlines: [
        "AI that knows its limits. Software that respects your machine.",
        "I build things that survive contact with reality.",
      ],
    },
    proof,
    sections: {
      work: {
        index: "01",
        label: "Selected work",
        intro:
          "Systems I've designed, built and measured. Every number links to where it was measured.",
        link: { label: "All work →", href: "/work" },
      },
      company: {
        index: "02",
        label: "Company",
        title: "I also run a software company.",
        body: "Jainav Infotech Private Limited is the product company I founded in Indore. We build software we'd want to use ourselves — private by default, light on your machine — and custom software for businesses.",
        services:
          "We also build for clients: custom software & SaaS · AI & ML · Cloud & DevOps · E-commerce & web.",
        ctas: [
          { label: "About the company →", href: "/company" },
          {
            label: "Visit Jainav Infotech",
            href: "https://jainavinfotech.in",
            requires: "jainavLive",
          },
        ],
      },
      experience: { index: "03", label: "Experience" },
      openSource: {
        index: "04",
        label: "Open source",
        link: { label: "Open source →", href: "/open-source" },
      },
      principles: { index: "05", label: "How I work" },
      stack: { index: "06", label: "Stack" },
      education: { index: "07", label: "Education" },
      contact: {
        index: "08",
        label: "Contact",
        title: "Let's talk.",
        body: "I'm open to conversations about ML engineering, research, and building software together.",
        buttons: [
          { label: "Copy email" },
          {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/tanishqjain010/",
          },
          { label: "GitHub", href: "https://github.com/nanu1605" },
          { label: "Send a message", href: "/contact" },
        ],
      },
    },
  });
