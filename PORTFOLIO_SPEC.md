# Tanishq Jain — Portfolio Website Build Spec

**Version:** 1.1 · 20 October 2026
**Owner:** Tanishq Jain
**Builder:** Claude Code, phase by phase
**Production URL:** https://tanishq.website

---

## 0. How to use this spec

**For Tanishq**
1. Unzip `portfolio-starter.zip` into your projects folder (for example `~/projects/`). It creates `portfolio/` with this spec, your photo at `assets/source/tanishq-jain.jpg` and the VYRO and Baby screens in `assets/source/screens/`.
2. `cd` into the folder, start Claude Code and say: *"Read PORTFOLIO_SPEC.md and start Phase 0."*
3. Claude Code stops after every phase with a short report. Check the preview deploy, then say "go to Phase N".
4. Values only you can provide are marked `{{LIKE_THIS}}` and collected in §20. Placeholders are fine until Phase 8 (launch) unless marked **required**.

**For Claude Code**
1. Build strictly phase by phase (§19). When a phase is finished:
   - run every check (§3);
   - write a short phase report: what was built, how to verify it, open questions, placeholders still in use;
   - update `PROGRESS.md`;
   - stop and wait for approval.
2. In Phase 0, create three files:
   - `CLAUDE.md` from §3;
   - `PROGRESS.md`, with every task in §19 as a checklist;
   - `docs/decisions.md`.
3. **The content is fixed.**
   - Use the copy in Appendix A as written. You may shorten or split sentences to fit a layout.
   - You may not add claims, numbers, dates, names, testimonials or adjectives that change the meaning.
   - Every number shown on the site must come from Appendix C (fact sheet) or Appendix B (chart data).
4. `{{LIKE_THIS}}` marks a value only Tanishq can provide. Never invent it. Keep the placeholder, make the feature work with it, and list it in the phase report.
5. Where §21 gives a default for an open decision, use it and record it in `docs/decisions.md`.
6. If a library's API is uncertain, read the docs for the installed version rather than guessing. If this spec conflicts with how a library actually works, follow the library, record the deviation in `docs/decisions.md`, and mention it in the phase report.
7. Ask before you:
   - add a package that isn't pre-approved in §2;
   - change the meaning of any copy;
   - publish anything about a client, employer or other person beyond what this spec says;
   - do anything involving secrets or DNS.

---

## 1. Project overview

### 1.1 Who
Tanishq Jain is an ML and systems engineer in Indore, India, and the founder of Jainav Infotech Private Limited.
- **Previously:** software engineer at Bosch Global Software Technologies (DevOps), freelance full-stack developer (MyCounselHub), and Google Summer of Code 2022 contributor (PEcAn).
- **Next:** applying for a Master's in AI/ML in Europe for 2027.

### 1.2 Goals
1. Show, with evidence, that Tanishq builds ML systems and software that hold up in the real world.
2. **Engineer first, founder second.** The ML and systems work leads; Jainav Infotech gets a strong section of its own.
3. Make every claim checkable: each number links to a repo, release, pull request or write-up.
4. End the stale-resume problem: the resume page and PDF are generated from the same content as the site.
5. Feel premium: fast, accessible, with one signature animation per page.

### 1.3 Audiences

| Audience | Typical visit | What they need |
|---|---|---|
| Master's admissions committees and professors | 3–5 minutes, desktop | Rigour, honesty and research direction: case studies with limitations, GSoC, education, "Now" |
| ML / AI recruiters | 30 seconds | Headline, proof strip, selected work, resume download, contact |
| Engineers and hiring managers | A deep read | Architecture, decisions, results, links to the code |
| Customers and clients | Through the company section | Products, services, a link to the company site |

### 1.4 Positioning
- **Headline:** "From model to machine."
- **Thread:** systems that hold up outside the notebook.
  - The ML projects each deal with the world shifting under a model: calibration under a seasonal shift, drift-triggered retraining, and a reservoir agent tested on a drier climate.
  - The products respect the user's machine: VYRO measured 0.46% CPU with its window open (v0.2.0), and Baby keeps private turns on the PC behind a safety gate.
  - The Bosch years were about shipping reliably.
- **Tone:** first person, plain, specific and calm.
  - No hype words ("passionate", "cutting-edge", "revolutionary", "seamless").
  - Numbers over adjectives.

### 1.5 How the work was built (decided: say it plainly)
Tanishq builds his recent projects AI-native. He writes the spec, makes the architecture and product decisions, reviews every phase, and field-tests on real hardware. Claude Code writes much of the implementation.

The site says this plainly in three places:
- a "How I build" paragraph on About, plus principle 5 on Home (Appendix A);
- a short "How this was built" note on each case study where `aiNative: true` (Appendix A.4 gives the text);
- the footer line (A.13).

Two rules follow from this:
- Never present line counts, test counts or commit counts as Tanishq's personal output. They are properties of the project.
- Never claim code was hand-written.

`aiNative` defaults:
- **`true`, because the repos state it:** Baby, VYRO, Jainav platform, MLOps loop.
- **`true`, pending `{{CONFIRM_AI_NATIVE}}`:** Probabilistic forecasting, Reservoir RL, MenuMesh.
- **`false`:** Virtual Dressing Room, MyCounselHub, Bosch, GSoC.

---

## 2. Stack and key decisions

| Area | Decision | Notes |
|---|---|---|
| Runtime | Node.js 24 LTS, pnpm | Same as the Jainav Infotech repo |
| Framework | Next.js 16 (latest stable 16.x; the Jainav repo uses 16.3.x), App Router, React 19, TypeScript strict, `src/` directory | Next 16 renamed middleware to `proxy.ts`; only add it if needed. `pnpm lint` runs `eslint .` |
| Rendering | Static by default (SSG) | Only `/api/contact` is dynamic (plus `/api/ask` in optional Phase 9). Case studies use `generateStaticParams` |
| Content | Typed TS data in `content/`, validated with Zod at build time. Long-form case studies in MDX via `@next/mdx` + `remark-gfm` | No CMS |
| Styling | Tailwind CSS v4 + design tokens (§5) | Colours come only from tokens |
| Theme | `next-themes` with `attribute="data-theme"`, `defaultTheme="dark"`, `enableSystem={false}`; the choice is remembered | The hero stage stays dark in both themes |
| Animation | Motion (`motion/react`) for everything | Use GSAP only if Motion can't do a sequence, and record why |
| Smooth scroll | Lenis, on fine-pointer devices only, off under reduced motion | Lazy-loaded |
| Charts and diagrams | Hand-built SVG with `d3-scale`, `d3-shape` and `d3-array` | No chart library |
| Command palette | `cmdk` | Ctrl/⌘K |
| Icons | `lucide-react`; brand icons from `simple-icons` (SVG paths) | |
| Fonts | `next/font/google`: Plus Jakarta Sans (variable) and JetBrains Mono | Latin subset, `display: swap` |
| Images | `next/image`; source variants made by a `sharp` script | AVIF and WebP |
| Share images | `next/og` | |
| Resume PDF | `@react-pdf/renderer`, generated at build time | The same library the Jainav site uses for invoices |
| Contact | Route handler + Zod + honeypot + Cloudflare Turnstile + rate limit; email sent through Resend | In development, messages are written to `.outbox/` |
| Analytics | Vercel Web Analytics + Speed Insights (cookie-free) | No cookie banner needed |
| Hosting | Vercel, connected to Git; production domain `tanishq.website` | |
| Tests | Vitest; Playwright + `@axe-core/playwright`; Lighthouse CI (`@lhci/cli`) | |
| Colour tooling | `culori`, for contrast checks in the token build | |

**Pre-approved packages** (no need to ask):

