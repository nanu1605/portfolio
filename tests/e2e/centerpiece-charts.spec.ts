import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { during, goLive, observe, throttle } from "./lib/centerpiece";

// §10.5 "Weight mixer" and §10.6 "Calibration explorer", by mouse, touch
// and keyboard (docs/cross-device.md §8, Phase 5).

// No traces in this file: tracing snapshots the DOM on the page's main
// thread around every action, which a throttled CPU reports as long tasks
// of its own. Failures still keep their screenshot.
test.use({ trace: "off" });

const isTouch = (t: TestInfo) => !t.project.name.startsWith("desktop-");
const chromiumTouch = (t: TestInfo, browser: string) =>
  browser === "chromium" && isTouch(t);

async function open(page: Page, slug: string) {
  await observe(page);
  await page.goto(`/work/${slug}`);
  const root = page.locator(`[data-centerpiece="${slug}"]`);
  const live = await goLive(
    page,
    root,
    page.locator(`[data-centerpiece="${slug}"][data-ready]`),
  );
  return { root, live };
}

/** Transform animations or transitions running inside an element. */
const moving = (root: Locator) =>
  root.evaluate(
    (el) =>
      el.getAnimations({ subtree: true }).filter((a) => {
        if ("transitionProperty" in a)
          return (a as CSSTransition).transitionProperty === "transform";
        return ((a.effect as KeyframeEffect | null)?.getKeyframes() ?? []).some(
          (k) => "transform" in k,
        );
      }).length,
  );

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

async function record(
  testInfo: TestInfo,
  name: string,
  numbers: Record<string, number>,
) {
  await testInfo.attach(name, {
    body: JSON.stringify(numbers, null, 2),
    contentType: "application/json",
  });
}

/** Touch input through CDP (Chromium only): a real finger, not a mouse. */
async function finger(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const send = (type: "touchStart" | "touchMove" | "touchEnd", x = 0, y = 0) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  return async (
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) => {
    await send("touchStart", from.x, from.y);
    for (let i = 1; i <= 10; i++)
      await send(
        "touchMove",
        from.x + ((to.x - from.x) * i) / 10,
        from.y + ((to.y - from.y) * i) / 10,
      );
    await send("touchEnd");
  };
}

/** The weight mixer's controls, and viewBox points (360 × 330) to page points. */
async function parts(page: Page, root: Locator) {
  const triangle = root.locator("[data-triangle]");
  await triangle.scrollIntoViewIfNeeded();
  const box = (await triangle.boundingBox())!;
  const at = (p: { x: number; y: number }) => ({
    x: box.x + (p.x / 360) * box.width,
    y: box.y + (p.y / 330) * box.height,
  });
  const handle = root.getByRole("slider", { name: "Objective weights" });
  const centre = async () => {
    const b = (await handle.boundingBox())!;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  };
  return {
    triangle,
    at,
    handle,
    centre,
    select: root.getByRole("combobox", { name: "Nearest agent" }),
    said: root.locator('[aria-live="polite"]'),
  };
}

/** A DeepAR seed chip (the label around its radio). */
const chip = (root: Locator, name: string) =>
  root.locator("label", { hasText: new RegExp(`^${name}$`) });

