import { z } from "zod";

// The Now page (A.9). Tanishq left the list to me on 21 Oct 2026: A.9's
// draft without the Master's item, plus VYRO Pro.

export const now = z
  .object({
    updatedLabel: z.string(),
    updated: z.iso.date(),
    items: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  })
  .parse({
    updatedLabel: "Last updated",
    updated: "2026-10-21",
    items: [
      {
        title: "VYRO 1.x.",
        body: "Shipping it: code signing, and support for more motherboards and Intel CPUs.",
      },
      {
        title: "VYRO Pro.",
        body: "Getting the Pro edition ready; it launches soon.",
      },
      {
        title: "Jainav Infotech.",
        body: "Launching the company website and store.",
      },
      {
        title: "MenuMesh.",
        body: "Getting it ready for launch at menumesh.in; it runs on staging today.",
      },
      { title: "This site.", body: "Building it in public, from this spec." },
    ],
  });
