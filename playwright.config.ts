import { defineConfig } from "@playwright/test";
const baseURL = process.env.TEST_BASE_URL || "http://localhost:3000";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL,
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: [["list"]],
  webServer: {
    command: `node node_modules/next/dist/bin/next start --port ${Number(new URL(baseURL).port) || 3000}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
