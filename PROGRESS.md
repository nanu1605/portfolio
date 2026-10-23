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
- CI runner (slower CPU), after the font-fallback fix: LCP 1.8 s, CLS 0.001, performance median 0.98 (one cold run 0.90). The performance score is a CI warning; §13 is checked on production in Phase 8.
- Deferred: the header search (⌘K) button arrives with the palette in Phase 7; bento micro-demos in Phase 5.

## Phase 4 — Work index and case studies

- [x] `/work`: filters synced to `?filter=` (applied before first paint), layout animation, archive list.
- [x] Case-study template (§8.4) and the 9 MDX case studies (A.4): figures, "How this was built" notes, previous/next, reading progress, sticky TOC.
- [x] Redirects (§4.4).
- [~] `scripts/capture/menumesh.ts` written and run: 23 screens, a 15.5 s demo video and the logo, used in the MenuMesh case study. `scripts/capture/jainav.ts` not written: the permission check blocked a script that clones and runs the Jainav repo. The Jainav case study uses its platform diagrams (the §15.2 fallback) until Tanishq decides.
- [x] ↔ Wrapping filter chips; View Transition grid with `flushSync` and `history.replaceState`; reading-progress bar at every width; no TOC below 1024 px; meta row 2×2 on phones; data tables in focusable scroll regions; videos with Pause/Play, one at a time, poster + play button when autoplay is refused.
- [x] ↔ Tests: filter by tap; progress is transform-only; route change on touch lands at the top; back navigation leaves content above the viewport revealed.
- [x] C.4: item 1 (VYRO download URL: v1.4.1 MSI listed), item 3 (VYRO repo: not linked, going private), item 4 (F1 Insights: the site loads but its data calls fail, so the archive links the repo only).

Done when: all 9 pages render with correct metadata; every number traces to Appendix C; axe passes.

- [x] All 9 pages: title `{title} — Tanishq Jain`, description `{oneLiner}`, canonical on tanishq.website (e2e on every device project).
- [x] Every metric value matches C.1, and every number in a case study's body and TL;DR appears in its A.4 copy (`tests/unit/traceability.test.ts`).
- [x] axe: /work and all 9 case studies in both themes, on every device project.
- Lighthouse mobile, applied throttling, 3 runs each: /work 0.98–0.99, case studies 0.98–0.99; accessibility 1, best practices 0.96, SEO 1; LCP 1.6–1.9 s; CLS ≤ 0.005. CI now checks /, /work and /work/vyro.

## Phase 5 — Centerpieces and micro-demos

- [x] Centerpieces §10.1–10.6 and §10.8–10.9: Baby "Follow a turn", VYRO gauge panel, Jainav stepper + build timeline, MenuMesh "Table to bill", Reservoir weight mixer, Forecasting calibration explorer, VDR pipeline strip, MyCounselHub flow. Each lazy island loads within 200 px of view over a same-box server poster; "View data" tables kept.
- [x] §10.7 MLOps: `make experiment` ran (scratch clone at 0a0b95f, synthetic data): 20 batches, mean F1 0.268 before promotion and 0.780 after. Tanishq approved the import on 21 Oct 2026; the per-batch "Watch it recover" chart scrubs with scroll (pinned from 768 × 600), lights the loop at the tick, reads by key and tap, and fails the build if the series and the 0.27 → 0.78 headline ever disagree.
- [x] MenuMesh kitchen and bill recaptured at phone width for the phone stepper (smallest text 5.7 → 10.9 px and 7.1 → 12.6 px on a 360 px phone).
- [x] Home bento micro-demos (§10.10): CSS/SVG, hover or focus on fine pointers, once at 50% in view on touch, static under reduced motion.
- [x] ↔ Container-query layouts; scroll-snap steppers that scroll only their track; MenuMesh sticky story at `(min-width: 768px) and (min-height: 600px)`; reservoir handle-only touch drag + tap-to-place; VYRO Pause/Play; Baby's first scenario plays once in view; micro-demos once in view on touch.
- [x] ↔ Tests: mouse, touch (tap, CDP swipe and finger drags) and keyboard per centerpiece; poster swap shift 0; chunks ≤ 60 KB; 4× throttle budgets in `pnpm test:budget` (run alone, also in CI).
- [x] C.4 item 2 (forecasting test windows): the test histories skip the validation months for every model. A.4.6's Setup now says so (wording approved 21 Oct 2026).
- [x] Phase 4 defects fixed: mono fallback reflow (CLS 0.129 on MLOps) and the TL;DR reveal delaying LCP (2.6 s on Forecasting).

