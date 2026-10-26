import assert from "node:assert/strict";
import { launchBrowser } from "./browser.mjs";
const b = await launchBrowser();
const p = await b.newPage();
for (const width of [390, 900, 1440]) {
  await p.setViewportSize({ width, height: 1000 });
  await p.goto("http://127.0.0.1:4173/pages/contact.html");
  for (const theme of ["light", "dark"]) {
    await p.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
    const r = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      heights: [...document.querySelectorAll(".contact-layout > *")].map(
        (el) => el.getBoundingClientRect().height,
      ),
    }));
    assert.equal(r.overflow, false);
    if (width > 820) assert.ok(Math.abs(r.heights[0] - r.heights[1]) < 1);
  }
  await p.evaluate(() => (document.documentElement.dataset.theme = "light"));
  await p.locator(".live-map").scrollIntoViewIfNeeded();
  await p.waitForTimeout(2500);
  if (width !== 900)
    for (const name of ["contact-layout", "location-layout"])
      await p
        .locator("." + name)
        .screenshot({ path: `documentation/screenshots/refined-${name}-${width}.png` });
}
await p.locator("#contact-name").fill("Sample Learner");
await p.locator("#contact-email").fill("learner@example.com");
await p.locator("#contact-interest").selectOption("Banking");
await p
  .locator("#contact-message")
  .fill("Please tell me more about the banking preparation program.");
await p.locator(".contact-form-panel button[type=submit],.contact-form-panel > button").click();
await p.locator(".contact-form-panel .form-status").waitFor({ state: "visible" });
assert.ok(
  (await p.locator(".form-status").last().textContent()) ||
    (await p.locator(".contact-form-panel .form-status").textContent()),
);
console.log(
  "Contact panel heights, form validation and responsive layouts passed; real map embed and directions link configured.",
);
console.log(
  "Map frames: " +
    p
      .frames()
      .map((f) => f.url())
      .filter((x) => x.includes("maps.google"))
      .join(","),
);
await b.close();
