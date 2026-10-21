import Link from "next/link";
import { microcopy } from "@content/microcopy";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { pageMetadata } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { resumeHeader, resumeSections, type Entry } from "@/lib/resume";

export const metadata = pageMetadata("/resume");

const link =
  "underline decoration-1 underline-offset-[0.2em] transition-ui hover:text-accent";

function EntryTitle({ entry }: { entry: Entry }) {
  return entry.href ? (
    <Link href={entry.href} className={link}>
      {entry.title}
    </Link>
  ) : (
    entry.title
  );
}

/**
 * The web resume (§8.10): the PDF's data in one column, the PDF button at
 * the top. Phones put dates on their own line; print forces the light
 * tokens and A4 margins and keeps entries whole (globals.css).
 */
export default function Resume() {
  return (
    <div className="px-page py-section pt-12 md:pt-16 print:p-0">
      <Breadcrumbs path="/resume" />
      <article className="mx-auto flex max-w-text flex-col gap-12 print:gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-h1">{resumeHeader.name}</h1>
            <Button
              href="/resume.pdf"
              download
              variant="secondary"
              className="self-start print:hidden"
            >
              {microcopy.palette.actions.resume}
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-mono-label text-fg-muted">
            {resumeHeader.contacts.map((c) => (
              <li key={c.text}>
                {c.href ? (
                  <a href={c.href} className={link}>
                    {c.text}
                  </a>
                ) : (
                  c.text
                )}
              </li>
            ))}
          </ul>
        </header>

        {resumeSections.map((s) => (
          <section
            key={s.id}
            aria-labelledby={`resume-${s.id}`}
            className="flex flex-col gap-5 print:gap-3"
          >
            <h2
              id={`resume-${s.id}`}
              className="border-b border-border pb-2 font-mono text-mono-label uppercase text-fg-subtle"
            >
              {s.title}
            </h2>
            {s.note && <p className="text-small text-fg-muted">{s.note}</p>}
            {s.text && <p className="text-fg-muted">{s.text}</p>}
            {s.entries && (
              <ul className="flex flex-col gap-6 print:gap-3">
                {s.entries.map((e) => (
                  <li
                    key={e.title}
                    className="flex flex-col gap-2 break-inside-avoid"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                      <h3 className="font-semibold text-fg">
                        <EntryTitle entry={e} />
                      </h3>
                      <p className="shrink-0 font-mono text-mono-label text-fg-subtle">
                        {e.period}
                      </p>
                    </div>
                    {e.org && (
                      <p className="text-small text-fg-muted">{e.org}</p>
                    )}
                    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-small text-fg-muted marker:text-fg-subtle">
                      {e.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
            {s.lines && (
              <ul className="flex flex-col gap-2 text-small text-fg-muted">
                {s.lines.map((l) => (
                  <li key={l.label} className="break-inside-avoid">
                    <strong className="font-semibold text-fg">
                      {l.href ? (
                        <a href={l.href} className={link}>
                          {l.label}
                        </a>
                      ) : (
                        l.label
                      )}
                    </strong>{" "}
                    — {l.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