Done when: each centerpiece works with mouse, touch and keyboard; data matches Appendix B; lazy chunks within budget; no main-thread tasks over 50 ms during interaction.

- [x] Mouse, touch and keyboard e2e for every centerpiece on desktop-chromium, phone-android, phone-ios and tablet-landscape-ios.
- [x] Data from Appendix B via `@content/charts` and `@content/metrics`; every number in centerpiece copy traces to its §10 subsection, A.4 or Appendix B (`tests/unit/traceability.test.ts`).
- [x] Lazy chunks 6.3–17.8 KB gzipped (budget 60 KB).
- [x] Longest task 0 ms on every interaction at 4× throttle; slowest event 16–40 ms (INP budget 200 ms).
- Lighthouse mobile, all 11 pages: performance 97–99, accessibility 100, best practices 96, SEO 100, LCP 1.65–1.93 s, CLS ≤ 0.001.
- CI run 39489961806 (full matrix on main): 999 e2e passed, 0 flaky; 15 interaction-budget tests passed; Lighthouse mobile and desktop passed; audit clean; Vercel deployed.

## Phase 6 — Remaining pages

- [x] Company (A.7), About (A.8), Open source (A.6), Now (A.9), Uses (A.10), Privacy and 404 (A.13), each with its signature moment: company cards lift in before their glows, the About timeline draws with scroll, the open-source dots pop in by date (axis break placed from the data), the 404 needle drops to zero.
- [x] Resume web page and `/resume.pdf` (§8.10, A.14): both from one builder; the PDF is A4, 2 pages, rendered at build time, with the site's fonts embedded (static TTFs in `assets/fonts/`, OFL, approved 21 Oct 2026).
- [x] Contact and `/api/contact` (§8.11): Zod, honeypot, 32 KB body limit, 5 per 10 min per IP (per instance), Turnstile, Resend over REST; `.outbox/` off Vercel with Cloudflare's test keys; on Vercel without keys the form opens the email app (mailto fallback).
- [x] §14 security headers (CSP with Turnstile, HSTS, nosniff, referrer and permissions policies).
- [x] ↔ Per-device layouts: vertical open-source dot timeline below 640 px, About sticky photo off below 600 px height, contact field attributes (`autocomplete`, `enterkeyhint`, `field-sizing`), flexible/compact Turnstile, 404 hint hidden on touch.
- [x] ↔ Tests: scroll-drawn moments reach their final state on every engine; contact form by touch.

Done when: the PDF downloads, has selectable text and fits on at most 2 pages; the contact e2e test passes; "Now" shows its date.

- [x] `/resume.pdf`: `application/pdf`, 2 A4 pages, embedded fonts with ToUnicode maps, text drawn as text (checked in `tests/e2e/pages.spec.ts`).
- [x] Contact e2e: validation, touch input attributes, success with the Turnstile test keys into `.outbox/`, endpoint errors, honeypot and the rate limit.
- [x] Now shows "Last updated 21 October 2026".
- Lighthouse mobile (local, one run): /about 97, /contact, /open-source, /company and /resume 99; accessibility 100, best practices 96, SEO 100, LCP 1.61–1.90 s, CLS 0.
- CI run 39604816330 (full matrix on main): 1372 e2e passed, 1 flaky (the Firefox CSS-only layout check, which stalls now and then and predates this phase); 17 interaction-budget tests passed; Lighthouse mobile and desktop passed; audit clean; Vercel deployed.

## Phase 7 — Polish and SEO

