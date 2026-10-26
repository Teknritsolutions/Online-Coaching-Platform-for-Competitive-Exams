import assert from "node:assert/strict";
import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const browser = await launchBrowser();
const page = await browser.newPage();
const results = [];
for (const width of [320, 390, 768, 1280, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("http://127.0.0.1:4173/pages/home-2.html");
  await page.locator(".learning-cta-background").evaluate(async (el) => {
    el.loading = "eager";
    await el.decode();
  });
  for (const mode of ["light", "dark"]) {
    await page.evaluate((mode) => (document.documentElement.dataset.theme = mode), mode);
    const r = await page.evaluate(() => {
      const box = (s) => document.querySelector(s).getBoundingClientRect();
      const nav = box(".site-header .nav"),
        brand = box(".site-header .brand"),
        actions = box(".header-actions");
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        panels: [box(".milestone-story").height, box(".milestone-scope").height],
        gaps: [nav.left - brand.right, actions.left - nav.right],
        footer: [...document.querySelectorAll(".footer-grid > div")].map(
          (el) => el.lastElementChild.getBoundingClientRect().bottom,
        ),
        background: document.querySelector(".learning-cta-background").naturalWidth,
      };
    });
    assert.equal(r.overflow, false);
    assert.ok(r.background > 0);
    if (width >= 1280) {
      assert.ok(Math.abs(r.gaps[0] - r.gaps[1]) < 2, JSON.stringify(r));
      assert.ok(Math.max(...r.footer) - Math.min(...r.footer) < 2, JSON.stringify(r));
    }
    assert.ok(Math.abs(r.panels[0] - r.panels[1]) < 2 || width <= 820);
    results.push({ width, mode, ...r });
    if ((width === 1440 && mode === "light") || (width === 390 && mode === "light")) {
      for (const selector of [
        ".milestone-layout",
        ".faq-layout",
        ".learning-cta",
        ".footer-grid",
        ".site-header",
      ])
        await page
          .locator(selector)
          .screenshot({
            path: `documentation/screenshots/balanced-${selector.slice(1)}-${width}.png`,
          });
    }
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto("http://127.0.0.1:4173/pages/home-2.html");
const faq = page.locator(".faq-panel details").first();
await faq.locator("summary").click();
assert.equal(await faq.getAttribute("open"), "");
assert.ok(await faq.locator("p").isVisible());
await browser.close();
fs.writeFileSync("documentation/balanced-layout-results.json", JSON.stringify(results, null, 2));
console.log(
  "Balanced panels, equal navigation gaps, aligned footer, FAQ interaction and background passed across six widths and both themes.",
);
