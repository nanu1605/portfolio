import {
  Crop,
  Layers,
  PersonStanding,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Figure } from "@/components/ui/figure";
import { Flow } from "@/components/viz/flow";
import { icon } from "../shared";

// §10.8 pipeline strip: schematic icons until {{VDR_IMAGES}} arrive
// (Tanishq's own photo through the pipeline; never dataset images).

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
      <div className="bg-surface p-4">
        <Flow steps={vdrStages} row />
      </div>
    </Figure>
  );
}
