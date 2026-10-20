import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";
import { HorizonFigure } from "@/components/centerpieces/probabilistic-forecasting";
import { Screen, ScreenVideo } from "@/components/work/media";

// Case-study prose (§8.4). Text keeps to the reading width; figures and
// tables use the whole column. Headings get their ids from
// src/lib/remark-headings.mjs, which the TOC links to.

const prose = "max-w-text text-fg-muted";

const components: MDXComponents = {
  h2: (props) => (
    <h2 {...props} className="mt-16 max-w-text text-h2 text-fg first:mt-0" />
  ),
  p: (props) => <p {...props} className={`mt-4 ${prose}`} />,
  ul: (props) => (
    <ul
      {...props}
      className={`mt-4 flex list-disc flex-col gap-2 pl-5 marker:text-fg-subtle [li_&]:mt-2 ${prose}`}
    />
  ),
  ol: (props) => (
    <ol
      {...props}
      className={`mt-4 flex list-decimal flex-col gap-2 pl-5 marker:font-mono marker:text-fg-subtle ${prose}`}
    />
  ),
  li: (props) => <li {...props} className="pl-1" />,
  strong: (props) => <strong {...props} className="font-semibold text-fg" />,
  code: (props) => (
    <code
      {...props}
      className="rounded-sm bg-surface-2 px-1 font-mono text-small text-fg"
    />
  ),
  // Links in running text keep a static underline, so they never rely on
  // colour alone (WCAG 1.4.1); TextLink's growing underline is for
  // standalone links.
  a: (props) => (
    <a
      {...props}
      className="text-accent underline decoration-1 underline-offset-[0.2em] transition-ui hover:text-accent-strong"
    />
  ),
  // Wide tables scroll inside a labelled, focusable region with a sticky
  // first column, instead of the page (cross-device §5).
  table: ({
    "data-label": label,
    ...props
  }: ComponentProps<"table"> & { "data-label"?: string }) => (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="scroll-fade mt-6 overflow-x-auto overscroll-x-contain rounded-md border border-border"
    >
      <table
        {...props}
        className="w-full border-collapse text-left text-small [&_tr>*:first-child]:sticky [&_tr>*:first-child]:left-0 [&_tr>*:first-child]:bg-bg"
      />
    </div>
  ),
  th: (props) => (
    <th
      {...props}
      className="border-b border-border px-4 py-2 font-mono text-mono-label font-medium whitespace-nowrap text-fg-subtle uppercase"
    />
  ),
  td: (props) => (
    <td
      {...props}
      className="border-b border-border px-4 py-2 text-fg-muted pointer-coarse:py-3 [tr:last-child>&]:border-b-0"
    />
  ),
  // Figures placed in the MDX.
  Screen: (props: ComponentProps<typeof Screen>) => (
    <div className="mt-8">
      <Screen {...props} />
    </div>
  ),
  ScreenVideo: (props: ComponentProps<typeof ScreenVideo>) => (
    <div className="mt-8">
      <ScreenVideo {...props} />
    </div>
  ),
  HorizonFigure: () => (
    <div className="mt-8">
      <HorizonFigure />
    </div>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
