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

**Resolved (Phase 7):** the phone command palette's icon-only close button is named "Close search".

## Phase 1 — Content layer — 20 Oct 2026

**Where content lives.** `content/` at the repo root, imported as `@content/*`. Each file parses its data through the Zod schemas in `content/schema.ts` when it loads, so invalid content fails `pnpm build` and the tests. `pnpm check:content` adds the cross-file checks and now runs in `prebuild` as well as CI.

**All copy now, layout later.** "Content layer: all copy" (§19) is read as including the nine case-study bodies, so `content/case-studies/*.mdx` hold the A.4 body sections now; Phase 4 adds the template, figures and screens. TL;DR, meta, links and the "How this was built" note are structured fields in `projects.ts`, because the template (§8.4) places them. A.4's "Screens" lines are instructions, not copy, and aren't in the MDX.

**Numbers.** Components never hard-code a number. Copy keeps its numbers as written in Appendix A, which already matches Appendix C. Values that can change, or that are shown as readouts, are written as `{metric.id}` and filled by `resolve()` in `src/lib/fill.ts`: the bento readouts, the hero status pill and the Baby status line. `check:content` fails on an unknown id, and it cross-checks the metrics against the chart data (`rl.flood`, `rl.supply`, `rl.agents`, `vyro.releases`, `mlops.f1`) and the PR list (`oss.merged`).

**Metric sources.**

- Every repo source is a GitHub link at the repo's default branch. All of them were checked on 20 Oct 2026.
- Sources given as "resume" (the Bosch figures, `vdr.team`, `mch.services`) link to `/resume`. The resume Google Doc in C.2 isn't linked: it's a working document and may hold contact details the site must not show.
- MenuMesh pricing was read on the staging site, which A.4.4 says never to link. Those three metrics keep the URL with `linkSource: false`, so they show the source as text. `check:content` fails if `staging.menumesh.in` appears anywhere else.
- `vyro.inapp` links this repo's `assets/source/screens/vyro/`, where the screenshots are.
- Versions and setups ("v0.2.0", "large-v3-turbo, CPU, int8") moved from labels into `measuredOn`, as §4.2 intends.

**Schema changes from §4.2's sketch.**

- `tldr` (three labelled cards) replaces `summary`. The labels vary: VDR uses "What we built" and "My role", MenuMesh "Business model".
- `readout` is a template string, because several readouts combine two metrics ("22 tools · 1,037 tests").
- `links` is a list of `{label, href, requires?}`. `requires: "jainavLive" | "menumeshLive"` hides a link until its launch flag is on.
- `badges[]` replaces the single status badge; `status` and `platform` are the case-study meta row.
- `period` is optional: A.4.4 gives MenuMesh no timeline.
- `heroOneLiner` holds the Jainav platform's A.4.3 line, which differs from its A.3 card line.
- `tags` is dropped. The command palette will search titles, one-liners and stack instead of keywords nobody wrote.
- Experience entries carry the A.5 role casing everywhere, plus a short `org` for Home and the A.5 `orgFull` with the place.
- The proof strip uses the A.2 labels with values from the metrics, so Bosch reads "1.5 years" (C.1) rather than A.2's "1.5 yrs".

**Placeholders.** `content/placeholders.ts` is the allow-list, with a note and an optional fallback. `resolve()` swaps in the fallback (`{{FOUNDED}}` → "2026"), and returns `null` for anything still waiting on a placeholder without one, so components hide it (the editor line, the Udemy certificate, the X link, the MyCounselHub link). An unlisted placeholder warns locally and fails with `--strict`, on Vercel production builds and in CI.

**MDX.** `@next/mdx` with `remark-gfm` passed by name, as Turbopack requires. Case studies are imported by their route, so `pageExtensions` stays at the default. `src/mdx-components.tsx` wraps tables in a focusable scroll region. There's no case-study route until Phase 4, so `check:content` compiles every MDX file with the same `@mdx-js/mdx` the loader uses (resolved through `@mdx-js/loader`, so no new dependency). A throwaway route confirmed Next renders the Baby body, the GFM table and the wrapper; it was removed.

**Open-source data.** `content/data/open-source.json` holds the 16 merged PRs with open and merge dates from the GitHub API (fetched 20 Oct 2026), for the dot timeline. 15 are PEcAn PRs opened Jul–Sep 2022, matching A.6, and the A.6 theme groups list each exactly once.

**Chart data.** `content/data/*.json` was extracted from Appendix B's JSON block by script, not retyped, and is validated with strict schemas in `content/charts.ts`.

**Images (`pnpm images`).**

- Outputs are committed: `public/media/` (12 MB, 162 files) and the index `content/generated/media.json`. Builds need neither sharp nor ffmpeg, and re-runs skip unchanged files.
- Screens and posters: AVIF (quality 60) and WebP (quality 80) at 640, 960, 1280, 1920 and 2560 px, never upscaled, each with a 16 px blur placeholder.
- Photo: hero at 640–1600 px; About as a 4:5 crop trimmed evenly from the sides (800, 1200); the share crop is a 600 px square from the top as JPEG, because `next/og` can't read AVIF or WebP.
- Videos: the MP4 is copied muted with `+faststart`; WebM is VP9 at CRF 42, which keeps SSIM above 0.99 against the MP4 and is smaller for all three clips (273 KB, 838 KB and 490 KB against 312 KB, 1.29 MB and 1.12 MB).
- `ffmpeg-static`'s install script stays blocked in `pnpm-workspace.yaml`, so CI and Vercel don't download a binary they never use. `scripts/images.ts` runs the package's own installer the first time it needs ffmpeg.
- `content/screens.ts` loads the screen manifest and the generated index; `screen()` and `video()` throw for a file that isn't in both.

**Product icons** (in `assets/source/icons/`, copied to `public/media/icons/`):

- `vyro.svg`: `nanu1605/vyro`, `src-tauri/icons/icon.svg` at commit `dbb7b1e` on `main`. Licence MIT OR Apache-2.0 (the repo ships both).
- `baby.png`: `nanu1605/baby`, `ui/shell/src-tauri/icons/icon.png` at commit `d69c719` on `master`, 512×512. Licence MIT.
- MenuMesh's logo comes from the capture script in Phase 4. Jainav Infotech has no logo; the typographic "J" is built in Phase 6.

**Live releases (`src/lib/github.ts`).** The VYRO installer size is binary megabytes, because that's what gives C.1's 11.6 MB for the v1.4.1 MSI (12,210,176 bytes); Baby's "19 MB" in C.1 is decimal, but it isn't a live value. The API dates Baby 6.0.1's release 7 Sep 2026, against C.1's 4 Sep; no release date is shown, so nothing changes. Each live value falls back on its own, with a build warning.

**C.4 checks.**

1. The VYRO download page lists `Vyro_1.4.1_x64_en-US.msi` as the latest release.
2. (Phase 5.)
3. Not linked: Tanishq is making `nanu1605/vyro` private (see "Answers after Phase 2").
4. F1 Insights links its repo only. The archive links repos only, so the `f1insights.vercel.app` question doesn't arise.

**Small calls.**

- Home's open-source section links to `/open-source` as "Open source →", following A.2's "All work →"; A.2 gives no label.
- `server-only` is resolved by Next in app builds and aliased to an empty module in Vitest.

## Phase 2 — Design system and motion — 20 Oct 2026

**CSS first, no Motion yet.** Nothing in Phase 2 needs a spring, drag or a sequence. Reveals, word masks, the signal line, presses, the spotlight and the magnetic pull are CSS transitions and keyframes; small scripts only set attributes and custom properties. `motion` isn't installed until the first component that needs it (Phase 4 or 5), so Home's JS budget starts empty. `lenis` and `lucide-react` were added (both pre-approved).

**Reveals before hydration.**

- An inline script in `<head>` (`src/lib/reveal-script.ts`, under 1 KB) adds `html.js` and hands every `[data-reveal]` element to one IntersectionObserver.
- A MutationObserver finds those elements, so the script covers the parsed page and client navigations alike.
- It writes data attributes, never inline styles, so hydration sees no mismatch.
- Elements in one batch get `data-reveal-i` 0–5 for the 75 ms stagger. Elements first seen above the viewport reveal with no transition.
- Without the script, nothing is hidden.

**Headline words.**

- `Intl.Segmenter` finds the words, and punctuation joins its word: "machine." and "AI/ML" can't break across lines, and Devanagari stays whole. Unit tests cover this.
- The sentence is in `sr-only` text, and the word spans are `aria-hidden`.
- The on-load variant (for the hero) starts at opacity 0.01 and 40% down inside its mask, so the text is painted on the first frame.

**Count-up.**

- Only a value with one number counts, or one written "A → B": B counts up from A, so `mlops.f1` keeps 0.27.
- Values like "p50 1.2 s · p95 4.0 s" don't count.
- If any part of the number is visible when the page hydrates, it keeps the final value. Otherwise it's set to the start value while off-screen, and counts once it's 50% in view.
- A unit test checks that the last frame equals each metric's exact value.

**Signal line.** A seeded path (noise fading out, a sine fading in), identical on every render. The hero variant draws in 1.4 s and drifts once over 3.5 s: 4.9 s in all (WCAG 2.2.2). Both durations are multiples of the reveal token. Everywhere else, the line is static.

**Pointer and touch effects.**

- One delegated `pointermove` listener for the page, instead of one per grid. It finds `[data-spotlight]` and `[data-magnetic]` with `closest()` and writes custom properties once per frame.
  - It loads on `(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)`, re-checked live.
  - It ignores touch events.
- The touch bloom (`src/lib/touch-effects.ts`) ships in the main bundle: about 60 lines, no library. It waits 100 ms after `pointerdown` and gives up on `pointercancel`, so a scroll that starts on a card doesn't flash.
- Cards' delayed press is CSS (`active:delay-100`), not JS: if a scroll removes `:active` within 100 ms, the transition never starts.
- The shared press style (`:active` → 0.7 opacity) needs normal specificity. Tailwind's preflight sets `button { opacity: 1 }`, which beat the first, zero-specificity version on every button.

**Images: `<picture>`, not `next/image`.** §2 says `next/image`, but `scripts/images.ts` already makes the AVIF and WebP variants and they're committed. `next/image` would re-encode them through its optimiser, and it can't emit an AVIF source with a WebP fallback from existing files. `Picture` renders both `srcset`s with the blur placeholder behind them. Its `priority` option makes the LCP image load eagerly with `fetchpriority="high"`.

**New tokens.** None of these is contrast-checked, because all are decorative.

- `grid-line` (fg at 4%): the hairline grid and light-theme shadows.
- `glass` (bg-raised at 80%): blurred bars.
- `scrim` (dark: bg at 80%; light: fg at 40%): the dialog backdrop.

Under `prefers-reduced-transparency`, the glass and the backdrop are opaque. Under `prefers-contrast: more` or forced colours, the grain, grid, spotlight and glows are dropped.

**Grain.** A 64 px seeded noise PNG (7 KB) made by `pnpm images` and tiled on `body`. Grey noise at 3% alpha reads on both themes.

**Components.** Built:

- Button (primary, secondary, ghost, magnetic), TextLink, Tag and Chip
- StatusBadge, StatusPill, Readout, MetricTable and DataTable
- Card, BentoTile, SectionHeader, Timeline, Picture and Figure
- Tabs, Tooltip and Dialog
- Disclosure, Callout, ThemeToggle and CopyButton

The page chrome is built from these primitives in the phase that specifies its behaviour: Header, MobileMenu and Footer in Phase 3; ReadingProgress and TOC in Phase 4; CommandPalette in Phase 7 (its close label is still pending).

