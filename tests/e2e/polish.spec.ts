import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { contact } from "../../content/contact";
import { microcopy } from "../../content/microcopy";
import { projects } from "../../content/projects";
import { site } from "../../content/site";

// Phase 7: the command palette, page transitions, the "hey jarvis" toast,
// the console greeting, share images and structured data, and the
// analytics events (§19), on the device matrix (cross-device §8).

const isTouch = (t: TestInfo) => !t.project.name.startsWith("desktop-");
/** Server-side checks: once, on desktop-chromium. */
const once = (t: TestInfo) =>
  test.skip(t.project.name !== "desktop-chromium", "runs once");

const studies = projects.filter((p) => p.caseStudy);
const routes = [
  ...Object.keys(site.seo.pages),
  ...studies.map((p) => `/work/${p.slug}`),
];

/**
 * Goes to a route and waits for hydration: React owns the search button once
 * it carries its handlers, and its effects (the shortcut, the jarvis
 * listener) have run a task later.
 */
async function open(page: Page, route: string) {
  await page.goto(route);
  await page.waitForFunction(() => {
    const button = document.querySelector("header button[aria-keyshortcuts]");
    return !!button && Object.keys(button).some((k) => k.startsWith("__react"));
  });
  await page.evaluate(() => new Promise((r) => setTimeout(r, 50)));
}

const searchButton = (page: Page) =>
  page.getByRole("banner").getByRole("button", { name: "Search" });
const palette = (page: Page) => page.getByRole("dialog", { name: "Search" });
const input = (page: Page) => palette(page).getByRole("combobox");
const selected = (page: Page) =>
  palette(page).locator('[role="option"][aria-selected="true"]');

/** Records every View Transition: the `data-vt` it ran under and its animations. */
async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: unknown[] };
    w.__vt = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((arg: never) => {
      const entry = {
        kind: document.documentElement.dataset.vt ?? null,
        // Set once the transition has started (or was skipped).
        settled: false,
        animations: [] as {
          pseudo: string;
          duration: number;
          props: string[];
        }[],
      };
      w.__vt.push(entry);
      const t = start(arg);
      t.ready
        .then(() => {
          entry.animations = document.getAnimations().flatMap((a) => {
            const effect = a.effect as KeyframeEffect | null;
            if (!effect?.pseudoElement?.startsWith("::view-transition"))
              return [];
            const props = new Set(
              effect
                .getKeyframes()
                .flatMap((k) => Object.keys(k))
                .filter(
                  (k) =>
                    ![
                      "offset",
                      "easing",
                      "composite",
                      "computedOffset",
                    ].includes(k),
                ),
            );
            return [
              {
                pseudo: effect.pseudoElement,
                duration: Number(effect.getTiming().duration),
                props: [...props],
              },
            ];
          });
        })
        .catch(() => {})
        .finally(() => (entry.settled = true));
      return t;
    }) as typeof document.startViewTransition;
  });
}

type Transition = {
  kind: string | null;
  settled: boolean;
  animations: { pseudo: string; duration: number; props: string[] }[];
};
/** What a transition may animate besides position: opacity and its blending. */
const moves = (a: { props: string[] }) =>
  a.props.filter(
    (p) => !["opacity", "mixBlendMode", "pointerEvents"].includes(p),
  );
/** The overlay itself (sized by the browser) and groups may move; images may not. */
const images = (t: Transition) =>
  t.animations.filter(
    (a) => a.pseudo !== "::view-transition" && !a.pseudo.includes("group"),
  );
/** The recorded transitions, once the first `count` have started. */
async function transitions(page: Page, count = 1) {
  const all = () =>
    page.evaluate(() => (window as unknown as { __vt: Transition[] }).__vt);
  await expect
    .poll(async () => (await all()).filter((t) => t.settled).length)
    .toBeGreaterThanOrEqual(count);
  return all();
}
const supportsTransitions = (page: Page) =>
  page.evaluate(() => "startViewTransition" in document);

