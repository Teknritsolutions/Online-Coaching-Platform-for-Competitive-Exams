import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
let runtime;
try {
  runtime = require("playwright");
} catch {
  const modulePath = process.env.STACKLY_PLAYWRIGHT_MODULE;
  if (modulePath) runtime = require(modulePath);
  else {
    // Existing browser tooling in the authoring workspace, never required by the website.
    const local = "D:/Outdoor Furniture & Patio Store/node_modules/playwright-core";
    if (fs.existsSync(local)) runtime = require(local);
    else
      throw new Error(
        "Install Playwright for QA: npm install --no-save playwright, then npx playwright install chromium.",
      );
  }
}
export async function launchBrowser() {
  const config = { headless: true };
  if (process.env.STACKLY_CHROMIUM) config.executablePath = process.env.STACKLY_CHROMIUM;
  else if (process.platform === "win32") {
    const cache = path.join(process.env.LOCALAPPDATA || "", "ms-playwright");
    if (fs.existsSync(cache)) {
      const candidates = fs
        .readdirSync(cache)
        .filter((x) => /^chromium-\d+$/.test(x))
        .sort()
        .reverse();
      for (const folder of candidates) {
        const candidate = path.join(cache, folder, "chrome-win64", "chrome.exe");
        if (fs.existsSync(candidate)) {
          config.executablePath = candidate;
          break;
        }
      }
    }
  }
  return runtime.chromium.launch(config);
}
