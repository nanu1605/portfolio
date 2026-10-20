// Validates all content and prints the {{PLACEHOLDER}} report (spec §19,
// Phase 1). Unknown placeholders warn in development and fail in production
// builds and CI, where every placeholder must be allow-listed.
//
//   pnpm check:content [--strict]

import { placeholders } from "../content/placeholders";
import { placeholderProblems, runChecks } from "./lib/content-checks";

const strict =
  process.argv.includes("--strict") ||
  process.env.VERCEL_ENV === "production" ||
  process.env.CI === "true";

async function main() {
  const { errors, placeholders: hits, stats } = await runChecks();

  if (errors.length === 0) {
    console.log(`Content OK: ${stats}.`);
    console.log("\nPlaceholders (spec §20):");
    for (const [key, info] of Object.entries(placeholders)) {
      const shows = info.fallback
        ? `shows "${info.fallback}"`
        : "hidden where used";
      console.log(`  {{${key}}} (${info.neededBy}; ${shows}) ${info.note}`);
      for (const h of hits.filter((h) => h.key === key))
        console.log(`      ${h.file}:${h.line}`);
    }
  }

  const unknown = placeholderProblems(hits);
  for (const problem of unknown) {
    if (strict) console.error(`error: ${problem}`);
    else console.warn(`warning: ${problem}`);
  }
  for (const error of errors) console.error(`error: ${error}`);

  if (errors.length > 0 || (strict && unknown.length > 0)) process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
