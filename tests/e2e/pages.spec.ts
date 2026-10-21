import AxeBuilder from "@axe-core/playwright";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { contact } from "../../content/contact";
import { now } from "../../content/now";
import { pullRequests } from "../../content/open-source";

// Phase 6: Company, About, Open source, Now, Uses, Privacy, 404, Resume
// (+ PDF) and Contact (§19), on the device matrix (cross-device §8).

const routes = [
  "/company",
  "/about",
  "/open-source",
  "/now",
  "/uses",
  "/privacy",
  "/resume",
  "/contact",
];
const isTouch = (t: TestInfo) => !t.project.name.startsWith("desktop-");
/** Server-side checks: once, on desktop-chromium. */
const once = (t: TestInfo) =>
  test.skip(t.project.name !== "desktop-chromium", "runs once");

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

/** A fresh address per test, so the per-IP rate limit never spills over. */
const someIp = () =>
  `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

for (const route of [...routes, "/not-a-page"]) {
  for (const theme of ["dark", "light"] as const) {
    test(`${route}: no axe violations in the ${theme} theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await scrollThrough(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        // Cloudflare's widget is theirs, in its own frame.
        .exclude("[data-turnstile]")
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("Now shows its last-updated date", async ({ page }) => {
  await page.goto("/now");
  const date = page.locator(`time[datetime="${now.updated}"]`);
  await expect(date).toBeVisible();
  await expect(date).toHaveText(/^\d{1,2} [A-Z][a-z]+ \d{4}$/);
  await expect(page.locator("main").getByText(now.updatedLabel)).toBeVisible();
});

test("the 404 page: status, copy, and the needle at zero", async ({
  page,
}, testInfo) => {
  const res = await page.goto("/not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sensor not found.",
  );
  await expect(
    page.getByRole("link", { name: "Back to home" }),
  ).toHaveAttribute("href", "/");
  // The drop is a CSS keyframe that ends at zero (−135°).
  const needle = page.locator("[data-needle-drop]");
  await expect
    .poll(() =>
      needle.evaluate((el) => {
        const m = new DOMMatrix(getComputedStyle(el).transform);
        return Math.round((Math.atan2(m.b, m.a) * 180) / Math.PI);
      }),
    )
    .toBe(-135);
  // Touch has no keyboard shortcut to point at (cross-device §3).
  const hint = page.getByText("Or press Ctrl K / ⌘K to search.");
  if (isTouch(testInfo)) await expect(hint).toBeHidden();
  else await expect(hint).toBeVisible();
});

test("reduced motion: every Phase 6 moment shows its final state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/not-a-page");
  expect(
    await page.locator("[data-needle-drop]").evaluate((el) => ({
      animations: el.getAnimations().length,
      transform: getComputedStyle(el).transform,
    })),
  ).toEqual({
    animations: 0,
    transform: expect.stringMatching(/^matrix\(-0\.707/),
  });

  await page.goto("/about");
  const line = page.locator("[data-draw-line]");
  expect(await line.evaluate((el) => getComputedStyle(el).transform)).toBe(
    "none",
  );

  await page.goto("/open-source");
  const dots = page.locator(".os-axis [data-dot]");
  await expect(dots).toHaveCount(pullRequests.prs.length);
  expect(
    await dots.evaluateAll((els) =>
      els.every((el) => getComputedStyle(el).opacity === "1"),
    ),
  ).toBe(true);

  await page.goto("/company");
  expect(
    await page
      .locator("[data-lift] [data-glow]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity)),
  ).toEqual(["0.2", "0.2", "0.2"]);
});

test("About: the timeline line draws to its end on every engine", async ({
  page,
}) => {
  await page.goto("/about");
  const line = page.locator("[data-draw-line]");
  const scale = () =>
    line.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
  // Before the timeline: not drawn.
  expect(await scale()).toBeLessThan(0.05);
  // Past it (its foot above mid-screen): drawn to the end. The list it
  // spans gives the unscaled box.
  await line.evaluate((el) => {
    const r = el.parentElement!.getBoundingClientRect();
    scrollBy({ top: r.bottom - innerHeight / 2 + 40, behavior: "instant" });
  });
  await expect.poll(scale).toBeGreaterThan(0.99);
});

test("Open source: the dots pop in by date; vertical below 640 px", async ({
  page,
}) => {
  await page.goto("/open-source");
  const axis = page.locator(".os-axis");
  await axis.scrollIntoViewIfNeeded();
  const dots = axis.locator("[data-dot]");
  await expect(dots).toHaveCount(pullRequests.prs.length);
  await expect
    .poll(() =>
      dots.evaluateAll((els) =>
        els.every(
          (el) =>
            getComputedStyle(el).opacity === "1" &&
            getComputedStyle(el).transform === "none",
        ),
      ),
    )
    .toBe(true);
  // In date order along the axis: down on phones, across from 640 px.
  const width = page.viewportSize()!.width;
  const along = await dots.evaluateAll(
    (els, vertical) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return vertical ? r.top : r.left;
      }),
    width < 640,
  );
  expect(along).toEqual([...along].sort((a, b) => a - b));

  // "View data" lists every PR, linked to it.
  await page.getByText("View data").click();
  const rows = page.locator("details table tbody tr");
  await expect(rows).toHaveCount(pullRequests.prs.length);
  await expect(rows.first().getByRole("link")).toHaveAttribute(
    "href",
    /^https:\/\/github\.com\/PecanProject\/pecan\/pull\/\d+$/,
  );
});

