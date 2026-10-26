import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [390, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  for (const file of [
    "mock-tests",
    "blog",
    "blog-details",
    "index",
    "contact",
    "fees",
    "course-details",
  ]) {
    await p.goto(`http://127.0.0.1:4173/pages/${file}.html`);
    for (const theme of ["light", "dark"]) {
      await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
      assert.equal(
        await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${file} ${width}`,
      );
    }
    if (width === 1440 && ["blog", "index", "blog-details"].includes(file)) {
      const groups = await p
        .locator(".grid:has(> .article-card)")
        .evaluateAll((els) =>
          els.map((el) =>
            [...el.querySelectorAll(".article-card")]
              .filter((c) => !c.hidden)
              .map((c) => ({
                top: c.getBoundingClientRect().top,
                label: c.querySelector(".eyebrow").getBoundingClientRect().top,
                title: c.querySelector("h3").getBoundingClientRect().top,
                description: c.querySelector("p").getBoundingClientRect().top,
                button: c.querySelector(".text-link").getBoundingClientRect().top,
              })),
          ),
        );
      for (const cards of groups) {
        for (const field of ["label", "title", "description", "button"])
          assert.ok(
            Math.max(...cards.map((c) => c[field])) - Math.min(...cards.map((c) => c[field])) < 1,
            `${file} ${field}`,
          );
      }
    }
    if (file === "mock-tests") {
      const faq = p.locator(".practice-faq details").first();
      await faq.locator("summary").click();
      assert.equal(await faq.getAttribute("open"), "");
      await faq.locator("summary").click();
    }
    if ((width === 1440 || width === 390) && ["mock-tests", "blog"].includes(file)) {
      await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
      const target = p
        .locator(file === "mock-tests" ? ".practice-faq" : ".grid:has(> .article-card)")
        .first();
      await target.locator("img").evaluateAll(async (imgs) => {
        await Promise.all(
          imgs.map((img) => {
            img.loading = "eager";
            return img.decode();
          }),
        );
      });
      await target.screenshot({ path: `documentation/screenshots/refined-${file}-${width}.png` });
    }
  }
}
await b.close();
console.log(
  "FAQ interaction and responsive layouts passed; article labels, headings, descriptions and actions align across shared placements.",
);
