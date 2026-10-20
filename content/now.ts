import { z } from "zod";

// The Now page (A.9). {{NOW_ITEMS}}: a draft until Tanishq confirms it.

export const now = z
  .object({
    updated: z.iso.date(),
    items: z.array(z.object({ title: z.string(), body: z.string() })).min(1),
  })
  .parse({
    updated: "2026-10-20",
    items: [
      {
        title: "VYRO 1.x.",
        body: "Shipping it: code signing, and support for more motherboards and Intel CPUs.",
      },
      {
        title: "Jainav Infotech.",
        body: "Launching the company website and store.",
      },
      {
        title: "MenuMesh.",
        body: "Getting it ready for launch at menumesh.in; it runs on staging today.",
      },
      {
        title: "Master's applications.",
        body: "Applying for an MSc in AI/ML in Europe for 2027.",
      },
      { title: "This site.", body: "Building it in public, from this spec." },
    ],
  });
