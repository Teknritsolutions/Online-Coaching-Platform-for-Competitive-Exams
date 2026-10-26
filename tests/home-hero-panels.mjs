import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [320, 390, 768, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const file of ["index", "home-2"]) {
    await p.goto(`http://127.0.0.1:4173/pages/${file}.html`);
    for (const theme of ["light", "dark"]) {
      await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      const r = await p.evaluate(() => {
        const a = document
            .querySelector(".home-hero-grid .inner-hero-copy")
            .getBoundingClientRect(),
          b = document.querySelector(".home-hero-grid .inner-hero-media").getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          equal: Math.abs(a.height - b.height) < 1 && Math.abs(a.width - b.width) < 1,
        };
      });
      assert.equal(r.overflow, false, `${file} ${width}`);
      if (width > 820) assert.ok(r.equal, `${file} ${width}`);
      if ((width === 1440 || width === 390) && theme === "light") {
        await p.locator(".home-hero-grid img").evaluate(async (el) => {
          await el.decode();
        });
        await p
          .locator(".home-hero-grid")
          .screenshot({ path: `documentation/screenshots/framed-${file}-${width}.png` });
      }
    }
  }
}
await b.close();
console.log(
  "Both home hero layouts passed at five widths in both themes; equal panel dimensions verified.",
);
