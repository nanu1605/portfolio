import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const html = (page: import("@playwright/test").Page) => page.locator("html");

test("home renders in the dark theme by default", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "From model to machine.",
  );
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
});

test("theme choice persists and applies before hydration", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(html(page)).toHaveAttribute("data-theme", "light");

  // Block the app's JS: if the theme still applies, the inline script set it
  // before first paint, so there is no flash of the dark theme.
  await page.route("**/_next/static/chunks/**", (route) => route.abort());
  await page.reload();
  await expect(html(page)).toHaveAttribute("data-theme", "light");
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in the ${theme} theme`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-theme", theme);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
