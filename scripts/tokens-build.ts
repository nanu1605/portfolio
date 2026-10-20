import { writeFileSync } from "node:fs";
import { colors, contrastChecks } from "../src/styles/tokens";
import { contrastFailures, renderTokensCss } from "./lib/tokens-css";

const failures = contrastFailures(colors, contrastChecks);
if (failures.length > 0) {
  console.error(`tokens:build: ${failures.length} contrast failure(s)`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

writeFileSync("src/styles/tokens.css", renderTokensCss());
console.log(
  `tokens:build: ${contrastChecks.length} contrast checks pass; wrote src/styles/tokens.css`,
);
