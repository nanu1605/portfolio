import { expect, test, type Locator, type Page } from "@playwright/test";
import { during, goLive, observe, throttle } from "./lib/centerpiece";

// §10.2 VYRO "Gauge panel" and docs/cross-device.md §8 Phase 5: by mouse,
// touch and keyboard; reduced motion; pausing off-screen; the poster swap,
// the chunk size and the interaction cost.

const isTouch = (name: string) => !name.startsWith("desktop-");
const isChromium = (name: string) =>
  name === "desktop-chromium" || name === "phone-android";

async function open(page: Page) {
  await observe(page);
  await page.goto("/work/vyro");
  const root = page.locator('[data-centerpiece="vyro"]');
  const ready = page.locator('[data-centerpiece="vyro"][data-ready]');
  return { root, ready };
}

/** Every number on the two dials, as shown. */
const dials = (root: Locator) => root.locator("[data-dial]").allInnerTexts();
const needle = (root: Locator) =>
  root.locator("[data-needle]").first().getAttribute("transform");

/** Taps on touch projects, clicks elsewhere. */
async function press(target: Locator, touch: boolean) {
  if (touch) await target.tap();
  else await target.click();
}

test("plays by itself, eases the needles by transform, and pauses", async ({
  page,
}, testInfo) => {
  const touch = isTouch(testInfo.project.name);
  const { root, ready } = await open(page);
  const live = await goLive(page, root, ready);
  await testInfo.attach("swap", {
    body: JSON.stringify(live, null, 2),
    contentType: "application/json",
  });
  expect(live.shift).toBeLessThan(0.001);
  expect(live.bytes).toBeLessThanOrEqual(60_000);

  // The honesty label sits next to the gauges, visible at every width.
  await expect(
    root.getByText("Simulated values — VYRO reads the real ones."),
  ).toBeInViewport();
  // The sparkline's text version.
  await expect(
    root.getByText(/^Last 60 s: low \d+ °C, high \d+ °C$/),
  ).toBeAttached();

  // Moving on its own, through the needle's transform.
  const pause = root.getByRole("button", { name: "Pause" });
  await expect(pause).toBeVisible();
  const first = await needle(root);
  await expect.poll(() => needle(root)).not.toBe(first);
  // Nothing here runs as a CSS or Web Animation (one rAF loop does it).
  expect(
    await root.evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);

  // A 44 px control on touch.
  const box = await pause.boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  const y = await page.evaluate(() => scrollY);
  await press(pause, touch);
  const play = root.getByRole("button", { name: "Play" });
  await expect(play).toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBe(y);

  // Paused: nothing moves.
  const still = await dials(root);
  await page.waitForTimeout(1500);
  expect(await dials(root)).toEqual(still);

  // Play resumes.
  await press(play, touch);
  await expect(pause).toBeVisible();
  await expect.poll(() => dials(root)).not.toEqual(still);
});

test("the easing loop rests between polls", async ({ page }, testInfo) => {
  test.skip(
    !isTouch(testInfo.project.name),
    "Lenis keeps its own frame loop on fine pointers",
  );
  // Every requestAnimationFrame call on the page, timed.
  await page.addInitScript(() => {
    const w = window as typeof window & { __raf: number[] };
    const raf = w.requestAnimationFrame.bind(w);
    w.__raf = [];
    w.requestAnimationFrame = (cb) => {
      w.__raf.push(performance.now());
      return raf(cb);
    };
  });
  const { root, ready } = await open(page);
  await goLive(page, root, ready);
  // Three polls' worth: it eases after each one, then goes quiet, so the
  // longest pause between frames is many frames long.
  const { frames, frame, gap } = await page.evaluate(async () => {
    const w = window as typeof window & { __raf: number[] };
    w.__raf = [];
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 3000));
    const t = [t0, ...w.__raf, performance.now()];
    const gaps = t.slice(1).map((v, i) => v - t[i]!);
    const sorted = [...gaps].sort((a, b) => a - b);
    return {
      frames: w.__raf.length,
      frame: sorted[Math.floor(sorted.length / 2)]!,
      gap: sorted.at(-1)!,
    };
  });
  await testInfo.attach("frames", {
    body: JSON.stringify({ frames, frame, gap }),
    contentType: "application/json",
  });
  expect(frames).toBeGreaterThan(10);
  // WebKit under load can drop to a frame every 70 ms or so; a loop that
  // never rests still shows no gap over about twice its frame time.
  expect(gap).toBeGreaterThan(Math.max(100, 2 * frame));
});

