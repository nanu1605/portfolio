import { jainavPlatform } from "../charts";

// §10.3 "From order to licence": the seven steps of Appendix B
// (`jainav_platform.order_to_licence`), each with a short name for the rail
// and a schematic. A schematic shows only words quoted from its own step's
// text; loading this module fails if one isn't, so a data change can't
// leave a stale diagram behind.

export type Diagram =
  | { kind: "code"; digits: string; notes: string[] }
  | { kind: "flow"; nodes: string[] }
  | { kind: "and"; checks: string[]; join: string }
  | { kind: "txn"; scope: string; core: string; job: string; flag: string }
  | { kind: "tax"; doc: string; rules: { where: string; tax: string }[] }
  | { kind: "key"; key: string; stored: string; parts: string[]; then: string }
  | { kind: "token"; signed: string; notes: string[] };

// Short rail names (new strings, listed for Tanishq).
const steps: { name: string; diagram: Diagram }[] = [
  {
    name: "Sign in",
    diagram: {
      kind: "code",
      digits: "6 digits",
      notes: ["10-minute expiry", "5 attempts"],
    },
  },
  {
    name: "Checkout",
    diagram: { kind: "flow", nodes: ["Razorpay order", "checkout"] },
  },
  {
    name: "Verify",
    diagram: {
      kind: "and",
      checks: ["Signature verified", "payment re-fetched from Razorpay"],
      join: "AND",
    },
  },
  {
    name: "Fulfil",
    diagram: {
      kind: "txn",
      scope: "one transaction",
      core: "Idempotent fulfilment",
      job: "reconciliation job every 15 min",
      flag: "paid-twice flagged",
    },
  },
  {
    name: "Invoice",
    diagram: {
      kind: "tax",
      doc: "GST invoice PDF",
      rules: [
        { where: "in Madhya Pradesh", tax: "CGST+SGST" },
        { where: "elsewhere", tax: "IGST" },
      ],
    },
  },
  {
    name: "Licence",
    diagram: {
      kind: "key",
      key: "VYRO-XXXXX-XXXXX-XXXXX-XXXXX",
      stored: "stored as",
      parts: ["SHA-256 hash", "AES-256-GCM copy"],
      then: "emailed",
    },
  },
  {
    name: "Activate",
    diagram: {
      kind: "token",
      signed: "Ed25519-signed token",
      notes: [
        "2 devices",
        "14-day trial",
        "180-day grace",
        "12 months of updates",
      ],
    },
  },
];

/** Every string a diagram shows. */
type Shown = string | (string | Record<string, string>)[];
const shown = (d: Diagram): string[] =>
  Object.entries(d as Record<string, Shown>).flatMap(([key, v]) =>
    key === "kind"
      ? []
      : typeof v === "string"
        ? [v]
        : v.flatMap((x) => (typeof x === "string" ? [x] : Object.values(x))),
  );

export const orderToLicence = jainavPlatform.order_to_licence.map((text, i) => {
  const step = steps[i]!;
  for (const quote of shown(step.diagram))
    if (!text.includes(quote))
      throw new Error(
        `content/centerpieces/jainav-platform.ts step ${i + 1}: "${quote}" isn't in Appendix B's "${text}"`,
      );
  return { ...step, text };
});

export const jainavCopy = {
  /** §10.3's title, the stepper's accessible name. */
  title: "From order to licence",
  caption: "From order to licence: what a VYRO licence purchase goes through.",
  /** The activation token's format (§10.3). */
  token: { parts: ["header", "payload", "signature"], alg: "EdDSA" },
  /** The "View data" table's column heads (new strings). */
  columns: { step: "Step", text: "What happens" },
  timeline: "Built 15–18 October 2026 from a ~1,000-line spec.",
  /** The status badge on phase 10 (§10.3). */
  next: "next",
} as const;
