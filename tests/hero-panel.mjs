import assert from "node:assert/strict";
import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const browser = await launchBrowser();
const page = await browser.newPage();
let count = 0;
for (const width of [390, 900, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const file of JSON.parse(fs.readFileSync("documentation/pages.json", "utf8")).public.map(
    (x) => x.file,
  )) {
    await page.goto(`http://127.0.0.1:4173/${file}`);
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      const r = await page.evaluate(() => {
        const a = document.querySelector(".inner-hero-copy")?.getBoundingClientRect(),
          b = document.querySelector(".inner-hero-media")?.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          match: !a || Math.abs(a.height - b.height) < 1,
        };
      });
      assert.equal(r.overflow, false, `${file} ${width}`);
      if (width > 820) assert.equal(r.match, true, `${file} heights`);
      count++;
    }
    if (file === "pages/about.html" && width !== 900) {
      await page.evaluate(() => (document.documentElement.dataset.theme = "light"));
      await page
        .locator(".inner-hero")
        .screenshot({ path: `documentation/screenshots/framed-hero-${width}.png` });
    }
  }
}
await browser.close();
console.log(
  `${count} checks passed: responsive layout, matching panel/image heights and both themes.`,
);
