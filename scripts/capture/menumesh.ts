// Captures MenuMesh screens (spec §15.2) into assets/source/screens/menumesh
// and updates the manifest; then run `pnpm images`. Read-only: no sign-up,
// login, form or contact button. The only clicks are the /demo controls
// (nothing there is saved) and the demo's language toggle.
//
//   pnpm capture:menumesh   (MENUMESH_BASE_URL switches the site at launch)

import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import { encode } from "../lib/ffmpeg";
import {
  desktop,
  phone,
  settle,
  shoot,
  step,
  updateManifest,
  type Shot,
} from "./lib";

const BASE = process.env.MENUMESH_BASE_URL ?? "https://staging.menumesh.in";
const DIR = "assets/source/screens/menumesh";
const BUILD = BASE.includes("staging")
  ? "MenuMesh staging site, pre-launch"
  : "MenuMesh";
const MAX_VIDEO_BYTES = 3 * 1024 ** 2;

const shots: Shot[] = [];
const file = (name: string) => `menumesh/${name}.png`;

const section = (page: Page, heading: string | RegExp) =>
  page
    .locator("section")
    .filter({ has: page.getByRole("heading", { level: 2, name: heading }) })
    .first();

// The demo's three device frames, by their visible labels.
const panels = {
  guest: "Guest phone",
  kitchen: "Kitchen tablet",
  counter: "Counter laptop",
} as const;
const frame = (page: Page, label: string) =>
  section(page, label).locator(":scope > div").first();

const button = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name }).first();

const states: {
  name: string;
  run: (page: Page) => Promise<void>;
  alt: Record<keyof typeof panels, string>;
}[] = [
  {
    name: "start",
    run: async () => {},
    alt: {
      guest:
        "MenuMesh guest phone: the Spice Route menu for table 5, with Paneer Tikka, Chicken 65, Dal Makhani and Butter Naan and an Add button on each.",
      kitchen:
        "MenuMesh kitchen tablet: table 5 is free and there are no orders yet.",
      counter:
        "MenuMesh counter laptop: the bill screen for table 5, with no orders yet and a Make bill button.",
    },
  },
  {
    name: "ordered",
    run: async (page) => {
      await button(page, "Add Paneer Tikka").click();
      await button(page, "Add Butter Naan").click();
      await button(page, "One more Butter Naan").click();
      await button(page, /View cart/).click();
      await button(page, "Place order").click();
    },
    alt: {
      guest:
        "MenuMesh guest phone after ordering: round 1 with one Paneer Tikka and two Butter Naan, both placed, and buttons to call the waiter, request the bill or order more.",
      kitchen:
        "MenuMesh kitchen tablet: table 5, round 1, with one Paneer Tikka and two Butter Naan marked new and a Start preparing button for each.",
      counter:
        "MenuMesh counter laptop: table 5's bill can be made now, though some dishes aren't served yet.",
    },
  },
  {
    name: "preparing",
    run: async (page) => button(page, /^Start all/).click(),
    alt: {
      guest:
        "MenuMesh guest phone: both dishes in round 1 now show as preparing.",
      kitchen:
        "MenuMesh kitchen tablet: both dishes for table 5 are preparing, with a Mark ready button for each.",
      counter:
        "MenuMesh counter laptop: table 5's bill can be made now, though some dishes aren't served yet.",
    },
  },
  {
    name: "ready",
    run: async (page) => button(page, /^Mark all ready/).click(),
    alt: {
      guest: "MenuMesh guest phone: both dishes in round 1 are ready.",
      kitchen:
        "MenuMesh kitchen tablet: both dishes for table 5 are ready, with a Mark served button for each.",
      counter:
        "MenuMesh counter laptop: table 5's bill can be made now, though some dishes aren't served yet.",
    },
  },
  {
    name: "served",
    run: async (page) => button(page, /^Mark all served/).click(),
    alt: {
      guest: "MenuMesh guest phone: both dishes in round 1 have been served.",
      kitchen: "MenuMesh kitchen tablet: everything for table 5 is served.",
      counter:
        "MenuMesh counter laptop: every dish for table 5 is served and the bill is ready to make.",
    },
  },
  {
    name: "billed",
    run: async (page) => button(page, "Make bill").click(),
    alt: {
      guest:
        "MenuMesh guest phone: “Your bill has been generated. Please pay at the counter or to your server.”, above round 1 with both dishes served.",
      kitchen: "MenuMesh kitchen tablet after table 5's bill is made.",
      counter:
        "MenuMesh counter laptop: the bill for table 5, one Paneer Tikka and two Butter Naan with CGST and SGST at 2.5% each and the grand total, and Cash, UPI and Card buttons to record the payment.",
    },
  },
];

async function site(page: Page) {
  await step("home hero", async () => {
    await page.goto(BASE);
    await settle(page);
    await shoot(
      page.locator("main section").first(),
      {
        file: file("menumesh-home-hero"),
        view: "Home: hero",
        alt: "MenuMesh home page: “Your menu on every table. Orders straight to the kitchen.”, beside a laptop, tablet and phone showing the staff and guest screens.",
        use: "Case study: hero",
      },
      shots,
    );
  });
  // "How it works" (#how) is a scroll-driven story: an element shot comes
  // out with its visual blank, so the case study uses its own steps.
  await step("language", async () => {
    await shoot(
      section(page, /in your guests/),
      {
        file: file("menumesh-language"),
        view: "Home: menu languages",
        alt: "MenuMesh “Your menu, in your guests’ language”: the same menu in English and हिन्दी.",
        use: "Case study: features",
      },
      shots,
    );
  });
  await step("logo", async () => {
    const svg = await page
      .locator('header a[href="/"] svg')
      .first()
      .evaluate((el) => {
        el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        return el.outerHTML;
      });
    await writeFile("assets/source/icons/menumesh.svg", `${svg}\n`);
  });
  await step("pricing", async () => {
    await page.goto(`${BASE}/pricing`);
    await settle(page);
    // The first section holds the plan cards; "Compare the plans" follows.
    await shoot(
      page.locator("main section").first(),
      {
        file: file("menumesh-pricing"),
        view: "Pricing",
        alt: "MenuMesh plans before GST: Starter ₹399, Growth ₹899 and Pro ₹1,799 a month.",
        use: "Case study: plans",
      },
      shots,
    );
  });
}

