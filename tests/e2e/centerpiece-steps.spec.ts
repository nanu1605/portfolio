import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { orderToLicence } from "../../content/centerpieces/jainav-platform";
import { tableToBill } from "../../content/centerpieces/menumesh";
import { screen } from "../../content/screens";
import { during, goLive, observe, throttle } from "./lib/centerpiece";

// §10.3 Jainav stepper, §10.4 MenuMesh "Table to bill", §10.8 VDR pipeline
// and §10.9 MyCounselHub flow (docs/cross-device.md §6, §8 Phase 5).

const isTouch = (info: TestInfo) => !info.project.name.startsWith("desktop-");
const root = (page: Page, slug: string) =>
  page.locator(`[data-centerpiece="${slug}"]`);

/** Tap on touch projects, click elsewhere. */
const press = (info: TestInfo, target: Locator) =>
  isTouch(info) ? target.tap() : target.click();

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

/** Time-based animations and transitions still running inside `el`. */
const running = (el: Locator) =>
  el.evaluate(
    (node) =>
      node
        .getAnimations({ subtree: true })
        .filter((a) => a.playState === "running").length,
  );

async function live(page: Page, slug: string, info: TestInfo) {
  await observe(page);
  await page.goto(`/work/${slug}`);
  const box = root(page, slug);
  const result = await goLive(
    page,
    box,
    page.locator(`[data-centerpiece="${slug}"][data-ready]`),
  );
  await info.attach(`${slug}-live`, {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  expect(result.bytes).toBeGreaterThan(0);
  expect(result.bytes).toBeLessThanOrEqual(60_000);
  expect(result.shift).toBeLessThan(0.001);
  return box;
}

/**
 * A sideways swipe on the track through Chromium's touch input (CDP), as a
 * share of the track's width: past half a slide, so it snaps to the next one
 * on a 360 px phone and a 640 px tablet alike.
 */
async function swipe(page: Page, track: Locator, share: number) {
  const box = (await track.boundingBox())!;
  const dx = share * box.width;
  // The touch must land on the track, below the sticky header.
  expect(box.y).toBeGreaterThan(80);
  const cdp = await page.context().newCDPSession(page);
  const y = box.y + Math.min(box.height / 2, 120);
  const x = box.x + box.width * (dx < 0 ? 0.85 : 0.15);
  const point = (at: number) => [{ x: at, y }];
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: point(x),
  });
  for (let i = 1; i <= 10; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: point(x + (dx * i) / 10),
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

/**
 * Scrolls a control into view first (a tap on an off-screen control
 * scrolls the page itself) and returns the settled scrollY.
 */
async function steady(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  return scrollY(page);
}

/** Taps or clicks `target` at 4x CPU throttle; no long task, INP < 200 ms. */
async function measure(
  page: Page,
  info: TestInfo,
  name: string,
  target: Locator,
) {
  // Let the scroll that brings it into view finish its own work first.
  await steady(page, target);
  await page.waitForTimeout(700);
  const stop = await throttle(page);
  const result = await during(page, () => press(info, target));
  await stop();
  await info.attach(`${name}-4x-throttle`, {
    body: JSON.stringify(result),
    contentType: "application/json",
  });
  expect(result.longest).toBeLessThan(50);
  expect(result.slowestEvent).toBeLessThan(200);
}

test.describe("Jainav: from order to licence", () => {
  const slug = "jainav-platform";
  const selected = (box: Locator) =>
    box.locator('[role="tab"][aria-selected="true"]');
  const panel = (box: Locator, i: number) =>
    box.locator(`#order-to-licence-step-${i}`);

  test("loads lazily and steps by tap or click without moving the page", async ({
    page,
  }, info) => {
    const box = await live(page, slug, info);
    const tabs = box.getByRole("tab");
    await expect(tabs).toHaveCount(orderToLicence.length);
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-0");

    // Appendix B's text on every step; the tab names keep a space between
    // number and name, and the schematic is not read a second time.
    for (const [i, step] of orderToLicence.entries()) {
      await expect(panel(box, i)).toContainText(step.text);
      await expect(tabs.nth(i)).toHaveAccessibleName(
        `${String(i + 1).padStart(2, "0")} ${step.name}`,
      );
    }
    const spoken = await panel(box, 0).ariaSnapshot();
    expect(spoken).toContain(orderToLicence[0].text.slice(0, 20));
    expect(spoken).not.toContain("•");

    // Highlighted schematic boxes take the accent, like the step number.
    const tax = orderToLicence.findIndex((s) => s.diagram.kind === "tax");
    const colours = await panel(box, tax).evaluate((el, igst) => {
      const accent = getComputedStyle(el.querySelector(".text-accent")!).color;
      // The innermost span with that text: the box itself.
      const node = [...el.querySelectorAll("span")]
        .filter((n) => n.textContent === igst)
        .at(-1)!;
      return { accent, box: getComputedStyle(node).color };
    }, "IGST");
    expect(colours.box).toBe(colours.accent);

    const next = box.getByRole("button", { name: "Next" });
    const before = await steady(page, next);
    await press(info, next);
    await press(info, next);
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-2");
    await expect(box.locator("[aria-live]")).toContainText("03");
    await page.waitForTimeout(700);
    expect(await scrollY(page)).toBe(before);
    await expect(panel(box, 2)).toBeInViewport();
    expect(
      await panel(box, 2).evaluate((el) => (el as HTMLElement).inert),
    ).toBe(false);
    expect(
      await panel(box, 0).evaluate((el) => (el as HTMLElement).inert),
    ).toBe(true);

    await press(info, box.getByRole("button", { name: "Previous" }));
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-1");

    // A step on the rail.
    const atRail = await steady(page, tabs.nth(5));
    await press(info, tabs.nth(5));
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-5");
    await expect(panel(box, 5)).toBeInViewport();
    expect(await scrollY(page)).toBe(atRail);

    // Phones: seven dots share the rail, each at least 24 px wide and 44 px tall.
    for (const tab of await tabs.all()) {
      const size = (await tab.boundingBox())!;
      expect(size.width).toBeGreaterThanOrEqual(24);
      expect(size.height).toBeGreaterThanOrEqual(44);
    }
    // 48 px Previous and Next.
    expect((await next.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  });

  test("arrow keys, Home and End move along the rail", async ({
    page,
  }, info) => {
    const box = await live(page, slug, info);
    const tabs = box.getByRole("tab");
    await tabs.first().focus();
    const before = await scrollY(page);
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-1");
    await page.keyboard.press("End");
    await expect(tabs.nth(6)).toBeFocused();
    await expect(panel(box, 6)).toBeInViewport();
    await page.keyboard.press("ArrowRight");
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-6");
    await page.keyboard.press("Home");
    await expect(tabs.first()).toBeFocused();
    await expect(panel(box, 0)).toBeInViewport();
    // The track itself takes the arrow keys too.
    const track = box.getByRole("group", { name: "From order to licence" });
    await track.focus();
    await page.keyboard.press("ArrowRight");
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-1");
    expect(await scrollY(page)).toBe(before);
  });

  test("scrolling or swiping the track updates the step", async ({
    page,
    browserName,
  }, info) => {
    const box = await live(page, slug, info);
    const track = box.getByRole("group", { name: "From order to licence" });
    // Any engine: a scroll of the track (what a swipe ends in).
    await track.evaluate((el) =>
      el.scrollTo({ left: el.clientWidth * 3, behavior: "instant" }),
    );
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-3");

    test.skip(
      browserName !== "chromium" || !isTouch(info),
      "CDP touch swipes: Chromium touch projects",
    );
    await track.evaluate((el) => el.scrollTo({ left: 0, behavior: "instant" }));
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-0");
    const before = await scrollY(page);
    await swipe(page, track, -0.6);
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-1");
    expect(await scrollY(page)).toBe(before);
  });

  test("reduced motion: steps change instantly, nothing animates", async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const box = await live(page, slug, info);
    await press(info, box.getByRole("button", { name: "Next" }));
    await expect(selected(box)).toHaveAttribute("id", "order-to-licence-tab-1");
    // The track jumped (no smooth scroll) and no transition runs.
    const track = box.getByRole("group", { name: "From order to licence" });
    expect(
      await track.evaluate((el) => Math.round(el.scrollLeft / el.clientWidth)),
    ).toBe(1);
    expect(await running(box)).toBe(0);
  });

  test(
    "a step costs no long task at 4x throttle",
    { tag: "@budget" },
    async ({ page, browserName }, info) => {
      test.skip(browserName !== "chromium", "longtask and event timing");
      const box = await live(page, slug, info);
      await measure(
        page,
        info,
        slug,
        box.getByRole("button", { name: "Next" }),
      );
      await expect(selected(box)).toHaveAttribute(
        "id",
        "order-to-licence-tab-1",
      );
    },
  );

  test("the build timeline lists phases 0–9 and phase 10 as next", async ({
    page,
  }) => {
    await page.goto(`/work/${slug}`);
    const timeline = page.locator("figure", {
      hasText: "Built 15–18 October 2026 from a ~1,000-line spec.",
    });
    await expect(timeline.locator("ol > li")).toHaveCount(11);
    await expect(timeline.locator("ol > li").last()).toContainText("next");
  });
});

test.describe("MenuMesh: table to bill", () => {
  const slug = "menumesh";
  const alt = (file: string) => screen(file).alt;
  /** CSS px per captured pixel: how large the capture is drawn. */
  const scale = async (img: Locator, file: string) =>
    (await img.boundingBox())!.width / screen(file).image.width;
  /** Wide and tall enough to pin the frame (cross-device §6). */
  const sticky = (page: Page) =>
    page.evaluate(
      () => matchMedia("(min-width: 768px) and (min-height: 600px)").matches,
    );

  test("story or stepper, by viewport, with the Hindi menu", async ({
    page,
  }, info) => {
    const box = await live(page, slug, info);
    const shown = (name: string) =>
      box.locator('[aria-hidden="false"]').getByRole("img", { name });

    if (await sticky(page)) {
      // The sticky frame follows the step in the middle of the viewport.
      const steps = box.locator("li[data-step]");
      await expect(steps).toHaveCount(4);
      const frame = box.locator(".sticky");
      expect(await frame.evaluate((el) => getComputedStyle(el).position)).toBe(
        "sticky",
      );
      for (const [i, step] of tableToBill.steps.entries()) {
        await steps.nth(i).evaluate((el) => {
          const r = el.getBoundingClientRect();
          window.scrollBy({
            top: r.top + r.height / 2 - innerHeight / 2,
            behavior: "instant",
          });
        });
        await expect(steps.nth(i)).toHaveAttribute("aria-current", "step");
        await expect(shown(alt(step.screen))).toHaveCount(1);
        await expect(frame).toBeInViewport({ ratio: 0.9 });
        // Legible: the whole phone at the frame's height; the landscape
        // screens' details across the column. The ~65svh frame gives the
        // phone 0.32 in a 1280×720 window (desktop Safari and Firefox).
        const img = frame.locator('[aria-hidden="false"] img');
        const { width, height } = screen(step.screen).image;
        expect(await scale(img, step.screen)).toBeGreaterThanOrEqual(
          height > width ? 0.3 : 0.24,
        );
      }
      await steps.nth(1).evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollBy({
          top: r.top + r.height / 2 - innerHeight / 2,
          behavior: "instant",
        });
      });
      await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");
      const hindi = steps.nth(1).getByRole("button", { name: "हिंदी" });
      const before = await steady(page, hindi);
      await press(info, hindi);
      await expect(hindi).toHaveAttribute("aria-pressed", "true");
      await expect(shown(alt(tableToBill.hindi.screen))).toHaveCount(1);
      expect(await scrollY(page)).toBe(before);
      return;
    }

    // Phones and short screens: the swipeable stepper.
    const tabs = box.getByRole("tab");
    await expect(tabs).toHaveCount(4);
    const next = box.getByRole("button", { name: "Next" });
    const before = await steady(page, next);
    await press(info, next);
    await expect(
      box.locator('[role="tab"][aria-selected="true"]'),
    ).toHaveAttribute("id", "table-to-bill-tab-1");
    await page.waitForTimeout(700);
    expect(await scrollY(page)).toBe(before);
    const order = box.locator("#table-to-bill-step-1");
    await expect(order).toBeInViewport();
    await expect(
      order.getByRole("img", { name: alt(tableToBill.steps[1].screen) }),
    ).toBeVisible();
    // Legible on a phone: the menu at least 240 px wide; the bill's detail
    // the slide's width.
    const img = (i: number) =>
      box.locator(`#table-to-bill-step-${i} [aria-hidden="false"] img`);
    expect(
      await scale(img(1), tableToBill.steps[1].screen),
    ).toBeGreaterThanOrEqual(0.37);
    expect(
      await scale(img(3), tableToBill.steps[3].screen),
    ).toBeGreaterThanOrEqual(0.24);

    const hindi = order.getByRole("button", { name: "हिंदी" });
    expect((await hindi.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(hindi).toHaveAttribute("lang", "hi");
    const atHindi = await steady(page, hindi);
    await press(info, hindi);
    await expect(hindi).toHaveAttribute("aria-pressed", "true");
    await expect(shown(alt(tableToBill.hindi.screen))).toHaveCount(1);
    expect(await scrollY(page)).toBe(atHindi);
  });

  test("the stepper follows swipes and keys on phones", async ({
    page,
    browserName,
  }, info) => {
    const box = await live(page, slug, info);
    test.skip(await sticky(page), "the sticky story replaces the stepper here");
    const current = box.locator('[role="tab"][aria-selected="true"]');
    const track = box.getByRole("group", { name: tableToBill.title });
    await box.getByRole("tab").first().focus();
    await page.keyboard.press("End");
    await expect(current).toHaveAttribute("id", "table-to-bill-tab-3");
    await page.keyboard.press("Home");
    await expect(current).toHaveAttribute("id", "table-to-bill-tab-0");
    await expect(box.locator("#table-to-bill-step-0")).toBeInViewport();

    // Arrow keys on the language toggle stay there: same step, same focus.
    await page.keyboard.press("ArrowRight");
    await expect(current).toHaveAttribute("id", "table-to-bill-tab-1");
    const hindi = box
      .locator("#table-to-bill-step-1")
      .getByRole("button", { name: "हिंदी" });
    const at = () => track.evaluate((el) => el.scrollLeft / el.clientWidth);
    await expect.poll(at).toBeCloseTo(1, 2);
    await hindi.evaluate((el) => el.focus({ preventScroll: true }));
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(600);
    await expect(hindi).toBeFocused();
    await expect(current).toHaveAttribute("id", "table-to-bill-tab-1");
    // Nor does the track scroll under it.
    expect(await at()).toBeCloseTo(1, 2);
    await box.getByRole("tab").nth(1).focus();
    await page.keyboard.press("Home");
    await expect(current).toHaveAttribute("id", "table-to-bill-tab-0");
    await expect.poll(at).toBeCloseTo(0, 2);

    test.skip(browserName !== "chromium", "CDP touch swipes: Chromium");
    // The toggle's focus scrolled the page; bring the track's top back.
    await track.evaluate((el) =>
      window.scrollBy({
        top: el.getBoundingClientRect().top - innerHeight / 3,
        behavior: "instant",
      }),
    );
    const before = await scrollY(page);
    await swipe(page, track, -0.6);
    await expect(current).toHaveAttribute("id", "table-to-bill-tab-1");
    expect(await scrollY(page)).toBe(before);
  });

  test("reduced motion: screens switch without fading", async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const box = await live(page, slug, info);
    const hindi = box
      .getByRole("button", { name: "हिंदी" })
      .locator("visible=true");
    if (!(await sticky(page)))
      await press(info, box.getByRole("button", { name: "Next" }));
    else
      await box
        .locator("li[data-step]")
        .nth(1)
        .evaluate((el) => {
          const r = el.getBoundingClientRect();
          window.scrollBy({
            top: r.top + r.height / 2 - innerHeight / 2,
            behavior: "instant",
          });
        });
    await press(info, hindi);
    await expect(hindi).toHaveAttribute("aria-pressed", "true");
    expect(await running(box)).toBe(0);
  });

  test(
    "the language toggle costs no long task at 4x throttle",
    { tag: "@budget" },
    async ({ page, browserName }, info) => {
      test.skip(browserName !== "chromium", "longtask and event timing");
      const box = await live(page, slug, info);
      if (!(await sticky(page)))
        await press(info, box.getByRole("button", { name: "Next" }));
      const hindi = box
        .getByRole("button", { name: "हिंदी" })
        .locator("visible=true");
      await measure(page, info, slug, hindi);
      await expect(hindi).toHaveAttribute("aria-pressed", "true");
    },
  );
});

test.describe("CSS-only flows", () => {
  // rows: how many rows the stages take on a 768 px tablet.
  const flows = [
    {
      slug: "virtual-dressing-room",
      items: "li.vdr-stage",
      count: 6,
      tablet: 2,
    },
    { slug: "mycounselhub", items: "li.mch-node", count: 5, tablet: 1 },
  ];

  for (const flow of flows) {
    test(`${flow.slug}: plays once in view, under 5 s, then holds`, async ({
      page,
      browserName,
    }) => {
      await page.goto(`/work/${flow.slug}`);
      const box = root(page, flow.slug);
      const items = box.locator(flow.items);
      await expect(items).toHaveCount(flow.count);
      // Below the fold it waits in its start state.
      const hidden = () =>
        items.evaluateAll(
          (els) =>
            els.filter((el) => getComputedStyle(el).opacity !== "1").length,
        );
      expect(await hidden()).toBeGreaterThan(0);
      // Bring the whole flow into view, so every stage reveals.
      await box.evaluate((el) =>
        el.scrollIntoView({ block: "center", behavior: "instant" }),
      );
      const start = Date.now();
      // It plays: transitions run. (Playwright's WebKit on Windows jumps
      // CSS transitions to their end, so only the start state is checked.)
      if (browserName !== "webkit")
        await expect
          .poll(() => running(box), { timeout: 2_000 })
          .toBeGreaterThan(0);
      await expect
        .poll(
          async () =>
            (await running(box)) === 0 &&
            (await items.evaluateAll((els) =>
              els.every((el) => getComputedStyle(el).opacity === "1"),
            )),
          { timeout: 5_000 },
        )
        .toBe(true);
      expect(Date.now() - start).toBeLessThan(5_000);
      // Holds: nothing starts again.
      await page.waitForTimeout(500);
      expect(await running(box)).toBe(0);
    });

    test(`${flow.slug}: reduced motion shows the final state at once`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/work/${flow.slug}`);
      const box = root(page, flow.slug);
      // Before it is even scrolled to: drawn connectors, visible stages.
      const final = () =>
        box.evaluate((el) =>
          [...el.querySelectorAll("li, li > span")].every((n) => {
            const s = getComputedStyle(n);
            return s.opacity === "1" && s.transform === "none";
          }),
        );
      expect(await final()).toBe(true);
      await box.scrollIntoViewIfNeeded();
      expect(await running(box)).toBe(0);
      expect(await final()).toBe(true);
    });
  }

  test("layouts: phones down a rail, tablets in a grid, desktop in a row", async ({
    page,
  }) => {
    // This project's viewport, then a 768 px tablet.
    for (const width of [page.viewportSize()!.width, 768]) {
      if (width === 768) await page.setViewportSize({ width, height: 1024 });
      for (const flow of flows) {
        await page.goto(`/work/${flow.slug}`);
        const box = root(page, flow.slug);
        await box.scrollIntoViewIfNeeded();
        // offsetTop ignores the reveal's rise.
        const tops = await box
          .locator(flow.items)
          .evaluateAll((els) => els.map((el) => (el as HTMLElement).offsetTop));
        // VDR: 3 × 2 from 768 px, one row from 1024; MCH: one row from 768.
        expect(new Set(tops).size, `${flow.slug} at ${width}`).toBe(
          width >= 1024 ? 1 : width >= 768 ? flow.tablet : flow.count,
        );
      }
    }
  });
});
