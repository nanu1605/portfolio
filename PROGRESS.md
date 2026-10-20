# Progress

Tasks from `PORTFOLIO_SPEC.md` §19. Each phase ends with all checks, a phase report and a stop for approval.

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
- [ ] the Vercel preview URL works (Tanishq connects the repo to Vercel)

## Phase 1 — Content layer

- [ ] Zod schemas (§4.2); all content files from Appendix A; `metrics.ts` from Appendix C; `content/data/*.json` from Appendix B.
- [ ] MDX (`@next/mdx`, `remark-gfm`) and the component map.
- [ ] `scripts/images.ts` (§15): photo variants, web variants of the VYRO and Baby screens and videos (§15.1); product icons copied in with sources recorded.
- [ ] Load `assets/source/screens/manifest.json` through a Zod schema.
- [ ] `check:content`: validate content, unique slugs, every metric has a source, `{{PLACEHOLDER}}` report (warn in dev, fail in production unless allow-listed).
- [ ] `lib/github.ts` (§4.3), with a fallback.

Done when: `pnpm check:content` passes and prints the placeholder report; a unit test fails if a metric loses its source; the images are generated.

## Phase 2 — Design system and motion

- [ ] Components (§5.7) and motion primitives: `Reveal`, `TextReveal`, `CountUp`, `Magnetic`, `Spotlight`, `SignalLine`, `usePauseWhenHidden`, `useReducedMotionSafe`.
- [ ] Lenis provider (fine pointers only, lazy).
- [ ] `/styleguide`, excluded from production builds.

Done when: every component renders in dark and light at 375, 768 and 1440 px without overflow; keyboard and focus work and axe passes; reduced motion shows final states; no colour literals.

## Phase 3 — Global layout and Home

- [ ] Header (hides on scroll), mobile menu, footer, skip link.
- [ ] Home sections in §8.2 order with A.2 copy: hero signature moment, proof strip, bento tiles (static covers), company band, experience, open source, principles, stack with linked highlighting, education, contact CTA.
- [ ] Hero LCP: photo `priority` and sized; text renders immediately.
- [ ] Lighthouse CI in the pipeline (§13 budgets).

Done when: Home matches the spec at three widths in both themes; local Lighthouse mobile LCP < 2.0 s; every link resolves; no layout shift from fonts or images.

## Phase 4 — Work index and case studies

- [ ] `/work`: filters synced to `?filter=`, layout animation, archive list.
- [ ] Case-study template (§8.4) and the 9 MDX case studies (A.4): figures, "How this was built" notes, previous/next, reading progress, sticky TOC.
- [ ] Redirects (§4.4).
- [ ] `scripts/capture/menumesh.ts` and `scripts/capture/jainav.ts` (§15.2); captured screens in the MenuMesh and Jainav platform case studies.

Done when: all 9 pages render with correct metadata; every number traces to Appendix C; axe passes.

## Phase 5 — Centerpieces and micro-demos

- [ ] Centerpieces §10.1–10.9.
- [ ] Export the MLOps per-batch data (§10.7), or record the fallback.
- [ ] Home bento micro-demos (§10.10).

Done when: each centerpiece works with mouse, touch and keyboard; data matches Appendix B; lazy chunks within budget; no main-thread tasks over 50 ms during interaction.

## Phase 6 — Remaining pages

- [ ] Company (A.7), About (A.8), Open source (A.6), Now (A.9), Uses (A.10), Privacy and 404 (A.13).
- [ ] Resume web page and `/resume.pdf` (§8.10, A.14).
- [ ] Contact and `/api/contact` (§8.11), with the dev outbox and the mailto fallback.

Done when: the PDF downloads, has selectable text and fits on at most 2 pages; the contact e2e test passes; "Now" shows its date.

## Phase 7 — Polish and SEO

- [ ] Page transitions (§6.2) and the command palette (§6.4).
- [ ] "hey jarvis" toast and the console greeting.
- [ ] Share images for every route, favicon and manifest, JSON-LD, sitemap and robots, canonical URLs.
- [ ] Analytics events (§12).

Done when: the palette is fully keyboard accessible; every route has a share image; Lighthouse budgets met locally; Tanishq checks the Person/WebSite markup in Google's Rich Results Test.

## Phase 8 — Launch

- [ ] Production env vars, Resend domain verified, Turnstile for `tanishq.website`.
- [ ] Domain in Vercel, `www` redirect, HTTPS.
- [ ] Redirect the old site (§16.5).
- [ ] Search Console verified, sitemap submitted.
- [ ] Lighthouse on production URLs; placeholder report empty or only allow-listed items.
- [ ] Draft (don't push) the `nanu1605/nanu1605` profile README.
- [ ] Tanishq adds the site to LinkedIn.

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
