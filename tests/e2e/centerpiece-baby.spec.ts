import { expect, test, type Page } from "@playwright/test";
import { during, goLive, observe, throttle } from "./lib/centerpiece";

// §10.1 Baby "Follow a turn" (docs/cross-device.md §6, §8 Phase 5): the
// poster swap, the first play, chips by mouse, touch and keyboard, reduced
// motion, pausing off-screen and the interaction budgets.

const URL = "/work/baby";
const LABEL = "Scripted demo — not a live assistant.";
const isTouch = (name: string) => !name.startsWith("desktop-");

const root = (page: Page) => page.locator('[data-centerpiece="baby"]');
const ready = (page: Page) =>
  page.locator('[data-centerpiece="baby"][data-ready]');
const chip = (page: Page, name: string) =>
  root(page).getByRole("radio", { name, exact: true });
/** The chosen scenario's transcript (the others stay hidden for sizing). */
const transcript = (page: Page) =>
  root(page).locator("[data-transcript] [data-active]");

/** Animations the centerpiece is running now, and when the last one ends. */
const timeline = (page: Page) =>
  root(page).evaluate((el) => {
    const all = el.getAnimations({ subtree: true });
    return {
      count: all.length,
      running: all.filter((a) => a.playState === "running").length,
      paused: all.filter((a) => a.playState === "paused").length,
      end: Math.max(
        0,
        ...all.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0)),
      ),
    };
  });

async function live(page: Page) {
  await observe(page);
  await page.goto(URL);
  const result = await goLive(page, root(page), ready(page));
  // Well in view (its top above 60% of the viewport), where it plays. A
  // tall box can sit lower after scrollIntoViewIfNeeded on WebKit.
  await root(page).evaluate((el) =>
    window.scrollBy({
      top: el.getBoundingClientRect().top - 80, // clear of the header
      behavior: "instant",
    }),
  );
  return result;
}

