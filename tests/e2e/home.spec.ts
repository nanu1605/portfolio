import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { projects } from "../../content/projects";

const html = (page: Page) => page.locator("html");
const isTouch = (name: string) => !name.startsWith("desktop-");

/** The theme toggle: in the header from 768 px, in the menu below. */
async function themeToggle(page: Page, name: string) {
  // Its label is generic until the theme is known after hydration.
  await page.waitForFunction(
    () => !document.querySelector('[aria-label="Toggle theme"]'),
  );
  const inHeader = page
    .locator("[data-header] > div")
    .getByRole("button", { name });
  if (await inHeader.isVisible()) return inHeader;
  await page.getByRole("button", { name: "Open menu" }).click();
  return page.getByRole("dialog").getByRole("button", { name });
}

/** Step down the page so every reveal and deferred section has run. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += window.innerHeight / 2
    ) {
      window.scrollTo({ top: y, behavior: "instant" });
      await frame();
    }
  });
}

test("home renders in the dark theme by default", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "From model to machine." }),
  ).toBeVisible();
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  // The hero stage stays dark in both themes (§5.2).
  await expect(page.locator("[data-hero]")).toHaveAttribute(
    "data-theme",
    "dark",
  );
});

test("theme choice persists and applies before hydration", async ({ page }) => {
  await page.goto("/");
  await (await themeToggle(page, "Switch to light theme")).click();
  await expect(html(page)).toHaveAttribute("data-theme", "light");

  // Block the app's JS: if the theme still applies, the inline script set it
  // before first paint, so there is no flash of the dark theme.
  await page.route("**/_next/static/chunks/**", (route) => route.abort());
  await page.reload();
  await expect(html(page)).toHaveAttribute("data-theme", "light");
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in the ${theme} theme`, async ({ page }) => {
    // Final states, so nothing is mid-fade when axe checks contrast.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-theme", theme);
    await scrollThrough(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("hero and reveals work with the app's JS blocked", async ({ page }) => {
  await page.route("**/_next/static/chunks/*.js", (route) => route.abort());
  await page.goto("/");

  // The photo's entrance is CSS from first paint and ends by 700 ms.
  const photo = page.locator(".hero-photo");
  const end = await photo.evaluate((el) => {
    const timing = el.getAnimations()[0]?.effect?.getComputedTiming();
    return timing ? Number(timing.delay) + Number(timing.duration) : 0;
  });
  expect(end).toBeGreaterThan(0);
  expect(end).toBeLessThanOrEqual(700);
  await expect
    .poll(() => photo.evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // The proof strip's final values are in the HTML.
  await expect(page.getByText("1,037", { exact: true }).first()).toBeAttached();

  await scrollThrough(page);
  await expect(page.locator("[data-reveal]:not([data-revealed])")).toHaveCount(
    0,
  );
});

test("the proof strip counts up to the values in the HTML", async ({
  page,
}) => {
  await page.goto("/");
  const values = page.locator("main ul").first().locator(".inline-grid");
  for (const [i, value] of [
    [0, "16"],
    [3, "0.27 → 0.78"],
  ] as const) {
    await values.nth(i).scrollIntoViewIfNeeded();
    await expect(values.nth(i).locator("> :last-child")).toHaveText(value);
  }
});

test("stack skills and projects highlight each other", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const stack = page.locator("#stack");
  const rust = stack.getByRole("button", { name: "Rust", exact: true });
  await rust.scrollIntoViewIfNeeded();
  const wide = (page.viewportSize()?.width ?? 0) >= 1024;
  const vyro = stack.getByRole("button", { name: "VYRO", exact: true });

  if (!isTouch(testInfo.project.name)) {
    // Hover previews; the project column lights up, visibly.
    const border = () =>
      vyro.evaluate((el) => getComputedStyle(el).borderColor);
    const plain = await border();
    await rust.hover();
    await expect(vyro).toHaveAttribute("data-highlight", "true");
    await expect.poll(border).not.toBe(plain);
    await page.mouse.move(0, 0);
    await expect(vyro).not.toHaveAttribute("data-highlight");
    // A project previews its skills.
    await vyro.hover();
    await expect(rust).toHaveAttribute("data-highlight", "true");
    await page.mouse.move(0, 0);
    // Focus previews too; Kubernetes lights up the Bosch timeline entry.
    await stack
      .getByRole("button", { name: "Kubernetes", exact: true })
      .focus();
    await expect(page.locator('[data-entry="bosch"]')).toHaveAttribute(
      "data-highlight",
      "",
    );
    await page.locator("body").focus();
  }

  // A click or tap pins.
  if (isTouch(testInfo.project.name)) await rust.tap();
  else await rust.click();
  await expect(rust).toHaveAttribute("aria-pressed", "true");
  if (wide) {
    await expect(vyro).toHaveAttribute("data-highlight", "true");
  } else {
    // Below 1024 px the pinned skill lists its projects inline.
    await expect(
      stack.getByRole("link", { name: "VYRO", exact: true }),
    ).toBeVisible();
  }
});

test("honesty labels are visible at 360 px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone-android", "360 px phone");
  // Home has none until the Phase 5 demos; the styleguide's figure has one.
  for (const route of ["/", "/styleguide"]) {
    await page.goto(route);
    await scrollThrough(page);
    const labels = await page.locator("[data-honesty]").all();
    for (const label of labels) {
      await label.scrollIntoViewIfNeeded();
      await expect(label).toBeVisible();
      const box = (await label.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(360);
    }
  }
});

test("every link on Home goes somewhere real", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "runs once");
  // §7 routes. Pages built in later phases are listed, not fetched.
  const built = ["/", "/styleguide"];
  const planned = [
    "/work",
    "/company",
    "/about",
    "/open-source",
    "/now",
    "/uses",
    "/resume",
    "/contact",
    "/privacy",
    ...projects.map((p) => `/work/${p.slug}`),
  ];
  await page.goto("/");
  const hrefs = await page
    .locator("a[href]")
    .evaluateAll((links) => [
      ...new Set(links.map((a) => a.getAttribute("href")!)),
    ]);

  const problems: string[] = [];
  const pending = new Set<string>();
  for (const href of hrefs) {
    if (href.startsWith("#")) {
      if ((await page.locator(href).count()) !== 1)
        problems.push(`${href}: no element`);
    } else if (href.startsWith("/")) {
      const path = href.split("#")[0]!;
      if (built.includes(path)) {
        const res = await request.get(path);
        if (!res.ok()) problems.push(`${href}: HTTP ${res.status()}`);
      } else if (planned.includes(path)) pending.add(path);
      else problems.push(`${href}: not a §7 route`);
    } else if (href.startsWith("mailto:")) {
      if (!/^mailto:\S+@\S+$/.test(href)) problems.push(`${href}: bad mailto`);
    } else if (new URL(href).protocol !== "https:") {
      problems.push(`${href}: not https`);
    }
  }
  await testInfo.attach("routes-pending.json", {
    body: JSON.stringify([...pending].sort(), null, 2),
    contentType: "application/json",
  });
  expect(problems).toEqual([]);
});

for (const theme of ["dark", "light"] as const) {
  test(`visual: full page in the ${theme} theme`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto("/");
    await scrollThrough(page);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    // Render deferred sections too, for the full-page capture.
    await page.addStyleTag({
      content: ".defer-render { content-visibility: visible !important; }",
    });
    await page.evaluate(() => document.fonts.ready);
    await testInfo.attach(`home-${theme}.jpg`, {
      body: await page.screenshot({
        fullPage: true,
        type: "jpeg",
        quality: 70,
      }),
      contentType: "image/jpeg",
    });
  });
}