test.describe("reservoir weight mixer", () => {
  const slug = "reservoir-rl";
  // Agent positions in the triangle's viewBox (360 × 330), from their weights.
  const spots = {
    flood_focused: { x: 180, y: 82 },
    supply_focused: { x: 75, y: 264 },
    ecology_focused: { x: 285, y: 264 },
  };

  test("loads within budget and swaps without a shift", async ({
    page,
  }, testInfo) => {
    const { root, live } = await open(page, slug);
    await record(testInfo, "reservoir-load", {
      bytes: live.bytes,
      shift: live.shift,
    });
    expect(live.bytes).toBeGreaterThan(0);
    expect(live.bytes).toBeLessThanOrEqual(60_000);
    expect(live.shift).toBeLessThan(0.001);
    await expect(root.getByRole("combobox")).toHaveValue("3"); // balanced
  });

  test("the arrow keys move the cursor to the nearest agent", async ({
    page,
  }) => {
    const { root } = await open(page, slug);
    const { handle, select, said } = await parts(page, root);
    await handle.focus();
    const y = await scrollY(page);
    for (let i = 0; i < 4; i++) await page.keyboard.press("Shift+ArrowUp");
    await expect(select).toHaveValue("0");
    await expect(said).toContainText("flood_focused, seed 42");
    await expect(handle).toHaveAttribute("aria-valuetext", /flood_focused/);
    // Small steps: one press doesn't leave the agent.
    await page.keyboard.press("ArrowDown");
    await expect(select).toHaveValue("0");
    expect(await scrollY(page)).toBe(y);
  });

  test("a click places the cursor and a mouse drag moves it", async ({
    page,
  }) => {
    const { root } = await open(page, slug);
    const { at, centre, select, triangle } = await parts(page, root);
    const eco = at(spots.ecology_focused);
    await page.mouse.click(eco.x, eco.y);
    await expect(select).toHaveValue("2");
    // Grab the handle off its centre and drag it over to the Supply corner:
    // the cursor keeps the grab offset, before and after the release.
    const c = await centre();
    const grab = { x: c.x + 12, y: c.y + 8 };
    const spot = at(spots.supply_focused);
    await page.mouse.move(grab.x, grab.y);
    await page.mouse.down();
    await page.mouse.move(spot.x + 12, spot.y + 8, { steps: 12 });
    const near = async () => {
      const p = await centre();
      return Math.max(Math.abs(p.x - spot.x), Math.abs(p.y - spot.y));
    };
    await expect.poll(near).toBeLessThan(2);
    await page.mouse.up();
    await expect(select).toHaveValue("1");
    await page.waitForTimeout(100); // a click or a late frame would show by now
    expect(await near()).toBeLessThan(2);
    await expect(triangle).toBeVisible();
  });

  test("a tap places the cursor", async ({ page }, testInfo) => {
    test.skip(!isTouch(testInfo), "touch projects");
    const { root } = await open(page, slug);
    const { at, select, triangle } = await parts(page, root);
    const box = (await triangle.boundingBox())!;
    const flood = at(spots.flood_focused);
    await triangle.tap({
      position: { x: flood.x - box.x, y: flood.y - box.y },
    });
    await expect(select).toHaveValue("0");
  });

  test("a finger drags only the handle; elsewhere it scrolls", async ({
    page,
    browserName,
  }, testInfo) => {
    test.skip(!chromiumTouch(testInfo, browserName), "CDP touch: Chromium");
    const { root } = await open(page, slug);
    const { at, select } = await parts(page, root);
    const swipe = await finger(page);

    // A vertical swipe that starts on the triangle scrolls the page.
    const start = at({ x: 290, y: 150 });
    const before = await scrollY(page);
    await swipe(start, { x: start.x, y: start.y - 150 });
    await expect.poll(() => scrollY(page)).toBeGreaterThan(before);
    await page.waitForTimeout(600); // let the fling settle
    await expect(select).toHaveValue("3");

    // A drag on the handle moves the cursor, and the page stays put.
    const again = await parts(page, root);
    const from = await again.centre();
    const y = await scrollY(page);
    await swipe(from, again.at(spots.ecology_focused));
    await expect(select).toHaveValue("2");
    expect(await scrollY(page)).toBe(y);
  });

  test("the select and the drier-climate toggle", async ({ page }) => {
    const { root } = await open(page, slug);
    const { select, handle, said } = await parts(page, root);
    await select.selectOption({ label: "mild_balanced · seed 49" });
    await expect(said).toContainText("mild_balanced, seed 49");
    await expect(handle).toHaveAttribute("aria-valuetext", /Flood 0\.50/);
    const drier = root.getByRole("button", { name: "Drier climate" });
    await drier.click();
    await expect(drier).toHaveAttribute("aria-pressed", "true");
    await expect(root).toContainText("349.4 ± 18.9");
    await expect(root).toContainText(
      "inflow mean x0.8, noise x1.3, no retraining",
    );
    // The headline run has its own results file, and rows in "View data".
    await expect(root.getByRole("link", { name: "Source" })).toHaveAttribute(
      "href",
      /shift_results\.json/,
    );
    await expect(
      page.locator("th", { hasText: "Balanced PPO, seed 42 (drier climate)" }),
    ).toBeAttached();
    await expect(root).toContainText(
      "Each point is one training run (one seed). Two runs with the same balanced weights landed at different points — see Limitations.",
    );
  });

  test("reduced motion: the cursor jumps, nothing glides", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { root } = await open(page, slug);
    const { select } = await parts(page, root);
    await select.selectOption("0");
    await root.getByRole("button", { name: "Drier climate" }).click();
    expect(await moving(root)).toBe(0);
    await expect(root.getByRole("slider")).toHaveAttribute(
      "aria-valuetext",
      /Flood 0\.80/,
    );
  });
});

