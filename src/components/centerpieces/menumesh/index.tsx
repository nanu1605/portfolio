import { screen } from "@content/screens";
import { Figure, Picture } from "@/components/ui/figure";
import { captured } from "@/components/work/media";

// §10.4 "Table to bill" as stills from the staging demo, one per step,
// until Phase 5 makes it the scroll-linked phone story.

const tableToBill = [
  ["Scan", "menumesh/menumesh-demo-start-guest.png"],
  ["Order", "menumesh/menumesh-demo-ordered-guest.png"],
  ["Cook and serve", "menumesh/menumesh-demo-ready-kitchen.png"],
  ["Bill and pay", "menumesh/menumesh-demo-billed-counter.png"],
] as const;

export function Centerpiece() {
  const first = screen(tableToBill[0][1]);
  return (
    <Figure
      caption={`The browser demo, one step per screen · ${first.build} · ${captured(first.capturedOn)}`}
    >
      <ol className="grid items-start gap-6 bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_2fr]">
        {tableToBill.map(([label, file], i) => {
          const s = screen(file);
          return (
            <li key={file} className="flex flex-col gap-3">
              <span className="font-mono text-mono-label text-fg-subtle">
                <span className="text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {label}
              </span>
              <Picture
                image={s.image}
                alt={s.alt}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                className="rounded-md border border-border"
              />
            </li>
          );
        })}
      </ol>
    </Figure>
  );
}
