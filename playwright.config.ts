import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

const baseURL = "http://127.0.0.1:4325/";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4325 --ignore-lock",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
