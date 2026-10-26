import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const browser = await launchBrowser();
const page = await browser.newPage();
for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("http://127.0.0.1:4173/pages/index.html");
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    widths: [...document.querySelectorAll(".hero-copy>.row:not(.trust) .btn")].map((x) =>
      Math.round(x.getBoundingClientRect().width),
    ),
    buttons: [...document.querySelectorAll(".hero-copy>.row:not(.trust) .btn")].map((x) =>
      Math.round(x.getBoundingClientRect().height),
    ),
  }));
  assert.equal(result.overflow, false);
  assert.equal(new Set(result.buttons).size, 1);
  assert.equal(new Set(result.widths).size, 1);
  console.log(width, result);
}
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(async () =>
  Promise.all(
    [...document.images].map((i) => {
      i.loading = "eager";
      return i.decode().catch(() => {});
    }),
  ),
);
await page.waitForTimeout(100);
await page.screenshot({ path: "documentation/screenshots/refreshed-home-mobile-fold.png" });
await browser.close();
