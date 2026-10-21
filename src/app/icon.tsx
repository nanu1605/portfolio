import { iconImage } from "@/lib/share-image";

// The favicon and the manifest's icons: the TJ monogram (§11).

const sizes = [32, 192, 512];

export function generateImageMetadata() {
  return sizes.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  return iconImage(Number(await id));
}
