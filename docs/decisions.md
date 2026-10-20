# Decisions

Non-obvious choices and deviations from `PORTFOLIO_SPEC.md`, newest last.

## Phase 0 — 20 Oct 2026

**Spec copy.** Two copies of the spec existed. The one inside the starter folder (`portfolio/PORTFOLIO_SPEC.md`, 10:26) is newer than the one beside the zip (09:58): it has VYRO 1.4.1, the delivered videos and `ffmpeg-static` pre-approved. That copy is the one committed here.

**Repo location.** The repo lives at `S:\Projects\Portfolio-webisite`, outside OneDrive, so `node_modules` and `.next` don't sync. The folder name has capitals, which npm rejects, so `create-next-app` ran in a temporary `portfolio/` folder and the files were moved in. The package name is `portfolio`.

**Assets.** `assets/source/` is copied from the starter folder. The raw screen recordings beside the zip (35–47 MB each, with audio) are not committed; their trimmed, muted versions are already in `assets/source/screens/`.

**Photo.** `assets/source/tanishq-jain.jpg` is 6334×7680 (10 MB), larger than the 2125×2576 the spec describes. It is the sharp source; generated variants are resized from it.

**Answers from Tanishq.**

- Repo: `nanu1605/portfolio`, public.
- `{{CONFIRM_AI_NATIVE}}`: confirmed. Forecasting, Reservoir RL and MenuMesh are `aiNative: true`.
- `{{BOSCH_DOCS_TRACK}}`: include the docs-as-code bullet from A.5, with no numbers.
- `{{FOUNDED}}`: not given yet. "2026" is shown and the placeholder stays allow-listed.

**Next.js 16.4.2 scaffold.**

- `create-next-app` 16.4 enables `cacheComponents` and `partialPrefetching` by default. Both are turned off. The spec describes plain static generation with `fetch(…, { next: { revalidate: 86400 } })` (§2, §4.3), which is the documented "previous model" and needs no `'use cache'` boundaries.
- Tailwind v4 is wired through `@tailwindcss/turbopack` (the scaffold's loader), not `@tailwindcss/postcss` as §2 lists. Following the framework's default.
- `AGENTS.md` from the scaffold is kept and included from `CLAUDE.md`; it points at the version-matched docs in `node_modules/next/dist/docs/`.
- `pnpm typecheck` runs `next typegen` first, because the scaffold's `LayoutProps` types are generated.

**Tokens.**

- `tokens.css` is generated, not committed: `predev` and `prebuild` run `pnpm tokens:build`, which fails on any contrast pair below §5.2.
- The generated file holds the `@theme` / `@theme inline` mapping as well as the theme variables, so the token list exists only in `tokens.ts`. `globals.css` imports it.
- Tailwind's default colours, fonts, text sizes, radii and easings are reset (`--color-*: initial` etc.), so palette classes like `bg-zinc-400` produce nothing even if they slip past `check:tokens`.
- `accent-soft` is stored as 8-digit hex (`#34D3991F` = 12%, `#0478571A` = 10%).
- Pairs checked (33): every text token (fg, fg-muted, fg-subtle, accent, accent-strong, warn, hot, info) on bg, bg-raised and surface at 4.5:1; fg and fg-muted on surface-2; on-accent on accent; border-strong on the three surfaces at 3:1; product accents on dark bg at 3:1. All spec values pass.
- The prose width token is `max-w-text` (68ch), because `max-w-prose` is a built-in Tailwind utility.
- `culori` ships no types; `scripts/culori.d.ts` declares the one function used, to avoid adding `@types/culori`.

**check:tokens.** Scans `src/**/*.{ts,tsx,css,mdx}` except `tokens.ts` and the generated CSS. A 4-digit hex only counts when it contains a letter, so PR numbers like `#4186` don't trip it.

**Theme.** `next-themes` with `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem={false}` and `disableTransitionOnChange`. The e2e test proves there's no flash by blocking the app's JS on reload and checking that the stored theme still applies.

**pnpm build scripts.** pnpm 12 blocks dependency build scripts. `esbuild`, `sharp` and `unrs-resolver` are listed as not allowed in `pnpm-workspace.yaml`; all three ship prebuilt binaries, so nothing breaks.

**Lighthouse CI.** Deferred to Phase 3, when Home has real content to measure.

**Commit email.** GitHub blocks pushes that expose Tanishq's personal email, so this repo's local git config uses the GitHub noreply address (`83662210+nanu1605@users.noreply.github.com`). The first six commits were rewritten to it before the first push, with Tanishq's approval.

**CLAUDE.md stays local.** Tanishq's global gitignore excludes `CLAUDE.md`, so the working rules file exists in the checkout but isn't committed. The same rules are in `PORTFOLIO_SPEC.md` §3.
