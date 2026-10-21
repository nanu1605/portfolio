import { ViewTransition, type ReactNode } from "react";

// Page transitions (§6.2, cross-device §4): React's <ViewTransition> fades
// the old page out where it was and the new one in (globals.css, "page").
// A template remounts when its segment changes, which is what makes the
// enter and exit fire; app/work/template.tsx does the same between case
// studies. Browsers without View Transitions swap instantly.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}
