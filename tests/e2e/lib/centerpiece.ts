import { expect, type Locator, type Page } from "@playwright/test";

// Shared checks for the §10 centerpieces (docs/cross-device.md §8 Phase 5):
// the lazy chunk stays within 60 KB gzipped, the poster swap shifts nothing,
// and interaction causes no long tasks.

type Win = typeof window & {
  __shift: number;
  __long: number[];
  __events: number[];
};

/**
 * Call before page.goto. Starts counting layout shifts, long tasks and
 * event durations; the helpers below read and reset them.
 */
export async function observe(page: Page) {
  await page.addInitScript(() => {
    const w = window as Win;
    w.__shift = 0;
    w.__long = [];
    w.__events = [];
    const watch = (type: string, take: (e: PerformanceEntry) => void) => {
      try {
        new PerformanceObserver((list) =>
          list.getEntries().forEach(take),
        ).observe({
          type,
          buffered: true,
          durationThreshold: 16,
        } as PerformanceObserverInit);
      } catch {
        // Not every engine has every entry type (longtask, event: Chromium).
      }
    };
    watch("layout-shift", (e) => {
      const s = e as PerformanceEntry & {
        value: number;
        hadRecentInput: boolean;
      };
      if (!s.hadRecentInput) w.__shift += s.value;
    });
    watch("longtask", (e) => w.__long.push(e.duration));
    watch("event", (e) => w.__events.push(e.duration));
  });
}

/** 4× CPU throttling, like a mid-range phone (Chromium only). */
export async function throttle(page: Page, rate = 4) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  return () => cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
}

const jsBytes = (page: Page) =>
  page.evaluate(() =>
    (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
      .filter((r) => new URL(r.name).pathname.endsWith(".js"))
      .map((r) => ({ url: r.name, bytes: r.encodedBodySize })),
  );

/**
 * Scrolls the centerpiece into view and waits for its live version (`ready`
 * appears only there). Returns the JS fetched for it and the layout shift
 * the swap caused.
 */
export async function goLive(page: Page, root: Locator, ready: Locator) {
  await page.waitForLoadState("load");
  const before = new Set((await jsBytes(page)).map((r) => r.url));
  await page.evaluate(() => ((window as Win).__shift = 0));
  // A plain scroll: Playwright's scrollIntoViewIfNeeded waits for the box
  // to be stable, which Lenis on desktop Firefox can keep it from being.
  await root.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await expect(ready).toBeVisible();
  // Two frames, so a late shift from the swap is counted.
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  const chunks = (await jsBytes(page)).filter((r) => !before.has(r.url));
  const shift = await page.evaluate(() => (window as Win).__shift);
  return {
    chunks,
    bytes: chunks.reduce((sum, c) => sum + c.bytes, 0),
    shift,
  };
}

/** Runs `act` and returns the longest task and the slowest event it caused. */
export async function during(page: Page, act: () => Promise<void>) {
  await page.evaluate(() => {
    const w = window as Win;
    w.__long = [];
    w.__events = [];
  });
  await act();
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  return page.evaluate(() => {
    const w = window as Win;
    return {
      longest: Math.max(0, ...w.__long),
      slowestEvent: Math.max(0, ...w.__events),
    };
  });
}