- **ThemeToggle** is now a 44 px icon button. CSS picks the sun or moon from `data-theme`, so the icon is right before hydration. Until then, the label is "Toggle theme" (A.13's palette action).
- **theme-color:** the `viewport` export sets the dark `bg`. After hydration, the meta follows the chosen theme, using token values passed from the server.
- **Tooltip** is a native `popover="auto"`. Hover (mouse only) or focus shows it; a tap pins it; a tap elsewhere or Esc dismisses it. It sits above the trigger, or below when there's no room.
- **Dialog** is a native `<dialog>`. Esc and a click on the backdrop run the 150 ms fade-out before `close()`. Only dialogs get the scrim; popovers leave the page as it is.
- **StatusBadge** shows its tone on the dot and keeps the text `fg-muted`, so it passes 4.5:1 everywhere. It also covers two badges the content uses beyond §5.7's list: "Launching soon" and "Client work".
- **TextLink** grows its hit area to about 44 px on coarse pointers with an absolute `::before`, so the layout doesn't move. MDX links keep a static underline.
- **"Source"** is the visible label on metric source links, with the metric's label as `sr-only` text. Appendix A gives no wording for it; Tanishq left the call to me, and it stays.

**Tests.**

- `/styleguide` is checked on the device matrix:
  - axe in both themes;
  - visible focus on every Tab stop;
  - Tabs, Tooltip and Dialog by keyboard;
  - reduced motion;
  - pausing off-screen and in hidden tabs;
  - pointer effects on desktop only;
  - the touch bloom;
  - press feedback on every tappable element, and no stuck hover;
  - a report of tap targets under 44 px.
- Under reduced motion, the test expects:
  - no running animations;
  - no `requestAnimationFrame` calls during 1 s of idle;
  - every reveal and word at its final state;
  - the signal line drawn;
  - final count-up values.
- The overflow sweep now includes `/styleguide`.
- The tests wait for `load` plus `document.fonts.ready` instead of `networkidle`. Next keeps prefetches open for routes that don't exist yet (`/work/*`, `/contact`), so the page never goes idle.
- WebKit's Tab key skips links by default, so the focus test expects fewer stops there.
- Firefox isn't installed on this machine; CI runs it on main.

## Answers after Phase 2 — 20 Oct 2026

- **The VYRO repo is going private**, so nothing links it, overriding A.4.2:
  - The case study drops its "Source" link.
  - "Open source (MIT or Apache-2.0)" is gone from its status line, and the known-issues line no longer mentions free open-source signing, which needs a public repo.
  - The nine metrics sourced from the repo name the file as text ("v0.2.0 · VYRO README.md, private repo") with `linkSource: false`, like the MenuMesh staging prices. The URL stays in `metrics.ts` for checking.
  - `check:content` fails if the repo appears in content, or if a metric sourced from it or from the staging site is linked. Downloads, releases and the live version come from the public `vyro-releases` repo and are unaffected.
- **MenuMesh "How this was built"** (Tanishq left the text to me): "I designed the product — the guest, waiter, kitchen and counter flows — and made the architecture and product decisions. Claude Code wrote much of the implementation." It uses only §1's account of how the AI-native projects are built and A.4.4's role. Nothing about testing is claimed.
- **VDR and MyCounselHub** figures cite `/resume`, as Tanishq confirmed. The Bosch figures also cite `/resume`, still awaiting confirmation.

## Phase 3 — Global layout and Home — 20 Oct 2026

**No content in the browser bundle.** Content modules parse their data with Zod when they load, so a client component that imports one ships Zod (37 KB gzipped) and the data. The header, theme toggle and stack are server components or receive their copy as props; `header-client.tsx` and `stack.tsx` import no content. Home's first-load JS fell from 193 KB to 147 KB gzipped (147,085 bytes, preloaded chunks included; the budget of 150 KB is checked as 150,000 bytes by `perf.spec.ts`).

**Header (§8.1, cross-device §4, §5).**

- It hides on scroll down past its own height and returns after 8 px up. It stays put near the top, while focus is inside it, while the menu is open and under reduced motion. Overscroll is clamped, so a rubber-band bounce doesn't toggle it.
- From 1024 px: wordmark, the five links, the theme toggle and "Resume". Tablets: wordmark, toggle, "Resume" and the menu button. Phones: wordmark and the menu button; the toggle is inside the menu.
- **The search (⌘K) button waits for the command palette in Phase 7,** rather than shipping a button that does nothing.
- **Mobile menu:** a full-screen modal `<dialog>` below 1024 px with the five links plus "Resume", the email address as the contact line, and the theme toggle. The links rise in with the stagger and sit in the lower half; phone landscape puts them in two columns. The close button sits where the menu button was, and its two bars turn into an X. Esc fades it out; following a link closes it at once.

**New UI strings, for Tanishq's approval** (`content/microcopy.ts`, `landmarks`): "Skip to content" (the skip link), "Menu" (the menu dialog's name), "Main" and "Footer" (the two navigation landmarks). A.13 has none of these. They name controls and add no claims.

**Footer.** The nav lists the five header links plus Uses, Resume and Contact, because nothing else links to `/uses`; their labels are the A.1 page titles. Social links: GitHub, LinkedIn and Medium (X stays hidden). "Last updated" is the build date in IST, written "20 Oct 2026".

**Hero (§6.3).**

- The section's min-height (`min(100svh, 60rem)` minus the header) includes the signal line, so the line draws in the first view on desktop. The photo's height is capped to fit, cropping from the bottom.
- The photo's edges are masked so its black backdrop melts into the stage.
- The glow drifts once (4.9 s, like the signal line). The pointer moves it on desktop and a tap moves it on touch. A pointer move, a tap or the hero coming back into view replays both drifts with the Web Animations `play()` call.
- "See my work" is `/#work` in content; on Home it renders as `#work`, so Lenis or CSS scrolls in place.
- **A 768 px photo variant** (72 KB AVIF) was added for phones around DPR 1.75, which used to download the 960 px file (101 KB). The photo is the mobile LCP element.

**Sections.**

- **Proof strip:** values are `h3`-sized on phones and readout-sized from 768 px; hairlines come from a 1 px grid gap, so they follow each layout. "0.27 → 0.78" wraps after the arrow in the five-column row.
- **Bento:** Baby and VYRO show crops of `baby-brain-idle` and `vyro-dashboard`; their images are decorative (`alt=""`) because the tile's text names the link. The four small tiles are text and readout only until the Phase 5 micro-demos. At 1024 px the small tiles sit 2 × 2, and from 1280 px in one row. Tiles tilt up to 4° toward a fine pointer.
- **Company band:** each product card links to its case study. "Visit Jainav Infotech" stays hidden while `jainavLive` is false.
- **Experience:** the four A.5 entries in their A.5 casing, then the degree; `{{FOUNDED}}` shows "2026".
- **Stack:** skills with no linked project (Python, Terraform, AWS…) are dashed, inert pills. Below 1024 px a pinned skill lists its projects inline as "Rust →" followed by links, so no new words are needed. Kubernetes, Docker and Jenkins light up the Bosch entry in Experience, and R lights up GSoC.
- **Bento readouts link each number to its source,** so A.2's "Every number links to where it was measured" holds for the tiles. The title's link stretches over the whole tile and the readout's links sit above it, so no link is nested in another.
- **Education** shows the degree, school and dates; the CGPA stays on About and the resume (§21).
- **Contact:** "Copy email" is the primary, magnetic button.
- Sections below the hero use `content-visibility: auto` (`defer-render`). The first layout was mostly text shaping for the whole page; skipping off-screen sections shortens it on slow phones. Scroll CLS stays at 0 (`perf.spec.ts`).

**Performance (§13).**

- **Lighthouse CI uses applied (devtools) throttling.** Lantern's simulated LCP counts every script that ran before the observed paint. On localhost the JS arrives within about 25 ms and runs before the first frame, so the simulation adds all of it (about 145 KB at 1.6 Mbps) to the LCP: 3.3 s on any setup. Applied throttling loads the page over the throttled network, where the photo and fonts arrive while the async scripts are still downloading. Local mobile results over 3 runs: performance 0.98–0.99, accessibility 1, best practices 0.96, SEO 1, **LCP 1.8 s**, CLS 0.001, TBT 40 ms. Desktop: performance 1. Production field data (Speed Insights) and PSI come in Phase 8.
- **Tried and dropped:** `experimental.inlineCss` moved FCP to 1.1 s, but the photo then finished later (LCP 2.9 s), because the first paint no longer waited for it.
- Only Plus Jakarta Sans is preloaded (§13 "preload the display weight"); JetBrains Mono loads when used.
- Best practices is 0.96, not 1: Next prefetches the routes that don't exist until Phases 4–6, and the 404s are logged to the console. This goes away once every route exists.
- External links on Home all resolve (checked 20 Oct 2026). Medium and LinkedIn answer scripted requests with 403 and 999, as they always do.

**Tests.**

- `chrome.spec.ts`:
  - the skip link;
  - the header hiding and returning, and staying pinned under reduced motion;
  - "See my work" landing clear of the header;
  - the mobile menu by touch (open, close, navigate) and by keyboard (inert page, Esc, focus return);
  - the footer's date and Privacy link.
- `home.spec.ts`:
  - axe in both themes with every section rendered;
  - the theme persisting before hydration;
  - the hero and reveals with the app's JS blocked (the photo's entrance ends by 600 ms);
  - the count-up;
  - stack highlighting by hover, focus, click and tap;
  - honesty labels at 360 px;
  - every link going to a built page, a §7 route or a well-formed https URL;
  - full-page screenshots in both themes on every device project, kept in the Playwright report.
- `perf.spec.ts` on two new projects, `perf-phone` (Pixel 10, CPU 4× throttled) and `perf-desktop`: Home JS ≤ 150 KB, scroll CLS < 0.05, and the LCP element at 412 × 823 and 375 × 667, which must be in the hero.
- CI runs Lighthouse mobile on every push and PR, and desktop on main and nightly. Reports are kept as artifacts.
- WebKit in Playwright can't Tab to links (Safari needs Option+Tab), so the skip-link test runs on Chromium and Firefox.

**Review.** A three-lens review (spec, code, content) with a skeptical verifier confirmed 17 findings, all fixed:

- the stack's highlight classes lost to the chip's own;
- Lenis subtracted the header twice on anchors;
- the bento readouts had no source links;
- proof-strip source links were 41 px tall on touch, so TextLink's hit area is now exactly 44 px;
- section headers had no grid texture;
- the timeline dot still scaled under reduced motion (`transition-ui` is now instant there);
- the bento `sizes` were wrong;
- the JS budget test missed preloaded chunks;
- the header stayed pinned after a tap left focus in it;
- the footer date came from ISR regeneration, so it is now fixed at build through `BUILD_DATE`;
- the drift replay used `play()`, which escapes `[data-paused]`, so it now seeks to 0;
- the Resume button's overrides didn't apply;
- the phone-landscape variant could match short desktop windows;
- the Privacy link and the current nav item relied on colour, so both are now underlined;
- a scroll swipe moved the hero glow, so it now moves on tap release;
- after pinning a skill, its projects had no text equivalent, so each chip now describes its links.

One rejected finding was reinstated: §21 keeps the CGPA off Home.

A flaky WebKit reduced-motion test (one idle frame) traced to the header's scroll handler. Under reduced motion it no longer schedules frames.

**First CI run.** The CI runner benchmarks at about half this machine's CPU speed (Lighthouse benchmark index about 2,400, against 4,900 here), so its 4× slowdown models a slower phone.

- **CLS 0.31 on two of three runs,** all from the hero glow. It was anchored at `top: 40%` of the hero. On Linux (and Android) there is no Arial for next/font's size-adjusted fallback, so the web font swap changed the hero's height and moved the 48rem glow. It is now anchored at `min(40svh, 24rem)`, and `moveGlow` reads its layout position.
  - LHCI's default "optimistic" aggregation (the best run) had hidden this, so LCP and CLS are now checked on the median run.
