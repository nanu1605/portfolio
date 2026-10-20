# tanishq.website

Portfolio of Tanishq Jain, built from [`PORTFOLIO_SPEC.md`](PORTFOLIO_SPEC.md). Progress is tracked in [`PROGRESS.md`](PROGRESS.md) and choices in [`docs/decisions.md`](docs/decisions.md).

Requires Node 24 and pnpm.

```bash
pnpm install
pnpm dev
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:tokens`, `pnpm check:content`, `pnpm build`, `pnpm test:e2e`. After a build, `pnpm exec lhci autorun` checks Home against the §13 Lighthouse budgets (it needs Chrome and a free port 3000).

Content lives in `content/` and is validated with Zod; `pnpm check:content` runs the cross-checks and prints the `{{PLACEHOLDER}}` report. After changing the photo, screens or videos in `assets/source/`, run `pnpm images` and commit `public/media/` and `content/generated/media.json`.

Every component and motion primitive renders at `/styleguide` (run `pnpm dev` and open it). It is built everywhere so the e2e tests can use it, and returns 404 in Vercel production.
