import { expect, test, type Page } from "@playwright/test";

// Page chrome (§8.1, cross-device §4): skip link, header, mobile menu, footer.

const isTouch = (name: string) => !name.startsWith("desktop-");
const header = (page: Page) => page.locator("[data-header]");

test("the skip link is the first stop and moves focus to main", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(isTouch(testInfo.project.name), "keyboard runs on desktop");
  // Safari's Tab skips links unless Option is held (the macOS default), and
  // Playwright's WebKit can't send Option+Tab.
  test.skip(browserName === "webkit", "WebKit's Tab skips links");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("the header hides on the way down and returns on the way up", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await expect(header(page)).toHaveAttribute("data-hidden", "");
  await page.evaluate(() => window.scrollBy({ top: -40, behavior: "instant" }));
  await expect(header(page)).not.toHaveAttribute("data-hidden");
});

test("the header stays put under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
  await page.waitForTimeout(200);
  await expect(header(page)).not.toHaveAttribute("data-hidden");
  await expect(header(page)).toBeInViewport();
});

test("“See my work” lands on the section, clear of the header", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const cta = page.getByRole("link", { name: "See my work" });
  if (isTouch(testInfo.project.name)) await cta.tap();
  else await cta.click();
  const heading = page.locator("#work-title");
  // Wait for smooth scrolling to settle.
  await expect
    .poll(async () => (await heading.boundingBox())?.y ?? -1, {
      intervals: [200, 200, 300, 500],
    })
    .toBeLessThan((page.viewportSize()?.height ?? 0) / 2);
  // Lenis and CSS both stop the section at scroll-padding-top, the header's
  // height, and no further.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const top = document
          .getElementById("work")!
          .getBoundingClientRect().top;
        const header = parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        );
        return Math.round(Math.abs(top - header));
      }),
    )
    .toBeLessThanOrEqual(2);
  const covered = await heading.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(box.x + 4, box.y + box.height / 2);
    return !el.contains(hit);
  });
  expect(covered).toBe(false);
});

test("the mobile menu opens, closes and navigates by touch", async ({
  page,
}, testInfo) => {
  test.skip(!isTouch(testInfo.project.name), "touch projects");
  await page.goto("/");
  const open = page.getByRole("button", { name: "Open menu" });
  test.skip(!(await open.isVisible()), "desktop layout from 1024 px");

  const dialog = page.getByRole("dialog", { name: "Menu" });
  await open.tap();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Resume" })).toBeVisible();
  await dialog.getByRole("button", { name: "Close menu" }).tap();
  await expect(dialog).toBeHidden();

  await open.tap();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Work", exact: true }).tap();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/work$/);
});

test("the mobile menu works from the keyboard", async ({ page }, testInfo) => {
  test.skip(isTouch(testInfo.project.name), "keyboard runs on desktop");
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto("/");
  const open = page.getByRole("button", { name: "Open menu" });
  await open.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  // The page behind the modal is inert: focus stays in the dialog (or
  // passes to the browser's own UI, which leaves body active).
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate(
        (el) =>
          el.contains(document.activeElement) ||
          document.activeElement === document.body,
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();
});

test("the footer shows the build date and links to privacy", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator("footer");
  await expect(footer).toContainText(
    /Last updated \d{1,2} [A-Z][a-z]{2} \d{4} · Privacy/,
  );
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "/privacy",
  );
  await expect(
    footer.getByRole("button", { name: "Copy email" }),
  ).toBeVisible();
});
