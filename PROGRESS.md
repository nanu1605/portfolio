# Progress

Tasks from `PORTFOLIO_SPEC.md` §19, plus the cross-device tasks from `docs/cross-device.md` (marked ↔). Each phase ends with all checks, a phase report and a stop for approval.

## Phase 0 — Setup and guardrails

- [x] Scaffold Next.js 16 non-interactively with TypeScript, the App Router, `src/`, Tailwind v4, ESLint and pnpm. Node 24.
- [x] Set up Prettier, Husky + lint-staged, and `.editorconfig`.
- [x] Build the token pipeline: `tokens.ts` → `pnpm tokens:build` → `tokens.css` with culori contrast checks; `@theme inline` mapping; `next-themes` (`data-theme`, dark default) with no flash.
- [x] Load the fonts through `src/styles/fonts.ts`.
- [x] Add the `check:tokens` script, and a `check:content` stub.
- [x] Set up Vitest, Playwright + axe, and GitHub Actions CI.
- [x] Write `CLAUDE.md` (§3), `PROGRESS.md` and `docs/decisions.md`.

Done when:

- [x] `/` renders a placeholder, and the theme toggle works without a flash
- [x] a hex colour in a component fails `check:tokens`
- [x] CI is green (run 39376359564, 20 Oct 2026)
- [x] the Vercel URL works (https://portfolio-eight-gamma-4x0xpdi5wk.vercel.app, checked 20 Oct 2026)

## Cross-device UX baseline (before Phase 1)

- [x] Audit the spec for phone, tablet and desktop UX and motion; write `docs/cross-device.md` (device classes, touch versions of every pointer effect, layouts, centerpieces, performance rules, test plan).
- [x] Tanishq's decisions: per-item handling for auto-moving content (WCAG 2.2.2), no phone TOC, "hey jarvis" keyboard-only, icon-button labels approved.
- [x] Playwright device matrix: 4 projects on every PR (desktop Chromium 1440, Pixel 10, iPhone SE, iPad Mini landscape), 8 on main and nightly.
- [x] Emulation guard and the 320–1920 px overflow sweep on `/`.

## Phase 1 — Content layer

- [x] Zod schemas (§4.2); all content files from Appendix A, including the 9 case-study MDX bodies; `metrics.ts` from Appendix C (70 metrics); `content/data/*.json` from Appendix B, plus the 16 merged PRs from GitHub.
- [x] MDX (`@next/mdx`, `remark-gfm`) and the component map.
- [x] `scripts/images.ts` (§15): photo variants, web variants of the VYRO and Baby screens and videos (§15.1); product icons copied in with sources recorded.
- [x] Load `assets/source/screens/manifest.json` through a Zod schema.
- [x] `check:content`: validate content, unique slugs, every metric has a source, `{{PLACEHOLDER}}` report (warn in dev, fail in production unless allow-listed).
- [x] `lib/github.ts` (§4.3), with a fallback.
- [x] ↔ `images.ts` also makes 640 and 960 px screenshot variants (never upscaled) for bento posters and phone figures.

Done when:

- [x] `pnpm check:content` passes and prints the placeholder report
- [x] a unit test fails if a metric loses its source
- [x] the images are generated (`public/media/`, 12 MB)

## Phase 2 — Design system and motion

- [x] Components (§5.7) and motion primitives: `Reveal`, `TextReveal`, `CountUp`, `Magnetic`, `Spotlight`, `SignalLine`, `usePauseWhenHidden`, `useReducedMotionSafe`.
- [x] Lenis provider (fine pointers only, lazy).
- [x] `/styleguide`, excluded from production builds.
- [x] ↔ Input detection: pointer-effects chunk on `(any-hover: hover) and (any-pointer: fine)` with a per-event `pointerType` check; Lenis on `(pointer: fine) and (hover: hover)` only.
- [x] ↔ Touch versions (§3 of the doc): delayed touch bloom for Spotlight, press scale + halo for Magnetic, shared token-driven `:active` press style on every interactive element, `touch-action: manipulation` on controls.
- [x] ↔ CSS-first primitives: inline pre-hydration reveal observer (instant reveal above the viewport), server-split `TextReveal` with `aria-hidden` words, `CountUp` through the metric formatter, `m` + `LazyMotion` only where needed.
- [x] ↔ Global: `viewport-fit=cover` and safe-area gutters, `data-scroll-behavior="smooth"` + `scroll-padding-top`, `theme-color` meta follows the theme, `bg` on `html`, dialog/popover exit helper, `@media print` final states, `prefers-contrast` / `forced-colors` / `prefers-reduced-transparency`.
- [x] ↔ `/styleguide` gated by `notFound()` when `VERCEL_ENV === "production"` so CI can test it.
- [x] ↔ Tests: reduced-motion final states, pause off-screen and in hidden tabs, pointer effects present on desktop and absent on touch, touch versions run, no stuck hover, tap-target audit, every tappable element changes on press.

Done when:

- [x] every component renders in dark and light at 375, 768 and 1440 px without overflow (`/styleguide` is in the 320–1920 px sweep and runs on every device project, with axe in both themes)
- [x] keyboard use and focus work, and axe passes
- [x] reduced motion shows final states
- [x] no colour literals (`check:tokens`)

From §5.7, Header, MobileMenu and Footer (Phase 3), ReadingProgress and TOC (Phase 4) and CommandPalette (Phase 7) are built in the phases that specify them.

## Phase 3 — Global layout and Home

- [x] Header (hides on scroll), mobile menu, footer, skip link.
- [x] Home sections in §8.2 order with A.2 copy: hero signature moment, proof strip, bento tiles (static covers), company band, experience, open source, principles, stack with linked highlighting, education, contact CTA.
- [x] Hero LCP: photo `preload` (Next 16's replacement for `priority`) and sized; text renders immediately.
- [x] Lighthouse CI in the pipeline (§13 budgets).
- [x] ↔ Per-device layouts from the doc's §5: menu button below 1024 px (full-screen `<dialog>`), stacked phone hero with the photo glide, phone-landscape hero, proof strip 5 rows / 3 + 2 / one row from xl, bento spans per breakpoint, tap-to-pin stack.
- [x] ↔ Hero: CSS-only entrance from first paint, photo from opacity 0.01; drift and glow stop after 5 s and restart on tap, pointer move or return to view; touch glow drift + tap-to-move.
- [x] ↔ Tests: hero and reveals work with app JS blocked; mobile menu by touch; header hide/return + anchor offset; honesty labels visible at 360 px; visual screenshots per device in both themes; LHCI mobile on PRs and desktop on main with the LCP element recorded at 412×823 and 375×667; `perf-phone` / `perf-desktop` projects (scroll CLS, Home JS ≤ 150 KB).

Done when: Home matches the spec at three widths in both themes; local Lighthouse mobile LCP < 2.0 s; every link resolves; no layout shift from fonts or images.

- [x] Home at 375, 768 and 1440 px in both themes (screenshots in the Playwright report).
- [x] Lighthouse mobile, applied throttling, 3 runs: performance 0.98–0.99, accessibility 1, best practices 0.96, SEO 1, LCP 1.8 s, CLS 0.001 (decisions.md explains why not simulated).
- [x] Links: in-page anchors exist; external links resolve; internal links go to built pages or §7 routes still to come (Phases 4–6).
- [x] CLS 0.001 on load and 0 while scrolling; Home JS 147 KB gzipped.
- Deferred: the header search (⌘K) button arrives with the palette in Phase 7; bento micro-demos in Phase 5.

## Phase 4 — Work index and case studies

- [ ] `/work`: filters synced to `?filter=`, layout animation, archive list.
- [ ] Case-study template (§8.4) and the 9 MDX case studies (A.4): figures, "How this was built" notes, previous/next, reading progress, sticky TOC.
- [ ] Redirects (§4.4).
- [ ] `scripts/capture/menumesh.ts` and `scripts/capture/jainav.ts` (§15.2); captured screens in the MenuMesh and Jainav platform case studies.
- [ ] ↔ Wrapping filter chips; View Transition grid inside `startTransition` with `history.replaceState`; reading-progress bar at every width; no TOC below 1024 px; meta row 2×2 on phones; data tables in focusable scroll regions; videos with Pause/Play, one at a time, poster + play button when autoplay is refused.
- [ ] ↔ Tests: filter by tap; progress is transform-only; route change on touch lands at the top; back navigation leaves content above the viewport revealed.

Done when: all 9 pages render with correct metadata; every number traces to Appendix C; axe passes.

## Phase 5 — Centerpieces and micro-demos

- [ ] Centerpieces §10.1–10.9.
- [ ] Export the MLOps per-batch data (§10.7), or record the fallback.
- [ ] Home bento micro-demos (§10.10).
- [ ] ↔ Centerpieces per the doc's §6: container-query layouts; scroll-snap steppers that scroll only their track; MenuMesh and MLOps sticky versions at `(min-width: 768px) and (min-height: 600px)`; reservoir handle-only drag + tap-to-place; VYRO Pause/Play; Baby first scenario plays once; micro-demos once in view on touch.
- [ ] ↔ Tests: mouse, touch (tap, CDP swipe, PointerEvent drags) and keyboard per centerpiece; poster swap with zero layout shift; INP < 200 ms at 4x throttle; no long tasks during interaction.

Done when: each centerpiece works with mouse, touch and keyboard; data matches Appendix B; lazy chunks within budget; no main-thread tasks over 50 ms during interaction.

## Phase 6 — Remaining pages

- [ ] Company (A.7), About (A.8), Open source (A.6), Now (A.9), Uses (A.10), Privacy and 404 (A.13).
- [ ] Resume web page and `/resume.pdf` (§8.10, A.14).
- [ ] Contact and `/api/contact` (§8.11), with the dev outbox and the mailto fallback.
- [ ] ↔ Per-device layouts: vertical open-source dot timeline below 640 px, About sticky photo off below 600 px height, contact field attributes (`autocomplete`, `enterkeyhint`, `field-sizing`), flexible/compact Turnstile, 404 hint hidden on touch.
- [ ] ↔ Tests: scroll-drawn moments reach their final state on every engine; contact form by touch.

Done when: the PDF downloads, has selectable text and fits on at most 2 pages; the contact e2e test passes; "Now" shows its date.

## Phase 7 — Polish and SEO

- [ ] Page transitions (§6.2) and the command palette (§6.4).
- [ ] "hey jarvis" toast and the console greeting.
- [ ] Share images for every route, favicon and manifest, JSON-LD, sitemap and robots, canonical URLs.
- [ ] Analytics events (§12).
- [ ] ↔ React `<ViewTransition>` page cross-fade, skipped on `hasUAVisualTransition`; cover morph only at 768 px and up; theme cross-fade sets `data-theme` synchronously; palette full-screen on phones with the input focused in the tap handler.
- [ ] ↔ Tests: page transitions on every engine; palette by keyboard and by touch.

Done when: the palette is fully keyboard accessible; every route has a share image; Lighthouse budgets met locally; Tanishq checks the Person/WebSite markup in Google's Rich Results Test.

## Phase 8 — Launch

- [ ] Production env vars, Resend domain verified, Turnstile for `tanishq.website`.
- [ ] Domain in Vercel, `www` redirect, HTTPS.
- [ ] Redirect the old site (§16.5).
- [ ] Search Console verified, sitemap submitted.
- [ ] Lighthouse on production URLs; placeholder report empty or only allow-listed items.
- [ ] Draft (don't push) the `nanu1605/nanu1605` profile README.
- [ ] Tanishq adds the site to LinkedIn.
- [ ] ↔ Manual real-device checklist (`docs/cross-device.md` §8) on an iPhone, a mid-range Android phone and an iPad; Speed Insights split by device type.

Done when: `https://tanishq.website` serves production; the old URL redirects; a contact message arrives; mobile budgets met on production; no `{{` visible anywhere.

## Phase 9 — (Optional) "Ask about me"

- [ ] `/api/ask` with streaming, retrieval over site content, OpenRouter, scoped system prompt.
- [ ] Rate limit and `ASK_DAILY_BUDGET_USD`; counts only.
- [ ] "Ask" panel with the Baby orb and the "AI answers can be wrong" label.
- [ ] Disabled cleanly without a key.

## Phase 10 — (Optional) Writing

- [ ] MDX posts with RSS.

## Anytime — Fresh screens

- [ ] Re-run the capture scripts after product changes; swap in new recordings if the apps change; replace remaining "Illustrative" screens.

## Placeholders still pending

`{{FOUNDED}}` (shows "2026"), `{{EDITOR}}`, `{{UDEMY_COURSE_TITLE}}`, `{{X_URL}}` (hidden), `{{MYCOUNSELHUB_URL}}`, `{{VDR_IMAGES}}`, `{{NOW_ITEMS}}`, `{{VYRO_PRO}}` (default no), `{{REGISTRAR}}`, `{{GSC_TXT}}`.
Resolved: `{{REPO}}` = `nanu1605/portfolio` (public), `{{CONFIRM_AI_NATIVE}}` = true, `{{BOSCH_DOCS_TRACK}}` = include.
The allow-list and fallbacks live in `content/placeholders.ts`; `pnpm check:content` prints where each one is used.
