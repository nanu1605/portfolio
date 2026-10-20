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
  EDITOR: {
    neededBy: "Phase 6",
    note: "Code editor for /uses. The line is hidden until then.",
  },
  UDEMY_COURSE_TITLE: {
    neededBy: "Phase 1",
    note: "The Udemy course's real title. The certificate is hidden until then, and is never labelled CEH.",
  },
  X_URL: {
    neededBy: "Phase 1",
    note: "Show X (@Tanishq11567281)? Hidden by default.",
  },
  MYCOUNSELHUB_URL: {
    neededBy: "Phase 4",
    note: "The live site, plus permission to name the client. Unnamed and unlinked until then.",
  },
  VDR_IMAGES: {
    neededBy: "Phase 5",
    note: "Tanishq's own photo run through the Virtual Dressing Room pipeline. Schematic stand-in until then.",
  },
  NOW_ITEMS: {
    neededBy: "Phase 6",
    note: "Confirm or edit the Now list (A.9) and the hero status pill. The draft is shown.",
  },
  VYRO_PRO: {
    neededBy: "Phase 6",
    note: "Mention the planned VYRO Pro edition? Default no; never with a price.",
  },
  REGISTRAR: {
    neededBy: "Phase 8",
    note: "Registrar and DNS access for tanishq.website.",
  },
  GSC_TXT: {
    neededBy: "Phase 8",
    note: "Search Console verification record (optional).",
  },
});
