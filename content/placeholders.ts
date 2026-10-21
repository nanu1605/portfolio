import { z } from "zod";
import { PlaceholderInfo } from "./schema";

// Values only Tanishq can provide (spec §20). Everything listed here is
// allow-listed: `pnpm check:content` reports it, and a production build only
// fails on a `{{PLACEHOLDER}}` that isn't listed. Remove an entry once its
// value is in the content.

export const placeholders = z.record(z.string(), PlaceholderInfo).parse({
  FOUNDED: {
    fallback: "2026",
    neededBy: "Phase 1",
    note: "Month and year Jainav Infotech was incorporated.",
  },
  VDR_IMAGES: {
    neededBy: "Phase 5",
    note: "Tanishq's own photo run through the Virtual Dressing Room pipeline. Schematic stand-in until then.",
  },
});
