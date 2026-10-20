import { expect, test, type Locator, type Page } from "@playwright/test";
import { mlopsLoop } from "../../content/charts";
import { during, goLive, observe, throttle } from "./lib/centerpiece";

// §10.10 Home bento micro-demos (docs/cross-device.md §3): they play once on
// hover or keyboard focus with a fine pointer, once at half in view on
// touch, and hold the final frame, which is also what shows before they
// play and under reduced motion.

const isTouch = (name: string) => !name.startsWith("desktop-");
const tiles = (page: Page) => page.locator("#work [data-demo]");
const tile = (page: Page, slug: string) =>
  tiles(page).filter({ has: page.locator(`a[href="/work/${slug}"]`) });

type Run = { name: string; state: string; time: number };

/** The micro-demo animations in a tile (not its hover transitions). */
const runs = (el: Locator) =>
  el.evaluate((node) =>
    node
      .getAnimations({ subtree: true })
      .filter((a): a is CSSAnimation => "animationName" in a)
      .filter((a) => a.animationName.startsWith("demo-"))
      .map((a) => ({
        name: a.animationName,
        state: a.playState,
        time: Number(a.currentTime ?? 0),
      })),
  ) as Promise<Run[]>;

const running = async (el: Locator) =>
  (await runs(el)).filter((r) => r.state === "running").length;

/** The drawn frame: curves drawn, dots shown, the pulse ring gone. */
const finalFrame = (el: Locator) =>
  el.evaluate((node) =>
    [...node.querySelectorAll<SVGElement | HTMLElement>(".demo-a")].map(
      (part) => {
        const s = getComputedStyle(part);
        const dashed = part.getAttribute("pathLength") === "1";
        return {
          opacity: s.opacity,
          dash: dashed ? parseFloat(s.strokeDashoffset) : 0,
        };
      },
    ),
  );

/** Opens Home at the bento, with the mouse away from it. */
async function toWork(page: Page) {
  await page.goto("/");
  await page.mouse.move(0, 0);
  await page.locator("#work").evaluate((el) => el.scrollIntoView());
  await expect(tiles(page)).toHaveCount(6);
}

test("six decorative demos; only the documented MLOps levels are numbers", async ({
  page,
}) => {
  await page.goto("/");
  await expect(tiles(page)).toHaveCount(6);
  for (const t of await tiles(page).all()) {
    // Decorative: hidden from assistive tech; the tile's text carries it.
    await expect(
      t.locator('[aria-hidden="true"]:has(.demo-a)').first(),
    ).toBeAttached();
  }
  const numbers = await page
    .locator("#work [aria-hidden='true'] text")
    .evaluateAll((els) =>
      els.map((e) => e.textContent ?? "").filter((s) => /\d/.test(s)),
    );
  const f1 = mlopsLoop.documented_levels;
  expect(numbers).toEqual([
    String(f1.stale_champion_f1),
    String(f1.after_promotion_f1),
  ]);
});

test("before anything plays, every demo shows its final frame", async ({
  page,
}, testInfo) => {
  test.skip(isTouch(testInfo.project.name), "touch plays on scroll");
  await toWork(page);
  for (const t of await tiles(page).all()) {
    expect(await runs(t)).toEqual([]);
    for (const part of await finalFrame(t)) {
      expect(part.dash).toBe(0);
    }
  }
  // The fine-pointer path never uses the in-view trigger.
  await expect(page.locator("[data-demo-play]")).toHaveCount(0);
});

/** Waits until no reveal or demo is running and the page is idle. */
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
  await page.evaluate(
    () =>
      new Promise((r) =>
        (window.requestIdleCallback ?? setTimeout)(() => r(null), {
          timeout: 1_000,
        }),
      ),
  );
}

test("a hover at 4x CPU throttling has no long task", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    isTouch(testInfo.project.name) || browserName !== "chromium",
    "long tasks and event timing are Chromium only",
  );
  await observe(page);
  await toWork(page);
  const t = tile(page, "probabilistic-forecasting");
  await t.scrollIntoViewIfNeeded();
  // A first hover elsewhere warms the pointer effects up.
  await tile(page, "mlops-drift-loop").hover();
  await page.mouse.move(0, 0);

  // Best of three, so a busy test machine doesn't decide it. Each try is a
  // raw pointer move, so Playwright's own hit-testing isn't timed.
  const box = (await t.boundingBox())!;
  const tries: { longest: number; slowestEvent: number }[] = [];
  for (let i = 0; i < 3; i++) {
    await settle(page);
    const stop = await throttle(page);
    tries.push(
      await during(page, () =>
        page.mouse.move(box.x + box.width / 2, box.y + box.height / 2),
      ),
    );
    await stop();
    await page.mouse.move(0, 0);
    if (tries.at(-1)!.longest < 50) break;
  }
  await testInfo.attach("hover-timing.json", {
    body: JSON.stringify(tries),
    contentType: "application/json",
  });
  const best = tries.reduce((a, b) => (b.longest < a.longest ? b : a));
  expect(best.longest).toBeLessThan(50);
  expect(best.slowestEvent).toBeLessThan(200);
});

