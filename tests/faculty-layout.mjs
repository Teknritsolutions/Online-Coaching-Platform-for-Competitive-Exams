import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [320, 390, 768, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.goto("http://127.0.0.1:4173/pages/faculty.html");
  await p.locator(".subject-card img").evaluateAll(async (imgs) => {
    await Promise.all(
      imgs.map((img) => {
        img.loading = "eager";
        return img.decode();
      }),
    );
  });
  for (const theme of ["light", "dark"]) {
    await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    const r = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      heights: [...document.querySelectorAll(".subject-card")].map(
        (x) => x.getBoundingClientRect().height,
      ),
      imgs: [...document.querySelectorAll(".subject-card img")].map((x) => x.naturalWidth),
      panels: [...document.querySelectorAll(".principle-layout > div")].map(
        (x) => x.getBoundingClientRect().height,
      ),
    }));
    assert.equal(r.overflow, false);
    assert.ok(r.imgs.every((x) => x > 0));
    assert.equal(new Set(r.heights).size, 1);
    if (width > 820) assert.ok(Math.abs(r.panels[0] - r.panels[1]) < 1);
    if (width === 1440 || width === 390)
      for (const selector of ["teaching-intro", "subject-collection", "principle-layout"])
        await p
          .locator("." + selector)
          .screenshot({
            path: `documentation/screenshots/faculty-${selector}-${width}-${theme}.png`,
          });
  }
}
await b.close();
console.log(
  "Faculty sections passed five widths in both themes; subject cards and philosophy panels have equal heights.",
);
