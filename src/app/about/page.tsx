import { about } from "@content/about";
import { certifications } from "@content/certifications";
import { education } from "@content/education";
import { experience } from "@content/experience";
import { home } from "@content/home";
import { media } from "@content/screens";
import { Reveal } from "@/components/motion/motion";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { Page, pageMetadata } from "@/components/site/page";
import { Card } from "@/components/ui/card";
import { Picture } from "@/components/ui/figure";
import { Timeline } from "@/components/ui/timeline";
import { resolve } from "@/lib/fill";

export const metadata = pageMetadata("/about");

const h2 = "text-h2";

/**
 * About (§8.6, A.8). Phones: the photo (≤ 320 px), then the story. From
 * md: photo (5 cols) beside the story; from lg, with 600 px of height,
 * the photo stays put while the rest scrolls (cross-device §5). The
 * timeline's line draws with scroll (§6.3).
 */
export default function About() {
  const shown = certifications.flatMap((c) => {
    const title = resolve(c.title);
    return title ? [{ ...c, title }] : [];
  });
  return (
    <Page title={about.title}>
      <Breadcrumbs path="/about" />
      <div className="grid gap-12 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-5 lg:row-span-2">
          <div className="max-w-80 md:max-w-none lg:[@media(min-height:600px)]:sticky lg:[@media(min-height:600px)]:top-[calc(var(--header-h)+2rem)]">
            <Picture
              image={media.photo.about}
              alt={home.hero.photoAlt}
              priority
              sizes="(min-width: 1280px) 470px, (min-width: 768px) 38vw, 320px"
              className="aspect-[4/5] rounded-lg border border-border object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 md:col-span-7">
          {about.story.map((p, i) => (
            <p
              key={p}
              className={i === 0 ? "text-body-lg text-fg" : "text-fg-muted"}
            >
              {p}
            </p>
          ))}
          <h2 className={`${h2} pt-6`}>{about.howIBuild.title}</h2>
          {about.howIBuild.body.map((p) => (
            <p key={p} className="text-fg-muted">
              {p}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-16 md:col-span-12 lg:col-span-7 lg:col-start-6">
          <section aria-labelledby="experience" className="flex flex-col gap-8">
            <h2 id="experience" className={h2}>
              {about.sections.experience}
            </h2>
            <Timeline
              draw
              items={experience.map((e) => ({
                id: e.id,
                period: resolve(e.period) ?? e.period,
                title: e.role,
                meta: e.orgFull,
                body: (
                  <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-fg-subtle">
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ),
              }))}
            />
          </section>

          <section aria-labelledby="education" className="flex flex-col gap-6">
            <h2 id="education" className={h2}>
              {about.sections.education}
            </h2>
            <Reveal>
              <Card className="flex flex-col gap-3">
                <h3 className="text-h3">{education.degree}</h3>
                <p className="text-fg-muted">{education.schoolFull}</p>
                <p className="font-mono text-mono-label text-fg-subtle">
                  {education.period} · {education.grade}
                </p>
                <p className="pt-3 font-mono text-mono-label uppercase text-fg-subtle">
                  {education.courseworkLabel}
                </p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-small text-fg-muted">
                  {education.coursework.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </section>

          <section
            aria-labelledby="certifications"
            className="flex flex-col gap-6"
          >
            <h2 id="certifications" className={h2}>
              {about.sections.certifications}
            </h2>
            <ul className="flex flex-col border-t border-border">
              {shown.map((c) => (
                <li key={c.url} className="border-b border-border">
                  <a
                    href={c.url}
                    className="flex min-h-11 flex-col justify-center gap-1 py-3 transition-ui hover:text-accent sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span className="font-semibold">{c.title}</span>
                    <span className="font-mono text-mono-label text-fg-subtle">
                      {c.issuer} · {c.date}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="languages" className="flex flex-col gap-4">
            <h2 id="languages" className={h2}>
              {about.sections.languages}
            </h2>
            <p className="text-fg-muted">
              {about.languages.map((l) => `${l.name} (${l.level})`).join(", ")}
            </p>
          </section>
        </div>
      </div>
    </Page>
  );
}