test("each reading sits on its dial's centre at every width", async ({
  page,
}) => {
  const { root } = await open(page);
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await root.scrollIntoViewIfNeeded();
    // The dial's centre is (100, 100) in its 200 × 174 viewBox.
    const offsets = await root.locator("[data-dial]").evaluateAll((dials) =>
      dials.map((d) => {
        const svg = d.querySelector("svg")!.getBoundingClientRect();
        const text = d.querySelector(":scope > div")!.getBoundingClientRect();
        return Math.abs(
          text.top + text.height / 2 - (svg.top + (svg.height * 100) / 174),
        );
      }),
    );
    expect(offsets, `at ${width} px`).toHaveLength(2);
    for (const o of offsets) expect(o, `at ${width} px`).toBeLessThan(2);
  }
});

test("pauses off-screen and resumes in view", async ({ page }) => {
  const { root, ready } = await open(page);
  await goLive(page, root, ready);
  const panel = root.locator(":scope > div");
  await expect(panel).not.toHaveAttribute("data-paused");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(panel).toHaveAttribute("data-paused");
  // Let the last poll's easing stop, then check nothing changes.
  await page.waitForTimeout(300);
  const still = await dials(root);
  await page.waitForTimeout(1500);
  expect(await dials(root)).toEqual(still);

  await root.scrollIntoViewIfNeeded();
  await expect(panel).not.toHaveAttribute("data-paused");
  await expect.poll(() => dials(root)).not.toEqual(still);
});

