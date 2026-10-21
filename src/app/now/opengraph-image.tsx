import { pageAlt, pageImage, shareSize } from "@/lib/share-image";

// This route's share image (§11).
export const alt = pageAlt("/now");
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return pageImage("/now");
}