test("hover plays a demo once from the start, and again on the next hover", async ({
  page,
}, testInfo) => {
  test.skip(isTouch(testInfo.project.name), "hover needs a fine pointer");
  await observe(page);
  await toWork(page);
  const t = tile(page, "probabilistic-forecasting");
  await t.scrollIntoViewIfNeeded();
  await settle(page);
  await page.evaluate(() => {
    (window as typeof window & { __shift: number }).__shift = 0;
  });

  await t.hover();
  expect(await running(t)).toBeGreaterThan(0);
  // One pass, then it holds the drawn frame.
  await expect
    .poll(async () => (await runs(t)).every((r) => r.state === "finished"), {
      timeout: 5_000,
    })
    .toBe(true);
  for (const part of await finalFrame(t)) expect(part.dash).toBe(0);
  const shift = await page.evaluate(
    () => (window as typeof window & { __shift: number }).__shift,
  );
  expect(shift).toBeLessThan(0.001);

  // Leave and come back: it replays from the start.
  await page.mouse.move(0, 0);
  await expect.poll(() => runs(t)).toEqual([]);
  await t.hover();
  const again = await runs(t);
  expect(again.some((r) => r.state === "running")).toBe(true);
  expect(Math.min(...again.map((r) => r.time))).toBeLessThan(1_000);
});

test("keyboard focus on a tile's link plays its demo", async ({ page }) => {
  await toWork(page);
  const t = tile(page, "jainav-platform");
  const link = t.getByRole("link", { name: "Jainav Infotech platform" });
  await page.keyboard.press("Tab");
  await link.focus();
  expect(await link.evaluate((el) => el.matches(":focus-visible"))).toBe(true);
  await expect.poll(() => runs(t).then((r) => r.length)).toBeGreaterThan(0);
});

test("touch plays each demo once at half in view, then holds", async ({
  page,
}, testInfo) => {
  test.skip(!isTouch(testInfo.project.name), "touch projects");
  await observe(page);
  await page.goto("/");
  await expect(tiles(page)).toHaveCount(6);
  await expect(page.locator("[data-demo-play]")).toHaveCount(0);

  const first = tiles(page).first();
  // Just above the bento first, so it has rendered (content-visibility)
  // and the scroll to it lands where it should on every engine.
  await page.locator("#work").evaluate(async (el) => {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - innerHeight,
      behavior: "instant",
    });
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });
  await expect(page.locator("[data-demo-play]")).toHaveCount(0);
  // WebKit's scrollIntoViewIfNeeded doesn't move this page; centre it here.
  await first.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const live = await goLive(
    page,
    first,
    page.locator("#work [data-demo][data-demo-play]").first(),
  );
  await testInfo.attach("bento-js.json", {
    body: JSON.stringify(live, null, 2),
    contentType: "application/json",
  });
  // No component JS: the demos are markup and CSS.
  expect(live.bytes).toBeLessThanOrEqual(60_000);
  expect(live.shift).toBeLessThan(0.001);

  await expect(first).toHaveAttribute("data-demo-play", "");
  await expect.poll(async () => (await runs(first)).length).toBeGreaterThan(0);
  await expect
    .poll(
      async () => (await runs(first)).every((r) => r.state === "finished"),
      {
        timeout: 5_000,
      },
    )
    .toBe(true);
  const held = await finalFrame(first);

  // Away and back: it holds the last frame and doesn't play again.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await first.evaluate((el) => el.scrollIntoView({ block: "center" }));
  expect(await running(first)).toBe(0);
  expect(await finalFrame(first)).toEqual(held);

  // Every tile plays once it is half in view.
  for (const t of await tiles(page).all()) {
    await t.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect(t).toHaveAttribute("data-demo-play", "");
  }
});

test("a swipe over a demo scrolls the page and plays the next one", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    !isTouch(testInfo.project.name) || browserName !== "chromium",
    "CDP touch is Chromium only",
  );
  await page.goto("/");
  const t = tile(page, "reservoir-rl");
  // Its top edge just inside the viewport: under half in view.
  await t.evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - innerHeight + 40,
      behavior: "instant",
    }),
  );
  await expect(t).not.toHaveAttribute("data-demo-play");

  const cdp = await page.context().newCDPSession(page);
  const stop = await throttle(page);
  const x = Math.round((page.viewportSize()?.width ?? 360) / 2);
  const from = (page.viewportSize()?.height ?? 700) - 20;
  const before = await page.evaluate(() => window.scrollY);
  const timing = await during(page, async () => {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y: from }],
    });
    for (let i = 1; i <= 12; i++)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: from - i * 40 }],
      });
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  });
  await stop();
  await testInfo.attach("swipe-timing.json", {
    body: JSON.stringify(timing),
    contentType: "application/json",
  });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(
    before + 200,
  );
  await expect(t).toHaveAttribute("data-demo-play", "");
  expect(timing.longest).toBeLessThan(50);
  expect(timing.slowestEvent).toBeLessThan(200);
});

test("a tap or click on a demo opens its case study", async ({
  page,
}, testInfo) => {
  await toWork(page);
  const t = tile(page, "mlops-drift-loop");
  const strip = t.locator('[aria-hidden="true"]:has(.demo-a)');
  await strip.scrollIntoViewIfNeeded();
  // By position: the title link's overlay is what takes the tap.
  const box = (await strip.boundingBox())!;
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  if (isTouch(testInfo.project.name)) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect(page).toHaveURL(/\/work\/mlops-drift-loop$/);
});

test("reduced motion keeps the final frame and runs nothing", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toWork(page);
  for (const t of await tiles(page).all()) {
    await t.evaluate((el) => el.scrollIntoView({ block: "center" }));
    if (!isTouch(testInfo.project.name)) await t.hover();
    await page.waitForTimeout(100);
    expect(await runs(t)).toEqual([]);
    const parts = await finalFrame(t);
    for (const part of parts) expect(part.dash).toBe(0);
    // Every part is drawn, except the pulse ring, which ends faded.
    expect(parts.filter((p) => p.opacity !== "1").length).toBeLessThanOrEqual(
      1,
    );
  }
});
