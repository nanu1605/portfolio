import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { metrics } from "../../content/metrics";
import series from "../../content/data/mlops-timeline.json";
import { during, goLive, observe, throttle } from "./lib/centerpiece";

// §10.7 "Watch it recover": the per-batch F1 line draws with scroll (pinned
// from 768 × 600, unpinned below), the loop lights at the tick, and the
// chart reads by key and tap (docs/cross-device.md §6 and §8, Phase 5).

// No traces: tracing snapshots the DOM around every action, which the
// throttled budget test would count as long tasks of its own.
test.use({ trace: "off" });

const slug = "mlops-drift-loop";
const url = `/work/${slug}`;
const points = series.timeline;
const tick = points.findIndex((b) => b.t === series.promoted_t);
const isTouch = (t: TestInfo) => !t.project.name.startsWith("desktop-");

async function open(page: Page) {
  await observe(page);
  await page.goto(url);
  const root = page.locator(`[data-centerpiece="${slug}"]`);
  const live = await goLive(
    page,
    root,
    page.locator(`[data-centerpiece="${slug}"][data-ready]`),
  );
  return {
    root,
    live,
    slider: root.getByRole("slider"),
    readout: root.locator("[data-readout]"),
  };
}

type Sample = {
  batch: string;
  nodes: string[];
  svgTop: number;
  svgBottom: number;
  pinned: boolean;
};

/**
 * Scrolls through the chart's track from just below the viewport to just
 * past it, `by` px at a time, and records what the chart shows at each stop.
 */
const scrub = (page: Page, by: number) =>
  page.evaluate(
    async ({ by, last }) => {
      const frame = () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );
      const track = document.querySelector(".mlops-track")!;
      const pin = document.querySelector<HTMLElement>(".mlops-pin")!;
      const svg = document.querySelector(".mlops-plot")!;
      const readout = document.querySelector<HTMLElement>("[data-readout]")!;
      const t = track.getBoundingClientRect();
      // Wholly below the viewport first: a chart that was on screen when
      // it loaded stays final until it has left.
      const from = t.top + scrollY - innerHeight - 1;
      const to = t.bottom + scrollY;
      const out: Sample[] = [];
      for (let y = from; y <= to; y += by) {
        window.scrollTo({ top: y, behavior: "instant" });
        await frame();
        await frame();
        const s = svg.getBoundingClientRect();
        out.push({
          batch: readout.dataset.readout ?? "",
          nodes: [...document.querySelectorAll<HTMLElement>("[data-node]")].map(
            (n) => n.dataset.state ?? "",
          ),
          svgTop: s.top,
          svgBottom: s.bottom,
          pinned: getComputedStyle(pin).position === "sticky",
        });
        if (readout.dataset.readout === last) break;
      }
      return out;
    },
    { by, last: String(points.length) },
  );

const START = ["on", "on", "off", "off", "off", "off"];
const END = ["on", "on", "done", "done", "done", "done"];

