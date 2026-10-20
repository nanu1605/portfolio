import { expect, test, type Page } from "@playwright/test";
import { projects } from "../../content/projects";

// Routes to sweep for horizontal overflow. Add each route as it lands.
const routes = [
  "/",
  "/styleguide",
  "/work",
  ...projects.filter((p) => p.caseStudy).map((p) => `/work/${p.slug}`),
];

// docs/cross-device.md §8: 320 is the WCAG 1.4.10 reflow width, 744 is
// iPad mini portrait, 844×390 is phone landscape.
const sweep = [
  { width: 320, height: 640 },
  { width: 360, height: 732 },
  { width: 390, height: 844 },
  { width: 744, height: 1133 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 844, height: 390 },
];

const finePointer = "(hover: hover) and (pointer: fine)";

test("emulation reports the right input type", async ({ page }, testInfo) => {
  // The expectation comes from the project's class, not its config, so a
  // wrong descriptor on a phone or tablet project fails here.
  const touch = !testInfo.project.name.startsWith("desktop-");
  await page.goto("/");
  expect(await page.evaluate((q) => matchMedia(q).matches, finePointer)).toBe(
    !touch,
  );
});

async function overflowing(page: Page) {
  // Step down the page so lazy blocks mount, then let their chunks load.
  await page.evaluate(async () => {
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += window.innerHeight
    ) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
    }
  });
  // Not "networkidle": Next keeps prefetches for routes that don't exist
  // yet open. Images are sized and posters hold their boxes, so fonts are
  // the last thing that can move the layout.
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);

  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth;
    const width = document.documentElement.scrollWidth;
    if (width <= limit) return [];
    const culprits = [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > limit + 0.5)
      .slice(0, 10)
      .map(
        (el) => `${el.tagName.toLowerCase()}.${el.getAttribute("class") ?? ""}`,
      );
    // Overflowing text and pseudo-elements have no culprit box of their own.
    return culprits.length > 0
      ? culprits
      : [
          `scrollWidth ${width} > clientWidth ${limit} (text or pseudo-element)`,
        ];
  });
}

for (const route of routes) {
  test(`no horizontal overflow on ${route} at this device's viewport`, async ({
    page,
  }) => {
    await page.goto(route);
    expect(await overflowing(page)).toEqual([]);
  });

  test(`no horizontal overflow on ${route} from 320 to 1920 px`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-chromium",
      "width sweep runs once, on desktop-chromium",
    );
    for (const size of sweep) {
      await page.setViewportSize(size);
      await page.goto(route);
      expect(
        await overflowing(page),
        `${route} at ${size.width}×${size.height}`,
      ).toEqual([]);
    }
  });
}