test.describe("forecasting calibration explorer", () => {
  const slug = "probabilistic-forecasting";
  const crps = (root: Locator) => root.locator("dl dd").first();

  test("loads within budget and swaps without a shift", async ({
    page,
  }, testInfo) => {
    const { root, live } = await open(page, slug);
    await record(testInfo, "forecasting-load", {
      bytes: live.bytes,
      shift: live.shift,
    });
    expect(live.bytes).toBeGreaterThan(0);
    expect(live.bytes).toBeLessThanOrEqual(60_000);
    expect(live.shift).toBeLessThan(0.001);
    // The 5-seed mean comes from the raw row, never the recalibrated one.
    await expect(crps(root)).toHaveText("43.62 ± 1.75");
    await expect(root.locator("dl dd").nth(4)).toHaveText("74% ± 4%");
  });

  test("a seed chip updates the cards, by click or tap", async ({
    page,
  }, testInfo) => {
    const { root } = await open(page, slug);
    const forty2 = chip(root, "42");
    await forty2.scrollIntoViewIfNeeded();
    if (isTouch(testInfo)) await forty2.tap();
    else await forty2.click();
    await expect(
      root.getByRole("radio", { name: "42", exact: true }),
    ).toBeChecked();
    await expect(crps(root)).toHaveText("46.207");
    await expect(root.locator('[aria-live="polite"]')).toContainText(
      "DeepAR, seed 42: CRPS 46.207, RMSE 100.273, 90% coverage 67.9%, ECE 0.163.",
    );
  });

  test("arrow keys move through the seeds", async ({ page }) => {
    const { root } = await open(page, slug);
    // Clear of the sticky header, so focus has no reason to scroll.
    await root
      .locator("fieldset")
      .evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
    const mean = root.getByRole("radio", { name: "Mean of 5" });
    await mean.focus();
    const y = await scrollY(page);
    await page.keyboard.press("ArrowLeft");
    await expect(
      root.getByRole("radio", { name: "1337", exact: true }),
    ).toBeChecked();
    await expect(crps(root)).toHaveText("41.439");
    expect(await scrollY(page)).toBe(y);
  });

  test("the Recalibration tab shows the same run, before and after", async ({
    page,
  }) => {
    const { root } = await open(page, slug);
    const tab = root.getByRole("tab", { name: "Recalibration", exact: true });
    await tab.click();
    const panel = root.getByRole("tabpanel");
    await expect(panel).toContainText("0.090");
    await expect(panel).toContainText("0.098");
    await expect(panel).toContainText(
      "A fit on the test period itself reaches 0.020.",
    );
    await expect(panel.getByRole("link", { name: "Source" })).toHaveAttribute(
      "href",
      /recalibration_results\.json/,
    );
    await page.keyboard.press("ArrowLeft");
    await expect(
      root.getByRole("tab", { name: "Calibration", exact: true }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(root).toContainText(
      "ECE here is the average gap between nominal and observed interval coverage across nine levels.",
    );
  });

  test("direct labels on desktop, a key list on phones", async ({ page }) => {
    const { root } = await open(page, slug);
    const wide = page.viewportSize()!.width >= 1280;
    const ends = root.locator("svg text", { hasText: "Seasonal naive" });
    const key = root.locator("li", { hasText: "Seasonal naive" });
    if (wide) {
      await expect(ends).toBeVisible();
      await expect(key).toBeHidden();
    } else {
      await expect(ends).toBeHidden();
      await expect(key).toBeVisible();
    }
  });

  test("the horizon bars grow once they come into view", async ({ page }) => {
    await page.goto(`/work/${slug}`);
    const root = page.locator(`[data-centerpiece="${slug}"]`);
    // Bring the explorer's top edge just into view, so it goes live while
    // the bars at its foot are still below the fold.
    await root.evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - innerHeight + 40,
        behavior: "instant",
      }),
    );
    await expect(
      page.locator(`[data-centerpiece="${slug}"][data-ready]`),
    ).toBeAttached();
    // The horizon bars (the Recalibration panel's are hidden).
    const bars = root.locator("[data-bar]:visible");
    await bars.last().scrollIntoViewIfNeeded();
    await expect.poll(() => moving(root)).toBeGreaterThan(0);
    // ...and settle at full length.
    await expect.poll(() => moving(root), { timeout: 3000 }).toBe(0);
    expect(
      await bars.last().evaluate((el) => getComputedStyle(el).transform),
    ).toBe("none");
  });

  test("reduced motion: full bars, and the seed switch doesn't move", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { root } = await open(page, slug);
    await root.locator("[data-bar]:visible").last().scrollIntoViewIfNeeded();
    await chip(root, "789").click();
    await expect(crps(root)).toHaveText("42.712");
    expect(await moving(root)).toBe(0);
    expect(
      await root.evaluate((el) => el.getAnimations({ subtree: true }).length),
    ).toBe(0);
  });
});

