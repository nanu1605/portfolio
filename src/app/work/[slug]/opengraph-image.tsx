import { projects } from "@content/projects";
import { site } from "@content/site";
import { caseStudyImage, shareSize } from "@/lib/share-image";

// Each case study's share image (§11), in its product's accent if it has one.

const find = (slug: string) =>
  projects.find((p) => p.caseStudy && p.slug === slug);

export function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const p = find(params.slug);
  return [
    {
      id: "share",
      alt: `${p?.title} — ${site.name}`,
      size: shareSize,
      contentType: "image/png",
    },
  ];
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = find((await params).slug);
  if (!p) throw new Error("No case study for this slug");
  return caseStudyImage(p.title, p.accent);
}
