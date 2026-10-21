import { site } from "@content/site";
import { uses } from "@content/uses";
import { Page, pageMetadata } from "@/components/site/page";
import { Inline } from "@/components/ui/inline";
import { resolve } from "@/lib/fill";

export const metadata = pageMetadata("/uses");

/** Uses (§8.9, A.10). A line still holding a placeholder is hidden. */
export default function Uses() {
  const lists = [
    { title: uses.labels.desktop, items: uses.desktop, mono: true },
    { title: uses.labels.whyItMatters, items: uses.whyItMatters, mono: false },
    { title: uses.labels.development, items: uses.development, mono: false },
  ];
  return (
    <Page title={site.seo.pages["/uses"]!.title} intro={uses.intro}>
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <section key={list.title} className="flex flex-col gap-4">
            <h2 className="font-mono text-mono-label uppercase text-fg-subtle">
              {list.title}
            </h2>
            <ul className="flex flex-col border-t border-border">
              {list.items.flatMap((item) => {
                const text = resolve(item);
                return text
                  ? [
                      <li
                        key={text}
                        className={
                          list.mono
                            ? "border-b border-border py-3 font-mono text-small text-fg"
                            : "border-b border-border py-3 text-fg-muted"
                        }
                      >
                        <Inline text={text} />
                      </li>,
                    ]
                  : [];
              })}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  );
}