- **Performance 0.93–0.94 on that hardware** (TBT 140–260 ms, LCP 1.6–1.8 s). At an 8× slowdown here: 0.93, LCP 2.3 s, TBT about 200 ms.
  - Most of the blocking time is React's own evaluation and hydration; the rest is the first style and layout pass. The page's own JS is small.
  - CI fails on LCP and CLS (median), on accessibility, best practices and SEO, but only **warns** on the performance score (0.95) and TBT (200 ms), because they move with the runner's hardware.
  - §13's production budget (performance ≥ 0.95) is measured on production in Phase 8 (PSI and Speed Insights). Hydration cost is the item to watch as Phases 4–7 add JS.
- **CLS 0.21 on the next run,** from the hero photo this time. The cause sat one layer down: next/font's size-adjusted fallback faces name only `local(Arial)`. Without Arial, the hero text first rendered in an unadjusted, wider font, then rewrapped when Plus Jakarta Sans arrived, moving the photo below it. This would also have hit Android, which has Roboto but no Arial.
  - `adjustFontFallback` is now off. Our own fallback faces in `globals.css` keep next/font's overrides but also match Liberation Sans (metric-compatible with Arial), Helvetica and Roboto.
  - CI afterwards: CLS 0.001 on every run; mobile performance 0.98 / 0.98 / 0.90 (median 0.98, the 0.90 run had TBT 330 ms); LCP 1.8 s; desktop 1.0.

## Answers after Phase 3 — 20 Oct 2026

Tanishq said "Go", which approved Phase 4. The two wording questions weren't answered, so the defaults stand:
- the four landmark labels ("Skip to content", "Menu", "Main", "Footer") stay, still pending approval;
- "Every number links to where it was measured" stays.

## Phase 4 — Work index and case studies — 20 Oct 2026

**Work filter.**
- One `data-filter` attribute on the index decides what shows; CSS in `globals.css` hides the rest.
- A small inline script applies a shared `?filter=` link before first paint, so it never flashes the whole list. Without JS, everything shows.
- A chip runs `document.startViewTransition` around a `flushSync` state change, then `history.replaceState`.
  - This uses the native API rather than React's `<ViewTransition>`. The cards are server-rendered and a chip changes one attribute, so no card re-renders and the tap stays cheap (INP).
  - Reduced motion, and browsers without View Transitions, switch instantly.
