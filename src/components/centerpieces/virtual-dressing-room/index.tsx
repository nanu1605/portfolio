import {
  Crop,
  Layers,
  PersonStanding,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Figure } from "@/components/ui/figure";
import { icon } from "../shared";
import "./pipeline.css";

// §10.8 pipeline strip: schematic icons until {{VDR_IMAGES}} arrive
// (Tanishq's own photo through the pipeline; never dataset images). CSS
// only: the shared reveal draws each stage in on view (pipeline.css).

export const vdrStages = [
  {
    label: "crop to 192×256",
    icon: <Crop aria-hidden="true" className={icon} />,
  },
  {
    label: "18 pose keypoints",
    icon: <PersonStanding aria-hidden="true" className={icon} />,
  },
  {
    label: "20-class body parsing",
    icon: <Layers aria-hidden="true" className={icon} />,
  },
  {
    label: "clothing-agnostic person",
    icon: <UserRound aria-hidden="true" className={icon} />,
  },
  {
    label: "garment warp (GMM)",
    icon: <Shirt aria-hidden="true" className={icon} />,
  },
  {
    label: "try-on render (TOM)",
    icon: <Sparkles aria-hidden="true" className={icon} />,
  },
];

export function Centerpiece() {
  return (
    <Figure caption="The six stages, as schematic icons; the research dataset's images can't be shown.">
      <div
        data-centerpiece="virtual-dressing-room"
        className="bg-surface p-5 md:p-6"
      >
        {/* Phones: down a rail. Tablets: 3 × 2 in reading order. Desktop: one row. */}
        <ol className="vdr-pipeline grid md:grid-cols-3 md:gap-y-10 lg:grid-cols-6">
          {vdrStages.map((stage, i) => (
            <li
              key={stage.label}
              data-reveal="fade"
              className="vdr-stage relative flex gap-4 pb-8 last:pb-0 md:flex-col md:gap-3 md:pb-0"
            >
              <span aria-hidden="true" className="vdr-connector" />
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border-strong bg-bg [&>svg]:size-5 [&>svg]:text-fg">
                {stage.icon}
              </span>
              <span className="flex flex-col gap-1 pt-1.5 md:pt-0">
                <span className="font-mono text-mono-label text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-small text-fg">{stage.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Figure>
  );
}
