import type { MDXComponents } from "mdx/types";

// Global MDX component map. Case-study figures, headings for the TOC and
// metric readouts join it in Phase 4.
const components: MDXComponents = {
  // Links in running text keep a static underline, so they never rely on
  // colour alone (WCAG 1.4.1); TextLink's growing underline is for
  // standalone links.
  a: (props) => (
    <a
      {...props}
      className="text-accent underline decoration-1 underline-offset-[0.2em] transition-ui hover:text-accent-strong"
    />
  ),
  // Wide tables scroll inside a focusable region instead of the page.
  table: (props) => (
    <div className="overflow-x-auto" tabIndex={0}>
      <table {...props} />
    </div>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