// ── Command palette (§6.4) ───────────────────────────────────────────────

test("the palette works from the keyboard", async ({ page }) => {
  await open(page, "/");
  // The shortcut's listener lands just after hydration; retry until it does.
  await expect(async () => {
    if (!(await palette(page).isVisible()))
      await page.keyboard.press("ControlOrMeta+k");
    await expect(palette(page)).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(input(page)).toBeFocused();

  // Everything is listed before typing, in its three groups.
  await expect(palette(page).getByRole("option")).toHaveCount(
    Object.keys(site.seo.pages).length + studies.length + 6,
  );
  for (const group of Object.values(microcopy.palette.groups))
    await expect(
      palette(page).getByRole("group", { name: group }),
    ).toBeVisible();

  await input(page).fill("forecast");
  await expect(selected(page)).toHaveText("Probabilistic forecasting");
  const id = await selected(page).getAttribute("id");
  await expect(input(page)).toHaveAttribute("aria-activedescendant", id!);
  await expect(palette(page).getByRole("status")).toHaveText(/result/);

  // The arrows wrap around.
  const count = await palette(page).getByRole("option").count();
  await page.keyboard.press("ArrowUp");
  await expect(selected(page)).toHaveAttribute(
    "id",
    new RegExp(`-${count - 1}$`),
  );
  await page.keyboard.press("ArrowDown");
  await expect(selected(page)).toHaveText("Probabilistic forecasting");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/probabilistic-forecasting$/);
  await expect(palette(page)).toBeHidden();

  // Esc closes it, and focus goes back to the button that opened it.
  await searchButton(page).focus();
  await page.keyboard.press("Enter");
  await expect(input(page)).toBeFocused();
  await input(page).fill("zzzz");
  await expect(
    palette(page).getByText(microcopy.palette.results.none).last(),
  ).toBeVisible();
  // One Esc closes it, even with text in the field.
  await page.keyboard.press("Escape");
  await expect(palette(page)).toBeHidden();
  await expect(searchButton(page)).toBeFocused();
});

test("the palette works by touch", async ({ page }, testInfo) => {
  test.skip(!isTouch(testInfo), "touch projects");
  await open(page, "/");
  await searchButton(page).tap();
  // Focused inside the tap, before the results chunk arrives (iOS keyboard).
  await expect(input(page)).toBeFocused();
  await expect(palette(page).getByRole("option").first()).toBeVisible();

  const box = (await palette(page).boundingBox())!;
  const width = page.viewportSize()!.width;
  if (width < 768) expect(box.width).toBe(width);
  else expect(box.width).toBeLessThan(width);
  // 48 px rows.
  const row = await palette(page).getByRole("option").first().boundingBox();
  expect(row!.height).toBeGreaterThanOrEqual(48);

  await palette(page).getByRole("button", { name: "Close search" }).tap();
  await expect(palette(page)).toBeHidden();

  await searchButton(page).tap();
  await input(page).fill("open source");
  await palette(page).getByRole("option", { name: "Open source" }).tap();
  await expect(page).toHaveURL(/\/open-source$/);
  await expect(palette(page)).toBeHidden();
});

test("the palette's actions: theme and email", async ({
  page,
  context,
}, testInfo) => {
  await open(page, "/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await searchButton(page).click();
  await input(page).fill("theme");
  await expect(selected(page)).toHaveText(microcopy.palette.actions.theme);
  await page.keyboard.press("Enter");
  await expect(palette(page)).toBeHidden();
  await expect(html).toHaveAttribute("data-theme", "light");

  // The clipboard needs a permission only Chromium grants here.
  if (testInfo.project.name !== "desktop-chromium") return;
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await searchButton(page).click();
  await input(page).fill("copy");
  await expect(selected(page)).toHaveText(microcopy.palette.actions.copyEmail);
  await page.keyboard.press("Enter");
  await expect(selected(page)).toHaveText(microcopy.copied);
  await expect(palette(page).getByRole("status")).toHaveText(microcopy.copied);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    site.email,
  );
});

for (const theme of ["dark", "light"] as const) {
  test(`the open palette has no axe violations in the ${theme} theme`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
    await open(page, "/");
    await searchButton(page).click();
    await expect(palette(page).getByRole("option").first()).toBeVisible();
    await input(page).fill("o");
    const results = await new AxeBuilder({ page })
      .include("dialog[open]")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

// ── Page transitions (§6.2, cross-device §4) ─────────────────────────────

test("a route change fades the page and settles", async ({ page }) => {
  await recordTransitions(page);
  await open(page, "/");
  // Near the top: WebKit scrolls smoothly (the page's CSS) under a click.
  await page
    .getByRole("main")
    .getByRole("link", { name: "Get in touch" })
    .click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Let's talk." }),
  ).toBeVisible();
  // Nothing left over once it has run: no transition, no data-vt. (Polling
  // getAnimations() mid-transition can crash Playwright's WebKit.)
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(
      () =>
        CSS.supports("selector(:active-view-transition)") &&
        document.documentElement.matches(":active-view-transition"),
    ),
  ).toBe(false);
  await expect(page.locator("html")).not.toHaveAttribute("data-vt", /./);

  if (!(await supportsTransitions(page))) return;
  const [t] = await transitions(page);
  expect(t?.kind).toBeNull();
  // The pages fade (React names them); nothing but groups moves.
  expect(t!.animations.some((a) => !a.pseudo.includes("root"))).toBe(true);
  for (const a of images(t!)) expect(moves(a)).toEqual([]);
});

test("under reduced motion a route change only fades, within 150 ms", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordTransitions(page);
  await open(page, "/work");
  test.skip(!(await supportsTransitions(page)), "no View Transitions");
  await page.locator('a[href="/work/baby"]').first().click();
  await expect(page).toHaveURL(/\/work\/baby$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Baby" }),
  ).toBeVisible();
  const [t] = await transitions(page);
  // Groups don't animate at all; images only fade.
  expect(
    t!.animations.filter((a) => a.pseudo.includes("group") && a.duration > 0),
  ).toEqual([]);
  for (const a of images(t!)) {
    expect(moves(a)).toEqual([]);
    expect(a.duration).toBeLessThanOrEqual(150);
  }
  // No cover morph.
  expect(t!.animations.some((a) => a.pseudo.includes("cover-"))).toBe(false);
});

