import { now } from "@content/now";
import { site } from "@content/site";
import { Page, pageMetadata } from "@/components/site/page";

export const metadata = pageMetadata("/now");

const updated = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(now.updated));

/** Now (§8.8, A.9), with its visible "Last updated" date. */
export default function Now() {
  return (
    <Page title={site.seo.pages["/now"]!.title}>
      <div className="flex max-w-text flex-col gap-8">
        <p className="font-mono text-mono-label text-fg-subtle">
          {now.updatedLabel}{" "}
          <time dateTime={now.updated} className="text-fg-muted">
            {updated}
          </time>
        </p>
        <ul className="flex flex-col border-t border-border">
          {now.items.map((item) => (
            <li
              key={item.title}
              className="border-b border-border py-6 text-body-lg text-fg-muted"
            >
              <strong className="font-semibold text-fg">{item.title}</strong>{" "}
              {item.body}
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
