import {
  BellRing,
  CalendarPlus,
  CreditCard,
  Receipt,
  Video,
} from "lucide-react";
import { Figure } from "@/components/ui/figure";
import { Flow } from "@/components/viz/flow";
import { icon } from "../shared";

// §10.9 automation flow.

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
      <div className="bg-surface p-4">
        <Flow steps={mchSteps} row />
      </div>
    </Figure>
  );
}