test("the poster is the final state, server-rendered", async ({ request }) => {
  const html = await (await request.get(url)).text();
  expect(html.match(/data-point="/g)).toHaveLength(points.length);
  expect(html).toContain(`data-readout="${points.length}"`);
  expect(html).toContain("Serving v2, the promoted challenger.");
});

test("loads within budget and swaps without a shift", async ({
  page,
}, testInfo) => {
  const { live, slider } = await open(page);
  await testInfo.attach("mlops-load", {
    body: JSON.stringify({ bytes: live.bytes, shift: live.shift }, null, 2),
    contentType: "application/json",
  });
  expect(live.bytes).toBeGreaterThan(0);
  expect(live.bytes).toBeLessThanOrEqual(60_000);
  expect(live.shift).toBeLessThan(0.001);
  await expect(slider).toHaveAttribute("aria-valuemax", String(points.length));
});

test("a chart on screen when it loads stays final until it leaves", async ({
  page,
}) => {
  // goLive brings the chart to mid-screen before its chunk mounts.
  const { readout } = await open(page);
  await page.evaluate(async () => {
    scrollBy({ top: 40, behavior: "instant" });
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
  await expect(readout).toHaveAttribute("data-readout", String(points.length));
});

test("the line draws with scroll and the loop lights at the tick", async ({
  page,
}) => {
  await open(page);
  const header = await page.evaluate(() =>
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
    ),
  );
  const { width, height } = page.viewportSize()!;
  const pinned = width >= 768 && height >= 600;
  const samples = await scrub(page, pinned ? 24 : 12);
  // Drawing moves nothing else (observe() counts shifts from goLive on).
  expect(
    await page.evaluate(() => (window as { __shift?: number }).__shift),
  ).toBeLessThan(0.001);

  // Nothing drawn before the chart comes in; Serve and Monitor run.
  expect(samples[0]!.batch).toBe("");
  expect(samples[0]!.nodes).toEqual(START);
  // Batches only ever advance, one scroll direction, to the last.
  const batches = samples.map((s) => Number(s.batch || 0));
  expect(batches).toEqual([...batches].sort((a, b) => a - b));
  expect(batches.at(-1)).toBe(points.length);

  // At the tick the line holds on the last v1 batch while Detect lights,
  // before Reload; once v2's first batch is drawn the loop is back at Serve.
  const lastV1 = String(tick + 1);
  const holding = samples.filter((s) => s.batch === lastV1);
  expect(holding.some((s) => s.nodes[2] === "on" && s.nodes[5] === "off")).toBe(
    true,
  );
  expect(holding[0]!.nodes).toEqual(START);
  const after = samples.find((s) => Number(s.batch) > tick + 1)!;
  expect(after.nodes).toEqual(END);

  const done = samples.at(-1)!;
  if (pinned) {
    // Pinned the whole way: the plot doesn't move while the line draws.
    expect(done.pinned).toBe(true);
    const drawing = samples.filter(
      (s) => s.batch && Number(s.batch) < points.length,
    );
    expect(new Set(drawing.map((s) => Math.round(s.svgTop))).size).toBe(1);
  } else {
    // Not pinned; it finishes while the plot is fully in view.
    expect(done.pinned).toBe(false);
    expect(done.svgTop).toBeGreaterThanOrEqual(header);
    expect(done.svgBottom).toBeLessThanOrEqual(height);
  }
});

test("keys step through the batches; a tap or click reads one", async ({
  page,
}, testInfo) => {
  const { root, slider, readout } = await open(page);
  // Clear of the sticky header, so focus has no reason to scroll.
  await slider.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await slider.focus();
  const y = await page.evaluate(() => window.scrollY);
  const f1 = (i: number) => points[i]!.f1.toFixed(2);

  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuenow", "1");
  await expect(readout).toContainText(`Batch 01`);
  await expect(readout).toContainText(`F1 ${f1(0)}`);
  await expect(readout).toContainText("v1");
  for (let i = 0; i <= tick; i++) await page.keyboard.press("ArrowRight");
  const first = tick + 1; // v2's first batch
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    `Batch ${first + 1} of ${points.length}: F1 ${f1(first)}, v2, promoted challenger`,
  );
  await expect(readout).toContainText(`F1 ${f1(first)}`);
  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute("aria-valuenow", String(points.length));
  await expect(readout).toContainText(`F1 ${f1(points.length - 1)}`);
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
  // The loop says where it is, politely, once something has moved.
  await expect(root.locator('[aria-live="polite"]')).toHaveText(
    "Serving v2, the promoted challenger. The loop is back at Serve.",
  );

  const point = root.locator('[data-point="10"]');
  if (isTouch(testInfo)) await point.tap();
  else await point.click();
  await expect(slider).toHaveAttribute("aria-valuenow", "10");
  await expect(readout).toContainText(`F1 ${f1(9)}`);
});

test("View data lists every batch, the events and the provenance", async ({
  page,
}) => {
  await page.goto(url);
  const details = page.locator("details", {
    has: page.locator("caption", { hasText: series.commit }),
  });
  // Mid-viewport, clear of the header as it slides away.
  const summary = details.locator("summary");
  await summary.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await summary.click();
  await expect(details).toHaveAttribute("open", "");
  const table = details.getByRole("table");
  await expect(table.locator("caption")).toContainText(
    `commit ${series.commit}, exported 20 Oct 2026`,
  );
  const rows = table.locator("tbody tr");
  await expect(rows).toHaveCount(points.length);
  for (const [i, b] of points.entries()) {
    const cells = rows.nth(i).locator("td, th");
    await expect(cells.nth(0)).toHaveText(String(i + 1));
    await expect(cells.nth(2)).toHaveText(b.f1.toFixed(3));
    await expect(cells.nth(3)).toHaveText(
      b.version === "1" ? "v1 · Stale champion" : "v2 · Promoted challenger",
    );
  }
  await expect(rows.nth(tick)).toContainText("Drift detected");
  await expect(rows.nth(tick)).toContainText("challenger promoted");
  await expect(
    page.locator("figure", { hasText: "Synthetic data" }).getByRole("link", {
      name: "Source",
    }),
  ).toHaveAttribute("href", metrics["mlops.f1"].source);
});

test("reduced motion: the final state at once, nothing pins or moves", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { root, readout } = await open(page);
  // From the top of the chart's track to its foot, it stays final.
  for (const block of ["start", "end"] as const) {
    await root.evaluate(
      (el, block) => el.scrollIntoView({ block, behavior: "instant" }),
      block,
    );
    await expect(readout).toHaveAttribute(
      "data-readout",
      String(points.length),
    );
    await expect(root.locator("[data-point].opacity-0")).toHaveCount(0);
    expect(
      await root
        .locator("[data-node]")
        .evaluateAll((n) => n.map((e) => (e as HTMLElement).dataset.state)),
    ).toEqual(END);
  }
  const pin = page.locator(".mlops-pin");
  expect(await pin.evaluate((el) => getComputedStyle(el).position)).toBe(
    "static",
  );
  expect(
    await root.evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test("no sideways scroll at 360 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await open(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

test.describe("budget at 4× CPU throttle", { tag: "@budget" }, () => {
  test.describe.configure({ retries: 1 });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== "chromium", "long tasks and event timing");
  });

  test("scrubbing and stepping", async ({ page }, testInfo) => {
    const { slider, live } = await open(page);
    const reset = await throttle(page);
    const numbers = await during(page, async () => {
      await scrub(page, 30);
      await slider.focus();
      for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Home");
      await page.keyboard.press("End");
    });
    await reset();
    await testInfo.attach("mlops-budget", {
      body: JSON.stringify({ ...numbers, bytes: live.bytes }, null, 2),
      contentType: "application/json",
    });
    expect(numbers.longest).toBeLessThan(50);
    expect(numbers.slowestEvent).toBeLessThan(200);
    expect(live.bytes).toBeLessThanOrEqual(60_000);
  });
});
