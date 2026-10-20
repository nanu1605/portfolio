import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

// Phase 2 checks (docs/cross-device.md §8) on /styleguide, which renders
// every component and motion primitive.

const isTouch = (name: string) => !name.startsWith("desktop-");

async function open(page: Page, theme: "dark" | "light" = "dark") {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto("/styleguide");
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in the ${theme} theme`, async ({ page }) => {
    await open(page, theme);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("keyboard focus is always visible", async ({ page }, testInfo) => {
  test.skip(isTouch(testInfo.project.name), "keyboard runs on desktop");
  await open(page);
  let stops = 0;
  for (; stops < 80; stops++) {
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return `${el.tagName} ${style.outlineStyle} ${style.outlineWidth}`;
    });
    if (outline === null) break; // past the last stop
    expect(outline, `tab stop ${stops + 1}`).toMatch(/ solid 2px$/);
  }
  // WebKit's Tab skips links by default (macOS setting), so it has fewer stops.
  expect(stops).toBeGreaterThan(10);
});

test("tabs, tooltip and dialog work from the keyboard", async ({
  page,
}, testInfo) => {
  test.skip(isTouch(testInfo.project.name), "keyboard runs on desktop");
  await open(page);

  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);

  const tip = page.getByRole("tooltip");
  await page.getByRole("button", { name: /CPU with the window open/ }).focus();
  await expect(tip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tip).toBeHidden();

  const trigger = page.getByRole("button", { name: "Problem", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("reduced motion shows final states and runs nothing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const w = window as typeof window & { __raf: number };
    w.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      w.__raf++;
      return raf(cb);
    };
  });
  await open(page);

  const state = await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 300));
    const w = window as typeof window & { __raf: number };
    const before = w.__raf;
    await new Promise((r) => setTimeout(r, 1000));
    return {
      idleFrames: w.__raf - before,
      running: document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => (a as CSSAnimation).animationName ?? "transition"),
      hidden: [...document.querySelectorAll("[data-reveal], .word")].filter(
        (el) => {
          const s = getComputedStyle(el);
          return s.opacity !== "1" || s.transform !== "none";
        },
      ).length,
      dash: getComputedStyle(document.querySelector(".signal-draw")!)
        .strokeDashoffset,
      counts: [...document.querySelectorAll(".inline-grid")].map(
        (el) => el.lastElementChild!.textContent,
      ),
    };
  });

  expect(state.running).toEqual([]);
  expect(state.idleFrames).toBe(0);
  expect(state.hidden).toBe(0);
  expect(state.dash).toMatch(/^0(px)?$/);
  expect(state.counts).toEqual(
    expect.arrayContaining(["16", "1,037", "0.27 → 0.78"]),
  );
});

test("count-up ends on the value in the HTML", async ({ page }) => {
  await open(page);
  const value = page.locator(".inline-grid").first();
  await value.scrollIntoViewIfNeeded();
  await expect(value.locator("> :last-child")).toHaveText("16");
  await expect(value.locator(".sr-only")).toHaveText("16");
});

test("loops pause off-screen and in hidden tabs", async ({ page }) => {
  await open(page);
  const loop = page.getByTestId("signal-hero").locator("> div");

  await loop.scrollIntoViewIfNeeded();
  await expect(loop).not.toHaveAttribute("data-paused");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(loop).toHaveAttribute("data-paused", "");

  await loop.scrollIntoViewIfNeeded();
  await expect(loop).not.toHaveAttribute("data-paused");

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(loop).toHaveAttribute("data-paused", "");
});

test("pointer effects load on fine pointers only", async ({
  page,
}, testInfo) => {
  await open(page);
  const html = page.locator("html");

  if (isTouch(testInfo.project.name)) {
    await page.waitForTimeout(1000);
    await expect(html).not.toHaveAttribute("data-pointer-fx");
    await expect(html).not.toHaveClass(/\blenis\b/);
    return;
  }

  await expect(html).toHaveAttribute("data-pointer-fx", "");
  await expect(html).toHaveClass(/\blenis\b/);

  const card = page.locator("a[data-spotlight]").nth(2);
  await card.scrollIntoViewIfNeeded();
  const box = (await card.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 20);
  await page.mouse.move(box.x + 40, box.y + 24);
  await expect(card).toHaveAttribute("data-spot", "on");
  expect(
    await card.evaluate((el) => el.style.getPropertyValue("--spot-x")),
  ).toBe("40px");

  const cta = page.locator("[data-magnetic]").first();
  await cta.scrollIntoViewIfNeeded();
  const b = (await cta.boundingBox())!;
  await page.mouse.move(b.x + b.width - 2, b.y + b.height / 2);
  await expect
    .poll(() =>
      cta
        .locator("[data-magnetic-inner]")
        .evaluate((el) => parseFloat(el.style.getPropertyValue("--mag-x"))),
    )
    .toBeGreaterThan(5);
});

test("touch bloom runs on cards, and not for a scroll", async ({
  page,
}, testInfo) => {
  test.skip(!isTouch(testInfo.project.name), "touch projects only");
  await open(page);
  const card = page.locator("a[data-spotlight]").nth(2);
  await card.scrollIntoViewIfNeeded();

  const fire = (type: string) =>
    card.evaluate((el, t) => {
      const box = el.getBoundingClientRect();
      el.dispatchEvent(
        new PointerEvent(t, {
          pointerType: "touch",
          clientX: box.x + 20,
          clientY: box.y + 20,
          bubbles: true,
        }),
      );
    }, type);

  // A press: blooms after the delay, fades after release.
  await fire("pointerdown");
  await expect(card).toHaveAttribute("data-spot", "bloom");
  await fire("pointerup");
  await expect(card).not.toHaveAttribute("data-spot");

  // A scroll that starts on the card: the browser cancels the pointer.
  await fire("pointerdown");
  await fire("pointercancel");
  await page.waitForTimeout(200);
  await expect(card).not.toHaveAttribute("data-spot");
});

/** Computed styles that a press can change, including the halo and underline. */
const look = (el: Locator) =>
  el.evaluate((node) => {
    const s = getComputedStyle(node);
    const after = getComputedStyle(node, "::after");
    return [
      s.opacity,
      s.backgroundColor,
      s.transform,
      s.color,
      after.opacity,
      after.transform,
    ].join("|");
  });

test("every tappable element changes on press, and nothing sticks after a tap", async ({
  page,
}, testInfo) => {
  test.slow();
  await open(page);
  const targets = page.locator(
    "main a[href], main button, main summary, main [role=tab]",
  );
  const count = await targets.count();
  const unchanged: string[] = [];

  for (let i = 0; i < count; i++) {
    const el = targets.nth(i);
    if (!(await el.isVisible())) continue;
    // hover() scrolls, waits for the element to be stable and moves there.
    await el.hover();
    const before = await look(el);
    await page.mouse.down();
    // Large surfaces press 100 ms late; transitions take 150 ms.
    await page.waitForTimeout(450);
    const pressed = await look(el);
    // Slide off before releasing, so nothing is clicked.
    await page.mouse.move(0, 0);
    await page.mouse.up();
    if (pressed === before)
      unchanged.push(await el.evaluate((n) => n.outerHTML.slice(0, 80)));
  }
  expect(unchanged).toEqual([]);

  if (isTouch(testInfo.project.name)) {
    const chip = page.getByRole("button", { name: "Products" });
    const before = await look(chip);
    await chip.tap();
    await page.waitForTimeout(300);
    expect(await look(chip)).toBe(before);
  }
});

test("tap targets on touch", async ({ page }, testInfo) => {
  test.skip(!isTouch(testInfo.project.name), "touch projects only");
  await open(page);
  // axe (above) enforces the 24 px minimum with its spacing and inline
  // exceptions. Here, attach what is under the 44 px goal for review,
  // skipping links inside running text, which are exempt.
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("main a[href], main button, main summary")]
      .filter((el) => !el.closest("p") && el.checkVisibility())
      .map((el) => {
        const r = el.getBoundingClientRect();
        // TextLink widens its hit area with an absolute ::before.
        const hit = getComputedStyle(el, "::before");
        const grow = (a: string, b: string) =>
          hit.position === "absolute"
            ? -(parseFloat(a) || 0) - (parseFloat(b) || 0)
            : 0;
        return {
          el: el.textContent?.trim().slice(0, 40),
          w: r.width + grow(hit.left, hit.right),
          h: r.height + grow(hit.top, hit.bottom),
        };
      })
      .filter((t) => t.w < 44 || t.h < 44),
  );
  await testInfo.attach("targets-under-44px.json", {
    body: JSON.stringify(small, null, 2),
    contentType: "application/json",
  });
});