- [x] Page transitions (§6.2) and the command palette (§6.4).
- [x] "hey jarvis" toast and the console greeting.
- [x] Share images for every route, favicon and manifest, JSON-LD, sitemap and robots, canonical URLs.
- [x] Analytics events (§12): Vercel Analytics and Speed Insights load on Vercel only, after the load event; events checked in e2e.
- [x] ↔ React `<ViewTransition>` page cross-fade, skipped on `hasUAVisualTransition`; cover morph only at 768 px and up; theme cross-fade sets `data-theme` synchronously; palette full-screen on phones with the input focused in the tap handler.
- [x] ↔ Tests: page transitions on every engine; palette by keyboard and by touch (`tests/e2e/polish.spec.ts`).

Done when: the palette is fully keyboard accessible; every route has a share image; Lighthouse budgets met locally; Tanishq checks the Person/WebSite markup in Google's Rich Results Test.

- [x] Palette fully keyboard accessible: combobox and listbox, arrows, Enter, Esc, focus returns; axe clean with it open, in both themes; by touch on phones and tablets.
- [x] Every route has a 1200×630 share image (e2e checks each one's size and type).
- [x] Lighthouse: CI run 39662522676 passed mobile and desktop on /, /work, /work/vyro and /work/mlops-drift-loop with no warnings (LCP under 2.0 s, performance at least 0.95). Locally this machine runs slower: Home LCP 2.03–2.08 s, the same as the Phase 6 build there. Home JS 149.6 KB of 150 KB. Interaction budgets 17/17.
- [x] CI run 39662522676: 1,461 end-to-end tests passed on every device project, Firefox included; 1 flaky (the known Firefox CSS-only layouts test); Vercel deployed.
- [ ] Tanishq checks the Person/WebSite markup in Google's Rich Results Test (needs the live domain, or a pasted page source, in Phase 8).

## Phase 8 — Launch

Tanishq's steps, in order, are in `docs/launch.md`.

- [ ] Production env vars, Resend domain verified, Turnstile for `tanishq.website`. Also enable Vercel Web Analytics: its script returned 404 on production (23 Oct).
- [ ] Domain in Vercel, `www` redirect, HTTPS.
- [ ] Redirect the old site (§16.5). The `vercel.json` for `nanu1605/my-portfolio` is drafted in `docs/launch.md`; it goes in after the domain works.
- [~] Search Console verified (DNS TXT record, 21 Oct 2026); keep that record when adding Vercel's, and recreate it if the nameservers move to Vercel. Sitemap still to submit.
- [~] Lighthouse on production URLs; placeholder report empty or only allow-listed items.
  - Placeholder report: only `{{FOUNDED}}` (allow-listed, shows "2026") and `{{VDR_IMAGES}}` (hidden where used). No `{{` in any built page.
  - Before the domain, on the Vercel production URL (23 Oct): PageSpeed Insights mobile gives Home 90 (LCP 3.3 s) and /work/vyro 87 (LCP 3.8 s), under §13's 95 and 90. Accessibility 100, best practices 96, SEO 100. See `docs/decisions.md`, Phase 8.
  - Redirects, sitemap, robots, manifest, share images, 404 and the security headers all checked on that URL.
- [x] Draft (don't push) the `nanu1605/nanu1605` profile README: `docs/profile-readme.md`.
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

`{{FOUNDED}}` (shows "2026"), `{{VDR_IMAGES}}` (Tanishq will share).
Resolved: `{{REPO}}` = `nanu1605/portfolio` (public), `{{CONFIRM_AI_NATIVE}}` = true, `{{BOSCH_DOCS_TRACK}}` = include. On 21 Oct 2026: `{{EDITOR}}` = Visual Studio Code, `{{UDEMY_COURSE_TITLE}}` = Learn Ethical Hacking From Scratch, `{{X_URL}}` = https://x.com/tanishq11567281 (shown), `{{MYCOUNSELHUB_URL}}` = no link, `{{NOW_ITEMS}}` = left to me (no Master's item), `{{VYRO_PRO}}` = yes, launching soon, `{{REGISTRAR}}` = GoDaddy, `{{GSC_TXT}}` = already verified by a DNS TXT record (`google-site-verification=…`, seen in public DNS on 21 Oct 2026).
The allow-list and fallbacks live in `content/placeholders.ts`; `pnpm check:content` prints where each one is used.
