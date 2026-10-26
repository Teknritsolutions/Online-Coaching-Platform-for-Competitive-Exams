import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [320, 390, 768, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.goto("http://127.0.0.1:4173/pages/fees.html");
  for (const theme of ["light", "dark"]) {
    await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    const r = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      cards: [...document.querySelectorAll(".pricing-card")].map((el) => ({
        top: el.getBoundingClientRect().top,
        height: el.getBoundingClientRect().height,
        note: el.querySelector(".demo-label").getBoundingClientRect().top,
        btn: el.querySelector(".btn").getBoundingClientRect().top,
      })),
    }));
    assert.equal(r.overflow, false);
    if (width > 820) {
      for (const field of ["top", "height", "note", "btn"])
        assert.ok(
          Math.max(...r.cards.map((c) => c[field])) - Math.min(...r.cards.map((c) => c[field])) < 1,
          `${width} ${field}`,
        );
    }
    if (width === 1440 || width === 390) {
      await p
        .locator(".pricing-card")
        .first()
        .locator("xpath=..")
        .screenshot({ path: `documentation/screenshots/aligned-pricing-${width}-${theme}.png` });
      await p
        .locator(".pricing-faq")
        .screenshot({
          path: `documentation/screenshots/premium-pricing-faq-${width}-${theme}.png`,
        });
    }
  }
  const faq = p.locator(".pricing-faq details").first();
  await faq.locator("summary").click();
  assert.equal(await faq.getAttribute("open"), "");
  assert.ok(await faq.locator("p").isVisible());
  await faq.locator("summary").click();
}
await p.locator("[data-price-period=scholarship]").click();
assert.equal(await p.locator("[data-price]").first().textContent(), "1,599");
await p.locator("[data-price-period=standard]").click();
assert.equal(await p.locator("[data-price]").first().textContent(), "1,999");
await b.close();
console.log(
  "Pricing card heights, notes and buttons align; responsive layouts and FAQ interactions passed at five widths in both themes.",
);
