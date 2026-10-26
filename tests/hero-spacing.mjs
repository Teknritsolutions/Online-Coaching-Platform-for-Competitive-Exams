import assert from "node:assert/strict";
import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const browser = await launchBrowser();
const page = await browser.newPage();
const pages = JSON.parse(fs.readFileSync("documentation/pages.json", "utf8")).public.map(
  (x) => x.file,
);
let heroes = 0;
for (const width of [390, 900, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const file of pages) {
    await page.goto(`http://127.0.0.1:4173/${file}`);
    const r = await page.evaluate(() => {
      const a = document.querySelector(".inner-hero-copy")?.getBoundingClientRect(),
        b = document.querySelector(".inner-hero-media")?.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        equal: !a || Math.abs(a.width - b.width) < 1,
      };
    });
    assert.equal(r.overflow, false, `${file} overflow at ${width}`);
    if (width > 820) assert.equal(r.equal, true, `${file} unequal hero`);
    heroes++;
  }
  await page.goto("http://127.0.0.1:4173/pages/about.html");
  const spacing = await page.evaluate(() => {
    const row = document.querySelector(".section-actions");
    const rect = row.getBoundingClientRect(),
      prev = row.previousElementSibling.getBoundingClientRect();
    const btn = [...row.children].map((x) => x.getBoundingClientRect());
    const notice = document.querySelector(".stats + .notice");
    return {
      above: rect.top - prev.bottom,
      between: innerWidth > 560 ? btn[1].left - btn[0].right : btn[1].top - btn[0].bottom,
      notice:
        notice.getBoundingClientRect().top -
        notice.previousElementSibling.getBoundingClientRect().bottom,
    };
  });
  assert.ok(spacing.above >= 24);
  assert.ok(spacing.between >= 15);
  assert.ok(spacing.notice >= 23);
  if (width !== 900) {
    await page
      .locator(".inner-hero")
      .screenshot({ path: `documentation/screenshots/equal-hero-${width}.png` });
    await page
      .locator(".section-actions")
      .screenshot({ path: `documentation/screenshots/spaced-actions-${width}.png` });
  }
}
await browser.close();
console.log(
  `${heroes} page/viewport checks passed; equal hero columns and action/notice gaps verified.`,
);