test("reduced motion shows a still panel; Play changes values instantly", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { root, ready } = await open(page);
  const poster = await dials(root);
  const live = await goLive(page, root, ready);
  expect(live.shift).toBeLessThan(0.001);

  // The poster's values, held: it starts paused.
  const play = root.getByRole("button", { name: "Play" });
  await expect(play).toBeVisible();
  expect(await dials(root)).toEqual(poster);
  await page.waitForTimeout(1500);
  expect(await dials(root)).toEqual(poster);
  expect(
    await root.evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);

  // Play polls once a second and jumps straight to each value: half a
  // second of samples holds one or two needle positions, never an easing.
  await press(play, isTouch(testInfo.project.name));
  await expect.poll(() => dials(root)).not.toEqual(poster);
  const seen = new Set<string | null>();
  for (let i = 0; i < 10; i++) {
    seen.add(await needle(root));
    await page.waitForTimeout(50);
  }
  expect(seen.size).toBeLessThanOrEqual(2);
  expect(
    await root.evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test("works from the keyboard", async ({ page }) => {
  const { root, ready } = await open(page);
  await goLive(page, root, ready);

  const pause = root.getByRole("button", { name: "Pause" });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect(root.getByRole("button", { name: "Play" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(root.getByRole("button", { name: "Pause" })).toBeFocused();

  await page.keyboard.press("Tab");
  const reveal = root.getByRole("button", {
    name: "What your browser can see",
  });
  await expect(reveal).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(reveal).toHaveAttribute("aria-expanded", "true");
  await expect(root.getByText("Logical processors")).toBeVisible();
});

test("shows what the browser can see, on request only, without sending it", async ({
  page,
}, testInfo) => {
  const { root, ready } = await open(page);
  await goLive(page, root, ready);

  const region = root.locator("#vyro-browser");
  await expect(region).toHaveAttribute("aria-live", "polite");
  await expect(region).toBeEmpty();
  await expect(
    root.getByText("Computed in your browser; nothing is sent."),
  ).toBeVisible();

  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  const reveal = root.getByRole("button", {
    name: "What your browser can see",
  });
  await press(reveal, isTouch(testInfo.project.name));
  await expect(reveal).toHaveAttribute("aria-expanded", "true");

  const cores = await page.evaluate(() => navigator.hardwareConcurrency);
  const dpr = await page.evaluate(() => devicePixelRatio);
  await expect(region).toContainText(`Logical processors${cores}`);
  await expect(region).toContainText(String(Math.round(dpr * 100) / 100));
  await expect(region).toContainText(
    "VYRO also sees temperatures, fan speeds, voltages and clocks.",
  );
  // navigator.deviceMemory is Chromium only, and labelled as capped there.
  const memory = await page.evaluate(
    () => (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
  );
  await expect(region).toContainText(
    memory === undefined
      ? "Not shared by this browser"
      : "Chromium; the browser caps it",
  );
  expect(requests).toEqual([]);

  await press(reveal, isTouch(testInfo.project.name));
  await expect(reveal).toHaveAttribute("aria-expanded", "false");
  await expect(region).toBeEmpty();
});

test("shows the measured footprint with its versions and sources", async ({
  page,
}) => {
  await page.goto("/work/vyro");
  const card = page.getByRole("region", { name: "Footprint" });
  for (const text of [
    "CPU with the window open",
    "0.46%",
    "RAM with the window open",
    // Shown with a capital first letter by CSS.
    "startup to first data",
    "installer",
    "VYRO README.md, private repo",
  ])
    await expect(card).toContainText(text);
  // The private repo is named, never linked.
  await expect(
    card.locator('a[href*="github.com/nanu1605/vyro/"]'),
  ).toHaveCount(0);
  await expect(card.getByRole("link", { name: /^Source/ })).toHaveAttribute(
    "href",
    /vyro-releases\/releases/,
  );
});

test("a vertical swipe over the gauges scrolls the page", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "phone-android",
    "CDP touch: Chromium touch projects",
  );
  const { root, ready } = await open(page);
  await goLive(page, root, ready);
  const box = (await root.locator("[data-dial]").first().boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const before = await page.evaluate(() => scrollY);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y - i * 15 }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
});

test(
  "interaction stays under the INP and long-task budgets at 4× CPU throttle",
  { tag: "@budget" },
  async ({ page }, testInfo) => {
    test.skip(
      !isChromium(testInfo.project.name),
      "longtask and event timing: Chromium only",
    );
    const touch = isTouch(testInfo.project.name);
    const { root, ready } = await open(page);
    await goLive(page, root, ready);
    // The site's own first-pointer work (desktop pointer effects) happens
    // before the measured window, so it counts only the panel.
    if (!touch) await root.getByRole("button", { name: "Pause" }).hover();
    await page.waitForTimeout(500);
    const release = await throttle(page);
    const reveal = root.getByRole("button", {
      name: "What your browser can see",
    });
    // Three passes, judged by the median: parallel workers on one machine can
    // add a stray long task to one pass, while a cost of the panel's own shows
    // up in most of them. All three are attached.
    const passes: Awaited<ReturnType<typeof during>>[] = [];
    for (let i = 0; i < 3; i++) {
      passes.push(
        await during(page, async () => {
          await press(root.getByRole("button", { name: "Pause" }), touch);
          await press(root.getByRole("button", { name: "Play" }), touch);
          // A second and a half of easing, then the browser readout.
          await page.waitForTimeout(1500);
          await press(reveal, touch);
          await expect(reveal).toHaveAttribute("aria-expanded", "true");
        }),
      );
      await press(reveal, touch);
    }
    await release();
    await testInfo.attach("interaction", {
      body: JSON.stringify(passes, null, 2),
      contentType: "application/json",
    });
    const median = (key: "longest" | "slowestEvent") =>
      passes.map((p) => p[key]).sort((a, b) => a - b)[1]!;
    expect(median("longest")).toBeLessThan(50);
    expect(median("slowestEvent")).toBeLessThan(200);
  },
);