test("a /work cover morphs into its case-study hero from 768 px", async ({
  page,
}) => {
  await recordTransitions(page);
  await open(page, "/work");
  test.skip(!(await supportsTransitions(page)), "no View Transitions");
  const wide = page.viewportSize()!.width >= 768;
  const card = page.locator('a[href="/work/baby"]').first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await expect(page).toHaveURL(/\/work\/baby$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Baby" }),
  ).toBeVisible();
  const [t] = await transitions(page);
  const morph = t!.animations.find(
    (a) => a.pseudo === "::view-transition-group(cover-baby)",
  );
  const pseudos = t!.animations.map((a) => a.pseudo);
  if (wide) {
    expect(pseudos).toContain("::view-transition-group(cover-baby)");
    expect(morph!.props).toContain("transform");
  } else expect(morph).toBeUndefined();
});

test("the theme and the Work filter run their own transitions", async ({
  page,
}) => {
  await recordTransitions(page);
  await open(page, "/work");
  test.skip(!(await supportsTransitions(page)), "no View Transitions");
  // No card is named until the filter runs.
  const name = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(await name("[data-vt-name]")).toBe("none");

  await page.locator('[data-chip="ml"]').click();
  await expect(page).toHaveURL(/\?filter=ml$/);
  const [filter] = await transitions(page);
  expect(filter!.kind).toBe("filter");
  expect(filter!.animations.some((a) => a.pseudo.includes("work-"))).toBe(true);
  expect(filter!.animations.some((a) => a.pseudo.includes("cover-"))).toBe(
    false,
  );

  // Below 768 px the toggle lives in the menu.
  const toggle = page
    .getByRole("banner")
    .getByRole("button", { name: /Switch to light theme/ });
  if (!(await toggle.isVisible())) return;
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const theme = (await transitions(page, 2))[1]!;
  expect(theme.kind).toBe("theme");
  expect(
    theme.animations.map((a) => a.pseudo).filter((p) => !p.endsWith("(root)")),
  ).toEqual([]);
});

