import { globSync, readFileSync } from "node:fs";
import { findColorLiterals } from "./lib/color-literals";

const allowed = new Set(["src/styles/tokens.ts", "src/styles/tokens.css"]);

const files = globSync("src/**/*.{ts,tsx,css,mdx}")
  .map((file) => file.replaceAll("\\", "/"))
  .filter((file) => !allowed.has(file));

let count = 0;
for (const file of files) {
  for (const { line, rule, match } of findColorLiterals(
    readFileSync(file, "utf8"),
  )) {
    console.error(
      `${file}:${line}: ${rule} "${match}" — use a token from src/styles/tokens.ts`,
    );
    count++;
  }
}

if (count > 0) {
  console.error(`check:tokens: ${count} colour literal(s) found`);
  process.exit(1);
}
console.log(`check:tokens: ${files.length} files clean`);