test("Company: launch flags hide the pending links; the email CTA", async ({
  page,
}) => {
  await page.goto("/company");
  await expect(
    page.locator('a[href^="https://jainavinfotech.in"]'),
  ).toHaveCount(0);
  await expect(
    page.getByText("jainavinfotech.in · launching soon"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Email the company/ }),
  ).toHaveAttribute("href", "mailto:support@jainavinfotech.in");
});

test("/resume.pdf is a PDF of at most two A4 pages, with real text", async ({
  request,
}, testInfo) => {
  once(testInfo);
  const res = await request.get("/resume.pdf");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toBe("application/pdf");
  const pdf = await res.body();
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  const raw = pdf.toString("latin1");
  const pages = Number(/\/Type \/Pages[^]*?\/Count (\d+)/.exec(raw)?.[1]);
  expect(pages).toBeGreaterThanOrEqual(1);
  expect(pages).toBeLessThanOrEqual(2);
  // A4 is 595.28 × 841.89 pt.
  expect(raw).toMatch(/\/MediaBox \[0 0 595\.2\d* 841\.8\d*\]/);
  // Text is drawn as text (BT … Tj/TJ) in a font, not as outlines.
  expect(raw).toContain("/Type /Font");
  const streams = [...raw.matchAll(/stream\r?\n([^]*?)\r?\nendstream/g)].map(
    (m) => {
      try {
        return inflateSync(Buffer.from(m[1]!, "latin1")).toString("latin1");
      } catch {
        return "";
      }
    },
  );
  expect(streams.some((s) => /BT[^]*?(Tj|TJ)[^]*?ET/.test(s))).toBe(true);
});

test("the web resume links the PDF as a download", async ({ page }) => {
  await page.goto("/resume");
  const link = page.getByRole("link", { name: "Download resume" });
  await expect(link).toHaveAttribute("href", "/resume.pdf");
  await expect(link).toHaveAttribute("download");
  expect(
    await page.getByRole("heading", { level: 2 }).allTextContents(),
  ).toEqual([
    "Summary",
    "Experience",
    "Selected projects",
    "Open source",
    "Education",
    "Skills",
    "Certifications",
  ]);
});

/** Routes the form's POST through a fresh client address. */
async function fromFreshIp(page: Page) {
  const ip = someIp();
  await page.route("**/api/contact", (route) =>
    route.continue({
      headers: { ...route.request().headers(), "x-forwarded-for": ip },
    }),
  );
}

async function fill(
  page: Page,
  testInfo: TestInfo,
  values: { name: string; email: string; message: string },
) {
  // Touch projects focus each field with a tap, as a finger would.
  for (const [label, value] of [
    [contact.labels.name, values.name],
    [contact.labels.email, values.email],
    [contact.labels.message, values.message],
  ] as const) {
    const field = page.getByLabel(label, { exact: true });
    if (isTouch(testInfo)) await field.tap();
    else await field.click();
    await page.keyboard.type(value);
  }
}

test("contact: validation messages, then focus on the first field", async ({
  page,
}, testInfo) => {
  await page.goto("/contact");
  const send = page.getByRole("button", { name: contact.labels.send });
  if (isTouch(testInfo)) await send.tap();
  else await send.click();
  for (const [label, message] of [
    [contact.labels.name, contact.validation.name],
    [contact.labels.email, contact.validation.email],
    [contact.labels.message, contact.validation.message],
  ] as const) {
    const field = page.getByLabel(label, { exact: true });
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAccessibleDescription(message);
  }
  await expect(
    page.getByLabel(contact.labels.name, { exact: true }),
  ).toBeFocused();

  await page
    .getByLabel(contact.labels.email, { exact: true })
    .fill("not-an-email");
  await send.click();
  await expect(
    page.getByLabel(contact.labels.email, { exact: true }),
  ).toHaveAccessibleDescription(contact.validation.email);
});