test.describe("interaction budgets at 4× CPU throttle", () => {
  // Alone, these measure no long task at all; beside two other busy
  // workers a throttled CPU now and then stretches one past 50 ms. One
  // fresh retry (reported as flaky) still fails a real regression.
  test.describe.configure({ retries: 1 });
  test.beforeEach(({ browserName }) => {
    test.skip(browserName !== "chromium", "long tasks and event timing");
  });

  test("reservoir: select, toggle and keys", async ({ page }, testInfo) => {
    const { root } = await open(page, "reservoir-rl");
    const { select, handle } = await parts(page, root);
    const reset = await throttle(page);
    const numbers = await during(page, async () => {
      await select.selectOption("4");
      await root.getByRole("button", { name: "Drier climate" }).click();
      await handle.focus();
      await page.keyboard.press("ArrowLeft");
      await page.keyboard.press("Shift+ArrowUp");
    });
    await reset();
    await record(testInfo, "reservoir-interaction", numbers);
    expect(numbers.longest).toBeLessThan(50);
    expect(numbers.slowestEvent).toBeLessThan(200);
  });

  test("reservoir: dragging the cursor", async ({ page }, testInfo) => {
    const { root } = await open(page, "reservoir-rl");
    const { at, centre, select } = await parts(page, root);
    const from = await centre();
    const to = at({ x: 285, y: 264 }); // ecology_focused
    const swipe = isTouch(testInfo) ? await finger(page) : undefined;
    const reset = await throttle(page);
    const numbers = await during(page, async () => {
      if (swipe) return swipe(from, to);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(to.x, to.y, { steps: 20 });
      await page.mouse.up();
    });
    await reset();
    await expect(select).toHaveValue("2");
    await record(testInfo, "reservoir-drag", numbers);
    expect(numbers.longest).toBeLessThan(50);
    expect(numbers.slowestEvent).toBeLessThan(200);
  });

  test("forecasting: seeds and tabs", async ({ page }, testInfo) => {
    const { root } = await open(page, "probabilistic-forecasting");
    await chip(root, "456").scrollIntoViewIfNeeded();
    const reset = await throttle(page);
    const numbers = await during(page, async () => {
      await chip(root, "456").click();
      await chip(root, "1337").click();
      await root
        .getByRole("tab", { name: "Recalibration", exact: true })
        .click();
    });
    await reset();
    await record(testInfo, "forecasting-interaction", numbers);
    expect(numbers.longest).toBeLessThan(50);
    expect(numbers.slowestEvent).toBeLessThan(200);
  });
});
