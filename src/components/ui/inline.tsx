/** Copy with `code` spans: the backticks in A.6 and A.10. */
export function Inline({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 ? (
      <code
        key={i}
        className="rounded-sm bg-surface-2 px-1 font-mono text-small text-fg"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}