- `?filter=` is checked against the list of filter ids rather than with Zod, which would add about 37 KB to the browser bundle. Anything unknown shows "All".
- The selected chip fills in (Chip's `aria-pressed` style) instead of using a sliding pill. The chips wrap onto two rows on phones, where a pill can't slide.
- A visually hidden status line announces "Showing {n} of {total}" after each change.

**Work cards.**
- **The tile.** Each card is a BentoTile with the tilt off (§6.2 tilts bento tiles only) and an `h2` title under the page's `h1`.
- **What each card shows:**
  - the cover;
  - badges;
  - the one-liner;
  - the period;
  - the first four stack items, then "+N";
  - the readout, with its source links.
- **No scroll reveal on /work.**
  - The first row is above the fold, and a cover that starts hidden and is then revealed pushed the LCP to 3.2 s.
  - The filter's glide is the page's motion.
  - The first cover loads with high priority.
- **Covers.** A project with a screen uses it (Baby, VYRO, MenuMesh). The others get a small static figure from Appendix B (the reservoir agents, the best-seed calibration curve, the two documented F1 levels) or step dots.

**Case-study template.**
- **Hero:**
  - the title and A.4's one-liner;
  - a meta `<dl>`, laid out 2 × 2 on phones;
  - stack tags and link buttons. Links that wait on a launch flag or a pending placeholder (MyCounselHub) are hidden.
- **Hero media.** This is a project field (`heroMedia`), checked by `check:content`.
  - Baby and VYRO use their delivered videos, and MenuMesh uses the captured demo video.
  - It runs full-bleed on phones and sits in the product's accent glow on wider screens.
- **Previous and next** wrap around the nine case studies.
- **"How this was built"** is a closed Disclosure, linked from the TOC.
- **The centerpiece slot** holds the Phase 4 static figures; Phase 5 puts the interactive versions in front of them.
- **TOC.** A local remark plugin (`src/lib/remark-headings.mjs`) gives each `##` heading an id and exports the list as `headings`.
  - The plugin also names each MDX table's scroll region after its section.
  - Turbopack passes remark plugins as a name or a path. A relative path didn't resolve, so `next.config.ts` passes an absolute one.
  - `check:content` compiles with the same two plugins.
- **Reading progress.** It uses a CSS scroll timeline where the browser has one; elsewhere (stable Firefox), a small rAF scroll listener sets the same `scaleX`. The cross-device doc names Motion's `useScroll` as the fallback; this does the same job without adding Motion.
- **Metadata.**
  - `metadataBase` is https://tanishq.website, and every page sets its canonical URL.
  - Case studies use A.1's `{title}` and `{oneLiner}`.
  - Share images and JSON-LD come in Phase 7.

**Figures.** Every chart was simple enough to redraw as themed SVG from Appendix B, so no fallback PNGs are used. Each chart has a "View data" table.
- **Reservoir RL:** two Pareto scatters. The rule curve is a star, and the sweep's balanced agent (seed 45) is ringed and named. The caption carries §10.5's seed footnote.
- **Forecasting:** a reliability diagram whose DeepAR line is the point-wise mean of the five seeds, labelled "computed" (§10.6), plus ECE by horizon for the best seed.
- **MLOps:** the loop as a flow, and the two documented F1 levels as bars, with no intermediate points (§10.7). Replaced by the per-batch chart in the Phase 5 follow-ups.
- **Flows:**
  - the Jainav order-to-licence steps and build timeline;
  - the VDR stages, as schematic icons;
  - the MyCounselHub automation.

Captions written for these figures, for Tanishq to review:
- "Eight PPO agents (dots) and the rule curve (star), over 100 shared evaluation episodes; lower is better on every axis."
- "Observed against nominal coverage of the forecast intervals on the test set, at nine levels. Lines below the diagonal are overconfident: their intervals are too narrow."
- "Calibration error (ECE) by forecast horizon, for the best seed (1337)."
- "The loop runs with no human in the path; it returns to Serve after each reload."
- "Realized F1 on unseen batches: the stale champion on drifted traffic, then the promoted challenger. Only the two documented levels are shown."
- "From order to licence: what a VYRO licence purchase goes through."
- "The six stages, as schematic icons; the research dataset's images can't be shown."
- "What happens after a payment succeeds, with no manual steps."
- "The browser demo, one step per screen."

Screen captions are `{view} · {build} · {date}` from the manifest.

Screens placed in the MDX:
- **Baby:** turn in progress, the Hinglish chat, the activity feed and the inspector.
- **VYRO:**
  - sensors, health and game replay;
  - the 3-D clip, which plays once and stops on its last frame;
  - appearance settings;
  - cooling.

  The "GPU tuning" sidebar item isn't mentioned.
- **Forecasting:** the horizon bars.
- **MenuMesh:** the language section and the plan cards. The centerpiece slot shows four demo stills: scan, order, cook and serve, bill.

**Videos.**
- The source is attached on first play, from `data-webm` or `data-mp4`. WebM is used when the browser can play VP9.
  - Playwright's WebKit never fired `load` on pages whose `<video>` had sources.
  - Attaching on play also makes `preload="none"` strict everywhere.
- One video plays at a time, starting once it's half in view. Pressing Pause sticks.
- Reduced motion, or a refused autoplay, keeps the poster with the Play button.

**Reveal fix.**
- The bug: a jump that skipped past content (the End key, or a scroll position restored after first paint) crossed no observer threshold, so that content stayed hidden. Android's back navigation showed it.
- The fix: the shared observer's root now reaches 100,000 px above the viewport.
- Content above the viewport is still marked `instant`.

**New UI strings** for Tanishq to approve: "Filter", "Showing {n} of {total}", "On this page" and "Back to Work". "Archive", "TL;DR", the meta labels and "How this was built" are the spec's own words.

**Open:** §8.4 says "Limitations and what's next" is always present. A.4 gives MenuMesh only "What's next" and MyCounselHub none, so nothing was invented.

**Redirects (§4.4):** all seven are permanent (308). Three targets don't exist yet; `/resume`, `/resume.pdf` and `/company` are built in Phase 6.

**MenuMesh capture (`pnpm capture:menumesh`, §15.2).**
- Run against staging.menumesh.in on 20 Oct 2026, in the dark theme.
- The only clicks are the /demo controls: add, cart, place order, start, ready, served, make bill, start again and the language toggle. The demo saves nothing.
- Results:
  - 23 screens;
  - a 15.5 s, 218 KB H.264 video of "Show me". The walkthrough takes about 10 s, so the recording then glides to the counter's finished bill and holds it. The poster is the frame at 5 s.
  - the logo, saved from the site header's inline SVG to `assets/source/icons/menumesh.svg` (source: the staging.menumesh.in header, 20 Oct 2026).
- "How it works" (#how) isn't captured: it is a scroll-driven story, and an element shot of it comes out with the visual blank.
- The site's sticky header is made static during shots, so it can't land inside tall element screenshots.
- Re-run at launch with `MENUMESH_BASE_URL=https://menumesh.in`; the build line then drops "staging".

**Jainav capture: not done.**
- The permission check blocked writing `scripts/capture/jainav.ts`, because the script clones the jainav-infotech repo and runs its install, migrations, seed and dev server.
- That repo's compose project (`jainav-dev`, port 5432) is already running on this machine. A capture therefore has to use its own throwaway database on another port, so it never touches that one.
- The Jainav case study uses its platform diagrams (the §15.2 fallback) until Tanishq decides.

**C.4.**
- **Item 1:** the latest vyro-releases release is v1.4.1, with `Vyro_1.4.1_x64_en-US.msi` (12,210,176 bytes).
- **Item 3:** the VYRO repo isn't linked (Tanishq's answer after Phase 2).
- **Item 4:** f1insights.vercel.app loads, but its data requests fail now that the Ergast API is retired, so the archive links the repo only.

**Lighthouse CI** now covers `/`, `/work` and `/work/vyro`; VYRO is the heaviest case study, with a video hero and eight screens. Local runs on five pages are in PROGRESS.md.

**Tests.**
- `work.spec.ts`:
  - the list and the archive;
  - filtering by tap or click, with the URL in step;
  - a shared link with the app's JS blocked;
  - an unknown filter;
  - axe in both themes;
  - the redirects.
- `case-study.spec.ts`, for each of the nine pages: metadata and navigation, and axe in both themes.
- `case-study.spec.ts`, once each:
  - the progress bar moves by transform only;
  - the TOC from 1024 px;
  - a route change on touch lands at the top;
  - back navigation leaves content revealed;
  - videos.
- `traceability.test.ts`: metric values against C.1, and the numbers in each case study against its A.4 copy.
- The overflow sweep and the link check now include /work and the case studies.

## Phase 5 — Centerpieces and micro-demos — 20 Oct 2026

**Islands, not a bundle.**
- Each centerpiece has its own folder in `src/components/centerpieces/<slug>/`:
  - `index.tsx`, a server component, renders the poster and the "View data" table;
  - interactive ones add a pure `view.tsx`, a client `live.tsx`, and an `island.tsx` made with the shared `island()` factory.
- The island loads its chunk with `React.lazy` once the box comes within 200 px of the viewport (§10). The server poster shows until the chunk is ready.
- The poster and the live version render the same view component, so the swap shifts nothing.
- The box gets `[data-ready]` when the live version mounts; tests wait on it.
- Client code imports no `@content/*` module. Data and copy are passed down as props, so Zod stays out of the browser.

**No Motion, no d3.**
- §2 names Motion and d3. Neither is needed:
  - every sequence here is CSS, the Web Animations API, or one time-based rAF loop;
  - the drag uses pointer events with pointer capture;
  - the charts keep Phase 4's hand-written linear scales.
- This keeps each lazy chunk well under 60 KB and adds no packages. If a later centerpiece needs springs, it would be `m` + `LazyMotion` (cross-device §2).

**Worktree-safe config.**
- `turbopack.root` is pinned to the project.
- `.claude/` is excluded from ESLint and tsc, and `.claude/worktrees/` is gitignored, so parallel checkouts inside this one don't leak into its builds.
- Playwright reads `PORT`, so parallel checkouts can each run their own server.

**MLOps per-batch export (§10.7).**
- **How it ran.** The repo was cloned to a scratch folder (outside this repo) at commit `0a0b95f`. One line was added to `src/mlops_drift/experiments/run.py` to write `timeline` to `timeline.json`. There is no `make` on Windows, so the Makefile's targets were run directly:
  - `uv sync --extra dev`
  - `uv run python -m mlops_drift.data.ingest`
  - `uv run python -m mlops_drift.experiments.run`
- **Data.** The ingest step used the repo's synthetic generator, its default when no CICIDS2017 CSVs are present.
- **Result:** 20 batches of 400.
  - The mean F1 up to promotion is 0.2682 and after it 0.7797, matching the README's documented ≈ 0.27 → ≈ 0.78.
  - Drift was detected, and the challenger promoted, on the same controller tick (t = 13,799.5, the fifth batch). Version 2 serves from the sixth batch.
- **Imported on 21 Oct 2026.** The permission check first blocked writing the exported series into `content/data/` ("Code from External"). Tanishq approved the import, and the per-batch chart replaced the two documented levels (see Phase 5 follow-ups).

**C.4 item 2 (forecasting test windows).**
- Checked `src/probforecast/evaluation/rolling.py` and its callers (`pipelines/run_baselines.py`, `run_deepar.py`, `run_recalibration.py`) at commit `d0b3ce0`.
- Each test window's history is the training data (to 30 Jun 2016) plus the test hours before the window's origin. The validation months (Jul–Dec 2016) are left out of every test history.
- So the first test windows forecast January 2017 from a context that ends in June 2016. This applies to every model alike.
- A.4.6's shift explanation doesn't mention it. The wording change is a question for Tanishq (copy meaning, §0).

**CSS Modules don't work here.**
- The Turbopack rule in `next.config.ts` (`"*.css"` through `@tailwindcss/turbopack`, `as: "*.css"`) turns `x.module.css` into plain global CSS.
- So the CSS-only flows use plain colocated stylesheets whose class names carry a prefix (`vdr-*`, `mch-*`).
- The bento demos use one commented section of `globals.css`.

**Baby — "Follow a turn" (§10.1).**
- **Layout breakpoints.** The horizontal graph and the open ladder start at the lg viewport breakpoint (1024 px). The case-study column is only 712–904 px wide, so a 1024 px container would never get them. The phone/tablet split uses the container width: two columns from 36rem.
- **The ladder on desktop** hangs off the router node: its column's left edge is computed from the graph geometry, and a hairline leader joins it to the router. On phones and tablets it collapses to the deciding rule, with the full ladder in a `<details>`.
- **Privacy pin path.** Router → Cloud → Tools → Gate (`read_file` ALLOW), then back to the router on an agent-loop edge with a chevron. There rule 1 fires and the rest of the turn runs on Local 9B. A "Redacted" tag and a transcript note show the redaction.
- **Verdicts.** ALLOW is a circled tick in the site accent and CONFIRM a triangle in `warn`, always with the word and the tool name. No scenario uses DENY.
- **Motion.** The view is the final state; `live.tsx` adds Web Animations API "from hidden" animations. Only transform, opacity and stroke-dashoffset animate, one draw-in path at a time.
- **When it plays.**
  - The first scenario plays once when 85% of the graph is in view (about 3.1 s), then holds.
  - If the graph is already on screen, or above the viewport, when the chunk arrives, the final state stays. It never goes from final to empty (the count-up rule).
  - The transcript types in by whole words once half of it is in view.
  - Each chip plays its scenario once.
- **Light theme.** The lit route has an `fg` core over a 30% baby glow. Baby-blue alone is 2.2:1 on light surfaces; with the core it is 17.9:1.
- **Interaction cost.** Edge geometry is measured once at idle after mount, never inside a tap.
- **Scenario table.** The §10.1 table, verbatim, sits in a "View data" `<details>`.
- **Announcements.** The final reply is announced politely once, when a chosen turn reaches Voice.

**VYRO — "Gauge panel" (§10.2).**
- **Animation loop.** One rAF loop eases toward each new poll (time constant 0.22 s) and rests once the values settle.
  - The settle thresholds are set by what is visible: usage 0.25%, clocks 5 MHz, temperature 0.1 °C, fan 2 RPM. Finer thresholds never settle inside a 1 s poll.
  - The loop rests for about 0.2 s of every second.
- **Needles and value arcs move by transform only.** Each arc is two halves shown through rotating half-plane clip paths, so no `stroke-dashoffset` is needed.
- **Simulated values.**
  - They are a seeded random walk. The poster's state is computed on the server and handed to the live panel, so the swap shifts nothing.
  - The bounds keep every reading at a fixed digit count, so the readings never change width: usage 10–94%, CPU clock 3,600–5,450 MHz, GPU clock 1,000–2,900 MHz, temperature 34–84 °C, fan 1,000–2,200 RPM. The ranges are plausible, not measured, and are labelled "Simulated values — VYRO reads the real ones."
- **Pause and reduced motion.** Pause freezes the needles where they are; going off-screen or into a hidden tab does the same. Under reduced motion the panel starts paused on the poster's values; Play polls once a second and jumps straight to each value.
- **Formatting.** Numbers go through one module-level `Intl.NumberFormat`. Calling `toLocaleString` on every frame caused long tasks at 4× throttle.
- **Sparkline.** It gets a visually hidden summary (low and high over the last 60 s) rather than a data table, since its values are simulated.
- **Footprint card.** The four real metrics, with their versions and the private-repo source shown as text. Only the installer release links. Its "View data" table is Appendix B's footprint rows.
- **"What your browser can see"** is a toggle. It reads the values only on click, and a test asserts that no request is sent.

**Reservoir RL — "Weight mixer" (§10.5).**
- **The 2-D picker.**
  - The handle is `role="slider"`: `aria-valuenow` is the flood weight, and `aria-valuetext` gives all three weights and the nearest agent.
  - The native `<select>` is the equivalent control. A polite live region speaks when the nearest agent changes.
- **Input.**
  - A mouse drags from anywhere in the triangle. Touch drags only the 44 px handle (`touch-action: none` there), and a tap places the cursor.
  - The triangle keeps `pan-y pinch-zoom`. Pointer moves are coalesced into one render per frame.
  - The click that ends a drag is ignored, so the grab offset holds.
- **Axes.** Every axis maximum is derived (`axisMax`: the rule's mean or the largest agent mean + sd, rounded up to a clean tick) and shared by the case study, the Work cover and the bento strip. No axis number is typed.
- **"Drier climate"** always shows the separate balanced seed-42 run, with its definition and a Source link to `rl.dry`. Its rows are in "View data".

**Probabilistic forecasting — "Calibration explorer" (§10.6).**
- **Seed choice.** Seeds are native radios, and the chart updates in `startTransition`.
- **Switching seeds.** All six DeepAR polylines stay in the SVG and cross-fade by opacity. The markers glide by transform, and end-label leaders glide with their labels.
- **"Mean of 5" cards** use the results table's DeepAR (raw) row, written as value ± sd (coverage "74% ± 4%"). The one-seed recalibrated row is never used, and the Recalibration tab uses only `recalibration_same_run`, with a Source link to `fc.recal`.
- **ARIMA reference.** Every metric card shows ARIMA's value: DeepAR wins on CRPS and loses on ECE, which is the case study's point.
- **Horizon bars.** They grow once by WAAPI `scaleX`. Bars already on screen when the chunk arrives stay full.
  - The MDX's `<HorizonFigure />` was removed, because the explorer shows the same bars.
- **Line labels.** Direct line labels from a 896 px container; a dash + name key below that.

**Jainav — "From order to licence" (§10.3) and the shared Stepper.**
- **Stepper.** It is hook-free: a pure view plus `followTrack()`, wired by about ten lines in each `live.tsx`, so no React state reaches the server graph through the posters.
- **Phones.** The track scroll-snaps, the buttons scroll only the track, and a test asserts `window.scrollY` doesn't change. Below an 18rem container, Previous and Next show only their icons, with the approved labels as their names.
- **Without JS**, the poster shows every step readable. Once live, panels that aren't current are `inert`, so a "View data" table lists all seven steps.
- **Schematics.** They quote only strings from their own Appendix B step. The content file throws at load if one isn't found, so a stale diagram fails the build. The schematics are `aria-hidden`; each step's sentence is its text alternative.
- **Keys inside a step.** Arrow, Home and End keys from controls inside a step call `preventDefault`. Otherwise the browser scrolls the snap track itself and drops focus.

**MenuMesh — "Table to bill" (§10.4).**
- **Which version shows.** Both the sticky story and the stepper are rendered, and CSS picks one at `(min-width: 768px) and (min-height: 600px)`. With no `matchMedia` in JS, there is no hydration mismatch. The story's step comes from an IntersectionObserver band at 40–45% of the viewport height.
- **The language toggle compares like with like.**
  - On the Order step it switches the same start menu between `start-guest` and `start-guest-hindi`.
  - Scan shows that start screen too.
  - The `ordered-guest` capture is no longer used.
- **Phone legibility.** Crops are done in CSS (a `detail` box per screen, in capture pixels), so no new image files were needed.
  - **Kitchen and bill:** the landscape captures read at about 7–8 px on 360 px phones, so the phone stepper now uses phone-width captures (Phase 5 follow-ups).
- **Accent.** The Stepper's `tone="menumesh"` uses the product accent for fills only. The current step number stays `fg`.

**Virtual Dressing Room (§10.8) and MyCounselHub (§10.9).**
- Both are CSS only, started by the shared reveal script, with no island.
- **VDR layout.** VDR switches between 3 × 2 and one row at the md/lg viewport breakpoints. The case-study column is 712–975 px on both tablets and desktops, so the container width can't tell them apart.
- **MyCounselHub layout.** MyCounselHub uses a 36rem container query.
- **Sequence.** It plays one pass in under 5 s and holds. Reduced motion and print show the final state.

**Home bento micro-demos (§10.10).**
- **Markup.** The markup is each demo's final frame. Each moving part is a `.demo-a` element whose keyframes come from custom properties. The play rules sit under `prefers-reduced-motion: no-preference`, so reduced motion and print keep the final frame.
- **Triggers.**
  - On a fine pointer, a pass starts when the pointer or focus enters a tile. It runs to the end even if the pointer leaves (`data-demo-play` is cleared when the pass's animations finish).
  - On touch, `src/lib/touch-effects.ts` plays it once at 50% in view, then holds. It sits there rather than in the inline head script, which stays under 1 KB.
- **Baby and VYRO.** Their demos sit in a small dark panel over the existing screenshot; no new images load.
- **VYRO's needle** settles on the real `vyro.cpu` (0.46%), with that metric's label as the readout. The same metric, with its version and source, is in Home's proof strip on the same page. **Awaiting Tanishq:** this, or illustrative needles with the "Simulated values" label.
- **MLOps** shows only the two documented levels (0.27 → 0.78). **Jainav** uses §10.10's four step names.
- **Budget.** Home's first-load JS is 147,425 bytes against the 150,000 budget, up 340 bytes from Phase 3.

**Budget tests run on their own.**
- **The problem.** Under the full parallel run (8 workers on 16 cores) five of the 4×-throttled long-task checks failed. With one worker, all of them passed with no long task, so the failures came from other tests competing for the CPU.
- **The fix.** Those tests are tagged `@budget`. Normal runs skip them (`grepInvert` in `playwright.config.ts`). `pnpm test:budget` runs them one at a time on desktop-chromium and phone-android, and CI runs it as its own step after the e2e tests.

**Tests.**
- **New specs**, one per area:
  - `centerpiece-baby.spec.ts`
  - `centerpiece-vyro.spec.ts`
  - `centerpiece-charts.spec.ts`
  - `centerpiece-steps.spec.ts`
  - `micro-demos.spec.ts`
- **What they cover:**
  - mouse, touch (taps, CDP swipes and finger drags on Chromium) and keyboard;
  - reduced-motion final states;
  - the lazy chunk ≤ 60,000 bytes and a poster-to-live shift < 0.001;
  - a stepper's Prev/Next leaving `window.scrollY` alone;
  - the throttled budgets.
- **Shared helpers** live in `tests/e2e/lib/centerpiece.ts`.
- **Traceability.** `traceability.test.ts` now also checks that every number written in a centerpiece's copy (`content/centerpieces/*.ts`) appears in that project's §10 subsection, its A.4 case study or its Appendix B data.

**Two Phase 4 defects found by the Phase 5 Lighthouse sweep.** Phase 4 measured five pages; this time all nine case studies were measured.
- **Mono fallback reflow.**
  - The symptom: MLOps showed CLS 0.129 and VDR 0.051 on mobile.
  - The cause: the mono fallback was Arial scaled to JetBrains Mono's average width. On those two pages it wrapped the stack tags one row taller, and everything below moved up 38 px when the font swapped in.
  - The fix: the fallback is now a system monospace face (Courier New, Liberation Mono, Menlo, Roboto Mono, Droid Sans Mono or DejaVu Sans Mono). These share JetBrains Mono's 0.6 em advance, so wrapping is identical. Its ascent and descent overrides match JetBrains Mono (1020 / 300).
  - The result: hero heights are now identical with the font blocked and loaded on every page checked, and CLS is ≤ 0.001.
- **TL;DR behind a reveal.**
  - The symptom: Forecasting's LCP was 2.6 s.
  - The cause: on pages without hero media the TL;DR sits in the first viewport, and its long paragraph was the LCP element, hidden behind the scroll reveal until the observer ran.
  - The fix: the TL;DR has no reveal now (as with the /work cards). LCP is 1.78 s.
- **Lighthouse CI** now also checks `/work/mlops-drift-loop`, a case study without hero media.

**Measurements (20 Oct 2026, local).**
- **Lighthouse mobile, applied throttling, one run each:**

  | Page | Performance | LCP | CLS | TBT |
  |---|---|---|---|---|
  | Home | 98 | 1.93 s | 0.001 | 47 ms |
  | /work | 98 | 1.84 s | 0 | 42 ms |
  | Case studies | 97–99 | 1.65–1.93 s | ≤ 0.001 | 41–155 ms |

  Accessibility 100, best practices 96 and SEO 100 on every page. VYRO's 155 ms TBT is the highest, under the 200 ms warning.
- **Interaction at 4× CPU throttle** (`pnpm test:budget`, Chromium; this is the Performance-panel record §19 asks for):

  | Interaction | Longest task (desktop / phone) | Slowest event (desktop / phone) |
  |---|---|---|
  | Baby chip | 0 / 0 ms | 40 / 32 ms |
  | Reservoir select, toggle and keys | 0 / 0 ms | 24 / 24 ms |
  | Reservoir drag | 0 / 0 ms | 16 / 0 ms |
  | Forecasting seeds and tabs | 0 / 0 ms | 32 / 32 ms |
  | Jainav step | 0 / 0 ms | 24 / 24 ms |
  | MenuMesh language toggle | 0 / 0 ms | 24 / 24 ms |
  | VYRO panel | 0 / 0 ms | 32–40 / 40 ms |
  | Bento hover | 0 ms (desktop) | 24 ms (desktop) |

- **Lazy JS per centerpiece** (gzipped, as served, desktop / phone):

  | Centerpiece | Desktop | Phone |
  |---|---|---|
  | Baby | 11.2 KB | 9.3 KB |
  | VYRO | 8.2 KB | 6.3 KB |
  | Reservoir | 17.8 KB | 8.7 KB |
  | Forecasting | 16.4 KB | 7.3 KB |
  | Jainav | 8.8 KB | 7.2 KB |
  | MenuMesh | 8.5 KB | 7.0 KB |

  The budget is 60 KB each. VDR, MyCounselHub and the bento demos ship no component JS.
- **Poster-to-live layout shift:** 0 on every project.

**CI after Phase 5.**
- **Job limit: 60 minutes.** The full matrix now runs 20–28 minutes of e2e plus about 15 minutes of Lighthouse (mobile and desktop, four URLs). The 30-minute job timeout cancelled the desktop Lighthouse step, and the audit after it.
- **Audit order.** `pnpm audit` now runs right after install, so a timeout can't skip it.
- **Tests that only fail on a loaded runner:**
  - **Swipes.** Stepper swipes are a share of the track's width (60%), not a fixed 220 px: on the 640 px Galaxy Tab the slide is wider, and 220 px snapped back.
  - **MenuMesh phone floor.** The legibility floor for the portrait phone screen is 0.30. The ~65svh frame gives 0.32 in desktop Safari's and Firefox's 1280 × 720 window.
  - **Scrolling in `goLive`.** It uses `el.scrollIntoView` rather than Playwright's `scrollIntoViewIfNeeded`, which waits for a stable box.
  - **The TOC test** runs under reduced motion, so it checks the marking rather than Lenis's smooth scroll.
  - **Frame comparisons.** The bento frame checks round opacity to two decimals (WebKit reported a settled 0.4 as 0.4033).
  - **Progress bar.** The progress-bar check accepts `transition-property: none`.
- **Firefox navigations.** Desktop Firefox sometimes left Playwright "waiting for navigation to finish" when a test navigated a page a second time (also seen in Phase 4). Those tests now navigate once per page, opening a fresh page for each URL where they loop.

**New UI strings (Phase 5).** Anything not listed is the spec's own wording. Tanishq left them to me on 21 Oct 2026; they stand as listed.

- **Baby**
  - Labels: "Rule" (as in "Rule 9 → 1"), "Fired", "Redacted", "You".
  - Lines: "Check the screen." and "Baby never confirms by voice. No answer within 60 s means no."
  - The privacy-pin note, from §10.1's route text.
  - Headings: "Follow a turn", "Scenario", "Router ladder", "Transcript".
  - Table headers: Scenario, Utterance, Route, Gate, Reply (shown).
- **VYRO**
  - Gauge labels: "CPU", "GPU", "CPU temperature", "CPU fan".
  - Sparkline: "Last 60 s" and the "low … / high …" summary.
  - Browser readout: "Logical processors", "Device memory", "Not shared by this browser", "Screen", "Device pixel ratio", "Chromium; the browser caps it".
  - Footprint: "Reference PC", "VYRO footprint by version, on the reference PC".
- **Reservoir RL**
  - Controls: "Objective weights", "Nearest agent", "seed", "Weights", "vs".
  - The hint: "Drag the cursor or tap the triangle. Arrow keys move it; Shift moves it further."
  - Labels: "Mean ± sd · lower is better", "Nominal".
  - "View data": the caption and the "Balanced PPO, seed 42 (nominal / drier climate)" rows.
- **Forecasting**
  - Tabs and picker: "Calibration explorer", "Calibration", "DeepAR seed".
  - Card headings ("DeepAR · seed {n}", "DeepAR · mean ± sd over 5 seeds") and the "ARIMA {value}" reference line.
  - Horizon bars: "ECE by forecast horizon · best seed (1337)", "h ahead".
  - Recalibration tab: "Isotonic recalibration, fitted on the validation period", "Before and after, on the same run".
  - Recalibration table: Metric, Before, After, Test ECE, Validation ECE, 90% interval width, Test-period fit (diagnostic).
- **Jainav**
  - Rail names: Sign in, Checkout, Verify, Fulfil, Invoice, Licence, Activate.
  - "View data" columns: "Step", "What happens".
- **MenuMesh:** "Menu language" (the toggle's accessible name), "English" / "हिंदी".

## Phase 5 follow-ups (21 Oct 2026)

Tanishq answered the Phase 5 questions and most placeholders.

**MLOps — "Watch it recover" (§10.7).**
- **Data import approved.** `content/data/mlops-timeline.json` holds the exported series with its provenance: the repo, commit `0a0b95f`, the commands, the one-line patch, the synthetic data, the export date (20 Oct 2026), and the drift and promotion ticks from the run's own log.
- **Data.** The chart draws only the 20 exported batches, as straight segments between them; nothing is smoothed or added. `content/charts.ts` checks the series when it loads:
  - the mean F1 up to and including promotion must round to 0.27, and the mean after it to 0.78;
  - v1 serves up to the promotion tick and v2 after it.

  If any of these fails, the build fails, so the chart and the headline can't disagree.
- **The tick.** Drift and promotion share the controller tick after batch 5 (t = 13,799.5 is batch 5's median t, per the repo's `run.py`). A dashed rule sits between batch 5 and batch 6, with both labels stacked above the plot.
- **The loop.**
  - Serve and Monitor are lit from the start.
  - At the tick, the line holds on batch 5 for four scroll steps while Detect, Retrain, Gate and Reload light in turn.
  - When batch 6 draws, Serve and Monitor are lit again and the other four are ticked. Serve's tag reads v1 or v2.
  - A visible status line describes the state. A polite live region says it too, but only after the reader scrolls, presses a key or taps, so nothing is announced on load.
- **Which layout shows.** CSS picks it; there is no `matchMedia` in JS.
  - **Phones:** no pinning. The loop sits above the chart, so it is in view at the tick.
  - **Tablets 900 px tall or more:** the loop is below the chart.
  - **Desktop:** the loop is beside the chart.
  - **Tablets under 900 px tall:** the loop is also beside the chart. This departs from cross-device §6, which puts it below on tablets: at 768 × 600 a stacked loop would squeeze the pinned plot to 176 px.
  - **Pinning:** from 768 × 600 the figure pins, and a one-viewport `::after` spacer is the scroll track.
- **Scroll progress is JS on every engine.** Stable Firefox has no CSS scroll timelines, and this chart carries data.
  - There is one passive scroll listener, with one rect read per frame, and only while the track is within 100 px of the viewport.
  - React renders only when the step changes, at most 24 times per pass.
  - Pinned layouts: progress is how far the reader is through the track.
  - Phones: the draw runs from the plot's foot entering the viewport until the plot is fully in view.
- **Never final → empty (the count-up rule).**
  - The poster is the final state.
  - A plot that is more than half on screen when its chunk mounts keeps the final state until it has been wholly off screen. The review caught the erase on tall windows and after reloads mid-page.
  - From the top of the page, the plot is below the fold, so the switch to the scroll state happens out of sight.
- **Reading a batch.** The plot is a `role="slider"` (arrow keys, Home, End). A tap or click picks the nearest batch. The line is drawn at least as far as the picked batch, and the pick clears when the chart leaves the viewport.
- **Reduced motion:** the final state, with no pin and no spacer.
- **Measured.**
  - Lazy chunk: 6.6 KB on phones and 16.5 KB on desktop (including shared chunks fetched at the same moment).
  - Poster-to-live shift: 0.
  - At 4× CPU throttle while scrubbing and stepping, the longest task is 0 ms and the slowest event 24 ms.
- **Unchanged.** The Work cover and the Home bento keep the two documented levels (§10.10). The Phase 4 bars, and their "Only the two documented levels are shown" caption, are gone from the case study.

**MenuMesh phone captures (§10.4).**
- **New captures.** `pnpm capture:menumesh --phone` captures the demo's kitchen tablet (ready) and counter laptop (billed) at phone width, where the demo shows one device at a time. The only clicks are the demo controls and its "Device to show" switch.
- **430 px, not 390.** At 390 px, staging's kitchen covers the dish names with the "Ready" badge ("Panee" next to "Ready"). At 430 the names fit. Re-run at 390 once MenuMesh fixes that layout.
- **Partial runs.** A partial run replaces only the files it captured in the manifest. A full run behaves as before.
- **Where they show.** The phone stepper shows the phone captures for "Cook and serve" and "Bill and pay". The sticky story (from 768 × 600) keeps the landscape ones.
- **Device names.** The alt text and view lines name the device ("MenuMesh kitchen tablet, at phone width: …"), so they never suggest that the kitchen runs on a phone.
- **Legibility on a 360 px phone.** The smallest text went from 5.7 px to 10.9 px on the kitchen, and from 7.1 px to 12.6 px on the bill. The test floor is a scale of 10 / (14 × 3): 14 px text, captured at 3×, renders at 10 px or more. Slide heights don't change.
- **Caption date.** The caption now shows a range of capture dates ("20 – 21 Oct 2026"), using `Intl.DateTimeFormat#formatRange`. A single date prints as before.
- **Bill on 3× phones.** It is upscaled by about 12%, because the largest generated variant is 960 px wide.

**C.4 item 2 → A.4.6.** The approved sentence follows the test split in the forecasting Setup: "Each test window is forecast from the training data and the earlier test hours; the validation months aren't in its history (the same for every model)." It sits there, before the results and the shift explanation, because it applies to every model in the table.

**VYRO.**
- **Bento needle.** It keeps the real `vyro.cpu` (0.46%, measured on v0.2.0).
- **Latest release.** `lib/github.ts` already reads the latest release from `nanu1605/vyro-releases`. On 21 Oct 2026 that is still v1.4.1 (a 12,210,176-byte MSI, 11.6 MB), so the fallbacks in `metrics.ts` are current.
- **CI.** The build logs show no "release lookup failed" warning, so the live value is in use.

**UI strings.** Tanishq left the Phase 5 list to me; it stands as listed. The MLOps chart adds these, on the same footing:
- the caption and labels: "Realized F1 on each unseen batch, as the real serving process and controller replay the synthetic shift.", "Synthetic data";
- the slider and axes: "Realized F1 by unseen batch", "Unseen batch", "Realized F1", "Batch";
- the readout and hint: "Batch {n} of {total}: F1 {f1}, {version}", "Tap a point or use the arrow keys to read a batch.";
- the versions: "Stale champion", "Promoted challenger";
- the loop: "The loop", and the status lines "Serving v1, the stale champion, and monitoring for drift.", "Drift detected: retraining a challenger, which must beat the champion by at least 0.01 F1 and clear a 0.50 floor.", "Serving v2, the promoted challenger. The loop is back at Serve.";
- "View data": "Realized F1 per unseen batch · commit {commit}, exported {date}", "Median t", "F1", "Model", "Event", "at the controller tick after this batch".

**Placeholders.**
- `{{EDITOR}}`: Visual Studio Code, on /uses.
- `{{UDEMY_COURSE_TITLE}}`: "Learn Ethical Hacking From Scratch".
  - Read from the certificate Tanishq sent: Udemy, 27 June 2020, 14.5 hours, certificate UC-c416d825-adcd-48a6-a078-26e2cd91edd5.
  - The line is now shown, linked to the certificate page, and never labelled CEH (C.3).
- `{{X_URL}}`: https://x.com/tanishq11567281.
  - The share parameter `?s=11` was dropped.
  - X now shows in the footer. Phase 7 adds it to the Person JSON-LD `sameAs`. Instagram stays off.
- `{{MYCOUNSELHUB_URL}}`: no link to the live site. The client stays unnamed beyond "MyCounselHub".
- `{{NOW_ITEMS}}`: left to me, without the Master's item.
  - The list is A.9's draft minus "Master's applications", plus "VYRO Pro. Getting the Pro edition ready; it launches soon." Last updated 21 Oct 2026.
  - The hero pill reads "Now · Shipping VYRO {vyro.version} · Getting MenuMesh ready for launch". It is about as long as before, so the hero layout doesn't change.
- `{{VYRO_PRO}}`: yes, launching soon. It gets three short mentions, never with a price (C.3): the VYRO case study's "Next" line, the Company page's VYRO card and the Now list.
- `{{REGISTRAR}}`: GoDaddy, for Phase 8's DNS records.
- `{{GSC_TXT}}`: already verified.
  - Search Console is verified by a DNS TXT record on tanishq.website, seen in public DNS on 21 Oct 2026.
  - Phase 8 keeps that record when adding Vercel's, and recreates it if the nameservers move to Vercel. The sitemap is still to submit.
- **Still open:** `{{VDR_IMAGES}}` (Tanishq will share it) and `{{FOUNDED}}` (shows "2026").
- **The Master's plan is still mentioned in three places:**
  - About ("Next, I'm applying for a Master's…");
  - the resume summary;
  - the contact form's "Research or a Master's programme" topic.

  Tanishq's note was about the Now list, so these keep the wording of A.8, A.14 and A.12 until Tanishq says otherwise.

## Phase 6 — Remaining pages — 21 Oct 2026

**Pages.** Company, About, Open source, Now, Uses, Privacy, 404, Resume (+ `/resume.pdf`) and Contact (+ `/api/contact`). Each takes its copy from `content/`, and its title, description and canonical URL from `site.seo.pages` through `pageMetadata()` (`src/components/site/page.tsx`). `/privacy` got an SEO entry; its description is the privacy note's own first sentence.

**Company (§8.5, A.7).**
- **Order:** the spec's order (hero, principles, products, services, platform link, CTAs).
- **Signature moment:** the product cards lift in through the shared reveal, then each accent glow fades in after its own card.
  - This applies only inside `[data-lift]`, so the Home band's cards stay as they were.
  - The reveal's batch index is now also a CSS variable (`--reveal-i`), so a glow can wait for its card. The stagger itself is unchanged.
  - Cards in a row come in together, 75 ms apart; stacked cards come in one by one as each enters view.
- **Launch flags:** while `jainavLive` is false:
  - the CTA row shows "jainavinfotech.in · launching soon" as text, with a GitHub button;
  - VYRO's jainavinfotech.in link is hidden.
- **Link names:** every product link names its product for screen readers (for example "Download: VYRO"), so the repeated "Download" and "Case study" links are distinct.

**About (§8.6, A.8).**
- **Layout:**
  - phones: the photo (at most 320 px), then the story;
  - from md: the photo (5 columns) beside the story, with the timeline and the rest full width below, so the dates column isn't squeezed on tablets;
  - from lg with at least 600 px of height: the rest sits in the story column and the photo stays sticky (cross-device §5).
- **The timeline draws** (§6.3, cross-device §4).
  - A 1 px accent line scales on a CSS view timeline: `animation-range: cover 50vh cover calc(100% - 50vh)`. This makes its drawn end follow the middle of the screen.
  - Stable Firefox has no view timelines, so `src/components/motion/draw-line.tsx` sets the same transform from a scroll listener. It measures the list the line spans, because the line's own box is scaled by that transform.
  - No Motion, as everywhere else.
  - Reduced motion and print show the line drawn.
- **CGPA:** shown, as §21 says.
- **Still mentioned:** the Master's plan stays in the story (A.8) until Tanishq says otherwise.

**Open source (§8.7, A.6).**
- **PR links:**
  - each PR number in the copy links to its PR, but only if it's in `content/data/open-source.json` (the merged PRs);
  - issue #4147 stays plain text.
- **The dot timeline** (§6.3, cross-device §4) is server-rendered HTML and CSS, so it ships no JS.
  - Each dot sits at its merge date.
  - The axis breaks wherever merges are more than 90 days apart. That gives one break, placed from the data, between the last PEcAn merge (23 Oct 2022) and #4186 (27 Oct 2023).
  - Merges within three days of each other stack across the axis, so dots never overlap.
  - LitmusChaos is a ring and PEcAn a filled dot, so the project isn't told by colour alone. A legend sits under the axis.
  - Vertical below 640 px, horizontal from there.
  - The dots pop in by date, 75 ms apart, once the axis is in view; under reduced motion and in print they're all shown.
  - "View data" lists every PR, linked.
- **Month names:** "Sep", not en-GB's "Sept", to match the copy ("Jul – Sep 2022").

**Now, Uses, Privacy.**
- **Now:** "Last updated 21 October 2026", in a `<time>` element.
- **Uses:** a line with a placeholder would still be hidden (none is left), and backticks render as code.
- **Privacy:** the email address is a mail link.

**404 (§8.12, §6.3).**
- `app/not-found.tsx`, which returns a 404 status.
- A VYRO-style dial whose needle drops to zero in a 600 ms CSS keyframe and rests there. Under reduced motion it starts at zero.
- The "Ctrl K / ⌘K" hint shows only with a fine pointer (`any-pointer-fine`), as cross-device §3 says. The search it points to arrives in Phase 7.

**Resume (§8.10, A.14).**
- **One source:** `src/lib/resume.ts` builds the header and the seven sections once, in the §8.10 order, for both the page and the PDF.
  - Placeholders are resolved: the founding year shows "2026".
  - A.6 becomes two lines (the Home cards).
  - A.11 becomes one line per group.
- **Header:** name, email, `tanishq.website`, LinkedIn, GitHub and "Indore, India". No address, no phone.
- **Web page:**
  - one 68ch column, with the PDF button at the top;
  - dates go on their own line on phones.
  - The button reuses A.13's "Download resume" and is a plain `download` link: `Button` now sends download links past `next/link`.
- **Print:**
  - `tokens.css` gains a print block that forces the light tokens on every page, including regions pinned to dark;
  - the header and footer are hidden;
  - `@page` is A4 with 16 × 18 mm margins;
  - entries don't split across pages.
- **The PDF:**
  - `@react-pdf/renderer` inside a `force-static` route handler, so it's rendered once at build time and served as a static file;
  - A4, one column, 2 pages, about 35 KB;
  - the colours are the light theme's tokens;
  - case-study and certificate titles link to `https://tanishq.website/…`, so `site.url` is now in `content/site.ts`, and the layout's `metadataBase` uses it too.
- **Fonts: the site's own, embedded.**
  - The variable woff2 files that next/font downloads give only the regular weight, and their Latin subset lacks "→". So Tanishq approved downloading static TTFs from Google Fonts (21 Oct 2026).
  - `assets/fonts/` holds the five files, with their OFL licences (about 414 KB; not served):
    - Plus Jakarta Sans 400, 600 and 700;
    - JetBrains Mono 400 and 500.
  - The text matches the site's roles: Jakarta for the body, 600 for titles and 700 for the name; JetBrains Mono for the section labels (500) and the dates (400).
  - react-pdf embeds subsets with ToUnicode maps, so the text stays selectable. Every character the resume uses has a glyph, "→" included.
  - A first build used Helvetica while the download waited for approval; Helvetica has no "→".

**Contact (§8.11, §14).**
- **Where messages go:** `src/lib/contact-server.ts` decides from the environment.
  - **Live:** with Resend and Turnstile configured, messages are sent.
  - **Off Vercel** (a laptop, CI) and not configured: messages are written to `.outbox/`, using Cloudflare's published always-pass test keys. These are public test values, not secrets.
    - The spec says "in development"; this covers `next start` too, so the CI end-to-end tests exercise the outbox.
  - **On Vercel but not configured** (previews today): the form stays visible, and Send opens the visitor's email app with the topic and message filled in. This is the mailto fallback; the endpoint answers 503. No new copy was needed.
- **The endpoint's checks, in order:**
  1. a 32 KB body limit;
  2. the honeypot (a hidden `website` field: if a bot fills it, the reply is "ok" and nothing is sent);
  3. Zod, with A.12's messages for name, email and message;
  4. the rate limit: 5 per 10 minutes per address, counted on valid submissions;
  5. server-side Turnstile verification;
  6. Resend, in plain text, with reply-to set to the sender.
- **Plain text:** names and subjects are collapsed to one line and control characters are removed, so nothing can inject a header.
- **Rate limit details:**
  - It is in memory, so it applies per server instance. That is recorded in the code with a `ponytail:` note.
  - The address comes from `x-forwarded-for`, which Vercel sets itself.
- **No new packages:**
  - Resend is called over its REST API with `fetch`;
  - Turnstile uses its explicit-render script.
  - `resend` and `@marsidev/react-turnstile` are pre-approved but not needed.
- **Form:**
  - **Client checks:** native validity, shown with A.12's messages; a field of spaces counts as empty. Each error is tied to its field (`aria-invalid`, `aria-describedby`), and the first bad field gets focus.
  - **Status:** success and errors are announced in a polite live region.
  - **Touch:** `autocomplete`, `type=email`, `enterkeyhint`, a native `<select>`, and `field-sizing: content` with a 6-row minimum. Controls are 48 px tall with 17 px text.
  - **Turnstile:** `flexible`, with 65 px reserved; under a 300 px container it is `compact`, with 140 px reserved. It follows the site theme.
- **Still mentioned:** the "Research or a Master's programme" topic stays (A.12) until Tanishq says otherwise.

**Security headers (§14).** They come in now because the contact form brings the first third party.
- **CSP:**
  - `default-src 'self'`;
  - scripts from `'self' 'unsafe-inline'` (the theme and reveal scripts) plus `https://challenges.cloudflare.com`;
  - `frame-src` for Turnstile;
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'` and `form-action 'self'`;
  - development adds `'unsafe-eval'` for React's tooling.
  - Vercel Analytics (Phase 7) is served from this origin, so it needs no change.
- **Other headers:**
  - HSTS: two years, with subdomains, without preload;
  - `nosniff`;
  - `strict-origin-when-cross-origin`;
  - `Permissions-Policy` turning off the camera, microphone and geolocation.

**New UI strings (Phase 6).** These are on the same footing as Phase 5's (Tanishq left new strings to me on 21 Oct 2026):
- Open source: "Merged pull requests", "Each dot is one merged pull request, on the day it merged.", "PEcAn", "LitmusChaos", and the table columns "PR", "Project", "Title", "Opened", "Merged".
- The 404 dial: "0" and "RPM", both decorative (`aria-hidden`).
- The rest are the spec's own labels:
  - A.7's "Principles", "Products" and "Email the company";
  - A.8's "Experience", "Education", "Certifications" and "Languages";
  - A.9's "Last updated";
  - A.10's "Desktop", "Why it matters" and "Development";
  - A.14's "Relevant coursework";
  - A.6's "What the PRs did";
  - §8.10's section names.

**Measured (local, 21 Oct 2026).**
- **Lighthouse mobile, one run each:**
  - /about: performance 97, LCP 1.90 s;
  - /contact, /open-source, /company and /resume: performance 99, LCP 1.61–1.72 s;
  - every page: accessibility 100, best practices 96, SEO 100, CLS 0.
- **Interaction budgets:** 17 passed.
- **End-to-end:** the default device projects passed, except one known flake, which passes 20 times out of 20 when run alone. desktop-webkit, tablet-portrait-ios and tablet-android also passed the new specs. Firefox runs in CI.


## Phase 7 — Polish and SEO — 21 Oct 2026

**Page transitions (§6.2, cross-device §4).** Next 16.4 with React 19.3 has `<ViewTransition>` stable and needs no config, so the spec's first option applies.
- **How:** `app/template.tsx` wraps each page in `<ViewTransition enter="page" exit="page" default="none">`; `app/work/template.tsx` re-exports it, so moving between case studies fades too. A template remounts when its segment changes, which is what fires enter and exit. A layout-level wrapper would "update" instead, and its group would slide from the old scroll position to the new one.
- **The fade:** the old page fades out where it was and the new one fades in, opacity only, 150 ms (the fast token). The spec says 200 ms; 150 ms fits cross-device's reduced-motion cap, so one fade serves both. Under reduced motion the groups don't animate at all.
- **Cover morph:** from 768 px with motion allowed, the Baby, VYRO and MenuMesh covers on /work morph into their case-study hero (250 ms). These are the three with both a cover screenshot and hero media. A cover with no partner fades with the page. The hero end drops its name while it's off-screen, so going back from a scrolled case study doesn't fly the cover in from outside the viewport. Phones get the plain fade.
- **One set of names at a time:** `data-vt` on `<html>` says which same-page transition is running. The theme switch cross-fades the whole page (250 ms). The Work filter names its cards only while it runs. Route changes name only the covers. Before this, the cards were named all the time, so they would have faded on their own on every route change.
- **iOS swipe-back:** a `popstate` with `hasUAVisualTransition` sets `data-vt="skip"`, and the next transition jumps to its end. React offers no handle on its transition, so the flag clears on a 1 s timer (a `ponytail:` note in the code).
- **Unsupported browsers** swap instantly, as cross-device says.

**Theme switch.** `src/lib/theme.ts` sets `data-theme` and `color-scheme` inside the transition's callback and then calls next-themes, so the new snapshot already has the new theme. The header toggle, the menu's toggle and the palette all use it. The toggles load it on the first click (Home's JS budget).

**Command palette (§6.4).** No `cmdk`, although it's pre-approved.
- **Why not cmdk:** cross-device needs the input focused inside the tap, before the palette's code loads, so iOS opens the keyboard on the first tap. cmdk renders its own input, so the input would change once cmdk arrived, and iOS would drop the keyboard.
- **Instead, three parts:**
  - `search.tsx` renders the dialog, the input and the close button as plain server HTML, so they cost Home no JS.
  - `search-button.tsx` (0.4 KB) opens the dialog and focuses the input inside the tap, which is what lets iOS open the keyboard on the first tap.
  - `palette.tsx` (lazy) does everything else: it reads the input, lists the results into the dialog through a portal, and handles the keys, the close button and Esc. It loads the first time the palette opens, or earlier, on hover or focus of the button. Text typed before it arrives is picked up.
  - Ctrl K / ⌘K clicks the button (see "After the load event" below).
- **Search:** a 40-line ranker in `src/lib/fuzzy.ts` (unit-tested). Every typed character must appear in order; runs and word starts score higher. It searches titles, plus a page's SEO title and a project's stack and filters. Groups are ordered by their best match, so the first option is always the best one.
- **Accessibility:** a combobox with `aria-activedescendant` over a listbox of grouped options, so focus stays in the input. Arrows wrap. Enter follows the option. A polite status line gives the count, "Copied", or "No results". Esc or the close button closes it, and focus returns to the button that opened it.
- **Layout:** phones get a full-screen dialog with the input pinned at the top and 48 px rows. From 768 px it's a 36 rem panel 12 svh from the top, at most 60 svh tall (cross-device says "centred": centred across, near the top, so it doesn't jump as results change).
- **Actions:** "Copy email" shows "Copied" until the query changes. "Toggle theme" closes the palette and switches. The PDF and the profiles are real links (`download`, `target="_blank"`). Following any result closes the palette at once.
- **Header:** the search button sits before the theme toggle at every width.

**"hey jarvis" and the console (§6.5).**
- **The toast:** the listener is in the after-load module, and the toast (`jarvis-toast.tsx`) comes with it. It's a light-dismiss popover, so Esc or a click elsewhere closes it, and there's no close button to label. It shows bottom right from 768 px and bottom centre, above the safe area, below that, and rises in, except under reduced motion. Its text is added once it's open, so the status role announces it. It doesn't listen inside inputs, text areas, selects or editable text, and only for unmodified keys. Keyboard only, as Tanishq decided. The orb is Baby's, static.
- **The greeting:** A.13's words, logged once per page load, after the load event.

**Share images (§11).**
- **Generation:** next/og at build time, in the resume's TTFs, on the dark tokens. Each image has the TJ monogram and the domain, the page title, "Tanishq Jain · ML & systems engineer", and the signal line; Home has the name and "ML & systems engineer · Indore, India". Baby, VYRO and MenuMesh draw the line in their accent.
- **Files:** one `opengraph-image.tsx` per §7 route (ten files of five lines), plus one for case studies through `generateImageMetadata`, which also gives each its alt text (`/work/<slug>/opengraph-image/share`).
- **Meta:** Twitter's card is `summary_large_image`; Next copies the Open Graph fields into the Twitter ones. `pageMetadata()` and the case-study metadata now carry Open Graph, with `siteName`, `locale` (`en_IN`) and the full title. A page's `openGraph` replaces the layout's whole, so each carries all of it.

**Icons and manifest.** `app/icon.tsx` draws the monogram at 32, 192 and 512 px (`/icon/32` and so on). `apple-icon.tsx` is 180 px. `manifest.webmanifest` uses `display: browser`, the dark `bg` for both colours, and the 192 and 512 icons. No `favicon.ico`: browsers use the `<link rel="icon">`.

**Sitemap and robots.** Every §7 page and the nine case studies; no `lastModified`, because a build date on every page would claim changes that didn't happen. robots allows everything but `/api/` and points at the sitemap. `/styleguide` returns 404 in production, so it isn't listed.

**JSON-LD (§11).**
- **Site-wide graph** (root layout): Person, Organization and WebSite, linked by `@id`.
  - **Person:** the image is the share photo, and `sameAs` includes X (Phase 6 answer).
  - **Organization:** Jainav Infotech Private Limited, with `founder` pointing to the Person. Its `url` waits for the `jainavLive` flag.
- **BreadcrumbList** on every inner page: Home → section → case study. A server component on each page renders it. A client component in the layout would have needed no page edits, but it cost Home JS.
- **SoftwareSourceCode** for case studies with a public Source link.
- **SoftwareApplication** for Baby and VYRO: Windows, `UtilitiesApplication`, the download URL, and an `offers` price of 0 INR only while the "Free" badge is shown (C.3: no prices otherwise). VYRO's repo isn't linked, so it has no source entry.
- **Escaping:** the scripts escape `<`.

**Analytics (§12).**
- **Loading:** Vercel's plain-HTML setup, not the `@vercel/analytics` and `@vercel/speed-insights` packages, which were tried and removed. A layout ships every client component it imports, even one it doesn't render, so their React components cost Home about 2 KB everywhere.
  - An inline script, rendered only when `VERCEL` is set, defines the two queues (`window.va`, `window.si`).
  - The same script adds `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` after the load event. Speed Insights still reads the earlier Web Vitals from the performance buffer.
  - Both are same-origin, so the CSP is unchanged.
  - Off Vercel the scripts would only 404 and log errors (Lighthouse's best-practices score counts those).
- **Sending:** `src/lib/track.ts` makes the same `window.va("event", …)` call as the package's `track()`, in three lines.
- **Events:** `src/lib/analytics.ts` catches three with delegated listeners after the load event, so no component needed wiring:
  - `resume_download`: any link to `/resume.pdf`;
  - `outbound_click`: told apart by URL — the profile links → `social`, `/releases` → `download`, jainavinfotech.in → `company`, github.com → `repo`, anything else → `live`;
  - `centerpiece_interact {slug}`: the first click, key or input inside a loaded centerpiece, once per page view.
- **Sent where they happen:** `palette_open`, `theme_toggle` and `contact_submit {status}`. A submit that fails field validation, or opens the mail app, isn't counted.
- **Tests:** e2e stands in for Vercel's queue (`window.va`) and checks every event.

**After the load event (`src/lib/after-load.ts`).** Enhancements imports this once the page has loaded, so none of it counts against Home's first-load JS (§13). It holds:
- the Ctrl K / ⌘K shortcut, which clicks the search button, or closes the palette;
- the "hey jarvis" listener and its toast;
- the console greeting;
- the delegated analytics listeners;
- the iOS swipe-back check;
- the Home bento demos' player (moved out of `touch-effects.ts`: the tiles sit below the fold).

A shortcut or the phrase typed in the first moments after load does nothing. The header button works from hydration on.

**Home's JS budget (§13).** Phase 6 left Home at 148.5 KB of 150 KB (150,000 bytes, the stricter reading). The first Phase 7 build was 154.5 KB. Now it's 149.6 KB:
- the palette's markup moved to the server;
- the toast, the deferred listeners and the theme cross-fade load later;
- Vercel's React components went;
- `structured-data.ts` stopped importing the case-study module, which had pulled its client component into every page.

That leaves 0.4 KB, so the next addition to Home needs a cut elsewhere first. The next candidate is the mobile menu's markup, which could be server-rendered the same way.

**New UI strings (Phase 7)** (new strings left to me, 21 Oct 2026):
- "Close search": the phone palette's close button. Cross-device §10 proposed it, and it's used at every width.
- "Home": the palette's and the breadcrumbs' name for `/`.
- "1 result", "{n} results" and "No results": the palette's count.
- The rest are A.13's: the placeholder, groups, actions, "Copied", the toast and the greeting.

**Test notes.**
- WebKit applies the page's `scroll-behavior: smooth` to Playwright's own scrolling, so a click far down the page can land mid-scroll. The transition test follows a link near the top instead. Real taps are unaffected.
- The shortcut and the "hey jarvis" listener attach after the load event, so their tests retry until they respond.

**Measured (local, 21 Oct 2026).**
- **Home's first-load JS:** 149.6 KB of 150 KB (Phase 6: 148.5 KB).
- **CPU per page load,** 4× slowdown, median of 8 loads against the Phase 6 build running next to it:
  - /work/vyro: script time 194 → 207 ms;
  - Home: script time 234 → 256 ms; task time unchanged.
- **Lighthouse mobile** (devtools throttling, 3 runs each):
  - Home: performance 0.96–0.97, LCP 2.03–2.08 s.
    - LHCI's 2.0 s check fails locally, but the Phase 6 build measured 2.08–2.15 s on the same machine the same day; this machine is slower than in Phase 3.
    - CI is the reference.
  - /work: 0.93–0.97.
  - /work/vyro: 0.88–0.92, with total blocking time 314–447 ms; the Phase 6 build measured 0.92–0.93 and 280–306 ms. Mostly run-to-run noise (see the CPU numbers above), but it sits at the 0.90 line.
  - /work/mlops-drift-loop: 0.97–0.98.
  - Everywhere: accessibility, best practices and SEO 1; CLS ≤ 0.001.
- **Interaction budgets:** 17 passed.
- **End-to-end:**
  - the default device projects: 751 passed;
  - `polish.spec.ts` also passed on desktop-webkit, tablet-portrait-ios and tablet-android.
  - In CI (run 39662522676), 1,461 passed on every device project, Firefox included.
    - One test was flaky: the known Firefox CSS-only layouts test.
    - Lighthouse passed mobile and desktop with no warnings.
- **Two CI fixes along the way:**
  - **A race in `viewTransition()`:** a skipped transition cleared the flag of the one that replaced it, so the covers got named mid theme switch.
  - **A test timing bug:** the tests read a recorded transition before its animations were known. Slower engines tripped it (Firefox, then WebKit).

## Phase 8 — Launch — 23 Oct 2026

**What needs Tanishq.** DNS at GoDaddy, the Resend and Turnstile keys, the Vercel domain and analytics settings, Search Console and LinkedIn. `docs/launch.md` lists them in order with the exact values. Nothing in the code changes at launch: `contactConfig()` moves from the mailto fallback to sending as soon as all five contact variables are set, and the contact page is static, so a redeploy picks them up.

- **`NEXT_PUBLIC_SITE_URL` (§18) isn't used.** `site.url` in `content/site.ts` is the canonical host for `metadataBase`, the sitemap, JSON-LD and the resume links. Previews therefore also declare tanishq.website as canonical, which keeps them out of search results.
- **Old site (§16.5):** option (a), a `vercel.json` with two permanent redirects committed to `nanu1605/my-portfolio`, is the recommendation. It sends `/Tanishq_Jain_Resume.pdf` straight to the new PDF and every other path to Home. Option (b), a domain redirect in the old project, keeps the path, so old paths would land on the 404 page. It goes in only after tanishq.website serves production, so it never points at GoDaddy's parking page.
- **Profile README:** `docs/profile-readme.md`. It changes the role line, adds the website, moves LinkedIn to `/in/tanishqjain010/`, and points the resume link at `https://tanishq.website/resume` instead of the old Google Drive file. Everything else is as it was.

**Production checks before the domain (Vercel production URL, 23 Oct).**
- Redirects (`/Tanishq_Jain_Resume.pdf` and `/cv`, 308), `/resume.pdf` as `application/pdf`, sitemap, robots, manifest, share images, the 404 page and every §14 header: as built.
- **Vercel Web Analytics is off:** `/_vercel/insights/script.js` returns 404, so no page views or events are counted yet, and the browser logs the 404 and a refused script on every page (best practices 96 instead of 100). Speed Insights is on. The fix is the Analytics tab's Enable button; the runbook has it.
- **Placeholder report:** only `{{FOUNDED}}` (allow-listed) and `{{VDR_IMAGES}}` (hidden where used). No `{{` in any built page.

**Lighthouse on production: §13's mobile scores, after a speed pass.**
- **First PageSpeed Insights runs, mobile** (Lighthouse 13.5, simulated Slow 4G):
  - Home: 90 and 92 (budget 95). LCP 3.2–3.3 s.
  - /work/vyro: 87 (budget 90). LCP 3.8 s, Speed Index 4.1 s.
  - Both: accessibility 100, best practices 96 (the Web Analytics 404 above), SEO 100.
  - The PageSpeed API was over its shared daily quota, so the runs came from the PageSpeed website. Its reports carry the full Lighthouse JSON, which is where the numbers below come from.
- **How the score is made** (Lighthouse's Lantern simulation, read from the source by a five-agent review):
  - Lighthouse loads the page unthrottled, then simulates Slow 4G from that trace.
  - The LCP estimate replays every request that finished before the observed paint, one after another, at about 4.9 ms per KB, plus 4× the CPU work.
  - The exceptions are low-priority images, and scripts that only start running after the paint.
  - So everything the page fetches before its first frame counts against the LCP, whether the photo needs it or not.
- **What PageSpeed's machine does:**
  - Its CPU benchmarks at 553, against about 5,000 here, so its unthrottled load is about ten times slower than a local one. One Home run: first paint at 1.23 s, photo loaded at 0.68 s.
  - Whether the ~150 KB of framework scripts land in the estimate depends on whether they finished before that first frame, so single runs swing by ten points. The 1.9 s "element render delay" in the first report is a real observed delay on that machine. It is not a simulation artefact, as this entry first said.
- **Fixes** (each also cuts bytes for real visitors):
  - **Video posters:** the `poster` attribute fetched a 1280 px WebP eagerly for every video, 97 KB on the VYRO page before its first paint. The still is now a lazy AVIF `<Picture>` under the video, which is transparent until its first frame. §15.1 says `<video poster>`; this keeps the same still, the same box and the same no-JS and reduced-motion behaviour.
  - **The hero's `preload()` hint is gone.** It travelled in Home's RSC payload, so every page that prefetched Home fetched the 70 KB photo. Home's `<img>` is already eager and high priority, and the CI LCP gate covers it.
  - **Analytics and the after-load module wait for the first paint as well as the load event** (`window.__painted`, set by the inline head script from Paint Timing, with a 5 s fallback). On a fast connection the load event can come before the first paint.
  - **The grain tile is a 9-colour palette PNG:** 1.8 KB instead of 7.1 KB, with no visible difference at 3% opacity.
- **After, PageSpeed mobile on production:**
  - Home: 90, 99, 96, median **96** (budget 95). LCP 3.2 / 2.0 / 2.8 s.
  - /work/vyro: 96 and 100 (budget 90). LCP 2.7 / 1.5 s, Speed Index 2.3 s.
  - Locally (Lighthouse 12.6.1, simulated, 5 runs): /work/vyro LCP 3.45 → 2.93 s; Home unchanged at 3.2 s, because locally the scripts always run before the first frame.
- **Considered and not done:**
  - **A patch to Next's compiled runtime** that would start the framework scripts after the first paint. It would make Home's score steady, but it edits a minified vendored file on every Next upgrade and delays hydration. Not worth it while the median meets the budget.
  - **Lower-quality hero AVIFs** (−14 KB): the photo is the owner's call.
  - **`prefetch={false}` on the wordmark:** it would also turn off hover prefetch.
  - **Preloading or moving the mono font**, and **`inlineCss`**: rejected with measurements in the review.
- **Field data is still the real test** of §13's Core Web Vitals: Speed Insights, once the domain has traffic.

**CI.**
- **The Firefox CSS-only layouts test** timed out on the last two nightly runs, on both attempts; before that it was flaky. It loaded the case study four times and scrolled smoothly with Lenis loading underneath. It now loads each flow once, resizes the page to 768 px for the tablet check, and jumps to the flow instantly.
- **Job time limit 60 → 90 min.** One nightly spent 20 minutes installing browsers and was stopped at 60 minutes. A normal run takes about 50.

**On tanishq.website (24 Oct).**
- **The domain went live** with Vercel's records at GoDaddy: `@` A `216.198.79.1`, `www` CNAME to Vercel. The certificate is from Let's Encrypt, and `www` and `http://` redirect to the apex with a 308.
- Re-checked on the domain:
  - the security headers, `robots.txt`, all 19 sitemap URLs (200);
  - canonical and `og:url` on the apex;
  - share images, icons and the manifest;
  - the old resume path redirecting to `/resume.pdf`.
- **PageSpeed mobile on the domain** (Lighthouse 13.5):
  - Home 99, 96, 99 (median 99, LCP 1.7–2.8 s);
  - /work/vyro 99;
  - /work/mlops-drift-loop 100;
  - every run: accessibility 100, best practices 96, SEO 100.
  - The only best-practices miss is still the Web Analytics 404 in the console.
  - These are better than the runs on the Vercel URL the day before. The build is the same, so the difference is PageSpeed's own run-to-run spread; nothing was changed for it.
- **Structured data:** Google's Rich Results Test needs a sign-in, so it stays Tanishq's step. schema.org's validator found 0 errors and 0 warnings in the Person, Organization and WebSite markup on the live Home page.
- **DMARC:** GoDaddy's default `_dmarc` record (`p=quarantine`, reports to GoDaddy) was in public DNS on 23 Oct and had gone on 24 Oct, probably removed along with the parking records. The runbook first said to keep it; it now says to add `v=DMARC1; p=none;` if no record exists, and never a second one.
