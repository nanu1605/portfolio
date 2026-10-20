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

**Vercel.** Project imported from `nanu1605/portfolio`, production branch `main`, Node.js 24.x. `ENABLE_EXPERIMENTAL_COREPACK=1` is set for Production and Preview so Vercel installs the pnpm version pinned in `packageManager` (12.4.1) instead of guessing from the lockfile format. First production URL: https://portfolio-eight-gamma-4x0xpdi5wk.vercel.app.

## Cross-device UX — 20 Oct 2026

Tanishq asked for the best UI/UX, with animation, on phones, tablets and PCs before building starts. A four-part audit (motion, layout, device performance, testing) plus a critic pass produced `docs/cross-device.md`, which is now binding for Phases 2–7. Its §9 lists every spec amendment; all of them are recorded here:

- **Touch gets animated versions, not nothing.** Every fine-pointer effect in §6.2/§6.3 has a touch counterpart: touch bloom and `:active` press for the spotlight, press scale for tilt and magnetic, self-drift plus tap-to-move for the hero glow, in-view micro-demos, tap-to-pin highlighting.
- **Input detection.** Pointer effects load on `(any-hover: hover) and (any-pointer: fine)` and check `pointerType` per event, so an iPad with a trackpad gets them and a finger never does. Lenis stays gated on the primary pointer.
- **CSS first.** §2's "Motion for everything" becomes CSS transitions and keyframes for reveals, presses, drifts and the hero, with Motion (`m` + `LazyMotion`) only for springs, drag, sequenced centerpieces and `useScroll` fallbacks where CSS scroll timelines are missing. Reasons: Home's 150 KB budget, and motion that must run before hydration.
- **Hero photo starts at opacity 0.01**, not 0, so it stays an LCP candidate.
- **Page transitions** use React 19.3 `<ViewTransition>` with no manual fade fallback; unsupported browsers swap instantly. The /work → case-study cover morph runs only at 768 px and up; phones get the cross-fade.
- **Signal line** is static in section dividers; only the hero draws.
- **Tablets:** the menu button takes over below 1024 px; the MenuMesh and MLOps sticky versions start at 768×600.
- **Reading-progress bar** shows at every width, pinned separately from the header, and keeps tracking scroll under reduced motion. This is an exception to §3's "final state" rule: the bar moves only with the reader's own scroll, like a scrollbar.
- **Reservoir picker (§10.5):** on touch, dragging starts only on a 44 px handle, plus tap-to-place, so swipes on the triangle still scroll the page.
- **Pause/Play** controls on the VYRO gauges and looping videos (§10.2, §15.1).
- **Screenshots (§15):** `images.ts` adds 640 and 960 px variants for bento posters and phone figures.
- **/styleguide (§7, §19 Phase 2):** built everywhere but returns `notFound()` when `VERCEL_ENV` is `production`, so CI can test it.

**Tanishq's decisions:**

- Auto-moving content (WCAG 2.2.2): per item. Hero drift and glow stop within 5 s of first paint; videos and the VYRO gauges get Pause/Play buttons.
- No TOC on phones and portrait tablets; the reading-progress bar shows position.
- "hey jarvis" stays keyboard-only.
- Icon-only button labels (A.13 additions): "Open menu", "Close menu", "Search", "Switch to light theme" / "Switch to dark theme", "Pause", "Play", "Previous", "Next".

**Test matrix.** Playwright runs 4 device projects on every PR (desktop Chromium at 1440, Pixel 10, iPhone SE on WebKit, iPad Mini landscape on WebKit) and 8 on main and nightly (adds iPad Mini portrait, Galaxy Tab S9, desktop Safari and Firefox). An emulation guard fails if a touch project reports a fine pointer or vice versa. A width sweep checks for horizontal overflow from 320 to 1920 px (including 744, iPad mini portrait) and at 844×390. It fails whenever the document is wider than the viewport, even when no single element is to blame (overflowing text, pseudo-elements). CI runs nightly at 02:30 IST and always keeps the Playwright report.

**Pending:** an accessible name for the phone command palette's icon-only close button (proposed "Close search").