test("the poster is the first scenario's final state; the swap shifts nothing", async ({
  page,
}, testInfo) => {
  await page.goto(URL);
  // Server HTML, before the live chunk: Hinglish, with its reply and gate.
  await expect(chip(page, "Hinglish")).toHaveAttribute("aria-checked", "true");
  await expect(root(page)).toContainText("CPU abhi 48°C par hai.");
  await expect(root(page).getByText(LABEL)).toBeVisible();

  const result = await live(page);
  await testInfo.attach("swap", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  expect(result.shift).toBeLessThan(0.001);
  expect(result.bytes).toBeGreaterThan(0);
  expect(result.bytes).toBeLessThanOrEqual(60_000);
});

test("the first scenario plays once in view, in under 5 s, then holds", async ({
  page,
}) => {
  await live(page);
  // It runs (or, if the frame is slow, has already queued) …
  await expect
    .poll(async () => (await timeline(page)).count)
    .toBeGreaterThan(0);
  const { end } = await timeline(page);
  expect(end).toBeGreaterThan(2000);
  expect(end).toBeLessThan(5000);
  // … then holds its final state with nothing left running.
  await expect
    .poll(async () => (await timeline(page)).count, { timeout: 8000 })
    .toBe(0);
  await expect(transcript(page)).toContainText("CPU abhi 48°C par hai.");
  await expect(chip(page, "Hinglish")).toHaveAttribute("aria-checked", "true");
});

test("the honesty label sits next to the demo at every width", async ({
  page,
}) => {
  await live(page);
  const label = root(page).getByText(LABEL);
  await expect(label).toBeVisible();
  await expect(label).toHaveAttribute("data-honesty", "");
  const illustrative = transcript(page).getByText("illustrative value");
  await expect(illustrative).toBeVisible();
});

test("a click or a tap plays the chosen scenario, without scrolling", async ({
  page,
}, testInfo) => {
  await live(page);
  const destructive = chip(page, "Destructive");
  await destructive.scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  if (isTouch(testInfo.project.name)) await destructive.tap();
  else await destructive.click();
  await expect(destructive).toHaveAttribute("aria-checked", "true");
  await expect(chip(page, "Hinglish")).toHaveAttribute("aria-checked", "false");
  expect(await page.evaluate(() => scrollY)).toBe(y);

  // The gate asks; Baby never confirms by voice, and silence means no.
  const graph = root(page).locator("svg[data-graph]:visible");
  await expect(graph).toHaveAttribute("aria-label", /run_shell, CONFIRM/);
  await expect(graph).toContainText("CONFIRM");
  await expect(transcript(page)).toContainText("Check the screen.");
  await expect(transcript(page)).toContainText(
    "Okay — I didn't delete anything.",
  );
  // The reply is announced once, politely, when the play ends.
  await expect(root(page).locator('[aria-live="polite"]')).toHaveText(
    "Okay — I didn't delete anything.",
    { timeout: 8000 },
  );
});

test("the privacy pin re-routes the turn to the local 9B and redacts", async ({
  page,
}) => {
  await live(page);
  await chip(page, "Privacy pin").click();
  const graph = root(page).locator("svg[data-graph]:visible");
  await expect(graph).toHaveAttribute(
    "data-route",
    "wake vad stt router cloud tools gate router local tools gate voice",
  );
  await expect(graph).toContainText("Redacted");
  await expect(graph).toContainText("read_file");
  await expect(transcript(page)).toContainText(
    "the file content is redacted from anything sent to the cloud",
  );
  // The rule that decided the turn is rule 1, Privacy pin.
  const fired = root(page).locator("li:visible", { hasText: "Fired" });
  await expect(fired.filter({ hasText: "Privacy pin → local" })).toHaveCount(1);
});

test("arrow keys, Home and End move the choice and play it", async ({
  page,
}) => {
  await live(page);
  await chip(page, "Hinglish").focus();
  const y = await page.evaluate(() => scrollY);
  await page.keyboard.press("ArrowRight");
  await expect(chip(page, "Privacy pin")).toBeFocused();
  await expect(chip(page, "Privacy pin")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.press("End");
  await expect(chip(page, "Destructive")).toBeFocused();
  await expect(chip(page, "Destructive")).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.press("ArrowRight"); // wraps
  await expect(chip(page, "Hinglish")).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(chip(page, "Destructive")).toBeFocused();
  await page.keyboard.press("Home");
  await expect(chip(page, "Hinglish")).toBeFocused();
  // Roving focus: only the chosen chip is in the tab order.
  await expect(root(page).locator('[role="radio"][tabindex="0"]')).toHaveCount(
    1,
  );
  expect(await page.evaluate(() => scrollY)).toBe(y);
});

test("Devanagari types in by whole words, in a lang=hi element", async ({
  page,
}) => {
  await live(page);
  await chip(page, "Hindi (Devanagari)").click();
  const reply = transcript(page).locator('[lang="hi"]').last();
  await expect(reply).toContainText("डाउनलोड फ़ोल्डर खोल दिया।");
  const words = await reply
    .locator("[data-w]")
    .evaluateAll((els) => els.map((e) => e.textContent));
  expect(words).toEqual(["डाउनलोड", "फ़ोल्डर", "खोल", "दिया।"]);
  // The router's rule 3, Devanagari, keeps it on the local 9B.
  const graph = root(page).locator("svg[data-graph]:visible");
  await expect(graph).toHaveAttribute("aria-label", /Router → Local 9B/);
});

test("reduced motion shows the final state at once, with no animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await live(page);
  expect((await timeline(page)).count).toBe(0);
  await expect(transcript(page)).toContainText("CPU abhi 48°C par hai.");

  await chip(page, "Destructive").click();
  await expect(transcript(page)).toContainText(
    "Okay — I didn't delete anything.",
  );
  expect((await timeline(page)).count).toBe(0);
  await expect(root(page).locator('[aria-live="polite"]')).toHaveText(
    "Okay — I didn't delete anything.",
  );
});

test("a play pauses off-screen and resumes in view", async ({ page }) => {
  await live(page);
  await expect
    .poll(async () => (await timeline(page)).count, { timeout: 8000 })
    .toBe(0);
  await chip(page, "Privacy pin").click();
  await expect
    .poll(async () => (await timeline(page)).running)
    .toBeGreaterThan(0);
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await expect.poll(async () => (await timeline(page)).running).toBe(0);
  expect((await timeline(page)).paused).toBeGreaterThan(0);
  await root(page).scrollIntoViewIfNeeded();
  await expect
    .poll(async () => (await timeline(page)).count, { timeout: 8000 })
    .toBe(0);
});

test("layout follows the width: vertical below 1024 px, horizontal above", async ({
  page,
}) => {
  await live(page);
  const wide = page.viewportSize()!.width >= 1024;
  const graphs = root(page).locator("svg[data-graph]");
  const box = await graphs.locator("visible=true").boundingBox();
  expect(box).not.toBeNull();
  // Horizontal is wider than tall; the vertical one the other way round.
  expect(box!.width > box!.height).toBe(wide);
  // The ladder: open on desktops, collapsed to the fired rule below.
  const rules = root(page).locator("ol li:visible", {
    hasText: "Game mode → cloud",
  });
  await expect(rules).toHaveCount(wide ? 1 : 0);
  if (!wide) {
    await expect(
      root(page).locator("li:visible", { hasText: "Fired" }),
    ).toHaveCount(1);
    await root(page).locator("summary").click();
    await expect(rules).toHaveCount(1);
  }
  // Chips are 44 px tall on touch (36 on a fine pointer), and no sideways scroll.
  const h = await chip(page, "Hinglish").evaluate(
    (el) => el.getBoundingClientRect().height,
  );
  expect(h).toBeGreaterThanOrEqual(36);
  const coarse = await page.evaluate(
    () => matchMedia("(pointer: coarse)").matches,
  );
  if (coarse) expect(h).toBeGreaterThanOrEqual(44);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

test("a vertical swipe over the graph scrolls the page", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== "chromium" || !isTouch(testInfo.project.name),
    "CDP touch on Chromium touch projects",
  );
  await live(page);
  const graph = root(page).locator("svg[data-graph]:visible");
  const box = (await graph.boundingBox())!;
  const x = box.x + box.width / 2;
  const y0 = box.y + Math.min(box.height - 10, 300);
  const cdp = await page.context().newCDPSession(page);
  const before = await page.evaluate(() => scrollY);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", y: number) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y }],
    });
  await touch("touchStart", y0);
  for (let i = 1; i <= 10; i++) await touch("touchMove", y0 - i * 20);
  await touch("touchEnd", y0 - 200);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(before + 50);
});

test("a chip change stays within the long-task and INP budgets", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName !== "chromium", "longtask and event timing: Chromium");
  await live(page);
  await expect
    .poll(async () => (await timeline(page)).count, { timeout: 8000 })
    .toBe(0);
  // Tap by coordinates, found beforehand: a role locator resolves inside
  // the page, and that work would be counted as the app's.
  const target = chip(page, "Privacy pin");
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const [x, y] = [box.x + box.width / 2, box.y + box.height / 2];
  const release = await throttle(page);
  const result = await during(page, async () => {
    if (isTouch(testInfo.project.name)) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
    // Let the transition commit and the replay start.
    await page.waitForTimeout(400);
  });
  await expect(target).toHaveAttribute("aria-checked", "true");
  await release();
  await testInfo.attach("interaction (4x CPU throttle)", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  expect(result.longest).toBeLessThan(50);
  expect(result.slowestEvent).toBeLessThan(200);
});
