import type { MDXComponents } from "mdx/types";

// Global MDX component map. Case-study figures, headings for the TOC and
// metric readouts join it in Phase 4.
const components: MDXComponents = {
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