// ── Small delights (§6.5) ────────────────────────────────────────────────

test("typing “hey jarvis” shows the toast, but not in a form field", async ({
  page,
}) => {
  await open(page, "/contact");
  const toast = page.locator("[data-toast]");
  await page.getByLabel("Message").fill("hey jarvis");
  await expect(toast).toBeHidden();

  await page.locator("main h1").click();
  // The listener arrives after the load event (after-load.ts).
  await expect(async () => {
    await page.keyboard.type("hey jarvis");
    await expect(toast).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect(toast).toContainText(microcopy.jarvisToast.text);
  await expect(
    toast.getByRole("link", { name: microcopy.jarvisToast.link }),
  ).toHaveAttribute("href", "/work/baby");
  await page.keyboard.press("Escape");
  await expect(toast).toBeHidden();
});

test("the console greets curious engineers", async ({ page }) => {
  const messages: string[] = [];
  page.on("console", (m) => messages.push(m.text()));
  await open(page, "/");
  await expect.poll(() => messages).toContain(microcopy.consoleGreeting);
});

// ── SEO (§11) ────────────────────────────────────────────────────────────

/** Width and height from a PNG's IHDR chunk. */
const pngSize = (bytes: Buffer) => [
  bytes.readUInt32BE(16),
  bytes.readUInt32BE(20),
];

test("every route has a share image, a canonical URL and a Twitter card", async ({
  page,
  request,
}, testInfo) => {
  once(testInfo);
  for (const route of routes) {
    await page.goto(route);
    const meta = (property: string) =>
      page.locator(`meta[property="${property}"], meta[name="${property}"]`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      route === "/" ? site.url : site.url + route,
    );
    await expect(meta("twitter:card")).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(meta("og:title")).toHaveAttribute("content", /Tanishq Jain/);
    const image = await meta("og:image").getAttribute("content");
    expect(image, route).toMatch(new RegExp(`^${site.url}`));
    const res = await request.get(
      new URL(image!).pathname + new URL(image!).search,
    );
    expect(res.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await res.body())).toEqual([1200, 630]);
  }
});

test("structured data: the site graph, breadcrumbs and the apps", async ({
  page,
}, testInfo) => {
  once(testInfo);
  const graph = async () =>
    (
      await page
        .locator('script[type="application/ld+json"]')
        .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent!)))
    ).flatMap((d) => d["@graph"] ?? [d]);

  await open(page, "/");
  let items = await graph();
  const person = items.find((i) => i["@type"] === "Person");
  expect(person.name).toBe(site.name);
  expect(person.jobTitle).toBe("ML & Systems Engineer");
  expect(person.sameAs).toEqual(Object.values(site.links));
  expect(person.address.addressLocality).toBe("Indore");
  expect(items.find((i) => i["@type"] === "Organization").founder).toEqual({
    "@id": person["@id"],
  });
  expect(items.some((i) => i["@type"] === "WebSite")).toBe(true);
  expect(items.some((i) => i["@type"] === "BreadcrumbList")).toBe(false);

  await open(page, "/work/baby");
  items = await graph();
  const crumbs = items.find((i) => i["@type"] === "BreadcrumbList");
  expect(crumbs.itemListElement.map((i: { name: string }) => i.name)).toEqual([
    "Home",
    "Work",
    "Baby",
  ]);
  const app = items.find((i) => i["@type"] === "SoftwareApplication");
  expect(app.operatingSystem).toBe("Windows");
  expect(app.offers).toEqual({
    "@type": "Offer",
    price: 0,
    priceCurrency: "INR",
  });
  expect(
    items.find((i) => i["@type"] === "SoftwareSourceCode").codeRepository,
  ).toBe("https://github.com/nanu1605/baby");

  // VYRO's repo is going private: the app, but no source entry.
  await open(page, "/work/vyro");
  items = await graph();
  expect(items.some((i) => i["@type"] === "SoftwareApplication")).toBe(true);
  expect(items.some((i) => i["@type"] === "SoftwareSourceCode")).toBe(false);
});

