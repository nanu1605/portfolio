// Fuzzy search for the command palette (§6.4). Every query character must
// appear in order. A character that continues a run scores most, one at the
// start of a word next, one after a gap least; the total is averaged over
// the query, so scores compare across queries of any length.

const WORD_START = /[\s\-·/(&]/;

/** 0 when `query` doesn't match `text`; otherwise up to 2. */
export function score(text: string, query: string) {
  const t = text.toLowerCase();
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return 1;
  let total = 0;
  let from = 0;
  let prev = -2;
  for (const ch of q) {
    const i = t.indexOf(ch, from);
    if (i < 0) return 0;
    total +=
      i === prev + 1 ? 2 : i === 0 || WORD_START.test(t[i - 1]!) ? 1.5 : 0.5;
    prev = i;
    from = i + 1;
  }
  return total / q.length;
}

/**
 * The items matching `query`, best first (stable on ties). A match in the
 * label counts fully, one in a keyword (a page's title, a project's stack)
 * a little less.
 */
export function rank<T extends { label: string; keywords: readonly string[] }>(
  items: T[],
  query: string,
) {
  if (!query.trim()) return items;
  return items
    .map((item) => ({
      item,
      score: Math.max(
        score(item.label, query),
        ...item.keywords.map((k) => score(k, query) * 0.8),
      ),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.item);
}