async function demo(page: Page) {
  await page.goto(`${BASE}/demo`);
  await settle(page);
  for (const state of states) {
    const ran = await step(`demo: ${state.name}`, () => state.run(page));
    if (!ran) break;
    await page.waitForTimeout(600);
    for (const [key, label] of Object.entries(panels) as [
      keyof typeof panels,
      string,
    ][]) {
      await step(`  ${key}`, () =>
        shoot(
          frame(page, label),
          {
            file: file(`menumesh-demo-${state.name}-${key}`),
            view: `Demo: ${label.toLowerCase()}, ${state.name}`,
            alt: state.alt[key],
            use: "Case study: table to bill",
          },
          shots,
        ),
      );
    }
  }
  await step("demo: Hindi menu", async () => {
    await button(page, "Start again").click();
    await button(page, "हिन्दी").click();
    await page.waitForTimeout(600);
    await shoot(
      frame(page, panels.guest),
      {
        file: file("menumesh-demo-start-guest-hindi"),
        view: "Demo: guest phone, menu in Hindi",
        alt: "MenuMesh guest phone with the menu in हिन्दी: पनीर टिक्का, चिकन 65, दाल मखनी and बटर नान.",
        use: "Case study: table to bill (हिंदी)",
      },
      shots,
    );
  });
}

async function hindiHome(page: Page) {
  await step("/hi at phone size", async () => {
    await page.goto(`${BASE}/hi`);
    await settle(page);
    await shoot(
      page.locator("main section").first(),
      {
        file: file("menumesh-hi-phone"),
        view: "Home in Hindi, phone",
        alt: "MenuMesh's Hindi home page on a phone: the hero headline and buttons in हिन्दी.",
        use: "Case study: two languages",
      },
      shots,
    );
  });
}

/** One 15–25 s recording of "Show me", re-encoded to a muted H.264 MP4. */
async function record(browser: Awaited<ReturnType<typeof chromium.launch>>) {
  const tmp = await mkdtemp(path.join(tmpdir(), "menumesh-"));
  const size = { width: 1280, height: 800 };
  const context = await browser.newContext({
    viewport: size,
    colorScheme: "dark",
    recordVideo: { dir: tmp, size },
  });
  const page = await context.newPage();
  const started = Date.now();
  let offset = 0;
  let length = 0;
  const ok = await step("video: Show me", async () => {
    await page.goto(`${BASE}/demo`);
    await settle(page);
    // Frame the phone and the kitchen tablet, then press "Show me" without
    // scrolling back up to it. It plays for about 10 s; the recording then
    // glides down to the counter's finished bill and holds it.
    await section(page, panels.guest).evaluate((el) =>
      scrollTo(0, el.getBoundingClientRect().top + scrollY - 16),
    );
    await page.waitForTimeout(500);
    offset = (Date.now() - started) / 1000;
    await button(page, "Show me").evaluate((el: HTMLElement) => el.click());
    await page
      .getByText(/All done/)
      .first()
      .waitFor({ timeout: 25_000 });
    await page.waitForTimeout(1000);
    await section(page, panels.counter).evaluate((el) =>
      scrollTo({
        top: el.getBoundingClientRect().top + scrollY - 16,
        behavior: "smooth",
      }),
    );
    await page.waitForTimeout(4000);
    length = Math.min((Date.now() - started) / 1000 - offset, 25);
  });
  await context.close();
  const raw = await page.video()?.path();
  if (!ok || !raw) return [];

  const mp4 = `${DIR}/menumesh-demo.mp4`;
  const poster = `${DIR}/menumesh-demo-poster.png`;
  for (const crf of [28, 32, 36]) {
    encode([
      "-ss",
      String(offset),
      "-t",
      String(length),
      "-i",
      raw,
      "-an",
      "-c:v",
      "libx264",
      "-crf",
      String(crf),
      "-preset",
      "slow",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-movflags",
      "+faststart",
      mp4,
    ]);
    if ((await stat(mp4)).size <= MAX_VIDEO_BYTES) break;
  }
  // Mid-flow: the guest phone and the kitchen tablet both at work.
  encode(["-ss", "5", "-i", mp4, "-frames:v", "1", poster]);
  await rm(tmp, { recursive: true, force: true });
  console.log(
    `✓ video: ${(await stat(mp4)).size} bytes, ${length.toFixed(1)} s`,
  );
  return [
    {
      file: "menumesh/menumesh-demo.mp4",
      poster: "menumesh/menumesh-demo-poster.png",
      view: "Demo: “Show me”",
      alt: "MenuMesh's browser demo playing itself: a guest orders on the phone, the kitchen prepares and serves it, and the counter makes the bill.",
      use: "Case study: table to bill",
      durationSec: Math.round(length),
      fps: 30,
    },
  ];
}

async function main() {
  await mkdir(DIR, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await (await browser.newContext(desktop)).newPage();
    await site(page);
    await demo(page);
    const mobile = await (await browser.newContext(phone)).newPage();
    await hindiHome(mobile);
    const videos = await record(browser);
    await updateManifest("menumesh", BUILD, shots, videos);
    console.log(
      `${shots.length} screens, ${videos.length} video. Next: pnpm images`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
