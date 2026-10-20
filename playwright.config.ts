import { defineConfig, devices } from "@playwright/test";

const port = 3000;
const desktop = { width: 1440, height: 900 }; // §17 visual width; §5.4 hero/bento container

// Device matrix from docs/cross-device.md §8.
// `pnpm test:e2e` runs the projects without `default: false` (every PR).
// main and nightly add the rest: --project="desktop-*" --project="phone-*" --project="tablet-*".
export default defineConfig({
  testDir: "tests/e2e",
  // perf.spec.ts runs only in the perf projects.
  testIgnore: "**/perf.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // Every PR
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], viewport: desktop },
    },
    { name: "phone-android", use: { ...devices["Pixel 10"] } }, // 360×732, the design floor
    { name: "phone-ios", use: { ...devices["iPhone SE (3rd gen)"] } }, // 375×667, §17 width
    {
      name: "tablet-landscape-ios",
      use: { ...devices["iPad Mini landscape"] }, // 1024: desktop layout, coarse pointer
    },
    // Budgets (§13, cross-device §8): Home JS, scroll CLS, the LCP element.
    // perf-phone throttles the CPU 4x in the test (Chromium only).
    {
      name: "perf-phone",
      testMatch: "perf.spec.ts",
      testIgnore: [],
      use: { ...devices["Pixel 10"] },
    },
    {
      name: "perf-desktop",
      testMatch: "perf.spec.ts",
      testIgnore: [],
      use: { ...devices["Desktop Chrome"], viewport: desktop },
    },

    // main + nightly
    {
      name: "tablet-portrait-ios",
      default: false,
      use: { ...devices["iPad Mini"] }, // 768, §17 width
    },
    {
      name: "tablet-android",
      default: false,
      use: { ...devices["Galaxy Tab S9"] }, // 640×1024, sm edge
    },
    {
      name: "desktop-webkit",
      default: false,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "desktop-firefox",
      default: false,
      use: { ...devices["Desktop Firefox"] }, // fallback paths
    },
  ],
  webServer: {
    command: "pnpm start",
    port,
    reuseExistingServer: !process.env.CI,
  },
});