test("contact: the fields suit touch keyboards", async ({ page }) => {
  await page.goto("/contact");
  const name = page.getByLabel(contact.labels.name, { exact: true });
  const email = page.getByLabel(contact.labels.email, { exact: true });
  const message = page.getByLabel(contact.labels.message, { exact: true });
  await expect(name).toHaveAttribute("autocomplete", "name");
  await expect(name).toHaveAttribute("enterkeyhint", "next");
  await expect(email).toHaveAttribute("type", "email");
  await expect(email).toHaveAttribute("autocomplete", "email");
  await expect(email).toHaveAttribute("enterkeyhint", "next");
  await expect(message).toHaveAttribute(
    "maxlength",
    String(contact.maxMessageLength),
  );
  expect(
    await page.getByLabel(contact.labels.topic).evaluate((el) => el.tagName),
  ).toBe("SELECT");
  // 16 px text or more (no iOS zoom on focus) and 44 px targets or more.
  for (const field of [
    name,
    email,
    message,
    page.getByLabel(contact.labels.topic),
  ]) {
    const box = await field.evaluate((el) => ({
      font: parseFloat(getComputedStyle(el).fontSize),
      height: el.getBoundingClientRect().height,
    }));
    expect(box.font).toBeGreaterThanOrEqual(16);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("contact: sends with the Turnstile test keys into the dev outbox", async ({
  page,
}, testInfo) => {
  await fromFreshIp(page);
  await page.goto("/contact");
  // Cloudflare's always-pass test key hands over a token by itself.
  await expect(page.locator('[name="cf-turnstile-response"]')).toHaveValue(
    /.+/,
    { timeout: 20_000 },
  );
  const marker = `e2e ${testInfo.project.name} ${Date.now()}`;
  const email = "visitor@example.com";
  await fill(page, testInfo, {
    name: "Test Visitor",
    email,
    message: `Hello from ${marker}.\nSecond line.`,
  });
  await page.getByLabel(contact.labels.topic).selectOption(contact.topics[2]!);
  const send = page.getByRole("button", { name: contact.labels.send });
  if (isTouch(testInfo)) await send.tap();
  else await send.click();

  await expect(page.locator('[aria-live="polite"]')).toHaveText(
    contact.success.replace("{email}", email),
  );
  // The form is cleared for another message.
  await expect(
    page.getByLabel(contact.labels.name, { exact: true }),
  ).toHaveValue("");

  const dir = path.join(process.cwd(), ".outbox");
  const files = await readdir(dir);
  const bodies = await Promise.all(
    files.map((f) => readFile(path.join(dir, f), "utf8")),
  );
  const mail = bodies.find((b) => b.includes(marker));
  expect(mail).toBeDefined();
  expect(mail).toContain("Reply-To: visitor@example.com");
  expect(mail).toContain(`Topic: ${contact.topics[2]}`);
  expect(mail).toContain("Second line.");
});

test.describe("contact endpoint", () => {
  const valid = {
    name: "Test Visitor",
    email: "visitor@example.com",
    topic: contact.topics[0],
    message: "Hello.",
    token: "XXXX.DUMMY.TOKEN.XXXX",
  };

  test("field errors use the A.12 messages", async ({ request }, t) => {
    once(t);
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": someIp() },
      data: { ...valid, name: "  ", email: "nope", message: "" },
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({
      errors: {
        name: contact.validation.name,
        email: contact.validation.email,
        message: contact.validation.message,
      },
    });
  });

  test("an unknown topic or a long body is refused", async ({ request }, t) => {
    once(t);
    const ip = someIp();
    const odd = await request.post("/api/contact", {
      headers: { "x-forwarded-for": ip },
      data: { ...valid, topic: "Free money" },
    });
    expect(odd.status()).toBe(400);
    const long = await request.post("/api/contact", {
      headers: { "x-forwarded-for": ip },
      data: { ...valid, message: "x".repeat(40_000) },
    });
    expect(long.status()).toBe(413);
  });

  test("the honeypot says yes and sends nothing", async ({ request }, t) => {
    once(t);
    const dir = path.join(process.cwd(), ".outbox");
    const before = await readdir(dir).catch(() => []);
    const res = await request.post("/api/contact", {
      headers: { "x-forwarded-for": someIp() },
      data: { ...valid, website: "https://spam.example" },
    });
    expect(await res.json()).toEqual({ ok: true });
    expect(await readdir(dir).catch(() => [])).toHaveLength(before.length);
  });

  test("five messages per ten minutes per address", async ({ request }, t) => {
    once(t);
    const ip = someIp();
    const codes = [];
    for (let i = 0; i < 6; i++) {
      const res = await request.post("/api/contact", {
        headers: { "x-forwarded-for": ip },
        data: { ...valid, message: `Rate limit check ${i}.` },
      });
      codes.push(res.status());
    }
    expect(codes).toEqual([200, 200, 200, 200, 200, 429]);
    // Another address is unaffected.
    const other = await request.post("/api/contact", {
      headers: { "x-forwarded-for": someIp() },
      data: valid,
    });
    expect(other.status()).toBe(200);
  });
});
