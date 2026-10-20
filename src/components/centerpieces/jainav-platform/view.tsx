import type { ReactNode, Ref } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  Flag,
  Mail,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import type { Diagram } from "@content/centerpieces/jainav-platform";
import { cx } from "@/lib/cx";
import { Stepper } from "../stepper";

// §10.3 "From order to licence": one view of a given step, for the server
// poster and the live stepper alike. The schematics show only words quoted
// from their step (content/centerpieces/jainav-platform.ts checks that).

export type JainavData = {
  steps: { name: string; text: string; diagram: Diagram }[];
  token: { parts: readonly string[]; alg: string };
  label: string;
  labels: { previous: string; next: string };
};

const pad = (n: number) => String(n).padStart(2, "0");

const box =
  "inline-flex items-center gap-2 rounded-sm border bg-surface px-2.5 py-1.5 font-mono text-mono-label";

function Box({
  icon,
  accent,
  children,
}: {
  icon?: ReactNode;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        box,
        accent ? "border-accent text-accent" : "border-border-strong text-fg",
      )}
    >
      {icon}
      {children}
    </span>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-mono-label text-fg-muted">
      {children}
    </span>
  );
}

/** Points right in a row, down in a column (narrow containers). */
const Arrow = ({ turn = true }: { turn?: boolean }) => (
  <ArrowRight
    aria-hidden="true"
    className={cx(
      "size-4 shrink-0 text-fg-subtle",
      turn && "@max-sm:rotate-90",
    )}
  />
);

const glyph = "size-3.5 shrink-0 text-fg-muted";

