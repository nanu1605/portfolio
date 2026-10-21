import { pageAlt, pageImage, shareSize } from "@/lib/share-image";

// This route's share image (§11).
export const alt = pageAlt("/open-source");
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return pageImage("/open-source");
}
