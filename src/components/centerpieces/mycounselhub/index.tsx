import type { CSSProperties } from "react";
import {
  BellRing,
  CalendarPlus,
  CreditCard,
  Receipt,
  Video,
} from "lucide-react";
import { Figure } from "@/components/ui/figure";
import { icon } from "../shared";
import "./flow.css";

// §10.9 automation flow: an animated sequence that plays once in view and
// holds. CSS only (flow.css); the shared reveal script starts it.

export const mchSteps = [
  {
    label: "Payment succeeds",
    icon: <CreditCard aria-hidden="true" className={icon} />,
  },
  {
    label: "Google Meet link created",
    icon: <Video aria-hidden="true" className={icon} />,
  },
  {
    label: "Calendar events for client and counsellor",
    icon: <CalendarPlus aria-hidden="true" className={icon} />,
  },
  { label: "Invoice", icon: <Receipt aria-hidden="true" className={icon} /> },
  {
    label: "Reminder 30 minutes before the session",
    icon: <BellRing aria-hidden="true" className={icon} />,
  },
];

export function Centerpiece() {
  return (
    <Figure caption="What happens after a payment succeeds, with no manual steps.">
      <div
        data-centerpiece="mycounselhub"
        className="@container bg-surface p-5 md:p-6"
      >
        {/* Phones: down a rail. From a 36rem container: one row of five. */}
        <ol
          data-reveal="sequence"
          className="mch-flow grid @xl:grid-cols-5 @xl:gap-x-4"
        >
          {mchSteps.map((step, i) => (
            <li
              key={step.label}
              style={{ "--i": i } as CSSProperties}
              className="mch-node relative flex gap-4 pb-8 last:pb-0 @xl:flex-col @xl:gap-3 @xl:pb-0"
            >
              <span aria-hidden="true" className="mch-link" />
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-md border border-border-strong bg-bg [&>svg]:relative [&>svg]:size-5 [&>svg]:text-accent">
                <span
                  aria-hidden="true"
                  className="mch-lit absolute -inset-px rounded-md border border-accent bg-accent-soft"
                />
                {step.icon}
              </span>
              <span className="flex flex-col gap-1 pt-1.5 @xl:pt-0">
                <span className="font-mono text-mono-label text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-small text-fg">{step.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Figure>
  );
}
