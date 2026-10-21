import { tableToBill } from "@content/centerpieces/menumesh";
import { microcopy } from "@content/microcopy";
import { screen } from "@content/screens";
import { Figure } from "@/components/ui/figure";
import { captured } from "@/components/work/media";
import { MenumeshIsland } from "./island";
import { View, type MenumeshData, type Shot } from "./view";

// §10.4 "Table to bill" from the captured staging demo (§15.2), so no
// "Illustrative" label; the caption keeps the build and the capture dates.
// The poster is step 1: the story's first screen and the stepper's first
// slide.

function shot(file: string, detail: Shot["detail"]): Shot {
  const s = screen(file);
  const set = (format: "avif" | "webp") =>
    s.image.variants.map((v) => `${v[format]} ${v.width}w`).join(", ");
  return {
    alt: s.alt,
    view: s.view,
    width: s.image.width,
    height: s.image.height,
    blur: s.image.blur,
    src: s.image.variants.at(-1)!.webp,
    avif: set("avif"),
    webp: set("webp"),
    detail,
  };
}

const data: MenumeshData = {
  steps: tableToBill.steps.map((s) => ({
    name: s.name,
    text: s.text,
    shot: shot(s.screen, s.detail),
    phone:
      "phone" in s
        ? { ...shot(s.phone.screen, s.phone.detail), phone: true }
        : undefined,
  })),
  hindi: {
    step: tableToBill.hindi.step,
    shot: shot(tableToBill.hindi.screen, tableToBill.hindi.detail),
  },
  title: tableToBill.title,
  languages: tableToBill.languages,
  labels: { previous: microcopy.icons.previous, next: microcopy.icons.next },
};

// The phone captures came a day after the rest, so the caption gives the
// range of capture dates.
const dates = [
  ...tableToBill.steps.flatMap((s) =>
    "phone" in s ? [s.screen, s.phone.screen] : [s.screen],
  ),
  tableToBill.hindi.screen,
]
  .map((file) => screen(file).capturedOn)
  .sort();

export function Centerpiece() {
  const first = screen(tableToBill.steps[0].screen);
  return (
    <Figure
      bleed
      caption={`${tableToBill.caption} · ${first.build} · ${captured(dates[0], dates.at(-1))}`}
    >
      <div className="bg-surface p-4 md:p-6">
        <MenumeshIsland
          name="menumesh"
          poster={
            <View {...data} state={{ story: 0, step: 0, hindiMenu: false }} />
          }
          {...data}
        />
      </div>
    </Figure>
  );
}