test("sitemap, robots, manifest and icons", async ({ request }, testInfo) => {
  once(testInfo);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const route of routes)
    expect(sitemap).toContain(`<loc>${new URL(route, site.url).href}</loc>`);
  expect(sitemap).not.toContain("/api");

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /api/");
  expect(robots).toContain(`Sitemap: ${site.url}/sitemap.xml`);

  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.short_name).toBe(site.name);
  for (const icon of manifest.icons) {
    const res = await request.get(icon.src);
    expect(res.headers()["content-type"]).toBe("image/png");
    expect(pngSize(await res.body()).join("x")).toBe(icon.sizes);
  }
});

// ── Analytics (§12) ──────────────────────────────────────────────────────

test("the custom analytics events fire", async ({ page }, testInfo) => {
  once(testInfo);
  // Vercel Analytics only loads on Vercel; stand in for its queue.
  await page.addInitScript(() => {
    const w = window as unknown as { va: unknown; __events: unknown[] };
    w.__events = [];
    w.va = (_: string, event: unknown) => w.__events.push(event);
  });
  const events = () =>
    page.evaluate(
      () =>
        (window as unknown as { __events: { name: string; data?: object }[] })
          .__events,
    );
  const fired = async (name: string, data?: object) =>
    expect
      .poll(async () =>
        (await events()).some(
          (e) =>
            e.name === name &&
            (!data || JSON.stringify(e.data) === JSON.stringify(data)),
        ),
      )
      .toBe(true);

  await open(page, "/resume");
  // Links stay put; only the events matter here.
  await page.evaluate(() =>
    document.addEventListener("click", (e) => e.preventDefault()),
  );
  await searchButton(page).click();
  await fired("palette_open");
  await page.keyboard.press("Escape");
  await expect(palette(page)).toBeHidden();

  await page.locator('main a[href="/resume.pdf"]').first().click();
  await fired("resume_download");
  await page
    .getByRole("contentinfo")
    .locator(`a[href="${site.links.github}"]`)
    .click();
  await fired("outbound_click", { target: "social" });

  await page
    .getByRole("banner")
    .getByRole("button", { name: /Switch to light theme/ })
    .click();
  await fired("theme_toggle");

  await open(page, "/work/vyro");
  await page.locator('[data-centerpiece="vyro"]').scrollIntoViewIfNeeded();
  const centerpiece = page.locator('[data-centerpiece="vyro"][data-ready]');
  await centerpiece.locator("button").first().click();
  await fired("centerpiece_interact", { slug: "vyro" });
  await page.evaluate(() =>
    document.addEventListener("click", (e) => e.preventDefault()),
  );
  await page.locator('main a[href$="/releases"]').first().click();
  await fired("outbound_click", { target: "download" });

  // The form's answer is stubbed; Turnstile's test key still runs.
  await page.route("**/api/contact", (route) =>
    route.fulfill({ json: { ok: true } }),
  );
  await open(page, "/contact");
  await expect(page.locator('[name="cf-turnstile-response"]')).toHaveValue(
    /.+/,
    { timeout: 20_000 },
  );
  await page.getByLabel(contact.labels.name, { exact: true }).fill("Ada");
  await page
    .getByLabel(contact.labels.email, { exact: true })
    .fill("ada@example.com");
  await page.getByLabel(contact.labels.message, { exact: true }).fill("Hello.");
  await page.getByRole("button", { name: contact.labels.send }).click();
  await fired("contact_submit", { status: "success" });
});
