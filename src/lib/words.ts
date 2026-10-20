type Token = { text: string; space: boolean };

/**
 * Words for the headline reveal. Intl.Segmenter finds the words (never
 * characters, which would break Devanagari conjuncts); punctuation stays
 * attached to its word so a line can't break before it.
 */
export function splitWords(text: string, locale = "en"): Token[] {
  const tokens: Token[] = [];
  let wordLike = false;
  for (const seg of new Intl.Segmenter(locale, {
    granularity: "word",
  }).segment(text)) {
    const last = tokens.at(-1);
    if (/^\s+$/.test(seg.segment)) {
      tokens.push({ text: " ", space: true });
    } else if (last && !last.space && !(seg.isWordLike && wordLike)) {
      last.text += seg.segment;
    } else {
      tokens.push({ text: seg.segment, space: false });
    }
    wordLike = !!seg.isWordLike;
  }
  return tokens;
}
