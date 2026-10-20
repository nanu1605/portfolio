import { expect, test, type Page } from "@playwright/test";

// Budgets from §13 and docs/cross-device.md §8, on the perf projects only.
// perf-phone runs with the CPU throttled 4x, like a mid-range phone.

const isPhone = (name: string) => name === "perf-phone";

async function throttle(page: Page, name: string) {
  if (!isPhone(name)) return;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}

test("Home's first-load JS is at most 150 KB gzipped", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.waitForLoadState("load");
  // Every JS file fetched by the load event, whether a <script> or a
  // <link rel="preload"> started it; lazy chunks come later.
  const scripts = await page.evaluate(() => {
    const [nav] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    return (
      performance.getEntriesByType("resource") as PerformanceResourceTiming[]
    )
      .filter(
        (r) =>
          new URL(r.name).pathname.endsWith(".js") &&
          r.startTime <= nav!.loadEventStart,
      )
      .map((r) => ({
        url: new URL(r.name).pathname,
        bytes: r.encodedBodySize,
      }));
  });
  const total = scripts.reduce((sum, s) => sum + s.bytes, 0);
  await testInfo.attach("home-js.json", {
    body: JSON.stringify({ total, scripts }, null, 2),
    contentType: "application/json",
  });
  expect(total).toBeGreaterThan(0);
  // 150 KB, read as 150,000 bytes (the stricter reading).
  expect(total).toBeLessThanOrEqual(150_000);
});

test("scrolling Home causes no layout shift", async ({ page }, testInfo) => {
  await throttle(page, testInfo.project.name);
  await page.addInitScript(() => {
    const w = window as typeof window & { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      })[])
        if (!entry.hadRecentInput) w.__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  const cls = await page.evaluate(async () => {
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 300) {
      window.scrollTo({ top: y, behavior: "instant" });
      await frame();
    }
    await new Promise((r) => setTimeout(r, 500));
    return (window as typeof window & { __cls: number }).__cls;
  });
  expect(cls).toBeLessThan(0.05);
});

// Lighthouse's mobile viewport and the iPhone SE (cross-device §8).
for (const viewport of [
  { width: 412, height: 823 },
  { width: 375, height: 667 },
]) {
  test(`records the LCP element at ${viewport.width}×${viewport.height}`, async ({
    page,
  }, testInfo) => {
    test.skip(!isPhone(testInfo.project.name), "phone viewports");
    await throttle(page, testInfo.project.name);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForLoadState("load");
    const lcp = await page.evaluate(
      () =>
        new Promise<{
          element: string;
          inHero: boolean;
          size: number;
          time: number;
        }>((resolve) =>
          new PerformanceObserver((list) => {
            const entry = list.getEntries().at(-1) as PerformanceEntry & {
              element: Element | null;
              size: number;
            };
            const el = entry.element;
            resolve({
              element: el
                ? `${el.tagName.toLowerCase()} ${el.textContent?.trim().slice(0, 40) || el.getAttribute("src") || ""}`
                : "(removed)",
              inHero: !!el?.closest("[data-hero]"),
              size: entry.size,
              time: Math.round(entry.startTime),
            });
          }).observe({ type: "largest-contentful-paint", buffered: true }),
        ),
    );
    await testInfo.attach(`lcp-${viewport.width}x${viewport.height}.json`, {
      body: JSON.stringify(lcp, null, 2),
      contentType: "application/json",
    });
    // The LCP is in the hero: the photo or its text.
    expect(lcp.inHero, lcp.element).toBe(true);
  });
}
