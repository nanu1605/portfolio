"use client";

import { useEffect, useId, useState, type PointerEvent } from "react";
import { Chip } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";

// Data arrives as props from StackSection, so no content module (or Zod)
// ships to the browser.
type Skill = { name: string; projects: string[] };
export type StackProps = {
  groups: { group: string; skills: Skill[] }[];
  projects: { slug: string; title: string }[];
  /** Experience entries (`bosch`, `gsoc`): they light up the timeline. */
  entries: { id: string; org: string }[];
};

// "skill:Rust" or "project:vyro".
type Target = `skill:${string}` | `project:${string}`;

/**
 * 06 — Stack (§8.2, A.11). Hovering or focusing a skill previews the
 * projects that used it, and a project previews its skills; a click or tap
 * pins (`aria-pressed`). Below 1024 px the pinned skill lists its projects
 * inline; from 1024 px the project chips sit in a sticky column
 * (cross-device §3, §5).
 */
export function Stack({ groups, projects, entries }: StackProps) {
  const allSkills = groups.flatMap((g) => g.skills);
  const used = new Set(allSkills.flatMap((s) => s.projects));
  const projectChips = projects.filter((p) => used.has(p.slug));
  const [preview, setPreview] = useState<Target | null>(null);
  const [pinned, setPinned] = useState<Target | null>(null);
  const active = preview ?? pinned;
  const skillOf = (target: Target | null) =>
    target?.startsWith("skill:")
      ? allSkills.find((s) => `skill:${s.name}` === target)
      : undefined;
  const activeSkill = skillOf(active);
  const pinnedSkill = skillOf(pinned);

  const skillLit = (skill: Skill) =>
    active === `skill:${skill.name}` ||
    skill.projects.some((slug) => active === `project:${slug}`);
  const projectLit = (slug: string) =>
    active === `project:${slug}` ||
    !!activeSkill?.projects.some((id) => id === slug);

  // The highlight is visual; screen readers get each chip's links as its
  // description. Experience ids name their organisation.
  const id = useId();
  const nameOf = (slug: string) =>
    projects.find((p) => p.slug === slug)?.title ??
    entries.find((e) => e.id === slug)?.org ??
    slug;
  const skillsOf = (slug: string) =>
    allSkills.filter((s) => s.projects.includes(slug)).map((s) => s.name);

  // Bosch and GSoC light up their entries in 03 — Experience.
  useEffect(() => {
    const els = (activeSkill?.projects ?? [])
      .filter((id) => entries.some((e) => e.id === id))
      .flatMap((id) => [...document.querySelectorAll(`[data-entry="${id}"]`)]);
    for (const el of els) el.setAttribute("data-highlight", "");
    return () => {
      for (const el of els) el.removeAttribute("data-highlight");
    };
  }, [activeSkill, entries]);

  const handlers = (target: Target, lit: boolean, describedBy: string) => ({
    pressed: pinned === target,
    // A pinned chip is filled instead (aria-pressed).
    "data-highlight": (lit && pinned !== target) || undefined,
    "aria-describedby": describedBy,
    onClick: () => setPinned(pinned === target ? null : target),
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === "mouse") setPreview(target);
    },
    onPointerLeave: () => setPreview(null),
    onFocus: () => setPreview(target),
    onBlur: () => setPreview(null),
  });

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="flex flex-col gap-10 lg:col-span-8">
        {groups.map((group, gi) => (
          <div key={group.group} className="flex flex-col gap-4">
            <h3 className="font-mono text-mono-label uppercase text-fg-subtle">
              {group.group}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill, si) => (
                <li key={skill.name}>
                  {skill.projects.length > 0 ? (
                    <>
                      <Chip
                        {...handlers(
                          `skill:${skill.name}`,
                          skillLit(skill),
                          `${id}-${gi}-${si}`,
                        )}
                      >
                        {skill.name}
                      </Chip>
                      <span id={`${id}-${gi}-${si}`} hidden>
                        {skill.projects.map(nameOf).join(", ")}
                      </span>
                    </>
                  ) : (
                    // No linked project: the chip's shape, dashed and inert.
                    <span className="inline-flex min-h-11 items-center rounded-full border border-dashed border-border px-4 text-small text-fg-muted pointer-fine:min-h-9">
                      {skill.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {pinnedSkill && group.skills.includes(pinnedSkill) && (
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-small text-fg-muted lg:hidden">
                <span className="font-mono text-mono-label text-fg-subtle">
                  {pinnedSkill.name} →
                </span>
                {pinnedSkill.projects.map((slug) =>
                  projects.some((p) => p.slug === slug) ? (
                    <TextLink key={slug} href={`/work/${slug}`}>
                      {nameOf(slug)}
                    </TextLink>
                  ) : (
                    <span key={slug}>{nameOf(slug)}</span>
                  ),
                )}
              </p>
            )}
          </div>
        ))}
      </div>
      <ul className="hidden content-start gap-2 self-start lg:sticky lg:top-[calc(var(--header-h)_+_2rem)] lg:col-span-4 lg:flex lg:flex-wrap">
        {projectChips.map((p, pi) => (
          <li key={p.slug}>
            <Chip
              {...handlers(
                `project:${p.slug}`,
                projectLit(p.slug),
                `${id}-p${pi}`,
              )}
            >
              {p.title}
            </Chip>
            <span id={`${id}-p${pi}`} hidden>
              {skillsOf(p.slug).join(", ")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
