import { certifications } from "@content/certifications";
import { education } from "@content/education";
import { experience } from "@content/experience";
import { openSource } from "@content/open-source";
import { resume } from "@content/resume";
import { site } from "@content/site";
import { skills } from "@content/skills";
import { resolve } from "./fill";

// One resume for the web page and the PDF (§8.10): the same data as the
// site, in the §8.10 section order. Site paths stay relative; the PDF
// makes them absolute.

export type Entry = {
  title: string;
  org?: string;
  period: string;
  href?: string;
  bullets: string[];
};
export type Line = { label: string; text: string; href?: string };
export type ResumeSection = {
  id: (typeof resume.sections)[number];
  title: string;
  note?: string;
  text?: string;
  entries?: Entry[];
  lines?: Line[];
};

const bare = (url: string) =>
  url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");

/** Name, then the header line (§8.10): no street address, no phone. */
export const resumeHeader = {
  name: site.name,
  contacts: [
    { text: site.email, href: `mailto:${site.email}` },
    { text: bare(site.url), href: site.url },
    { text: bare(site.links.linkedin), href: site.links.linkedin },
    { text: bare(site.links.github), href: site.links.github },
    { text: site.location },
  ],
};

const build: Record<
  ResumeSection["id"],
  () => Omit<ResumeSection, "id" | "title">
> = {
  summary: () => ({ text: resume.summary }),
  experience: () => ({
    entries: experience.map((e) => ({
      title: e.role,
      org: e.orgFull,
      period: resolve(e.period) ?? e.period,
      bullets: e.bullets,
    })),
  }),
  projects: () => ({
    note: resume.projectsNote,
    entries: resume.projects.map((p) => ({
      title: p.title,
      period: p.period,
      href: `/work/${p.slug}`,
      bullets: p.bullets,
    })),
  }),
  // A.6 in two lines: the Home cards.
  openSource: () => ({
    lines: openSource.homeCards.map((c) => ({
      label: c.title,
      text: c.body,
      href: "/open-source",
    })),
  }),
  education: () => ({
    entries: [
      {
        title: education.degree,
        org: education.schoolFull,
        period: education.period,
        bullets: [
          education.grade,
          `${education.courseworkLabel}: ${education.coursework.join(", ")}.`,
        ],
      },
    ],
  }),
  // A.11, one line per group.
  skills: () => ({
    lines: skills.map((g) => ({
      label: g.group,
      text: g.skills.map((s) => s.name).join(", "),
    })),
  }),
  // A line whose title is still a placeholder is hidden.
  certifications: () => ({
    lines: certifications.flatMap((c) => {
      const title = resolve(c.title);
      return title
        ? [{ label: title, text: `${c.issuer}, ${c.date}`, href: c.url }]
        : [];
    }),
  }),
};

export const resumeSections: ResumeSection[] = resume.sections.map((id) => ({
  id,
  title: resume.labels[id],
  ...build[id](),
}));
