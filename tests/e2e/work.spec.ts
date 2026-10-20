import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { archive, projects } from "../../content/projects";

// The Work index (§8.3, docs/cross-device.md §8 Phase 4).

const studies = projects.filter((p) => p.caseStudy);
const isTouch = (name: string) => !name.startsWith("desktop-");
const cards = (page: Page) => page.locator("[data-filters]");
const visible = (list: Locator) =>
  list.evaluateAll((els) =>
    els
      .filter((el) => getComputedStyle(el).display !== "none")
      .map((el) => el.querySelector("h2, h3")?.textContent),
  );

test("lists every case study, then the archive", async ({ page }) => {
  await page.goto("/work");
  await expect(page).toHaveTitle("Work — Tanishq Jain");
  await expect(
    page.getByRole("heading", { level: 1, name: "Work" }),
  ).toBeVisible();
  expect(await visible(cards(page))).toEqual(
    [...studies].sort((a, b) => a.order - b.order).map((p) => p.title),
  );
  await expect(page.locator("[data-archive] li")).toHaveCount(archive.length);
});

test("filters by tap or click, and keeps ?filter= in step", async ({
  page,
}, testInfo) => {
  await page.goto("/work");
  // Wait for hydration: React owns the chips once they carry its handlers.
  await page.waitForFunction(() =>
    Object.keys(document.querySelector("[data-chip]")!).some((k) =>
      k.startsWith("__react"),
    ),
  );
  const press = (name: string) => {
    const chip = page.getByRole("button", { name, exact: true });
    return isTouch(testInfo.project.name) ? chip.tap() : chip.click();
  };

  await press("ML");
  await expect(page).toHaveURL(/\/work\?filter=ml$/);
  await expect(
    page.getByRole("button", { name: "ML", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() => visible(cards(page)))
    .toEqual(
      studies
        .filter((p) => p.filters.includes("ml"))
        .sort((a, b) => a.order - b.order)
        .map((p) => p.title),
    );
  await expect(page.locator("[data-archive]")).toBeHidden();
  await expect(page.locator("#work-index [role=status]")).toHaveText(
    /^Showing \d+ of \d+$/,
  );

  await press("Archive");
  await expect(page).toHaveURL(/\?filter=archive$/);
  await expect(page.locator("[data-work-grid]")).toBeHidden();
  await expect(page.locator("[data-archive]")).toBeVisible();

  await press("All");
  await expect(page).toHaveURL(/\/work$/);
  await expect.poll(() => visible(cards(page))).toHaveLength(studies.length);
  await expect(page.locator("[data-archive]")).toBeVisible();
});

test("a shared ?filter= link applies before the app's JS runs", async ({
  page,
}) => {
  await page.route("**/_next/static/chunks/*.js", (route) => route.abort());
  await page.goto("/work?filter=products");
  expect(await visible(cards(page))).toEqual(
    studies
      .filter((p) => p.filters.includes("products"))
      .sort((a, b) => a.order - b.order)
      .map((p) => p.title),
  );
  await expect(
    page.getByRole("button", { name: "Products", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("an unknown ?filter= shows everything", async ({ page }) => {
  await page.goto("/work?filter=%3Cscript%3E");
  await expect.poll(() => visible(cards(page))).toHaveLength(studies.length);
  await expect(
    page.getByRole("button", { name: "All", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations on /work in the ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto("/work");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("redirects (§4.4)", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "runs once");
  const expected: [string, string][] = [
    ["/cv", "/resume"],
    ["/vyro", "/work/vyro"],
    ["/baby", "/work/baby"],
    ["/jainav", "/company"],
    ["/github", "https://github.com/nanu1605"],
    ["/linkedin", "https://www.linkedin.com/in/tanishqjain010/"],
    ["/Tanishq_Jain_Resume.pdf", "/resume.pdf"],
  ];
  for (const [from, to] of expected) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(res.headers().location, from).toBe(to);
  }
});
