import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeDocument } from "@/components/resume/document";

// /resume.pdf (§7, §8.10): rendered once, at build time.
export const dynamic = "force-static";

export async function GET() {
  const pdf = await renderToBuffer(createElement(ResumeDocument));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Tanishq_Jain_Resume.pdf"',
    },
  });
}
