import { pageAlt, pageImage, shareSize } from "@/lib/share-image";

// This route's share image (§11).
export const alt = pageAlt("/company");
export const size = shareSize;
export const contentType = "image/png";

export default function Image() {
  return pageImage("/company");
}