| Group | Packages |
|---|---|
| Framework | `next`, `react`, `react-dom`, `typescript` |
| Styling and theme | `tailwindcss`, `@tailwindcss/postcss`, `next-themes`, `clsx`, `tailwind-merge`, `class-variance-authority` |
| Motion and UI | `motion`, `lenis`, `cmdk`, Radix primitives as needed (`radix-ui`), `lucide-react`, `simple-icons` |
| Content | `zod`, `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `remark-gfm` |
| Charts | `d3-scale`, `d3-shape`, `d3-array` and their `@types` |
| Images and PDF | `sharp`, `@react-pdf/renderer` |
| Contact and analytics | `resend`, `@marsidev/react-turnstile`, `@vercel/analytics`, `@vercel/speed-insights` |
| Tooling | `culori`, `tsx`, `eslint` with Next's config, `prettier`, `husky`, `lint-staged`, `ffmpeg-static` (video re-encoding in `scripts/images.ts`) |
| Testing | `vitest`, `@playwright/test`, `@axe-core/playwright`, `@lhci/cli` |

Phase 9 needs no package: call OpenRouter with plain `fetch`.

---

## 3. Working rules → copy into `CLAUDE.md` in Phase 0

**Process**
- Work one phase at a time (§19). At the end of a phase, run all checks, write the phase report, update `PROGRESS.md` and stop.
- Make small, focused commits. Follow the commit-message conventions in the global `~/.claude/CLAUDE.md`.
- Record every non-obvious choice in `docs/decisions.md`.
- The full spec is `PORTFOLIO_SPEC.md`. Re-read the relevant sections at the start of each phase.

**Content and honesty (the most important rules)**
- Copy comes from Appendix A.
- Numbers come from Appendix C (or Appendix B for charts), through `content/metrics.ts`. Components reference metrics by id and never hard-code a number.
- Every metric carries a source link and, where the source gives one, the version or setup it was measured on.
- Anything simulated or illustrative is labelled on screen as "Simulated", "Scripted demo" or "Illustrative". This covers the VYRO gauges, the Baby conversation, and the MenuMesh screens until real ones arrive.
- Never invent testimonials, client names, logos, metrics, dates or links.
- Never show anything on the "Don't claim" list (Appendix C.3).
- The only personal data on the site is the email address, the city and public profile links. Never the street address or the personal phone number.
- Never publish the VITON/Zalando dataset images, or photos of other people, from the Virtual Dressing Room repo.

**Code**
- TypeScript strict. No `any` without a comment explaining why.
- Validate every external input with Zod: the contact form and query parameters.
- Secrets live only in environment variables and server code (`import 'server-only'`).
- The content schemas are the single source of truth; the build fails on invalid content.

**Design**
- Colours are defined only in `src/styles/tokens.ts`. `pnpm tokens:build` generates `src/styles/tokens.css`; never edit the generated file.
- No hex or rgb literals, Tailwind palette classes (`bg-black`, `text-zinc-400`) or arbitrary colour values (`bg-[#123]`) in components. `pnpm check:tokens` enforces this. Product accents are tokens too.
- Fonts, radii, spacing, durations and easings also come from tokens.
- Every component works in the dark and light themes, from 360 px to 1920 px wide.

**Motion**
- Animate only `transform` and `opacity`. SVG `stroke-dashoffset` is allowed for line drawing.
- Nothing delays the LCP.
- Every animation has a reduced-motion version: the final state, with no movement.
- Pause animations off-screen and in hidden tabs.
- Split text by word with `Intl.Segmenter`, never by character. Hindi (Devanagari) text appears in the Baby demo, and character splits break it.

**Accessibility**
- WCAG 2.2 AA throughout:
  - semantic HTML, a skip link and alt text;
  - a visible focus ring in the accent colour;
  - full keyboard support, including every interactive chart;
  - `aria-live` for dynamic status.
- Every chart has a "View data" table alternative.

**Performance**
- Meet the budgets in §13.
- Lazy-load the centerpieces, Lenis, the command palette, and anything over 20 KB gzipped that isn't above the fold.

**Checks.** All of these must pass before a phase is done:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm check:tokens`
- `pnpm check:content`
- `pnpm build`
- the phase's end-to-end tests

---

## 4. Architecture

### 4.1 Repository layout (target)
```
portfolio/
├─ PORTFOLIO_SPEC.md  CLAUDE.md  PROGRESS.md
├─ docs/decisions.md
├─ assets/source/            # originals, not served (photo, icons, screenshots)
├─ content/
│  ├─ schema.ts              # Zod schemas
│  ├─ site.ts                # identity, links, nav, SEO defaults (A.1)
│  ├─ metrics.ts             # every number on the site, with sources (Appendix C)
│  ├─ projects.ts            # every project: cards, filters, meta (A.3)
│  ├─ case-studies/*.mdx     # long-form bodies (A.4)
│  ├─ experience.ts  open-source.ts  education.ts  certifications.ts
│  ├─ skills.ts  principles.ts  company.ts  now.ts  uses.ts  resume.ts
│  ├─ placeholders.ts        # allow-list of {{PLACEHOLDERS}} still pending
│  └─ data/*.json            # chart data (Appendix B)
├─ src/
│  ├─ app/                   # routes (§7)
│  ├─ components/{ui,layout,motion,viz,home,work,company,palette}/
│  ├─ lib/                   # utils, github releases, seo, formatting
│  └─ styles/{tokens.ts,tokens.css,globals.css,fonts.ts}
├─ public/                   # generated images, icons, favicon
├─ scripts/{tokens-build.ts,images.ts,check-tokens.ts,check-content.ts}
└─ tests/{unit,e2e}/
```

### 4.2 Content model (Zod, abbreviated)
```ts
Metric     = { id, value: string, label, source: url, measuredOn?: string, note?: string }
Project    = {
  slug, title, oneLiner, summary, period, role, status?: string,
  filters: ('ml'|'products'|'infra'|'client'|'archive')[],
  stack: string[], links: { repo?, live?, download?, writeup?, product? },
  metrics: MetricId[], readout?: MetricId,   // the bento/card readout
  featured: boolean, order: number, accent?: 'menumesh'|'vyro'|'baby',
  aiNative: boolean, caseStudy: boolean,
  cover: { kind: 'demo'|'image'|'schematic', src?: string }, tags: string[]
}
Experience = { org, role, period, location, summary, bullets: string[], link? }
Skill      = { name, group, projects: ProjectSlug[] }
Screen     = { file, project, view, capturedOn, build, size: [w, h], alt, use }   // assets/source/screens/manifest.json → screens[]
Video      = Screen & { poster, durationSec, fps, audio: false }                   // manifest.json → videos[]
```

`content/site.ts` also holds two launch flags, both `false` by default: `menumeshLive` (adds the public MenuMesh demo link) and `jainavLive` (turns on links to jainavinfotech.in).

### 4.3 Live values at build time
`lib/github.ts` fetches the latest releases at build time, with `revalidate: 86400`:
- VYRO from `nanu1605/vyro-releases`;
- Baby from `nanu1605/baby`.

It uses `GITHUB_TOKEN` if one is set. For VYRO it also reads the size of the `.msi` asset in that release, so the installer size stays correct when new versions ship. If a fetch fails, it falls back to the values in `content/metrics.ts` (VYRO 1.4.1 with an 11.6 MB installer; Baby 6.0.1). Show the version with a "latest release" label and a link. Never put installer files in this repo; downloads always go to the GitHub releases.

### 4.4 Redirects (`next.config.ts`)

| From | To |
|---|---|
| `/cv` | `/resume` |
| `/vyro` | `/work/vyro` |
| `/baby` | `/work/baby` |
| `/jainav` | `/company` |
| `/github` | `https://github.com/nanu1605` |
| `/linkedin` | `https://www.linkedin.com/in/tanishqjain010/` |
| `/Tanishq_Jain_Resume.pdf` | `/resume.pdf` (the old site's path) |

---

## 5. Design system — "Dark precision"

### 5.1 Principles
- Precise, quiet and dark, with one accent.
- Numbers look like instrument readouts.
- Generous whitespace and strong type.
- One signature moment per page.

### 5.2 Colour tokens
There are two themes: dark (the default) and light. `tokens:build` contrast-checks every text pair:
- body text: at least 4.5:1;
- text 24 px or larger, bold text 18.66 px or larger, and UI parts: at least 3:1.

| Token | Dark | Light | Use |
|---|---|---|---|
| `bg` | `#0A0A0B` | `#FAFAF9` | Page |
| `bg-raised` | `#111113` | `#FFFFFF` | Header, cards |
| `surface` | `#161618` | `#F4F4F5` | Tiles, inputs |
| `surface-2` | `#1C1C1F` | `#EBEBED` | Hover states, code |
| `border` | `#26262A` | `#E4E4E7` | Decorative hairlines only |
| `border-strong` | `#63636B` | `#8A8A93` | Form inputs and controls (≥ 3:1) |
| `fg` | `#EDEDEF` | `#0B0B0C` | Text |
| `fg-muted` | `#A1A1AA` | `#52525B` | Secondary text |
| `fg-subtle` | `#8A8A93` | `#6B6B74` | Captions, labels |
| `accent` | `#34D399` | `#047857` | Links, focus ring, signal line, highlights |
| `accent-strong` | `#6EE7B7` | `#065F46` | Hover |
| `accent-soft` | `#34D399` at 12% | `#047857` at 10% | Glows, selected states |
| `on-accent` | `#04130C` | `#FFFFFF` | Text on accent fills |
| `warn` | `#F5B942` | `#B45309` | Charts: supply; warnings |
| `hot` | `#FF5D5D` | `#B91C1C` | Charts: drift, alerts |
| `info` | `#60A5FA` | `#1D4ED8` | Charts: flood; neutral series |
| `menumesh` | `#FF6606` | `#FF6606` | MenuMesh only: fills and glows, never text on light |
| `vyro` | `#4CC9F0` | `#4CC9F0` | VYRO only: fills and glows, never text on light |
| `baby` | `#6EA8FE` | `#6EA8FE` | Baby only: fills and glows, never text on light |

- **Chart mapping:**
  - flood = `info`
  - supply = `warn`
  - ecology = `accent`
  - rule baseline = `fg` (star marker)
  - drift and alerts = `hot`
  - DeepAR = `accent`
  - ARIMA = `info`
  - ETS = `warn`
  - seasonal naive = `fg-subtle`
- **Hero stage:** the hero is always dark. Wrap it in a `data-theme="dark"` scope, so its tokens resolve to the dark values even in the light theme and the photo's black backdrop always blends in.
- The product accents match the Jainav Infotech site exactly.

### 5.3 Typography
- **Plus Jakarta Sans** (variable, 200–800) for display, headings, UI and body text. It is the same family as the Jainav site.
- **JetBrains Mono** (400, 500) for numbers, labels, code and readouts. Use `font-variant-numeric: tabular-nums` on metrics.

| Style | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| display | `clamp(3rem, 2rem + 6vw, 7.5rem)` | 700 | −0.04em | 0.95 |
| h1 | `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)` | 700 | −0.03em | 1.0 |
| h2 | `clamp(1.75rem, 1.2rem + 2vw, 2.75rem)` | 650 | −0.02em | 1.1 |
| h3 | `clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)` | 600 | −0.01em | 1.25 |
| body-lg | 1.1875rem | 400 | 0 | 1.6 |
| body | 1.0625rem | 400 | 0 | 1.65 |
| small | 0.875rem | 450 | 0 | 1.5 |
| mono-label | 0.75rem, uppercase | 500 | 0.08em | 1.4 |
| readout | `clamp(2rem, 1.5rem + 2vw, 3.25rem)`, mono | 500 | −0.02em | 1 |

Prose is at most 68ch wide.

### 5.4 Layout
- **Grid:** 12 columns.
- **Containers:** 1280 px, or 1440 px wide for the hero and the bento grid.
- **Gutters:** 16, 24 and 32 px at sm, md and lg.
- **Section spacing:** `clamp(5rem, 4rem + 6vw, 10rem)`.
- **Breakpoints:** 640, 768, 1024, 1280 and 1536 px.

### 5.5 Shape, depth and texture
- **Shape:** radii of 6, 10, 16 and 24 px, with 1 px hairline borders.
- **Depth:**
  - dark theme: no drop shadows; use borders and a faint inner highlight;
  - light theme: soft shadows.
- **Section labels:** set in mono, e.g. `01 — Selected work`.
- **Texture:**
  - faint 1 px grid lines (about 4% opacity) behind the hero and section headers;
  - static film grain (SVG noise, about 3% opacity) over the page background.
- **The signal line** is the site's motif. It is a thin emerald SVG path, noisy on the left and resolving into a clean wave on the right. It appears in the hero, share images, the 404 page and section dividers.

### 5.6 Brand marks
- **Wordmark:** "Tanishq Jain" in Plus Jakarta Sans 700.
- **Monogram:** "TJ" in a rounded square, emerald on near-black. Use it for the favicon and share images.
- Generate an SVG favicon, PNGs at 32, 180, 192 and 512 px, and `manifest.ts`.

### 5.7 Components (Phase 2)

| Group | Components |
|---|---|
| Basics | Button (primary, secondary and ghost, plus a magnetic variant); TextLink (underline grows from the left); Tag/Chip |
| Status and data | StatusBadge (Live, Beta, Free, Open source, In launch prep, Archived); Readout (mono number + label + source link); MetricTable; DataTable (the alternative to a chart) |
| Cards and sections | Card (with cursor spotlight); BentoTile; SectionHeader (index label, title, intro); Timeline; Figure (image or SVG + caption + source link) |
| Overlays | Tabs; Tooltip; Dialog; CommandPalette |
| Notes and actions | Disclosure note ("How this was built"); Callout; StatusPill ("Now · …"); ThemeToggle; CopyButton ("Copy email" → "Copied") |
| Page chrome | Header; MobileMenu; Footer; ReadingProgress; TOC |

---

## 6. Motion and interaction

### 6.1 Tokens
- **Easing:** ease-out `cubic-bezier(0.16, 1, 0.3, 1)`; ease-in-out `cubic-bezier(0.65, 0, 0.35, 1)`.
- **Durations:** fast 150 ms, base 250 ms, slow 600 ms, reveal 700 ms.
- **Stagger:** 75 ms.

These are the same curves the Jainav site uses, so the two sites feel related.

### 6.2 Everywhere
- **Scroll reveal:** fade plus a 16 px rise, once, with a 75 ms stagger.
- **Headline reveal:** word-by-word mask, split with `Intl.Segmenter`.
- **Count-up:** proof-strip numbers count up once when they come into view (900 ms).
  - The final value is in the HTML.
  - Under reduced motion there is no count.
- **Smooth scroll:** Lenis, on fine pointers only and off under reduced motion. Anchor links allow for the sticky header.
- **Header:** hides on scroll down and returns on scroll up, with a backdrop blur. Case studies show a 2 px reading-progress bar.
- **Cards:** a cursor spotlight (a radial gradient that follows the pointer). Bento tiles alone also tilt, by at most 4°. Fine pointers only.
- **Buttons:** primary CTAs pull magnetically by at most 6 px. Fine pointers only.
- **Page transitions:**
  - If the installed Next.js supports the View Transitions API stably, use it, and record the choice.
  - Otherwise, fade `<main>` over 200 ms.
  - If feasible, morph a project's cover from `/work` into its case-study hero as a shared element.

### 6.3 Signature moments (one per page)

| Page | Moment |
|---|---|
| Home | The hero:<br>• The photo rises out of black (opacity 0→1, scale 1.03→1, ≤ 600 ms, starting immediately) and the headline words reveal.<br>• The emerald signal line draws underneath. It starts noisy on the left, resolves into a clean wave on the right, then idles with a slow drift.<br>• Moving the pointer shifts a soft emerald glow.<br>• All of it pauses off-screen. |
| Work | Changing the filter animates the grid (layout animation). |
| Case studies | The interactive centerpiece (§10). |
| Company | The three product cards lift in, each with its own accent glow. |
| About | The timeline line draws as you scroll. |
| Open source | A dot timeline of the 16 merged PRs fills in by date. |
| 404 | A VYRO-style gauge needle drops to zero: "Sensor not found." |

### 6.4 Command palette (Ctrl/⌘K, plus a header button)
- **Actions:**
  - go to any page or project (fuzzy search over titles and tags);
  - copy the email address;
  - download the resume;
  - toggle the theme;
  - open GitHub, LinkedIn or Medium.
- Fully keyboard operable, and results are announced to screen readers.

### 6.5 Small delights (Phase 7)
- Typing "hey jarvis" anywhere outside a form field shows a toast with the Baby orb (copy in A.13).
- A console greeting for curious engineers (A.13).

---

## 7. Routes

| Route | Page | Notes |
|---|---|---|
| `/` | Home | §8.2 |
| `/work` | All work | Filter with `?filter=ml\|products\|infra\|client\|archive` |
| `/work/[slug]` | Case study | Slugs: `baby`, `vyro`, `jainav-platform`, `menumesh`, `reservoir-rl`, `probabilistic-forecasting`, `mlops-drift-loop`, `virtual-dressing-room`, `mycounselhub` |
| `/company` | Jainav Infotech | §8.5 |
| `/about` | About | §8.6 |
| `/open-source` | Open source | §8.7 |
| `/now` | Now | Shows "Last updated" |
| `/uses` | Uses | |
| `/resume` | Web resume | §8.10 |
| `/resume.pdf` | Resume PDF | Generated at build time |
| `/contact` | Contact | §8.11 |
| `/privacy` | Privacy note | |
| `/api/contact` | POST endpoint | Dynamic |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | | Generated |
| Share images | `opengraph-image.tsx` per route segment | §11 |
| 404 | `not-found.tsx` | |
| `/styleguide` | Development only | Not built in production |

---

## 8. Page specifications
All copy is in Appendix A.

### 8.1 Global layout
- **Header:**
  - wordmark on the left;
  - nav: Work, Company, About, Open source, Now;
  - on the right: a ⌘K button, the theme toggle and a "Resume" ghost button.
  - On mobile, a menu button opens a full-screen menu with staggered links and the contact line.
- **Footer:**
  - one-line bio, nav and social links;
  - "Copy email";
  - the footer note (A.13);
  - the last-updated date (the build date);
  - a link to `/privacy`.
- A skip link, and focus traps in menus and dialogs.

### 8.2 Home (in this order)
1. **Hero** (the stage is always dark):
   - eyebrow, headline, subline and status pill;
   - three CTAs:
     - See my work → `#work`
     - Get in touch → `/contact`
     - Resume → `/resume`
   - the photo sits on the right on desktop, and below the text on mobile;
   - the signal line.
2. **Proof strip:** five readouts (A.2), each linking to its source.
3. **01 — Selected work** (`#work`): a bento grid of six tiles (Baby and VYRO large), plus "All work →".
4. **02 — Company:** a full-width band with three product cards in their accents, the services line and CTAs.
5. **03 — Experience:** a compact timeline of five entries.
6. **04 — Open source:** PEcAn and LitmusChaos cards, plus a link to `/open-source`.
7. **05 — How I work:** five principles, each with an evidence link.
8. **06 — Stack:** skills in groups. Hovering or focusing a skill highlights the project chips that used it, and vice versa.
9. **07 — Education:** a degree card and a row of certifications.
10. **08 — Contact:** a closing CTA.

### 8.3 Work index
- A title and intro.
- Filter chips: All · ML · Products · Infrastructure · Client work · Archive. They stay in sync with `?filter=`.
- Cards, each with a cover, title, one-liner, period, stack chips and status badge.
- The archive comes last, as a compact list.

### 8.4 Case-study template
1. **Hero:**
   - title and one-liner;
   - a meta row: Role · Timeline · Status · Platform;
   - stack chips;
   - links: Source, Download, Live, Write-up.
2. **TL;DR:** three cards: Problem · What I built · Result.
3. **Centerpiece** (§10), lazy-loaded behind a static poster.
4. **Body sections** from the MDX (A.4), with figures and tables.
5. **"Limitations and what's next"** — always present.
6. **"How this was built"** note, when `aiNative` is true.
7. **Navigation:** previous and next project; back to Work.

On desktop: a sticky TOC on the left, and the reading-progress bar in the header.

### 8.5 Company
Copy in A.7. The section order is:
1. hero
2. principles
3. three product cards
4. services
5. "the platform" link
6. CTAs

### 8.6 About
Copy in A.8. It has a photo (the 4:5 crop), the story, "How I build", a timeline, education, certifications and languages.

### 8.7 Open source
Copy in A.6. It has:
- PEcAn, with its pull requests grouped by theme;
- LitmusChaos;
- the GSoC report link;
- the dot timeline.

### 8.8 Now
Copy in A.9, with a visible "Last updated" date.

### 8.9 Uses
Copy in A.10.

### 8.10 Resume
- **Web:** the same data as the site, in a single column, with a print stylesheet.
- **PDF (`/resume.pdf`):** generated at build time by `@react-pdf/renderer` from `content/resume.ts` and the shared content.
  - Layout: A4, at most 2 pages, single column.
  - Text is real and selectable, with embedded fonts.
  - Header: name, email, website, LinkedIn, GitHub and "Indore, India". No street address, no phone number.
  - Section order:
    1. Summary
    2. Experience
    3. Selected projects
    4. Open source
    5. Education
    6. Skills
    7. Certifications
- This is the general-purpose resume. Tanishq's separately formatted MS-application resume stays outside the site.

### 8.11 Contact
Copy in A.12.

**Form fields:**
- Name
- Email
- What's this about? (a select)
- Message (at most 4,000 characters)
- a hidden honeypot
- Turnstile

**Server:**
- Validate with Zod and verify the Turnstile token.
- Rate-limit to 5 messages per 10 minutes per IP. The limit is in-memory, so record that it applies per instance.
- Send through Resend to `CONTACT_TO_EMAIL`, with `reply-to` set to the sender. The email body is plain text, with everything escaped.
- Without Resend environment variables:
  - in development, write the message to `.outbox/`;
  - in production, show a mailto fallback.
- Announce success and error states through `aria-live`.

### 8.12 Privacy and 404
Copy in A.13.

---

## 9. Copy
All text is in Appendix A. The voice is first person, plain and specific.

---

## 10. Interactive centerpieces and micro-demos

**Rules for every centerpiece**
- Lazy-load it when it is within 200 px of the viewport, and render a static poster first so there is no layout shift.
- Keyboard operable.
- A "View data" toggle shows the underlying table.
- Reduced motion shows the final state.
- Simulated or scripted content is labelled.
- It pauses when off-screen or when the tab is hidden.
- Each lazy chunk is at most about 60 KB gzipped.

### 10.1 Baby — "Follow a turn"
- **Layout:**
  - scenario chips on top;
  - an SVG pipeline graph in the middle: `Wake word → VAD → Speech-to-text → Router → [Cloud brain | Local 9B] → Tools → Safety gate → Voice`;
  - a transcript below.
  - The router node lists the routing ladder and highlights the rule that fired. The gate node shows ALLOW, CONFIRM or DENY.
- **Animation:** a pulse travels the real path for each scenario, at about 2.5 s per scenario, and the transcript types in.
- **Label:** "Scripted demo — not a live assistant." Replies are illustrative.

| Scenario | Utterance | Route | Gate | Reply (shown) |
|---|---|---|---|---|
| Hinglish | "CPU ka temperature kitna hai?" | Normal turn → cloud primary | `get_sensors`: ALLOW | "CPU abhi 48°C par hai." (illustrative value) |
| Privacy pin | "Read notes.txt on my desktop and summarise it." | `read_file` runs; the privacy pin keeps the rest of the turn on the local 9B, and the file content is redacted from anything sent to the cloud | ALLOW | "Here's the gist: …" (illustrative) |
| Hindi (Devanagari) | "मेरा डाउनलोड फ़ोल्डर खोलो" | Devanagari pin → local 9B | `app_control`: ALLOW | "डाउनलोड फ़ोल्डर खोल दिया।" |
| Destructive | "Delete everything in my Downloads folder." | Normal turn → cloud primary | `run_shell`: CONFIRM. Baby says "Check the screen"; it never confirms by voice. No answer within 60 s means no | "Okay — I didn't delete anything." |

**Router ladder** (this is the order to show):
1. Privacy pin → local
2. Game mode → cloud
3. Devanagari → local
4. Offline → local
5. Degraded → Gemini, then local
6. Orchestrator "best brain" → heavy, then primary, then local
7. Internal capped calls → local
8. Planning → heavy, then primary, then local
9. Normal turn → primary, then Gemini, then local

### 10.2 VYRO — "Gauge panel" (VYRO accent)
- **Gauges:** two speedometers (CPU and GPU) in VYRO's style.
  - Each is a 270° dial showing a big number plus the clock in MHz.
  - Beside them: a temperature sparkline and a fan RPM readout.
  - Values come from a smooth random walk. They ease toward each new value with a 0.22 s time constant on one animation loop that stops when the values settle, capped at 60 fps.
  - Label: "Simulated values — VYRO reads the real ones."
- **Footprint card:** real numbers from metrics (`vyro.cpu`, `vyro.ram`, `vyro.startup`, `vyro.installer`), with the version they were measured on.
- **Optional "What your browser can see" button.** On click only, it shows:
  - `navigator.hardwareConcurrency`;
  - `navigator.deviceMemory` (Chromium; the browser caps it);
  - screen size and device pixel ratio;
  - "VYRO also sees temperatures, fan speeds, voltages and clocks."

  Show the copy "Computed in your browser; nothing is sent."

### 10.3 Jainav platform — "From order to licence" + build timeline
- **A 7-step stepper** (Appendix B, `jainav_platform.order_to_licence`), operated with the arrow keys. Each step has a one-line explanation and a small diagram, e.g. the token: `header.payload.signature (EdDSA)`.
- **Build timeline:** phases 0–9, with phase 10 (store go-live) marked "next". Text: "Built 15–18 October 2026 from a ~1,000-line spec."

### 10.4 MenuMesh — "Table to bill" (MenuMesh accent)
- **Phone story:** a sticky phone frame on desktop, with four scroll-linked steps: Scan → Order (an English/हिंदी toggle on the menu) → Cook and serve (the kitchen board) → Bill and pay (a bill with GST).
- **Mobile:** a swipeable stepper.
- **Screens:** use the captured demo panels from `assets/source/screens/menumesh/` (§15.2). If the capture step failed, build them in HTML/CSS and label them "Illustrative".

### 10.5 Reservoir RL — "Weight mixer"
- **Ternary triangle picker:** the corners are Flood, Supply and Ecology.
  - The 8 trained agents (Appendix B, `pareto_agents`) are plotted at their weights.
  - Dragging the cursor (or using the arrow keys) highlights the nearest agent, by Euclidean distance in weight space. A select list offers the same choice.
- **Linked panels:**
  - two scatter plots, Flood vs Supply and Supply vs Ecology. Each shows all agents, the rule baseline as a star, and the selected agent highlighted;
  - a three-bar comparison of the selected agent against the rule.
- **"Drier climate" toggle:** shows `balanced_headline_seed42` nominal vs shifted bars.
- **Footnote:** "Each point is one training run (one seed). Two runs with the same balanced weights landed at different points — see Limitations."

### 10.6 Probabilistic forecasting — "Calibration explorer"
- **Reliability diagram:**
  - x is nominal coverage and y is observed coverage, at the 9 levels from 0.1 to 0.9, against a diagonal;
  - the region below the diagonal is shaded and labelled "Overconfident";
  - lines: seasonal naive, ARIMA, ETS and DeepAR;
  - the DeepAR seed selector offers 42, 123, 456, 789, 1337 and "mean of 5". The mean is computed point-wise and labelled "computed".
- **Metric cards** update with the selection: CRPS, RMSE, 90% coverage and ECE (Appendix B).
- **Horizon bars:** ECE at 1, 6, 12 and 24 hours (best seed), animated as they grow.
- **"Recalibration" tab:** before/after metrics from the same run (`recalibration_same_run`), plus the oracle annotation.
  - Never compare the one-seed recalibrated row with the 5-seed mean.
- **Definition note:** "ECE here is the average gap between nominal and observed interval coverage across nine levels."

### 10.7 MLOps loop — "Watch it recover"
- **Data export (Phase 5):**
  - Clone `github.com/nanu1605/mlops-drift-retrain` into a scratch folder (outside the portfolio repo). Its default branch is `master`.
  - Add one line to `src/mlops_drift/experiments/run.py`, after the timeline is built, that writes `timeline` (a list of `{t, f1, version}`) to `timeline.json`.
  - Run `make experiment` with `uv`, as the repo's README describes. The repo says the curve is deterministic.
  - Copy the JSON to `content/data/mlops-timeline.json` with a provenance note: the commit, the command and the date.
  - If it can't run, use the committed `docs/images/drift_recovery.png` (converted to WebP) and the two documented levels only. Never draw intermediate points by hand.
- **Chart:** realized F1 per batch, with markers for "Drift detected" and "Challenger promoted".
  - On desktop the reveal is scroll-scrubbed, with a sticky chart.
  - Beside it, a loop diagram (Serve → Monitor → Detect → Retrain → Gate → Reload). Each node lights up as the line passes the matching event.

### 10.8 Virtual Dressing Room — pipeline strip
- **Six stages:**
  1. crop to 192×256
  2. 18 pose keypoints
  3. 20-class body parsing
  4. clothing-agnostic person
  5. garment warp (GMM)
  6. try-on render (TOM)
- **Visuals:** schematic icons until `{{VDR_IMAGES}}` arrive. Those must be Tanishq's own photo run through the pipeline. Never dataset images.

### 10.9 MyCounselHub — automation flow
An animated sequence: Payment succeeds → Google Meet link created → Calendar events for client and counsellor → Invoice → Reminder 30 minutes before the session.

### 10.10 Home bento micro-demos
These are light CSS/SVG demos. They animate on hover (desktop) or once in view (touch). Under reduced motion they are static.

| Tile | Demo |
|---|---|
| Baby | A voice orb breathing, with waveform bars (static poster: a crop of `baby-brain-idle`) |
| VYRO | A gauge needle sweeping to a readout (static poster: a crop of `vyro-dashboard`) |
| Reservoir RL | Eight dots plus a star; the "balanced" dot pulses |
| Forecasting | The best-seed calibration curve draws below the diagonal |
| MLOps loop | A schematic step from 0.27 up to 0.78. It shows only those two documented levels, labelled |
| Jainav platform | Stepper dots cycling Order → Payment → Invoice → Licence |

---

## 11. SEO and structured data
- **Metadata:** per-page titles and descriptions (A.1); a canonical URL on `https://tanishq.website`; the Twitter card `summary_large_image`.
- **Share images** (`next/og`), using tokens:
  - background `bg`, with the name, the page title, the signal line and the TJ monogram;
  - product case studies use their own accent for the line.
- **JSON-LD:**
  - **`Person` (site-wide):**
    - name "Tanishq Jain", url, image (the photo) and jobTitle "ML & Systems Engineer";
    - address: Indore, Madhya Pradesh, IN;
    - alumniOf: Bangalore Institute of Technology;
    - sameAs: GitHub, LinkedIn, Medium;
    - knowsAbout: machine learning, MLOps, reinforcement learning, time-series forecasting, DevOps, Rust, TypeScript.
  - **`Organization`** for Jainav Infotech Private Limited, with `founder` → Person.
  - **`WebSite`.**
  - **`BreadcrumbList`** on inner pages.
  - **`SoftwareSourceCode`** for case studies with a repo.
  - **`SoftwareApplication`** for VYRO and Baby: operatingSystem Windows, with an `offers` price of 0 INR while they are free.
- **Crawling:** `sitemap.ts` and `robots.ts`, allowing everything except `/api`.
- **Search Console:** verified by a DNS TXT record (`{{GSC_TXT}}`); submit the sitemap at launch.

---

## 12. Analytics
- **Vercel Web Analytics:** cookie-free page views.
- **Custom events:**
  - `resume_download`
  - `contact_submit` (success or error)
  - `palette_open`
  - `theme_toggle`
  - `outbound_click`, with `{target: repo|live|download|company|social}`
  - `centerpiece_interact`, with `{slug}`
- **Speed Insights** for real-user Core Web Vitals.

---

## 13. Performance and accessibility budgets
- **Lighthouse (mobile, production):**

  | Category | Home | Case studies |
  |---|---|---|
  | Performance | ≥ 95 | ≥ 90 |
  | Accessibility | 100 | 100 |
  | Best Practices | ≥ 95 | ≥ 95 |
  | SEO | 100 | 100 |

- **Core Web Vitals:**
  - LCP < 2.0 s on Home and < 2.5 s elsewhere;
  - INP < 200 ms;
  - CLS < 0.05.
- **JavaScript:**
  - Home's initial JS is ≤ 150 KB gzipped;
  - each lazy centerpiece is ≤ 60 KB gzipped.
- **Images:**
  - AVIF/WebP, responsive, with blur placeholders;
  - the hero photo is `priority`, and at most about 200 KB at 1× desktop width.
- **Fonts:** two families, Latin subset, `display: swap`; preload the display weight.
- **Accessibility:**
  - WCAG 2.2 AA;
  - every chart has a data table;
  - sliders and pickers are operable with the arrow keys;
  - colour is never the only way information is carried;
  - focus is visible everywhere;
  - the contact status is announced.

---

## 14. Privacy and security
- **Personal data:**
  - the site shows the email address only;
  - contact messages are emailed through Resend and not stored;
  - no cookies, no ad trackers;
  - Turnstile runs only on `/contact`.
- **Headers (static):**
  - CSP: `default-src 'self'`; scripts from `'self' 'unsafe-inline'` plus the Turnstile and Vercel Analytics origins those services document; `frame-src` for Turnstile; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`;
  - HSTS;
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **Contact endpoint:**
  - Zod validation and the honeypot;
  - server-side Turnstile verification;
  - rate limiting;
  - a body-size limit;
  - plain-text email.
- **Dependencies:** `pnpm audit` in CI, plus Dependabot.

---

## 15. Assets

**Profile photo.** The source is `assets/source/tanishq-jain.jpg`: a 2125×2576 studio portrait on a near-black backdrop. `scripts/images.ts` (sharp) generates:
- **Hero:** AVIF and WebP at 640, 960, 1280 and 1600 px wide. A CSS radial/linear mask fades the edges into `bg`; no background removal is needed.
- **About:** a 4:5 crop at 800 and 1200 px.
- **Share images:** a square crop at 600 px.

**Product icons.** Copy them from the public repos into `assets/source/`, and record each source and licence in `docs/decisions.md`:
- **VYRO:** `nanu1605/vyro` (branch `main`), `src-tauri/icons/icon.svg`. It is a gauge arc fading from cyan `#4CC9F0` to green `#7EE787`.
- **Baby:** `nanu1605/baby` (branch `master`), `ui/shell/src-tauri/icons/icon.png` (512×512).
- **MenuMesh:** the capture script saves the logo from the MenuMesh site header (§15.2). If it can't, use a typographic placeholder.
- **Jainav Infotech:** there are no logo files yet. Use the same typographic "J" square as the Jainav site.

**Chart figures.** Redraw them as themed SVG from Appendix B. Fallback PNGs are in the public repos:
- `reservoir-rl/docs/images/{pareto_frontier,learning_curve,shift_degradation}.png`
- `probabilistic-forecasting/docs/images/{calibration_per_horizon,calibration_comparison,deepar_forecasts,architecture}.png`
- `mlops-drift-retrain/docs/images/{drift_recovery,architecture}.png`

**Screenshots.** All product screens live in `assets/source/screens/<project>/`, described in `assets/source/screens/manifest.json`. `scripts/images.ts` converts them to AVIF/WebP at 1280, 1920 and 2560 px wide (never upscale), with blur placeholders. Show app screenshots in a simple window frame (rounded corners, hairline border, the product's accent glow), never inside fake device chrome that misstates the platform.

### 15.1 Delivered screens: VYRO and Baby
Captured on Tanishq's PC on 20 October 2026, cropped to the app window (title bar removed). They are delivered with this spec.
- **VYRO:** a 1.7.0 development build; the latest public release is 1.4.1. When 1.7.0 is published, change the captions to "VYRO 1.7". The sidebar shows a "GPU tuning" view that isn't in a public release yet, so don't describe it as a feature. Display: 4K for the first four files below, 2560×1440 for the rest.
- **Baby:** the installed build, in cloud mode with game mode on (the local 9B unloaded). The chat is a demo: an English question that calls `get_system_stats`, then a Hinglish follow-up.

| File | Shows | Suggested use |
|---|---|---|
| `vyro/vyro-dashboard.png` | Dashboard: CPU and GPU speedometers, live tiles, 16-thread bars | VYRO case-study hero; Home bento poster |
| `vyro/vyro-health.png` | Health: subsystem checks, diagnostics, alert rules | Case study, "On top of the readings" |
| `vyro/vyro-gaming.png` | Game profiles and recorded sessions (cs2, Rocket League) | Case study, gaming |
| `vyro/vyro-cooling.png` | Fan control per header, BIOS/fixed/curve, safety limits | Case study, safety |
| `vyro/vyro-game-replay.png` | A 44-minute cs2 session replay: frame rate, frame time, usage, temperatures | Case study, gaming |
| `vyro/vyro-my-pc-3d.png` | My PC: 3-D thermal map with airflow lines | Case study, architecture; company card |
| `vyro/vyro-sensors.png` | Sensor table with value, min, max, average and source | Case study, "What it shows" |
| `vyro/vyro-settings-appearance.png` | Themes, accent colour wheel, profiles, overlay preview | Case study, themes |
| `baby/baby-brain-idle.png` | "The Brain": the live 3-D graph, idle | Baby case-study hero; Home bento poster |
| `baby/baby-turn-thinking.png` | The graph lit up mid-turn while a reply streams | Case study, "How a turn flows" |
| `baby/baby-turn-hinglish.png` | Chat: English tool turn, then a Hinglish question and reply | Case study, languages |
| `baby/baby-turn-english.png` | Chat after the English tool turn only | Spare. Its reply includes a model quirk ("System Idle Process 1129%"); prefer the Hinglish shot |
| `baby/baby-activity.png` | Activity feed: the `get_system_stats` call and its JSON result | Case study, "A gate, not a guess" |
| `baby/baby-inspector.png` | Click-to-inspect panel for the core node | Case study, "More than a chatbot" |

Alt text: describe what's on screen, e.g. "VYRO's dashboard showing CPU at 47% and 5,123 MHz and GPU at 46% on animated gauges." The manifest has a draft alt line for each file.

**Videos** (recorded with Xbox Game Bar's window capture on 20 Oct 2026, so no other windows appear; muted H.264, 30 fps, each with a PNG poster):

| File | Shows | Length | Size | Suggested use |
|---|---|---|---|---|
| `vyro/vyro-dashboard.mp4` | The dashboard updating live: gauges, thread bars, sparklines | 12 s | 0.3 MB | VYRO case-study hero |
| `vyro/vyro-my-pc-3d.mp4` | The 3-D My PC model turned by hand, with airflow moving | 10 s | 1.3 MB | Architecture section. Not a seamless loop, so play it once and pause on the last frame, or cross-fade |
| `baby/baby-turn-hinglish.mp4` | "Mera GPU kitna busy hai abhi?" asked, then answered in Hinglish while the graph turns | 16 s | 1.1 MB | Baby case-study hero |

Playback rules:
- Use `<video muted playsinline loop preload="none" poster=…>` and start playing only when the video is in view; pause it off-screen and in hidden tabs.
- With reduced motion, show the poster with a play button instead of autoplaying.
- Never autoplay more than one video at a time on a page.
- Generate WebM (VP9) versions alongside the MP4s in `scripts/images.ts` (ffmpeg via `ffmpeg-static`; add it to the pre-approved packages). Keep the MP4 as the fallback.

### 15.2 Capture scripts: MenuMesh and the Jainav site
These run on Tanishq's machine (normal internet access) with Playwright Chromium (`pnpm exec playwright install chromium`; add `--with-deps` on a fresh WSL install). Put them in `scripts/capture/`. They write PNGs to `assets/source/screens/<project>/` and update `manifest.json`. Re-run them whenever the products change.

**Rules for both scripts**
- Read-only:
  - never sign up, log in or submit a form;
  - never press "Start free trial", "Book a demo" or "Contact";
  - the only clicks are on the demo controls and navigation.
- Wait for network idle and for fonts (`document.fonts.ready`) before each shot. Hide scrollbars, and if there's a cookie or announcement bar, close it.
- Desktop shots: 1440×900 viewport at `deviceScaleFactor: 2`. Phone shots: 390×844 at `deviceScaleFactor: 3`, with `isMobile` and `hasTouch` on.
- Prefer element screenshots of a meaningful region over full pages. Find elements by role and visible text, not brittle CSS.
- If a step fails, log it and continue. The case studies fall back to "Illustrative" HTML screens for anything missing.

**`menumesh.ts`** (base URL from `MENUMESH_BASE_URL`; default `https://staging.menumesh.in`, switch to `https://menumesh.in` at launch)
1. Home: the hero at desktop size; the "How it works" section (`#how`); the "Your menu, in your guests' language" English/हिन्दी comparison.
2. `/pricing`: the plan cards at desktop size.
3. `/hi`: the Hindi home hero at phone size.
4. `/demo` holds three panels, labelled "Guest phone", "Kitchen tablet" and "Counter laptop". Take element screenshots of each panel at each step:
   1. the start state;
   2. after adding Paneer Tikka and two Butter Naan, and placing the order (or use the page's "Show me" button, which walks through the steps);
   3. the kitchen showing the dishes as preparing, then ready;
   4. each dish served;
   5. the counter laptop after "Make bill".

   Finish with "Start again".
5. Record one video of the `/demo` flow with "Show me", 15–25 s, using Playwright `recordVideo` at 1280×800. Convert it with ffmpeg to a muted H.264 MP4 of 3 MB or less, plus a WebP poster frame.
6. Save the MenuMesh logo from the site header: an inline SVG as `.svg`, otherwise the image file. Record its source in `docs/decisions.md`.

**`jainav.ts`** (runs the company site from its repo)
1. Clone `https://github.com/nanu1605/jainav-infotech` into a scratch folder outside this repo. Start it in development by following that repo's own docs: its Postgres compose file, `.env` from `.env.example` with development values, install, migrate, seed, then the dev server. Never use real keys.
2. Capture at desktop size, in the dark and light themes:
   - `/` (the hero and product cards)
   - `/products`
   - `/products/vyro` (including the Free/Pro block)
   - `/products/menumesh`
   - `/products/baby`
   - `/services`
3. Capture `/hi` (the Hindi home page) at phone size.
4. Stop the dev server and the database container when done. Don't commit the clone.
5. If the site won't start within about 20 minutes of trying, stop and record why. The case study then uses the platform diagrams only.

**New recordings of VYRO and Baby** (if the apps change): record the window with Xbox Game Bar (Win+Alt+R while the app is focused; it saves to `Videos\Captures`). Trim and encode them like §15.1: muted, 30 fps, 1.5 MB or less, with a poster.

---

## 16. Deployment and domain
1. **Repo:** `{{REPO}}`; the default is `github.com/nanu1605/portfolio`, public.
2. **Vercel project:**
   - Git-connected, with production branch `main`;
   - preview deployments for every PR;
   - Node 24.
3. **Domain:**
   - Add `tanishq.website` and `www.tanishq.website` in Vercel.
   - At the registrar (`{{REGISTRAR}}`), set exactly the records Vercel shows.
   - The canonical host is the apex `https://tanishq.website`; `www` redirects to it with a 308.
4. **Email sending:**
   - Verify `tanishq.website` in Resend (the SPF and DKIM records it shows).
   - From: `Tanishq Jain <contact@tanishq.website>`. To: `tanishqjain010@gmail.com`.
5. **Old temporary site** (`tanishq-jain-portfolio.vercel.app`, repo `nanu1605/my-portfolio`): redirect everything to `https://tanishq.website/`, and `/Tanishq_Jain_Resume.pdf` to `https://tanishq.website/resume.pdf`. Do whichever of these the Vercel dashboard allows, and record the choice:
   - (a) commit a `vercel.json` with permanent redirects to the old repo, or
   - (b) redirect the old project's domain in its Domains settings.
6. **CI (GitHub Actions)** on every PR:
   - install, lint, typecheck, unit tests, `check:tokens`, `check:content`, build;
   - Playwright against `next start`;
   - Lighthouse CI with the §13 budgets.

---

## 17. Testing
- **Unit:**
  - content schemas: every project and metric is valid, slugs are unique, every metric has a source;
  - the placeholder report;
  - the nearest-agent function for the weight mixer;
  - the point-wise mean of the calibration curves;
  - formatters;
  - contact validation.
- **End-to-end (Playwright + axe):**
  - every route renders with no axe violations, in both themes;
  - navigation, the mobile menu and the command palette (keyboard only);
  - the theme persists without a flash;
  - reduced-motion emulation shows final states;
  - the contact form: success with Turnstile test keys and the dev outbox, plus validation errors;
  - `/resume.pdf` downloads with `application/pdf`;
  - the 404 page.
- **Visual:** screenshots of Home, `/work` and one case study at 375, 768 and 1440 px in both themes, kept as CI artifacts.
- **Lighthouse CI:** the §13 budgets.

---

## 18. Environment variables

| Variable | Scope | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | all | yes | `https://tanishq.website` (previews use the Vercel URL) |
| `CONTACT_TO_EMAIL` | server | yes | `tanishqjain010@gmail.com` |
| `CONTACT_FROM_EMAIL` | server | yes, for the live form | `Tanishq Jain <contact@tanishq.website>` |
| `RESEND_API_KEY` | server | yes, for the live form | |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client | yes, for the live form | Turnstile test keys in development |
| `TURNSTILE_SECRET_KEY` | server | yes, for the live form | |
| `GITHUB_TOKEN` | build | optional | Raises the API limit for release lookups |
| `OPENROUTER_API_KEY` | server | Phase 9 only | |
| `ASK_DAILY_BUDGET_USD` | server | Phase 9 only | A hard daily cap |

---

## 19. Phases

| Phase | Outcome |
|---|---|
| 0 | Project skeleton and guardrails |
| 1 | Content layer: all copy, data, metrics and assets |
| 2 | Design system and motion primitives |
| 3 | Global layout and Home |
| 4 | Work index and 9 case studies (content and figures) |
| 5 | Interactive centerpieces and Home micro-demos |
| 6 | Company, About, Open source, Now, Uses, Resume (+ PDF), Contact, Privacy, 404 |
| 7 | Polish: page transitions, command palette, delights, share images, SEO |
| 8 | **Launch on tanishq.website** |
| 9 | *(Optional)* "Ask about me" assistant |
| 10 | *(Optional)* Writing / blog |
| Anytime | Re-run the capture scripts after product changes; swap in new recordings if the apps change |

Copy each phase's tasks into `PROGRESS.md`. Placeholders are fine unless an input is marked **required**.

### Phase 0 — Setup and guardrails
- [ ] Scaffold Next.js 16 non-interactively (check `pnpm create next-app --help` for the installed flags) with TypeScript, the App Router, `src/`, Tailwind v4, ESLint and pnpm. Node 24.
- [ ] Set up Prettier, Husky + lint-staged, and `.editorconfig`.
- [ ] Build the token pipeline:
  - `src/styles/tokens.ts` → `pnpm tokens:build` → `tokens.css`, with `culori` contrast checks that fail the build if a pair falls below §5.2;
  - `globals.css` with `@theme inline` mapping;
  - `next-themes` (`data-theme`, dark default) with no flash.
- [ ] Load the fonts through `src/styles/fonts.ts`.
- [ ] Add the `check:tokens` script, and a `check:content` stub.
- [ ] Set up Vitest, Playwright + axe, and GitHub Actions CI.
- [ ] Write `CLAUDE.md` (§3), `PROGRESS.md` and `docs/decisions.md`.

**Done when:**
- `/` renders a placeholder, and the theme toggle works without a flash;
- a hex colour in a component fails `check:tokens`;
- CI is green;
- the Vercel preview URL works.

**Inputs:** the repo name and visibility (default `nanu1605/portfolio`, public); Tanishq connects the repo to Vercel.

### Phase 1 — Content layer
- [ ] Write the Zod schemas (§4.2). Write all content files from Appendix A, `metrics.ts` from Appendix C, and `content/data/*.json` from Appendix B.
- [ ] Set up MDX (`@next/mdx`, `remark-gfm`) and the component map.
- [ ] Write `scripts/images.ts` (§15) and generate the photo variants and the web variants of the delivered VYRO and Baby screens (§15.1). Copy in the product icons, with their sources recorded.
- [ ] Load `assets/source/screens/manifest.json` through a Zod schema, so a case study can only reference screens that exist.
- [ ] Write `check:content`. It must:
  - validate all content;
  - check that slugs are unique;
  - check that every metric has a source;
  - print the `{{PLACEHOLDER}}` report. In development it warns. In a production build it fails on any placeholder that isn't allow-listed in `content/placeholders.ts`.
- [ ] Write `lib/github.ts` (§4.3), with a fallback.

**Done when:**
- `pnpm check:content` passes and prints the placeholder report;
- a unit test fails if a metric loses its source;
- the images are generated.

**Inputs:** the photo (already provided); the confirmations in §20 (placeholders are fine).

### Phase 2 — Design system and motion
- [ ] Build the components (§5.7) and motion primitives:
  - `Reveal`
  - `TextReveal` (word-based, using `Intl.Segmenter`)
  - `CountUp`
  - `Magnetic`
  - `Spotlight`
  - `SignalLine`
  - `usePauseWhenHidden`
  - `useReducedMotionSafe`
- [ ] Add the Lenis provider (fine pointers only, lazy).
- [ ] Build `/styleguide`, excluded from production builds.

**Done when:**
- every component renders in dark and light at 375, 768 and 1440 px without overflow;
- keyboard use and focus work, and axe passes;
- reduced motion shows final states;
- there are no colour literals.

### Phase 3 — Global layout and Home
- [ ] Build the header (hides on scroll), the mobile menu, the footer and the skip link.
- [ ] Build the Home sections in the order of §8.2, with A.2 copy:
  - the hero signature moment (§6.3);
  - the proof strip, with count-up and source links;
  - the bento tiles (static covers for now; micro-demos come in Phase 5);
  - the company band, experience, open source, principles, the stack with linked highlighting, education, and the contact CTA.
- [ ] Optimise the hero LCP: the photo is `priority` and sized; the text renders immediately.

**Done when:**
- Home matches this spec at three widths in both themes;
- local Lighthouse mobile shows LCP < 2.0 s;
- every link resolves;
- there is no layout shift from fonts or images.

### Phase 4 — Work index and case studies
- [ ] Build `/work`: filters synced to `?filter=`, layout animation, and the archive list.
- [ ] Build the case-study template (§8.4), and the 9 MDX case studies from A.4.
  - Figures: redraw the static SVGs where simple; otherwise use the fallback PNGs until Phase 5.
  - Include the "How this was built" notes, previous/next navigation, reading progress and the sticky TOC.
- [ ] Add the redirects (§4.4).
- [ ] Write and run `scripts/capture/menumesh.ts` and `scripts/capture/jainav.ts` (§15.2), then use the captured screens in the MenuMesh and Jainav platform case studies.

**Done when:**
- all 9 pages render with correct metadata;
- every number traces to Appendix C;
- axe passes.

**Inputs:** the MyCounselHub decision (placeholders are fine). The VYRO and Baby screens are delivered; the MenuMesh and Jainav screens come from the capture scripts.

### Phase 5 — Centerpieces and micro-demos
- [ ] Build centerpieces §10.1–10.9, following the rules in §10.
- [ ] Export the MLOps per-batch data (§10.7), or record the fallback.
- [ ] Build the Home bento micro-demos (§10.10).

**Done when:**
- each centerpiece works with mouse, touch and keyboard;
- its data matches Appendix B;
- the lazy chunks are within budget;
- there are no main-thread tasks over 50 ms during interaction (measure with the Performance panel and record it).

### Phase 6 — Remaining pages
- [ ] Build Company (A.7), About (A.8), Open source (A.6), Now (A.9), Uses (A.10), Privacy and 404 (A.13).
- [ ] Build the Resume web page and `/resume.pdf` (§8.10, A.14).
- [ ] Build Contact and `/api/contact` (§8.11), with the dev outbox and the mailto fallback.

**Done when:**
- the PDF downloads, has selectable text and fits on at most 2 pages;
- the contact end-to-end test passes;
- the "Now" page shows its date.

### Phase 7 — Polish and SEO
- [ ] Add page transitions (§6.2; record the approach) and the command palette (§6.4).
- [ ] Add the "hey jarvis" toast and the console greeting.
- [ ] Generate share images for every route, the favicon and manifest, JSON-LD, the sitemap and robots file, and canonical URLs.
- [ ] Add the analytics events (§12).

**Done when:**
- the palette is fully keyboard accessible;
- every route has a share image;
- Lighthouse budgets are met locally;
- Tanishq checks the Person/WebSite markup in Google's Rich Results Test.

### Phase 8 — Launch
- [ ] Set the production environment variables, verify the Resend domain and set up Turnstile for `tanishq.website`.
- [ ] Add the domain in Vercel, with the `www` redirect and HTTPS.
- [ ] Redirect the old site (§16.5).
- [ ] Verify Search Console and submit the sitemap.
- [ ] Run Lighthouse on production URLs, and confirm the placeholder report is empty or only allow-listed items remain.
- [ ] Draft (don't push) an updated GitHub profile README for `nanu1605/nanu1605`. It needs:
  - the website link;
  - the current LinkedIn URL (`/in/tanishqjain010/`; the README still links an old one);
  - an updated role line ("ML & systems engineer · Founder, Jainav Infotech").
- [ ] Tanishq also adds the site to his LinkedIn profile.

**Done when:**
- `https://tanishq.website` serves production;
- the old URL redirects;
- a contact message arrives in the inbox;
- the mobile budgets are met on production;
- no `{{` is visible anywhere.

**Inputs (required):**
- DNS access at the registrar;
- the Resend API key;
- the Turnstile keys.

### Phase 9 — *(Optional)* "Ask about me"
- [ ] Build `/api/ask` with streaming:
  - retrieval over the site's own content, using build-time embeddings stored as JSON;
  - a small model through OpenRouter (e.g. `openai/gpt-4o-mini`);
  - a system prompt that answers only about Tanishq's public work, cites the pages it used, and refuses anything else.
- [ ] Add a rate limit and the hard daily budget (`ASK_DAILY_BUDGET_USD`). Store counts only, never message content.
- [ ] Build the UI: an "Ask" button that opens a panel with the Baby orb, labelled "AI answers can be wrong — check the linked pages."
- [ ] If the key is absent, disable the feature cleanly.

**Inputs:** the OpenRouter key and a monthly budget.

### Phase 10 — *(Optional)* Writing
- [ ] Add MDX posts with RSS. The first post could be a "how this site was built" write-up.

### Anytime — Fresh screens
- [ ] Re-run the capture scripts after product changes, and swap in new recordings if the apps change. Replace any remaining "Illustrative" screens and remove their labels.

---

## 20. Inputs needed from Tanishq

| Item | Needed by | Required? |
|---|---|---|
| Profile photo → `assets/source/tanishq-jain.jpg` | Phase 1 | Provided |
| `{{REPO}}` name and visibility (default `nanu1605/portfolio`, public) | Phase 0 | Default OK |
| `{{BOSCH_DOCS_TRACK}}`: include the docs-as-code work (DocHub, Sphinx + Graphviz/PlantUML, docs CI/CD)? Default **no** until confirmed | Phase 1 | Placeholder OK |
| `{{CONFIRM_AI_NATIVE}}` for Forecasting, Reservoir RL and MenuMesh | Phase 4 | Default `true` |
| `{{FOUNDED}}`: the month and year Jainav Infotech was incorporated | Phase 1 | Shows "2026" |
| When menumesh.in launches: set `menumeshLive: true` (adds the public demo link) and re-run `scripts/capture/menumesh.ts` against it | At MenuMesh launch | Default: pre-launch copy |
| When jainavinfotech.in goes live: set `jainavLive: true` (turns on the company links) | At company-site launch | Default: domain shown as "launching soon", GitHub linked |
| `{{VYRO_PRO}}`: mention the planned Pro edition? Default **no** | Phase 6 | Default no |
| `{{MYCOUNSELHUB_URL}}`, and permission to name the client | Phase 4 | Unnamed, no link |
| `{{VDR_IMAGES}}`: your own photo run through the Virtual Dressing Room pipeline | Phase 5 | Schematic stand-in |
| Social links: show X (`{{X_URL}}`, handle `@Tanishq11567281`)? Instagram? Default **no** | Phase 1 | Default no |
| `{{UDEMY_COURSE_TITLE}}`: the course's real title, to replace "Certified Ethical Hacker (CEH)" | Phase 1 | Line hidden |
| `{{NOW_ITEMS}}`: confirm or edit the Now list (A.9) | Phase 6 | Draft shown |
| `{{EDITOR}}`: your code editor, for /uses | Phase 6 | Line hidden |
| Anything that is only on LinkedIn (recommendations, honours) | Any time | — |
| `{{REGISTRAR}}` and DNS access for tanishq.website | Phase 8 | **Required** |
| Resend API key, Turnstile keys | Phase 8 | **Required** |
| `{{GSC_TXT}}` (Search Console verification) | Phase 8 | Optional |
| OpenRouter key and budget | Phase 9 | Optional |

---

## 21. Open decisions and defaults

| Decision | Default |
|---|---|
| Canonical host | The apex, `tanishq.website`; `www` redirects to it |
| Theme | Dark by default, with a light toggle; the hero is always dark |
| Smooth scroll | Lenis on fine pointers, off under reduced motion |
| Analytics | Vercel Web Analytics + Speed Insights |
| Reservoir headline | The seed-42 single run (it matches the README and resume). The Pareto chart uses the sweep, and the note explains the seed variance |
| Forecasting headline | The 5-seed raw DeepAR numbers. Show recalibration only as the same-run before/after |
| MLOps headline | 0.27 → 0.78 on unseen batches. Use the per-batch chart only if the data is exported (§10.7) |
| Baby speech latency | Show the measured ~5.5 s as a limitation. Never show "1–2.5 s" |
| CGPA | Shown on About and in the resume |
| Bosch docs-as-code track | Hidden until `{{BOSCH_DOCS_TRACK}}` is confirmed |
| Blog | Not in v1 |

---

# Appendix A — Copy deck (final text)

## A.1 Identity, links and SEO
- **Name:** Tanishq Jain
- **Role line:** ML & systems engineer
- **Location:** Indore, India (IST, UTC+5:30)
- **Email:** tanishqjain010@gmail.com
- **Links:**
  - GitHub: https://github.com/nanu1605
  - LinkedIn: https://www.linkedin.com/in/tanishqjain010/
  - Medium: https://medium.com/@tanishqjain010
  - X: `{{X_URL}}` (hidden by default)
- **Title template:** `%s — Tanishq Jain`
- **Default description:** "I build machine-learning systems and software that hold up outside the notebook, and ship them through my company, Jainav Infotech. Based in Indore, India."

| Page | Title | Description |
|---|---|---|
| Home | Tanishq Jain — ML & systems engineer | (default) |
| Work | Work | Case studies in ML systems, desktop software and product engineering: Baby, VYRO, reservoir RL, probabilistic forecasting, an MLOps loop and more. |
| Company | Jainav Infotech | The software company I founded in Indore: MenuMesh, VYRO and Baby, plus custom software for businesses. |
| About | About | How I got from Bosch's pipelines to building ML systems and my own products. |
| Open source | Open source | Google Summer of Code 2022 with PEcAn and a merged contribution to LitmusChaos. |
| Now | Now | What I'm working on this month. |
| Uses | Uses | The hardware and tools I build and test on. |
| Resume | Resume | My resume, generated from the same data as this site. |
| Contact | Contact | Email me or send a message. |
| Case study | `{title}` | `{oneLiner}` |

## A.2 Home

**Hero**
- **Eyebrow (mono):** `ML & systems engineer · Founder, Jainav Infotech · Indore, India`
- **Headline:** From model to machine.
- **Subline:** I'm Tanishq Jain. I build machine-learning systems and software that hold up outside the notebook — and ship them through my company, Jainav Infotech.
- **Status pill:** `Now · Shipping VYRO {vyro.version} · Applying for an MSc in AI/ML for 2027` (`{{NOW_ITEMS}}`)
- **CTAs:** See my work · Get in touch · Resume
- **Alternative headlines** (for Tanishq to swap):
  - "AI that knows its limits. Software that respects your machine."
  - "I build things that survive contact with reality."
- **Photo alt text:** "Tanishq Jain, smiling, in a grey henley against a black background."

**Proof strip.** Each readout is a metric id, shown as value + label and linked to its source.

| Value | Label | Metric |
|---|---|---|
| 16 | merged PRs to PEcAn and LitmusChaos | `oss.merged` |
| 0.46% | VYRO's average CPU with its window open (v0.2.0) | `vyro.cpu` |
| 1,037 | automated tests behind Baby v6 | `baby.tests` |
| 0.27 → 0.78 | F1 recovered by my drift-triggered retraining loop | `mlops.f1` |
| 1.5 yrs | DevOps engineering at Bosch | `bosch.years` |

**01 — Selected work**
- **Intro:** "Systems I've designed, built and measured. Every number links to where it was measured."
- **Tiles:** see A.3 (the six featured projects).
- **Link:** "All work →"

**02 — Company**
- **Title:** I also run a software company.
- **Body:** "Jainav Infotech Private Limited is the product company I founded in Indore. We build software we'd want to use ourselves — private by default, light on your machine — and custom software for businesses."
- **Product cards:** A.7.
- **Services line:** "We also build for clients: custom software & SaaS · AI & ML · Cloud & DevOps · E-commerce & web."
- **CTAs:** "About the company →" (`/company`) · "Visit Jainav Infotech" (https://jainavinfotech.in; shown only when `jainavLive` is true)

**03 — Experience** (compact; full entries in A.5)
- **Founder** — Jainav Infotech Private Limited · `{{FOUNDED}}` – present
- **Freelance full-stack developer** — MyCounselHub · Jun 2025 – Apr 2026
- **Associate Software Engineer** — Bosch Global Software Technologies · Jul 2023 – Jan 2025
- **Google Summer of Code contributor** — PEcAn Project · Jun – Sep 2022
- **B.E., Computer Science and Engineering** — Bangalore Institute of Technology · 2019 – 2023

**04 — Open source** (short cards; full text in A.6)
- **PEcAn · Google Summer of Code 2022:** "15 merged PRs helping get an ecological-forecasting toolbox ready for CRAN."
- **LitmusChaos:** "A merged PR moving ChaosCenter's hard-coded UI text into its translation file."

**05 — How I work**
1. **Measure honestly.** "I report the number that survives scrutiny: unseen data, several seeds, and the limitation next to the result. My forecasting write-up leads with the model's overconfidence, not its accuracy." → Forecasting case study
2. **Respect the machine.** "Budgets come first. VYRO targets under 1.5% CPU and 120 MB of RAM; Baby runs speech recognition on the CPU so its local model fits an 8 GB GPU." → VYRO case study
3. **Safe by default.** "Software that can act on your system should ask first. Baby's safety gate allows, confirms or denies every action and logs it; VYRO only controls fans on a board it has verified." → Baby case study
4. **Ship it.** "From Bosch's pipelines to my own releases: VYRO went through eleven public releases in about three weeks, published with checksums and installed copies updating themselves." → VYRO case study
5. **Spec first, then build with agents.** "I write detailed specs, make the architecture and product calls, review every phase and test on real hardware. Claude Code writes much of the implementation. The decisions — and the mistakes — are mine." → About

**06 — Stack:** A.11.

**07 — Education:** A.14.

**08 — Contact**
- **Title:** Let's talk.
- **Body:** "I'm open to conversations about ML engineering, research, and building software together."
- **Buttons:** Copy email · LinkedIn · GitHub · "Send a message" (`/contact`)

## A.3 Projects (cards, the bento grid and the Work index)
- **Order:** the featured order is 1–9 below; the archive comes last.
- **Bento grid:** projects 1–6, with Baby and VYRO as the large tiles.
- **Work index intro:** "Case studies first, then the archive. Every number links to where it was measured."

| # | Slug | Title | One-liner | Filters | Readout | Status badge |
|---|---|---|---|---|---|---|
| 1 | `baby` | Baby | A voice assistant for Windows that answers fast from the cloud — and keeps private turns on your PC. | ml, products | `22 tools · 1,037 tests` | Free · Open source |
| 2 | `vyro` | VYRO | Know your machine. A Windows hardware monitor that reads sensors directly and stays light on your PC. | products, infra | `v{vyro.version} · {vyro.installer} installer` | Beta · Free |
| 3 | `reservoir-rl` | Reservoir RL | Teaching PPO agents to run a reservoir for a year — trading flood risk against water supply and river health. | ml | `Flood penalty 82.4 → 1.7` | — |
| 4 | `probabilistic-forecasting` | Probabilistic forecasting | DeepAR was the most accurate model I tested — and the most overconfident. | ml | `90% intervals covered 74%` | — |
| 5 | `mlops-drift-loop` | MLOps drift loop | A model that notices the world changed, retrains itself, and only ships the new version if it wins. | ml, infra | `F1 0.27 → 0.78` | — |
| 6 | `jainav-platform` | Jainav Infotech platform | My company's website and store: Razorpay checkout, GST invoices and Ed25519-signed licence keys, in English and Hindi. | products, infra | `~355 tests · EN / हिंदी` | In launch prep |
| 7 | `menumesh` | MenuMesh | QR table ordering for restaurants: guests order from their phone, the kitchen sees it live, and the bill is ready in one tap. | products | `Plans from ₹399/month` | Launching soon |
| 8 | `virtual-dressing-room` | Virtual Dressing Room | Try on a garment from a single photo or your webcam — a team project I led in my final year. | ml | `Team of 3 · Lead` | — |
| 9 | `mycounselhub` | MyCounselHub | An online counselling platform, from booking to payment to a Google Meet link with no manual steps. | client | `3 service lines` | Client work |

**Archive** (compact list; repo links only):

| Title | Line | Stack | Year | Link |
|---|---|---|---|---|
| F1 Insights | A Formula 1 stats site: champions, circuits, drivers and standings back to 1950. Its data source, the Ergast API, has since been retired. | React | 2025 | `github.com/nanu1605/f1-website` |
| Attendance System | An Android app for colleges: admins add students and faculty; faculty run sessions and mark attendance. | Java, SQLite | 2022 | `github.com/nanu1605/Attendence-System` |
| Rain Forecast | Rainfall forecasting from historical data with auto-ARIMA. | R | 2023 | `github.com/nanu1605/Rain-forecast-using-AUTO-ARIMA-model` |
| Flutter Calculator | A basic calculator in Flutter for mobile, web and desktop. | Flutter | 2023 | `github.com/nanu1605/flutter_calculator` |

Leave these out of the archive:
- the Discord bot;
- `ReactEssentials`;
- the forks (`pecan`, `litmus`, `litmusctl`, `litmus-go`, `KubeArmor`, `pokemon-platform`, `udemy-docker-mastery`).

## A.4 Case studies
Each case study below is final copy. Section headings become `##` headings in the MDX.

### A.4.1 Baby
- **Meta:**
  - Role: solo — spec, architecture, testing
  - Timeline: Jun 2026 – present
  - Status: v{baby.version} · Free · Open source (MIT)
  - Platform: Windows 11
- **Stack:** Python, FastAPI, faster-whisper, Silero VAD, openWakeWord, Kokoro TTS, Ollama (Qwen 3.5 9B), OpenRouter, NVIDIA NIM, Gemini, SQLite + sqlite-vec, React, Three.js, Tauri 2
- **Links:**
  - Source: https://github.com/nanu1605/baby
  - Download: https://github.com/nanu1605/baby/releases
- **Flags:** `aiNative: true` · accent `baby`

**One-liner:** A voice assistant for Windows that answers fast from the cloud — and keeps private turns on your PC.

**TL;DR**
- **Problem.** Cloud assistants can't act on your PC, and fully local ones are slow on an 8 GB GPU. I wanted a hands-free assistant that's fast, private where it matters, and safe when it touches the system.
- **What I built.** A voice pipeline, a 22-tool agent behind a deterministic safety gate, and a router that picks between four model "brains" — pinning anything private to a local 9B model.
- **Result.** A public v6.0.1 installer, 1,037 automated tests, and a first token from the cloud in 1.2 s (p50).

**How a turn flows**
- Baby listens for its wake phrase, "Hey Jarvis" (or Ctrl+Alt+B).
- Silero VAD finds the end of your sentence, and faster-whisper (large-v3-turbo) transcribes it on the CPU.
- The agent loop can call up to 8 tools per turn. Every call passes the safety gate.
- Kokoro speaks the reply sentence by sentence, in English or Hindi. If you start talking, it stops within about 100 ms.
- The same agent also answers typed chat, a Telegram bot (locked to one chat), and background tasks.

**Four brains, one router**
- **The brains:**
  - GPT-4o-mini through OpenRouter answers by default;
  - a heavy model on NVIDIA NIM handles planning;
  - Gemini Flash is the backstop;
  - Qwen 3.5 9B runs locally on Ollama.
- **Privacy pin:** once a file's contents or shell output enters the conversation, the rest of the turn stays on the local model, and that content is redacted from anything sent to the cloud.
- **Language and connectivity:** Hindi written in Devanagari goes local, and so does everything when the PC is offline.
- **Failover:** a health state machine (cloud → degraded → offline) fails over mid-turn without losing the conversation.

**A gate, not a guess**
- Every tool call is classified allow, confirm or deny by a deterministic classifier, not a model, so it's predictable, auditable and testable (65 test cases).
- Chained commands are judged by their most dangerous part, protected folders and system processes are denied, and unknown commands ask first.
- Confirmations come from the screen, the CLI or Telegram buttons — never by voice — and silence for 60 seconds means no.
- Every action, routing decision and first-token time goes into an audit log.

**More than a chatbot**
- **Background tasks.** Longer jobs run in the background.
- **Multi-agent "projects".** An orchestrator splits a goal into up to four subtasks for two workers, each still behind the gate.
- **Screen awareness.** Runs on the local multimodal model. It falls back to Gemini only if local vision fails, and one setting keeps screenshots on the PC entirely.
- **Memory.** Retrieval uses sqlite-vec.
- **Game mode.** Unloads the local model to free about 5.5 GB of VRAM.
- **"The Brain."** A live 3-D view that traces the path of every turn.

**Key decisions**
1. **Cloud-primary, with local-first guarantees.** I benchmarked 12 models (7 on NVIDIA NIM, 5 on OpenRouter). On the first soak day, NVIDIA NIM — then the primary — served 0 of 45 routed attempts because of congestion, so the default moved to GPT-4o-mini on OpenRouter. The cloud answers by default — and privacy pins decide what never leaves.
2. **Speech on the CPU.** The local 9B needs almost the whole GPU (7.99 of 8 GB), and int8 CUDA isn't supported on RTX 50-series cards. So Whisper runs on the CPU and uses no VRAM.
3. **A deterministic gate.** When an assistant can delete files, predictable beats clever.
4. **Tauri over Electron for the desktop shell:** a 1.7 MB installer instead of about 85 MB, and a 280 ms cold start instead of 469 ms.

**Results**

| Measure | Value |
|---|---|
| Cloud first token (GPT-4o-mini) | p50 1.2 s · p95 4.0 s |
| Automated tests (v6.0.1) | 1,037 |
| Installer | 19 MB, per-user (admin rights only for the Visual C++ runtime) |
| Local model VRAM | 7.99 of 8 GB; speech uses none |
| VRAM freed by game mode | ~5.5 GB |

**Limitations and what's next**
- Speech recognition is the slow link. It takes about 5.5 s per utterance with large-v3-turbo on the CPU (1.4 s with the small model). Making it faster is next.
- Speaker verification is built but ships switched off until it meets its bar: at most 2% of the owner's turns rejected, and zero impostors accepted.
- The wake phrase is still the pretrained "Hey Jarvis"; a custom wake word isn't trained yet.
- The installer isn't code-signed yet, so Windows SmartScreen warns.

**Screens.** Use the delivered Baby screens and video (§15.1). The hero is `baby-turn-hinglish.mp4` with its poster; the stills support the sections below it.

**How this was built.** I wrote the plan and made the calls — 155 of them are logged in the repo's decision record. I ran the model benchmarks and every field test on my own PC, and reviewed each phase. Claude Code wrote much of the implementation.

### A.4.2 VYRO
- **Meta:**
  - Role: product owner and architect; field testing on real hardware
  - Timeline: Sep – Oct 2026 (v1.4.1 on 20 Oct 2026)
  - Status: Beta · Free download · Open source (MIT or Apache-2.0) · a Jainav Infotech product
  - Platform: Windows 10 (21H2+) and 11, x64
- **Stack:** Rust, Tauri 2, Svelte 5, TypeScript, SQLite, Three.js, Cloudflare Workers
- **Links:**
  - Download: https://github.com/nanu1605/vyro-releases/releases (verify, §C.4)
  - Source: https://github.com/nanu1605/vyro
  - Product page: https://jainavinfotech.in/products/vyro (only when `jainavLive` is true)
- **Flags:** `aiNative: true` · accent `vyro`

**One-liner:** Know your machine. A Windows hardware monitor that reads sensors directly and stays light on your PC.

**TL;DR**
- **Problem.** Hardware monitors tend to be heavy, cluttered, or built on someone else's monitoring library. I wanted one that's light, good-looking, and talks to the hardware itself.
- **What I built.** A Rust sensor engine that runs as a Windows service, plus a Tauri + Svelte app with animated gauges, seven days of history, alerts, game frame rates, fan control and an encrypted phone view.
- **Result.** Eleven public releases in about three weeks. At v0.2.0 it measured 0.46% CPU and about 125 MB of RAM with the window open; the v1.4.1 installer is 11.6 MB.

**What it shows**
- **CPU:** per-thread usage and clocks. On AMD Ryzen, also temperatures, per-core power and core voltage.
- **GPU:** per-engine load and VRAM. On NVIDIA, also clocks, power, fan speed, throttle reasons, and hotspot and memory temperatures. On RTX 50-series cards the hotspot is read from the card's thermal registers, because NVIDIA's API no longer reports it.
- **Memory and storage:** DDR5 module temperatures and timings; NVMe health and SATA SMART data.
- **Motherboard:** fans, temperatures and voltages.
- **Displays:** decoded EDID, refresh rate, HDR and colour details.
- **Also:** network quality, processes, and game frame rates with 1% and 0.1% lows.
- **On top of the readings:**
  - history from 5 minutes to 7 days;
  - compound alerts;
  - benchmarks compared only with your own PC's earlier runs;
  - a 13-check diagnostics report you can export;
  - a 3-D "My PC" view;
  - desktop widgets;
  - six themes;
  - a phone view.

**Architecture**
- **Service and app.** A Rust engine runs as a Windows service. The app itself runs without admin rights and talks to the engine over a locked-down named pipe.
- **Low-level access.** Low-level reads go through PawnIO, a signed driver that works with Memory Integrity turned on. The alternatives were a custom kernel driver, which would have needed paid signing, and WinRing0, which Windows blocks over CVE-2020-14979.
- **GPU data.** It comes from the vendors' own libraries (NVML, NVAPI, ADL, IGCL), loaded only from System32. WMI is used only for one-off reads at startup, never in the polling loop.
- **One source of truth.** The Rust structs define the data, and 201 TypeScript type files are generated from them; CI fails if the two drift apart.
- **Phone view.** A Cloudflare Worker, with one Durable Object per PC, relays an end-to-end-encrypted stream to a phone web app.

**Keeping it light**
- **Tauri over Electron.** It uses Tauri with WebView2 instead of Electron.
- **Polling.** The engine polls once a second, or every 5 s when hidden. When VYRO sits in the tray, the WebView is suspended.
- **One flag and a frame cap.** A WebView2 flag and a 60 fps animation cap took RAM from 131 to 120 MB, peak RAM from 208 to 132 MB, and average CPU from 1.0% to 0.68%.
- **History memory.** Keeping large history lists outside Svelte's reactivity cut the History view's JavaScript heap from 53.5 MB to 8.6 MB, and the highest total across all tabs from 295 MB to 167 MB.
- **Lazy 3-D.** The 3-D view loads Three.js only when you open it, and CI enforces a size budget.

**Results** (reference PC: Ryzen 7 9700X, RTX 5060 Ti, Windows 11)

| Measure | Target | Measured |
|---|---|---|
| CPU, window open | < 1.5% | 0.46% (v0.2.0) |
| RAM, window open | < 120 MB | 120–125 MB (v0.1.4–0.2.0) |
| Startup to first data | < 2 s | 0.76–1.02 s |
| Installer | < 60 MB | 11.6 MB (v1.4.0–1.4.1) |
| Cost of one poll | — | ~9 ms |
| In-app readout, 1.7 development build on a 4K display (20 Oct 2026) | — | 0.7–1.7% CPU and 246–270 MB app RAM; 5.5% and 341 MB with the 3-D view open |

- Footprint was formally recorded for v0.1.4 and v0.2.0 with the README's method. 1.x hasn't been re-measured that way; the in-app readout above suggests memory has grown with the features added since.
- Tests and accessibility:
  - at the V2 milestone there were 614 Rust core tests and 132 frontend tests;
  - CI runs 664 automated accessibility checks;
  - all six themes meet WCAG AA contrast.

**Limitations and what's next**
- **Not code-signed yet.** SmartScreen warns, and free open-source signing is being set up.
- **Hardware coverage is narrow so far:**
  - low-level CPU sensors are AMD-only;
  - motherboard sensors cover one Nuvoton chip;
  - fan control is enabled on one verified board, the MSI B650M GAMING PLUS WIFI.
- **Next:** DDR4, Intel CPUs and more boards.

**Screens.** Use the delivered VYRO screens and videos (§15.1), captioned "VYRO 1.7 development build, 20 Oct 2026". The hero is `vyro-dashboard.mp4`; put `vyro-my-pc-3d.mp4` in the architecture section. Don't present the "GPU tuning" item visible in the sidebar as a feature.

**How this was built.** I wrote the product plan and the V2 plan, made the architecture and product decisions, and checked every release on real hardware. That included reference readings against HWMonitor (power matched the 88 W limit under Cinebench) and anti-cheat checks with real games. Claude Code wrote most of the implementation.

### A.4.3 Jainav Infotech platform
- **Meta:**
  - Role: founder, product owner and spec author
  - Timeline: October 2026 (built 15–18 Oct)
  - Status: In launch prep. The code is complete through store operations; the site isn't live yet.
- **Stack:** Next.js 16, React 19, Payload CMS 3, PostgreSQL 17, Tailwind CSS 4, next-intl, Motion, Razorpay, Resend, Cloudflare (R2, Turnstile, Tunnel), Sentry, Umami, Docker, Caddy, GitHub Actions
- **Links:**
  - Source: https://github.com/nanu1605/jainav-infotech
  - Live: https://jainavinfotech.in (only when `jainavLive` is true; the domain is registered, the site isn't live yet)
- **Flags:** `aiNative: true`

**One-liner:** My company's website and store — product mini-sites, Razorpay checkout, GST invoices and a licensing API, in English and Hindi.

**TL;DR**
- **Problem.** A product company needs more than a brochure. It has to sell software, issue licence keys and invoices that satisfy Indian GST, and work for Hindi-speaking restaurant owners on their phones.
- **What I built.** A Next.js + Payload CMS platform, specified in a ~1,000-line spec and built in ten reviewed phases (0–9): content, design system, forms, checkout, invoicing, licensing and store operations.
- **Result.** About 355 automated tests, Lighthouse accessibility and SEO scores of 100 in local runs, and about 175 KB of initial JavaScript.

**Selling software properly**
- Checkout goes through Razorpay. Before fulfilling an order, the server checks the signature *and* re-fetches the payment from Razorpay.
- Fulfilment is idempotent.
- A reconciliation job runs every 15 minutes and flags anyone charged twice.

**Licences that verify offline**
- The licensing API is built for VYRO's paid edition; the app-side integration is still to come.
- Keys are stored only as SHA-256 hashes, plus AES-256-GCM-encrypted copies.
- Activation returns an Ed25519-signed token that the app can verify offline.
- The defaults are 2 devices per licence, a 14-day trial, and a 180-day grace period.

**Tax and invoices**
- CGST + SGST applies inside Madhya Pradesh, and IGST elsewhere.
- Invoices and credit notes are numbered and rendered as PDFs.
- A monthly CSV goes to the accountant.

**Two languages**
- English lives at `/` and Hindi at `/hi`, with field-level translation in the CMS.
- A CI check fails if any Hindi string is missing.

**Operations**
- A ~360 MB Docker image runs behind Caddy on one VPS.
- **Deploys:**
  - staging on every merge;
  - production on tagged releases after approval;
  - automatic rollback and smoke tests.
- **Backups:** nightly encrypted Postgres backups to R2, with a restore test.

**Results**

| Measure | Value |
|---|---|
| Automated tests | 142 unit · 158 integration · 49 end-to-end · 6 smoke |
| Lighthouse (local) | Performance 89–95 · Accessibility 100 · Best practices 96 · SEO 100 · CLS 0 |
| Initial JavaScript | ~175 KB gzipped |
| Size | ~34k lines of TypeScript · 28 API endpoints · 32 page routes |

**Limitations and what's next**
- The site isn't deployed yet. Launch is waiting on the server, DNS and the company's registration details.
- The store stays off until VYRO's paid edition is priced and the tax settings are confirmed with the accountant.

**How this was built.** I wrote the spec, reviewed every phase report, and made the product, legal and design calls. Claude Code built it phase by phase.

### A.4.4 MenuMesh
- **Meta:**
  - Role: founder and product designer
  - Status: Pre-launch. It runs on staging today and launches at menumesh.in, which is a holding page for now.
  - Platform: web (guest phones, staff tablets, kitchen screens, the counter)
- **Stack:** Next.js, Supabase (PostgreSQL)
- **Links:** https://menumesh.in. Add "Try the demo" → `https://menumesh.in/demo` only when `menumeshLive` is true; never link the staging site.
- **Flags:** `aiNative: {{CONFIRM_AI_NATIVE}}` · accent `menumesh` · `menumeshLive: false`

**One-liner:** QR table ordering for restaurants: guests order from their phone, the kitchen sees it live, and the bill is ready in one tap.

**TL;DR**
- **Problem.** Busy restaurants lose time to paper orders, missed dishes and slow bills — and many ordering apps take a commission on every order.
- **What I built.** A multi-restaurant SaaS with screens for guests, waiters, the kitchen and the counter, plus a super-admin panel to run client restaurants.
- **Business model.** Restaurants pay a monthly plan from ₹399 + GST. Guests pay the restaurant directly, and MenuMesh takes no commission.

**How it works.** Scan → Order → Cook and serve → Bill and pay.
1. **Scan.** Each table has its own QR code. Guests scan it and the menu opens, already tied to their table — no app, no login.
2. **Order.** They pick dishes, options and add-ons, in English or Hindi. Friends at the same table can order from their own phones, round after round.
3. **Cook and serve.** Waiters see the order straight away, and the kitchen gets it once a waiter takes the table. Every dish moves from placed to preparing, ready and served, and the guest sees it move too.
4. **Bill and pay.** One tap makes the bill with the table's dishes, GST and other charges. It prints on 80 mm or 58 mm receipt printers, payment is recorded as cash, UPI or card, and the table is free for the next guests.

**Features**
- Table QR ordering, with the menu in English and Hindi. Dish names are written in Hindi automatically and can be edited.
- First orders need approval, which stops prank orders.
- A live, colour-coded staff board for waiters; a kitchen view on Growth and Pro.
- One-tap bills with GST and service charge.
- Set up the menu from a photo of the printed menu, or from a PDF or CSV.
- Keeps saving dish updates through a short Wi-Fi drop.
- Discounts, split payments, a UPI QR code on the bill, advanced and waiter reports, and CSV export on Growth and Pro.
- A browser demo where one person plays guest, kitchen and counter at once.

**Plans** (pre-launch pricing, from the staging site on 20 Oct 2026; prices before 18% GST)

| Plan | Price | Tables | Staff logins | Adds |
|---|---|---|---|---|
| Starter | ₹399 a month | 3 | 3 | QR ordering, Hindi menu, staff board, bills, menu import, daily report |
| Growth | ₹899 a month | 8 | 15 | Kitchen view, discounts, split payments, UPI QR on bills, advanced and waiter reports, CSV export |
| Pro | ₹1,799 a month | Unlimited | Unlimited | No "Powered by" line on bills |

- Yearly billing gives two months free, and Growth has a 14-day free trial.
- Setting up is free, or a one-time ₹499 assisted setup (launch offer) with printed table QR codes.

**What's next.** Launching at menumesh.in.

**Screens.** Captured from the staging demo by `scripts/capture/menumesh.ts` (§15.2): the guest phone, the kitchen tablet and the counter laptop at each step of an order.

### A.4.5 Reservoir RL
- **Meta:**
  - Role: solo research project
  - Timeline: Jun 2026
- **Stack:** Python 3.12, Gymnasium, Stable-Baselines3 (PPO), NumPy, Matplotlib, pytest
- **Links:** https://github.com/nanu1605/reservoir-rl
- **Flags:** `aiNative: {{CONFIRM_AI_NATIVE}}`

**One-liner:** Teaching PPO agents to run a reservoir for a year — trading flood risk against water supply and river health.

**TL;DR**
- **Problem.** A reservoir operator can't maximise everything. Holding water protects supply but risks floods; releasing it prevents floods but can starve the river and the people downstream.
- **What I built.** A custom Gymnasium environment for a 365-day year, eight PPO agents trained under different objective weightings, and an honest comparison with a conventional rule-curve policy.
- **Result.** The balanced agent cut the flood penalty from 82.4 to 1.7 and the supply deficit from 194.7 to 183.4. The rule curve still wins on ecology.

**The environment**
- One reservoir: capacity 300 units, a maximum release of 8 per day, and demand peaking at 7 per day.
- Inflows are synthetic, and the agent sees a noisy forecast of tomorrow's inflow.
- Each year is scored on three penalties:
  - flooding (overflow);
  - supply deficit;
  - ecological deficit, when the river drops below a minimum flow of 1.5.

**What went wrong first**
- The first sweep was degenerate: every weighting learned to drain the reservoir.
- It took four changes to the environment before any real trade-off appeared:
  - capacity;
  - the release limit;
  - a discount factor of 0.999;
  - random starting storage.
- The modelling work lives in the environment, not in the algorithm.

**The frontier**
- **The sweep:** eight weightings, each trained for 150k steps and evaluated on 100 shared episodes.
- **Against the rule curve:**
  - every agent beats it on flooding;
  - seven of eight beat it on supply;
  - none reaches zero ecological deficit, because the rule enforces minimum flow as a hard floor. That keeps the rule curve on the Pareto frontier for ecology.

**Results** (100 episodes, lower is better)

| Objective | Balanced PPO | Rule curve | Random |
|---|---|---|---|
| Flood penalty | 1.7 ± 7.0 | 82.4 ± 29.1 | 582.9 |
| Supply deficit | 183.4 ± 16.2 | 194.7 ± 10.0 | 467.5 |
| Ecological deficit | 22.2 ± 2.2 | 0.0 | 52.0 |

**Stress test: a drier climate**
- **Setup:** inflow 20% lower and 30% noisier, with no retraining.
- **What happened:** the balanced agent's supply deficit rose from 183.4 to 349.4, and its ecological deficit from 22.2 to 40.5.
- **The lesson:** an agent doesn't adapt to a world it wasn't trained on — the same lesson as my drift work.

**Limitations and what's next**
- **Scope:**
  - a single reservoir;
  - weighted-sum training rather than true multi-objective RL;
  - ecology as a soft penalty;
  - synthetic inflows.
- **One seed per weighting.** Two runs with identical balanced weights landed at different points (supply deficit 183.4 vs 177.5), so more seeds are the first fix.
- **The flood term.** Because the release limit equals the flood threshold, the flood term reduces to overflow.
- **Why it matters to me.** This is the kind of problem I want to study next: decisions under competing objectives and uncertainty.

**How this was built** *(if `aiNative`)*. I designed the environment, the experiments and the evaluation, ran them, and wrote up the findings; Claude Code helped write the code.

### A.4.6 Probabilistic forecasting
- **Meta:**
  - Role: solo
  - Timeline: May 2026
- **Stack:** Python 3.12, GluonTS (PyTorch), statsmodels, pmdarima, properscoring, scikit-learn, MLflow, DVC, pytest
- **Links:**
  - Source: https://github.com/nanu1605/probabilistic-forecasting
  - Report: the repo's `report/report.md`
- **Flags:** `aiNative: {{CONFIRM_AI_NATIVE}}`

**One-liner:** DeepAR was the most accurate model I tested — and the most overconfident.

**TL;DR**
- **Problem.** A forecast's intervals matter as much as its point estimate. If "90%" intervals catch the truth only 74% of the time, every decision built on them is miscalibrated.
- **What I built.** A reproduction of DeepAR on four years of hourly Beijing PM2.5 data, benchmarked against seasonal-naive, ARIMA and ETS with proper scoring rules, plus a calibration diagnosis and an attempted fix.
- **Result.** DeepAR led on accuracy (CRPS 43.6 vs ARIMA's 47.4). But its 90% intervals covered only 74% of outcomes, and post-hoc recalibration didn't fix that under the test period's shift.

**Setup**
- **Data:** UCI Beijing air-quality data from the Aotizhongxin station — hourly PM2.5 from March 2013 to February 2017, 35,064 rows.
- **Splits:**
  - train to June 2016;
  - validate July–December 2016;
  - test January–February 2017, on 59 non-overlapping 24-hour windows.
- **DeepAR:** a one-week context, a 24-hour horizon and Student-t outputs, trained over 5 seeds.
- **Scoring:** every model produces 100 sample paths, and the same code scores them all.

**Results** (test set; DeepAR is mean ± sd over 5 seeds)

| Model | CRPS | RMSE | 90% coverage | ECE |
|---|---|---|---|---|
| Seasonal naive | 68.4 | 137.5 | 78.6% | 0.084 |
| ARIMA | 47.4 | 103.5 | 80.4% | 0.072 |
| ETS | 47.5 | 104.9 | 87.9% | 0.109 |
| DeepAR | 43.6 ± 1.7 | 99.5 ± 2.3 | 74.1% ± 4.0 | 0.125 ± 0.027 |

*ECE here is the average gap between nominal and observed interval coverage across nine levels.*

**Where it breaks.** Miscalibration grows with the horizon. For the best seed, the coverage gap is 0.03 one hour ahead and 0.17 at 24 hours.

**The fix that didn't work**
- **The method:** isotonic recalibration (Kuleshov et al.), fitted on the validation period.
- **Validation:** DeepAR was already well calibrated there (gap 0.014), so there was nothing to learn.
- **Test:** on the shifted winter test period, the gap went from 0.090 to 0.098.
- **The diagnostic:** a fit on the test period itself reaches 0.020. The method works; the shift is the problem.

**Lessons**
- Measure calibration explicitly.
- Report results across seeds; CRPS ranged from 41.4 to 46.2 across them.
- A validation set has to look like the future.

**Limitations and what's next**
- **Scope:** a single station, PM2.5 history only (no weather covariates), and untuned hyperparameters.
- **Next:** shift-aware and conditional recalibration, more stations, and newer models.

**How this was built** *(if `aiNative`)*. I designed the experiments and the evaluation, ran them, and wrote up the findings; Claude Code helped write the code.

### A.4.7 MLOps drift loop
- **Meta:**
  - Role: solo
  - Timeline: Apr 2026
- **Stack:** Python 3.12, scikit-learn, MLflow, Evidently, FastAPI, Prometheus, Grafana, DVC, pandera, Docker Compose, Kubernetes, GitHub Actions
- **Links:** https://github.com/nanu1605/mlops-drift-retrain
- **Flags:** `aiNative: true`

**One-liner:** A model that notices the world changed, retrains itself, and only ships the new version if it wins.

**TL;DR**
- **Problem.** Code doesn't rot; models do. When traffic drifts, a classifier quietly gets worse until someone notices.
- **What I built.** A closed loop for a network-intrusion classifier: label-free drift detection, automatic retraining, a champion/challenger gate, and a hot reload of the serving API — with no human in the path.
- **Result.** After a synthetic shift that included a new attack type, realized F1 recovered automatically from 0.27 to 0.78, measured on unseen traffic.

**The loop**
1. A FastAPI service serves predictions and logs every request.
2. Evidently checks the features for drift; it doesn't wait for labels, which arrive late.
3. On drift, the system retrains, and MLflow registers a challenger.
4. The challenger is promoted only if it beats the champion by at least 0.01 F1 and clears a 0.50 floor.
5. Serving hot-reloads the new model, and Prometheus and Grafana track it all.

**The experiment**
- **Data:** 20,000 synthetic rows over time.
- **The shift:** the drift period moves 40% of the features and adds an attack type the old model has never seen.
- **The replay:** the real serving process and controller replay it in 20 batches of 400 rows.
- **The result:** realized F1 sits around 0.27 while the stale champion serves drifted traffic. Drift is caught and the challenger promoted on the first allowed check, after which F1 holds around 0.78.

**Honest notes**
- **Easy detection.** The synthetic shift trips every feature, so detection was never borderline.
- **Optimistic promotion check.** The promotion test overlaps the retraining data, so it's optimistic. That's why the number I quote comes from the per-batch series on unseen batches.
- **Label lag.** In production, the F1 line would lag by the label delay.
- **The model isn't the point.** A plain logistic regression actually beat the random forest at baseline (F1 0.688 vs 0.576). The deliverable is the loop, not the model.

**Running it**
- **Deploy targets:** a Docker Compose stack, Kubernetes manifests for minikube, and an Oracle Kubernetes Engine overlay.
- **GitHub Actions:**
  - CI with a model-quality gate;
  - multi-architecture images pushed to GHCR;
  - a scheduled daily retrain.

**Limitations and what's next**
- **Data:** synthetic, not CICIDS2017; promotion needs a disjoint future holdout.
- **Scale:** a single SQLite writer means a single serving worker.
- **Next:** real traffic data, a feature store, and concept-drift detection.

**What I learned.** Code doesn't rot; models do. The model took an afternoon; the honest evaluation took weeks.

**How this was built.** I wrote the execution spec and owned the evaluation design and its honesty checks; Claude Code wrote much of the implementation.

### A.4.8 Virtual Dressing Room
- **Meta:**
  - Role: team lead, team of 3
  - Context: final-year project, Bangalore Institute of Technology
  - Timeline: Jun 2022 – Mar 2023
- **Stack:** Python, OpenCV (DNN module), Tkinter; pretrained CP-VTON, OpenPose and LIP-JPPNet models
- **Links:** https://github.com/nanu1605/Virtual-Dressing-Room
- **Flags:** `aiNative: false`

**One-liner:** Try on a garment from a single photo or your webcam — a team project I led in my final year.

**TL;DR**
- **Problem.** Online shoppers can't see how clothes will look on them.
- **What we built.** A desktop app that warps a garment onto a person's photo with a CP-VTON pipeline — pose estimation, human parsing, geometric matching and a try-on renderer. It runs pretrained models on the CPU through OpenCV's DNN module.
- **My role.** I led a three-person team, one short of the usual four. I split the work to balance the heavier load, and integrated the pipeline.

**The pipeline**
1. Crop the photo to 192×256.
2. Find 18 body keypoints (OpenPose).
3. Segment the body and clothing into 20 classes (LIP-JPPNet).
4. Build a clothing-agnostic representation of the person.
5. Warp the garment to the body (the Geometric Matching Module).
6. Render the person wearing it (the Try-On Module).

Webcam mode shows a live pose skeleton before capturing a frame.

**Limitations**
- This is 2-D image try-on, not 3-D or AR.
- The models are pretrained; we didn't train them.
- The research dataset's images can't be shown publicly.

### A.4.9 MyCounselHub
- **Meta:**
  - Role: sole freelance engineer
  - Timeline: Jun 2025 – Apr 2026
  - Status: Client work · live
- **Stack:** WordPress, Amelia, PHP, Razorpay, Google Calendar and Meet APIs, MySQL
- **Links:** `{{MYCOUNSELHUB_URL}}`, only with the client's permission; otherwise no link and no client name beyond "MyCounselHub".
- **Flags:** `aiNative: false`

**One-liner:** An online counselling platform, from booking to payment to a Google Meet link with no manual steps.

**TL;DR**
- **Problem.** A counselling practice needed bookings, payments and video sessions across three services — mental health, dietetics and Ayurveda — without paying for premium automation add-ons.
- **What I built.** A WordPress + Amelia platform with custom scripts. When a payment succeeds, they create the Google Meet link, add calendar events for the client and the counsellor, issue an invoice, and send a reminder 30 minutes before the session.
- **Result.** A live platform with onboarded counsellors and active session bookings.

**Also built**
- Razorpay payments and a custom discount-coupon system.
- A free self-assessment tool.
- A counsellor onboarding flow.
- The MySQL database for clients, counsellors and leads.
- SEO, and the handover to the client.

## A.5 Experience (full entries, used on About and in the resume)

**Founder** — Jainav Infotech Private Limited, Indore · `{{FOUNDED}}` – present
- Founded a product company to build and sell my own software — MenuMesh, VYRO and Baby — and to build custom software for businesses.
- Specified and shipped the company's platform: product pages, Razorpay checkout, GST invoicing and a licensing API, in English and Hindi.

**Freelance Full-Stack Developer** — MyCounselHub (remote) · Jun 2025 – Apr 2026
- Sole engineer on a WordPress counselling platform with the Amelia booking system, across three services (mental health, dietetics and Ayurveda). Owned everything from requirements to SEO and handover.
- Wrote custom scripts that turn a successful payment into a Google Meet link, calendar events for the client and the counsellor, an invoice, and a reminder 30 minutes before the session.
- Integrated Razorpay, built a discount-coupon system, a free self-assessment tool and a counsellor onboarding flow, and designed the MySQL database for clients, counsellors and leads.

**Associate Software Engineer** — Bosch Global Software Technologies, Bangalore · Jul 2023 – Jan 2025
- Architected and maintained CI/CD pipelines for testing, building and deployment, cutting deployment time by 60% and raising availability by 20%.
- Led the move to Docker and Kubernetes autoscaling, raising scalability by 30%, cutting manual intervention by 60%, and saving about 20 hours of operations work a week.
- Built a custom Jenkins plugin and Python and Shell automation, cutting build times by 40% and saving about 20 hours a week.
- *If `{{BOSCH_DOCS_TRACK}}` is confirmed, add:* "Built a docs-as-code workflow (DocHub, Sphinx with Graphviz and PlantUML diagrams) with CI/CD publishing kept in sync with releases." Use no numbers unless Tanishq confirms them.

**Google Summer of Code Contributor** — PEcAn Project (open source) · Jun – Sep 2022
- Selected for Google Summer of Code 2022 to work on "PEcAn in CRAN". I merged 15 pull requests that refactored PEcAn's R packages toward CRAN compliance: replacing an orphaned dependency, clearing R CMD check warnings, and breaking circular dependencies between packages.

## A.6 Open source

- **Title:** Open source
- **Intro:** "Open source is where I learned to work in someone else's codebase: code review, CI, and other people's standards."

**PEcAn — Google Summer of Code 2022**
- **About the project:**
  - PEcAn (the Predictive Ecosystem Analyzer) is an ecological-forecasting toolbox made of many R packages.
  - My GSoC project, "PEcAn in CRAN", worked toward publishing those packages on CRAN, R's package repository, so anyone could install them with `install.packages()`.
- **Stats:** `15 merged PRs · opened Jul – Sep 2022`
- **What the PRs did:**
  - **Replaced an orphaned dependency.**
    - Swapped `udunits2` for `units` across PEcAn (#2989, #3001, #3002, #3007).
    - Updated the R CMD check reference logs to match (#2984, #3000).
  - **Cleared R CMD check notes and warnings:** global variables, documentation and vignettes in PEcAn.DB, PEcAn.MA and PEcAn.emulator (#2960, #2965, #2966, #2971, #2973, #2982, #2983).
  - **Broke circular dependencies.**
    - Moved `convert.input` from utils to DB (#3026).
    - Moved `minimize.GP` from emulator to assim.batch (#3027).
- **Links:**
  - Final report on Medium: https://medium.com/@tanishqjain010/gsoc-2022-pecan-in-cran-final-report-4ef45b55df75
  - All PRs: `https://github.com/search?q=author%3Ananu1605+is%3Apr+is%3Amerged+repo%3APecanProject%2Fpecan&type=pullrequests`
  - GSoC certificate: https://drive.google.com/file/d/1X84R03S177Vw8xmS7dxXZu54srL030oG/view?usp=sharing

**LitmusChaos — CNCF chaos-engineering project**
- "I moved ChaosCenter's hard-coded UI text into its translation file and replaced it with `getString()` calls. PR #4186, merged October 2023, fixes issue #4147."
- **Link:** https://github.com/litmuschaos/litmus/pull/4186

**Dot timeline data:**
- the 15 PEcAn PRs, opened July–September 2022 (exact open and merge dates come from the GitHub search above);
- #4186, merged 27 Oct 2023.

## A.7 Company

- **Eyebrow:** Founder
- **Title:** Jainav Infotech
- **Subtitle:** A product company from Indore, Madhya Pradesh.
- **Intro:** "I founded Jainav Infotech Private Limited to ship software people can actually use — and to build it for others. Each product keeps its own name and look, with a small 'by Jainav' tag."

**Principles** (from the company site)
- **Privacy by default** — Data stays where it belongs.
- **Fast, light software** — Small, quick apps that respect your machine.
- **Built in Indore, for the world**
- **We ship our own products** — We build what we use.

**Products**

| Product | Tagline | Description | Badge | Links |
|---|---|---|---|---|
| MenuMesh (accent `menumesh`) | QR table ordering for restaurants. | Guests scan the QR code on their table and order from their own phone, in English or Hindi. Waiters and the kitchen follow every dish until it's served, and the bill, with GST and charges, is ready in one tap. Guests pay the restaurant directly; MenuMesh takes no commission. | Launching soon | menumesh.in · Case study |
| VYRO (accent `vyro`) | Know your machine. | See what your Windows PC is doing right now on animated gauges: usage, clocks, temperatures, power and fan speeds, with seven days of history, health checks and alerts. Gamers also get frame rates, an overlay and replays of recent sessions. | Beta · Free | Download · Case study · jainavinfotech.in/products/vyro (only when `jainavLive`) |
| Baby (accent `baby`) | Your personal voice assistant for Windows. | Talk to your PC in English, Hindi or Hinglish. Baby opens apps, finds files, browses the web and runs longer jobs in the background — and asks before it changes anything. | Free · Open source | Download · Case study |

**Services**
- **Title:** "We also build for clients"
- **Custom software & SaaS** — web apps, SaaS platforms, and mobile and desktop apps.
- **AI & ML** — LLM apps and assistants, search and RAG, automation, forecasting and analytics.
- **Cloud & DevOps** — CI/CD, containers, cloud setup, monitoring and cost tuning.
- **E-commerce & web** — online stores, marketplaces, portals and fast marketing sites.

**Platform link:** "The company's website and store is one of my case studies →" (`/work/jainav-platform`)

**CTAs**
- Visit Jainav Infotech (https://jainavinfotech.in). While `jainavLive` is false, show "jainavinfotech.in · launching soon" as plain text and link the GitHub repo instead.
- Email the company: support@jainavinfotech.in

## A.8 About

**Title:** About

**Story**
- I'm Tanishq Jain, an ML and systems engineer from Indore, India.
- I studied Computer Science and Engineering at Bangalore Institute of Technology. In my final year I led a three-person team building a virtual dressing room. It was my first time wiring several deep-learning models into something a person could actually use. The same year, Google Summer of Code took me into PEcAn, an ecological-forecasting project, where 15 merged pull requests taught me what it takes to make research software installable by anyone.
- At Bosch Global Software Technologies I spent a year and a half on the other end of the pipeline: CI/CD, Docker, Kubernetes autoscaling and a custom Jenkins plugin. I learned that software is only as good as the way it's built, tested and shipped.
- Then I went independent. As a freelancer I built MyCounselHub, a live counselling platform. And I kept asking a question that has shaped my work since: what happens to an ML system after the demo? My projects since have chased it — a forecaster that turned out to be overconfident, a retraining loop for when data drifts, and reinforcement-learning agents weighing floods against water supply.
- I founded Jainav Infotech to ship software people can use: VYRO, a hardware monitor for Windows; Baby, a privacy-first voice assistant; and MenuMesh, QR ordering for restaurants.
- Next, I'm applying for a Master's in AI and ML in Europe, to go deeper into the parts I find hardest: learning under uncertainty and distribution shift, and decisions with competing objectives.

**How I build**
- I work AI-native. For my recent projects, I write a detailed spec, make the architecture and product decisions, review every phase, and test on real hardware. Claude Code writes much of the implementation.
- I think that's what modern engineering looks like. The decisions, the trade-offs and the mistakes are still mine.

**Also on this page**
- Timeline: A.5.
- Education and certifications: A.14.
- **Languages:** English (proficient), Hindi (native).

## A.9 Now (`{{NOW_ITEMS}}` — Tanishq to confirm)
- **Last updated:** 20 October 2026
- **VYRO 1.x.** Shipping it: code signing, and support for more motherboards and Intel CPUs.
- **Jainav Infotech.** Launching the company website and store.
- **MenuMesh.** Getting it ready for launch at menumesh.in; it runs on staging today.
- **Master's applications.** Applying for an MSc in AI/ML in Europe for 2027.
- **This site.** Building it in public, from this spec.

## A.10 Uses
- **Intro:** "The machine I build and test on. It's also why some of my design decisions look the way they do."
- **Desktop:**
  - AMD Ryzen 7 9700X
  - MSI B650M GAMING PLUS WIFI
  - 2 × 16 GB DDR5-5600
  - NVIDIA RTX 5060 Ti (8 GB)
  - Windows 11
- **Why it matters:**
  - "The 8 GB GPU is why Baby's speech recognition runs on the CPU."
  - "This board is the first one VYRO's fan control was verified on."
- **Development:**
  - WSL2 (Ubuntu)
  - Claude Code
  - Git and GitHub Actions
  - `uv` for Python, `pnpm` for JavaScript
  - `{{EDITOR}}`

## A.11 Stack (grouped; `projects` drives the hover highlighting)

| Group | Skill → projects |
|---|---|
| ML & data | • PyTorch → forecasting<br>• GluonTS / DeepAR → forecasting<br>• Stable-Baselines3 (PPO) → reservoir-rl<br>• Gymnasium → reservoir-rl<br>• scikit-learn → mlops-drift-loop, forecasting<br>• statsmodels / pmdarima → forecasting<br>• pandas → reservoir-rl, forecasting, mlops-drift-loop<br>• MLflow → mlops-drift-loop, forecasting<br>• Evidently → mlops-drift-loop<br>• DVC → mlops-drift-loop, forecasting |
| AI applications | • LLM routing (OpenRouter, NVIDIA NIM, Gemini, Ollama) → baby<br>• RAG with sqlite-vec → baby<br>• Speech (faster-whisper, Silero VAD, openWakeWord, Kokoro) → baby<br>• Browser automation (Playwright) → baby<br>• OpenCV DNN → virtual-dressing-room |
| Systems & desktop | • Rust → vyro<br>• Tauri 2 → vyro, baby<br>• Windows hardware APIs (NVML, NVAPI, ADL, PawnIO) → vyro<br>• Svelte 5 → vyro<br>• SQLite → vyro, baby<br>• Three.js → vyro, baby |
| Web & product | • TypeScript → jainav-platform, vyro, menumesh<br>• Next.js → jainav-platform, menumesh<br>• React → jainav-platform, baby<br>• Payload CMS → jainav-platform<br>• PostgreSQL → jainav-platform<br>• Supabase → menumesh<br>• Tailwind CSS → jainav-platform<br>• FastAPI → mlops-drift-loop, baby<br>• WordPress & PHP → mycounselhub<br>• Razorpay → jainav-platform, mycounselhub |
| DevOps & cloud | • Docker → bosch, mlops-drift-loop, jainav-platform<br>• Kubernetes → bosch, mlops-drift-loop<br>• Jenkins → bosch<br>• GitHub Actions → vyro, baby, jainav-platform, mlops-drift-loop<br>• Terraform<br>• Prometheus & Grafana → mlops-drift-loop<br>• Cloudflare (Workers, R2, Turnstile) → vyro, jainav-platform<br>• AWS<br>• Azure<br>• Oracle Cloud → mlops-drift-loop |
| Languages | • Python<br>• TypeScript / JavaScript<br>• Rust<br>• R → gsoc<br>• Go<br>• Java<br>• SQL<br>• Bash |

`bosch` and `gsoc` are experience entries, not projects. They highlight the matching timeline entry instead.

## A.12 Contact
- **Title:** Let's talk.
- **Body:** "Email is the fastest way to reach me. I'm in Indore, India (IST, UTC+5:30)."
- **Email row:** `tanishqjain010@gmail.com`, with a [Copy] button
- **Form labels:**
  - Name
  - Email
  - What's this about?
    - A role or opportunity
    - Research or a Master's programme
    - A project for Jainav Infotech
    - Something else
  - Message
  - Send
- **Under the form:** "Your message is emailed to me and isn't stored on this site."
- **Success:** "Thanks — your message is on its way. I'll reply to {email}."
- **Error:** "That didn't send. Try again, or email me at tanishqjain010@gmail.com."
- **Validation messages:**
  - "Please add your name."
  - "That email address doesn't look right."
  - "Please write a message (up to 4,000 characters)."

## A.13 Microcopy
- **Footer:**
  - "Tanishq Jain · ML & systems engineer · Indore, India"
  - "Designed and specced by me. Built with Next.js and Claude Code."
  - "© 2026 Tanishq Jain · Last updated {build date} · Privacy"
- **404:**
  - Title: "Sensor not found."
  - Body: "This page doesn't exist — or it's reading 0 RPM."
  - Button: "Back to home"
  - Hint: "Or press Ctrl K / ⌘K to search."
- **Privacy:** "This site sets no cookies and runs no ad trackers. Visits are counted with Vercel Web Analytics, which doesn't use cookies. Messages sent through the contact form are emailed to me through Resend and aren't stored on this site, and Cloudflare Turnstile checks the form for bots. Questions? tanishqjain010@gmail.com."
- **Command palette:**
  - placeholder: "Search pages and projects…"
  - groups: Pages, Projects, Actions
  - actions: "Copy email", "Download resume", "Toggle theme", "Open GitHub", "Open LinkedIn", "Open Medium"
- **"Hey Jarvis" toast:** "“Hey Jarvis” wakes up Baby, my voice assistant. This website can't hear you — promise." [See Baby →]
- **Console greeting:** "Hi, curious engineer. This site was specced by me and built with Claude Code. Say hello: tanishqjain010@gmail.com"
- **Simulated labels:**
  - "Simulated values — VYRO reads the real ones."
  - "Scripted demo — not a live assistant."
  - "Illustrative screens."
- **"View data" toggle:** "View data" / "Hide data"

## A.14 Education, certifications and resume

**Education**
- B.E., Computer Science and Engineering — Bangalore Institute of Technology (Visvesvaraya Technological University), Bangalore · Aug 2019 – Jun 2023
- CGPA 7.77/10, First Class with Distinction
- **Relevant coursework:**
  - Artificial Intelligence and Machine Learning
  - Data Mining and Data Warehousing
  - Application Development using Python
  - Design and Analysis of Algorithms
  - Data Structures and Applications
  - Probability and Statistical Methods
  - Database Management Systems

**Certifications**
- Data Analysis with Python — freeCodeCamp, Feb 2022: https://www.freecodecamp.org/certification/fcc1e32c0ee-9f1f-4f99-b106-64821e033462/data-analysis-with-python-v7
- Python (Basic) — HackerRank, Nov 2021: https://www.hackerrank.com/certificates/8e5a5fedaf36
- Azure Data Fundamentals — Microsoft, Mar 2021: https://drive.google.com/file/d/1oyceCQXwli_TH7uhndq3NRF79evNTdoE/view?usp=sharing
- Data Science and Analytics using Python and R — Knowledge Solutions India, Oct 2020: https://drive.google.com/file/d/1NYs-cq0Av3OEk7t8UxFy6KQHd_9C0kM5/view?usp=sharing
- `{{UDEMY_COURSE_TITLE}}` — Udemy, Jun 2020: https://www.udemy.com/certificate/UC-c416d825-adcd-48a6-a078-26e2cd91edd5/. Hidden until the title is provided, and never labelled "Certified Ethical Hacker (CEH)".

**Resume summary** (PDF and web)

"ML and systems engineer. A year and a half of DevOps at Bosch Global Software Technologies, a freelance full-stack platform in production, and my own products — VYRO and Baby — shipped through Jainav Infotech. Recent independent work in reinforcement learning, MLOps and probabilistic forecasting. Applying for a Master's in AI and ML (2027)."

**Resume projects** (2–3 bullets each, in this order)
1. **Baby — voice assistant for Windows** (Jun 2026 – present)
   - A voice pipeline (openWakeWord → Silero VAD → faster-whisper → agent → Kokoro TTS) and a 22-tool agent behind a deterministic allow/confirm/deny safety gate with an audit log.
   - A router across four LLM backends (OpenRouter, NVIDIA NIM, Gemini, and a local Qwen 3.5 9B on Ollama); privacy-pinned and Hindi (Devanagari) turns stay on the local model.
   - A public v6.0.1 installer, 1,037 automated tests, and a cloud first token at p50 1.2 s.
2. **VYRO — low-footprint Windows hardware monitor** (Sep – Oct 2026)
   - A Rust sensor engine running as a Windows service (PawnIO driver modules, NVML/NVAPI/ADL), with a Tauri 2 + Svelte 5 app: animated gauges, 7-day history, alerts, game frame rates and fan control.
   - 0.46% CPU and ~125 MB of RAM with the window open (v0.2.0); an 11.6 MB installer; 11 releases in about three weeks, with auto-update.
3. **Multi-objective RL for reservoir control** (Jun 2026)
   - A custom Gymnasium environment (flood, supply, ecological flow); 8 PPO agents (Stable-Baselines3) trace a Pareto frontier against a rule-curve baseline.
   - The balanced agent cut the flood penalty from 82.4 to 1.7 and the supply deficit from 194.7 to 183.4 (100 episodes); the rule curve stays Pareto-optimal on ecology.
4. **Probabilistic forecasting with calibrated uncertainty** (May 2026)
   - Reproduced DeepAR (GluonTS) on Beijing PM2.5 over 5 seeds, against seasonal-naive, ARIMA and ETS, with proper scoring rules.
   - The most accurate model (CRPS 43.6 vs ARIMA 47.4) was also the most overconfident: its nominal 90% intervals covered 74%, and isotonic recalibration failed under the test period's shift.
5. **Closed-loop MLOps with drift-triggered retraining** (Apr 2026)
   - Evidently drift detection → retraining → an MLflow champion/challenger gate → a hot reload of the FastAPI service; Prometheus/Grafana monitoring; Docker and Kubernetes manifests.
   - Realized F1 recovered from 0.27 to 0.78 on unseen batches after a synthetic shift, with no human in the loop.
6. **Jainav Infotech platform** (Oct 2026)
   - A Next.js 16 + Payload CMS 3 company site and store: Razorpay checkout, GST invoices, Ed25519-signed licence tokens, English and Hindi, and about 355 automated tests.

**Resume note line** (under the Projects heading): "Recent projects are built AI-native: I write the specs, make the architecture decisions and test the results; Claude Code writes much of the implementation." Tanishq can remove this from the PDF; the site keeps the disclosure either way.

**Resume experience:** A.5. **Open source:** A.6 (two lines). **Skills:** A.11, condensed to one line per group.

---

# Appendix B — Chart data

Save as `content/data/*.json`: one file per top-level key. These values were extracted on 20 October 2026 from the public repos' committed result files.

```json
{
  "reservoir_rl": {
    "source": "github.com/nanu1605/reservoir-rl results/*.json (100 eval episodes, lower is better)",
    "rule_baseline": {"flood": [82.4, 29.1], "supply": [194.7, 10.0], "eco": [0.0, 0.0], "reward": -13.287},
    "pareto_agents": [
      {"name": "flood_focused", "seed": 42, "weights": [0.8, 0.1, 0.1], "flood": [0.0, 0.0], "supply": [269.2, 25.1], "eco": [22.9, 2.1]},
      {"name": "supply_focused", "seed": 43, "weights": [0.1, 0.8, 0.1], "flood": [28.6, 23.8], "supply": [137.9, 11.8], "eco": [17.9, 2.0]},
      {"name": "ecology_focused", "seed": 44, "weights": [0.1, 0.1, 0.8], "flood": [0.1, 0.7], "supply": [157.9, 15.8], "eco": [9.2, 1.5]},
      {"name": "balanced", "seed": 45, "weights": [0.34, 0.33, 0.33], "flood": [0.0, 0.0], "supply": [177.5, 15.1], "eco": [16.4, 1.9]},
      {"name": "flood_supply", "seed": 46, "weights": [0.45, 0.45, 0.1], "flood": [0.0, 0.0], "supply": [135.7, 12.4], "eco": [11.7, 1.6]},
      {"name": "supply_ecology", "seed": 47, "weights": [0.1, 0.45, 0.45], "flood": [4.2, 10.9], "supply": [141.2, 18.9], "eco": [15.4, 1.9]},
      {"name": "flood_ecology", "seed": 48, "weights": [0.45, 0.1, 0.45], "flood": [0.0, 0.0], "supply": [167.0, 20.7], "eco": [13.0, 1.7]},
      {"name": "mild_balanced", "seed": 49, "weights": [0.5, 0.3, 0.2], "flood": [0.5, 3.0], "supply": [142.2, 15.1], "eco": [10.3, 1.6]}
    ],
    "balanced_headline_seed42": {
      "nominal": {"flood": [1.7, 7.0], "supply": [183.4, 16.2], "eco": [22.2, 2.2], "reward": -13.091},
      "drier_climate": {"flood": [0.0, 0.0], "supply": [349.4, 18.9], "eco": [40.5, 2.9], "reward": -27.297},
      "drier_climate_definition": "inflow mean x0.8, noise x1.3, no retraining",
      "weights": [0.34, 0.33, 0.33]
    },
    "random_policy": {"flood": [582.9, 46.3], "supply": [467.5, 26.7], "eco": [52.0, 6.9], "reward": -99.195},
    "notes": ["Penalties are yearly sums, mean over 100 evaluation episodes (episode seeds 1000+i, shared by all policies); lower is better.", "Pareto agents use seed 42+i (i = sweep index). 'balanced_headline_seed42' is a separate single run with the same weights as the sweep's 'balanced' (seed 45); the two land at different points.", "Pareto-agent rewards were scored with each agent's own weights, so they are not comparable across agents and are omitted here."],
    "learning_curve_seed42": {
      "timesteps": [365.0, 4015.0, 7665.0, 11315.0, 14965.0, 18615.0, 22265.0, 25915.0, 29565.0, 33215.0, 36865.0, 40515.0, 44165.0, 47815.0, 51465.0, 55115.0, 58765.0, 62415.0, 66065.0, 69715.0, 73365.0, 77015.0, 80665.0, 84315.0, 87965.0, 91615.0, 95265.0, 98915.0, 102565.0, 106215.0, 109865.0, 113515.0, 117165.0, 120815.0, 124465.0, 128115.0, 131765.0, 135415.0, 139065.0, 142715.0, 146365.0, 150015.0, 151475.0],
      "episode_reward": [-116.88, -88.01, -89.16, -54.04, -58.98, -43.29, -24.3, -29.51, -23.15, -16.29, -18.0, -16.18, -21.48, -17.54, -20.0, -17.62, -17.08, -18.63, -16.5, -16.35, -24.06, -17.18, -15.41, -14.87, -15.25, -20.19, -21.27, -20.88, -14.01, -19.94, -15.55, -22.14, -23.1, -18.71, -18.17, -15.78, -15.89, -15.45, -16.86, -14.58, -13.82, -13.91, -13.47],
      "note": "Downsampled from results/single_ppo_results.json learning_curve; training-episode reward (random starting storage)."
    }
  },
  "probabilistic_forecasting": {
    "source": "github.com/nanu1605/probabilistic-forecasting metrics/*.json (test: Jan-Feb 2017, 59 x 24h windows; PM2.5 Aotizhongxin)",
    "levels": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    "table": [
      {"Model": "Seasonal Naive", "MAE": 88.475, "RMSE": 137.533, "CRPS": 68.353, "Cov@50": 0.4, "Cov@80": 0.679, "Cov@90": 0.786, "ECE": 0.084},
      {"Model": "ARIMA", "MAE": 59.937, "RMSE": 103.454, "CRPS": 47.418, "Cov@50": 0.554, "Cov@80": 0.741, "Cov@90": 0.804, "ECE": 0.072},
      {"Model": "ETS", "MAE": 61.267, "RMSE": 104.946, "CRPS": 47.487, "Cov@50": 0.656, "Cov@80": 0.839, "Cov@90": 0.879, "ECE": 0.109},
      {"Model": "DeepAR (raw)", "MAE": "59.70±2.67", "RMSE": "99.52±2.26", "CRPS": "43.62±1.75", "Cov@50": "0.35±0.03", "Cov@80": "0.62±0.04", "Cov@90": "0.74±0.04", "ECE": "0.13±0.03"},
      {"Model": "DeepAR (recalibrated)", "MAE": 57.667, "RMSE": 96.564, "CRPS": 42.871, "Cov@50": 0.378, "Cov@80": 0.656, "Cov@90": 0.797, "ECE": 0.098}
    ],
    "calibration_curves": {
      "seasonal_naive": [0.097, 0.169, 0.244, 0.326, 0.4, 0.472, 0.571, 0.679, 0.786],
      "arima": [0.187, 0.32, 0.405, 0.48, 0.554, 0.624, 0.677, 0.741, 0.804],
      "ets": [0.173, 0.34, 0.472, 0.58, 0.656, 0.72, 0.781, 0.839, 0.879],
      "deepar_seed_42": [0.065, 0.118, 0.177, 0.25, 0.313, 0.383, 0.474, 0.571, 0.679],
      "deepar_seed_123": [0.069, 0.131, 0.201, 0.261, 0.34, 0.409, 0.504, 0.592, 0.722],
      "deepar_seed_456": [0.066, 0.141, 0.21, 0.291, 0.376, 0.47, 0.558, 0.663, 0.768],
      "deepar_seed_789": [0.075, 0.136, 0.207, 0.279, 0.352, 0.429, 0.512, 0.615, 0.739],
      "deepar_seed_1337": [0.088, 0.167, 0.238, 0.311, 0.392, 0.478, 0.571, 0.677, 0.797]
    },
    "deepar_per_seed": {
      "42": {"crps": 46.207, "rmse": 100.273, "mae": 62.746, "ece": 0.163, "cov90": 0.679},
      "123": {"crps": 42.674, "rmse": 100.283, "mae": 58.259, "ece": 0.141, "cov90": 0.722},
      "456": {"crps": 45.055, "rmse": 101.381, "mae": 62.945, "ece": 0.106, "cov90": 0.768},
      "789": {"crps": 42.712, "rmse": 100.603, "mae": 58.223, "ece": 0.128, "cov90": 0.739},
      "1337": {"crps": 41.439, "rmse": 95.073, "mae": 56.31, "ece": 0.087, "cov90": 0.797}
    },
    "best_seed_curve_ece": 0.087,
    "per_horizon_ece_best_seed": {"1": 0.032, "6": 0.06, "12": 0.116, "24": 0.167},
    "recalibration_same_run": {
      "test_ece": [0.09, 0.098],
      "val_ece": [0.014, 0.016],
      "cov90": [0.804, 0.797],
      "crps": [42.048, 42.871],
      "width90": [156.2, 164.3],
      "oracle_test_fit_ece": 0.02
    },
    "winkler90": {"seasonal_naive": 690.8, "arima": 547.1, "ets": 514.1},
    "notes": ["ECE here = mean |nominal - observed| interval coverage over the 9 levels (not classifier ECE).", "DeepAR (raw) table row = mean ± sd over 5 seeds. The 'recalibrated' table row is ONE seed (1337) and must not be compared with the 5-seed mean; use recalibration_same_run for before/after.", "per_horizon_ece_best_seed and best_seed_curve_ece are for seed 1337 (lowest test CRPS)."]
  },
  "vyro": {
    "reference_pc": "AMD Ryzen 7 9700X, MSI B650M GAMING PLUS WIFI, 2x16 GB DDR5-5600, NVIDIA RTX 5060 Ti 8 GB, Windows 11",
    "footprint": [
      {"metric": "CPU, window visible", "target": "< 1.5%", "v0_1_4": "0.68%", "v0_2_0": "0.46%"},
      {"metric": "RAM, window visible", "target": "< 120 MB", "v0_1_4": "120 MB", "v0_2_0": "125 MB"},
      {"metric": "Startup to first data", "target": "< 2 s", "v0_1_4": "0.76 s", "v0_2_0": "1.02 s"},
      {"metric": "RAM, closed to tray", "target": "-", "v0_1_4": "~40 MB (service 33 + app 7)", "v0_2_0": "-"}
    ],
    "installer_mb": {"0.1.4": 9.5, "0.2.0": 9.7, "0.3.0": 9.9, "1.0.0": 11.3, "1.1.0": 11.4, "1.2.0": 11.4, "1.4.0": 11.6, "1.4.1": 11.6},
    "optimisations": [
      {"change": "WebView2 --in-process-gpu + 60 fps cap", "before": "RAM 131 MB, peak 208 MB, CPU 1.0%", "after": "RAM 120 MB, peak 132 MB, CPU 0.68%"},
      {"change": "History lists stored outside Svelte reactivity", "before": "History view JS heap 53.5 MB; highest total across tabs 295 MB", "after": "JS heap 8.6 MB; highest total 167 MB"}
    ],
    "releases": [
      {"v": "0.2.0", "date": "2026-10-13", "name": "Control", "what": "Fan and pump control"},
      {"v": "0.3.0", "date": "2026-10-15", "name": "Gaming", "what": "Game profiles, overlay 2.0, session replay"},
      {"v": "1.0.0", "date": "2026-10-16", "what": "All of V2"},
      {"v": "1.0.1", "date": "2026-10-16", "what": "Fixes"},
      {"v": "1.1.0", "date": "2026-10-17", "what": "New look, laptop 3-D model, desktop widgets"},
      {"v": "1.2.0", "date": "2026-10-17", "what": "Widget snapping and click-through, airflow view"},
      {"v": "1.4.0", "date": "2026-10-18", "what": "Phone app from anywhere (end-to-end encrypted), device names and batteries, Bluetooth, colour wheel"},
      {"v": "1.4.1", "date": "2026-10-20", "what": "Patch release"}
    ],
    "release_tags_total": 11,
    "note": "Footprint was formally recorded only for 0.1.4 and 0.2.0 (README); later releases were 'within target, not written down'. Earlier tags 0.1.2-0.1.4 have no recorded dates."
  },
  "jainav_platform": {
    "phases": [
      {"p": 0, "name": "Setup and guardrails"},
      {"p": 1, "name": "Content model and admin"},
      {"p": 2, "name": "Design system and motion"},
      {"p": 3, "name": "Public pages"},
      {"p": 4, "name": "Forms, leads and notifications"},
      {"p": 5, "name": "Signature animations and polish"},
      {"p": 6, "name": "Deploy pipeline and runbooks (server not set up yet)"},
      {"p": 7, "name": "Accounts, checkout and invoices (Razorpay test mode)"},
      {"p": 8, "name": "Licensing"},
      {"p": 9, "name": "Store operations"},
      {"p": 10, "name": "Store go-live", "status": "not started"}
    ],
    "built": "Spec dated 15 Oct 2026; phases 0-9 built 15-18 Oct 2026 (migrations 15-17 Oct; phase PRs opened 16-18 Oct).",
    "order_to_licence": ["Email-code sign-in (6 digits, 10-minute expiry, 5 attempts)", "Razorpay order + checkout", "Signature verified AND payment re-fetched from Razorpay", "Idempotent fulfilment in one transaction (reconciliation job every 15 min; paid-twice flagged)", "GST invoice PDF (CGST+SGST in Madhya Pradesh, IGST elsewhere)", "Licence key VYRO-XXXXX-XXXXX-XXXXX-XXXXX (stored as SHA-256 hash + AES-256-GCM copy), emailed", "App activation returns an Ed25519-signed token (2 devices, 14-day trial, 180-day grace, 12 months of updates)"]
  },
  "mlops_drift_loop": {
    "documented_levels": {"stale_champion_f1": 0.27, "after_promotion_f1": 0.78},
    "per_batch_series": "NOT YET EXPORTED - see spec §10.7: run the repo's `make experiment` with a one-line patch that writes `timeline` (list of {t, f1, version}) from src/mlops_drift/experiments/run.py to JSON. Never hand-draw intermediate points."
  }
}
```

---

# Appendix C — Fact sheet, sources and guardrails

## C.1 Metrics (seed `content/metrics.ts` from this table)

| id | Value | Label | Source |
|---|---|---|---|
| `oss.merged` | 16 | merged PRs to PEcAn and LitmusChaos | `https://github.com/search?q=author%3Ananu1605+is%3Apr+is%3Amerged+repo%3APecanProject%2Fpecan+repo%3Alitmuschaos%2Flitmus&type=pullrequests` |
| `oss.pecan` | 15 | merged PRs to PecanProject/pecan, opened Jul–Sep 2022 | same search, PEcAn only |
| `oss.litmus` | #4186 | merged 27 Oct 2023 | https://github.com/litmuschaos/litmus/pull/4186 |
| `bosch.years` | 1.5 years | Jul 2023 – Jan 2025 | resume |
| `bosch.deploy` | −60% | deployment time, after CI/CD pipelines | resume |
| `bosch.availability` | +20% | availability | resume |
| `bosch.scalability` | +30% | scalability (Docker + Kubernetes autoscaling) | resume |
| `bosch.manual` | −60% | manual intervention | resume |
| `bosch.build` | −40% | build time (Jenkins plugin + automation) | resume |
| `bosch.hours` | ~20 h/week | operational effort saved (stated for each of the two initiatives) | resume |
| `baby.version` | 6.0.1 | latest release, 2026-09-04 (live value, §4.3) | https://github.com/nanu1605/baby/releases |
| `baby.tests` | 1,037 | automated tests (pytest) at v6.0.1 | baby repo, `DECISIONS.md` #155 |
| `baby.tools` | 22 | tools | baby repo, `tools/` |
| `baby.brains` | 4 | model backends | baby `README.md` |
| `baby.firstToken` | p50 1.2 s · p95 4.0 s | cloud first token, GPT-4o-mini via OpenRouter | baby `bench_results/openrouter/REPORT.md` |
| `baby.stt` | ~5.5 s | speech-to-text per utterance (large-v3-turbo, CPU, int8) | baby `DECISIONS.md` #42, CHANGELOG |
| `baby.sttSmall` | 1.4 s | speech-to-text with the `small` model | baby CHANGELOG (Phase 3) |
| `baby.vram` | 7.99 of 8 GB | local 9B VRAM in use | baby `DECISIONS.md` #42, #48 |
| `baby.gameMode` | ~5.5 GB | VRAM freed by game mode | baby CHANGELOG (N3) |
| `baby.installer` | 19 MB | installer size, v6.0.1 (19,046,592 bytes) | GitHub release |
| `baby.shell` | 1.7 MB vs ~85 MB; 280 vs 469 ms | Tauri vs Electron: installer size; cold start | baby `DECISIONS.md` #121 |
| `baby.safetyCases` | 65 | safety-gate test cases (20 allow, 22 confirm, 23 deny) | baby `tests/test_safety.py` |
| `baby.decisions` | 155 | logged decisions | baby `DECISIONS.md` |
| `baby.models` | 12 | models benchmarked (7 NVIDIA NIM + 5 OpenRouter) | baby `bench_results/` |
| `baby.soak` | 0 of 45 | routed attempts served by NVIDIA NIM (then the primary) on soak day 1, due to congestion | baby `DECISIONS.md` #83 |
| `baby.bargein` | ~100 ms | time for playback to stop on barge-in | baby CHANGELOG |
| `vyro.version` | 1.4.1 | latest release, 20 Oct 2026 IST (live value, §4.3) | https://github.com/nanu1605/vyro-releases/releases |
| `vyro.inapp` | 0.7–1.7% · 246–270 MB | in-app status bar, 1.7 development build, 4K display (3-D view: 5.5% · 341 MB) | screenshots captured 20 Oct 2026 (`assets/source/screens/vyro/`) |
| `vyro.cpu` | 0.46% | CPU with the window open (v0.2.0) | vyro `README.md` |
| `vyro.ram` | ~125 MB | RAM with the window open (v0.2.0; 120 MB at v0.1.4) | vyro `README.md` |
| `vyro.startup` | 0.76–1.02 s | startup to first data (v0.1.4–0.2.0) | vyro `README.md` |
| `vyro.installer` | 11.6 MB | installer, v1.4.1 (live value from the release asset, §4.3) | https://github.com/nanu1605/vyro-releases/releases/tag/v1.4.1 |
| `vyro.poll` | ~9 ms | cost of one poll | vyro `ROADMAP.md` |
| `vyro.releases` | 11 | public releases, 0.1.2 → 1.4.1 | vyro-releases tags |
| `vyro.views` | 18 | views | vyro `src/nav.ts` |
| `vyro.themes` | 6 | themes, all WCAG AA | vyro `README.md` |
| `vyro.tests` | 614 + 132 | Rust core + frontend tests at the V2 milestone | vyro `ROADMAP.md` |
| `vyro.axe` | 664 | automated accessibility checks in CI (v1.4) | vyro `ROADMAP.md` |
| `vyro.tsTypes` | 201 | TypeScript type files generated from Rust | vyro `README.md` |
| `jainav.tests` | ~355 | 142 unit, 158 integration, 49 end-to-end, 6 smoke | jainav-infotech `tests/` |
| `jainav.js` | ~175 KB | initial JS, gzipped (measured 175–178 KB) | jainav-infotech `docs/decisions.md` |
| `jainav.lighthouse` | 89–95 / 100 / 96 / 100 | Lighthouse perf / a11y / best practices / SEO (local) | jainav-infotech `docs/decisions.md` |
| `jainav.size` | ~34k lines · 28 endpoints · 32 routes | codebase size | jainav-infotech repo (counted) |
| `jainav.spec` | ~1,000 lines | the build spec (976 lines) | `JAINAV_WEBSITE_SPEC.md` |
| `jainav.image` | ~360 MB | Docker image | jainav-infotech `docs/decisions.md` |
| `rl.flood` | 82.4 → 1.7 | flood penalty, rule curve → balanced PPO (seed 42) | reservoir-rl `README.md`, `results/shift_results.json` |
| `rl.supply` | 194.7 → 183.4 | supply deficit, rule curve → balanced PPO | same |
| `rl.eco` | 0.0 vs 22.2 | ecological deficit, rule curve vs balanced PPO | same |
| `rl.agents` | 8 | PPO agents (objective weightings) | `results/pareto_results.json` |
| `rl.steps` | 150k | training steps per agent | `configs/config.yaml` |
| `rl.dry` | supply 183.4 → 349.4; eco 22.2 → 40.5 | the drier-climate stress test | `results/shift_results.json` |
| `rl.tests` | 37 | tests | reservoir-rl `tests/` |
| `fc.crps` | 43.6 vs 47.4 | CRPS, DeepAR (5-seed mean) vs ARIMA | probabilistic-forecasting `metrics/full_results_table.json` |
| `fc.rmse` | 99.5 vs 103.5 | RMSE, DeepAR vs ARIMA | same |
| `fc.cov90` | 74% | coverage of nominal 90% intervals (DeepAR, 5-seed mean) | `metrics/deepar_results.json` |
| `fc.ece` | 0.125 | ECE, DeepAR 5-seed mean (± 0.027) | same |
| `fc.horizon` | 0.032 → 0.167 | ECE at 1 h vs 24 h (best seed) | `metrics/calibration_results.json` |
| `fc.recal` | 0.090 → 0.098 | test ECE before → after recalibration (same run) | `metrics/recalibration_results.json` |
| `fc.oracle` | 0.020 | ECE with a diagnostic fit on the test period | same |
| `fc.data` | 35,064 rows · 59 windows · 5 seeds | the setup | repo `README.md` |
| `fc.tests` | 50 | tests | repo `tests/` |
| `mlops.f1` | 0.27 → 0.78 | realized F1, stale champion → after automatic promotion (unseen batches) | mlops-drift-retrain `experiments/drift_experiment.md` |
| `mlops.base` | 0.576 | random-forest F1 in distribution | `metrics/train_metrics.json` |
| `mlops.lr` | 0.688 | logistic-regression F1 at baseline (reference only) | mlops-drift-retrain `CHANGELOG.md` |
| `mlops.tests` | 54 | tests | repo `tests/` |
| `vdr.team` | 3 | team size; Tanishq was lead | resume |
| `mch.services` | 3 | service lines (mental health, dietetics, Ayurveda) | resume |
| `mm.priceFrom` | ₹399/month | MenuMesh plans from (Starter, before 18% GST; pre-launch) | https://staging.menumesh.in/pricing |
| `mm.trial` | 14 days | free trial on the Growth plan | same |
| `mm.plans` | ₹399 · ₹899 · ₹1,799 | Starter · Growth · Pro, a month, before GST | same |

## C.2 Source links

| Source | Link |
|---|---|
| Resume (Google Doc) | https://docs.google.com/document/d/1Brzlx9iTvOJkOTJm1nc_OyoZGDR4ndpp4a5EQb0Lj1o |
| Old portfolio | https://tanishq-jain-portfolio.vercel.app (repo `nanu1605/my-portfolio`) |
| MenuMesh (staging) | https://staging.menumesh.in (home, `/pricing`, `/demo`, `/hi`), read 20 Oct 2026 |
| Screens | `assets/source/screens/manifest.json` (VYRO and Baby captured 20 Oct 2026) |
| GitHub repos | `nanu1605/baby` (branch `master`)<br>`nanu1605/vyro` (`main`)<br>`nanu1605/vyro-releases`<br>`nanu1605/jainav-infotech` (`main`)<br>`nanu1605/reservoir-rl` (`main`)<br>`nanu1605/probabilistic-forecasting` (`main`)<br>`nanu1605/mlops-drift-retrain` (`master`)<br>`nanu1605/Virtual-Dressing-Room` (`main`) |
| GSoC report | https://medium.com/@tanishqjain010/gsoc-2022-pecan-in-cran-final-report-4ef45b55df75 |

## C.3 Don't claim (older sources say these; the code doesn't back them up)
- **Baby:**
  - "~1–2.5 s per utterance" speech recognition. The measured figure is ~5.5 s.
  - "16 tools". It has 22.
  - "16/16 end-to-end" as the headline. One check passed only through an exemption; use 1,037 tests instead.
  - Speaker verification as a working feature.
  - "Fits in 8 GB VRAM including speech". Speech runs on the CPU.
- **VYRO:**
  - Any price for a Pro edition.
  - "Code-signed".
  - Footprint numbers attributed to 1.x releases.
- **MLOps:**
  - "~0.83 F1" or "0.946 F1". Both overlap the training data.
  - A live demo URL. None exists.
- **Forecasting:** "recalibration improved MAE 59.7 → 57.7" (it mixes two runs), or any comparison of the one-seed recalibrated row with the 5-seed mean.
- **Reservoir RL:**
  - Mixing the seed-42 and seed-45 "balanced" numbers without saying so.
  - Describing the flood term as covering "excessive release".
- **Virtual Dressing Room:**
  - "AR", "3-D", "Haar cascades", or "implemented in TensorFlow".
  - Training the models.
  - Any dataset images, or photos of other people.
- **Attendance System:** facial recognition.
- **Rain Forecast:** "linear regression". It uses auto-ARIMA.
- **The old site's percentages:**
  - "30% better maintainability", "40% less maintenance overhead" and "40% faster downloads" (GSoC);
  - "+25% deployment accuracy", "+35% task completion", "zero data breaches", "40 h/month" and "15 h/week" (Bosch).

  Use them only if Tanishq confirms them.
- **"Certified Ethical Hacker (CEH)".** That's EC-Council's credential, not a Udemy course.
- **Personal output:** line counts, test counts or commit counts presented as hand-written work, and any claim that code was hand-written.
- **Private details:** the street address and personal phone number.

## C.4 Verify before publishing
1. **VYRO download URL.** Confirm that `https://github.com/nanu1605/vyro-releases/releases` (or `/latest`) lists the latest MSI (1.4.1 on 20 Oct 2026).
2. **Forecasting test windows.** Check how `src/probforecast/evaluation/rolling.py` builds each test window's history. If it skips the validation period, the test-period "shift" explanation should mention it (this affects all models equally). Adjust A.4.6 if needed, and record the result.
3. **The VYRO repo's visibility.** It is public now, though an older roadmap said private. Confirm Tanishq wants it linked.
4. **F1 Insights.** Is `f1insights.vercel.app` still working now that the Ergast API is retired? Link the repo only, unless it works.
5. **MenuMesh.** Re-check pricing and features on menumesh.in at launch. They were captured from staging on 20 Oct 2026.
6. **Jainav Infotech.** That support@jainavinfotech.in receives mail; flip `jainavLive` when the site is up.
7. **Bosch.** Whether to include the docs-as-code track (the title is confirmed: Associate Software Engineer).
