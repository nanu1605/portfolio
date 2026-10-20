// Colour literals that must never appear outside src/styles/tokens.ts (spec §3, Design).
// Arbitrary values such as bg-[#123] or bg-[rgb(…)] are caught by the hex and function rules.

const prefixes =
  "bg|text|border|border-[trblxyse]|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|placeholder|shadow|accent|caret";
const palette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";

const rules: [string, RegExp][] = [
  // 4-digit form needs a letter so PR numbers like #4186 don't match.
  [
    "hex colour",
    /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|(?=\d*[a-fA-F])[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g,
  ],
  ["colour function", /\b(?:rgba?|hsla?|hwb|oklab|oklch|lab|lch|color-mix)\(/g],
  [
    "Tailwind palette class",
    new RegExp(
      `(?<![\\w-])(?:${prefixes})-(?:(?:${palette})-\\d{2,3}|black|white)(?![\\w-])`,
      "g",
    ),
  ],
];

export function findColorLiterals(source: string) {
  const found: { line: number; rule: string; match: string }[] = [];
  source.split("\n").forEach((text, index) => {
    for (const [rule, pattern] of rules) {
      for (const match of text.matchAll(pattern)) {
        found.push({ line: index + 1, rule, match: match[0] });
      }
    }
  });
  return found;
}