function Schematic({ d, token }: { d: Diagram; token: JainavData["token"] }) {
  switch (d.kind) {
    case "code":
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2.5 @sm:gap-3">
            <Mail aria-hidden="true" className="size-5 text-fg-muted" />
            <Arrow turn={false} />
            <span className="flex gap-1 @sm:gap-1.5">
              {Array.from({ length: Number.parseInt(d.digits) }, (_, i) => (
                <span
                  key={i}
                  className="flex h-9 w-6 items-center justify-center rounded-sm border border-border-strong bg-surface font-mono text-small text-fg-subtle @sm:h-10 @sm:w-7"
                >
                  •
                </span>
              ))}
            </span>
          </div>
          <p className="flex flex-wrap justify-center gap-2">
            {[d.digits, ...d.notes].map((n) => (
              <Note key={n}>{n}</Note>
            ))}
          </p>
        </div>
      );
    case "flow":
      return (
        <div className="flex flex-col items-center gap-2 @sm:flex-row @sm:gap-3">
          <Box icon={<ShoppingCart aria-hidden="true" className={glyph} />}>
            {d.nodes[0]}
          </Box>
          <Arrow />
          <Box
            accent
            icon={
              <CreditCard aria-hidden="true" className="size-3.5 shrink-0" />
            }
          >
            {d.nodes[1]}
          </Box>
        </div>
      );
    case "and":
      return (
        <div className="flex flex-col items-center gap-2">
          <Box
            icon={
              <Check
                aria-hidden="true"
                className="size-3.5 shrink-0 text-accent"
              />
            }
          >
            {d.checks[0]}
          </Box>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-mono-label text-accent">
            {d.join}
          </span>
          <Box
            icon={
              <Check
                aria-hidden="true"
                className="size-3.5 shrink-0 text-accent"
              />
            }
          >
            {d.checks[1]}
          </Box>
        </div>
      );
    case "txn":
      return (
        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <div className="relative w-full rounded-md border border-dashed border-border-strong px-4 pt-5 pb-4 text-center">
            <span className="absolute -top-2.5 left-3 bg-bg px-1.5 font-mono text-mono-label text-fg-subtle">
              {d.scope}
            </span>
            <Box accent>{d.core}</Box>
          </div>
          <div className="flex flex-col items-center gap-2 @sm:flex-row @sm:gap-3">
            <Box icon={<RefreshCw aria-hidden="true" className={glyph} />}>
              {d.job}
            </Box>
            <Arrow />
            <Box
              icon={
                <Flag
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-warn"
                />
              }
            >
              {d.flag}
            </Box>
          </div>
        </div>
      );
    case "tax":
      return (
        <div className="flex flex-col items-center gap-4">
          <Box icon={<FileText aria-hidden="true" className={glyph} />}>
            {d.doc}
          </Box>
          <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-3 gap-y-2">
            {d.rules.map((r) => (
              <div key={r.tax} className="contents">
                <span className="text-right font-mono text-mono-label text-fg-muted">
                  {r.where}
                </span>
                <Arrow turn={false} />
                <span>
                  <Box accent>{r.tax}</Box>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case "key":
      return (
        <div className="flex flex-col items-center gap-4">
          <p className="rounded-md border border-border-strong bg-surface px-3 py-2 text-center font-mono text-mono-label tracking-normal text-fg @sm:text-small @2xl:text-body">
            {d.key.split("-").map((group, i) => (
              <span key={i}>
                {i > 0 && <span className="text-fg-subtle">-</span>}
                <span className={i === 0 ? "text-accent" : undefined}>
                  {group}
                </span>
              </span>
            ))}
          </p>
          <p className="flex flex-wrap items-center justify-center gap-2 font-mono text-mono-label text-fg-muted">
            {d.stored}
            <Box>{d.parts[0]}</Box>+<Box>{d.parts[1]}</Box>
          </p>
          <Box icon={<Mail aria-hidden="true" className={glyph} />}>
            {d.then}
          </Box>
        </div>
      );
    case "token":
      return (
        <div className="flex flex-col items-center gap-4">
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 font-mono text-small @2xl:text-body">
            <span>
              {token.parts.map((part, i) => (
                <span key={part}>
                  {i > 0 && <span className="text-fg-subtle">.</span>}
                  <span
                    className={
                      i === token.parts.length - 1
                        ? "text-accent"
                        : i === 0
                          ? "text-fg-muted"
                          : "text-fg"
                    }
                  >
                    {part}
                  </span>
                </span>
              ))}
            </span>
            <span className="text-fg-subtle">({token.alg})</span>
          </p>
          <span className="font-mono text-mono-label text-fg-muted">
            {d.signed}
          </span>
          <p className="flex max-w-sm flex-wrap justify-center gap-2">
            {d.notes.map((n) => (
              <Note key={n}>{n}</Note>
            ))}
          </p>
        </div>
      );
  }
}

export function View({
  steps,
  token,
  label,
  labels,
  current,
  trackRef,
  onGo,
}: JainavData & {
  current: number;
  trackRef?: Ref<HTMLDivElement>;
  onGo?: (step: number) => void;
}) {
  return (
    <Stepper
      id="order-to-licence"
      label={label}
      current={current}
      labels={labels}
      trackRef={trackRef}
      onGo={onGo}
      steps={steps.map((step, i) => ({
        name: step.name,
        content: (
          <div className="grid h-full grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] gap-5 @xl:grid-cols-[minmax(0,4fr)_minmax(0,5fr)] @xl:grid-rows-1 @2xl:gap-8">
            <div className="flex flex-col gap-3 @xl:justify-center">
              <p className="font-mono text-mono-label uppercase text-fg-subtle">
                <span className="text-accent">{pad(i + 1)}</span> {step.name}
              </p>
              <p className="text-body text-fg">{step.text}</p>
            </div>
            {/* The sentence above is the schematic's text alternative. */}
            <div
              aria-hidden="true"
              className="flex min-h-56 items-center justify-center rounded-md border border-border bg-bg bg-grid p-4 @sm:p-5"
            >
              <Schematic d={step.diagram} token={token} />
            </div>
          </div>
        ),
      }))}
    />
  );
}
