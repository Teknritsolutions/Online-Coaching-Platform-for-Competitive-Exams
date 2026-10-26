import assert from "node:assert/strict";
import fs from "node:fs";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
const files = JSON.parse(fs.readFileSync("documentation/pages.json", "utf8")).dashboard;
let cases = 0;
for (const width of [390, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const file of files) {
    await p.goto(`http://127.0.0.1:4173/${file}`);
    await p.waitForFunction(
      () =>
        !document
          .querySelector("#dashboard-content")
          ?.textContent.includes("Preparing your demo workspace"),
    );
    for (const theme of ["light", "dark"]) {
      await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      const r = await p.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        blocks: [...document.querySelector("#dashboard-content").children]
          .filter(
            (el) =>
              el.getBoundingClientRect().height > 0 && getComputedStyle(el).display !== "none",
          )
          .map((el) => {
            const r = el.getBoundingClientRect();
            return { top: r.top, bottom: r.bottom };
          }),
      }));
      assert.equal(r.overflow, false, `${file} ${width}`);
      for (let i = 1; i < r.blocks.length; i++)
        assert.ok(r.blocks[i].top - r.blocks[i - 1].bottom >= 19, `${file} ${width} gap`);
      cases++;
    }
    if (file.endsWith("/index.html") && width !== 900) {
      await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
      await p.screenshot({
        path: `documentation/screenshots/spaced-${file.split("/")[1]}-${width}.png`,
        fullPage: true,
      });
    }
  }
}
await p.setViewportSize({ width: 1440, height: 1000 });
await p.goto("http://127.0.0.1:4173/dashboard/student/index.html");
const tops = await p
  .locator(".grid.two")
  .first()
  .locator(".chart-box")
  .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
assert.ok(Math.max(...tops) - Math.min(...tops) < 1);
await b.close();
console.log(
  `${cases} dashboard page/theme/width checks passed with consistent block gaps; overview charts align.`,
);
