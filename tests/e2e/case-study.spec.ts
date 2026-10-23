import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "../../content/projects";

// The case-study template (§8.4) and docs/cross-device.md §8 Phase 4.

const studies = projects
  .filter((p) => p.caseStudy)
  .sort((a, b) => a.order - b.order);
const isTouch = (name: string) => !name.startsWith("desktop-");

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += window.innerHeight / 2
    ) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
    }
  });
}

for (const [i, p] of studies.entries()) {
  test(`${p.slug}: renders with its metadata and navigation`, async ({
    page,
  }) => {
    await page.goto(`/work/${p.slug}`);
    // A.1: `{title}` and `{oneLiner}`, on the production canonical URL.
    await expect(page).toHaveTitle(`${p.title} — Tanishq Jain`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      p.oneLiner,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://tanishq.website/work/${p.slug}`,
    );
    await expect(
      page.getByRole("heading", { level: 1, name: p.title }),
    ).toBeVisible();
    await expect(page.locator("#tldr li")).toHaveCount(3);
    await expect(page.locator("#how-this-was-built")).toHaveCount(
      p.aiNative && p.howBuilt ? 1 : 0,
    );
    const previous = studies.at(i - 1)!;
    const next = studies[(i + 1) % studies.length]!;
    await expect(page.locator('a[rel="prev"]')).toHaveAttribute(
      "href",
      `/work/${previous.slug}`,
    );
    await expect(page.locator('a[rel="next"]')).toHaveAttribute(
      "href",
      `/work/${next.slug}`,
    );
  });

  // One fresh page per theme, so init scripts don't stack.
  for (const theme of ["dark", "light"] as const) {
    test(`${p.slug}: no axe violations in the ${theme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto(`/work/${p.slug}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await scrollThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("the reading progress bar moves by transform only", async ({ page }) => {
  await page.goto("/work/baby");
  const bar = page.locator("[data-progress]");
  const scale = () =>
    bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  // Nothing but transform is animated or transitioned.
  const props = await bar.evaluate((el) => [
    ...el
      .getAnimations()
      .flatMap((a) =>
        (a.effect as KeyframeEffect)
          .getKeyframes()
          .flatMap((k) =>
            Object.keys(k).filter(
              (key) =>
                !["offset", "easing", "composite", "computedOffset"].includes(
                  key,
                ),
            ),
          ),
      ),
    getComputedStyle(el).transitionProperty,
  ]);
  // "none" (WebKit, at times) and "all" with no duration both mean no transition.
  expect(
    props.filter((p) => !["transform", "all", "none"].includes(p)),
  ).toEqual([]);
  expect(await scale()).toBeLessThan(0.05);
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await expect.poll(scale).toBeGreaterThan(0.95);
  // Pinned to the top edge on its own, so it stays when the header hides.
  expect(await bar.evaluate((el) => getComputedStyle(el).position)).toBe(
    "fixed",
  );
  expect((await bar.boundingBox())?.y).toBe(0);
});

test("the TOC marks the section in view from 1024 px, and is absent below", async ({
  page,
}) => {
  // Instant anchor jumps: this checks the marking, not Lenis's smooth
  // scroll, which can stop short on a loaded CI machine.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/reservoir-rl");
  const toc = page.getByRole("navigation", { name: "On this page" });
  const wide = page.viewportSize()!.width >= 1024;
  if (!wide) {
    await expect(toc).toBeHidden();
    return;
  }
  await expect(toc.locator('[aria-current="location"]')).toHaveText("TL;DR");
  await toc.getByRole("link", { name: "Results" }).click();
  await expect(toc.locator('[aria-current="location"]')).toHaveText("Results");
});

test("a route change on touch lands at the top", async ({ page }, testInfo) => {
  test.skip(!isTouch(testInfo.project.name), "touch projects");
  await page.goto("/work/baby");
  const next = page.locator('a[rel="next"]');
  await next.scrollIntoViewIfNeeded();
  await next.tap();
  await page.waitForURL("**/work/vyro");
  const y = await page.evaluate(
    () => new Promise<number>((r) => requestAnimationFrame(() => r(scrollY))),
  );
  expect(y).toBe(0);
});

test("going back leaves the content above the viewport revealed", async ({
  page,
}) => {
  await page.goto("/work/baby");
  await scrollThrough(page);
  await page.locator('a[rel="next"]').click();
  await page.waitForURL("**/work/vyro");
  await page.goBack();
  await page.waitForURL("**/work/baby");
  // Wherever the browser restores the scroll to, jump past everything:
  // content that was never seen on the way must still end up revealed.
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          [...document.querySelectorAll("[data-reveal]")]
            .filter((el) => el.getBoundingClientRect().bottom < 0)
            .filter((el) => !el.hasAttribute("data-revealed")).length,
      ),
    )
    .toBe(0);
});

test("videos: one at a time, Pause sticks, reduced motion keeps the poster", async ({
  page,
  browserName,
}) => {
  // Playwright's WebKit and Firefox builds lack the H.264 decoder.
  test.skip(browserName !== "chromium", "Chromium plays the MP4s");
  await page.goto("/work/vyro");
  const hero = page.locator("video").first();
  await hero.scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-video", "playing");
  const pause = page.getByRole("button", { name: "Pause" });
  await pause.click();
  await expect(hero).toHaveAttribute("data-video", "paused");
  // The 3-D clip further down plays alone; the hero stays paused.
  const second = page.locator("video").nth(1);
  await second.scrollIntoViewIfNeeded();
  await expect(second).toHaveAttribute("data-video", "playing");
  expect(await page.locator('video[data-video="playing"]').count()).toBe(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForTimeout(500);
  await expect(page.locator('video[data-video="playing"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Play" }).first(),
  ).toBeVisible();
  // The poster is a lazy still under the transparent, unloaded video.
  const still = page
    .locator("video")
    .first()
    .locator("xpath=..")
    .locator("img");
  await still.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      still.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0),
    )
    .toBe(true);
});
