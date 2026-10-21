import { iconImage } from "@/lib/share-image";

// The home-screen icon on iOS (§11).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return iconImage(size.width);
}
